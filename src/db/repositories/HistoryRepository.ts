import { Repository } from './BaseRepository';
import { HistoryEntry, TableHistory } from '../schemas/Browser';
import db from '../config';

export class HistoryRepository extends Repository<HistoryEntry> {
    constructor() {
        super(TableHistory);
    }

    async getRecent(limit: number = 20): Promise<HistoryEntry[]> {
        const query = `SELECT * FROM ${this.table.name} ORDER BY timestamp DESC LIMIT ?`;
        const result = await db.execute(query, [limit]);
        return result.rows as HistoryEntry[];
    }

    async deleteByUrl(url: string): Promise<void> {
        const query = `DELETE FROM ${this.table.name} WHERE url = ?`;
        await db.execute(query, [url]);
    }
}
