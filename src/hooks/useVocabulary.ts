import { useState, useCallback, useEffect } from 'react';
import { dbEngine } from '../db/engine';
import { VocabularyEntry } from '../db/schemas/Vocabulary';

export const useVocabulary = () => {
    const [vocabulary, setVocabulary] = useState<any[]>([]);
    const [todayCount, setTodayCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [dailyGoal, setDailyGoal] = useState(10);
    const vocabRepo = dbEngine.getRepository('VocabularyRepository');
    const settingsRepo = dbEngine.getRepository('SettingsRepository');

    const loadVocabulary = useCallback(async (limit: number = 20, offset: number = 0, search: string = '', sortMode: string = 'newest') => {
        try {
            const [data, count, total, goalStr] = await Promise.all([
                vocabRepo.getAllWithSRS(limit, offset, search, sortMode),
                vocabRepo.getTodayCount(),
                vocabRepo.getTotalCount(search),
                settingsRepo.get('daily_goal', '10')
            ]);
            
            if (offset === 0) {
                setVocabulary(data);
            } else {
                setVocabulary(prev => [...prev, ...data]);
            }

            setTodayCount(count);
            setTotalCount(total);
            setDailyGoal(parseInt(goalStr, 10));
            return data;
        } catch (error) {
            console.error("Error loading vocabulary:", error);
            return [];
        }
    }, [vocabRepo, settingsRepo]);

    const updateDailyGoal = useCallback(async (newGoal: number) => {
        try {
            await settingsRepo.set('daily_goal', newGoal.toString());
            setDailyGoal(newGoal);
        } catch (error) {
            console.error("Error updating daily goal:", error);
        }
    }, [settingsRepo]);

    const addVocabulary = useCallback(async (term: string, reading: string, definition: string, sentence: string) => {
        try {
            const existing = await vocabRepo.findDuplicate(term, reading, sentence);
            if (existing) return false;

            const vocabEntry = { term, reading, definition, sentence, created_at: Date.now() } as VocabularyEntry;
            await vocabRepo.insert(vocabEntry);
            
            if (vocabEntry.id) {
                const srsRepo = dbEngine.getRepository('SRSRepository');
                await srsRepo.insert({
                    vocab_id: vocabEntry.id,
                    card_type: 1,
                    interval: 0,
                    ease_factor: 2.5,
                    repetitions: 0,
                    next_review: Date.now(),
                    last_lookup: Date.now(),
                    last_review: 0,
                    created_at: Date.now(),
                    id: 0
                });
            }
            
            await loadVocabulary();
            return true;
        } catch (error) {
            console.error("Error adding vocabulary:", error);
            return false;
        }
    }, [vocabRepo, loadVocabulary]);

    const removeVocabulary = useCallback(async (id: number) => {
        try {
            await vocabRepo.delete(id);
            // No recargamos todo, solo filtramos el estado para suavidad
            setVocabulary(prev => prev.filter(v => v.id !== id));
            setTotalCount(prev => prev - 1);
        } catch (error) {
            console.error("Error removing vocabulary:", error);
        }
    }, [vocabRepo]);

    return {
        vocabulary,
        todayCount,
        totalCount,
        dailyGoal,
        setDailyGoal: updateDailyGoal,
        addVocabulary,
        removeVocabulary,
        refreshVocabulary: loadVocabulary
    };
};
