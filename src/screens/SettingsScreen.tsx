import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Switch } from 'react-native';
import { useDatabaseSeeding } from '../hooks/useDatabaseSeeding';
import { useDictionaryImport } from '../hooks/useDictionaryImport';
import { useVocabulary } from '../hooks/useVocabulary';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../ThemeContext';
import { Themes, ThemeName } from '../theme';

export const SettingsScreen: React.FC = () => {
  const { theme, themeName, setTheme } = useTheme();
  const { dailyGoal, setDailyGoal } = useVocabulary();
  const { searchByReading, setSearchByReading } = useSettings();
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

  const dynamicStyles = styles(theme);

  return (
    <ScrollView style={dynamicStyles.container} contentContainerStyle={dynamicStyles.contentContainer}>
      <Text style={dynamicStyles.title}>Configuración</Text>

      {/* GRUPO: LECTURA Y APRENDIZAJE */}
      <View style={dynamicStyles.group}>
        <Text style={dynamicStyles.groupLabel}>Lectura y Aprendizaje</Text>
        <View style={dynamicStyles.card}>
          <View style={dynamicStyles.settingItem}>
            <Text style={dynamicStyles.settingTitle}>Meta Diaria</Text>
            <Text style={dynamicStyles.settingDescription}>Palabras nuevas por día.</Text>
            <View style={dynamicStyles.goalInputContainer}>
              {[5, 10, 15, 20, 30].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    dynamicStyles.goalPreset,
                    dailyGoal === val && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                  ]}
                  onPress={() => setDailyGoal(val)}
                >
                  <Text style={[
                    dynamicStyles.goalPresetText,
                    dailyGoal === val && { color: theme.colors.white }
                  ]}>{val}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[dynamicStyles.settingItem, dynamicStyles.noBorder]}>
            <View style={dynamicStyles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={dynamicStyles.settingTitle}>Buscar por Lectura</Text>
                <Text style={dynamicStyles.settingDescription}>
                  Incluir hiragana/katakana en las búsquedas.
                </Text>
              </View>
              <Switch
                value={searchByReading}
                onValueChange={setSearchByReading}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>
          </View>
        </View>
      </View>

      {/* GRUPO: APARIENCIA */}
      <View style={dynamicStyles.group}>
        <Text style={dynamicStyles.groupLabel}>Apariencia</Text>
        <View style={dynamicStyles.card}>
          <View style={[dynamicStyles.settingItem, dynamicStyles.noBorder]}>
            <Text style={dynamicStyles.settingTitle}>Tema de la Aplicación</Text>
            <View style={dynamicStyles.themeGrid}>
              {(Object.keys(Themes) as ThemeName[]).map((name) => (
                <TouchableOpacity
                  key={name}
                  style={[
                    dynamicStyles.themeButton,
                    { backgroundColor: Themes[name].colors.surface },
                    themeName === name && { borderColor: theme.colors.accent, borderWidth: 2 }
                  ]}
                  onPress={() => setTheme(name)}
                >
                  <View style={[dynamicStyles.colorPreview, { backgroundColor: Themes[name].colors.primary }]} />
                  <Text style={[dynamicStyles.themeButtonText, { color: Themes[name].colors.text }]}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* GRUPO: MANTENIMIENTO */}
      <View style={dynamicStyles.group}>
        <Text style={dynamicStyles.groupLabel}>Datos y Diccionario</Text>
        <View style={dynamicStyles.card}>
          <View style={[dynamicStyles.settingItem, dynamicStyles.noBorder]}>
            {isLoading ? (
              <View style={dynamicStyles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.accent} />
                <Text style={dynamicStyles.loadingText}>{progress || 'Procesando...'}</Text>
              </View>
            ) : (
              <View style={dynamicStyles.buttonGroup}>
                <TouchableOpacity 
                  style={[dynamicStyles.button, dynamicStyles.primaryButton]} 
                  onPress={importFromZip}
                >
                  <Text style={dynamicStyles.primaryButtonText}>Importar Diccionario (.zip)</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={dynamicStyles.button} 
                  onPress={handleVerifyDatabase}
                >
                  <Text style={dynamicStyles.buttonText}>Verificar Estado DB</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* GRUPO: INFO */}
      <View style={dynamicStyles.group}>
        <Text style={dynamicStyles.groupLabel}>Información</Text>
        <View style={dynamicStyles.card}>
          <View style={[dynamicStyles.settingItem, dynamicStyles.noBorder]}>
            <Text style={dynamicStyles.infoText}>Shiba Reader v0.2.0</Text>
            <Text style={dynamicStyles.infoText}>Desarrollado para lectores de japonés.</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    color: theme.colors.header,
  },
  group: {
    marginBottom: 25,
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    elevation: 2, // Sombra suave en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 12,
    lineHeight: 18,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalInputContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  goalPreset: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  goalPresetText: {
    fontWeight: 'bold',
    color: theme.colors.text,
    fontSize: 13,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 5,
  },
  themeButton: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  colorPreview: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonGroup: {
    gap: 10,
  },
  button: {
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 10,
  },
  loadingText: {
    marginTop: 8,
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
});
