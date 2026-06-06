import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import scriptJs from '../webview/script';

interface ReaderProps {
  uri: string;
  onMessage: (event: any) => void;
  onNavigationStateChange?: (navState: any) => void;
  onLoadProgress?: (event: any) => void;
  isScannerEnabled?: boolean;
}

export interface ReaderRef {
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
}

export const Reader = forwardRef<ReaderRef, ReaderProps>(({ 
  uri, 
  onMessage, 
  onNavigationStateChange,
  onLoadProgress,
  isScannerEnabled = true 
}, ref) => {
  const webViewRef = useRef<WebView>(null);

  useImperativeHandle(ref, () => ({
    goBack: () => webViewRef.current?.goBack(),
    goForward: () => webViewRef.current?.goForward(),
    reload: () => webViewRef.current?.reload(),
  }));

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
        onNavigationStateChange={onNavigationStateChange}
        onLoadProgress={onLoadProgress}
        style={{ flex: 1 }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    position: 'relative' 
  },
});
