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
      title: 'Kanji Hatchery',
      icon: '卵',
      description: 'Discover and hatch Kanji eggs as you read.',
      onPress: () => navigation.navigate('KanjiEgg'),
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
          <View style={dynamicStyles.adFreeIconContainer}>
            <Text style={dynamicStyles.adFreeIcon}>👑</Text>
          </View>
          <View style={dynamicStyles.adFreeTextContainer}>
            <Text style={dynamicStyles.adFreeTag}>SHIBA PRO MEMBER</Text>
            <Text style={dynamicStyles.adFreeTitle}>Ad-Free Version Active</Text>
            <Text style={dynamicStyles.adFreeSubtitle}>Thank you for supporting this independent project! ❤️</Text>
          </View>
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
            <Text style={dynamicStyles.premiumTitle}>Unlock Shiba Pro 👑</Text>
          </View>
          <Text style={dynamicStyles.premiumDescription}>
            Remove ads forever, speed up reading, and support independent development.
          </Text>
          <Text style={dynamicStyles.premiumArrow}>Learn more ›</Text>
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
    padding: 20,
    marginBottom: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.star, // Borde dorado
    shadowColor: theme.colors.star, // Sombra dorada
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  adFreeIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.star + '15', // Opacidad dorada del 8%
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.star + '40',
  },
  adFreeIcon: {
    fontSize: 22,
  },
  adFreeTextContainer: {
    flex: 1,
  },
  adFreeTag: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.colors.star, // Dorado brillante
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  adFreeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.header,
    marginBottom: 2,
  },
  adFreeSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 16,
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
