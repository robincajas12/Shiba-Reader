import { Table } from '../types';

export type VocabularyEntry = {
    id: number;
    term: string;
    reading: string;
    definition: string; // JSON string of the glossary
    sentence: string;
    created_at: number;
}

export const TableVocabulary: Table = {
    name: 'vocabulary',
    schema: {
        id: { name: 'id', type: 'INTEGER', extraInfo: 'PRIMARY KEY AUTOINCREMENT' },
        term: { name: 'term', type: 'TEXT' },
        reading: { name: 'reading', type: 'TEXT' },
        definition: { name: 'definition', type: 'TEXT' },
        sentence: { name: 'sentence', type: 'TEXT' },
        created_at: { name: 'created_at', type: 'INTEGER' }
    },
    indexes: [
        { name: 'idx_vocab_term', columns: ['term'] },
        { name: 'idx_vocab_created', columns: ['created_at'] }
    ]
};
