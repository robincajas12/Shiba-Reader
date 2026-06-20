import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSettings } from '../hooks/useSettings';

type MoreScreenNavigationProp = NativeStackNavigationProp<any>;

export const MoreScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<MoreScreenNavigationProp>();
  const { isAdFree } = useSettings();

  const dynamicStyles = styles(theme);

  const menuItems = [
    {
      title: 'SRS Review',
      icon: '習',
      description: 'Review words you forgot while reading.',
      onPress: () => navigation.navigate('SRSReview'),
    },
    {
      title: 'Search',
      icon: '検',
      description: 'Search terms in installed dictionaries.',
      onPress: () => navigation.navigate('Search'),
    },
    {
      title: 'Settings',
      icon: '設',
      description: 'Configuration, themes, and dictionary management.',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      title: 'Legal & Credits',
      icon: '法',
      description: 'Dictionary licenses and original source credits.',
      onPress: () => navigation.navigate('Legal'),
    },
  ];

  return (
    <ScrollView style={dynamicStyles.container} contentContainerStyle={dynamicStyles.contentContainer}>
      <Text style={dynamicStyles.title}>More Options</Text>
      
      {/* BOTÓN PREMIUM DESTACADO (CTA A LA PANTALLA DE COMPRA) */}
      {isAdFree ? (
        <View style={dynamicStyles.adFreeBanner}>
          <Text style={dynamicStyles.adFreeBannerText}>✨ Shiba Reader Pro · Versión sin anuncios activa</Text>
        </View>
      ) : (
        <TouchableOpacity 
          style={dynamicStyles.premiumButton}
          onPress={() => navigation.navigate('Premium')}
          activeOpacity={0.85}
        >
          <View style={dynamicStyles.premiumHeader}>
            <View style={dynamicStyles.promoBadge}>
              <Text style={dynamicStyles.promoBadgeText}>PREMIUM</Text>
            </View>
            <Text style={dynamicStyles.premiumTitle}>Desbloquear Shiba Pro 👑</Text>
          </View>
          <Text style={dynamicStyles.premiumDescription}>
            Quita la publicidad para siempre, acelera las lecturas y apoya el proyecto.
          </Text>
          <Text style={dynamicStyles.premiumArrow}>Conocer más ›</Text>
        </TouchableOpacity>
      )}

      {/* RESTRICCIÓN DE OPCIONES ESTÁNDAR */}
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
        <Text style={dynamicStyles.footerText}>Shiba Reader v0.2.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xl,
    color: theme.colors.header,
  },
  premiumButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  adFreeBanner: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderLeftWidth: 4,
    borderColor: theme.colors.success,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adFreeBannerText: {
    color: theme.colors.success,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  promoBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  promoBadgeText: {
    color: theme.colors.background,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.header,
  },
  premiumDescription: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
    marginBottom: 8,
  },
  premiumArrow: {
    fontSize: 12,
    color: theme.colors.accent,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
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
    shadowOpacity: 0.05,
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
