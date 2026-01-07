import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Entry, RepsMode } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function useDailyEntries(dateStr: string) {
    const entries = useLiveQuery(
        () => db.entries.where('date').equals(dateStr).toArray(),
        [dateStr]
    );

    const variations = useLiveQuery(() => db.variations.toArray());

    // Derive total points
    const totalPoints = entries?.reduce((sum, e) => sum + e.pointsTotal, 0) || 0;

    const addEntry = async (
        variationId: string,
        sets: number,
        repsMode: RepsMode,
        repsUniform: number | undefined,
        repsPerSet: number[] | undefined,
        time: string,
        note?: string
    ) => {
        // 1. Fetch variation to get pointsPerRep
        const variation = await db.variations.get(variationId);
        if (!variation) throw new Error('Variation not found');

        // 2. Compute totals
        let repsTotal = 0;
        if (repsMode === 'uniform' && repsUniform) {
            repsTotal = sets * repsUniform;
        } else if (repsMode === 'perSet' && repsPerSet) {
            repsTotal = repsPerSet.reduce((a, b) => a + b, 0);
        }

        const pointsTotal = repsTotal * variation.pointsPerRep;

        // 3. Create Entry object
        const newEntry: Entry = {
            id: uuidv4(),
            date: dateStr,
            time,
            variationId,
            sets,
            repsMode,
            repsUniform,
            repsPerSet,
            repsTotal,
            pointsTotal, // stored computed value
            note,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // 4. Add to DB
        await db.entries.add(newEntry);
    };

    const deleteEntry = async (entryId: string) => {
        await db.entries.delete(entryId);
    };

    return {
        entries: entries || [],
        variations: variations || [], // Helper to have variations available
        totalPoints,
        addEntry,
        deleteEntry,
        isLoading: !entries || !variations
    };
}
