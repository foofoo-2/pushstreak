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

    const setDefault = async (id: string) => {
        await api.put(`/api/variations/${id}/default`, {});
        setRefreshTrigger(prev => prev + 1);
    };

    const resetDefaults = async () => {
        if (!confirm('This will reset all variations to the default list. Existing entries might point to deleted IDs. Continue?')) return;
        await api.post('/api/variations/reset', {});
        setRefreshTrigger(prev => prev + 1);
    };

    return {
        variations,
        isLoading,
        addVariation,
        updateVariation,
        deleteVariation,
        setDefault,
        resetDefaults
    };
}
