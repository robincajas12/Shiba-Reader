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

    async updateReview(id: number, interval: number, easeFactor: number, repetitions: number, nextReview: number, cardType: number): Promise<void> {
        const query = `
            UPDATE ${this.table.name} 
            SET interval = ?, ease_factor = ?, repetitions = ?, next_review = ?, card_type = ?, last_lookup = ?
            WHERE id = ?
        `;
        await db.execute(query, [interval, easeFactor, repetitions, nextReview, cardType, Date.now(), id]);
    }

    async updateLastLookup(vocabId: number): Promise<void> {
        const query = `UPDATE ${this.table.name} SET last_lookup = ? WHERE vocab_id = ?`;
        await db.execute(query, [Date.now(), vocabId]);
    }

    async getPendingReviews(sortByLookup: boolean = false): Promise<any[]> {
        const now = Date.now();
        // Modo Prueba activado (sin filtro de fecha)
        const query = `
            SELECT s.*, v.term, v.reading, v.definition, v.sentence 
            FROM ${this.table.name} s
            JOIN vocabulary v ON s.vocab_id = v.id
            ORDER BY ${sortByLookup ? 's.last_lookup DESC' : 's.next_review ASC'}
        `;
        const result = await db.execute(query);
        return result.rows as any[];
    }

    async getCountPending(): Promise<number> {
        const query = `SELECT COUNT(*) as count FROM ${this.table.name}`;
        const result = await db.execute(query);
        const rows = result.rows as any[];
        return rows[0]?.count || 0;
    }
}
