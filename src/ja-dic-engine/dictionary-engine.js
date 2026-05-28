/**
 * Jitendex Dictionary Engine
 * Maneja la lógica de búsqueda, caché y renderizado.
 */
import JapaneseDeinflector from './deinflector';

export class JitendexEngine {
    constructor(termIndex, dataPath = '') {
        this.termIndex = termIndex;
        this.dataPath = dataPath;
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
            
            // MÉTODO A: Basado en tokens (más preciso)
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

            // MÉTODO B: Basado en caracteres (más agresivo, para casos como T-shirt)
            // Probamos combinando hasta 7 caracteres adicionales
            let charCombined = clickedWord;
            for (let i = 0; i < Math.min(remainingText.length, 7); i++) {
                const nextChar = remainingText[i];
                if (/[、。！？\s]/.test(nextChar)) break;
                charCombined += nextChar;
                // Evitamos duplicados con el método A
                if (!searchCandidates.find(c => c.text === charCombined)) {
                    searchCandidates.push({ 
                        text: charCombined, 
                        type: 'combined-char', 
                        original: clickedWord 
                    });
                }
            }
        }

        // 3. Filtrar candidatos que existen en el índice
        const fileIdsToFetch = new Map();
        for (const cand of searchCandidates) {
            const ids = this.termIndex[cand.text] || [];
            ids.forEach(id => {
                if (!fileIdsToFetch.has(id)) fileIdsToFetch.set(id, []);
                fileIdsToFetch.get(id).push(cand);
            });
        }

        // 4. Ejecutar búsqueda en los archivos
        const fetchPromises = Array.from(fileIdsToFetch.entries()).map(async ([fileId, candidates]) => {
            try {
                let data;
                if (this.preloadedData) {
                    data = this.preloadedData;
                } else if (this.cache.has(fileId)) {
                    data = this.cache.get(fileId);
                } else {
                    const resp = await fetch(`${this.dataPath}term_bank_${fileId}.json`);
                    data = await resp.json();
                    this.cache.set(fileId, data);
                }
                
                if (data) {
                    for (const cand of candidates) {
                        const found = data.filter(e => e[0] === cand.text || e[1] === cand.text);
                        found.forEach(f => matches.push({ entry: f, cand: cand }));
                    }
                }
            } catch (e) {}
        });

        await Promise.all(fetchPromises);

        // 5. Ranking y Dedup
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
