import db from '../config';
import { Table } from '../types';

export abstract class Repository<T extends { [key: string]: unknown }> {
    table: Table;

    constructor(table: Table) {
        this.table = table;
    }

    async getAll(): Promise<T[]> {
        const sql = `SELECT * FROM ${this.table.name};`;
        const result = await db.execute(sql);
        return result.rows as T[];
    }

    async insert(entity: T): Promise<void> {
        const columns = this.excludeIdColumn().join(', ');
        const values = columns.split(', ').map(col => {
            return entity[col as keyof T];
        });
        
        const sql = `INSERT INTO ${this.table.name} (${columns}) VALUES (${this.excludeIdColumn().map(() => '?').join(', ')});`;
        const statement = await db.prepareStatement(sql);
        
        await statement.bindSync(values as any[]); // Added any[] cast for op-sqlite compatibility if needed
        await statement.execute();
    }

    private excludeIdColumn(): string[] {
        return Object.keys(this.table.schema).filter(item => !(item === 'id'));
    }
}
