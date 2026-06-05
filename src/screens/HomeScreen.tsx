import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useBrowser } from '../hooks/useBrowser';

// We'll define the TabParamList later in AppNavigator
type TabParamList = {
  Home: undefined;
  Reader: { url: string };
  Search: undefined;
  Settings: undefined;
};

export const HomeScreen: React.FC = () => {
  const [url, setUrl] = useState('');
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const { history, bookmarks } = useBrowser();

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
        <Text style={styles.sectionTitle}>Favoritos</Text>
        <View style={styles.bookmarksGrid}>
          {bookmarks.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.bookmarkCard}
              onPress={() => handleOpenUrl(item.url)}
            >
              <Text style={styles.bookmarkEmoji}>🌐</Text>
              <Text style={styles.bookmarkTitle} numberOfLines={2}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recientes</Text>
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
    backgroundColor: '#fff',
  },
  hero: {
    padding: 30,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  searchSection: {
    padding: 20,
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  goButton: {
    width: 60,
    marginLeft: 10,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  bookmarksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bookmarkCard: {
    width: '30%',
    backgroundColor: '#f1f3f5',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  bookmarkEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  bookmarkTitle: {
    fontSize: 11,
    textAlign: 'center',
    color: '#495057',
    fontWeight: '500',
  },
  emptyText: {
    color: '#adb5bd',
    textAlign: 'center',
    marginTop: 10,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  historyEmoji: {
    fontSize: 16,
    marginRight: 12,
  },
  historyUrl: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
  }
});
