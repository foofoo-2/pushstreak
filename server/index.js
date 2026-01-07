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

// --- API ROUTES ---

// Variations
app.get('/api/variations', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM variations').all();
        const mapped = rows.map(r => ({
            ...r,
            isDefault: !!r.isDefault
        }));
        res.json(mapped);
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

// Entries
app.get('/api/entries', (req, res) => {
    try {
        const { date, startDate, endDate } = req.query;

        let rows = [];
        if (date) {
            rows = db.prepare('SELECT * FROM entries WHERE date = ?').all(date);
        } else if (startDate && endDate) {
            rows = db.prepare('SELECT * FROM entries WHERE date BETWEEN ? AND ?').all(startDate, endDate);
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


// DATA IMPORT (JSON)
app.post('/api/import', (req, res) => {
    try {
        const { data } = req.body;
        if (!data || !data.data || !data.data.data) {
            return res.status(400).json({ error: 'Invalid Dexie export format' });
        }

        const tables = data.data.data;

        const importTransaction = db.transaction(() => {
            // Import Variations
            if (tables.variations) {
                db.prepare('DELETE FROM variations').run();

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
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                }
            }

            // Import Entries
            if (tables.entries) {
                db.prepare('DELETE FROM entries').run();

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
                    insertEntry.run({
                        ...e,
                        repsPerSet: e.repsPerSet && Array.isArray(e.repsPerSet) ? JSON.stringify(e.repsPerSet) : null,
                        time: e.time || null,
                        createdAt: e.createdAt || new Date().toISOString(),
                        updatedAt: e.updatedAt || new Date().toISOString()
                    });
                }
            }
        });

        importTransaction();
        res.json({ success: true, message: 'Import completed' });
    } catch (err) {
        console.error(err);
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
