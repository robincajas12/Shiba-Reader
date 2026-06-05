import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { StructuredContent } from './StructuredContent';
import { DictionaryEntry, LookupCandidate } from '../types';
import { Theme } from '../theme';

interface EntryCardProps {
  entry: DictionaryEntry;
  cand: LookupCandidate;
}

export const EntryCard: React.FC<EntryCardProps> = React.memo(({ entry, cand }) => {
  const [term, reading, tags, rules, , content] = entry;
  const tagList = (tags || '').split(' ').filter(Boolean);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.termContainer}>
          <Text style={styles.mainTerm}>{term}</Text>
          {reading && reading !== term && <Text style={styles.reading}>{reading}</Text>}
        </View>
        <View style={[styles.matchIndicator, cand.type === 'exact' ? styles.matchExact : styles.matchOther]}>
          <Text style={styles.matchIndicatorText}>{cand.type.replace('-', ' ')}</Text>
        </View>
      </View>

      <View style={styles.tagsRow}>
        {tagList.map((tag, i) => (
          <View key={i} style={styles.tagBadge}>
            <Text style={styles.tagBadgeText}>{tag}</Text>
          </View>
        ))}
        {rules && rules.split(' ').map((rule, i) => (
          <View key={`r-${i}`} style={styles.ruleBadge}>
            <Text style={styles.ruleBadgeText}>{rule}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cardBody}>
        <StructuredContent content={content} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { 
    backgroundColor: Theme.colors.card, 
    borderRadius: Theme.radius.lg, 
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    elevation: 2,
    shadowColor: Theme.colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 5,
  } as ViewStyle,
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Theme.spacing.sm } as ViewStyle,
  termContainer: { flex: 1 } as ViewStyle,
  mainTerm: { fontSize: 22, fontWeight: 'bold', color: Theme.colors.header } as TextStyle,
  reading: { fontSize: 14, color: Theme.colors.textMuted, marginTop: -2 } as TextStyle,
  matchIndicator: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Theme.radius.sm } as ViewStyle,
  matchExact: { backgroundColor: Theme.colors.primary } as ViewStyle,
  matchOther: { backgroundColor: Theme.colors.secondary } as ViewStyle,
  matchIndicatorText: { color: Theme.colors.background, fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase' } as TextStyle,
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Theme.spacing.md } as ViewStyle,
  tagBadge: { backgroundColor: Theme.colors.border, borderRadius: Theme.radius.sm, paddingHorizontal: 6, paddingVertical: 2, marginRight: 5, marginBottom: 5 } as ViewStyle,
  tagBadgeText: { fontSize: 10, color: Theme.colors.text, fontWeight: '700' } as TextStyle,
  ruleBadge: { backgroundColor: Theme.colors.border, borderRadius: Theme.radius.sm, paddingHorizontal: 6, paddingVertical: 2, marginRight: 5, marginBottom: 5 } as ViewStyle,
  ruleBadgeText: { fontSize: 10, color: Theme.colors.accent, fontWeight: '700' } as TextStyle,
  cardBody: { borderTopWidth: 1, borderTopColor: Theme.colors.border, paddingTop: Theme.spacing.lg } as ViewStyle,
});
