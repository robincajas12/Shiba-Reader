import { JitendexEngine } from './ja-dic-engine/dictionary-engine';
import { TinySegmenter } from './ja-dic-engine/tiny_segmenter';
import { termIndex } from './ja-dic-engine/index_data';
import { LookupResult } from './types';

// Pre-load data
const termBank1 = require('../dic/[JA-EN] jitendex-yomitan (2026-05-05)/term_bank_1.json');

// Private instances
const segmenter = new TinySegmenter();
const engine = new JitendexEngine(termIndex, '');
engine.setPreloadedData(termBank1);

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

  // Realizamos la búsqueda
  // Nota: Ya no usamos el bucle de prefijos aquí porque el motor
  // ahora es más agresivo con las combinaciones (Merge)
  try {
    const matches = await engine.lookup(word, startIdx, fullText, segmenter);
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

  // En lugar de confiar solo en el tokenizador,
  // simplemente le pasamos el carácter donde se hizo clic como punto de partida.
  // El motor se encargará de buscar hacia adelante combinando letras.
  const clickedChar = text[charIndex];
  
  try {
    const matches = await engine.lookup(clickedChar, charIndex, text, segmenter);
    return matches as LookupResult[];
  } catch (error) {
    console.error('Error en lookupAtCharacterIndex:', error);
    return [];
  }
};
