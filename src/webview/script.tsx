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

    const style = document.createElement('style');
    style.innerHTML = '* { -webkit-touch-callout: none; -webkit-user-select: text; user-select: text; }';
    document.head.appendChild(style);

    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    }, false);

    document.addEventListener('click', (event) => {
        if (window.isScannerEnabled === false) return;
        if (event.target.closest('a') || event.target.closest('button')) return;

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

        let rect = { top: event.clientY, bottom: event.clientY, left: event.clientX, right: event.clientX, width: 0, height: 0 };
        try {
            const boundaryRange = range.cloneRange();
            boundaryRange.setStart(node, range.startOffset);
            boundaryRange.setEnd(node, Math.min(range.startOffset + 1, node.textContent.length));
            const clientRects = boundaryRange.getClientRects();
            if (clientRects && clientRects.length > 0) {
                rect = clientRects[0];
            } else {
                rect = boundaryRange.getBoundingClientRect();
            }
        } catch (e) {}

        if (result.sentence && window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(
                JSON.stringify({ 
                    type: 'CLICK', 
                    sentence: result.sentence,
                    charIndex: result.charIndex,
                    rectTop: rect.top,
                    rectBottom: rect.bottom,
                    rectLeft: rect.left,
                    rectRight: rect.right,
                    rectWidth: rect.width,
                    rectHeight: rect.height,
                    pageY: rect.top + window.scrollY,
                    pageX: rect.left + window.scrollX,
                    devicePixelRatio: window.devicePixelRatio || 1
                })
            );
        }
    });

    window.addEventListener('scroll', () => {
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SCROLL' }));
        }
    }, { passive: true });

    let selectionTimeout;
    document.addEventListener('selectionchange', () => {
        clearTimeout(selectionTimeout);
        selectionTimeout = setTimeout(() => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();

            if (!selectedText) {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECTION_CLEARED' }));
                }
                return;
            }

            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const node = range.startContainer;
                const parentElement = node.parentElement;
                if (!parentElement) return;

                let absoluteOffset = range.startOffset;
                const walker = document.createTreeWalker(parentElement, NodeFilter.SHOW_TEXT, null, false);
                while (walker.nextNode()) {
                    if (walker.currentNode === node) break;
                    absoluteOffset += walker.currentNode.textContent.length;
                }

                const fullText = parentElement.innerText || parentElement.textContent || '';
                const result = getSentenceFromText(fullText, absoluteOffset);
                const rect = range.getBoundingClientRect();

                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(
                        JSON.stringify({ 
                            type: 'SELECTION', 
                            text: selectedText,
                            sentence: result.sentence,
                            charIndex: result.charIndex,
                            rectTop: rect.top,
                            rectBottom: rect.bottom,
                            rectLeft: rect.left,
                            rectRight: rect.right,
                            rectWidth: rect.width,
                            rectHeight: rect.height,
                            pageY: rect.top + window.scrollY,
                            pageX: rect.left + window.scrollX,
                        })
                    );
                }
            }
        }, 150);
    });
})();
true;
`;

export default scriptJs;
