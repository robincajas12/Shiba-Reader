import React from 'react';
import { StyleSheet, View } from 'react-native';

// Components
import { Header } from '../components/Header';
import { Reader } from '../components/Reader';
import { DictionaryPopup } from '../components/DictionaryPopup';

// Hooks
import { useReaderLookup } from '../hooks/useReaderLookup';
import { useDatabaseSeeding } from '../hooks/useDatabaseSeeding';

export const ReaderScreen: React.FC = () => {
  const { 
    results, 
    loading, 
    popup, 
    handleWebViewMessage, 
    closePopup 
  } = useReaderLookup();

  const { 
    loadingSeeding, 
    handleSeedDatabase, 
    handleVerifyDatabase 
  } = useDatabaseSeeding();

  return (
    <View style={styles.container}>
      <Header 
        loadingSeeding={loadingSeeding}
        onSeed={handleSeedDatabase}
        onVerify={handleVerifyDatabase}
      />

      <View style={styles.mainContent}>
        <Reader 
          uri="https://github.com/robincajas12/robincajas12/blob/main/README.jp.md"
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
  container: { flex: 1, backgroundColor: '#fff' },
  mainContent: { 
    flex: 1, 
    position: 'relative' 
  },
});
