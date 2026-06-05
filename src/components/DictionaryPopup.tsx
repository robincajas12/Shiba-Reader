import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ResultsList } from './ResultsList';
import { LookupResult } from '../types';

interface DictionaryPopupProps {
  visible: boolean;
  top: number;
  left: number;
  results: LookupResult[];
  loading: boolean;
  onClose: () => void;
}

export const DictionaryPopup: React.FC<DictionaryPopupProps> = ({
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
        style={{ maxHeight: 180 }} 
        showsVerticalScrollIndicator={true}
        onTouchStart={(e) => e.stopPropagation()} 
      >
        <ResultsList results={results} loading={loading} hasInput={true} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  popupCard: {
    position: 'absolute',
    width: '88%',
    backgroundColor: '#1c1c1c',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#333',
    zIndex: 9999, 
  },
  closeButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#333',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6
  },
  closeButtonText: {
    fontSize: 12,
    color: '#c8c0b0',
    fontWeight: 'bold'
  }
});
