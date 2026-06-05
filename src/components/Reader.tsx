import React from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import scriptJs from '../webview/script';

interface ReaderProps {
  uri: string;
  onMessage: (event: any) => void;
}

export const Reader: React.FC<ReaderProps> = ({ uri, onMessage }) => {
  return (
    <View style={styles.container}>
      <WebView
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
