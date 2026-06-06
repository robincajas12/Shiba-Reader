import { Table } from '../types';

export type SettingEntry = {
    key: string;
    value: string;
}

export const TableSettings: Table = {
    name: 'settings',
    schema: {
        key: { name: 'key', type: 'TEXT', extraInfo: 'PRIMARY KEY' },
        value: { name: 'value', type: 'TEXT' }
    }
};
