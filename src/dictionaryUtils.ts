import { dbEngine } from './db/engine';
import { JitendexEngine } from './ja-dic-engine/dictionary-engine';
import { TinySegmenter } from './ja-dic-engine/tiny_segmenter';
import { LookupResult } from './types';

// OBTENEMOS LOS REPOSITORIOS REALES
const termRepository = dbEngine.getRepository('TermBankEntryRepository');
const settingsRepository = dbEngine.getRepository('SettingsRepository');

// Instancias Privadas
const segmenter = new TinySegmenter();

// Le pasamos el repositorio de SQL al inicializar el motor del diccionario
const engine = new JitendexEngine(termRepository);

/**
 * Función 1: Obtiene el texto tokenizado como array de strings
 */
export const getTokens = (text: string): string[] => {
    if (!text) return [];
    return segmenter.segment(text);
};

/**
 * Función 2: Busca un token por su posición en el array de tokens
 */
export const lookupToken = async (
    tokens: string[], 
    tokenIndex: number
): Promise<LookupResult[]> => {
    if (!tokens[tokenIndex]) return [];

    const word = tokens[tokenIndex];
    const fullText = tokens.join('');

    let startIdx = 0;
    for (let i = 0; i < tokenIndex; i++) {
        startIdx += tokens[i].length;
    }

    try {
        // Obtener preferencia de búsqueda
        const searchByReading = await settingsRepository.get('searchByReading', 'false');

        // Ejecutamos el nuevo lookup que hace las consultas a SQLite
        const matches = await engine.lookup(word, startIdx, fullText, {
            includeReading: searchByReading === 'true'
        });
        return matches as LookupResult[];
    } catch (error) {
        console.error('Error en lookupToken:', error);
        return [];
    }
};

/**
 * Función 3: Busca una palabra basándose en un índice de caracteres
 */
export const lookupAtCharacterIndex = async (
    text: string,
    charIndex: number
): Promise<LookupResult[]> => {
    if (!text || charIndex < 0 || charIndex >= text.length) return [];

    const clickedChar = text[charIndex];

    try {
        const searchByReading = await settingsRepository.get('searchByReading', 'false');
        const matches = await engine.lookup(clickedChar, charIndex, text, {
            includeReading: searchByReading === 'true'
        });
        return matches as LookupResult[];
    } catch (error) {
        console.error('Error en lookupAtCharacterIndex:', error);
        return [];
    }
};

/**
 * Función 4: Busca un término forzado (como una selección manual)
 */
export const lookupWithForcedTerm = async (
    sentence: string,
    term: string,
    charIndex: number
): Promise<LookupResult[]> => {
    if (!sentence || !term) return [];

    try {
        const searchByReading = await settingsRepository.get('searchByReading', 'false');

        // Llamamos al motor con el término seleccionado manualmente
        const matches = await engine.lookup(term, charIndex, sentence, {
            includeReading: searchByReading === 'true'
        });
        return matches as LookupResult[];
    } catch (error) {
        console.error('Error en lookupWithForcedTerm:', error);
        return [];
    }
};