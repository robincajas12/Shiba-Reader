import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../ThemeContext';

export const AdBanner: React.FC = () => {
  const { isAdFree } = useSettings();
  const { theme } = useTheme();

  // Si el usuario compró la versión sin anuncios, no solicitamos ni renderizamos nada.
  if (isAdFree) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
      <BannerAd
        // ID de prueba oficial de Google AdMob para Banners en Android/iOS
        unitId={TestIds.BANNER}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={(error) => {
          console.warn('AdBanner failed to load:', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 5,
    borderTopWidth: 1,
  },
});
