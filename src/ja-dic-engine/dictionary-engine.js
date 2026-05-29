/**
 * Jitendex Dictionary Engine
 * Maneja la lógica de búsqueda, caché y renderizado.
 */
import JapaneseDeinflector from './deinflector';

export class JitendexEngine {
    constructor(termRepository) {
        // Recibimos el repositorio limpio directamente en el constructor
        this.termRepository = termRepository;
        this.cache = new Map();
        this.preloadedData = null;
    }

    setPreloadedData(data) {
        this.preloadedData = data;
    }

    /**
     * Realiza una búsqueda avanzada (exacta + desinflexión + combinación)
     */
    async lookup(clickedWord, startIdx = 0, fullText = '', segmenter = null) {
        const matches = [];
        const searchCandidates = [];
        
        // 1. Exacto y Desinflexiones
        if (JapaneseDeinflector) {
            JapaneseDeinflector.deinflect(clickedWord).forEach(d => {
                searchCandidates.push({ 
                    text: d.text, 
                    type: d.text === clickedWord ? 'exact' : 'deinflected', 
                    original: clickedWord, 
                    info: d.rules[0] 
                });
            });
        } else {
            searchCandidates.push({ text: clickedWord, type: 'exact', original: clickedWord });
        }

        // 2. Combinación Inteligente (Merge)
        if (fullText) {
            let combined = clickedWord;
            const remainingText = fullText.slice(startIdx + clickedWord.length);
            
            // CONTRATO A: Basado en tokens (más preciso)
            if (segmenter) {
                const nextTokens = segmenter.segment(remainingText).slice(0, 4);
                let currentCombined = clickedWord;
                for (const nextT of nextTokens) {
                    if (/[、。！？\s]/.test(nextT)) break;
                    currentCombined += nextT;
                    searchCandidates.push({ 
                        text: currentCombined, 
                        type: 'combined', 
                        original: clickedWord 
                    });
                }
            }

            // CONTRATO B: Basado en caracteres (más agresivo, para casos como T-shirt)
            let charCombined = clickedWord;
            for (let i = 0; i < Math.min(remainingText.length, 7); i++) {
                const nextChar = remainingText[i];
                if (/[、。！？\s]/.test(nextChar)) break;
                charCombined += nextChar;
                if (!searchCandidates.find(c => c.text === charCombined)) {
                    searchCandidates.push({ 
                        text: charCombined, 
                        type: 'combined-char', 
                        original: clickedWord 
                    });
                }
            }
        }

        // =========================================================================
        // REEMPLAZO: PASO 3 Y 4 UNIFICADOS PARA CONSULTAR EN LA BASE DE DATOS SQL
        // =========================================================================
        const textToSearch = searchCandidates.map(cand => cand.text);
        
        if (textToSearch.length > 0) {
            try {
                // Hacemos una única consulta SQL masiva pasando todos los textos recolectados
                const databaseRows = await this.termRepository.findByTermsAndReadings(textToSearch);

                // Mapeamos los resultados directo al formato de matriz plana de tu UI
                for (const cand of searchCandidates) {
                    const foundRows = databaseRows.filter(row => row.term === cand.text || row.reading === cand.text);
                    
                    foundRows.forEach(row => {
                        matches.push({
                            entry: [
                                row.term,
                                row.reading,
                                row.definition_tags || '',
                                row.deinflection_rules || '',
                                row.score || 0,
                                typeof row.glossary === 'string' ? JSON.parse(row.glossary) : row.glossary,
                                row.sequence || 0,
                                row.entry_tags || ''
                            ],
                            cand: cand
                        });
                    });
                }
            } catch (error) {
                console.error("Error buscando términos en SQL:", error);
            }
        }

        // 5. Ranking y Dedup (Exactamente idéntico a tu original)
        const typePriority = { 'combined': 5, 'combined-char': 4, 'exact': 3, 'deinflected': 2, 'prefix': 1 };
        matches.sort((a, b) => {
            const pA = typePriority[a.cand.type] || 0;
            const pB = typePriority[b.cand.type] || 0;
            if (pA !== pB) return pB - pA;
            return (b.entry[4] || 0) - (a.entry[4] || 0);
        });

        const unique = [];
        const seen = new Set();
        for (const m of matches) {
            const key = m.entry[0] + m.entry[1] + JSON.stringify(m.entry[5]);
            if (!seen.has(key)) {
                unique.push(m);
                seen.add(key);
            }
        }
        return unique;
    }

    renderEntry(m) {
        return "RN should use custom components for rendering";
    }
}