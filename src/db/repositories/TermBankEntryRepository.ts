import { Repository } from './BaseRepository';
import { TermBankEntry, TableTermBank } from '../schemas/Term';
import db from '../config';

export class TermBankEntryRepository extends Repository<TermBankEntry> {
    constructor() {
        super(TableTermBank);
    }
    async findByTermsAndReadings(texts: string[]): Promise<TermBankEntry[]> {
    if (texts.length === 0) return [];
    
    // Crea dinámicamente los "?, ?, ?" según cuántos candidatos haya
    const placeholders = texts.map(() => '?').join(', ');
    
    const query = `
        SELECT * FROM term_bank 
        WHERE term IN (${placeholders}) 
           OR reading IN (${placeholders})
    `;
    
    // Pasamos el array de textos dos veces (uno para 'term IN' y otro para 'reading IN')
    console.log('Executing Text:', texts);
    const params = [...texts, ...texts]; 
    
    return (await db.execute(query, params)).rows as TermBankEntry[]; // O el método ejecutor que use tu BaseRepository
}
}
