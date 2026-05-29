import db from './config';
import { Table } from './types';
import { Repository } from './repositories/BaseRepository';
import { TermBankEntryRepository } from './repositories/TermBankEntryRepository';
import { PruebaRepository } from './repositories/PruebaRepository';
import { TableTermBank } from './schemas/Term';
import { TablePrueba } from './schemas/Prueba';

// Definimos el mapa de tipos estricto para los repositorios
interface RepositoryMap {
    'TermBankEntryRepository': TermBankEntryRepository;
    'PruebaRepository': PruebaRepository;
}

class DbEngine {
    schemas: Table[];
    repositories: RepositoryMap; // Tipado estricto en vez de 'any'

    constructor(schemas: Table[], repositories: RepositoryMap) {
        this.schemas = schemas;
        this.repositories = repositories;
    }

    schemaToSqliteCreateTable(table: Table): string {
        const columns = Object.values(table.schema).map(col => {
            return `${col.name} ${col.type} ${col.extraInfo || ''}`.trim();
        }).join(', ');
        return `CREATE TABLE IF NOT EXISTS ${table.name} (${columns});`;
    }

    async createTables() {
        // 1. Crear todas las tablas primero mapeando los esquemas
        const sqlStatement: string = this.schemas.map(this.schemaToSqliteCreateTable).join('\n');
        console.log('Executing Table SQL:\n', sqlStatement);
        await db.execute(sqlStatement);
        
        // 2. Iterar ordenadamente por cada tabla mapeada en el motor para crear sus índices
        for (const table of this.schemas) {
            if (table.indexes && Array.isArray(table.indexes)) {
                for (const idx of table.indexes) {
                    const columnsStr = idx.columns.join(', ');
                    const sqlIndex = `CREATE INDEX IF NOT EXISTS ${idx.name} ON ${table.name} (${columnsStr});`;
                    
                    console.log(`Executing Index SQL: ${sqlIndex}`);
                    await db.execute(sqlIndex);
                }
            }
        }
    }

    // El método devuelve el tipo correcto automáticamente y valida el string en tiempo de compilación
    getRepository<K extends keyof RepositoryMap>(repositoryName: K): RepositoryMap[K] {
        return this.repositories[repositoryName];
    }
}

// Forzamos que la constante cumpla estrictamente con la interfaz RepositoryMap
const Repositories: RepositoryMap = {
    'TermBankEntryRepository': new TermBankEntryRepository(),
    'PruebaRepository': new PruebaRepository()
};

const dbEngine = new DbEngine([TableTermBank, TablePrueba], Repositories);
dbEngine.createTables();

export { dbEngine };