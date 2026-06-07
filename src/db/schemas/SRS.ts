import { Table } from '../types';

export type SRSEntry = {
    id: number;
    vocab_id: number; // Enlace a vocabulary.id
    card_type: number; // 0 = Lectura, 1 = Normal/Todo
    interval: number; // Días hasta el próximo repaso
    ease_factor: number; // Factor de facilidad (SM-2)
    repetitions: number; // Aciertos consecutivos
    next_review: number; // Timestamp (ms)
    last_lookup: number; // Timestamp del último encuentro en el lector
    created_at: number;
}

export const TableSRS: Table = {
    name: 'srs_queue',
    schema: {
        id: { name: 'id', type: 'INTEGER', extraInfo: 'PRIMARY KEY AUTOINCREMENT' },
        vocab_id: { name: 'vocab_id', type: 'INTEGER', extraInfo: 'UNIQUE' },
        card_type: { name: 'card_type', type: 'INTEGER' },
        interval: { name: 'interval', type: 'INTEGER' },
        ease_factor: { name: 'ease_factor', type: 'REAL' },
        repetitions: { name: 'repetitions', type: 'INTEGER' },
        next_review: { name: 'next_review', type: 'INTEGER' },
        last_lookup: { name: 'last_lookup', type: 'INTEGER' },
        created_at: { name: 'created_at', type: 'INTEGER' }
    },
    indexes: [
        { name: 'idx_srs_vocab', columns: ['vocab_id'] },
        { name: 'idx_srs_next', columns: ['next_review'] },
        { name: 'idx_srs_lookup', columns: ['last_lookup'] }
    ]
};
