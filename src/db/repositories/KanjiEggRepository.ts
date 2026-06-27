import { Repository } from './BaseRepository';
import { KanjiEggEntry, TableKanjiEgg } from '../schemas/KanjiEgg';
import db from '../config';

export class KanjiEggRepository extends Repository<KanjiEggEntry> {
    constructor() {
        super(TableKanjiEgg);
    }

    async findByKanji(kanji: string): Promise<KanjiEggEntry | null> {
        const query = `SELECT * FROM ${this.table.name} WHERE kanji = ?`;
        try {
            const result = await db.execute(query, [kanji]);
            const rows = result.rows as KanjiEggEntry[];
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error finding kanji egg:', error);
            return null;
        }
    }

    async updatePoints(kanji: string, points: number, status: string, hatchedAt: number | null): Promise<void> {
        const query = `UPDATE ${this.table.name} SET points = ?, status = ?, hatched_at = ? WHERE kanji = ?`;
        try {
            await db.execute(query, [points, status, hatchedAt, kanji]);
        } catch (error) {
            console.error('Error updating kanji egg points:', error);
        }
    }

    async getStats(): Promise<{ total: number; eggs: number; hatched: number }> {
        try {
            const totalRes = await db.execute(`SELECT COUNT(*) as count FROM ${this.table.name}`);
            const eggsRes = await db.execute(`SELECT COUNT(*) as count FROM ${this.table.name} WHERE status = 'egg'`);
            const hatchedRes = await db.execute(`SELECT COUNT(*) as count FROM ${this.table.name} WHERE status = 'hatched'`);

            const total = Number(totalRes.rows?.[0]?.count || 0);
            const eggs = Number(eggsRes.rows?.[0]?.count || 0);
            const hatched = Number(hatchedRes.rows?.[0]?.count || 0);

            return { total, eggs, hatched };
        } catch (error) {
            console.error('Error getting kanji egg stats:', error);
            return { total: 0, eggs: 0, hatched: 0 };
        }
    }
}
