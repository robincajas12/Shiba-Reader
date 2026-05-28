import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';

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
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12, 
    paddingVertical: 7, 
    margin: 3, 
    borderRadius: 10,
  } as ViewStyle,
  pillText: { fontSize: 15, color: '#444', fontWeight: '600' } as TextStyle,
});
