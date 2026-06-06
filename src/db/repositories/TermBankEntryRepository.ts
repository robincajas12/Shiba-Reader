import { Repository } from './BaseRepository';
import { TermBankEntry, TableTermBank } from '../schemas/Term';
import db from '../config';

export class TermBankEntryRepository extends Repository<TermBankEntry> {
    constructor() {
        super(TableTermBank);
    }

    async findByTermsAndReadings(candidates: string[]): Promise<TermBankEntry[]> {
        if (!candidates || candidates.length === 0) return [];
        console.log("candidates recibidos para búsqueda:", candidates);
        const uniqueCandidates = [...new Set(candidates)].filter(Boolean);
        const placeholders = uniqueCandidates.map(() => '?').join(', ');

        // 🚀 OPTIMIZACIÓN BALANCEADA: Dos grandes búsquedas indexadas unidas
        const query = `
            SELECT * FROM term_bank WHERE term IN (${placeholders})
            UNION ALL
            SELECT * FROM term_bank WHERE reading IN (${placeholders})
        `;

        const params = [...uniqueCandidates, ...uniqueCandidates];

        try {
            const start =await Date.now();
            const result = await db.execute(query, params);
            const duration =await Date.now() - start;
            console.log(`findByTermsAndReadings ${await duration}ms`);
            
            return (await result.rows || []) as TermBankEntry[];
        } catch (error) {
            console.error("Error en query UNION ALL:", error);
            return [];
        }
    }
}