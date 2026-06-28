import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../ThemeContext';
import {useSettings} from '../hooks/useSettings';
import {useBilling} from '../hooks/useBilling';

export const PremiumScreen: React.FC = () => {
  const {theme} = useTheme();
  const {isAdFree, setIsAdFree} = useSettings();
  const {
    buyRemoveAds,
    restorePurchases,
    clearNotice,
    isPurchasing,
    isRestoring,
    localizedPrice,
    notice,
  } = useBilling(isAdFree, setIsAdFree);

  const navigation = useNavigation();
  const styles = createStyles(theme);
  const isBusy = isPurchasing || isRestoring;

  const handleBuy = () => {
    clearNotice();
    buyRemoveAds();
  };

  const handleRestore = () => {
    restorePurchases();
  };

  return (
    <ImageBackground
      source={require('../../shiba_reading_book.png')}
      style={styles.bg}
      resizeMode="cover">
      <View style={styles.overlay} />

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Close premium screen"
        style={styles.close}
        onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>X</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Shiba Reader Pro</Text>
          <Text style={styles.title}>Read without interruptions</Text>
          <Text style={styles.subtitle}>
            A one-time upgrade that removes ads and keeps the app focused.
          </Text>
        </View>

        {isAdFree ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pro is active</Text>
            <Text style={styles.cardText}>
              Your ad-free reading experience is already unlocked.
            </Text>

            {notice ? (
              <View style={[styles.notice, styles[notice.type]]}>
                <Text style={styles.noticeText}>{notice.message}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              disabled={isBusy}
              style={[styles.secondaryBtn, isBusy && styles.disabled]}
              onPress={handleRestore}>
              {isRestoring ? (
                <ActivityIndicator size="small" color="#94a3b8" />
              ) : (
                <Text style={styles.secondaryBtnText}>Restore purchases</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>What changes?</Text>

              <View style={styles.list}>
                <Text style={styles.item}>No ad breaks during reviews</Text>
                <Text style={styles.item}>Cleaner reading and lookup flow</Text>
                <Text style={styles.item}>Supports ongoing development</Text>
              </View>
            </View>

            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>ONE-TIME PURCHASE</Text>

              <View style={styles.priceRow}>
                {localizedPrice ? (
                  <Text style={styles.price}>{localizedPrice}</Text>
                ) : (
                  <>
                    <Text style={styles.price}>$1.99</Text>
                    <Text style={styles.currency}>USD</Text>
                  </>
                )}
              </View>

              <Text style={styles.small}>Lifetime access. No subscription.</Text>

              {notice ? (
                <View style={[styles.notice, styles[notice.type]]}>
                  <Text style={styles.noticeText}>{notice.message}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                disabled={isBusy}
                style={[styles.cta, isBusy && styles.disabled]}
                onPress={handleBuy}>
                {isPurchasing ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.ctaText}>Unlock Pro</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isBusy}
                style={styles.restoreBtn}
                onPress={handleRestore}>
                {isRestoring ? (
                  <ActivityIndicator size="small" color="#94a3b8" />
                ) : (
                  <Text style={styles.restore}>Restore purchase</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.secure}>Secure payment via store</Text>
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
      paddingTop: 86,
      paddingBottom: 40,
    },
    header: {
      marginBottom: 18,
    },
    kicker: {
      color: theme.colors.star,
      fontSize: 12,
      fontWeight: '800',
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    title: {
      color: '#fff',
      fontSize: 32,
      fontWeight: '900',
      lineHeight: 38,
    },
    subtitle: {
      color: '#cbd5e1',
      marginTop: 8,
      fontSize: 14,
      lineHeight: 20,
    },
    card: {
      backgroundColor: 'rgba(20,15,35,0.9)',
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
    },
    cardTitle: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 10,
    },
    cardText: {
      color: '#cbd5e1',
      fontSize: 13,
      lineHeight: 19,
    },
    list: {
      gap: 8,
    },
    item: {
      color: '#e2e8f0',
      fontSize: 13,
      lineHeight: 19,
    },
    priceCard: {
      backgroundColor: 'rgba(10,10,20,0.95)',
      padding: 18,
      borderRadius: 12,
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
    price: {
      fontSize: 30,
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
      marginBottom: 12,
    },
    notice: {
      marginTop: 12,
      marginBottom: 2,
      padding: 10,
      borderRadius: 10,
      borderWidth: 1,
    },
    success: {
      backgroundColor: 'rgba(34,197,94,0.12)',
      borderColor: 'rgba(34,197,94,0.35)',
    },
    error: {
      backgroundColor: 'rgba(248,113,113,0.12)',
      borderColor: 'rgba(248,113,113,0.35)',
    },
    info: {
      backgroundColor: 'rgba(148,163,184,0.14)',
      borderColor: 'rgba(148,163,184,0.32)',
    },
    noticeText: {
      color: '#e5e7eb',
      fontSize: 12,
      lineHeight: 17,
      textAlign: 'center',
    },
    cta: {
      marginTop: 14,
      minHeight: 48,
      backgroundColor: theme.colors.star,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaText: {
      fontWeight: '900',
      color: '#000',
      fontSize: 15,
    },
    disabled: {
      opacity: 0.65,
    },
    restoreBtn: {
      minHeight: 38,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 6,
    },
    restore: {
      textAlign: 'center',
      color: '#94a3b8',
      textDecorationLine: 'underline',
      fontSize: 12,
    },
    secure: {
      textAlign: 'center',
      fontSize: 10,
      color: '#64748b',
      marginTop: 4,
    },
    secondaryBtn: {
      marginTop: 14,
      minHeight: 36,
      alignSelf: 'flex-start',
      justifyContent: 'center',
    },
    secondaryBtnText: {
      color: '#94a3b8',
      textDecorationLine: 'underline',
      fontSize: 12,
    },
  });
