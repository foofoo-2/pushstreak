import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Entry, RepsMode, Variation } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function useDailyEntries(dateStr: string) {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [variations, setVariations] = useState<Variation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [entriesData, variationsData] = await Promise.all([
                    api.get(`/api/entries?date=${dateStr}`),
                    api.get('/api/variations')
                ]);
                setEntries(entriesData);
                setVariations(variationsData);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [dateStr, refreshTrigger]);

    // Derive total points
    const totalPoints = entries.reduce((sum, e) => sum + e.pointsTotal, 0);

    const addEntry = async (
        variationId: string,
        sets: number,
        repsMode: RepsMode,
        repsUniform: number | undefined,
        repsPerSet: number[] | undefined,
        time: string,
        note?: string
    ) => {
        // 1. Fetch variation to get pointsPerRep (from local state is fine if up to date, or fetch)
        // We have variations in state, let's use that.
        const variation = variations.find(v => v.id === variationId);
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

        // 4. Send to API
        await api.post('/api/entries', newEntry);
        setRefreshTrigger(prev => prev + 1);
    };

    const deleteEntry = async (entryId: string) => {
        await api.delete(`/api/entries/${entryId}`);
        setRefreshTrigger(prev => prev + 1);
    };

    const updateEntry = async (
        entryId: string,
        variationId: string,
        sets: number,
        repsMode: RepsMode,
        repsUniform: number | undefined,
        repsPerSet: number[] | undefined,
        time: string,
        note?: string
    ) => {
        const variation = variations.find(v => v.id === variationId);
        if (!variation) throw new Error('Variation not found');

        let repsTotal = 0;
        if (repsMode === 'uniform' && repsUniform) {
            repsTotal = sets * repsUniform;
        } else if (repsMode === 'perSet' && repsPerSet) {
            repsTotal = repsPerSet.reduce((a, b) => a + b, 0);
        }

        const pointsTotal = repsTotal * variation.pointsPerRep;

        await api.put(`/api/entries/${entryId}`, {
            variationId,
            sets,
            repsMode,
            repsUniform,
            repsPerSet,
            repsTotal,
            pointsTotal,
            note,
            time
        });
        setRefreshTrigger(prev => prev + 1);
    };

    return {
        entries,
        variations,
        totalPoints,
        addEntry,
        updateEntry,
        deleteEntry,
        isLoading
    };
}
