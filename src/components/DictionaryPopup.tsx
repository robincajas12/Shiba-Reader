import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ResultsList } from './ResultsList';
import { LookupResult } from '../types';
import { Theme } from '../theme';

interface DictionaryPopupProps {
  visible: boolean;
  top: number;
  left: number;
  results: LookupResult[];
  loading: boolean;
  onClose: () => void;
}

export const DictionaryPopup: React.FC<DictionaryPopupProps> = React.memo(({
  visible,
  top,
  left,
  results,
  loading,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <View style={[styles.popupCard, { top, left }]}>
      {/* Botón de cierre manual (✕) */}
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={onClose}
      >
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      <ScrollView 
        style={{ maxHeight: 220 }} 
        contentContainerStyle={{ paddingBottom: Theme.spacing.md }}
        showsVerticalScrollIndicator={true}
        onTouchStart={(e) => e.stopPropagation()} 
      >
        <ResultsList results={results} loading={loading} hasInput={true} />
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
  closeButton: {
    alignSelf: 'flex-end',
    backgroundColor: Theme.colors.border,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs
  },
  closeButtonText: {
    fontSize: 12,
    color: Theme.colors.text,
    fontWeight: 'bold'
  }
});
