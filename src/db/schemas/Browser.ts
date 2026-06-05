import { Table } from '../types';

export type Bookmark = {
    id: number;
    title: string;
    url: string;
    created_at: number;
}

export type HistoryEntry = {
    id: number;
    url: string;
    timestamp: number;
}

export const TableBookmark: Table = {
    name: 'bookmarks',
    schema: {
        id: { name: 'id', type: 'INTEGER', extraInfo: 'PRIMARY KEY AUTOINCREMENT' },
        title: { name: 'title', type: 'TEXT' },
        url: { name: 'url', type: 'TEXT' },
        created_at: { name: 'created_at', type: 'INTEGER' }
    },
    indexes: [
        { name: 'idx_bookmarks_url', columns: ['url'] }
    ]
};

export const TableHistory: Table = {
    name: 'history',
    schema: {
        id: { name: 'id', type: 'INTEGER', extraInfo: 'PRIMARY KEY AUTOINCREMENT' },
        url: { name: 'url', type: 'TEXT' },
        timestamp: { name: 'timestamp', type: 'INTEGER' }
    },
    indexes: [
        { name: 'idx_history_timestamp', columns: ['timestamp'] }
    ]
};
