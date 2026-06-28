import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Dimensions, Animated } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';

// Components
import { Reader, ReaderRef } from '../components/Reader';
import { DictionaryPopup } from '../components/DictionaryPopup';

// Hooks
import { useReaderLookup } from '../hooks/useReaderLookup';
import { useBrowser } from '../hooks/useBrowser';
import { useVocabulary } from '../hooks/useVocabulary';
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
  const { updateLastCardSentence } = useVocabulary();
  const readerRef = useRef<ReaderRef>(null);
  
  const initialUrl = route.params?.url || 'https://www.google.com';
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Tools Settings
  const [showTools, setShowTools] = useState(false);
  const toolsAnim = useRef(new Animated.Value(0)).current;

  const isFav = bookmarks.some(b => b.url === currentUrl);

  // Animation for tools shelf
  useEffect(() => {
    Animated.spring(toolsAnim, {
      toValue: showTools ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8
    }).start();
  }, [showTools]);
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
    results, loading, popup, selectionMenu, isScannerEnabled, toggleScanner,
    handleWebViewMessage, handleSelectionSearch, closePopup, hideSelectionMenu
  } = useReaderLookup();

  const dynamicStyles = styles(theme);

  const toolsTranslateY = toolsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 0]
  });

  return (
    <View style={dynamicStyles.container}>
      {/* RESTORED ORIGINAL HEADER STYLE */}
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
        
        <View style={dynamicStyles.headerActions}>
            <TouchableOpacity 
                onPress={() => setShowTools(!showTools)} 
                style={[dynamicStyles.actionBtn, showTools && dynamicStyles.actionBtnActive]}
            >
                <Text style={dynamicStyles.actionIcon}>🛠️</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleBookmark} style={dynamicStyles.favButton}>
                <Text style={[dynamicStyles.favButtonText, isFav && dynamicStyles.favActive]}>
                    {isFav ? '★' : '☆'}
                </Text>
            </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={[dynamicStyles.progressBar, { width: `${progress * 100}%` }]} />
        )}
      </View>

      <View style={dynamicStyles.mainContent}>
        {/* TOOLS SHELF */}
        <Animated.View style={[dynamicStyles.toolsShelf, { transform: [{ translateY: toolsTranslateY }] }]}>
            <View style={dynamicStyles.shelfContent}>
                <View style={dynamicStyles.toolGroup}>
                    <Text style={dynamicStyles.toolLabel}>READING</Text>
                    <View style={dynamicStyles.row}>
                        <TouchableOpacity onPress={toggleScanner} style={[dynamicStyles.shelfItem, isScannerEnabled && dynamicStyles.shelfItemActive]}>
                            <Text style={[dynamicStyles.shelfItemText, isScannerEnabled && {color:'#fff'}]}>{isScannerEnabled ? 'ON' : 'OFF'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Animated.View>

        <Reader 
          ref={readerRef}
          uri={initialUrl}
          onMessage={(e) => {
            if (showTools) setShowTools(false);
            handleWebViewMessage(e);
          }}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadProgress={(e: any) => setProgress(e.nativeEvent.progress)}
          isScannerEnabled={isScannerEnabled}
        />

        {selectionMenu.visible && (
          <View style={[dynamicStyles.selectionMenuContainer, { top: Math.max(10, selectionMenu.top - 60), left: Math.max(10, Math.min(Dimensions.get('window').width - 240, selectionMenu.left - 50)) }]}>
            <TouchableOpacity style={dynamicStyles.selectionMenuButton} onPress={handleSelectionSearch}>
              <Text style={dynamicStyles.selectionButtonText}>Look-up</Text>
            </TouchableOpacity>
            <View style={dynamicStyles.selectionMenuDivider} />
            <TouchableOpacity style={dynamicStyles.selectionMenuButton} onPress={() => { updateLastCardSentence(selectionMenu.text); hideSelectionMenu(); }}>
              <Text style={dynamicStyles.selectionButtonText}>Update Card</Text>
            </TouchableOpacity>
          </View>
        )}

        <DictionaryPopup 
          visible={popup.visible} top={popup.top} left={popup.left}
          sentence={popup.sentence} results={results} loading={loading} onClose={closePopup}
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
    zIndex: 20,
  },
  backButton: { marginRight: theme.spacing.xs },
  backButtonText: { color: theme.colors.textMuted, fontSize: 18 },
  navControls: { flexDirection: 'row', marginRight: theme.spacing.sm },
  navButton: { padding: 8 },
  navButtonText: { fontSize: 20, color: theme.colors.accent },
  disabledButton: { opacity: 0.3 },
  urlDisplay: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.md,
    marginRight: theme.spacing.sm,
  },
  urlText: { fontSize: 12, color: theme.colors.textMuted },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { padding: 6, borderRadius: 8, marginRight: 4 },
  actionBtnActive: { backgroundColor: theme.colors.primary + '20' },
  actionIcon: { fontSize: 16 },
  favButton: { padding: 5 },
  favButtonText: { fontSize: 22, color: theme.colors.border },
  favActive: { color: theme.colors.star },
  progressBar: { position: 'absolute', bottom: 0, left: 0, height: 3, backgroundColor: theme.colors.primary },
  mainContent: { flex: 1, position: 'relative' },
  
  // TOOLS SHELF
  toolsShelf: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    backgroundColor: theme.colors.surface,
    padding: 15,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  shelfContent: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  toolGroup: { alignItems: 'center' },
  toolLabel: { fontSize: 8, fontWeight: 'bold', color: theme.colors.textMuted, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  shelfItem: { width: 36, height: 36, backgroundColor: theme.colors.background, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: theme.colors.border },
  shelfItemActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  shelfItemText: { fontSize: 12, fontWeight: 'bold', color: theme.colors.text },

  selectionMenuContainer: { position: 'absolute', backgroundColor: theme.colors.surface, flexDirection: 'row', borderRadius: 25, borderWidth: 1, borderColor: theme.colors.primary, elevation: 8, zIndex: 1000, overflow: 'hidden' },
  selectionMenuButton: { paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center', alignItems: 'center' },
  selectionMenuDivider: { width: 1, backgroundColor: theme.colors.border, marginVertical: 8 },
  selectionButtonText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 13 },
});


