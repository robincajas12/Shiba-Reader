import { Repository } from './BaseRepository';
import { Bookmark, TableBookmark } from '../schemas/Browser';
import db from '../config';

export class BookmarkRepository extends Repository<Bookmark> {
    constructor() {
        super(TableBookmark);
    }

    async findByUrl(url: string): Promise<Bookmark | null> {
        const query = `SELECT * FROM ${this.table.name} WHERE url = ?`;
        const result = await db.execute(query, [url]);
        const rows = result.rows as Bookmark[];
        return rows.length > 0 ? rows[0] : null;
    }

    async delete(id: number): Promise<void> {
        const query = `DELETE FROM ${this.table.name} WHERE id = ?`;
        await db.execute(query, [id]);
    }
}
