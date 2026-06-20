import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useBrowser } from '../hooks/useBrowser';
import { useSRS } from '../hooks/useSRS';
import { useTheme } from '../ThemeContext';
import { AdBanner } from '../components/AdBanner';

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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={dynamicStyles.container} showsVerticalScrollIndicator={false}>
        <View style={dynamicStyles.hero}>
          <View style={dynamicStyles.heroContent}>
              <Text style={dynamicStyles.heroEmoji}>🐕</Text>
              <View>
                  <Text style={dynamicStyles.heroTitle}>Shiba Reader</Text>
                  <Text style={dynamicStyles.heroSubtitle}>Master Japanese, one paw at a time</Text>
              </View>
          </View>
        </View>

        <View style={dynamicStyles.searchSection}>
          <View style={dynamicStyles.inputWrapper}>
              <TextInput
              style={dynamicStyles.input}
              placeholder="Search or enter URL..."
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
              <Text style={dynamicStyles.goButtonText}>GO</Text>
              </TouchableOpacity>
          </View>
        </View>

        {/* SRS Status Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Training Center</Text>
          <View style={dynamicStyles.srsGrid}>
              <TouchableOpacity 
              style={dynamicStyles.srsCardLarge}
              onPress={() => navigation.navigate('MoreStack', { screen: 'SRSReview', params: { mode: 'normal' } })}
              >
                  <View style={[dynamicStyles.srsIconCircle, { backgroundColor: theme.colors.primary + '20' }]}>
                      <Text style={dynamicStyles.srsEmoji}>🧠</Text>
                  </View>
                  <Text style={dynamicStyles.srsCardTitle}>Daily Review</Text>
                  <View style={dynamicStyles.srsStatusRow}>
                      <Text style={dynamicStyles.srsStatusText}>
                          {pendingCount > 0 ? `${pendingCount} due` : 'Finished'}
                      </Text>
                      {pendingCount > 0 && <View style={dynamicStyles.dot} />}
                  </View>
              </TouchableOpacity>

              <TouchableOpacity 
              style={dynamicStyles.srsCardLarge}
              onPress={() => navigation.navigate('MoreStack', { screen: 'SRSReview', params: { mode: 'queue' } })}
              >
                  <View style={[dynamicStyles.srsIconCircle, { backgroundColor: theme.colors.accent + '20' }]}>
                      <Text style={dynamicStyles.srsEmoji}>⚡</Text>
                  </View>
                  <Text style={dynamicStyles.srsCardTitle}>Mining Queue</Text>
                  <Text style={dynamicStyles.srsStatusText}>Prioritize</Text>
              </TouchableOpacity>
          </View>
        </View>

        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeader}>
            <Text style={dynamicStyles.sectionTitle}>Library</Text>
            <TouchableOpacity onPress={refreshBrowserData} style={dynamicStyles.iconButton}>
              <Text style={dynamicStyles.iconButtonEmoji}>🔄</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={dynamicStyles.bookmarksScroll}>
            {bookmarks.length > 0 ? bookmarks.map((item) => (
              <View key={item.id} style={dynamicStyles.bookmarkContainer}>
                <TouchableOpacity 
                  style={dynamicStyles.bookmarkCard}
                  onPress={() => handleOpenUrl(item.url)}
                >
                  <View style={dynamicStyles.bookmarkFavicon}>
                      <Text style={dynamicStyles.bookmarkEmoji}>📖</Text>
                  </View>
                  <Text style={dynamicStyles.bookmarkTitle} numberOfLines={1}>{item.title}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={dynamicStyles.removeBookmarkBtn}
                  onPress={() => removeBookmark(item.id)}
                >
                  <Text style={dynamicStyles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            )) : (
              <Text style={dynamicStyles.emptyHint}>No bookmarks yet</Text>
            )}
          </ScrollView>
        </View>

        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeader}>
            <Text style={dynamicStyles.sectionTitle}>Recent Journeys</Text>
            {history.length > 0 && (
              <TouchableOpacity onPress={clearHistory}>
                <Text style={dynamicStyles.clearAllText}>Reset history</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={dynamicStyles.historyCard}>
              {history.length > 0 ? (
              history.slice(0, 5).map((item, idx) => (
                  <TouchableOpacity 
                  key={item.id} 
                  style={[dynamicStyles.historyItem, idx === history.slice(0, 5).length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => handleOpenUrl(item.url)}
                  >
                  <Text style={dynamicStyles.historyUrl} numberOfLines={1}>{item.url}</Text>
                  <Text style={dynamicStyles.arrow}>›</Text>
                  </TouchableOpacity>
              ))
              ) : (
              <Text style={dynamicStyles.emptyText}>History is clear</Text>
              )}
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
      <AdBanner />
    </View>
  );
};

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  hero: {
    paddingTop: 40,
    paddingBottom: 25,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 50,
    marginRight: 15,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.header,
    fontFamily: theme.fonts.serif,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  searchSection: {
    marginTop: -25,
    paddingHorizontal: theme.spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    height: 60,
    alignItems: 'center',
    paddingHorizontal: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.serif,
  },
  goButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goButtonText: {
    color: theme.colors.onPrimary,
    fontWeight: '900',
    fontSize: 14,
  },
  section: {
    marginTop: 30,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.header,
    fontFamily: theme.fonts.serif,
  },
  srsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  srsCardLarge: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: 25,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  srsIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  srsEmoji: {
    fontSize: 28,
  },
  srsCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.header,
    marginBottom: 5,
  },
  srsStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  srsStatusText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
    marginLeft: 6,
  },
  bookmarksScroll: {
    paddingRight: 20,
  },
  bookmarkContainer: {
    width: 140,
    marginRight: 15,
    position: 'relative',
  },
  bookmarkCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 100,
    justifyContent: 'center',
  },
  bookmarkFavicon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookmarkEmoji: {
    fontSize: 20,
  },
  bookmarkTitle: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  removeBookmarkBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.error,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  historyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 25,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '40',
  },
  historyIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  historyUrl: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 20,
    color: theme.colors.textMuted,
    marginLeft: 10,
  },
  clearAllText: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  emptyHint: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    paddingLeft: 5,
  },
  iconButton: {
    padding: 5,
  },
  iconButtonEmoji: {
    fontSize: 18,
  }
});
