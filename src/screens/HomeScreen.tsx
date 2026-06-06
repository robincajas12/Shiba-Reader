import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useBrowser } from '../hooks/useBrowser';
import { useTheme } from '../ThemeContext';

type TabParamList = {
  Home: undefined;
  Reader: { url: string };
  Search: undefined;
  Settings: undefined;
};

export const HomeScreen: React.FC = () => {
  const [url, setUrl] = useState('');
  const { theme } = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const { history, bookmarks, clearHistory, removeBookmark, refreshBrowserData } = useBrowser();

  useFocusEffect(
    useCallback(() => {
      refreshBrowserData();
    }, [refreshBrowserData])
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
        <Text style={dynamicStyles.heroSubtitle}>Tu puerta a la lectura en Japonés</Text>
      </View>

      <View style={dynamicStyles.searchSection}>
        <TextInput
          style={dynamicStyles.input}
          placeholder="Introduce una URL"
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
          <Text style={dynamicStyles.goButtonText}>Ir</Text>
        </TouchableOpacity>
      </View>

      <View style={dynamicStyles.section}>
        <View style={dynamicStyles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>Favoritos</Text>
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
          <Text style={dynamicStyles.sectionTitle}>Recientes</Text>
          {history.length > 0 && (
            <TouchableOpacity onPress={clearHistory}>
              <Text style={dynamicStyles.clearAllText}>Borrar todo</Text>
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
          <Text style={dynamicStyles.emptyText}>No hay historial reciente</Text>
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
  }
});
