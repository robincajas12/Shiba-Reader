import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useBrowser } from '../hooks/useBrowser';
import { useSRS } from '../hooks/useSRS';
import { useTheme } from '../ThemeContext';

type TabParamList = {
  Home: undefined;
  Reader: { url: string };
  Search: undefined;
  Settings: undefined;
  MoreStack: { screen: string };
};

export const HomeScreen: React.FC = () => {
  const [url, setUrl] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const { theme } = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<any>>();
  const { history, bookmarks, clearHistory, removeBookmark, refreshBrowserData } = useBrowser();
  const { getPendingCount } = useSRS();

  useFocusEffect(
    useCallback(() => {
      refreshBrowserData();
      getPendingCount().then(setPendingCount);
    }, [refreshBrowserData, getPendingCount])
  );

  const handleOpenUrl = (targetUrl: string) => {
    if (!targetUrl) return;
    const formattedUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    navigation.navigate('Reader', { url: formattedUrl });
  };

  const dynamicStyles = styles(theme);

  return (
    <ScrollView style={dynamicStyles.container}>
      <View style={dynamicStyles.hero}>
        <Text style={dynamicStyles.heroTitle}>Ringo Reader</Text>
        <Text style={dynamicStyles.heroSubtitle}>Your gateway to Japanese reading</Text>
      </View>

      <View style={dynamicStyles.searchSection}>
        <TextInput
          style={dynamicStyles.input}
          placeholder="Enter a URL"
          placeholderTextColor={theme.colors.textMuted}
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          keyboardType="url"
          onSubmitEditing={() => handleOpenUrl(url)}
        />
        <TouchableOpacity 
          style={dynamicStyles.goButton}
          onPress={() => handleOpenUrl(url)}
        >
          <Text style={dynamicStyles.goButtonText}>Go</Text>
        </TouchableOpacity>
      </View>

      {/* SRS Status Section */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Daily Review</Text>
        <TouchableOpacity 
          style={dynamicStyles.srsCard}
          onPress={() => navigation.navigate('MoreStack', { screen: 'SRSReview', params: { mode: 'normal' } })}
        >
          <View style={dynamicStyles.srsInfo}>
            <Text style={dynamicStyles.srsEmoji}>🧠</Text>
            <View>
              <Text style={dynamicStyles.srsTitle}>Daily Review</Text>
              <Text style={dynamicStyles.srsSubtitle}>
                {pendingCount > 0 
                  ? `You have ${pendingCount} words to review` 
                  : 'You are all caught up!'}
              </Text>
            </View>
          </View>
          {pendingCount > 0 && (
            <View style={dynamicStyles.srsBadge}>
              <Text style={dynamicStyles.srsBadgeText}>{pendingCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[dynamicStyles.srsCard, { marginTop: theme.spacing.md }]}
          onPress={() => navigation.navigate('MoreStack', { screen: 'SRSReview', params: { mode: 'queue' } })}
        >
          <View style={dynamicStyles.srsInfo}>
            <Text style={dynamicStyles.srsEmoji}>⚡</Text>
            <View>
              <Text style={dynamicStyles.srsTitle}>Mining Queue</Text>
              <Text style={dynamicStyles.srsSubtitle}>
                Prioritize words by recent interactions
              </Text>
            </View>
          </View>
          <Text style={dynamicStyles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={dynamicStyles.section}>
        <View style={dynamicStyles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>Bookmarks</Text>
          <TouchableOpacity onPress={refreshBrowserData}>
            <Text style={dynamicStyles.refreshEmoji}>🔄</Text>
          </TouchableOpacity>
        </View>
        <View style={dynamicStyles.bookmarksGrid}>
          {bookmarks.map((item) => (
            <View key={item.id} style={dynamicStyles.bookmarkWrapper}>
              <TouchableOpacity 
                style={dynamicStyles.bookmarkCard}
                onPress={() => handleOpenUrl(item.url)}
              >
                <Text style={dynamicStyles.bookmarkEmoji}>🌐</Text>
                <Text style={dynamicStyles.bookmarkTitle} numberOfLines={2}>{item.title}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={dynamicStyles.removeBookmarkBtn}
                onPress={() => removeBookmark(item.id)}
              >
                <Text style={dynamicStyles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View style={dynamicStyles.section}>
        <View style={dynamicStyles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>Recent</Text>
          {history.length > 0 && (
            <TouchableOpacity onPress={clearHistory}>
              <Text style={dynamicStyles.clearAllText}>Clear all</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {history.length > 0 ? (
          history.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={dynamicStyles.historyItem}
              onPress={() => handleOpenUrl(item.url)}
            >
              <Text style={dynamicStyles.historyUrl} numberOfLines={1}>{item.url}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={dynamicStyles.emptyText}>No recent history</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  hero: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.header,
    fontFamily: theme.fonts.serif,
  },
  heroSubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  searchSection: {
    padding: theme.spacing.lg,
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontFamily: theme.fonts.serif,
  },
  goButton: {
    width: 60,
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goButtonText: {
    color: theme.colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.header,
    fontFamily: theme.fonts.serif,
  },
  refreshEmoji: {
    fontSize: 16,
  },
  clearAllText: {
    color: theme.colors.accent,
    fontSize: 13,
  },
  bookmarksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: theme.spacing.xs,
  },
  bookmarkWrapper: {
    width: '30%',
    marginRight: '3%',
    marginBottom: theme.spacing.md,
    position: 'relative',
  },
  bookmarkCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    height: 90,
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  removeBookmarkBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  removeBtnText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  bookmarkEmoji: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  bookmarkTitle: {
    fontSize: 11,
    textAlign: 'center',
    color: theme.colors.text,
    fontWeight: '500',
  },
  emptyText: {
    color: theme.colors.border,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.card,
  },
  historyUrl: {
    fontSize: 14,
    color: theme.colors.textMuted,
    flex: 1,
  },
  srsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: theme.spacing.xs,
  },
  srsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  srsEmoji: {
    fontSize: 32,
    marginRight: theme.spacing.lg,
  },
  srsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.header,
  },
  srsSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  srsBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  srsBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  }
});
