import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Variation } from '../types';

export function useVariations() {
    const [variations, setVariations] = useState<Variation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        api.get('/api/variations')
            .then(data => {
                setVariations(data);
                setIsLoading(false);
            })
            .catch(err => console.error(err));
    }, [refreshTrigger]);

    const addVariation = async (name: string, pointsPerRep: number) => {
        await api.post('/api/variations', { name, pointsPerRep });
        setRefreshTrigger(prev => prev + 1);
    };

    const updateVariation = async (id: string, updates: Partial<Variation>) => {
        await api.put(`/api/variations/${id}`, updates);
        setRefreshTrigger(prev => prev + 1);
    };

    const deleteVariation = async (id: string) => {
        await api.delete(`/api/variations/${id}`);
        setRefreshTrigger(prev => prev + 1);
    };

    const resetDefaults = async () => {
        alert('To reset defaults, please delete the database file or use an admin tool. Server reset not implemented.');
    };

    return {
        variations,
        isLoading,
        addVariation,
        updateVariation,
        deleteVariation,
        resetDefaults
    };
}
