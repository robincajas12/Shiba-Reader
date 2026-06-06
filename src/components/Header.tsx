import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../ThemeContext';

interface HeaderProps {
  loadingSeeding: boolean;
  onSeed: () => Promise<void>;
  onVerify: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({ loadingSeeding, onSeed, onVerify }) => {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const dynamicStyles = styles(theme);

  return (
    <View style={dynamicStyles.header}>
      <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
        <Text style={dynamicStyles.title}>Jitendex Kindle Reader</Text>
      </TouchableOpacity>
      
      <View style={dynamicStyles.headerButtons}>
        {loadingSeeding ? (
          <ActivityIndicator size="small" color={theme.colors.accent} style={{ marginRight: 10 }} />
        ) : (
          <>
            <TouchableOpacity 
              style={[dynamicStyles.navButton, { backgroundColor: theme.colors.success, marginRight: 8 }]} 
              onPress={onSeed}
            >
              <Text style={dynamicStyles.navButtonText}>Cargar DB</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.navButton, { backgroundColor: theme.colors.secondary }]} 
              onPress={onVerify}
            >
              <Text style={dynamicStyles.navButtonText}>Verificar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.navButton, { backgroundColor: theme.colors.accent, marginLeft: 8 }]} 
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={dynamicStyles.navButtonText}>⚙️</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = (theme: any) => StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    zIndex: 10
  },
  title: { fontSize: 16, fontWeight: 'bold', color: theme.colors.header, fontFamily: theme.fonts.serif },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.md,
  },
  navButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 12,
    fontWeight: 'bold'
  },
});
