const scriptJs = `
(function() {
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

        if (event.target.closest('a') || event.target.closest('button')) {
            return; 
        }

        const range = document.caretRangeFromPoint(event.clientX, event.clientY);
        if (!range) return;

        const node = range.startContainer;
        if (node.nodeType !== Node.TEXT_NODE) return;

        const parentElement = node.parentElement;
        if (!parentElement) return;

        event.preventDefault(); 

        const fullText = parentElement.innerText || parentElement.textContent || '';
        
        let absoluteOffset = range.startOffset;
        
        const walker = document.createTreeWalker(parentElement, NodeFilter.SHOW_TEXT, null, false);
        while (walker.nextNode()) {
            if (walker.currentNode === node) break;
            absoluteOffset += walker.currentNode.textContent.length;
        }

        const result = getSentenceFromText(fullText, absoluteOffset);

        // --- SOLUCIÓN AL POSICIONAMIENTO DEL POPUP ---
        // Creamos un rectángulo preciso alrededor del caracter exacto que se presionó.
        // Esto ignora dónde cayó el dedo físicamente y se enfoca en dónde está la letra en el Layout.
        let rect = { top: event.clientY, bottom: event.clientY, left: event.clientX, right: event.clientX, width: 0, height: 0 };
        try {
            const boundaryRange = range.cloneRange();
            // Tomamos el caracter del click y expandimos un espacio para calcular su caja geométrica
            boundaryRange.setStart(node, range.startOffset);
            boundaryRange.setEnd(node, Math.min(range.startOffset + 1, node.textContent.length));
            const clientRects = boundaryRange.getClientRects();
            if (clientRects && clientRects.length > 0) {
                rect = clientRects[0];
            } else {
                rect = boundaryRange.getBoundingClientRect();
            }
        } catch (e) {
            console.warn("No se pudo calcular el BoundingRect del texto, usando fallback del evento click.");
        }

        if (result.sentence && window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(
                JSON.stringify({ 
                    type: 'CLICK', 
                    sentence: result.sentence,
                    charIndex: result.charIndex,
                    
                    // Coordenadas corregidas basadas en la caja geométrica real de la palabra (Viewport)
                    rectTop: rect.top,
                    rectBottom: rect.bottom,
                    rectLeft: rect.left,
                    rectRight: rect.right,
                    rectWidth: rect.width,
                    rectHeight: rect.height,

                    // Coordenadas absolutas incluyendo el scroll de la página web (Útiles si tu popup calcula con scroll absolute)
                    pageY: rect.top + window.scrollY,
                    pageX: rect.left + window.scrollX,

                    // Factores de escala del dispositivo por si tu lado nativo de React Native necesita normalizar la densidad de píxeles
                    devicePixelRatio: window.devicePixelRatio || 1
                })
            );
        }
    });

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