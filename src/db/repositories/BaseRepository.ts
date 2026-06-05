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

    public async deleteAll(): Promise<void> {
        const sql = `DELETE FROM ${this.table.name};`;
        await db.execute(sql);
    }

    /**
     * 🚀 INSERCIÓN MASIVA REESCRITA (SÚPER OPTIMIZADA)
     * Recibe un array de arrays. Ejemplo: batches = [[5000 entidades], [5000 entidades]]
     */
    public async insertBatchMany(batches: T[][]): Promise<void> {
        const columns = this.getColumns();
        
        // Optimizamos SQLite para escrituras masivas antes de iniciar el volcado
        await db.execute("PRAGMA journal_mode = OFF;");
        await db.execute("PRAGMA synchronous = OFF;");

        try {
            for (const entities of batches) {
                if (entities.length === 0) continue;

                // 1. Iniciamos una transacción limpia para este lote
                await db.execute("BEGIN TRANSACTION;");

                // 2. Construimos una ÚNICA sentencia SQL multi-fila
                // Resultado: (?, ?, ?), (?, ?, ?), (?, ?, ?)...
                const placeholders = entities.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ');
                const sql = `INSERT INTO ${this.table.name} (${columns.join(', ')}) VALUES ${placeholders};`;

                // 3. Aplanamos todos los argumentos de todas las entidades en un solo array lineal
                const args: any[] = [];
                for (const entity of entities) {
                    for (const col of columns) {
                        args.push(entity[col as keyof T] ?? null);
                    }
                }

                // 4. Se ejecuta una Sola vez por lote completo en lugar de miles de veces
                const res = await db.execute(sql, args);
                
                // 5. Consolidamos los cambios en el disco duro físico del dispositivo
                await db.execute("COMMIT;");

                console.log(`[${this.table.name}] Lote insertado con éxito. Filas afectadas en este bloque: ${res.rowsAffected}`);
            }
        } catch (error) {
            console.error(`[DB ERROR] Fallo masivo en ${this.table.name}, revirtiendo lote...`, error);
            try { await db.execute("ROLLBACK;"); } catch (_) {}
            throw error;
        } finally {
            // Devolvemos SQLite a su configuración segura y óptima para el modo lectura diario (WAL)
            await db.execute("PRAGMA journal_mode = WAL;");
            await db.execute("PRAGMA synchronous = NORMAL;");
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

        await statement.bindSync(args as any[]); 
        await statement.execute();
    }

    private getColumns(excludeId: boolean = true): string[] {
        if (excludeId) return Object.keys(this.table.schema).filter(item => !(item === 'id'));
        return Object.keys(this.table.schema);
    }
}