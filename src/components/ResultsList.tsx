import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView } from 'react-native';
import { EntryCard } from './EntryCard';
import { LookupResult } from '../types';
import { Theme } from '../theme';

interface ResultsListProps {
  results: LookupResult[];
  loading: boolean;
  hasInput: boolean;
}

export const ResultsList: React.FC<ResultsListProps> = ({ results, loading, hasInput }) => {
  return (
    <View style={styles.resultsContainer}>
      <View style={styles.resultsMeta}>
        <Text style={styles.resultsLabel}>DICCIONARIO</Text>
        {loading && <ActivityIndicator size="small" color={Theme.colors.textMuted} />}
      </View>

      <ScrollView
        style={styles.resultsScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!loading && results.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {hasInput ? "Toca una palabra arriba para ver su significado" : "Escribe algo para empezar"}
            </Text>
          </View>
        )}
        {!loading && results.map((m, i) => (
          <EntryCard key={i} entry={m.entry} cand={m.cand} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  resultsContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 15,
  },
  resultsMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  resultsLabel: { fontSize: 11, fontWeight: 'bold', color: Theme.colors.textMuted, letterSpacing: 1.5 },
  resultsScroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyStateText: { fontSize: 14, color: Theme.colors.secondary, fontWeight: '500', textAlign: 'center' },
});
