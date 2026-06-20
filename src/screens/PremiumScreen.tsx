import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from 'react-native';
import { useTheme } from '../ThemeContext';
import { useSettings } from '../hooks/useSettings';
import { useBilling } from '../hooks/useBilling';
import { useNavigation } from '@react-navigation/native';

export const PremiumScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isAdFree, setIsAdFree } = useSettings();
  const { buyRemoveAds, restorePurchases, isPurchasing } =
    useBilling(isAdFree, setIsAdFree);

  const navigation = useNavigation();
  const styles = createStyles(theme);

  const handleRestore = async () => {
    const restored = await restorePurchases();
    Alert.alert(
      restored ? 'Success' : 'Notice',
      restored ? 'Purchase restored.' : 'No purchases found.'
    );
  };

  return (
    <ImageBackground
      source={require('../../shiba_reading_book.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      {/* Close */}
      <TouchableOpacity style={styles.close} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🐕👑</Text>
          <Text style={styles.title}>Shiba Reader Pro</Text>
          <Text style={styles.subtitle}>Clean reading, no distractions</Text>
        </View>

        {isAdFree ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>You are Pro</Text>
            <Text style={styles.cardText}>
              You already unlocked the ad-free experience.
            </Text>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleRestore}>
              <Text style={styles.secondaryBtnText}>Restore purchases</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* VALUE BLOCK */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Why upgrade?</Text>

              <View style={styles.list}>
                <Text style={styles.item}>✔ No ads</Text>
                <Text style={styles.item}>✔ Unlock all themes</Text>
                <Text style={styles.item}>✔ Supports development</Text>
              </View>
              <View style={styles.quoteBox}>
                <Text style={styles.quote}>
                  “Reading Japanese without interruptions feels completely different.”
                </Text>
                <Text style={styles.quoteAuthor}>— Shiba CTO 🐕</Text>
              </View>
            </View>

            {/* PRICE CARD */}
            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>ONE-TIME PURCHASE</Text>

              <View style={styles.priceRow}>
                {/*<Text style={styles.strike}>$4.99</Text>*/}
                <Text style={styles.price}>$1.99</Text>
                <Text style={styles.currency}>USD</Text>
              </View>

              <Text style={styles.small}>Lifetime access • No subscription</Text>

              {isPurchasing ? (
                <ActivityIndicator size="large" color={theme.colors.star} />
              ) : (
                <TouchableOpacity style={styles.cta} onPress={buyRemoveAds}>
                  <Text style={styles.ctaText}>Unlock Pro</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleRestore}>
                <Text style={styles.restore}>Restore purchase</Text>
              </TouchableOpacity>

              <Text style={styles.secure}>🔒 Secure payment via store</Text>
            </View>
          </>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    bg: {
      flex: 1,
    },
    overlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(10,5,25,0.72)',
    },

    close: {
      position: 'absolute',
      top: 50,
      right: 20,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    closeText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },

    container: {
      padding: 20,
      paddingTop: 70,
      paddingBottom: 40,
    },

    header: {
      alignItems: 'center',
      marginBottom: 20,
    },
    emoji: {
      fontSize: 50,
    },
    title: {
      fontSize: 28,
      fontWeight: '900',
      color: '#fff',
      marginTop: 6,
    },
    subtitle: {
      color: '#cbd5e1',
      marginTop: 4,
      textAlign: 'center',
    },

    card: {
      backgroundColor: 'rgba(20,15,35,0.9)',
      padding: 16,
      borderRadius: 16,
      marginBottom: 16,
    },

    cardTitle: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 10,
    },

    cardText: {
      color: '#cbd5e1',
      fontSize: 13,
    },

    list: {
      marginTop: 8,
      gap: 6,
    },

    item: {
      color: '#e2e8f0',
      fontSize: 13,
    },

    quoteBox: {
      marginTop: 12,
      padding: 10,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.accent,
    },

    quote: {
      color: '#e2e8f0',
      fontStyle: 'italic',
      fontSize: 12,
    },

    quoteAuthor: {
      color: theme.colors.accent,
      fontSize: 11,
      marginTop: 4,
      textAlign: 'right',
    },

    priceCard: {
      backgroundColor: 'rgba(10,10,20,0.95)',
      padding: 18,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
    },

    priceLabel: {
      color: theme.colors.star,
      fontSize: 11,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 10,
      letterSpacing: 1,
    },

    priceRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'baseline',
      gap: 8,
    },

    strike: {
      color: '#94a3b8',
      textDecorationLine: 'line-through',
    },

    price: {
      fontSize: 28,
      fontWeight: '900',
      color: '#fff',
    },

    currency: {
      color: '#cbd5e1',
      fontSize: 12,
    },

    small: {
      textAlign: 'center',
      color: '#94a3b8',
      fontSize: 11,
      marginTop: 6,
    },

    cta: {
      marginTop: 14,
      backgroundColor: theme.colors.star,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
    },

    ctaText: {
      fontWeight: '800',
      color: '#000',
      fontSize: 15,
    },

    restore: {
      textAlign: 'center',
      color: '#94a3b8',
      marginTop: 10,
      textDecorationLine: 'underline',
      fontSize: 12,
    },

    secure: {
      textAlign: 'center',
      fontSize: 10,
      color: '#64748b',
      marginTop: 8,
    },

    secondaryBtn: {
      marginTop: 10,
      alignSelf: 'flex-start',
    },

    secondaryBtnText: {
      color: '#94a3b8',
      textDecorationLine: 'underline',
      fontSize: 12,
    },
  });