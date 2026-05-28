import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Button,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Utils & Types
import { lookupAtCharacterIndex, getTokens, lookupToken } from './src/dictionaryUtils';
import { LookupResult } from './src/types';

// Components
import { ResultsList } from './src/components/ResultsList';
import { TokenPill } from './src/components/TokenPill';
import {open} from '@op-engineering/op-sqlite';

const EXAMPLES = [
  "あそこはおなじＴシャツです",
  "明白な間違いをあげつらう",
  "あくどいやり方はあかん",
  "まるを描くのはおなじです"
];
export const db = open({
  name: 'ippodake.ringo.database.db',
});
const AppContent: React.FC = () => {
  useEffect(() => {
    db.execute('CREATE TABLE IF NOT EXISTS dictionary (id INTEGER PRIMARY KEY AUTOINCREMENT, word TEXT, reading TEXT, meaning TEXT);')
    db.execute('INSERT INTO dictionary (word, reading, meaning) VALUES (?, ?, ?)', ['あそこ', 'asoko', 'allí']);
    db.execute('INSERT INTO dictionary (word, reading, meaning) VALUES (?, ?, ?)', ['おなじ', 'onaji', 'igual']);
    db.execute('INSERT INTO dictionary (word, reading, meaning) VALUES (?, ?, ?)', ['Ｔシャツ', 'T-shatsu', 'camiseta']);
    db.execute('INSERT INTO dictionary (word, reading, meaning) VALUES (?, ?, ?)', ['明白', 'meihaku', 'claro']);
    db.execute('INSERT INTO dictionary (word, reading, meaning) VALUES (?, ?, ?)', ['間違い', 'machigai', 'error']);
    db.execute('INSERT INTO dictionary (word, reading, meaning) VALUES (?, ?, ?)', ['あげつらう', 'agetsurau', 'criticar']);
    db.execute('INSERT INTO dictionary (word, reading, meaning) VALUES (?, ?, ?)', ['あくどい', 'akudoi', 'malvado']);
  }
  , []);
  const [sentence, setSentence] = useState(EXAMPLES[0]);
  const [results, setResults] = useState<LookupResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeMethod, setActiveMethod] = useState<string>('');

  const handleCharPress = async (index: number) => {
    setLoading(true);
    setActiveMethod(`Índice ${index}: '${sentence[index]}'`);
    const data = await lookupAtCharacterIndex(sentence, index);
    setResults(data);
    setLoading(false);
  };

  const tokens = getTokens(sentence);
  const handleTokenPress = async (tokenIndex: number) => {
    setLoading(true);
    setActiveMethod(`Token: '${tokens[tokenIndex]}'`);
    const data = await lookupToken(tokens, tokenIndex);
    setResults(data);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
          <Text style={styles.title}>Jitendex Dict</Text>
          <Text style={styles.methodText}>{activeMethod || 'Toca para buscar'}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Selector de Oraciones */}
        <Button onPress={()=>{
          const data = db.execute('SELECT * FROM dictionary');
          console.log('Data from DB:', data);
        }} title="Mostrar Datos" />
        <View style={styles.selectorScroll}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {EXAMPLES.map((ex, i) => (
                    <TouchableOpacity 
                        key={i} 
                        onPress={() => { setSentence(ex); setResults([]); setActiveMethod(''); }}
                        style={[styles.selectorPill, sentence === ex && styles.selectorActive]}
                    >
                        <Text style={[styles.selectorText, sentence === ex && styles.selectorActiveText]}>Ejemplo {i+1}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

        {/* 1. Bloque de Texto Natural (Letra a letra) */}
        <View style={styles.section}>
            <Text style={styles.sectionLabel}>Búsqueda por Índice (Natural)</Text>
            <View style={styles.charContainer}>
                {sentence.split('').map((char, i) => (
                    <TouchableOpacity key={i} onPress={() => handleCharPress(i)}>
                        <Text style={styles.charText}>{char}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        {/* 2. Bloque de Tokens (Pills) */}
        <View style={styles.section}>
            <Text style={styles.sectionLabel}>Búsqueda por Token (Segmentado)</Text>
            <View style={styles.tokenContainer}>
                {tokens.map((token, i) => (
                    <TokenPill key={i} text={token} onPress={() => handleTokenPress(i)} />
                ))}
            </View>
        </View>

        {/* Resultados */}
        <View style={styles.resultsWrapper}>
            <ResultsList results={results} loading={loading} hasInput={true} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const App: React.FC = () => (
  <SafeAreaProvider>
    <AppContent />
  </SafeAreaProvider>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  methodText: { fontSize: 13, color: '#007AFF', marginTop: 4, fontWeight: '600' },
  
  selectorScroll: { paddingVertical: 15, paddingHorizontal: 15, backgroundColor: '#fcfcfc' },
  selectorPill: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#eee', marginRight: 10 },
  selectorActive: { backgroundColor: '#000' },
  selectorText: { fontSize: 12, fontWeight: 'bold', color: '#666' },
  selectorActiveText: { color: '#fff' },

  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  sectionLabel: { fontSize: 11, fontWeight: 'bold', color: '#999', marginBottom: 10, textTransform: 'uppercase' },
  
  charContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  charText: { fontSize: 26, fontWeight: '500', color: '#000' },
  
  tokenContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  resultsWrapper: { minHeight: 400 },
});

export default App;
