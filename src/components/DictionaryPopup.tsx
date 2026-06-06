import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ResultsList } from './ResultsList';
import { LookupResult, StructuredContentNode } from '../types';
import { Theme } from '../theme';
import { useVocabulary } from '../hooks/useVocabulary';

interface DictionaryPopupProps {
  visible: boolean;
  top: number;
  left: number;
  results: LookupResult[];
  loading: boolean;
  onClose: () => void;
  sentence?: string;
}

/**
 * Deep clones and adds IDs to "sense" and "li" nodes.
 */
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

/**
 * Deep clones and REMOVES "sense" or "li" nodes that are NOT in the selected set.
 */
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

    // 1. If it's an example or extra info, we exclude it by default 
    // (User requested only the definitions they chose)
    if (isExample || isExtra) {
        return null;
    }

    // 2. Logic for selectable nodes (sense or li)
    if (isSense || isLi) {
        const hasNodeOrChildrenSelected = (node: any): boolean => {
            if (node.id && selectedIds.has(node.id)) return true;
            if (Array.isArray(node.content)) return node.content.some(hasNodeOrChildrenSelected);
            if (typeof node.content === 'object' && node.content !== null) return hasNodeOrChildrenSelected(node.content);
            return false;
        };

        if (!hasNodeOrChildrenSelected(content)) {
            return null;
        }
    }

    const newNode = { ...content };
    if (newNode.content) {
      const filteredInner = filterContent(newNode.content as any, selectedIds);
      
      if (filteredInner === null) {
          // If node was selected but children filtered out, keep node but empty content
          if ((isSense || isLi) && content.id && selectedIds.has(content.id)) {
              newNode.content = [];
          } else if (newNode.data?.content === 'attribution') {
              return newNode; // Keep attribution info
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
  const { addVocabulary } = useVocabulary();
  const [selectedSenseIds, setSelectedSenseIds] = useState<Set<string>>(new Set());

  // Enrich results with IDs whenever they change
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
    }
  }, [visible, results]);

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

    // We might have selected senses from multiple entries.
    // Group selected IDs by entry index to save them separately if they are different terms
    const entryIndices = new Set<number>();
    selectedSenseIds.forEach(id => {
      const match = id.match(/^e(\d+)-/);
      if (match) entryIndices.add(parseInt(match[1], 10));
    });

    for (const idx of entryIndices) {
      const res = enrichedResults[idx];
      const [term, reading] = res.entry;
      
      // Filter the content to only keep selected senses for THIS entry
      const filtered = filterContent(res.entry[5], selectedSenseIds);
      if (filtered) {
        const definition = JSON.stringify(filtered);
        await addVocabulary(term, reading, definition, sentence);
      }
    }
    
    setSelectedSenseIds(new Set());
    onClose();
  }, [selectedSenseIds, enrichedResults, sentence, addVocabulary, onClose]);

  if (!visible) return null;

  return (
    <View style={[styles.popupCard, { top, left }]}>
      <View style={styles.popupHeader}>
        {selectedSenseIds.size > 0 && (
          <TouchableOpacity 
            style={styles.saveSelectedButton} 
            onPress={handleSaveSelected}
          >
            <Text style={styles.saveSelectedText}>Guardar ({selectedSenseIds.size})</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={{ maxHeight: 220 }} 
        contentContainerStyle={{ paddingBottom: Theme.spacing.md }}
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
  );
});

const styles = StyleSheet.create({
  popupCard: {
    position: 'absolute',
    width: '88%',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
    shadowColor: Theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    zIndex: 9999, 
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs
  },
  saveSelectedButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Theme.radius.sm,
    marginRight: 10,
  },
  saveSelectedText: {
    color: Theme.colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: Theme.colors.border,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 12,
    color: Theme.colors.text,
    fontWeight: 'bold'
  }
});
