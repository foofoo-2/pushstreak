import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists if we are in Docker or just local
const dbPath = process.env.DB_PATH || path.join(__dirname, '../pushstreak.db');
export const db = new Database(dbPath);

console.log(`Connected to database at ${dbPath}`);

// Initialize Schema
const initSchema = () => {
    // Variations Table
    db.exec(`
        CREATE TABLE IF NOT EXISTS variations (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            pointsPerRep REAL NOT NULL,
            isDefault INTEGER DEFAULT 0,
            createdAt TEXT,
            updatedAt TEXT
        )
    `);

    // Entries Table
    db.exec(`
        CREATE TABLE IF NOT EXISTS entries (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            time TEXT,
            variationId TEXT NOT NULL,
            sets INTEGER NOT NULL,
            repsMode TEXT NOT NULL, -- 'uniform' or 'perSet'
            repsUniform INTEGER,
            repsPerSet TEXT, -- JSON string of number[]
            repsTotal INTEGER NOT NULL,
            pointsTotal REAL NOT NULL,
            note TEXT,
            createdAt TEXT,
            updatedAt TEXT,
            FOREIGN KEY (variationId) REFERENCES variations(id)
        )
    `);

    // Settings Table
    db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL, -- JSON stringified value
            updatedAt TEXT
        )
    `);

    // Seed default variations if empty
    const count = db.prepare('SELECT count(*) as count FROM variations').get();
    if (count.count === 0) {
        console.log('Seeding default variations...');
        const defaults = [
            { id: 'v1', name: 'Standard Floor Push-up', pointsPerRep: 1.5, isDefault: 1 },
            { id: 'v2', name: 'Knee Push-up', pointsPerRep: 1.0, isDefault: 0 },
            { id: 'v5', name: 'Incline (Table/Desk)', pointsPerRep: 0.5, isDefault: 0 },
            { id: 'v6', name: 'Decline (Feet Elevated)', pointsPerRep: 2.0, isDefault: 0 },
        ];

        const insert = db.prepare(`
            INSERT INTO variations (id, name, pointsPerRep, isDefault, createdAt, updatedAt)
            VALUES (@id, @name, @pointsPerRep, @isDefault, @createdAt, @updatedAt)
        `);

        const now = new Date().toISOString();
        const insertMany = db.transaction((variations) => {
            for (const v of defaults) {
                insert.run({ ...v, createdAt: now, updatedAt: now });
            }
        });

        insertMany(defaults);
        console.log('Seeded successfully.');
    }
};

initSchema();
