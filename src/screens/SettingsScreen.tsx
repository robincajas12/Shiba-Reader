import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDatabaseSeeding } from '../hooks/useDatabaseSeeding';
import { useDictionaryImport } from '../hooks/useDictionaryImport';
import { Theme } from '../theme';

export const SettingsScreen: React.FC = () => {
  const { 
    loadingSeeding, 
    handleVerifyDatabase 
  } = useDatabaseSeeding();

  const {
    importFromZip,
    isImporting,
    progress
  } = useDictionaryImport();

  const isLoading = loadingSeeding || isImporting;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mantenimiento de Datos</Text>
        <Text style={styles.sectionDescription}>
          Importa diccionarios en formato ZIP (Yomitan/Jitendex) desde el almacenamiento de tu dispositivo.
        </Text>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Theme.colors.accent} />
            <Text style={styles.loadingText}>{progress || 'Procesando... Por favor espera.'}</Text>
          </View>
        ) : (
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={importFromZip}
            >
              <Text style={styles.primaryButtonText}>Importar Diccionario (.zip)</Text>
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
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.xl,
    color: Theme.colors.header,
  },
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.header,
    marginBottom: Theme.spacing.sm,
  },
  sectionDescription: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginBottom: Theme.spacing.lg,
    lineHeight: 20,
  },
  buttonGroup: {
    gap: 12,
  },
  button: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: Theme.colors.text,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: Theme.colors.success,
    borderColor: Theme.colors.success,
  },
  primaryButtonText: {
    color: Theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  loadingText: {
    marginTop: Theme.spacing.sm,
    color: Theme.colors.textMuted,
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginBottom: 5,
  }
});
