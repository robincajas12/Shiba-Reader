import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { SearchSection } from '../components/SearchSection';
import { ResultsList } from '../components/ResultsList';
import { useDictionary } from '../hooks/useDictionary';
import { Theme } from '../theme';

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
    backgroundColor: Theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  resultsWrapper: {
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
  },
});
