import { SQLBatchTuple } from '@op-engineering/op-sqlite';
import db from '../config';
import { Table } from '../types';

export abstract class Repository<T extends { [key: string]: unknown }> {
    table: Table;

    constructor(table: Table) {
        this.table = table;
    }

    public async getAll(): Promise<T[]> {
        const sql = `SELECT * FROM ${this.table.name};`;
        const result = await db.execute(sql);
        return result.rows as T[];
    }
    public async insertBatchMany(batches: T[][]): Promise<void> {
        for (const entities of batches) {
            const commands: SQLBatchTuple[] = entities.map(entity => {
                const { sql, args } = this.getInsertQueryAndValues(entity);
                return [sql, args as any[]]; // Added any[] cast for op-sqlite compatibility if needed
            });
            const res = await db.executeBatch(commands);
            console.log("insert many in " + this.table.name + ": " + res.rowsAffected);

        }
    }
    private getInsertQueryAndValues(entity: T) {
        const columns = this.getColumns();

        const args = columns.map(
            col => entity[col as keyof T] ?? null
        );

        const sql = `
        INSERT INTO ${this.table.name}
        (${columns.join(', ')})
        VALUES (${columns.map(() => '?').join(', ')});
    `;

        return { sql, args };
    }
    public async insert(entity: T): Promise<void> {

        const { sql, args } = this.getInsertQueryAndValues(entity);
        const statement = await db.prepareStatement(sql);

        await statement.bindSync(args as any[]); // Added any[] cast for op-sqlite compatibility if needed
        await statement.execute();
    }

    private getColumns(excludeId: boolean = true): string[] {
        if (excludeId) return Object.keys(this.table.schema).filter(item => !(item === 'id'));
        return Object.keys(this.table.schema);
    }
}
