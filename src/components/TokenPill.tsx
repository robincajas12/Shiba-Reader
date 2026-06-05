import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Theme } from '../theme';

interface TokenPillProps {
  text: string;
  onPress: () => void;
}

export const TokenPill: React.FC<TokenPillProps> = ({ text, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.pill} activeOpacity={0.7}>
    <Text style={styles.pillText}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  pill: { 
    backgroundColor: Theme.colors.card,
    paddingHorizontal: 12, 
    paddingVertical: 7, 
    margin: 3, 
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  } as ViewStyle,
  pillText: { fontSize: 15, color: Theme.colors.text, fontWeight: '600' } as TextStyle,
});
