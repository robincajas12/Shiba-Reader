import { useMemo, useState, useRef } from 'react';
import { Dimensions, PixelRatio, Platform } from 'react-native';
import { lookupAtCharacterIndex, lookupWithForcedTerm } from '../dictionaryUtils';
import { LookupResult } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PopupState {
  visible: boolean;
  top: number;
  left: number;
  sentence?: string;
}

interface SelectionMenuState {
  visible: boolean;
  top: number;
  left: number;
  text: string;
  sentence: string;
  charIndex: number;
}

export const useReaderLookup = () => {
  const [results, setResults] = useState<LookupResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [popup, setPopup] = useState<PopupState>({ visible: false, top: 0, left: 0, sentence: '' });
  const [selectionMenu, setSelectionMenu] = useState<SelectionMenuState>({
    visible: false,
    top: 0,
    left: 0,
    text: '',
    sentence: '',
    charIndex: 0
  });
  const [isScannerEnabled, setIsScannerEnabled] = useState<boolean>(true);

  // 🚀 Guard para evitar búsquedas triples/redundantes (Debounce manual)
  const lastLookupTime = useRef(0);

  // 🛠️ ORDENAMIENTO POR LONGITUD DEL TÉRMINO (De mayor a menor)
  const sortedResults = useMemo<LookupResult[]>(() => {
    if (!results || results.length === 0) return [];

    return [...results].sort((a, b) => {
      const lengthA = a.entry[0] ? a.entry[0].length : 0;
      const lengthB = b.entry[0] ? b.entry[0].length : 0;
      return lengthB - lengthA;
    });
  }, [results]);

  const toggleScanner = () => {
    setIsScannerEnabled(prev => {
      if (prev && popup.visible) {
        setPopup(p => ({ ...p, visible: false }));
      }
      return !prev;
    });
  };

  const handleSelectionSearch = async () => {
    if (!selectionMenu.text) return;

    const { text, sentence, charIndex, top, left } = selectionMenu;

    // Posicionamiento del popup de diccionario (mismo que el click)
    const popupWidth = SCREEN_WIDTH * 0.88;
    const popupHeight = 220;

    let leftPos = left - popupWidth / 2;
    if (leftPos < 15) leftPos = 15;
    if (leftPos + popupWidth > SCREEN_WIDTH - 15) leftPos = SCREEN_WIDTH - popupWidth - 15;

    let topPos = top + 30; // Un poco debajo de la selección
    if (topPos + popupHeight > SCREEN_HEIGHT - 60) {
      topPos = top - popupHeight - 15;
    }

    setResults([]);
    setLoading(true);
    setPopup({
      visible: true,
      top: topPos,
      left: leftPos,
      sentence: sentence
    });

    try {
      const lookupData = await lookupWithForcedTerm(sentence, text, charIndex);
      setResults(lookupData);
    } catch (error) {
      console.error("Error en lookup por selección:", error);
    } finally {
      setLoading(false);
      setSelectionMenu(prev => ({ ...prev, visible: false }));
    }
  };

  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'SCROLL') {
        if (popup.visible) setPopup(prev => ({ ...prev, visible: false }));
        if (selectionMenu.visible) setSelectionMenu(prev => ({ ...prev, visible: false }));
        return;
      }

      if (data.type === 'SELECTION_CLEARED') {
        setSelectionMenu(prev => ({ ...prev, visible: false }));
        return;
      }

      if (data.type === 'SELECTION') {
        setSelectionMenu({
          visible: true,
          top: data.rectTop,
          left: data.rectLeft,
          text: data.text,
          sentence: data.sentence,
          charIndex: data.charIndex
        });
        return;
      }

      if (data.type === 'CLICK') {
        if (!isScannerEnabled) return;
        
        // Al hacer click, cerramos el menú de selección si estaba abierto
        if (selectionMenu.visible) setSelectionMenu(prev => ({ ...prev, visible: false }));

        // 🚀 EVITAR TRIPLE BÚSQUEDA: Si la última fue hace menos de 300ms, ignorar.
        const now = Date.now();
        if (now - lastLookupTime.current < 300) {
            console.log("Ignorando click duplicado");
            return;
        }
        lastLookupTime.current = now;

        let { sentence, charIndex, rectTop, rectLeft, rectBottom } = data;
        if (!sentence) return;

        const x = rectLeft;
        const y = rectTop;

        const popupWidth = SCREEN_WIDTH * 0.88;
        const popupHeight = 220; 

        let leftPos = x - popupWidth / 2;
        if (leftPos < 15) leftPos = 15;
        if (leftPos + popupWidth > SCREEN_WIDTH - 15) leftPos = SCREEN_WIDTH - popupWidth - 15;

        let topPos = (rectBottom || y) + 10; 
        
        if (topPos + popupHeight > SCREEN_HEIGHT - 60) {
          topPos = y - popupHeight - 15; 
        }

        setResults([]); 
        setLoading(true);
        setPopup({
          visible: true,
          top: topPos,
          left: leftPos,
          sentence: sentence
        });

        try {
          const lookupData = await lookupAtCharacterIndex(sentence, charIndex);
          setResults(lookupData);
        } catch (error) {
          console.error("Error en lookup:", error);
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Error al recibir mensaje del WebView:", error);
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => setPopup(prev => ({ ...prev, visible: false }));

  const hideSelectionMenu = () => setSelectionMenu(prev => ({ ...prev, visible: false }));

  return {
    results: sortedResults,
    loading,
    popup,
    selectionMenu,
    isScannerEnabled,
    toggleScanner,
    handleWebViewMessage,
    handleSelectionSearch,
    closePopup,
    hideSelectionMenu
  };
};
