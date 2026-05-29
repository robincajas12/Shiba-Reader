import React, { useMemo, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Button,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Utils & Types
import { lookupAtCharacterIndex, getTokens, lookupToken } from './src/dictionaryUtils';
import { LookupResult } from './src/types';

// Components
import { ResultsList } from './src/components/ResultsList';
import { TokenPill } from './src/components/TokenPill';
import db from './src/db/config';
import { dbEngine } from './src/db/engine';
import { TermBankEntry } from './src/db/schemas/Term';

// CARGAMOS EL ARCHIVO JSON DEL DICCIONARIO
const termBank1 = require('./dic/[JA-EN] jitendex-yomitan (2026-05-05)/term_bank_1.json');

const EXAMPLES = [
  "あそこはおなじＴシャツです",
  "明白な間違いをあげつらう",
  "あくどいやり方はあかん",
  "まるを描くのはおなじです"
];

const AppContent: React.FC = () => {
  // Obtenemos los repositorios de forma estrictamente tipada
  const termRepository = useMemo(() => dbEngine.getRepository('TermBankEntryRepository'), []);

  const [sentence, setSentence] = useState(EXAMPLES[0]);
  const [results, setResults] = useState<LookupResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSeeding, setLoadingSeeding] = useState<boolean>(false); // Estado para el botón de la base de datos
  const [activeMethod, setActiveMethod] = useState<string>('');

  // FUNCIÓN PARA LLENAR LA BASE DE DATOS
  const handleSeedDatabase = async () => {
    setLoadingSeeding(true);
    try {
      // 1. Validamos si ya existen datos para evitar duplicados accidentales
      const existingData = await termRepository.getAll();
      if (existingData && existingData.length > 0) {
        Alert.alert('Base de datos activa', `La base de datos ya contiene ${existingData.length} palabras. No es necesario volver a llenarla.`);
        setLoadingSeeding(false);
        return;
      }

      console.log('[DB] Iniciando la migración del JSON a SQLite...');
      
      // 2. Iteramos el array de Jitendex e insertamos fila por fila en SQL
      for (const entry of termBank1) {
        await termRepository.insert({
          id: 1,
          term: entry[0],
          reading: entry[1],
          definition_tags: entry[2] || '',
          deinflection_rules: entry[3] || '',
          score: entry[4] || 0,
          glossary: JSON.stringify(entry[5]), // Objeto estructurado guardado como string de texto plano
          sequence: entry[6] || 0,
          entry_tags: entry[7] || '',
          name: entry[0],
          age: 0
        } as TermBankEntry);
      }
      
      console.log('[DB] ¡Población masiva completada!');
      Alert.alert('Éxito', 'La base de datos se ha llenado con las palabras del diccionario correctamente.');
    } catch (error) {
      console.error('[DB] Error crítico al llenar la base de datos:', error);
      Alert.alert('Error', 'Hubo un fallo al migrar los datos a SQLite.');
    } finally {
      setLoadingSeeding(false);
    }
  };

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
        
        {/* PANEL DE CONTROL DE BASE DE DATOS */}
        <View style={styles.dbActionsContainer}>
          {loadingSeeding ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingText}>Escribiendo palabras en SQLite... No cierres la app</Text>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Button 
                  onPress={handleSeedDatabase} 
                  title="Llenar Base" 
                  color="#28a745" // Verde para indicar acción de carga
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button 
                  onPress={async () => {
                    const countData = await termRepository.getAll();
                    Alert.alert('Contador actual', `Total de palabras en term_bank: ${countData.length}`);
                  }} 
                  title="Verificar Total" 
                  color="#6c757d"
                />
              </View>
            </View>
          )}
        </View>

        {/* Selector de Oraciones */}
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
  
  // Estilos del panel de control SQLite
  dbActionsContainer: { padding: 15, backgroundColor: '#f8f9fa', borderBottomWidth: 1, borderBottomColor: '#e9ecef' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  loadingText: { marginLeft: 10, fontSize: 12, color: '#666', fontWeight: '500' },

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