import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useVocabulary } from '../hooks/useVocabulary';
import { VocabularyEntry } from '../db/schemas/Vocabulary';
import { useTheme } from '../ThemeContext';
import { StructuredContent } from '../components/StructuredContent';

// Sub-component for each vocabulary card
const VocabularyItem: React.FC<{ item: VocabularyEntry; onRemove: (id: number) => void }> = React.memo(({ item, onRemove }) => {
    const { theme } = useTheme();
    const [showDefinition, setShowDefinition] = useState(false);
    
    let parsedContent = null;
    try {
        parsedContent = JSON.parse(item.definition);
    } catch (e) {
        console.error("Error parsing definition:", e);
    }

    const dynamicStyles = styles(theme);

    return (
        <View style={dynamicStyles.card}>
            <View style={dynamicStyles.cardHeader}>
                <View style={dynamicStyles.termContainer}>
                    <Text style={dynamicStyles.term}>{item.term}</Text>
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
                <Text style={dynamicStyles.sentenceLabel}>Contexto:</Text>
                <Text style={dynamicStyles.sentenceText}>{item.sentence}</Text>
            </View>

            <TouchableOpacity 
                style={dynamicStyles.toggleButton} 
                onPress={() => setShowDefinition(!showDefinition)}
            >
                <Text style={dynamicStyles.toggleButtonText}>
                    {showDefinition ? 'ocultar definición ▲' : 'ver definición ▼'}
                </Text>
            </TouchableOpacity>

            {showDefinition && parsedContent && (
                <View style={dynamicStyles.definitionContainer}>
                    <StructuredContent content={parsedContent} />
                </View>
            )}
            
            <View style={dynamicStyles.footer}>
                <Text style={dynamicStyles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
        </View>
    );
});

export const VocabularyScreen: React.FC = () => {
    const { theme } = useTheme();
    const { vocabulary, removeVocabulary, refreshVocabulary } = useVocabulary();

    useFocusEffect(
        useCallback(() => {
            refreshVocabulary();
        }, [refreshVocabulary])
    );

    const renderItem = ({ item }: { item: VocabularyEntry }) => (
        <VocabularyItem item={item} onRemove={removeVocabulary} />
    );

    const dynamicStyles = styles(theme);

    return (
        <View style={dynamicStyles.container}>
            <FlatList
                data={vocabulary}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={dynamicStyles.listContent}
                ListEmptyComponent={
                    <View style={dynamicStyles.emptyContainer}>
                        <Text style={dynamicStyles.emptyEmoji}>📚</Text>
                        <Text style={dynamicStyles.emptyText}>Aún no has guardado ninguna palabra.</Text>
                        <Text style={dynamicStyles.emptySubtext}>Usa el botón "+" en el lector para guardar vocabulario con su contexto.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    listContent: {
        padding: theme.spacing.md,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        elevation: 2,
        shadowColor: theme.colors.black,
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
    term: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.header,
    } as TextStyle,
    reading: {
        fontSize: 14,
        color: theme.colors.textMuted,
    } as TextStyle,
    toggleButton: {
        marginTop: theme.spacing.md,
        paddingVertical: 8,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    } as ViewStyle,
    toggleButtonText: {
        fontSize: 12,
        color: theme.colors.accent,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    } as TextStyle,
    definitionContainer: {
        marginTop: theme.spacing.sm,
        paddingBottom: theme.spacing.sm,
    } as ViewStyle,
    deleteButton: {
        padding: 5,
    } as ViewStyle,
    deleteText: {
        fontSize: 18,
        color: theme.colors.error,
        fontWeight: 'bold',
    } as TextStyle,
    sentenceContainer: {
        marginTop: theme.spacing.md,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
    } as ViewStyle,
    sentenceLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.textMuted,
        marginBottom: 4,
        textTransform: 'uppercase',
    } as TextStyle,
    sentenceText: {
        fontSize: 14,
        color: theme.colors.text,
        fontStyle: 'italic',
        lineHeight: 20,
    } as TextStyle,
    footer: {
        marginTop: theme.spacing.md,
        alignItems: 'flex-end',
    } as ViewStyle,
    date: {
        fontSize: 10,
        color: theme.colors.textMuted,
    } as TextStyle,
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    } as ViewStyle,
    emptyEmoji: {
        fontSize: 64,
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
});
