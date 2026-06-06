import { Repository } from './BaseRepository';
import { SettingEntry, TableSettings } from '../schemas/Settings';
import db from '../config';

export class SettingsRepository extends Repository<SettingEntry> {
    constructor() {
        super(TableSettings);
    }

    async get(key: string, defaultValue: string): Promise<string> {
        try {
            const query = `SELECT value FROM ${this.table.name} WHERE key = ?`;
            const result = await db.execute(query, [key]);
            const rows = result.rows as any[];
            return rows.length > 0 ? rows[0].value : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }

    async set(key: string, value: string): Promise<void> {
        const query = `INSERT OR REPLACE INTO ${this.table.name} (key, value) VALUES (?, ?)`;
        await db.execute(query, [key, value]);
    }
}
