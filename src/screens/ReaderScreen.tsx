import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';

// Components
import { Reader, ReaderRef } from '../components/Reader';
import { DictionaryPopup } from '../components/DictionaryPopup';

// Hooks
import { useReaderLookup } from '../hooks/useReaderLookup';
import { useBrowser } from '../hooks/useBrowser';
import { Theme } from '../theme';

type RootStackParamList = {
  Reader: { url: string };
};

type ReaderScreenRouteProp = RouteProp<RootStackParamList, 'Reader'>;

export const ReaderScreen: React.FC = () => {
  const route = useRoute<ReaderScreenRouteProp>();
  const navigation = useNavigation();
  const { addToHistory, addBookmark, removeBookmark, bookmarks } = useBrowser();
  const readerRef = React.useRef<ReaderRef>(null);
  
  const initialUrl = route.params?.url || 'https://www.google.com';
  const [currentUrl, setCurrentUrl] = React.useState(initialUrl);
  const [canGoBack, setCanGoBack] = React.useState(false);
  const [canGoForward, setCanGoForward] = React.useState(false);

  const isFav = bookmarks.some(b => b.url === currentUrl);

  const toggleBookmark = async () => {
    if (isFav) {
      const bookmark = bookmarks.find(b => b.url === currentUrl);
      if (bookmark) await removeBookmark(bookmark.id);
    } else {
      await addBookmark('Nueva Página', currentUrl);
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    
    if (navState.url && navState.url !== currentUrl) {
      setCurrentUrl(navState.url);
      addToHistory(navState.url);
    }
  };

  useEffect(() => {
    if (initialUrl) {
      setCurrentUrl(initialUrl);
      addToHistory(initialUrl);
    }
  }, [initialUrl, addToHistory]);

  const { 
    results, 
    loading, 
    popup, 
    isScannerEnabled,
    toggleScanner,
    handleWebViewMessage, 
    closePopup 
  } = useReaderLookup();

  return (
    <View style={styles.container}>
      {/* Mini Browser Header */}
      <View style={styles.miniHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.navControls}>
          <TouchableOpacity 
            onPress={() => readerRef.current?.goBack()} 
            disabled={!canGoBack}
            style={[styles.navButton, !canGoBack && styles.disabledButton]}
          >
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => readerRef.current?.goForward()} 
            disabled={!canGoForward}
            style={[styles.navButton, !canGoForward && styles.disabledButton]}
          >
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.urlDisplay}>
          <Text style={styles.urlText} numberOfLines={1}>{currentUrl}</Text>
        </View>
        
        <TouchableOpacity 
          onPress={toggleScanner} 
          style={styles.scannerToggle}
        >
          <Text style={[styles.scannerToggleText, !isScannerEnabled && styles.scannerDisabled]}>
        {isScannerEnabled ? '📖' : '🔒'}   
       </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleBookmark} style={styles.favButton}>
          <Text style={[styles.favButtonText, isFav && styles.favActive]}>
            {isFav ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        <Reader 
          ref={readerRef}
          uri={initialUrl}
          onMessage={handleWebViewMessage}
          onNavigationStateChange={handleNavigationStateChange}
          isScannerEnabled={isScannerEnabled}
        />

        <DictionaryPopup 
          visible={popup.visible}
          top={popup.top}
          left={popup.left}
          results={results}
          loading={loading}
          onClose={closePopup}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  miniHeader: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  backButton: {
    marginRight: Theme.spacing.xs,
  },
  backButtonText: {
    color: Theme.colors.textMuted,
    fontSize: 18,
  },
  navControls: {
    flexDirection: 'row',
    marginRight: Theme.spacing.sm,
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    fontSize: 20,
    color: Theme.colors.accent,
  },
  disabledButton: {
    opacity: 0.3,
  },
  urlDisplay: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radius.md,
    marginRight: Theme.spacing.sm,
  },
  urlText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  },
  favButton: {
    padding: 5,
  },
  favButtonText: {
    fontSize: 22,
    color: Theme.colors.border,
  },
  favActive: {
    color: Theme.colors.star,
  },
  scannerToggle: {
    padding: 5,
    marginRight: 5,
  },
  scannerToggleText: {
    fontSize: 20,
  },
  scannerDisabled: {
    opacity: 0.5,
  },
  mainContent: { 
    flex: 1, 
    position: 'relative' 
  },
});
