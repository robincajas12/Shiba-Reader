import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export const SettingsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diccionario</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Administrar Diccionarios</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apariencia</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Modo Oscuro (Próximamente)</Text>
        </TouchableOpacity>
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
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  buttonText: {
    fontSize: 16,
    color: '#007AFF',
  },
});
