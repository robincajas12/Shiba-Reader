import { useState, useCallback, useEffect } from 'react';
import { dbEngine } from '../db/engine';
import { VocabularyEntry } from '../db/schemas/Vocabulary';

export const useVocabulary = () => {
    const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
    const vocabRepo = dbEngine.getRepository('VocabularyRepository');

    const loadVocabulary = useCallback(async () => {
        try {
            const data = await vocabRepo.getAllOrdered();
            setVocabulary(data);
        } catch (error) {
            console.error("Error loading vocabulary:", error);
        }
    }, [vocabRepo]);

    useEffect(() => {
        loadVocabulary();
    }, [loadVocabulary]);

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

    return {
        vocabulary,
        addVocabulary,
        removeVocabulary,
        refreshVocabulary: loadVocabulary
    };
};
