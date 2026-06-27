import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { dbEngine } from '../db/engine';
import { KanjiEggEntry } from '../db/schemas/KanjiEgg';

export const useKanjiEggs = () => {
    const [eggs, setEggs] = useState<KanjiEggEntry[]>([]);
    const [stats, setStats] = useState({ total: 0, eggs: 0, hatched: 0 });
    const kanjiEggRepo = dbEngine.getRepository('KanjiEggRepository');

    // Extrae los kanji de un texto
    const extractKanji = (text: string): string[] => {
        const matches = text.match(/[\u4e00-\u9faf]/g);
        return matches ? Array.from(new Set(matches)) : [];
    };

    const loadEggs = useCallback(async () => {
        try {
            const allEggs = await kanjiEggRepo.getAll();
            // Ordenar: huevos con más puntos primero, luego eclosionados más recientes
            const sorted = allEggs.sort((a, b) => {
                if (a.status === b.status) {
                    if (a.status === 'egg') {
                        return b.points - a.points; // más puntos primero
                    }
                    return (b.hatched_at || 0) - (a.hatched_at || 0); // eclosionados más recientes primero
                }
                return a.status === 'egg' ? -1 : 1; // huevos primero
            });
            setEggs(sorted);

            const s = await kanjiEggRepo.getStats();
            setStats(s);
        } catch (error) {
            console.error('Error loading kanji eggs:', error);
        }
    }, [kanjiEggRepo]);

    // Registrar o descubrir Kanji al hacer lookup (si es nuevo, crea huevo)
    const discoverKanji = useCallback(async (text: string): Promise<string[]> => {
        const kanjis = extractKanji(text);
        const newlyDiscovered: string[] = [];

        for (const kanji of kanjis) {
            const existing = await kanjiEggRepo.findByKanji(kanji);
            if (!existing) {
                const newEgg: KanjiEggEntry = {
                    kanji,
                    points: 0.0,
                    status: 'egg',
                    discovered_at: Date.now(),
                    hatched_at: null
                };
                await kanjiEggRepo.insert(newEgg);
                newlyDiscovered.push(kanji);
            }
        }
        
        if (newlyDiscovered.length > 0) {
            await loadEggs();
        }

        return newlyDiscovered;
    }, [kanjiEggRepo, loadEggs]);

    // Incrementar puntos a los kanji
    const addKanjiPoints = useCallback(async (text: string, pointsToAdd: number): Promise<{ hatchedList: string[]; pointsMap: { [key: string]: number } }> => {
        const kanjis = extractKanji(text);
        const hatchedList: string[] = [];
        const pointsMap: { [key: string]: number } = {};

        for (const kanji of kanjis) {
            const existing = await kanjiEggRepo.findByKanji(kanji);
            if (!existing) {
                // Si no existía, lo descubrimos con los puntos que se añaden
                const isHatched = pointsToAdd >= 5.0;
                const newEgg: KanjiEggEntry = {
                    kanji,
                    points: pointsToAdd,
                    status: isHatched ? 'hatched' : 'egg',
                    discovered_at: Date.now(),
                    hatched_at: isHatched ? Date.now() : null
                };
                await kanjiEggRepo.insert(newEgg);
                pointsMap[kanji] = pointsToAdd;
                if (isHatched) {
                    hatchedList.push(kanji);
                }
            } else {
                const newPoints = Math.min(existing.points + pointsToAdd, 100); // Límite arbitrario de 100 puntos
                let newStatus = existing.status;
                let hatchedAt = existing.hatched_at;

                if (existing.status === 'egg' && newPoints >= 5.0) {
                    newStatus = 'hatched';
                    hatchedAt = Date.now();
                    hatchedList.push(kanji);
                }

                await kanjiEggRepo.updatePoints(kanji, newPoints, newStatus, hatchedAt);
                pointsMap[kanji] = newPoints;
            }
        }

        if (kanjis.length > 0) {
            await loadEggs();
        }

        // Si algún huevo eclosiona, mostramos una alerta de celebración
        if (hatchedList.length > 0) {
            Alert.alert(
                '¡Eclosión de Kanji! 🥚✨',
                `¡Felicidades! Los siguientes kanjis han eclosionado de sus huevos: ${hatchedList.join(', ')}`
            );
        }

        return { hatchedList, pointsMap };
    }, [kanjiEggRepo, loadEggs]);

    return {
        eggs,
        stats,
        loadEggs,
        discoverKanji,
        addKanjiPoints,
        extractKanji
    };
};
