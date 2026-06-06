import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { SearchSection } from '../components/SearchSection';
import { ResultsList } from '../components/ResultsList';
import { useDictionary } from '../hooks/useDictionary';
import { useTheme } from '../ThemeContext';

export const SearchScreen: React.FC = () => {
  const { theme } = useTheme();
  const { 
    text, 
    setText, 
    tokens, 
    results, 
    loading, 
    lookup 
  } = useDictionary();

  const dynamicStyles = styles(theme);

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView style={dynamicStyles.scrollView}>
        <SearchSection 
          text={text}
          setText={setText}
          tokens={tokens}
          onTokenPress={lookup}
        />
        <View style={dynamicStyles.resultsWrapper}>
          <ResultsList 
            results={results} 
            loading={loading} 
            hasInput={text.length > 0} 
            selectedSenseIds={new Set()} // Not used in SearchScreen yet
            onToggleSense={() => {}}    // Not used in SearchScreen yet
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  resultsWrapper: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
});
