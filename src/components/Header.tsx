import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Theme } from '../theme';

interface HeaderProps {
  loadingSeeding: boolean;
  onSeed: () => Promise<void>;
  onVerify: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({ loadingSeeding, onSeed, onVerify }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.title}>Jitendex Kindle Reader</Text>
      </TouchableOpacity>
      
      <View style={styles.headerButtons}>
        {loadingSeeding ? (
          <ActivityIndicator size="small" color={Theme.colors.accent} style={{ marginRight: 10 }} />
        ) : (
          <>
            <TouchableOpacity 
              style={[styles.navButton, { backgroundColor: Theme.colors.success, marginRight: 8 }]} 
              onPress={onSeed}
            >
              <Text style={styles.navButtonText}>Cargar DB</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.navButton, { backgroundColor: Theme.colors.secondary }]} 
              onPress={onVerify}
            >
              <Text style={styles.navButtonText}>Verificar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.navButton, { backgroundColor: Theme.colors.accent, marginLeft: 8 }]} 
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.navButtonText}>⚙️</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    zIndex: 10
  },
  title: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.header, fontFamily: Theme.fonts.serif },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radius.md,
  },
  navButtonText: {
    color: Theme.colors.onPrimary,
    fontSize: 12,
    fontWeight: 'bold'
  },
});
