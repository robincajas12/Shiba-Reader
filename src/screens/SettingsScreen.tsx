import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDatabaseSeeding } from '../hooks/useDatabaseSeeding';

export const SettingsScreen: React.FC = () => {
  const { 
    loadingSeeding, 
    handleSeedDatabase, 
    handleVerifyDatabase 
  } = useDatabaseSeeding();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mantenimiento de Datos</Text>
        <Text style={styles.sectionDescription}>
          Si es la primera vez que usas la app, debes cargar el diccionario en la base de datos local.
        </Text>
        
        {loadingSeeding ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Cargando base de datos... Por favor espera.</Text>
          </View>
        ) : (
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={handleSeedDatabase}
            >
              <Text style={styles.primaryButtonText}>Cargar Diccionario (Seed)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleVerifyDatabase}
            >
              <Text style={styles.buttonText}>Verificar Estado de DB</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acerca de</Text>
        <Text style={styles.infoText}>Ringo Reader v0.1.0</Text>
        <Text style={styles.infoText}>Desarrollado para lectores de Japonés.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonGroup: {
    gap: 12,
  },
  button: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#28a745',
    borderColor: '#218838',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  }
});
