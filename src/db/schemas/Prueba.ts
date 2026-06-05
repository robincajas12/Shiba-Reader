import { Table } from '../types';

export type Prueba = {
    id: number;
    name: string;
    age: number;
}


export const TablePrueba: Table = {
    name: 'pruebas',
    schema:  {
        id: { name: 'id', type: 'INTEGER', extraInfo: 'PRIMARY KEY AUTOINCREMENT' },
        name: { name: 'name', type: 'TEXT' },
        age: { name: 'age', type: 'INTEGER' }
    }
};
