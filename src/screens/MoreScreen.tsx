import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from '../navigation/AppNavigator';

// We'll need to define the type for navigation if we want type safety
type MoreScreenNavigationProp = NativeStackNavigationProp<any>;

export const MoreScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<MoreScreenNavigationProp>();

  const dynamicStyles = styles(theme);

  const menuItems = [
    {
      title: 'Search',
      icon: '🔍',
      description: 'Search terms in installed dictionaries.',
      onPress: () => navigation.navigate('Search'),
    },
    {
      title: 'Settings',
      icon: '⚙️',
      description: 'Configuration, themes, and dictionary management.',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <ScrollView style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>More Options</Text>
      
      <View style={dynamicStyles.grid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={dynamicStyles.menuItem}
            onPress={item.onPress}
          >
            <Text style={dynamicStyles.icon}>{item.icon}</Text>
            <View style={dynamicStyles.textContainer}>
              <Text style={dynamicStyles.itemTitle}>{item.title}</Text>
              <Text style={dynamicStyles.itemDescription}>{item.description}</Text>
            </View>
            <Text style={dynamicStyles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={dynamicStyles.footer}>
        <Text style={dynamicStyles.footerText}>Ringo Reader v0.1.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xl,
    color: theme.colors.header,
  },
  grid: {
    gap: theme.spacing.md,
  },
  menuItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 2,
    shadowColor: theme.colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  icon: {
    fontSize: 32,
    marginRight: theme.spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.header,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  arrow: {
    fontSize: 24,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.md,
  },
  footer: {
    marginTop: 50,
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  }
});
