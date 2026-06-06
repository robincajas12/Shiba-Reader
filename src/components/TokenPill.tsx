import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../ThemeContext';

interface TokenPillProps {
  text: string;
  onPress: () => void;
}

export const TokenPill: React.FC<TokenPillProps> = ({ text, onPress }) => {
  const { theme } = useTheme();
  const dynamicStyles = styles(theme);
  
  return (
    <TouchableOpacity onPress={onPress} style={dynamicStyles.pill} activeOpacity={0.7}>
      <Text style={dynamicStyles.pillText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = (theme: any) => StyleSheet.create({
  pill: { 
    backgroundColor: theme.colors.card,
    paddingHorizontal: 12, 
    paddingVertical: 7, 
    margin: 3, 
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  } as ViewStyle,
  pillText: { fontSize: 15, color: theme.colors.text, fontWeight: '600' } as TextStyle,
});
