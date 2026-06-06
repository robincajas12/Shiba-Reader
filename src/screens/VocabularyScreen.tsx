import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useVocabulary } from '../hooks/useVocabulary';
import { VocabularyEntry } from '../db/schemas/Vocabulary';
import { Theme } from '../theme';
import { StructuredContent } from '../components/StructuredContent';

// Sub-component for each vocabulary card to handle its own toggle state safely
const VocabularyItem: React.FC<{ item: VocabularyEntry; onRemove: (id: number) => void }> = React.memo(({ item, onRemove }) => {
    const [showDefinition, setShowDefinition] = useState(false);
    
    let parsedContent = null;
    try {
        parsedContent = JSON.parse(item.definition);
    } catch (e) {
        console.error("Error parsing definition:", e);
    }

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.termContainer}>
                    <Text style={styles.term}>{item.term}</Text>
                    {item.reading !== item.term && <Text style={styles.reading}>{item.reading}</Text>}
                </View>
                <TouchableOpacity 
                    onPress={() => onRemove(item.id)}
                    style={styles.deleteButton}
                >
                    <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.sentenceContainer}>
                <Text style={styles.sentenceLabel}>Contexto:</Text>
                <Text style={styles.sentenceText}>{item.sentence}</Text>
            </View>

            <TouchableOpacity 
                style={styles.toggleButton} 
                onPress={() => setShowDefinition(!showDefinition)}
            >
                <Text style={styles.toggleButtonText}>
                    {showDefinition ? 'ocultar definición ▲' : 'ver definición ▼'}
                </Text>
            </TouchableOpacity>

            {showDefinition && parsedContent && (
                <View style={styles.definitionContainer}>
                    <StructuredContent content={parsedContent} />
                </View>
            )}
            
            <View style={styles.footer}>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
        </View>
    );
});

export const VocabularyScreen: React.FC = () => {
    const { vocabulary, removeVocabulary, refreshVocabulary } = useVocabulary();

    useFocusEffect(
        useCallback(() => {
            refreshVocabulary();
        }, [refreshVocabulary])
    );

    const renderItem = ({ item }: { item: VocabularyEntry }) => (
        <VocabularyItem item={item} onRemove={removeVocabulary} />
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={vocabulary}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>📚</Text>
                        <Text style={styles.emptyText}>Aún no has guardado ninguna palabra.</Text>
                        <Text style={styles.emptySubtext}>Usa el botón "+" en el lector para guardar vocabulario con su contexto.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    listContent: {
        padding: Theme.spacing.md,
    },
    card: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.radius.lg,
        padding: Theme.spacing.lg,
        marginBottom: Theme.spacing.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        elevation: 2,
        shadowColor: Theme.colors.black,
        shadowOpacity: 0.1,
        shadowRadius: 4,
    } as ViewStyle,
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Theme.spacing.sm,
    } as ViewStyle,
    termContainer: {
        flex: 1,
    } as ViewStyle,
    term: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Theme.colors.header,
    } as TextStyle,
    reading: {
        fontSize: 14,
        color: Theme.colors.textMuted,
    } as TextStyle,
    toggleButton: {
        marginTop: Theme.spacing.md,
        paddingVertical: 8,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: Theme.colors.border,
    } as ViewStyle,
    toggleButtonText: {
        fontSize: 12,
        color: Theme.colors.accent,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    } as TextStyle,
    definitionContainer: {
        marginTop: Theme.spacing.sm,
        paddingBottom: Theme.spacing.sm,
    } as ViewStyle,
    deleteButton: {
        padding: 5,
    } as ViewStyle,
    deleteText: {
        fontSize: 18,
        color: Theme.colors.error,
        fontWeight: 'bold',
    } as TextStyle,
    sentenceContainer: {
        marginTop: Theme.spacing.md,
        padding: Theme.spacing.md,
        backgroundColor: Theme.colors.card,
        borderRadius: Theme.radius.md,
        borderLeftWidth: 4,
        borderLeftColor: Theme.colors.primary,
    } as ViewStyle,
    sentenceLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Theme.colors.textMuted,
        marginBottom: 4,
        textTransform: 'uppercase',
    } as TextStyle,
    sentenceText: {
        fontSize: 14,
        color: Theme.colors.text,
        fontStyle: 'italic',
        lineHeight: 20,
    } as TextStyle,
    footer: {
        marginTop: Theme.spacing.md,
        alignItems: 'flex-end',
    } as ViewStyle,
    date: {
        fontSize: 10,
        color: Theme.colors.textMuted,
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
        color: Theme.colors.text,
        textAlign: 'center',
        marginBottom: 10,
    } as TextStyle,
    emptySubtext: {
        fontSize: 14,
        color: Theme.colors.textMuted,
        textAlign: 'center',
    } as TextStyle,
});
