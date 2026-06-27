import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ResultsList } from './ResultsList';
import { LookupResult, StructuredContentNode } from '../types';
import { ThemeName, Themes } from '../theme';
import { useVocabulary } from '../hooks/useVocabulary';
import { useSRS, SRSStatusResult } from '../hooks/useSRS';
import { useTheme } from '../ThemeContext';

interface DictionaryPopupProps {
  visible: boolean;
  top: number;
  left: number;
  results: LookupResult[];
  loading: boolean;
  onClose: () => void;
  sentence?: string;
}

function enrichContent(content: StructuredContentNode | StructuredContentNode[], entryIdx: number, state: { senseIdx: number, liIdx: number }): any {
  if (!content) return content;
  if (Array.isArray(content)) {
    return content.map(item => enrichContent(item, entryIdx, state));
  }
  if (typeof content === 'object') {
    const newNode = { ...content };
    if (newNode.data?.content === 'sense') {
      newNode.id = `e${entryIdx}-s${state.senseIdx++}`;
    } else if (newNode.tag === 'li') {
      newNode.id = `e${entryIdx}-l${state.liIdx++}`;
    }
    if (newNode.content) {
      newNode.content = enrichContent(newNode.content as any, entryIdx, state);
    }
    return newNode;
  }
  return content;
}

function filterContent(content: StructuredContentNode | StructuredContentNode[], selectedIds: Set<string>): any {
  if (!content) return content;
  if (Array.isArray(content)) {
    const filtered = content
      .map(item => filterContent(item, selectedIds))
      .filter(item => item !== null);
    return filtered.length > 0 ? filtered : null;
  }
  if (typeof content === 'object') {
    const isSense = content.data?.content === 'sense';
    const isLi = content.tag === 'li';
    const isExample = content.data?.content === 'example-sentence';
    const isExtra = content.data?.content === 'extra-info';
    if (isExample || isExtra) return null;
    if (isSense || isLi) {
        const hasNodeOrChildrenSelected = (node: any): boolean => {
            if (node.id && selectedIds.has(node.id)) return true;
            if (Array.isArray(node.content)) return node.content.some(hasNodeOrChildrenSelected);
            if (typeof node.content === 'object' && node.content !== null) return hasNodeOrChildrenSelected(node.content);
            return false;
        };
        if (!hasNodeOrChildrenSelected(content)) return null;
    }
    const newNode = { ...content };
    if (newNode.content) {
      const filteredInner = filterContent(newNode.content as any, selectedIds);
      if (filteredInner === null) {
          if ((isSense || isLi) && content.id && selectedIds.has(content.id)) {
              newNode.content = [];
          } else if (newNode.data?.content === 'attribution') {
              return newNode;
          } else {
              return null;
          }
      } else {
          newNode.content = filteredInner;
      }
    }
    return newNode;
  }
  return content;
}

export const DictionaryPopup: React.FC<DictionaryPopupProps> = React.memo(({
  visible,
  top,
  left,
  results,
  loading,
  onClose,
  sentence = '',
}) => {
  const { theme } = useTheme();
  const { addVocabulary } = useVocabulary();
  const { getSRSStatus, processReview } = useSRS();
  
  const [selectedSenseIds, setSelectedSenseIds] = useState<Set<string>>(new Set());
  const [matchingCards, setMatchingCards] = useState<SRSStatusResult[]>([]);
  const [selectedVocabIds, setSelectedVocabIds] = useState<Set<number>>(new Set());
  const [showSRSMenu, setShowSRSMenu] = useState(false);

  const enrichedResults = useMemo(() => {
    return results.map((res, i) => {
      const state = { senseIdx: 0, liIdx: 0 };
      const newEntry = [...res.entry];
      newEntry[5] = enrichContent(res.entry[5], i, state);
      return { ...res, entry: newEntry as any };
    });
  }, [results]);

  useEffect(() => {
    if (visible) {
      setSelectedSenseIds(new Set());
      setMatchingCards([]);
      setSelectedVocabIds(new Set());
      setShowSRSMenu(false);
      
      if (results && results.length > 0) {
        const [term] = results[0].entry;
        getSRSStatus(term).then(async (cards) => {
          setMatchingCards(cards);

          // Gamificación: Descubrir kanjis o sumar +0.1 si la palabra ya existía en vocabulario
          try {
            const kanjis = term.match(/[\u4e00-\u9faf]/g) || [];
            const uniqueKanjis = Array.from(new Set(kanjis));
            if (uniqueKanjis.length > 0) {
              const { dbEngine } = require('../db/engine');
              const kanjiEggRepo = dbEngine.getRepository('KanjiEggRepository');
              const hatchedList: string[] = [];

              for (const kanji of uniqueKanjis) {
                const egg = await kanjiEggRepo.findByKanji(kanji);
                if (!egg) {
                  // Descubrir un nuevo huevo (puntos = 0)
                  await kanjiEggRepo.insert({
                    kanji,
                    points: 0.0,
                    status: 'egg',
                    discovered_at: Date.now(),
                    hatched_at: null
                  });
                } else if (cards.length > 0) {
                  // Si la palabra ya está minada (exista en vocabulario), sumamos 0.1 puntos
                  const newPoints = Math.min(egg.points + 0.1, 100);
                  let status = egg.status;
                  let hatchedAt = egg.hatched_at;
                  if (egg.status === 'egg' && newPoints >= 5.0) {
                    status = 'hatched';
                    hatchedAt = Date.now();
                    hatchedList.push(kanji);
                  }
                  await kanjiEggRepo.updatePoints(kanji, newPoints, status, hatchedAt);
                }
              }

              if (hatchedList.length > 0) {
                const { Alert } = require('react-native');
                Alert.alert(
                  '¡Eclosión de Kanji! 🥚✨',
                  `¡Felicidades! Los siguientes kanjis han eclosionado al repasar: ${hatchedList.join(', ')}`
                );
              }
            }
          } catch (kErr) {
            console.error("Error al procesar kanji eggs en popup lookup:", kErr);
          }

          const ids = new Set<number>();
          cards.forEach(c => {
            if (cards.length === 1 || c.vocabEntry.sentence === sentence) {
                ids.add(c.vocabEntry.id);
            }
          });
          if (ids.size === 0 && cards.length > 0) {
              cards.forEach(c => ids.add(c.vocabEntry.id));
          }
          setSelectedVocabIds(ids);
        });
      }
    }
  }, [visible, results, getSRSStatus, sentence]);

  const handleToggleVocab = (id: number) => {
    setSelectedVocabIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        return newSet;
    });
  };

  const handleSelectAllVocab = () => {
    if (selectedVocabIds.size === matchingCards.length) {
        setSelectedVocabIds(new Set());
    } else {
        const allIds = new Set<number>(matchingCards.map(c => c.vocabEntry.id));
        setSelectedVocabIds(allIds);
    }
  };

  const handleToggleSense = useCallback((id: string) => {
    setSelectedSenseIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  const handleSaveSelected = useCallback(async () => {
    if (selectedSenseIds.size === 0) return;
    const entryIndices = new Set<number>();
    selectedSenseIds.forEach(id => {
      const match = id.match(/^e(\d+)-/);
      if (match) entryIndices.add(parseInt(match[1], 10));
    });
    for (const idx of entryIndices) {
      const res = enrichedResults[idx];
      const [term, reading] = res.entry;
      const filtered = filterContent(res.entry[5], selectedSenseIds);
      if (filtered) {
        const definition = JSON.stringify(filtered);
        await addVocabulary(term, reading, definition, sentence);
      }
    }
    setSelectedSenseIds(new Set());
    onClose();
  }, [selectedSenseIds, enrichedResults, sentence, addVocabulary, onClose]);

  const handleSRSReview = async (grade: number) => {
    if (selectedVocabIds.size > 0) {
      for (const vocabId of selectedVocabIds) {
        await processReview(vocabId, grade);
      }
      onClose();
    }
  };

  const dynamicStyles = styles(theme);

  if (!visible) return null;

  return (
    <View style={[dynamicStyles.popupCard, { top, left }]}>
      <View style={dynamicStyles.popupHeader}>
        {matchingCards.length > 0 && !showSRSMenu && (
          <TouchableOpacity 
            style={dynamicStyles.minedBadge} 
            onPress={() => setShowSRSMenu(true)}
          >
            <Text style={dynamicStyles.minedBadgeText}>MINED ({matchingCards.length}) 🧠</Text>
          </TouchableOpacity>
        )}
        
        {showSRSMenu && (
          <TouchableOpacity 
            style={dynamicStyles.backButton} 
            onPress={() => setShowSRSMenu(false)}
          >
            <Text style={dynamicStyles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }} />
        
        {selectedSenseIds.size > 0 && !showSRSMenu && (
          <TouchableOpacity 
            style={dynamicStyles.saveSelectedButton} 
            onPress={handleSaveSelected}
          >
            <Text style={dynamicStyles.saveSelectedText}>Save ({selectedSenseIds.size})</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={dynamicStyles.closeButton} 
          onPress={onClose}
        >
          <Text style={dynamicStyles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {showSRSMenu ? (
        <View style={dynamicStyles.srsOverlay}>
          <View style={dynamicStyles.srsTitleRow}>
            <Text style={dynamicStyles.srsTitle}>SRS Evaluation</Text>
            {matchingCards.length > 1 && (
                <TouchableOpacity onPress={handleSelectAllVocab}>
                    <Text style={dynamicStyles.selectAllText}>
                        {selectedVocabIds.size === matchingCards.length ? 'Deselect All' : 'Select All'}
                    </Text>
                </TouchableOpacity>
            )}
          </View>
          
          <ScrollView style={dynamicStyles.vocabList} showsVerticalScrollIndicator={true}>
              {matchingCards.map(card => {
                  const isSelected = selectedVocabIds.has(card.vocabEntry.id);
                  return (
                      <TouchableOpacity 
                          key={card.vocabEntry.id} 
                          style={[dynamicStyles.vocabRow, isSelected && dynamicStyles.vocabRowSelected]}
                          onPress={() => handleToggleVocab(card.vocabEntry.id)}
                      >
                          <View style={[dynamicStyles.checkbox, isSelected && dynamicStyles.checkboxChecked]} />
                          <View style={{ flex: 1 }}>
                              <Text style={dynamicStyles.vocabRowReading}>{card.vocabEntry.reading}</Text>
                              <Text style={dynamicStyles.vocabRowSentence} numberOfLines={2}>
                                  {card.vocabEntry.sentence}
                              </Text>
                          </View>
                      </TouchableOpacity>
                  );
              })}
          </ScrollView>

          <View style={dynamicStyles.srsButtonsRow}>
            <TouchableOpacity 
              disabled={selectedVocabIds.size === 0}
              style={[dynamicStyles.srsButtonAction, { backgroundColor: theme.colors.error, opacity: selectedVocabIds.size === 0 ? 0.3 : 1 }]} 
              onPress={() => handleSRSReview(1)}
            >
              <Text style={dynamicStyles.srsButtonTextAction}>Forgot Meaning</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              disabled={selectedVocabIds.size === 0}
              style={[dynamicStyles.srsButtonAction, { backgroundColor: theme.colors.secondary, opacity: selectedVocabIds.size === 0 ? 0.3 : 1 }]} 
              onPress={() => handleSRSReview(3)}
            >
              <Text style={dynamicStyles.srsButtonTextAction}>Forgot Reading</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              disabled={selectedVocabIds.size === 0}
              style={[dynamicStyles.srsButtonBack, { opacity: selectedVocabIds.size === 0 ? 0.3 : 1 }]} 
              onPress={() => handleSRSReview(5)}
            >
              <Text style={dynamicStyles.srsButtonTextBack}>YES</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {sentence && (
            <View style={dynamicStyles.miningContext}>
                <Text style={dynamicStyles.miningContextLabel}>Mining Context:</Text>
                <Text style={dynamicStyles.miningContextText} numberOfLines={2}>"{sentence}"</Text>
            </View>
          )}
          <ScrollView 
            style={{ maxHeight: 180 }} 
            contentContainerStyle={{ paddingBottom: theme.spacing.md }}
            showsVerticalScrollIndicator={true}
            onTouchStart={(e) => e.stopPropagation()} 
          >
            <ResultsList 
              results={enrichedResults} 
              loading={loading} 
              hasInput={true} 
              selectedSenseIds={selectedSenseIds}
              onToggleSense={handleToggleSense}
            />
          </ScrollView>
        </View>
      )}
    </View>
  );
});

const styles = (theme: any) => StyleSheet.create({
  popupCard: {
    position: 'absolute',
    width: '88%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    zIndex: 9999, 
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    minHeight: 35,
  },
  minedBadge: {
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  minedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  backButtonText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  saveSelectedButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 10,
    elevation: 2,
  },
  saveSelectedText: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: theme.colors.background,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  closeButtonText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: 'bold'
  },
  miningContext: {
    backgroundColor: theme.colors.background + '80',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
  },
  miningContextLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  miningContextText: {
    fontSize: 12,
    color: theme.colors.text,
    fontStyle: 'italic',
  },
  srsOverlay: {
    height: 220,
    justifyContent: 'space-between',
  },
  srsTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  srsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.header,
    fontFamily: theme.fonts.serif,
  },
  selectAllText: {
    fontSize: 11,
    color: theme.colors.accent,
    fontWeight: '700',
  },
  vocabList: {
    flex: 1,
    marginBottom: 12,
  },
  vocabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 6,
    backgroundColor: theme.colors.card + '40',
  },
  vocabRowSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  vocabRowReading: {
    fontSize: 11,
    color: theme.colors.accent,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  vocabRowSentence: {
    fontSize: 12,
    color: theme.colors.text,
    lineHeight: 16,
  },
  srsButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  srsButtonAction: {
    flex: 1.2,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
  },
  srsButtonBack: {
    flex: 0.8,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  srsButtonTextAction: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  srsButtonTextBack: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});
