import React from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { TokenPill } from './TokenPill';
import { useTheme } from '../ThemeContext';

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
  const { theme } = useTheme();
  const dynamicStyles = styles(theme);

  return (
    <View style={dynamicStyles.topSection}>
      <View style={dynamicStyles.brandRow}>
        <Text style={dynamicStyles.logo}>Analyze your sentence</Text>
        <View style={dynamicStyles.divider} />
      </View>

      <TextInput
        style={dynamicStyles.searchBox}
        multiline
        value={text}
        onChangeText={setText}
        placeholder="Enter Japanese text..."
        placeholderTextColor={theme.colors.textMuted}
      />

      <View style={dynamicStyles.tokensWrapper}>
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

const styles = (theme: any) => StyleSheet.create({
  topSection: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md },
  logo: { fontSize: 24, fontWeight: '800', color: theme.colors.header, marginRight: theme.spacing.sm },
  divider: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  searchBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 18,
    fontSize: 18,
    color: theme.colors.text,
    minHeight: 90,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontFamily: theme.fonts.serif,
  },
  tokensWrapper: { flexDirection: 'row', flexWrap: 'wrap', marginTop: theme.spacing.md, marginBottom: theme.spacing.sm },
});
