import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Variation } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function useVariations() {
    const variations = useLiveQuery(() => db.variations.toArray());

    const addVariation = async (name: string, pointsPerRep: number) => {
        const newVariation: Variation = {
            id: uuidv4(),
            name,
            pointsPerRep,
            isDefault: false
        };
        await db.variations.add(newVariation);
    };

    const updateVariation = async (id: string, updates: Partial<Variation>) => {
        await db.variations.update(id, updates);
    };

    const deleteVariation = async (id: string) => {
        // Optional: Check if used in entries? 
        // PRD doesn't strictly say prevent delete, but it's good practice.
        // For MVP, if we delete, historical entries might lose Name ref if we don't snapshot it.
        // Our EntryList looks up variation by ID. If deleted, it says "Unknown".
        // Better to soft delete or warn. For MVP, we'll just allow delete.
        await db.variations.delete(id);
    };

    const resetDefaults = async () => {
        await db.variations.clear();
        // Re-seed is handled by db class on populate, but that only runs on empty DB creation usually?
        // We can manually re-insert defaults.
        const { defaultVariations } = await import('../db/defaultVariations'); // Dynamic import to avoid cycles?
        await db.variations.bulkAdd(defaultVariations);
    };

    return {
        variations: variations || [],
        isLoading: !variations,
        addVariation,
        updateVariation,
        deleteVariation,
        resetDefaults
    };
}
