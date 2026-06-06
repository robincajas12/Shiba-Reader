import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';

// Components
import { Reader, ReaderRef } from '../components/Reader';
import { DictionaryPopup } from '../components/DictionaryPopup';

// Hooks
import { useReaderLookup } from '../hooks/useReaderLookup';
import { useBrowser } from '../hooks/useBrowser';
import { useTheme } from '../ThemeContext';

type RootStackParamList = {
  Reader: { url: string };
};

type ReaderScreenRouteProp = RouteProp<RootStackParamList, 'Reader'>;

export const ReaderScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<ReaderScreenRouteProp>();
  const navigation = useNavigation();
  const { addToHistory, addBookmark, removeBookmark, bookmarks } = useBrowser();
  const readerRef = React.useRef<ReaderRef>(null);
  
  const initialUrl = route.params?.url || 'https://www.google.com';
  const [currentUrl, setCurrentUrl] = React.useState(initialUrl);
  const [canGoBack, setCanGoBack] = React.useState(false);
  const [canGoForward, setCanGoForward] = React.useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = React.useState(true);
  const [progress, setProgress] = React.useState(0);

  const isFav = bookmarks.some(b => b.url === currentUrl);

  const toggleBookmark = async () => {
    if (isFav) {
      const bookmark = bookmarks.find(b => b.url === currentUrl);
      if (bookmark) await removeBookmark(bookmark.id);
    } else {
      await addBookmark('New Page', currentUrl);
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setIsLoading(navState.loading);
    
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

  const dynamicStyles = styles(theme);

  return (
    <View style={dynamicStyles.container}>
      {/* Mini Browser Header */}
      <View style={dynamicStyles.miniHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles.backButton}>
          <Text style={dynamicStyles.backButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={dynamicStyles.navControls}>
          <TouchableOpacity 
            onPress={() => readerRef.current?.goBack()} 
            disabled={!canGoBack}
            style={[dynamicStyles.navButton, !canGoBack && dynamicStyles.disabledButton]}
          >
            <Text style={dynamicStyles.navButtonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => readerRef.current?.goForward()} 
            disabled={!canGoForward}
            style={[dynamicStyles.navButton, !canGoForward && dynamicStyles.disabledButton]}
          >
            <Text style={dynamicStyles.navButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.urlDisplay}>
          <Text style={dynamicStyles.urlText} numberOfLines={1}>{currentUrl}</Text>
        </View>
        
        <TouchableOpacity 
          onPress={toggleScanner} 
          style={dynamicStyles.scannerToggle}
        >
          <Text style={[dynamicStyles.scannerToggleText, !isScannerEnabled && dynamicStyles.scannerDisabled]}>
        {isScannerEnabled ? '📖' : '🔒'}   
       </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleBookmark} style={dynamicStyles.favButton}>
          <Text style={[dynamicStyles.favButtonText, isFav && dynamicStyles.favActive]}>
            {isFav ? '★' : '☆'}
          </Text>
        </TouchableOpacity>

        {/* Progress Bar */}
        {isLoading && (
          <View style={[dynamicStyles.progressBar, { width: `${progress * 100}%` }]} />
        )}
      </View>

      <View style={dynamicStyles.mainContent}>
        <Reader 
          ref={readerRef}
          uri={initialUrl}
          onMessage={handleWebViewMessage}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadProgress={(e: any) => setProgress(e.nativeEvent.progress)}
          isScannerEnabled={isScannerEnabled}
        />

        {isLoading && progress < 0.9 && (
          <View style={dynamicStyles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={dynamicStyles.loadingText}>Loading page...</Text>
          </View>
        )}


        <DictionaryPopup 
          visible={popup.visible}
          top={popup.top}
          left={popup.left}
          sentence={popup.sentence}
          results={results}
          loading={loading}
          onClose={closePopup}
        />
      </View>
    </View>
  );
};

const styles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  miniHeader: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    marginRight: theme.spacing.xs,
  },
  backButtonText: {
    color: theme.colors.textMuted,
    fontSize: 18,
  },
  navControls: {
    flexDirection: 'row',
    marginRight: theme.spacing.sm,
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    fontSize: 20,
    color: theme.colors.accent,
  },
  disabledButton: {
    opacity: 0.3,
  },
  urlDisplay: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.md,
    marginRight: theme.spacing.sm,
  },
  urlText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  favButton: {
    padding: 5,
  },
  favButtonText: {
    fontSize: 22,
    color: theme.colors.border,
  },
  favActive: {
    color: theme.colors.star,
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
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    backgroundColor: theme.colors.primary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
});
