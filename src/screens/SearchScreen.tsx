import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { SearchSection } from '../components/SearchSection';
import { ResultsList } from '../components/ResultsList';
import { useDictionary } from '../hooks/useDictionary';

export const SearchScreen: React.FC = () => {
  const { 
    text, 
    setText, 
    tokens, 
    results, 
    loading, 
    lookup 
  } = useDictionary();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <SearchSection 
          text={text}
          setText={setText}
          tokens={tokens}
          onTokenPress={lookup}
        />
        <View style={styles.resultsWrapper}>
          <ResultsList 
            results={results} 
            loading={loading} 
            hasInput={text.length > 0} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161616', // LN Dark Theme
  },
  scrollView: {
    flex: 1,
  },
  resultsWrapper: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
});
