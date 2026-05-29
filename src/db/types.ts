export type Column = {
    name: string;
    type: string;
    extraInfo?: string;
}

export type Schema = {
    [key: string]: Column;
}

export type TableIndex = {
    name: string;
    columns: string[];
};

export type Table = {
    name: string;
    schema: Schema;
    indexes?: TableIndex[];
};
