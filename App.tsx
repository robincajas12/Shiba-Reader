import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/ThemeContext';
import { bootstrapDatabase } from './src/utils/dbBootstrap';
import { dbEngine } from './src/db/engine';

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Iniciando...');

  useEffect(() => {
    const initialize = async () => {
      try {
        // 1. Descomprimir la base de datos si es la primera vez
        await bootstrapDatabase((msg) => setLoadingMessage(msg));
        
        // 2. Asegurar que todas las tablas existan (por si el ZIP solo trae term_bank)
        setLoadingMessage('Configurando tablas...');
        await dbEngine.createTables();
        
        setIsReady(true);
      } catch (error) {
        console.error('Error durante la inicialización:', error);
        setLoadingMessage('Error al cargar la base de datos.');
      }
    };

    initialize();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>{loadingMessage}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
});

export default App;
