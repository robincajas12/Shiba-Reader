const scriptJs = `
(function() {
    function getSentenceFromText(text, offset) {
        const delimiters = /[。！？]/; 

        let start = offset;
        let end = offset;

        while (start > 0 && !delimiters.test(text[start - 1])) {
            start--;
        }

        while (end < text.length && !delimiters.test(text[end])) {
            end++;
        }

        if (end < text.length && delimiters.test(text[end])) {
            end++;
        }

        const rawSentence = text.slice(start, end);
        let charIndexInSentence = offset - start;

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
        event.preventDefault(); 

        const range = document.caretRangeFromPoint(event.clientX, event.clientY);
        if (!range) return;

        const node = range.startContainer;
        if (node.nodeType !== Node.TEXT_NODE) return;

        const text = node.textContent || '';
        const offset = range.startOffset;

        const result = getSentenceFromText(text, offset);

        if (result.sentence && window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(
                JSON.stringify({ 
                    type: 'CLICK', // Marcamos que es un click
                    sentence: result.sentence,
                    charIndex: result.charIndex,
                    x: event.clientX,
                    y: event.clientY
                })
            );
        }
    });

    // 🚀 ESTO LIBERA TU SCROLL: Avisa a la app que el usuario está moviendo la página
    window.addEventListener('scroll', () => {
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(
                JSON.stringify({ type: 'SCROLL' })
            );
        }
    });
})();
true;
`;

export default scriptJs;