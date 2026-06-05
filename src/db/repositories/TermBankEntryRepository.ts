import { Repository } from './BaseRepository';
import { TermBankEntry, TableTermBank } from '../schemas/Term';
import db from '../config';

export class TermBankEntryRepository extends Repository<TermBankEntry> {
    constructor() {
        super(TableTermBank);
    }

async findByTermsAndReadings(candidates: string[]): Promise<TermBankEntry[]> {
    if (!candidates || candidates.length === 0) return [];

    // Limpiamos duplicados en JavaScript
    const uniqueCandidates = [...new Set(candidates)].filter(Boolean);

    // Construimos sub-queries individuales con "=" en vez de "IN"
    // Esto obliga a SQLite a usar el índice de forma atómica para cada palabra
    const termQueries = uniqueCandidates.map(() => `SELECT * FROM term_bank WHERE term = ?`);
    const readingQueries = uniqueCandidates.map(() => `SELECT * FROM term_bank WHERE reading = ?`);

    // Juntamos absolutamente todo con UNION ALL
    const finalQuery = [...termQueries, ...readingQueries].join('\nUNION ALL\n');

    // Los parámetros deben alinearse con el orden de las queries creadas
    const params = [...uniqueCandidates, ...uniqueCandidates];

    try {
        const result = await db.execute(finalQuery, params);
        return (await result.rows || []) as TermBankEntry[];
    } catch (error) {
        console.error("Error en query optimizada por bloques:", error);
        return [];
    }
}
}