import { useCallback } from 'react';
import { dbEngine } from '../db/engine';
import { calculateNextReview } from '../utils/srsLogic';
import { SRSEntry } from '../db/schemas/SRS';

export interface SRSStatusResult {
    vocabEntry: any;
    srsEntry: SRSEntry | null;
}

export const useSRS = () => {
    const srsRepo = dbEngine.getRepository('SRSRepository');
    const vocabRepo = dbEngine.getRepository('VocabularyRepository');

    /**
     * Busca TODAS las tarjetas de un término y actualiza el last_lookup si existen
     */
    const getSRSStatus = useCallback(async (term: string): Promise<SRSStatusResult[]> => {
        try {
            const vocabEntries = await vocabRepo.findByTerm(term);
            if (vocabEntries.length === 0) return [];

            const results: SRSStatusResult[] = [];
            for (const vocabEntry of vocabEntries) {
                const srsEntry = await srsRepo.findByVocabId(vocabEntry.id);
                
                // Si la tarjeta ya existe en el SRS, actualizamos su fecha de último encuentro
                if (srsEntry) {
                    await srsRepo.updateLastLookup(vocabEntry.id);
                }
                
                results.push({ vocabEntry, srsEntry });
            }
            
            return results;
        } catch (error) {
            console.error("Error checking SRS status:", error);
            return [];
        }
    }, [srsRepo, vocabRepo]);

    /**
     * Procesa una evaluación (Bien, Lectura, Todo)
     */
    const processReview = useCallback(async (vocabId: number, grade: number) => {
        try {
            let srsEntry = await srsRepo.findByVocabId(vocabId);
            let result;

            if (!srsEntry) {
                result = calculateNextReview(0, 2.5, 0, grade, 1);
                
                await srsRepo.insert({
                    vocab_id: vocabId,
                    card_type: result.card_type,
                    interval: result.interval,
                    ease_factor: result.ease_factor,
                    repetitions: result.repetitions,
                    next_review: result.next_review,
                    last_lookup: Date.now(),
                    last_review: grade === 5 ? Date.now() : 0,
                    created_at: Date.now()
                } as SRSEntry);
            } else {
                result = calculateNextReview(
                    srsEntry.interval,
                    srsEntry.ease_factor,
                    srsEntry.repetitions,
                    grade,
                    srsEntry.card_type
                );

                await srsRepo.updateReview(
                    srsEntry.id,
                    result.interval,
                    result.ease_factor,
                    result.repetitions,
                    result.next_review,
                    result.card_type,
                    grade
                );
            }
            return result;
        } catch (error) {
            console.error("Error processing SRS review:", error);
            return null;
        }
    }, [srsRepo]);

    return {
        getSRSStatus,
        processReview,
        getPendingCount: useCallback(() => srsRepo.getCountPending(), [srsRepo]),
        getPendingReviews: useCallback((sortByLookup: boolean = false) => 
            srsRepo.getPendingReviews(sortByLookup), [srsRepo]),
    };
};
