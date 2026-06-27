import { Table } from '../types';

export type KanjiEggEntry = {
    kanji: string;         // The kanji character itself (e.g., '日')
    points: number;        // Current evolution points (e.g., 0.1, 1.0, 5.0)
    status: string;        // 'egg' | 'hatched'
    discovered_at: number; // Timestamp of first encounter
    hatched_at: number | null; // Timestamp of eclosion
}

export const TableKanjiEgg: Table = {
    name: 'kanji_eggs',
    schema: {
        kanji: { name: 'kanji', type: 'TEXT', extraInfo: 'PRIMARY KEY' },
        points: { name: 'points', type: 'REAL' },
        status: { name: 'status', type: 'TEXT' },
        discovered_at: { name: 'discovered_at', type: 'INTEGER' },
        hatched_at: { name: 'hatched_at', type: 'INTEGER' }
    },
    indexes: [
        { name: 'idx_kanji_eggs_status', columns: ['status'] }
    ]
};
