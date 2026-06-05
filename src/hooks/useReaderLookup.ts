import { useState } from 'react';
import { Dimensions } from 'react-native';
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
      console.log("Mensaje recibido del WebView:", data);
      if (data.type === 'SCROLL') {
        if (popup.visible) setPopup(prev => ({ ...prev, visible: false }));
        return;
      }

      if (data.type === 'CLICK') {
        if (!isScannerEnabled) return;

        const { sentence, charIndex, x, y } = data;
        if (!sentence) return;

        const popupWidth = SCREEN_WIDTH * 0.88;
        let leftPos = x - popupWidth / 2;
        if (leftPos < 15) leftPos = 15;
        if (leftPos + popupWidth > SCREEN_WIDTH) leftPos = SCREEN_WIDTH - popupWidth - 15;

        const popupHeight = 220; 
        let topPos = y + 40; 
        
        if (topPos + popupHeight > SCREEN_HEIGHT - 60) {
          topPos = y - popupHeight - 20; 
        }

        setPopup({
          visible: true,
          top: topPos,
          left: leftPos
        });

        setLoading(true);
        const lookupData = await lookupAtCharacterIndex(sentence, charIndex);
        setResults(lookupData);
      }
    } catch (error) {
      console.error("Error al recibir mensaje del WebView:", error);
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => setPopup(prev => ({ ...prev, visible: false }));

  return {
    results,
    loading,
    popup,
    isScannerEnabled,
    toggleScanner,
    handleWebViewMessage,
    closePopup
  };
};
