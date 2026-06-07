import { Repository } from './BaseRepository';
import { VocabularyEntry, TableVocabulary } from '../schemas/Vocabulary';
import db from '../config';

export class VocabularyRepository extends Repository<VocabularyEntry> {
    constructor() {
        super(TableVocabulary);
    }

    async getAllOrdered(): Promise<VocabularyEntry[]> {
        const query = `SELECT * FROM ${this.table.name} ORDER BY created_at DESC`;
        const result = await db.execute(query);
        return result.rows as VocabularyEntry[];
    }

    async delete(id: number): Promise<void> {
        const query = `DELETE FROM ${this.table.name} WHERE id = ?`;
        await db.execute(query, [id]);
    }
    
    async findDuplicate(term: string, reading: string, sentence: string): Promise<VocabularyEntry | null> {
        const query = `SELECT * FROM ${this.table.name} WHERE term = ? AND reading = ? AND sentence = ?`;
        const result = await db.execute(query, [term, reading, sentence]);
        const rows = result.rows as VocabularyEntry[];
        return rows.length > 0 ? rows[0] : null;
    }

    async getTodayCount(): Promise<number> {
        const startOfToday = new Date().setHours(0, 0, 0, 0);
        const query = `SELECT COUNT(*) as count FROM ${this.table.name} WHERE created_at >= ?`;
        const result = await db.execute(query, [startOfToday]);
        const rows = result.rows as any[];
        return rows[0]?.count || 0;
    }

    async updateLatestSentence(newSentence: string): Promise<void> {
        const query = `
            UPDATE ${this.table.name} 
            SET sentence = ? 
            WHERE id = (SELECT id FROM ${this.table.name} ORDER BY created_at DESC LIMIT 1)
        `;
        await db.execute(query, [newSentence]);
    }
}
