import React from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { TokenPill } from './TokenPill';

interface SearchSectionProps {
  text: string;
  setText: (t: string) => void;
  tokens: string[];
  onTokenPress: (index: number) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({ text, setText, tokens, onTokenPress }) => {
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
        placeholderTextColor="#AAA"
      />

      <View style={styles.tokensWrapper}>
        {tokens.map((token, i) => (
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
  topSection: { paddingHorizontal: 20, paddingTop: 15 },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  logo: { fontSize: 24, fontWeight: '800', color: '#000', marginRight: 10 },
  divider: { flex: 1, height: 1, backgroundColor: '#EEE' },
  searchBox: {
    backgroundColor: '#F8F8F8',
    borderRadius: 15,
    padding: 18,
    fontSize: 18,
    color: '#333',
    minHeight: 90,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  tokensWrapper: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 15, marginBottom: 10 },
});
