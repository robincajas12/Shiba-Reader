import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, TextStyle, ViewStyle, TouchableOpacity } from 'react-native';
import { StructuredContentNode } from '../types';
import { Theme } from '../theme';

interface StructuredContentProps {
  content: StructuredContentNode | StructuredContentNode[];
  isInsideRuby?: boolean;
  onToggleSense?: (id: string) => void;
  isSelected?: boolean; // Prop para saber si este nodo específico está seleccionado
  selectedSenseIds?: Set<string>;
}

/**
 * Componente interno para manejar la lógica de selección sin re-renderizar todo
 */
const SelectionIndicator = React.memo(({ isSelected, onToggle, isSmall = false }: { isSelected: boolean, onToggle: () => void, isSmall?: boolean }) => (
  <TouchableOpacity 
    style={[
      isSmall ? styles.liCheckbox : styles.checkbox, 
      isSelected && (isSmall ? styles.liCheckboxSelected : styles.checkboxSelected)
    ]} 
    onPress={onToggle}
    activeOpacity={0.7}
  >
    {isSelected && <Text style={isSmall ? styles.liCheckboxTick : styles.checkboxTick}>✓</Text>}
  </TouchableOpacity>
));

export const StructuredContent: React.FC<StructuredContentProps> = React.memo(({ 
  content, 
  isInsideRuby = false,
  onToggleSense,
  selectedSenseIds
}) => {
  if (!content) return null;

  if (typeof content === 'string') {
    return <Text style={isInsideRuby ? styles.rubyBaseText : styles.textNode}>{content}</Text>;
  }

  if (Array.isArray(content)) {
    const allInline = content.every(
      item => typeof item === 'string' || (typeof item === 'object' && (item?.tag === 'ruby' || item?.tag === 'span' || item?.tag === 'a'))
    );
    
    if (allInline) {
      return (
        <Text style={styles.inlineWrap}>
          {content.map((item, i) => (
            <StructuredContent 
              key={i} 
              content={item} 
              isInsideRuby={isInsideRuby} 
              onToggleSense={onToggleSense}
              selectedSenseIds={selectedSenseIds}
            />
          ))}
        </Text>
      );
    }
    return (
      <>
        {content.map((item, i) => (
          <StructuredContent 
            key={i} 
            content={item} 
            isInsideRuby={isInsideRuby}
            onToggleSense={onToggleSense}
            selectedSenseIds={selectedSenseIds}
          />
        ))}
      </>
    );
  }

  if (typeof content === 'object') {
    if ('type' in content && content.type === 'structured-content') {
      return (
        <StructuredContent 
          content={content.content as StructuredContentNode} 
          onToggleSense={onToggleSense}
          selectedSenseIds={selectedSenseIds}
        />
      );
    }

    const { tag, content: innerContent, text: nodeText, data, id } = content;
    const role = data?.content;

    // Renderizado de bloque de significado (Sense)
    if (role === 'sense') {
      const isSelected = id ? selectedSenseIds?.has(id) : false;
      return (
        <View style={[styles.block, styles.senseBlock, isSelected && styles.selectedSense]}>
          <View style={styles.senseSelector}>
            {id && onToggleSense && (
              <SelectionIndicator 
                isSelected={isSelected} 
                onToggle={() => onToggleSense(id)} 
              />
            )}
            <View style={{ flex: 1 }}>
              {nodeText && <Text style={styles.textNode}>{nodeText}</Text>}
              {innerContent && (
                <StructuredContent 
                  content={innerContent as StructuredContentNode} 
                  onToggleSense={onToggleSense}
                  selectedSenseIds={selectedSenseIds}
                />
              )}
            </View>
          </View>
        </View>
      );
    }

    if (tag === 'li') {
      const isSelected = id ? selectedSenseIds?.has(id) : false;
      return (
        <View style={styles.listItem}>
          {id && onToggleSense ? (
            <SelectionIndicator 
                isSelected={isSelected} 
                onToggle={() => onToggleSense(id)} 
                isSmall={true}
            />
          ) : (
            <View style={styles.bulletPoint} />
          )}
          <View style={styles.listItemContent}>
            <StructuredContent 
              content={innerContent as StructuredContentNode} 
              onToggleSense={onToggleSense}
              selectedSenseIds={selectedSenseIds}
            />
          </View>
        </View>
      );
    }

    // Resto de etiquetas...
    if (tag === 'ruby') {
      return (
        <View style={styles.rubyContainer}>
          <StructuredContent content={innerContent as StructuredContentNode} isInsideRuby={true} />
        </View>
      );
    }

    if (tag === 'rt') {
      return (
        <Text style={styles.rtText}>
          {nodeText || <StructuredContent content={innerContent as StructuredContentNode} />}
        </Text>
      );
    }

    if (tag === 'ul' || role === 'sense-groups' || role === 'sense-group') {
      return (
        <View style={styles.listContainer}>
          <StructuredContent 
            content={innerContent as StructuredContentNode} 
            onToggleSense={onToggleSense}
            selectedSenseIds={selectedSenseIds}
          />
        </View>
      );
    }

    const layoutStyles: ViewStyle[] = [styles.block];
    if (role === 'extra-info') layoutStyles.push(styles.extraInfoBlock);
    if (role === 'example-sentence') layoutStyles.push(styles.exampleSentence);
    if (role === 'attribution') layoutStyles.push(styles.attributionLine);

    if (tag === 'span') {
      const isTag = data?.class === 'tag';
      return (
        <Text style={isTag ? styles.posTag : styles.spanText}>
          {nodeText || <StructuredContent content={innerContent as StructuredContentNode} />}
        </Text>
      );
    }

    if (tag === 'a') {
      return (
        <Text style={styles.link}>
          {nodeText || <StructuredContent content={innerContent as StructuredContentNode} />}
        </Text>
      );
    }

    return (
      <View style={layoutStyles}>
        {nodeText && <Text style={styles.textNode}>{nodeText}</Text>}
        {innerContent && (
          <StructuredContent 
            content={innerContent as StructuredContentNode} 
            onToggleSense={onToggleSense}
            selectedSenseIds={selectedSenseIds}
          />
        )}
      </View>
    );
  }

  return null;
}, (prev, next) => {
    // Optimización crítica: Solo re-renderizar si el contenido cambia 
    // o si el conjunto de IDs seleccionados es diferente
    return prev.content === next.content && prev.selectedSenseIds === next.selectedSenseIds;
});

const styles = StyleSheet.create({
  textNode: { fontSize: 15, color: Theme.colors.text, lineHeight: 22 } as TextStyle,
  spanText: { fontSize: 15, color: Theme.colors.text } as TextStyle,
  posTag: { fontSize: 12, color: Theme.colors.textMuted, fontStyle: 'italic', marginRight: 5 } as TextStyle,
  link: { color: Theme.colors.accent, textDecorationLine: 'underline' } as TextStyle,
  inlineWrap: { flexDirection: 'row', flexWrap: 'wrap' } as ViewStyle,
  listContainer: { marginVertical: 4 } as ViewStyle,
  listItem: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' } as ViewStyle,
  bulletPoint: { width: 4, height: 4, borderRadius: 2, backgroundColor: Theme.colors.secondary, marginTop: 10, marginRight: 10 } as ViewStyle,
  listItemContent: { flex: 1 } as ViewStyle,
  block: { marginVertical: 2 } as ViewStyle,
  senseBlock: { marginBottom: 12, padding: 4, borderRadius: Theme.radius.md } as ViewStyle,
  selectedSense: { backgroundColor: Theme.colors.card + '40' } as ViewStyle,
  extraInfoBlock: { marginTop: 10, padding: 12, backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.md, borderLeftWidth: 3, borderLeftColor: Theme.colors.border } as ViewStyle,
  exampleSentence: { marginTop: 5, opacity: 0.8 } as ViewStyle,
  attributionLine: { marginTop: 15, opacity: 0.3 } as ViewStyle,
  rubyContainer: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 10, marginRight: 5 } as ViewStyle,
  rubyBaseText: { fontSize: 16, color: Theme.colors.text } as TextStyle,
  rtText: { fontSize: 9, color: Theme.colors.textMuted, position: 'absolute', top: -12, width: '100%', textAlign: 'center', fontWeight: 'bold' } as TextStyle,
  senseSelector: { flexDirection: 'row', alignItems: 'flex-start' } as ViewStyle,
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
  } as ViewStyle,
  checkboxSelected: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  } as ViewStyle,
  checkboxTick: { color: Theme.colors.background, fontSize: 14, fontWeight: 'bold' } as TextStyle,
  liCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    marginRight: 10,
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
  } as ViewStyle,
  liCheckboxSelected: {
    backgroundColor: Theme.colors.accent,
    borderColor: Theme.colors.accent,
  } as ViewStyle,
  liCheckboxTick: { color: Theme.colors.background, fontSize: 11, fontWeight: 'bold' } as TextStyle,
});
