import { useState, useEffect } from 'react';
import { api } from '../api/client';

export interface AppSettings {
    defaultSets?: number;
    defaultReps?: number;
    // Add future settings here
}

export function useSettings() {
    const [settings, setSettings] = useState<AppSettings>({});
    const [isLoading, setIsLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const data = await api.get('/api/settings');
            setSettings(data);
        } catch (err) {
            console.error('Failed to fetch settings', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const updateSettings = async (newSettings: Partial<AppSettings>) => {
        try {
            await api.post('/api/settings', { settings: newSettings });
            setSettings(prev => ({ ...prev, ...newSettings }));
        } catch (err) {
            console.error('Failed to update settings', err);
            throw err;
        }
    };

    return {
        settings,
        isLoading,
        updateSettings
    };
}
