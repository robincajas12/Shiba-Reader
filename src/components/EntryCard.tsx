import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { StructuredContent } from './StructuredContent';
import { DictionaryEntry, LookupCandidate } from '../types';

interface EntryCardProps {
  entry: DictionaryEntry;
  cand: LookupCandidate;
}

export const EntryCard: React.FC<EntryCardProps> = ({ entry, cand }) => {
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
};

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#252525', 
    borderRadius: 12, 
    marginBottom: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  } as ViewStyle,
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 } as ViewStyle,
  termContainer: { flex: 1 } as ViewStyle,
  mainTerm: { fontSize: 22, fontWeight: 'bold', color: '#e5dccb' } as TextStyle,
  reading: { fontSize: 14, color: '#8d8578', marginTop: -2 } as TextStyle,
  matchIndicator: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 } as ViewStyle,
  matchExact: { backgroundColor: '#c8c0b0' } as ViewStyle,
  matchOther: { backgroundColor: '#555' } as ViewStyle,
  matchIndicatorText: { color: '#161616', fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase' } as TextStyle,
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 } as ViewStyle,
  tagBadge: { backgroundColor: '#333', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginRight: 5, marginBottom: 5 } as ViewStyle,
  tagBadgeText: { fontSize: 10, color: '#c8c0b0', fontWeight: '700' } as TextStyle,
  ruleBadge: { backgroundColor: '#2d3748', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginRight: 5, marginBottom: 5 } as ViewStyle,
  ruleBadgeText: { fontSize: 10, color: '#90cdf4', fontWeight: '700' } as TextStyle,
  cardBody: { borderTopWidth: 1, borderTopColor: '#333', paddingTop: 12 } as ViewStyle,
});
