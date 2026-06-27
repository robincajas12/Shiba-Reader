import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { useTheme } from '../ThemeContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useKanjiEggs } from '../hooks/useKanjiEggs';
import { KanjiEggEntry } from '../db/schemas/KanjiEgg';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const HORIZONTAL_PADDING = 16;
const CARD_MARGIN = 6;
const CARD_SIZE = (width - (HORIZONTAL_PADDING * 2) - (CARD_MARGIN * 2 * COLUMN_COUNT)) / COLUMN_COUNT;

export const KanjiEggScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { eggs, stats, loadEggs } = useKanjiEggs();
  const [activeFilter, setActiveFilter] = useState<'all' | 'egg' | 'hatched'>('all');
  const [selectedEgg, setSelectedEgg] = useState<KanjiEggEntry | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [visibleCount, setVisibleCount] = useState(30);
  const dynamicStyles = styles(theme);

  useFocusEffect(
    useCallback(() => {
      loadEggs();
    }, [loadEggs])
  );

  const filteredEggs = eggs.filter(egg => {
    if (activeFilter === 'all') return true;
    return egg.status === activeFilter;
  });

  const paginatedEggs = filteredEggs.slice(0, visibleCount);

  const handleFilterChange = (filter: 'all' | 'egg' | 'hatched') => {
    setActiveFilter(filter);
    setVisibleCount(30);
  };

  const handleLoadMore = () => {
    if (visibleCount < filteredEggs.length) {
      setVisibleCount(prev => prev + 30);
    }
  };

  const handleEggPress = (egg: KanjiEggEntry) => {
    setSelectedEgg(egg);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedEgg(null);
  };

  const renderEggItem = ({ item }: { item: KanjiEggEntry }) => {
    const isHatched = item.status === 'hatched';
    const progress = Math.min(item.points / 5.0, 1.0);

    return (
      <TouchableOpacity
        style={[
          dynamicStyles.eggCard,
          isHatched ? dynamicStyles.eggCardHatched : dynamicStyles.eggCardEgg
        ]}
        onPress={() => handleEggPress(item)}
        activeOpacity={0.9}
      >
        {isHatched ? (
          <View style={dynamicStyles.hatchedContainer}>
            <View style={dynamicStyles.sparkleBadge}>
              <Text style={dynamicStyles.sparkleText}>⭐</Text>
            </View>
            <View style={dynamicStyles.hatchedKanjiCircle}>
              <Text style={dynamicStyles.kanjiText}>{item.kanji}</Text>
            </View>
            <View style={dynamicStyles.hatchedRibbon}>
              <Text style={dynamicStyles.pointsText}>{item.points.toFixed(0)} pts</Text>
            </View>
          </View>
        ) : (
          <View style={dynamicStyles.eggContainer}>
            <Text style={dynamicStyles.eggIcon}>🥚</Text>
            <Text style={dynamicStyles.kanjiPlaceholder}>{item.kanji}</Text>
            <View style={dynamicStyles.progressWrapper}>
              <View style={dynamicStyles.progressBarBg}>
                <View style={[dynamicStyles.progressBarFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={dynamicStyles.progressText}>{item.points.toFixed(1)}/5</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={dynamicStyles.container}>
      {/* HEADER */}
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.headerTopRow}>
          <TouchableOpacity
            style={dynamicStyles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={dynamicStyles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <View style={dynamicStyles.headerTitleContainer}>
            <Text style={dynamicStyles.title}>Incubadora</Text>
            <Text style={dynamicStyles.titleEmoji}>🥚</Text>
          </View>
        </View>
        <Text style={dynamicStyles.subtitle}>
          ¡Descubre nuevos kanjis al leer y hazlos eclosionar minando palabras!
        </Text>
      </View>

      {/* STATS BOARD */}
      <View style={dynamicStyles.statsBoard}>
        <View style={[dynamicStyles.statBox, { backgroundColor: theme.colors.accent + '10' }]}>
          <Text style={dynamicStyles.statEmoji}>🐣</Text>
          <Text style={[dynamicStyles.statNumber, { color: theme.colors.accent }]}>{stats.hatched}</Text>
          <Text style={dynamicStyles.statLabel}>Listos</Text>
        </View>
        <View style={[dynamicStyles.statBox, { backgroundColor: theme.colors.primary + '10' }]}>
          <Text style={dynamicStyles.statEmoji}>🥚</Text>
          <Text style={[dynamicStyles.statNumber, { color: theme.colors.primary }]}>{stats.eggs}</Text>
          <Text style={dynamicStyles.statLabel}>Incubando</Text>
        </View>
        <View style={[dynamicStyles.statBox, { backgroundColor: theme.colors.textMuted + '10' }]}>
          <Text style={dynamicStyles.statEmoji}>🌌</Text>
          <Text style={[dynamicStyles.statNumber, { color: theme.colors.text }]}>{stats.total}</Text>
          <Text style={dynamicStyles.statLabel}>Vistos</Text>
        </View>
      </View>

      {/* FILTERS */}
      <View style={dynamicStyles.filtersContainer}>
        {(['all', 'egg', 'hatched'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[dynamicStyles.filterButton, activeFilter === filter && dynamicStyles.filterActive]}
            onPress={() => handleFilterChange(filter)}
            activeOpacity={0.9}
          >
            <Text style={[dynamicStyles.filterText, activeFilter === filter && dynamicStyles.filterTextActive]}>
              {filter === 'all' ? 'Todos' : filter === 'egg' ? 'Huevos 🥚' : 'Eclosionados 🐣'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* EGG GRID */}
      {paginatedEggs.length > 0 ? (
        <FlatList
          data={paginatedEggs}
          renderItem={renderEggItem}
          keyExtractor={item => item.kanji}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={dynamicStyles.gridContainer}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          initialNumToRender={30}
          maxToRenderPerBatch={30}
          windowSize={5}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            visibleCount < filteredEggs.length ? (
              <View style={dynamicStyles.footerLoading}>
                <Text style={dynamicStyles.footerLoadingText}>Cargando más kanjis...</Text>
              </View>
            ) : filteredEggs.length > 30 ? (
              <View style={dynamicStyles.footerEnd}>
                <Text style={dynamicStyles.footerEndText}>✨ Fin de la incubadora</Text>
              </View>
            ) : null
          }
        />
      ) : (
        <View style={dynamicStyles.emptyContainer}>
          <View style={dynamicStyles.emptyIconCircle}>
            <Text style={dynamicStyles.emptyEmoji}>🥚</Text>
          </View>
          <Text style={dynamicStyles.emptyTitle}>Incubadora Vacía</Text>
          <Text style={dynamicStyles.emptyText}>
            Usa el Lector para buscar palabras nuevas. Al tocar una palabra con kanjis, aparecerán aquí.
          </Text>
        </View>
      )}

      {/* DETAIL MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <Pressable style={dynamicStyles.modalBackdrop} onPress={closeModal}>
          <View style={dynamicStyles.modalContainer}>
            <Pressable style={dynamicStyles.modalContent} onPress={(e) => e.stopPropagation()}>
              {selectedEgg && (
                <>
                  <TouchableOpacity style={dynamicStyles.modalCloseButton} onPress={closeModal}>
                    <Text style={dynamicStyles.modalCloseButtonText}>×</Text>
                  </TouchableOpacity>

                  {selectedEgg.status === 'egg' ? (
                    <View style={dynamicStyles.modalEggContent}>
                      <Text style={dynamicStyles.modalHeaderTitle}>Huevo en Incubación 🥚</Text>
                      
                      <View style={dynamicStyles.largeEggWrapper}>
                        <Text style={dynamicStyles.largeEggIcon}>🥚</Text>
                        <View style={dynamicStyles.largeEggInnerKanjiContainer}>
                          <Text style={dynamicStyles.largeEggInnerKanji}>{selectedEgg.kanji}</Text>
                        </View>
                      </View>

                      <Text style={dynamicStyles.modalKanjiTitle}>
                        Kanji: <Text style={dynamicStyles.highlightText}>{selectedEgg.kanji}</Text>
                      </Text>

                      <View style={dynamicStyles.modalProgressSection}>
                        <View style={dynamicStyles.modalProgressBarRow}>
                          <Text style={dynamicStyles.modalProgressLabel}>Progreso de incubación</Text>
                          <Text style={dynamicStyles.modalProgressVal}>{selectedEgg.points.toFixed(1)} / 5.0</Text>
                        </View>
                        <View style={dynamicStyles.modalProgressBarBg}>
                          <View style={[dynamicStyles.modalProgressBarFill, { width: `${Math.min((selectedEgg.points / 5.0) * 100, 100)}%` }]} />
                        </View>
                        <Text style={dynamicStyles.modalProgressSubText}>Necesitas 5.0 puntos para que eclosione.</Text>
                      </View>

                      <View style={dynamicStyles.instructionContainer}>
                        <Text style={dynamicStyles.instructionHeader}>¿Cómo eclosionar este huevo?</Text>
                        
                        <View style={dynamicStyles.instructionRow}>
                          <View style={dynamicStyles.instructionBullet}><Text style={dynamicStyles.bulletText}>📖</Text></View>
                          <View style={dynamicStyles.instructionTextWrapper}>
                            <Text style={dynamicStyles.instructionTitle}>Ver en el Lector</Text>
                            <Text style={dynamicStyles.instructionDesc}>Haz lookup a palabras con "{selectedEgg.kanji}" para sumar <Text style={dynamicStyles.pointsBold}>+0.1 pts</Text>.</Text>
                          </View>
                        </View>

                        <View style={dynamicStyles.instructionRow}>
                          <View style={dynamicStyles.instructionBullet}><Text style={dynamicStyles.bulletText}>✨</Text></View>
                          <View style={dynamicStyles.instructionTextWrapper}>
                            <Text style={dynamicStyles.instructionTitle}>Minar una palabra</Text>
                            <Text style={dynamicStyles.instructionDesc}>Guarda una palabra con "{selectedEgg.kanji}" para sumar <Text style={dynamicStyles.pointsBold}>+1.0 pts</Text>.</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View style={dynamicStyles.modalHatchedContent}>
                      <Text style={dynamicStyles.modalHeaderTitle}>¡Kanji Eclosionado! ⭐🐣</Text>

                      <View style={dynamicStyles.largeHatchedBadge}>
                        <Text style={dynamicStyles.largeHatchedKanji}>{selectedEgg.kanji}</Text>
                        <View style={dynamicStyles.largeHatchedSparkleBadge}>
                          <Text style={dynamicStyles.sparkleBadgeText}>⭐</Text>
                        </View>
                      </View>

                      <Text style={dynamicStyles.hatchedCelebrationText}>
                        ¡Enhorabuena! Has dominado este kanji. Ya forma parte activa de tu aprendizaje.
                      </Text>

                      <View style={dynamicStyles.hatchedStatsContainer}>
                        <View style={dynamicStyles.hatchedStatRow}>
                          <Text style={dynamicStyles.hatchedStatLabel}>Puntos de Maestría</Text>
                          <Text style={dynamicStyles.hatchedStatValue}>{selectedEgg.points.toFixed(1)} pts</Text>
                        </View>
                        <View style={dynamicStyles.hatchedStatDivider} />
                        <View style={dynamicStyles.hatchedStatRow}>
                          <Text style={dynamicStyles.hatchedStatLabel}>Descubierto el</Text>
                          <Text style={dynamicStyles.hatchedStatValue}>{new Date(selectedEgg.discovered_at).toLocaleDateString()}</Text>
                        </View>
                        {selectedEgg.hatched_at && (
                          <>
                            <View style={dynamicStyles.hatchedStatDivider} />
                            <View style={dynamicStyles.hatchedStatRow}>
                              <Text style={dynamicStyles.hatchedStatLabel}>Eclosionó el</Text>
                              <Text style={dynamicStyles.hatchedStatValue}>{new Date(selectedEgg.hatched_at).toLocaleDateString()}</Text>
                            </View>
                          </>
                        )}
                      </View>
                    </View>
                  )}

                  <TouchableOpacity style={dynamicStyles.modalActionButton} onPress={closeModal}>
                    <Text style={dynamicStyles.modalActionButtonText}>¡Entendido!</Text>
                  </TouchableOpacity>
                </>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: 60,
    },
    header: {
      paddingHorizontal: HORIZONTAL_PADDING,
      marginBottom: 16,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    backButton: {
      backgroundColor: theme.colors.surface,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderBottomWidth: 4,
    },
    backButtonText: {
      color: theme.colors.text,
      fontWeight: '800',
      fontSize: 13,
    },
    headerTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.header,
      fontFamily: theme.fonts.serif,
    },
    titleEmoji: {
      fontSize: 22,
      marginLeft: 6,
    },
    subtitle: {
      fontSize: 13,
      color: theme.colors.textMuted,
      lineHeight: 18,
    },
    statsBoard: {
      flexDirection: 'row',
      marginHorizontal: HORIZONTAL_PADDING,
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    statBox: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 4,
      paddingVertical: 12,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    statEmoji: {
      fontSize: 18,
      marginBottom: 2,
    },
    statNumber: {
      fontSize: 18,
      fontWeight: '900',
    },
    statLabel: {
      fontSize: 11,
      color: theme.colors.textMuted,
      fontWeight: '700',
      marginTop: 2,
    },
    filtersContainer: {
      flexDirection: 'row',
      marginHorizontal: HORIZONTAL_PADDING,
      marginBottom: 16,
      backgroundColor: theme.colors.border + '40',
      borderRadius: 16,
      padding: 4,
    },
    filterButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 12,
    },
    filterActive: {
      backgroundColor: theme.colors.surface,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    filterText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textMuted,
    },
    filterTextActive: {
      color: theme.colors.primary,
    },
    gridContainer: {
      paddingHorizontal: HORIZONTAL_PADDING,
      paddingBottom: 40,
    },
    eggCard: {
      width: CARD_SIZE,
      height: CARD_SIZE * 1.25,
      margin: CARD_MARGIN,
      borderRadius: 20,
      borderWidth: 2,
      padding: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    eggCardEgg: {
      borderColor: theme.colors.border,
      borderBottomWidth: 4,
    },
    eggCardHatched: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.accent + '08',
      borderBottomWidth: 4,
    },
    eggContainer: {
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      height: '100%',
    },
    eggIcon: {
      fontSize: 22,
      marginTop: 2,
    },
    kanjiPlaceholder: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.colors.text,
      marginVertical: 2,
    },
    progressWrapper: {
      width: '100%',
      alignItems: 'center',
    },
    progressBarBg: {
      width: '100%',
      height: 6,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 4,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 4,
    },
    progressText: {
      fontSize: 9,
      color: theme.colors.textMuted,
      fontWeight: '800',
    },
    hatchedContainer: {
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      height: '100%',
      position: 'relative',
    },
    sparkleBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      padding: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
      zIndex: 5,
    },
    sparkleText: {
      fontSize: 10,
    },
    hatchedKanjiCircle: {
      backgroundColor: theme.colors.surface,
      width: CARD_SIZE * 0.55,
      height: CARD_SIZE * 0.55,
      borderRadius: (CARD_SIZE * 0.55) / 2,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.accent + '30',
      marginTop: 4,
    },
    kanjiText: {
      fontSize: CARD_SIZE * 0.3,
      fontWeight: 'bold',
      color: theme.colors.header,
      fontFamily: theme.fonts.serif,
    },
    hatchedRibbon: {
      backgroundColor: theme.colors.accent,
      paddingVertical: 2,
      paddingHorizontal: 8,
      borderRadius: 10,
    },
    pointsText: {
      fontSize: 9,
      color: theme.colors.onPrimary || '#FFF',
      fontWeight: '800',
    },
    emptyContainer: {
      flex: 0.6,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyIconCircle: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: theme.colors.border + '30',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyEmoji: {
      fontSize: 44,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.header,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 13,
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    footerLoading: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    footerLoadingText: {
      fontSize: 12,
      color: theme.colors.textMuted,
      fontWeight: '600',
    },
    footerEnd: {
      paddingVertical: 24,
      alignItems: 'center',
    },
    footerEndText: {
      fontSize: 12,
      color: theme.colors.textMuted,
      fontWeight: '700',
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '90%',
      maxWidth: 360,
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 30,
      padding: 24,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.border,
      position: 'relative',
    },
    modalCloseButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      zIndex: 10,
    },
    modalCloseButtonText: {
      fontSize: 28,
      color: theme.colors.textMuted,
      fontWeight: '300',
    },
    modalEggContent: {
      alignItems: 'center',
      width: '100%',
    },
    modalHatchedContent: {
      alignItems: 'center',
      width: '100%',
    },
    modalHeaderTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginBottom: 20,
    },
    largeEggWrapper: {
      width: 130,
      height: 130,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: 65,
      borderWidth: 2,
      borderColor: theme.colors.border,
      marginBottom: 16,
    },
    largeEggIcon: {
      fontSize: 70,
    },
    largeEggInnerKanjiContainer: {
      position: 'absolute',
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 4,
      bottom: 6,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    largeEggInnerKanji: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.header,
    },
    modalKanjiTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 16,
    },
    highlightText: {
      fontSize: 28,
      color: theme.colors.header,
      fontFamily: theme.fonts.serif,
      fontWeight: 'bold',
    },
    modalProgressSection: {
      width: '100%',
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      padding: 16,
      borderWidth: 2,
      borderColor: theme.colors.border,
      marginBottom: 20,
    },
    modalProgressBarRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    modalProgressLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textMuted,
    },
    modalProgressVal: {
      fontSize: 13,
      fontWeight: '900',
      color: theme.colors.primary,
    },
    modalProgressBarBg: {
      width: '100%',
      height: 12,
      backgroundColor: theme.colors.border,
      borderRadius: 6,
      overflow: 'hidden',
      marginBottom: 8,
    },
    modalProgressBarFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 6,
    },
    modalProgressSubText: {
      fontSize: 11,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    instructionContainer: {
      width: '100%',
    },
    instructionHeader: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.colors.header,
      marginBottom: 14,
    },
    instructionRow: {
      flexDirection: 'row',
      marginBottom: 14,
      alignItems: 'flex-start',
    },
    instructionBullet: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    bulletText: {
      fontSize: 14,
    },
    instructionTextWrapper: {
      flex: 1,
    },
    instructionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
    },
    instructionDesc: {
      fontSize: 12,
      color: theme.colors.textMuted,
      lineHeight: 16,
    },
    pointsBold: {
      fontWeight: '800',
      color: theme.colors.primary,
    },
    largeHatchedBadge: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.accent + '12',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: theme.colors.accent,
      marginBottom: 20,
    },
    largeHatchedKanji: {
      fontSize: 58,
      fontWeight: 'bold',
      color: theme.colors.header,
      fontFamily: theme.fonts.serif,
    },
    largeHatchedSparkleBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: theme.colors.surface,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.accent,
    },
    sparkleBadgeText: {
      fontSize: 14,
    },
    hatchedCelebrationText: {
      fontSize: 14,
      color: theme.colors.text,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
    },
    hatchedStatsContainer: {
      width: '100%',
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      padding: 16,
      borderWidth: 2,
      borderColor: theme.colors.border,
      marginBottom: 20,
    },
    hatchedStatRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    hatchedStatLabel: {
      fontSize: 12,
      color: theme.colors.textMuted,
      fontWeight: '600',
    },
    hatchedStatValue: {
      fontSize: 13,
      color: theme.colors.text,
      fontWeight: '700',
    },
    hatchedStatDivider: {
      height: 2,
      backgroundColor: theme.colors.border,
    },
    modalActionButton: {
      width: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: 'center',
      borderBottomWidth: 4,
      borderBottomColor: theme.colors.primary === '#1CB0F6' ? '#1899D6' : 'rgba(0,0,0,0.2)', 
    },
    modalActionButtonText: {
      color: theme.colors.onPrimary || '#FFF',
      fontWeight: '800',
      fontSize: 15,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });