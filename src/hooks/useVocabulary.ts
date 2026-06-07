import { useState, useCallback, useEffect } from 'react';
import { dbEngine } from '../db/engine';
import { VocabularyEntry } from '../db/schemas/Vocabulary';

export const useVocabulary = () => {
    const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
    const [todayCount, setTodayCount] = useState(0);
    const [dailyGoal, setDailyGoal] = useState(10); // Default goal
    const vocabRepo = dbEngine.getRepository('VocabularyRepository');
    const settingsRepo = dbEngine.getRepository('SettingsRepository');

    const loadVocabulary = useCallback(async () => {
        try {
            const [data, count, goalStr] = await Promise.all([
                vocabRepo.getAllOrdered(),
                vocabRepo.getTodayCount(),
                settingsRepo.get('daily_goal', '10')
            ]);
            setVocabulary(data);
            setTodayCount(count);
            setDailyGoal(parseInt(goalStr, 10));
        } catch (error) {
            console.error("Error loading vocabulary:", error);
        }
    }, [vocabRepo, settingsRepo]);

    useEffect(() => {
        loadVocabulary();
    }, [loadVocabulary]);

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
            // Check for duplicates
            const existing = await vocabRepo.findDuplicate(term, reading, sentence);
            if (existing) {
                console.log("Vocabulary entry already exists");
                return false;
            }

            await vocabRepo.insert({
                term,
                reading,
                definition,
                sentence,
                created_at: Date.now()
            } as VocabularyEntry);
            
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
            await loadVocabulary();
        } catch (error) {
            console.error("Error removing vocabulary:", error);
        }
    }, [vocabRepo, loadVocabulary]);

    const updateLastCardSentence = useCallback(async (newSentence: string) => {
        try {
            await vocabRepo.updateLatestSentence(newSentence);
            await loadVocabulary();
            return true;
        } catch (error) {
            console.error("Error updating latest sentence:", error);
            return false;
        }
    }, [vocabRepo, loadVocabulary]);

    return {
        vocabulary,
        todayCount,
        dailyGoal,
        setDailyGoal: updateDailyGoal,
        addVocabulary,
        removeVocabulary,
        updateLastCardSentence,
        refreshVocabulary: loadVocabulary
    };
};
