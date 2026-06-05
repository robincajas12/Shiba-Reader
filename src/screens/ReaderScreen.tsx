import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';

// Components
import { Reader } from '../components/Reader';
import { DictionaryPopup } from '../components/DictionaryPopup';

// Hooks
import { useReaderLookup } from '../hooks/useReaderLookup';
import { useBrowser } from '../hooks/useBrowser';

type RootStackParamList = {
  Reader: { url: string };
};

type ReaderScreenRouteProp = RouteProp<RootStackParamList, 'Reader'>;

export const ReaderScreen: React.FC = () => {
  const route = useRoute<ReaderScreenRouteProp>();
  const navigation = useNavigation();
  const { addToHistory } = useBrowser();
  const targetUrl = route.params?.url || 'https://www3.nhk.or.jp/news/easy/';

  useEffect(() => {
    if (targetUrl) {
      addToHistory(targetUrl);
    }
  }, [targetUrl]);

  const { 
    results, 
    loading, 
    popup, 
    handleWebViewMessage, 
    closePopup 
  } = useReaderLookup();

  return (
    <View style={styles.container}>
      {/* Mini Browser Header */}
      <View style={styles.miniHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.urlDisplay}>
          <Text style={styles.urlText} numberOfLines={1}>{targetUrl}</Text>
        </View>
      </View>

      <View style={styles.mainContent}>
        <Reader 
          uri={targetUrl}
          onMessage={handleWebViewMessage}
        />

        <DictionaryPopup 
          visible={popup.visible}
          top={popup.top}
          left={popup.left}
          results={results}
          loading={loading}
          onClose={closePopup}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#161616' },
  miniHeader: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#1c1c1c',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#90cdf4',
    fontWeight: 'bold',
  },
  urlDisplay: {
    flex: 1,
    backgroundColor: '#252525',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  urlText: {
    fontSize: 12,
    color: '#8d8578',
  },
  mainContent: { 
    flex: 1, 
    position: 'relative' 
  },
});
