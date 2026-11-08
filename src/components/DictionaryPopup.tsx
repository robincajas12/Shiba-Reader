import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ResultsList } from './ResultsList';
import { LookupResult, StructuredContentNode } from '../types';
import { ThemeName, Themes } from '../theme';
import { useVocabulary } from '../hooks/useVocabulary';
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

function hasSenseNodes(content: any): boolean {
  if (!content) return false;
  if (Array.isArray(content)) {
    return content.some(hasSenseNodes);
  }
  if (typeof content === 'object') {
    if (content.data?.content === 'sense') return true;
    if (content.content) return hasSenseNodes(content.content);
  }
  return false;
}

function enrichEntryContent(entryContent: any, entryIdx: number): any {
  if (!entryContent) return entryContent;
  
  const containsSenses = hasSenseNodes(entryContent);
  let senseCounter = 0;

  // Caso 1: Tiene nodos con role 'sense'.
  // Asignamos checkbox ÚNICAMENTE a cada 'sense', para que sus viñetas internas queden limpias y no haya checkboxes duplicados.
  if (containsSenses) {
    const assignToSenses = (node: any): any => {
      if (!node) return node;
      if (Array.isArray(node)) {
        return node.map(assignToSenses);
      }
      if (typeof node === 'object') {
        const copy = { ...node };
        if (copy.data?.content === 'sense') {
          copy.id = `e${entryIdx}-s${senseCounter++}`;
        }
        if (copy.content) {
          copy.content = assignToSenses(copy.content);
        }
        return copy;
      }
      return node;
    };
    return assignToSenses(entryContent);
  }

  // Caso 2: No tiene 'sense', pero tiene lista de 'li'
  let hasLi = false;
  const checkLi = (node: any) => {
    if (!node) return;
    if (Array.isArray(node)) node.forEach(checkLi);
    else if (typeof node === 'object') {
      if (node.tag === 'li') hasLi = true;
      if (node.content) checkLi(node.content);
    }
  };
  checkLi(entryContent);

  if (hasLi) {
    const assignToLi = (node: any): any => {
      if (!node) return node;
      if (Array.isArray(node)) return node.map(assignToLi);
      if (typeof node === 'object') {
        const copy = { ...node };
        if (copy.tag === 'li') {
          copy.id = `e${entryIdx}-s${senseCounter++}`;
        }
        if (copy.content) {
          copy.content = assignToLi(copy.content);
        }
        return copy;
      }
      return node;
    };
    return assignToLi(entryContent);
  }

  // Caso 3: Array simple de strings o definiciones planas
  if (Array.isArray(entryContent)) {
    return entryContent.map((item) => {
      if (typeof item === 'string') {
        return {
          tag: 'div',
          id: `e${entryIdx}-s${senseCounter++}`,
          content: item
        };
      }
      if (typeof item === 'object') {
        return {
          ...item,
          id: `e${entryIdx}-s${senseCounter++}`
        };
      }
      return item;
    });
  }

  // Caso 4: Objeto o string individual
  if (typeof entryContent === 'string') {
    return {
      tag: 'div',
      id: `e${entryIdx}-s${senseCounter++}`,
      content: entryContent
    };
  }

  if (typeof entryContent === 'object') {
    return {
      ...entryContent,
      id: `e${entryIdx}-s${senseCounter++}`
    };
  }

  return entryContent;
}

function filterContent(content: any, selectedIds: Set<string>): any {
  if (!content) return null;

  if (Array.isArray(content)) {
    const filtered = content
      .map(item => filterContent(item, selectedIds))
      .filter(item => item !== null);
    return filtered.length > 0 ? filtered : null;
  }

  if (typeof content === 'object') {
    // Si este nodo es una acepción con ID asignado
    if (content.id) {
      if (selectedIds.has(content.id)) {
        // Está seleccionada: devolver intacta (sin el id UI temporal) con todo su contenido íntegro
        const { id, ...cleanNode } = content;
        return cleanNode;
      }
      // No fue seleccionada por el usuario: descartar
      return null;
    }

    // Si es un contenedor intermedio (ol, ul, wrapper structured-content, etc.)
    if (content.content) {
      const filteredInner = filterContent(content.content, selectedIds);
      if (filteredInner === null) return null;
      return { ...content, content: filteredInner };
    }

    return content;
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
  const { addVocabulary, isAlreadySaved } = useVocabulary();
  
  const [selectedSenseIds, setSelectedSenseIds] = useState<Set<string>>(new Set());
  const [savedNoticeByIndex, setSavedNoticeByIndex] = useState<Record<number, boolean>>({});

  const enrichedResults = useMemo(() => {
    return results.map((res, i) => {
      const newEntry = [...res.entry];
      newEntry[5] = enrichEntryContent(res.entry[5], i);
      return { ...res, entry: newEntry as any };
    });
  }, [results]);

  useEffect(() => {
    if (visible) {
      setSelectedSenseIds(new Set());
    }
  }, [visible]);

  useEffect(() => {
    let cancelled = false;

    const checkSavedEntries = async () => {
      if (!visible || results.length === 0) {
        setSavedNoticeByIndex({});
        return;
      }

      const nextState: Record<number, boolean> = {};

      for (const [index, res] of results.entries()) {
        const [term, reading] = res.entry;
        const isSaved = await isAlreadySaved(String(term || ''), String(reading || ''));
        if (!cancelled) {
          nextState[index] = isSaved;
        }
      }

      if (!cancelled) {
        setSavedNoticeByIndex(nextState);
      }
    };

    checkSavedEntries();

    return () => {
      cancelled = true;
    };
  }, [visible, results, sentence, isAlreadySaved]);

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

  const dynamicStyles = styles(theme);

  if (!visible) return null;

  return (
    <View style={[dynamicStyles.popupCard, { top, left }]}>
      <View style={dynamicStyles.popupHeader}>
        {selectedSenseIds.size > 0 && (
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

      <View style={{ flex: 1 }}>
        {sentence ? (
          <View style={dynamicStyles.miningContext}>
            <Text style={dynamicStyles.miningContextLabel}>Mining Context:</Text>
            <Text style={dynamicStyles.miningContextText} numberOfLines={2}>"{sentence}"</Text>
          </View>
        ) : null}

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
            emptyMessage="No definitions found"
            savedByIndex={savedNoticeByIndex}
          />
        </ScrollView>
      </View>
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
});
