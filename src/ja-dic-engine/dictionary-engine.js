/**
 * Jitendex Dictionary Engine
 * Maneja la lógica de búsqueda, caché y renderizado.
 */
class JitendexEngine {
    constructor(termIndex, dataPath = '') {
        this.termIndex = termIndex;
        this.dataPath = dataPath;
        this.cache = new Map();
        this.segmenter = typeof TinySegmenter !== 'undefined' ? new TinySegmenter() : null;
    }

    /**
     * Realiza una búsqueda avanzada (exacta + desinflexión + combinación)
     */
    async lookup(clickedWord, startIdx = 0, fullText = '') {
        const matches = [];
        const searchCandidates = [];
        
        // 1. Exacto y Desinflexiones
        if (typeof JapaneseDeinflector !== 'undefined') {
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

        // 2. Combinación con tokens siguientes (Merge)
        if (this.segmenter && fullText) {
            let combined = clickedWord;
            const remainingText = fullText.slice(startIdx + clickedWord.length);
            const nextTokens = this.segmenter.segment(remainingText).slice(0, 4);
            
            for (const nextT of nextTokens) {
                if (/[、。！？\s]/.test(nextT)) break;
                combined += nextT;
                
                if (typeof JapaneseDeinflector !== 'undefined') {
                    JapaneseDeinflector.deinflect(combined).forEach(d => {
                        searchCandidates.push({ 
                            text: d.text, 
                            type: d.text === combined ? 'combined' : 'deinflected-combined', 
                            original: combined,
                            info: d.rules[0]
                        });
                    });
                } else {
                    searchCandidates.push({ text: combined, type: 'combined', original: combined });
                }
            }
        }

        // 3. Ejecutar búsqueda en los archivos
        const fileIdsToFetch = new Map();
        for (const cand of searchCandidates) {
            const ids = this.termIndex[cand.text] || [];
            ids.forEach(id => {
                if (!fileIdsToFetch.has(id)) fileIdsToFetch.set(id, []);
                fileIdsToFetch.get(id).push(cand);
            });
        }

        const fetchPromises = Array.from(fileIdsToFetch.entries()).map(async ([fileId, candidates]) => {
            try {
                let data;
                if (this.cache.has(fileId)) data = this.cache.get(fileId);
                else {
                    const resp = await fetch(`${this.dataPath}term_bank_${fileId}.json`);
                    data = await resp.json();
                    this.cache.set(fileId, data);
                }
                
                for (const cand of candidates) {
                    const found = data.filter(e => e[0] === cand.text || e[1] === cand.text);
                    found.forEach(f => matches.push({ entry: f, cand: cand }));
                }
            } catch (e) {}
        });

        await Promise.all(fetchPromises);

        // 4. Ranking y Dedup
        const typePriority = { 'combined': 4, 'exact': 3, 'deinflected': 2, 'prefix': 1, 'deinflected-combined': 4 };
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

    /**
     * Convierte una entrada del diccionario a HTML
     */
    renderEntry(m) {
        const [term, reading, tags, rules, score, content] = m.entry;
        const cand = m.cand;
        const tagList = (tags || '').split(' ');
        
        let glossaryHtml = '';
        if (Array.isArray(content)) {
            glossaryHtml = content.map(c => this.renderStructured(c)).join('');
        }

        return `
            <div class="entry ${cand.type.includes('deinflected') ? 'secondary' : ''}">
                <div class="match-info">Match: ${cand.type}${cand.info ? ` (${cand.info})` : ''}</div>
                <div class="term-header">
                    <div class="term">${term}</div>
                    ${reading && reading !== term ? `<div class="reading">【${reading}】</div>` : ''}
                    ${tagList.map(t => t ? `<span class="tag ${t.toLowerCase()}">${t}</span>` : '').join('')}
                </div>
                <div class="glossary"><ul>${glossaryHtml}</ul></div>
            </div>
        `;
    }

    renderStructured(content) {
        if (!content) return '';
        if (typeof content === 'string') return `<li>${content}</li>`;
        if (content.type === 'structured-content') return this.renderStructured(content.content);
        if (Array.isArray(content)) return content.map(item => this.renderStructured(item)).join('');
        if (typeof content === 'object') {
            if (content.tag === 'li') return `<li>${this.renderStructured(content.content)}</li>`;
            if (content.content) return this.renderStructured(content.content);
            if (content.text) return `<li>${content.text}</li>`;
        }
        return '';
    }
}
