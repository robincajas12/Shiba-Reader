import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ImageBackground } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/ThemeContext';
import { bootstrapDatabase } from './src/utils/dbBootstrap';
import { dbEngine } from './src/db/engine';

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Starting...');

  useEffect(() => {
    const initialize = async () => {
      try {
        // 1. Descomprimir la base de datos si es la primera vez
        await bootstrapDatabase((msg) => setLoadingMessage(msg));
        
        // 2. Ensure all tables exist (in case the ZIP only contains term_bank)
        setLoadingMessage('Setting up tables...');
        await dbEngine.createTables();
        
        setIsReady(true);
      } catch (error) {
        console.error('Error during initialization:', error);
        setLoadingMessage('Failed to load the database.');
      }
    };

    initialize();
  }, []);

  if (!isReady) {
    return (
      <ImageBackground 
        source={require('./shiba_reading_book.png')} 
        style={styles.loadingBackground}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        
        <ActivityIndicator size="large" color="#FFCC00" />
        
        <View style={styles.textContainer}>
          <Text style={styles.loadingText}>{loadingMessage}</Text>
        </View>
      </ImageBackground>
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
  loadingBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFill as any,
    backgroundColor: 'rgba(10, 5, 25, 0.55)', // Ajustado para ver mejor el arte de fondo
  },
  textContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default App;
