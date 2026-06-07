export interface SRSReviewResult {
    interval: number;
    ease_factor: number;
    repetitions: number;
    next_review: number;
    card_type: number;
}

/**
 * Algoritmo SM-2 Simplificado
 * grades: 5 (Bien), 3 (Olvidé Lectura), 1 (Olvidé Todo)
 */
export const calculateNextReview = (
    currentInterval: number,
    currentEaseFactor: number,
    currentRepetitions: number,
    grade: number,
    currentCardType: number
): SRSReviewResult => {
    let interval: number;
    let easeFactor = currentEaseFactor;
    let repetitions = currentRepetitions;
    let cardType = currentCardType;

    if (grade >= 3) {
        // Acierto o fallo leve (Lectura)
        if (grade === 3) {
            // Falló lectura: Reiniciamos progreso pero mantenemos o bajamos a tipo Lectura
            repetitions = 0;
            interval = 1;
            cardType = 0; // Se convierte en tarjeta de lectura
        } else {
            // Acierto (Bien)
            if (repetitions === 0) {
                interval = 1;
            } else if (repetitions === 1) {
                interval = 6;
            } else {
                interval = Math.round(currentInterval * easeFactor);
            }
            repetitions++;
        }
    } else {
        // Fallo grave (Significado)
        repetitions = 0;
        interval = 1;
        cardType = 1; // Se convierte/mantiene en tarjeta normal
    }

    // Actualizar Ease Factor (Fórmula SM-2)
    // El factor de facilidad se ajusta según la calidad de la respuesta
    easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    // Calcular próxima fecha (ms)
    // Si falla (grade < 5), la próxima revisión es AHORA para que no desaparezca de la cola
    const nextReview = grade < 5 ? Date.now() : Date.now() + interval * 24 * 60 * 60 * 1000;

    return {
        interval,
        ease_factor: easeFactor,
        repetitions,
        next_review: nextReview,
        card_type: cardType
    };
};
