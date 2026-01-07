import Dexie, { type Table } from 'dexie';
import type { Variation, DailyLog, Entry } from '../types';
import { defaultVariations } from './defaultVariations';

export class PushStreakDB extends Dexie {
    variations!: Table<Variation>;
    days!: Table<DailyLog>;
    entries!: Table<Entry>;

    constructor() {
        super('PushStreakDB');
        this.version(1).stores({
            variations: 'id', // Primary key is UUID string
            days: 'date', // Primary key is YYYY-MM-DD
            entries: 'id, date' // Primary key UUID, indexed by date
        });

        this.on('populate', () => {
            this.variations.bulkAdd(defaultVariations);
        });
    }
}

export const db = new PushStreakDB();
