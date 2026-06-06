import { useMemo, useState } from 'react';
import { Dimensions, PixelRatio, Platform } from 'react-native';
import { lookupAtCharacterIndex } from '../dictionaryUtils';
import { LookupResult } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PopupState {
  visible: boolean;
  top: number;
  left: number;
}

export const useReaderLookup = () => {
  const [results, setResults] = useState<LookupResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [popup, setPopup] = useState<PopupState>({ visible: false, top: 0, left: 0 });
  const [isScannerEnabled, setIsScannerEnabled] = useState<boolean>(true);
  // 🛠️ ORDENAMIENTO POR LONGITUD DEL TÉRMINO (De mayor a menor)
  const sortedResults = useMemo<LookupResult[]>(() => {
    if (!results || results.length === 0) return [];

    // Creamos una copia con [...] porque .sort() muta el array original
    return [...results].sort((a, b) => {
      // Accedemos a la posición [0] de la tupla DictionaryEntry que representa el 'term'
      const lengthA = a.entry[0] ? a.entry[0].length : 0;
      const lengthB = b.entry[0] ? b.entry[0].length : 0;

      // Restamos B - A para que las strings más largas queden arriba del todo
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

  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'SCROLL') {
        if (popup.visible) setPopup(prev => ({ ...prev, visible: false }));
        return;
      }

      if (data.type === 'CLICK') {
        if (!isScannerEnabled) return;

        let { sentence, charIndex, rectTop, rectLeft, rectBottom } = data;
        if (!sentence) return;

        // 🚀 USAR COORDENADAS GEOMÉTRICAS (No del dedo)
        // Usamos el 'rectTop' y 'rectLeft' del caracter exacto detectado en el DOM.
        const x = rectLeft;
        const y = rectTop;

        const popupWidth = SCREEN_WIDTH * 0.88;
        const popupHeight = 220; 

        // Posicionamiento horizontal (Centrado sobre la palabra)
        let leftPos = x - popupWidth / 2;
        if (leftPos < 15) leftPos = 15;
        if (leftPos + popupWidth > SCREEN_WIDTH - 15) leftPos = SCREEN_WIDTH - popupWidth - 15;

        // Posicionamiento vertical (Detectar colisión abajo)
        // Por defecto, lo ponemos justo debajo de la palabra (usando rectBottom)
        let topPos = (rectBottom || y) + 10; 
        
        // Si no cabe abajo, lo tiramos ARRIBA de la palabra
        if (topPos + popupHeight > SCREEN_HEIGHT - 60) {
          topPos = y - popupHeight - 15; 
        }

        // Limpiar resultados anteriores y mostrar popup en modo carga
        setResults([]); 
        setLoading(true);
        setPopup({
          visible: true,
          top: topPos,
          left: leftPos
        });

        // 🚀 PASO 2: Hacer el lookup en segundo plano
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

  return {
    results: sortedResults,
    loading,
    popup,
    isScannerEnabled,
    toggleScanner,
    handleWebViewMessage,
    closePopup
  };
};
