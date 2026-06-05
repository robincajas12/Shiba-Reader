import { Schema, Table } from '../types';

export type TermBankEntry = {
    id: number;              // Llave primaria autoincremental recomendada para control interno
    term: string;             // Posición [0]: Término o Expresión en Kanji/Kana
    reading: string;          // Posición [1]: Lectura en Kana
    definition_tags: string;  // Posición [2]: Etiquetas de definición (separadas por espacio)
    deinflection_rules: string;// Posición [3]: Reglas de desinflexión/Conjugación
    score: number;            // Posición [4]: Prioridad / Popularidad del término
    glossary: string;         // Posición [5]: Definición estructurada (Guardada como TEXT/JSON stringificado)
    sequence: number;         // Posición [6]: ID o número de secuencia único original del diccionario
    entry_tags: string;       // Posición [7]: Etiquetas generales de la entrada
}



export const TableTermBank: Table = {
    name: 'term_bank',
    schema:  {
        id: { name: 'id', type: 'INTEGER', extraInfo: 'PRIMARY KEY AUTOINCREMENT' },
        term: { name: 'term', type: 'TEXT' },
        reading: { name: 'reading', type: 'TEXT' },
        definition_tags: { name: 'definition_tags', type: 'TEXT' },
        deinflection_rules: { name: 'deinflection_rules', type: 'TEXT' },
        score: { name: 'score', type: 'INTEGER' },
        glossary: { name: 'glossary', type: 'TEXT' }, // Almacenará el JSON estructurado como texto
        sequence: { name: 'sequence', type: 'INTEGER' },
        entry_tags: { name: 'entry_tags', type: 'TEXT' }
    },
    indexes: [
        {
            name: 'idx_term_bank_term',
            columns: ['term']
        },
        {
            name: 'idx_term_bank_reading',
            columns: ['reading']
        },
        {
            name: 'idx_term_bank_sequence',
            columns: ['sequence']
        }
    ]
};