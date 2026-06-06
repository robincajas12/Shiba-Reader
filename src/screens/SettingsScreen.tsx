import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useDatabaseSeeding } from '../hooks/useDatabaseSeeding';
import { useDictionaryImport } from '../hooks/useDictionaryImport';
import { useVocabulary } from '../hooks/useVocabulary';
import { useTheme } from '../ThemeContext';
import { Themes, ThemeName } from '../theme';

export const SettingsScreen: React.FC = () => {
  const { theme, themeName, setTheme } = useTheme();
  const { dailyGoal, setDailyGoal } = useVocabulary();
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
    <ScrollView style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>Settings</Text>

      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Daily Goal</Text>
        <Text style={dynamicStyles.sectionDescription}>
          Set how many new words you want to learn each day.
        </Text>
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

      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>App Theme</Text>
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
      
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Data Maintenance</Text>
        <Text style={dynamicStyles.sectionDescription}>
          Import dictionaries in ZIP format (Yomitan/Jitendex) from your device storage.
        </Text>
        
        {isLoading ? (
          <View style={dynamicStyles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
            <Text style={dynamicStyles.loadingText}>{progress || 'Processing... Please wait.'}</Text>
          </View>
        ) : (
          <View style={dynamicStyles.buttonGroup}>
            <TouchableOpacity 
              style={[dynamicStyles.button, dynamicStyles.primaryButton]} 
              onPress={importFromZip}
            >
              <Text style={dynamicStyles.primaryButtonText}>Import Dictionary (.zip)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={dynamicStyles.button} 
              onPress={handleVerifyDatabase}
            >
              <Text style={dynamicStyles.buttonText}>Verify DB Status</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>About</Text>
        <Text style={dynamicStyles.infoText}>Ringo Reader v0.1.0</Text>
        <Text style={dynamicStyles.infoText}>Developed for Japanese readers.</Text>
      </View>
    </ScrollView>
  );
};

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xl,
    color: theme.colors.header,
  },
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.header,
    marginBottom: theme.spacing.md,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeButton: {
    width: '47%',
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
    gap: 12,
  },
  button: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 5,
  },
  goalInputContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  goalPreset: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  goalPresetText: {
    fontWeight: 'bold',
    color: theme.colors.text,
  }
});
