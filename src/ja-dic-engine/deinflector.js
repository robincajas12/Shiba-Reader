/**
 * Japanese Deinflector Library (PRO)
 * Soporta recursividad y capas complejas de conjugación (Pasiva, Causativa, etc.)
 */
const JapaneseDeinflector = {
    rules: [
        // 1. Formas continuas / Progresivas
        { suffix: 'っている', replacement: 'る', type: 'v5' },
        { suffix: 'ている', replacement: 'る', type: 'v1' },
        { suffix: 'ていた', replacement: 'る', type: 'v1' },
        { suffix: 'て', replacement: 'る', type: 'v1' },
        { suffix: 'で', replacement: 'む', type: 'v5m' }, // んで -> む

        // 2. Voz Pasiva / Potencial (A-column + れる / られる)
        { suffix: 'まれる', replacement: 'む', type: 'v5m_passive' },
        { suffix: 'まれます', replacement: 'む', type: 'v5m_passive' },
        { suffix: 'かれる', replacement: 'く', type: 'v5k_passive' },
        { suffix: 'がれる', replacement: 'ぐ', type: 'v5g_passive' },
        { suffix: 'される', replacement: 'す', type: 'v5s_passive' },
        { suffix: 'たれる', replacement: 'つ', type: 'v5t_passive' },
        { suffix: 'なれる', replacement: 'ぬ', type: 'v5n_passive' },
        { suffix: 'ばれる', replacement: 'ぶ', type: 'v5b_passive' },
        { suffix: 'られる', replacement: 'る', type: 'v1_passive' },
        { suffix: 'れる', replacement: 'る', type: 'v5r_passive' },

        // 3. Causativa (A-column + せる / させる)
        { suffix: 'ませる', replacement: 'む', type: 'v5m_causative' },
        { suffix: 'させる', replacement: 'する', type: 'suru_causative' },
        { suffix: 'せる', replacement: 'る', type: 'v5r_causative' },

        // 4. Formas Pasadas / Te-form
        { suffix: 'った', replacement: 'る', type: 'v5r' },
        { suffix: 'った', replacement: 'う', type: 'v5u' },
        { suffix: 'って', replacement: 'る', type: 'v5r' },
        { suffix: 'って', replacement: 'う', type: 'v5u' },
        { suffix: 'いた', replacement: 'く', type: 'v5k' },
        { suffix: 'いて', replacement: 'く', type: 'v5k' },
        { suffix: 'んだ', replacement: 'む', type: 'v5m' },
        { suffix: 'んで', replacement: 'む', type: 'v5m' },

        // 5. Polite / Negativo
        { suffix: 'ました', replacement: 'る', type: 'verb' },
        { suffix: 'ます', replacement: 'る', type: 'verb' },
        { suffix: 'ない', replacement: 'る', type: 'verb' },
        { suffix: 'なかった', replacement: 'る', type: 'verb' },
    ],

    /**
     * deinflect: Ahora es RECURSIVO.
     * Si encuentra "書き込まれている", primero saca "書き込まれる" y luego "書き込む".
     */
    deinflect(word, depth = 0) {
        let results = [{ text: word, rules: [] }];
        
        // Evitamos bucles infinitos (máximo 3 capas de conjugación)
        if (depth > 3) return results;

        for (const rule of this.rules) {
            if (word.endsWith(rule.suffix)) {
                const base = word.slice(0, -rule.suffix.length) + rule.replacement;
                const ruleName = `${rule.suffix}→${rule.replacement}`;
                
                results.push({ text: base, rules: [ruleName] });

                // RECURSIÓN: Intentamos desinflexionar la palabra resultante
                const subResults = this.deinflect(base, depth + 1);
                subResults.forEach(sub => {
                    if (sub.text !== base) {
                        results.push({
                            text: sub.text,
                            rules: [ruleName, ...sub.rules]
                        });
                    }
                });
            }
        }

        // Eliminar duplicados
        const unique = [];
        const seen = new Set();
        results.forEach(r => {
            if (!seen.has(r.text)) {
                unique.push(r);
                seen.add(r.text);
            }
        });

        return unique;
    }
};

export default JapaneseDeinflector;
