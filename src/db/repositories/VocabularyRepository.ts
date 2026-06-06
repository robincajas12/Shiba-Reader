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
}
