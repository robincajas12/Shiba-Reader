import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView } from 'react-native';
import { EntryCard } from './EntryCard';
import { LookupResult } from '../types';
import { useTheme } from '../ThemeContext';

interface ResultsListProps {
  results: LookupResult[];
  loading: boolean;
  hasInput: boolean;
  selectedSenseIds: Set<string>;
  onToggleSense: (id: string) => void;
}

export const ResultsList: React.FC<ResultsListProps> = React.memo(({ 
  results, 
  loading, 
  hasInput, 
  selectedSenseIds,
  onToggleSense 
}) => {
  const { theme } = useTheme();
  const dynamicStyles = styles(theme);

  return (
    <View style={dynamicStyles.resultsContainer}>
      <View style={dynamicStyles.resultsMeta}>
        <Text style={dynamicStyles.resultsLabel}>DICCIONARIO</Text>
        {loading && <ActivityIndicator size="small" color={theme.colors.textMuted} />}
      </View>

      <View style={dynamicStyles.resultsScroll}>
        {loading && results.length === 0 && (
          <View style={dynamicStyles.emptyState}>
            <Text style={dynamicStyles.emptyStateText}>Buscando definición...</Text>
          </View>
        )}
        {!loading && results.length === 0 && (
          <View style={dynamicStyles.emptyState}>
            <Text style={dynamicStyles.emptyStateText}>
              {hasInput ? "Toca una palabra arriba para ver su significado" : "Escribe algo para empezar"}
            </Text>
          </View>
        )}
        {!loading && results.map((m, i) => (
          <EntryCard 
            key={i} 
            entry={m.entry} 
            cand={m.cand} 
            onToggleSense={onToggleSense}
            selectedSenseIds={selectedSenseIds}
          />
        ))}
      </View>
    </View>
  );
});


const styles = (theme: any) => StyleSheet.create({
  resultsContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 15,
  },
  resultsMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  resultsLabel: { fontSize: 11, fontWeight: 'bold', color: theme.colors.textMuted, letterSpacing: 1.5 },
  resultsScroll: { flex: 1 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyStateText: { fontSize: 14, color: theme.colors.secondary, fontWeight: '500', textAlign: 'center' },
});
