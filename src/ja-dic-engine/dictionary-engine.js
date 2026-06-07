/**
 * Jitendex Dictionary Engine
 * Mantiene la lógica original del motor:
 * - Exact match
 * - Deinflection
 * - Merge usando TinySegmenter
 * - Deinflection sobre merges
 * - Ranking original
 * - Dedup original
 *
 * La ÚNICA diferencia respecto al original:
 * La búsqueda se hace en SQLite en vez de JSON.
 */

import JapaneseDeinflector from './deinflector';
import { TinySegmenter } from './tiny_segmenter';

export class JitendexEngine {
    constructor(termRepository) {
        this.termRepository = termRepository;

        this.cache = new Map();
        this.preloadedData = null;

        this.segmenter =
            typeof TinySegmenter !== 'undefined'
                ? new TinySegmenter()
                : null;
    }

    setPreloadedData(data) {
        this.preloadedData = data;
    }

    /**
     * Realiza una búsqueda avanzada
     * (exacta + desinflexión + combinación)
     */
    async lookup(clickedWord, startIdx = 0, fullText = '', options = {}) {
        const { includeReading = false } = options;
        const matches = [];
        const searchCandidates = [];

        // =====================================================
        // 1. Exacto + Desinflexión
        // =====================================================

        if (typeof JapaneseDeinflector !== 'undefined') {
            JapaneseDeinflector
                .deinflect(clickedWord)
                .forEach(d => {
                    searchCandidates.push({
                        text: d.text,
                        type:
                            d.text === clickedWord
                                ? 'exact'
                                : 'deinflected',
                        original: clickedWord,
                        info: d.rules?.[0]
                    });
                });
        } else {
            searchCandidates.push({
                text: clickedWord,
                type: 'exact',
                original: clickedWord
            });
        }

        // =====================================================
        // 2. Merge usando TinySegmenter
        // (idéntico al original)
        // =====================================================

        if (this.segmenter && fullText) {
            let combined = clickedWord;

            const remainingText =
                fullText.slice(startIdx + clickedWord.length);

            const nextTokens =
                this.segmenter
                    .segment(remainingText)
                    .slice(0, 4);
                console.log('Tokens siguientes para combinación:', nextTokens);
            for (const nextT of nextTokens) {
                if (/[、。！？\s]/.test(nextT)) {
                    break;
                }

                combined += nextT;

                if (typeof JapaneseDeinflector !== 'undefined') {
                    JapaneseDeinflector
                        .deinflect(combined)
                        .forEach(d => {
                            searchCandidates.push({
                                text: d.text,
                                type:
                                    d.text === combined
                                        ? 'combined'
                                        : 'deinflected-combined',
                                original: combined,
                                info: d.rules?.[0]
                            });
                        });
                } else {
                    searchCandidates.push({
                        text: combined,
                        type: 'combined',
                        original: combined
                    });
                }
            }
        }

        // =====================================================
        // 3. SQL
        // =====================================================

        const uniqueTexts = [
            ...new Set(
                searchCandidates
                    .map(c => c.text)
                    .filter(Boolean)
            )
        ];

        if (uniqueTexts.length > 0) {
            try {
                const databaseRows = await this.termRepository.findByTermsAndReadings(uniqueTexts, includeReading);

                // 🚀 Indexamos resultados en un Mapa para O(1) lookup
                const rowsMap = new Map();
                for (const row of databaseRows) {
                    const parsedRow = {
                        ...row,
                        glossary: typeof row.glossary === 'string' ? JSON.parse(row.glossary) : row.glossary
                    };
                    
                    if (!rowsMap.has(row.term)) rowsMap.set(row.term, []);
                    rowsMap.get(row.term).push(parsedRow);
                    
                    if (row.reading && row.reading !== row.term) {
                        if (!rowsMap.has(row.reading)) rowsMap.set(row.reading, []);
                        rowsMap.get(row.reading).push(parsedRow);
                    }
                }

                for (const cand of searchCandidates) {
                    const foundRows = rowsMap.get(cand.text) || [];

                    foundRows.forEach(row => {
                        matches.push({
                            entry: [
                                row.term,
                                row.reading,
                                row.definition_tags || '',
                                row.deinflection_rules || '',
                                row.score || 0,
                                row.glossary,
                                row.sequence || 0,
                                row.entry_tags || ''
                            ],
                            cand
                        });
                    });
                }
            } catch (error) {
                console.error('Error buscando términos en SQL:', error);
            }
        }

        // =====================================================
        // 4. Ranking original (Optimizado para longitud)
        // =====================================================

        const typePriority = {
            combined: 4,
            exact: 3,
            deinflected: 2,
            prefix: 1,
            'deinflected-combined': 4
        };

        matches.sort((a, b) => {
            // 1. Prioridad por longitud del término (más largo primero)
            const lenA = a.entry[0].length;
            const lenB = b.entry[0].length;
            if (lenA !== lenB) {
                return lenB - lenA;
            }

            // 2. Prioridad por tipo de coincidencia
            const pA = typePriority[a.cand.type] || 0;
            const pB = typePriority[b.cand.type] || 0;
            if (pA !== pB) {
                return pB - pA;
            }

            // 3. Prioridad por popularidad (score)
            return (b.entry[4] || 0) - (a.entry[4] || 0);
        });

        // =====================================================
        // 5. Dedup original
        // =====================================================

        const unique = [];
        const seen = new Set();

        for (const m of matches) {
            // 🚀 Key más ligera para el Set
            const key = `${m.entry[0]}-${m.entry[1]}-${m.entry[6]}`;

            if (!seen.has(key)) {
                unique.push(m);
                seen.add(key);
            }
        }

        return unique;
    }

    renderEntry() {
        return 'RN should use custom components for rendering';
    }
}