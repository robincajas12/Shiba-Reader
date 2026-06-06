import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { StructuredContent } from './StructuredContent';
import { DictionaryEntry, LookupCandidate } from '../types';
import { useTheme } from '../ThemeContext';

interface EntryCardProps {
  entry: DictionaryEntry;
  cand: LookupCandidate;
  onToggleSense?: (id: string) => void;
  selectedSenseIds?: Set<string>;
}

export const EntryCard: React.FC<EntryCardProps> = React.memo(({ 
  entry, 
  cand, 
  onToggleSense,
  selectedSenseIds
}) => {
  const { theme } = useTheme();
  const [term, reading, tags, rules, , content] = entry;
  const tagList = (tags || '').split(' ').filter(Boolean);
  const dynamicStyles = styles(theme);

  return (
    <View style={dynamicStyles.card}>
      <View style={dynamicStyles.cardHeader}>
        <View style={dynamicStyles.termContainer}>
          <Text style={dynamicStyles.mainTerm}>{term}</Text>
          {reading && reading !== term && <Text style={dynamicStyles.reading}>{reading}</Text>}
        </View>
        
        <View style={dynamicStyles.headerActions}>
          <View style={[dynamicStyles.matchIndicator, cand.type === 'exact' ? dynamicStyles.matchExact : dynamicStyles.matchOther]}>
            <Text style={dynamicStyles.matchIndicatorText}>{cand.type.replace('-', ' ')}</Text>
          </View>
        </View>
      </View>

      <View style={dynamicStyles.tagsRow}>
        {tagList.map((tag, i) => (
          <View key={i} style={dynamicStyles.tagBadge}>
            <Text style={dynamicStyles.tagBadgeText}>{tag}</Text>
          </View>
        ))}
        {rules && rules.split(' ').map((rule, i) => (
          <View key={`r-${i}`} style={dynamicStyles.ruleBadge}>
            <Text style={dynamicStyles.ruleBadgeText}>{rule}</Text>
          </View>
        ))}
      </View>

      <View style={dynamicStyles.cardBody}>
        <StructuredContent 
          content={content} 
          onToggleSense={onToggleSense}
          selectedSenseIds={selectedSenseIds}
        />
      </View>
    </View>
  );
});

const styles = (theme: any) => StyleSheet.create({
  card: { 
    backgroundColor: theme.colors.card, 
    borderRadius: theme.radius.lg, 
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 2,
    shadowColor: theme.colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 5,
  } as ViewStyle,
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.sm } as ViewStyle,
  termContainer: { flex: 1 } as ViewStyle,
  mainTerm: { fontSize: 22, fontWeight: 'bold', color: theme.colors.header } as TextStyle,
  reading: { fontSize: 14, color: theme.colors.textMuted, marginTop: -2 } as TextStyle,
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  selectButton: {
    backgroundColor: theme.colors.border,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  } as ViewStyle,
  selectedButton: {
    backgroundColor: theme.colors.primary,
  } as ViewStyle,
  selectButtonText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  } as TextStyle,
  cardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.card, 
  } as ViewStyle,
  matchIndicator: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: theme.radius.sm } as ViewStyle,
  matchExact: { backgroundColor: theme.colors.primary } as ViewStyle,
  matchOther: { backgroundColor: theme.colors.secondary } as ViewStyle,
  matchIndicatorText: { color: theme.colors.background, fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase' } as TextStyle,
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.md } as ViewStyle,
  tagBadge: { backgroundColor: theme.colors.border, borderRadius: theme.radius.sm, paddingHorizontal: 6, paddingVertical: 2, marginRight: 5, marginBottom: 5 } as ViewStyle,
  tagBadgeText: { fontSize: 10, color: theme.colors.text, fontWeight: '700' } as TextStyle,
  ruleBadge: { backgroundColor: theme.colors.border, borderRadius: theme.radius.sm, paddingHorizontal: 6, paddingVertical: 2, marginRight: 5, marginBottom: 5 } as ViewStyle,
  ruleBadgeText: { fontSize: 10, color: theme.colors.accent, fontWeight: '700' } as TextStyle,
  cardBody: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.lg } as ViewStyle,
});
