import React from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { TokenPill } from './TokenPill';
import { Theme } from '../theme';

interface SearchSectionProps {
  text: string;
  setText: (t: string) => void;
  tokens: string[];
  onTokenPress: (index: number) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({ 
  text = '', 
  setText = () => {}, 
  tokens = [], 
  onTokenPress = () => {} 
}) => {
  return (
    <View style={styles.topSection}>
      <View style={styles.brandRow}>
        <Text style={styles.logo}>Jitendex</Text>
        <View style={styles.divider} />
      </View>

      <TextInput
        style={styles.searchBox}
        multiline
        value={text}
        onChangeText={setText}
        placeholder="Introduce texto japonés..."
        placeholderTextColor={Theme.colors.textMuted}
      />

      <View style={styles.tokensWrapper}>
        {(tokens || []).map((token, i) => (
          <TokenPill
            key={i}
            text={token}
            onPress={() => onTokenPress(i)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topSection: { paddingHorizontal: Theme.spacing.lg, paddingTop: Theme.spacing.md },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Theme.spacing.md },
  logo: { fontSize: 24, fontWeight: '800', color: Theme.colors.header, marginRight: Theme.spacing.sm },
  divider: { flex: 1, height: 1, backgroundColor: Theme.colors.border },
  searchBox: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: 18,
    fontSize: 18,
    color: Theme.colors.text,
    minHeight: 90,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    fontFamily: Theme.fonts.serif,
  },
  tokensWrapper: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Theme.spacing.md, marginBottom: Theme.spacing.sm },
});
