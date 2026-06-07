import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ViewStyle, TextStyle, ActivityIndicator, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useVocabulary } from '../hooks/useVocabulary';
import { useTheme } from '../ThemeContext';
import { StructuredContent } from '../components/StructuredContent';

// Sub-component for each vocabulary card
const VocabularyItem: React.FC<{ item: any; onRemove: (id: number) => void }> = React.memo(({ item, onRemove }) => {
    const { theme } = useTheme();
    const [showDefinition, setShowDefinition] = useState(false);
    
    let parsedContent = null;
    try {
        parsedContent = JSON.parse(item.definition);
    } catch (e) {
        console.error("Error parsing definition:", e);
    }

    const getSRSStatus = () => {
        if (!item.repetitions || item.repetitions === 0) return { label: 'NEW', color: theme.colors.accent };
        if (item.repetitions < 4) return { label: 'LEARNING', color: theme.colors.primary };
        return { label: 'MASTERED', color: theme.colors.success };
    };

    const status = getSRSStatus();
    const dynamicStyles = styles(theme);

    return (
        <View style={dynamicStyles.card}>
            <View style={dynamicStyles.cardHeader}>
                <View style={dynamicStyles.termContainer}>
                    <View style={dynamicStyles.termRow}>
                        <Text style={dynamicStyles.term}>{item.term}</Text>
                        <View style={[dynamicStyles.statusBadge, { backgroundColor: status.color + '20', borderColor: status.color + '40' }]}>
                            <Text style={[dynamicStyles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
                        </View>
                    </View>
                    {item.reading !== item.term && <Text style={dynamicStyles.reading}>{item.reading}</Text>}
                </View>
                <TouchableOpacity 
                    onPress={() => onRemove(item.id)}
                    style={dynamicStyles.deleteButton}
                >
                    <Text style={dynamicStyles.deleteText}>✕</Text>
                </TouchableOpacity>
            </View>

            <View style={dynamicStyles.sentenceContainer}>
                <Text style={dynamicStyles.sentenceText} numberOfLines={3}>{item.sentence}</Text>
            </View>

            <TouchableOpacity 
                style={dynamicStyles.toggleButton} 
                onPress={() => setShowDefinition(!showDefinition)}
            >
                <Text style={dynamicStyles.toggleButtonText}>
                    {showDefinition ? 'Hide Glossary ▲' : 'Show Glossary ▼'}
                </Text>
            </TouchableOpacity>

            {showDefinition && parsedContent && (
                <View style={dynamicStyles.definitionContainer}>
                    <StructuredContent content={parsedContent} />
                </View>
            )}
            
            <View style={dynamicStyles.footer}>
                <Text style={dynamicStyles.footerInfo}>Interval: {item.interval || 0}d • Reps: {item.repetitions || 0}</Text>
                <Text style={dynamicStyles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
        </View>
    );
});

type SortMode = 'newest' | 'oldest' | 'alpha';

export const VocabularyScreen: React.FC = () => {
    const { theme } = useTheme();
    const { vocabulary, removeVocabulary, refreshVocabulary, todayCount, totalCount, dailyGoal } = useVocabulary();
    
    const [search, setSearch] = useState('');
    const [sortMode, setSortMode] = useState<SortMode>('newest');
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const PAGE_SIZE = 20;

    const loadData = useCallback(async (isInitial: boolean = true) => {
        if (isInitial) {
            setLoading(true);
            const data = await refreshVocabulary(PAGE_SIZE, 0, search, sortMode);
            setHasMore(data.length === PAGE_SIZE);
            setLoading(false);
        } else {
            if (loadingMore || !hasMore) return;
            setLoadingMore(true);
            const data = await refreshVocabulary(PAGE_SIZE, vocabulary.length, search, sortMode);
            setHasMore(data.length === PAGE_SIZE);
            setLoadingMore(false);
        }
    }, [refreshVocabulary, search, sortMode, vocabulary.length, loadingMore, hasMore]);

    // Cargar al entrar o al cambiar búsqueda/orden
    useFocusEffect(
        useCallback(() => {
            loadData(true);
        }, [search, sortMode])
    );

    const renderItem = ({ item }: { item: any }) => (
        <VocabularyItem item={item} onRemove={removeVocabulary} />
    );

    const dynamicStyles = styles(theme);

    const progress = Math.min(todayCount / dailyGoal, 1);
    const isGoalReached = todayCount >= dailyGoal;

    return (
        <View style={dynamicStyles.container}>
            <View style={dynamicStyles.headerSection}>
                <View style={dynamicStyles.goalCard}>
                    <View style={dynamicStyles.goalHeader}>
                        <View>
                            <Text style={dynamicStyles.goalTitle}>Library Progress</Text>
                            <Text style={dynamicStyles.totalText}>Total: {totalCount} words</Text>
                        </View>
                        <Text style={dynamicStyles.goalCount}>
                            {todayCount}/{dailyGoal}
                        </Text>
                    </View>
                    <View style={dynamicStyles.progressBarBg}>
                        <View style={[
                            dynamicStyles.progressBarFill, 
                            { width: `${progress * 100}%`, backgroundColor: isGoalReached ? theme.colors.success : theme.colors.primary }
                        ]} />
                    </View>
                </View>

                <View style={dynamicStyles.searchBar}>
                    <TextInput
                        style={dynamicStyles.searchInput}
                        placeholder="Search library..."
                        placeholderTextColor={theme.colors.textMuted}
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search !== '' && (
                        <TouchableOpacity onPress={() => setSearch('')} style={dynamicStyles.clearSearch}>
                            <Text style={{color: theme.colors.textMuted, fontWeight: 'bold'}}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={dynamicStyles.sortContainer}>
                    {(['newest', 'oldest', 'alpha'] as SortMode[]).map(mode => (
                        <TouchableOpacity 
                            key={mode}
                            onPress={() => setSortMode(mode)}
                            style={[
                                dynamicStyles.sortButton, 
                                sortMode === mode && { backgroundColor: theme.colors.primary }
                            ]}
                        >
                            <Text style={[
                                dynamicStyles.sortButtonText, 
                                sortMode === mode && { color: theme.colors.onPrimary }
                            ]}>
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {loading && vocabulary.length === 0 ? (
                <View style={dynamicStyles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={vocabulary}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={dynamicStyles.listContent}
                    showsVerticalScrollIndicator={false}
                    onEndReached={() => loadData(false)}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMore ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />
                        ) : <View style={{ height: 20 }} />
                    }
                    ListEmptyComponent={
                        <View style={dynamicStyles.emptyContainer}>
                            <Text style={dynamicStyles.emptyEmoji}>{search ? '🔍' : '📚'}</Text>
                            <Text style={dynamicStyles.emptyText}>
                                {search ? 'No matches found' : "Your library is empty"}
                            </Text>
                            <Text style={dynamicStyles.emptySubtext}>
                                {search ? 'Try a different search term' : 'Save words from the reader to see them here.'}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerSection: {
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    goalCard: {
        backgroundColor: theme.colors.background,
        padding: theme.spacing.md,
        borderRadius: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    listContent: {
        padding: theme.spacing.md,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    } as ViewStyle,
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.sm,
    } as ViewStyle,
    termContainer: {
        flex: 1,
    } as ViewStyle,
    termRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    term: {
        fontSize: 26,
        fontWeight: 'bold',
        color: theme.colors.header,
        marginRight: 10,
    } as TextStyle,
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
    },
    statusBadgeText: {
        fontSize: 9,
        fontWeight: '900',
    },
    reading: {
        fontSize: 15,
        color: theme.colors.accent,
        fontWeight: '600',
        marginTop: 2,
    } as TextStyle,
    toggleButton: {
        marginTop: theme.spacing.md,
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: 10,
    } as ViewStyle,
    toggleButtonText: {
        fontSize: 11,
        color: theme.colors.textMuted,
        fontWeight: '800',
        textTransform: 'uppercase',
    } as TextStyle,
    definitionContainer: {
        marginTop: theme.spacing.md,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background,
        borderRadius: 12,
    } as ViewStyle,
    deleteButton: {
        padding: 8,
        backgroundColor: theme.colors.background,
        borderRadius: 20,
    } as ViewStyle,
    deleteText: {
        fontSize: 14,
        color: theme.colors.error,
        fontWeight: 'bold',
    } as TextStyle,
    sentenceContainer: {
        marginTop: theme.spacing.md,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.card,
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.accent,
    } as ViewStyle,
    sentenceText: {
        fontSize: 14,
        color: theme.colors.text,
        fontStyle: 'italic',
        lineHeight: 20,
    } as TextStyle,
    footer: {
        marginTop: theme.spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border + '40',
    } as ViewStyle,
    footerInfo: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.textMuted,
    },
    date: {
        fontSize: 10,
        color: theme.colors.textMuted,
    } as TextStyle,
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    } as ViewStyle,
    emptyEmoji: {
        fontSize: 60,
        marginBottom: 20,
    } as TextStyle,
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 10,
    } as TextStyle,
    emptySubtext: {
        fontSize: 14,
        color: theme.colors.textMuted,
        textAlign: 'center',
    } as TextStyle,
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    } as ViewStyle,
    goalTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: theme.colors.header,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    } as TextStyle,
    totalText: {
        fontSize: 11,
        color: theme.colors.textMuted,
        fontWeight: '600',
    },
    goalCount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.primary,
    } as TextStyle,
    progressBarBg: {
        height: 8,
        backgroundColor: theme.colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    } as ViewStyle,
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    } as ViewStyle,
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 45,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 14,
    },
    clearSearch: {
        padding: 5,
    },
    sortContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    sortButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    sortButtonText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: theme.colors.textMuted,
    },
});
