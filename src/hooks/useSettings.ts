import { useState, useEffect, useCallback } from 'react';
import { dbEngine } from '../db/engine';

export const useSettings = () => {
    const [searchByReading, setSearchByReading] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const settingsRepo = dbEngine.getRepository('SettingsRepository');

    const loadSettings = useCallback(async () => {
        try {
            const val = await settingsRepo.get('searchByReading', 'false');
            setSearchByReading(val === 'true');
        } catch (error) {
            console.error("Error loading settings:", error);
        } finally {
            setLoading(false);
        }
    }, [settingsRepo]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const updateSearchByReading = useCallback(async (value: boolean) => {
        try {
            await settingsRepo.set('searchByReading', value.toString());
            setSearchByReading(value);
        } catch (error) {
            console.error("Error updating searchByReading setting:", error);
        }
    }, [settingsRepo]);

    return {
        searchByReading,
        setSearchByReading: updateSearchByReading,
        loadingSettings: loading,
        refreshSettings: loadSettings
    };
};
