import { Repository } from './BaseRepository';
import { TermBankEntry, TableTermBank } from '../schemas/Term';
import db from '../config';

export class TermBankEntryRepository extends Repository<TermBankEntry> {
    constructor() {
        super(TableTermBank);
    }

    async findByTermsAndReadings(candidates: string[], includeReading: boolean = false): Promise<TermBankEntry[]> {
        if (!candidates || candidates.length === 0) return [];
        console.log("candidates recibidos para búsqueda:", candidates, "includeReading:", includeReading);
        const uniqueCandidates = [...new Set(candidates)].filter(Boolean);
        const placeholders = uniqueCandidates.map(() => '?').join(', ');

        let query: string;
        let params: any[];

        if (includeReading) {
            // 🚀 OPTIMIZACIÓN BALANCEADA: Dos grandes búsquedas indexadas unidas
            query = `
                SELECT * FROM term_bank WHERE term IN (${placeholders})
                UNION ALL
                SELECT * FROM term_bank WHERE reading IN (${placeholders})
            `;
            params = [...uniqueCandidates, ...uniqueCandidates];
        } else {
            // Solo buscar por término (por defecto)
            query = `SELECT * FROM term_bank WHERE term IN (${placeholders})`;
            params = uniqueCandidates;
        }

        try {
            const start = Date.now();
            const result = await db.execute(query, params);
            const duration = Date.now() - start;
            console.log(`findByTermsAndReadings ${duration}ms`);
            
            return (result.rows || []) as TermBankEntry[];
        } catch (error) {
            console.error("Error en query de búsqueda:", error);
            return [];
        }
    }
}