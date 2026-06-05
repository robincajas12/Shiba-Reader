import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useBrowser } from '../hooks/useBrowser';
import { Theme } from '../theme';

type TabParamList = {
  Home: undefined;
  Reader: { url: string };
  Search: undefined;
  Settings: undefined;
};

export const HomeScreen: React.FC = () => {
  const [url, setUrl] = useState('');
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Ringo Reader</Text>
        <Text style={styles.heroSubtitle}>Tu puerta a la lectura en Japonés</Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.input}
          placeholder="Introduce una URL (ej. nhk.or.jp)"
          placeholderTextColor={Theme.colors.textMuted}
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          keyboardType="url"
          onSubmitEditing={() => handleOpenUrl(url)}
        />
        <TouchableOpacity 
          style={styles.goButton}
          onPress={() => handleOpenUrl(url)}
        >
          <Text style={styles.goButtonText}>Ir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Favoritos</Text>
          <TouchableOpacity onPress={refreshBrowserData}>
            <Text style={styles.refreshEmoji}>🔄</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bookmarksGrid}>
          {bookmarks.map((item) => (
            <View key={item.id} style={styles.bookmarkWrapper}>
              <TouchableOpacity 
                style={styles.bookmarkCard}
                onPress={() => handleOpenUrl(item.url)}
              >
                <Text style={styles.bookmarkEmoji}>🌐</Text>
                <Text style={styles.bookmarkTitle} numberOfLines={2}>{item.title}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.removeBookmarkBtn}
                onPress={() => removeBookmark(item.id)}
              >
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recientes</Text>
          {history.length > 0 && (
            <TouchableOpacity onPress={clearHistory}>
              <Text style={styles.clearAllText}>Borrar todo</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {history.length > 0 ? (
          history.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.historyItem}
              onPress={() => handleOpenUrl(item.url)}
            >
              <Text style={styles.historyEmoji}>🕒</Text>
              <Text style={styles.historyUrl} numberOfLines={1}>{item.url}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No hay historial reciente</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  hero: {
    padding: Theme.spacing.xl,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.header,
    fontFamily: Theme.fonts.serif,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginTop: Theme.spacing.xs,
  },
  searchSection: {
    padding: Theme.spacing.lg,
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    paddingHorizontal: Theme.spacing.md,
    fontSize: 16,
    backgroundColor: Theme.colors.surface,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.serif,
  },
  goButton: {
    width: 60,
    marginLeft: Theme.spacing.sm,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goButtonText: {
    color: Theme.colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    padding: Theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.header,
    fontFamily: Theme.fonts.serif,
  },
  refreshEmoji: {
    fontSize: 16,
  },
  clearAllText: {
    color: Theme.colors.accent,
    fontSize: 13,
  },
  bookmarksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: Theme.spacing.xs,
  },
  bookmarkWrapper: {
    width: '30%',
    marginRight: '3%',
    marginBottom: Theme.spacing.md,
    position: 'relative',
  },
  bookmarkCard: {
    backgroundColor: Theme.colors.card,
    padding: Theme.spacing.sm,
    borderRadius: Theme.radius.lg,
    alignItems: 'center',
    height: 90,
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  removeBookmarkBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Theme.colors.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  removeBtnText: {
    color: Theme.colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  bookmarkEmoji: {
    fontSize: 24,
    marginBottom: Theme.spacing.xs,
  },
  bookmarkTitle: {
    fontSize: 11,
    textAlign: 'center',
    color: Theme.colors.text,
    fontWeight: '500',
  },
  emptyText: {
    color: Theme.colors.border,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.card,
  },
  historyEmoji: {
    fontSize: 16,
    marginRight: 12,
  },
  historyUrl: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    flex: 1,
  }
});
