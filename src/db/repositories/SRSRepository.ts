import { Repository } from './BaseRepository';
import { SRSEntry, TableSRS } from '../schemas/SRS';
import db from '../config';

export class SRSRepository extends Repository<SRSEntry> {
    constructor() {
        super(TableSRS);
    }

    async findByVocabId(vocabId: number): Promise<SRSEntry | null> {
        const query = `SELECT * FROM ${this.table.name} WHERE vocab_id = ?`;
        const result = await db.execute(query, [vocabId]);
        const rows = result.rows as SRSEntry[];
        return rows.length > 0 ? rows[0] : null;
    }

    async updateReview(id: number, interval: number, easeFactor: number, repetitions: number, nextReview: number, cardType: number, grade: number): Promise<void> {
        const now = Date.now();
        // Solo actualizamos el last_review (la marca de "completado") si el usuario acertó (grade 5)
        // Si falló, last_review se queda como está para que la Mining Queue lo siga mostrando como pendiente
        const query = `
            UPDATE ${this.table.name} 
            SET interval = ?, ease_factor = ?, repetitions = ?, next_review = ?, card_type = ?
            ${grade === 5 ? ', last_review = ?' : ''}
            WHERE id = ?
        `;
        const params = [interval, easeFactor, repetitions, nextReview, cardType];
        if (grade === 5) params.push(now);
        params.push(id);
        
        await db.execute(query, params);
    }

    async updateLastLookup(vocabId: number): Promise<void> {
        const query = `UPDATE ${this.table.name} SET last_lookup = ? WHERE vocab_id = ?`;
        await db.execute(query, [Date.now(), vocabId]);
    }

    async getPendingReviews(sortByLookup: boolean = false): Promise<any[]> {
        const now = Date.now();
        
        let query: string;
        let params: any[];

        if (sortByLookup) {
            // Mining Queue: Palabras buscadas recientemente que NO han sido repasadas después de ser buscadas
            query = `
                SELECT s.*, v.term, v.reading, v.definition, v.sentence 
                FROM ${this.table.name} s
                JOIN vocabulary v ON s.vocab_id = v.id
                WHERE s.last_lookup > s.last_review
                ORDER BY s.last_lookup DESC
            `;
            params = [];
        } else {
            // Daily Review: Palabras que tocan por calendario
            query = `
                SELECT s.*, v.term, v.reading, v.definition, v.sentence 
                FROM ${this.table.name} s
                JOIN vocabulary v ON s.vocab_id = v.id
                WHERE s.next_review <= ?
                ORDER BY s.next_review ASC
            `;
            params = [now];
        }

        const result = await db.execute(query, params);
        return result.rows as any[];
    }

    async getCountPending(): Promise<number> {
        const now = Date.now();
        const query = `SELECT COUNT(*) as count FROM ${this.table.name} WHERE next_review <= ?`;
        const result = await db.execute(query, [now]);
        const rows = result.rows as any[];
        return rows[0]?.count || 0;
    }
}
