import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Higher limit for import
app.use(express.static(path.join(__dirname, '../dist')));

// --- AUTHENTICATION ---
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const SESSIONS = new Set(); // Simple in-memory session store

app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        const token = randomUUID();
        SESSIONS.add(token);
        res.json({ token, success: true });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

const authMiddleware = (req, res, next) => {
    // Explicitly exclude login just in case, though order should handle it
    if (req.path === '/api/login') return next();
    if (req.path.startsWith('/api/import')) return next();

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || !SESSIONS.has(token)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Apply auth middleware to all OTHER API routes
app.use('/api', authMiddleware);


// --- API ROUTES ---

// Variations
app.get('/api/variations', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM variations ORDER BY pointsPerRep ASC').all();
        const mapped = rows.map(r => ({
            ...r,
            isDefault: !!r.isDefault
        }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/variations/:id/default', (req, res) => {
    try {
        const { id } = req.params;
        const now = new Date().toISOString();

        const transaction = db.transaction(() => {
            // Unset current default
            db.prepare('UPDATE variations SET isDefault = 0, updatedAt = ?').run(now);
            // Set new default
            db.prepare('UPDATE variations SET isDefault = 1, updatedAt = ? WHERE id = ?').run(now, id);
        });

        transaction();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/variations', (req, res) => {
    try {
        const { id, name, pointsPerRep } = req.body;
        const newId = id || randomUUID();
        const now = new Date().toISOString();

        const stmt = db.prepare(`
            INSERT INTO variations (id, name, pointsPerRep, isDefault, createdAt, updatedAt)
            VALUES (?, ?, ?, 0, ?, ?)
        `);
        stmt.run(newId, name, pointsPerRep, now, now);
        res.json({ id: newId, success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/variations/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, pointsPerRep } = req.body;
        const now = new Date().toISOString();
        const stmt = db.prepare(`
            UPDATE variations 
            SET name = ?, pointsPerRep = ?, updatedAt = ?
            WHERE id = ?
        `);
        stmt.run(name, pointsPerRep, now, id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/variations/:id', (req, res) => {
    try {
        const { id } = req.params;
        db.prepare('DELETE FROM variations WHERE id = ?').run(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/variations/reset', (req, res) => {
    try {
        const now = new Date().toISOString();

        const transaction = db.transaction(() => {
            // 1. Map orphaned entries to nearest surviving variation
            // v3 (Wall) -> v2 (Knee)
            db.prepare("UPDATE entries SET variationId = 'v2' WHERE variationId = 'v3'").run();
            // v4 (Low Incline) -> v5 (High Incline)
            db.prepare("UPDATE entries SET variationId = 'v5' WHERE variationId = 'v4'").run();

            // 2. Delete the removed variations
            db.prepare("DELETE FROM variations WHERE id IN ('v3', 'v4')").run();

            // 3. Update/Insert the desired variations
            // v1: Standard (Keep/Ensure)
            db.prepare(`INSERT OR REPLACE INTO variations (id, name, pointsPerRep, isDefault, createdAt, updatedAt) 
                VALUES ('v1', 'Standard Floor Push-up', 1.5, 1, COALESCE((SELECT createdAt FROM variations WHERE id='v1'), ?), ?)`)
                .run(now, now);

            // v2: Knee (Keep/Ensure)
            db.prepare(`INSERT OR REPLACE INTO variations (id, name, pointsPerRep, isDefault, createdAt, updatedAt) 
                VALUES ('v2', 'Knee Push-up', 1.0, 0, COALESCE((SELECT createdAt FROM variations WHERE id='v2'), ?), ?)`)
                .run(now, now);

            // v5: High Incline -> Incline (Rename)
            db.prepare(`INSERT OR REPLACE INTO variations (id, name, pointsPerRep, isDefault, createdAt, updatedAt) 
                VALUES ('v5', 'Incline (Table/Desk)', 0.5, 0, COALESCE((SELECT createdAt FROM variations WHERE id='v5'), ?), ?)`)
                .run(now, now);

            // v6: Decline (Keep/Ensure)
            db.prepare(`INSERT OR REPLACE INTO variations (id, name, pointsPerRep, isDefault, createdAt, updatedAt) 
                VALUES ('v6', 'Decline (Feet Elevated)', 2.0, 0, COALESCE((SELECT createdAt FROM variations WHERE id='v6'), ?), ?)`)
                .run(now, now);

            // Ensure only one default (v1)
            db.prepare("UPDATE variations SET isDefault = 0 WHERE id != 'v1'").run();
        });

        transaction();
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Entries
app.get('/api/entries', (req, res) => {
    try {
        const { date, startDate, endDate, getAll } = req.query;

        let rows = [];
        if (date) {
            rows = db.prepare('SELECT * FROM entries WHERE date = ?').all(date);
        } else if (startDate && endDate) {
            rows = db.prepare('SELECT * FROM entries WHERE date BETWEEN ? AND ?').all(startDate, endDate);
        } else if (getAll === 'true') {
            rows = db.prepare('SELECT * FROM entries').all();
        } else {
            return res.json([]);
        }

        // Deserialize repsPerSet (stored as JSON string)
        const mapped = rows.map(r => ({
            ...r,
            repsPerSet: r.repsPerSet ? JSON.parse(r.repsPerSet) : undefined
        }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/entries', (req, res) => {
    try {
        const entry = req.body;
        const now = new Date().toISOString();

        const stmt = db.prepare(`
            INSERT INTO entries (
                id, date, time, variationId, sets, repsMode, 
                repsUniform, repsPerSet, repsTotal, pointsTotal, 
                note, createdAt, updatedAt
            ) VALUES (
                @id, @date, @time, @variationId, @sets, @repsMode, 
                @repsUniform, @repsPerSet, @repsTotal, @pointsTotal, 
                @note, @createdAt, @updatedAt
            )
        `);

        stmt.run({
            ...entry,
            repsPerSet: entry.repsPerSet ? JSON.stringify(entry.repsPerSet) : null,
            createdAt: now,
            updatedAt: now
        });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/entries/:id', (req, res) => {
    try {
        const { id } = req.params;
        const entry = req.body;
        const now = new Date().toISOString();

        const stmt = db.prepare(`
            UPDATE entries 
            SET variationId = @variationId, sets = @sets, 
                repsMode = @repsMode, repsUniform = @repsUniform, 
                repsPerSet = @repsPerSet, repsTotal = @repsTotal, 
                pointsTotal = @pointsTotal, note = @note, 
                time = @time, updatedAt = @updatedAt
            WHERE id = @id
        `);

        stmt.run({
            ...entry,
            id, // explicit ID for WHERE clause
            repsPerSet: entry.repsPerSet ? JSON.stringify(entry.repsPerSet) : null,
            updatedAt: now
        });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/entries/:id', (req, res) => {
    try {
        const { id } = req.params;
        db.prepare('DELETE FROM entries WHERE id = ?').run(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// EXPORT
app.get('/api/export', (req, res) => {
    try {
        const variations = db.prepare('SELECT * FROM variations').all();
        const entries = db.prepare('SELECT * FROM entries').all().map(e => ({
            ...e,
            repsPerSet: e.repsPerSet ? JSON.parse(e.repsPerSet) : null
        }));

        res.json({
            exportDate: new Date().toISOString(),
            data: {
                variations,
                entries
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// IMPORT
app.post('/api/import', (req, res) => {
    try {
        const { data } = req.body;
        // Support both old Dexie structure (data.data.data) and new clean structure (data.data)
        const tables = data.data?.data || data.data;

        if (!tables) {
            return res.status(400).json({ error: 'Invalid export format' });
        }

        const importTransaction = db.transaction(() => {
            // 1. Clear existing data (Entries first due to FK)
            if (tables.entries || tables.variations) {
                db.prepare('DELETE FROM entries').run();
            }
            if (tables.variations) {
                db.prepare('DELETE FROM variations').run();
            }

            // 2. Import Variations
            if (tables.variations) {
                const insertVar = db.prepare(`
                    INSERT INTO variations (id, name, pointsPerRep, isDefault, createdAt, updatedAt)
                    VALUES (@id, @name, @pointsPerRep, @isDefault, @createdAt, @updatedAt)
                `);
                for (const v of tables.variations) {
                    insertVar.run({
                        id: v.id,
                        name: v.name,
                        pointsPerRep: v.pointsPerRep,
                        isDefault: v.isDefault ? 1 : 0,
                        createdAt: v.createdAt || new Date().toISOString(),
                        updatedAt: v.updatedAt || new Date().toISOString()
                    });
                }
            }

            // 3. Import Entries
            if (tables.entries) {
                const insertEntry = db.prepare(`
                    INSERT INTO entries (
                        id, date, time, variationId, sets, repsMode, 
                        repsUniform, repsPerSet, repsTotal, pointsTotal, 
                        note, createdAt, updatedAt
                    ) VALUES (
                        @id, @date, @time, @variationId, @sets, @repsMode, 
                        @repsUniform, @repsPerSet, @repsTotal, @pointsTotal, 
                        @note, @createdAt, @updatedAt
                    )
                `);

                for (const e of tables.entries) {
                    try {
                        insertEntry.run({
                            ...e,
                            repsPerSet: e.repsPerSet && Array.isArray(e.repsPerSet) ? JSON.stringify(e.repsPerSet) : null,
                            time: e.time || null,
                            createdAt: e.createdAt || new Date().toISOString(),
                            updatedAt: e.updatedAt || new Date().toISOString()
                        });
                    } catch (entryErr) {
                        console.error('Failed to insert entry:', e, entryErr);
                        throw entryErr;
                    }
                }
            }
        });

        importTransaction();
        res.json({ success: true, message: 'Import completed' });
    } catch (err) {
        console.error('Import transaction failed:', err);
        res.status(500).json({ error: err.message });
    }
});

// Serve frontend for any other route
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
