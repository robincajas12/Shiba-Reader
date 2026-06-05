import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import scriptJs from '../webview/script';

interface ReaderProps {
  uri: string;
  onMessage: (event: any) => void;
  isScannerEnabled?: boolean;
}

export const Reader: React.FC<ReaderProps> = ({ uri, onMessage, isScannerEnabled = true }) => {
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    const js = `window.isScannerEnabled = ${isScannerEnabled}; true;`;
    webViewRef.current?.injectJavaScript(js);
  }, [isScannerEnabled]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        javaScriptEnabled
        injectedJavaScript={scriptJs}
        source={{ uri }}
        onMessage={onMessage}
        style={{ flex: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    position: 'relative' 
  },
});
