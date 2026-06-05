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
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    zIndex: 9999, 
  },
  closeButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#f0f0f0',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6
  },
  closeButtonText: {
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold'
  }
});
