const scriptJs = `
(function() {
    // Función optimizada para aislar oraciones cruzando nodos hermanos
    function getSentenceFromText(fullText, offsetInText) {
        const delimiters = /[。！？\\n]/; 

        let start = offsetInText;
        let end = offsetInText;

        while (start > 0 && !delimiters.test(fullText[start - 1])) {
            start--;
        }

        while (end < fullText.length && !delimiters.test(fullText[end])) {
            end++;
        }

        if (end < fullText.length && delimiters.test(fullText[end])) {
            end++;
        }

        const rawSentence = fullText.slice(start, end);
        let charIndexInSentence = offsetInText - start;

        const trimmedSentence = rawSentence.trimStart();
        const spacesRemovedAtStart = rawSentence.length - trimmedSentence.length;
        
        charIndexInSentence = charIndexInSentence - spacesRemovedAtStart;
        if (charIndexInSentence < 0) charIndexInSentence = 0;

        return {
            sentence: trimmedSentence.trimEnd(), 
            charIndex: charIndexInSentence
        };
    }

    document.addEventListener('click', (event) => {
        if (window.isScannerEnabled === false) return;

        // SOLUCIÓN BUG 1: Si el usuario clickea un enlace, respetamos la navegación nativa
        if (event.target.closest('a') || event.target.closest('button')) {
            return; 
        }

        const range = document.caretRangeFromPoint(event.clientX, event.clientY);
        if (!range) return;

        const node = range.startContainer;
        if (node.nodeType !== Node.TEXT_NODE) return;

        // SOLUCIÓN BUG 2: Para evitar oraciones cortadas por etiquetas HTML (b, span, etc.),
        // extraemos el texto completo del contenedor padre visible.
        const parentElement = node.parentElement;
        if (!parentElement) return;

        event.preventDefault(); 

        const fullText = parentElement.innerText || parentElement.textContent || '';
        
        // Calculamos el offset real absoluto del click sumando la longitud de los textos previos
        let absoluteOffset = range.startOffset;
        
        // Pequeño ajuste por si el contenedor tiene múltiples sub-nodos antes del actual
        const walker = document.createTreeWalker(parentElement, NodeFilter.SHOW_TEXT, null, false);
        while (walker.nextNode()) {
            if (walker.currentNode === node) break;
            absoluteOffset += walker.currentNode.textContent.length;
        }

        const result = getSentenceFromText(fullText, absoluteOffset);

        if (result.sentence && window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(
                JSON.stringify({ 
                    type: 'CLICK', 
                    sentence: result.sentence,
                    charIndex: result.charIndex,
                    // SOLUCIÓN BUG 3: Mandamos coordenadas completas para anclajes perfectos
                    clientX: event.clientX,
                    clientY: event.clientY,
                    pageX: event.pageX,
                    pageY: event.pageY
                })
            );
        }
    });

    // Control de scroll optimizado (Throttling pasivo)
    window.addEventListener('scroll', () => {
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(
                JSON.stringify({ type: 'SCROLL' })
            );
        }
    }, { passive: true });
})();
true;
`;

export default scriptJs;