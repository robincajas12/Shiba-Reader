import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useSettings } from '../hooks/useSettings';
import { useBilling } from '../hooks/useBilling';

const { width } = Dimensions.get('window');

export const PremiumScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isAdFree, setIsAdFree } = useSettings();
  const { buyRemoveAds, restorePurchases, isPurchasing } = useBilling(isAdFree, setIsAdFree);

  const dynamicStyles = styles(theme);

  return (
    <ScrollView style={dynamicStyles.container} contentContainerStyle={dynamicStyles.contentContainer}>
      {/* HEADER DE BIENVENIDA */}
      <View style={dynamicStyles.headerSection}>
        <Text style={dynamicStyles.logoEmoji}>🐕✨</Text>
        <Text style={dynamicStyles.title}>Shiba Reader Pro</Text>
        <Text style={dynamicStyles.subtitle}>La mejor experiencia para leer japonés en móvil</Text>
      </View>

      {/* ESTADO SI YA ES PREMIUM */}
      {isAdFree ? (
        <View style={dynamicStyles.celebrationCard}>
          <Text style={dynamicStyles.celebrationEmoji}>🎉</Text>
          <Text style={dynamicStyles.celebrationTitle}>¡Ya eres miembro Pro!</Text>
          <Text style={dynamicStyles.celebrationText}>
            Muchísimas gracias por apoyar el desarrollo de Shiba Reader. Disfrutas de la versión completa libre de publicidad y con el mejor rendimiento disponible.
          </Text>
          
          <TouchableOpacity 
            style={dynamicStyles.restoreButton}
            onPress={async () => {
              const restored = await restorePurchases();
              Alert.alert(
                restored ? '¡Excelente!' : 'Aviso',
                restored ? '¡Compra restaurada con éxito!' : 'No se encontraron compras anteriores para esta cuenta.'
              );
            }}
          >
            <Text style={dynamicStyles.restoreButtonText}>Restaurar Compra (Sincronizar)</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={dynamicStyles.offerContainer}>
          {/* BENEFICIOS DESTACADOS */}
          <Text style={dynamicStyles.sectionHeading}>¿Por qué pasarse a Pro?</Text>
          
          <View style={dynamicStyles.benefitCard}>
            <View style={dynamicStyles.benefitItem}>
              <View style={[dynamicStyles.iconContainer, { backgroundColor: theme.colors.error + '1A' }]}>
                <Text style={[dynamicStyles.benefitIcon, { color: theme.colors.error }]}>🚫</Text>
              </View>
              <View style={dynamicStyles.benefitTextContent}>
                <Text style={dynamicStyles.benefitTitle}>Lectura sin publicidad</Text>
                <Text style={dynamicStyles.benefitDescription}>
                  Elimina todos los anuncios de banner. Concéntrate por completo en tus textos, manga y diccionarios sin distracciones visuales.
                </Text>
              </View>
            </View>

            <View style={dynamicStyles.benefitItem}>
              <View style={[dynamicStyles.iconContainer, { backgroundColor: theme.colors.accent + '1A' }]}>
                <Text style={[dynamicStyles.benefitIcon, { color: theme.colors.accent }]}>⚡</Text>
              </View>
              <View style={dynamicStyles.benefitTextContent}>
                <Text style={dynamicStyles.benefitTitle}>Carga Ultra Rápida</Text>
                <Text style={dynamicStyles.benefitDescription}>
                  Al remover scripts externos de anuncios de Google, las páginas del navegador integrado se cargan hasta un 40% más rápido.
                </Text>
              </View>
            </View>

            <View style={dynamicStyles.benefitItem}>
              <View style={[dynamicStyles.iconContainer, { backgroundColor: '#4FD1C51A' }]}>
                <Text style={[dynamicStyles.benefitIcon, { color: '#4FD1C5' }]}>🔋</Text>
              </View>
              <View style={dynamicStyles.benefitTextContent}>
                <Text style={dynamicStyles.benefitTitle}>Menor Consumo de Recursos</Text>
                <Text style={dynamicStyles.benefitDescription}>
                  Ahorra datos móviles y extiende la vida de tu batería al bloquear las conexiones continuas de servidores de publicidad.
                </Text>
              </View>
            </View>

            <View style={dynamicStyles.benefitItem}>
              <View style={[dynamicStyles.iconContainer, { backgroundColor: theme.colors.star + '1A' }]}>
                <Text style={[dynamicStyles.benefitIcon, { color: theme.colors.star }]}>💖</Text>
              </View>
              <View style={dynamicStyles.benefitTextContent}>
                <Text style={dynamicStyles.benefitTitle}>Apoya al Creador</Text>
                <Text style={dynamicStyles.benefitDescription}>
                  Shiba Reader es un proyecto independiente. Tu compra financia directamente la incorporación de nuevas herramientas para aprender japonés.
                </Text>
              </View>
            </View>
          </View>

          {/* CAJA DE PRECIO Y COMPRA */}
          <View style={dynamicStyles.pricingCard}>
            <Text style={dynamicStyles.pricingHeader}>ACCESO ILIMITADO</Text>
            <View style={dynamicStyles.pricingRow}>
              <Text style={dynamicStyles.priceStrike}>$4.99</Text>
              <Text style={dynamicStyles.priceActive}>$1.99 USD</Text>
            </View>
            <Text style={dynamicStyles.pricingSubText}>Pago único para siempre · Sin suscripciones</Text>

            {isPurchasing ? (
              <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginVertical: 12 }} />
            ) : (
              <View style={dynamicStyles.actionGroup}>
                <TouchableOpacity 
                  style={dynamicStyles.buyButton}
                  onPress={buyRemoveAds}
                  activeOpacity={0.85}
                >
                  <Text style={dynamicStyles.buyButtonText}>Desbloquear Shiba Pro</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={dynamicStyles.restoreButton}
                  onPress={async () => {
                    const restored = await restorePurchases();
                    Alert.alert(
                      restored ? '¡Excelente!' : 'Aviso',
                      restored ? '¡Compra restaurada con éxito!' : 'No se encontraron compras anteriores para esta cuenta.'
                    );
                  }}
                >
                  <Text style={dynamicStyles.restoreButtonText}>Restaurar Compra Anterior</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* INFO EXTRA / SEGURIDAD */}
      <View style={dynamicStyles.safetyNotice}>
        <Text style={dynamicStyles.safetyText}>🛡️ Compra segura procesada a través de Google Play Store / App Store.</Text>
        <Text style={dynamicStyles.safetyText}>🔄 Tu licencia queda vinculada permanentemente a tu cuenta de Google o Apple.</Text>
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
    paddingBottom: 50,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 25,
  },
  logoEmoji: {
    fontSize: 50,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.header,
    fontFamily: theme.fonts.serif,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  celebrationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.success,
    elevation: 3,
    shadowColor: theme.colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginVertical: 10,
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.header,
    marginBottom: 12,
  },
  celebrationText: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  offerContainer: {
    width: '100%',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  benefitCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 20,
    marginBottom: 25,
    elevation: 2,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitIcon: {
    fontSize: 18,
  },
  benefitTextContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 17,
  },
  pricingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: 24,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    alignItems: 'center',
    elevation: 4,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    marginBottom: 25,
  },
  pricingHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.accent,
    letterSpacing: 2,
    marginBottom: 6,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceStrike: {
    fontSize: 18,
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  priceActive: {
    fontSize: 36,
    fontWeight: '900',
    color: theme.colors.header,
  },
  pricingSubText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    marginBottom: 20,
  },
  actionGroup: {
    width: '100%',
    gap: 12,
  },
  buyButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.lg,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buyButtonText: {
    color: theme.colors.background,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  restoreButtonText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  safetyNotice: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },
  safetyText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
