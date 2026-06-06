import React, { createContext, useContext, useMemo } from 'react';
import { StyleSheet, Text, View, TextStyle, ViewStyle, TouchableOpacity } from 'react-native';
import { StructuredContentNode } from '../types';
import { useTheme } from '../ThemeContext';

// 1. Contexto para evitar re-renderizar todo el árbol
interface SelectionContextType {
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  isSelectionEnabled: boolean;
}

const SelectionContext = createContext<SelectionContextType>({
  selectedIds: new Set(),
  onToggle: () => {},
  isSelectionEnabled: false
});

interface StructuredContentProps {
  content: StructuredContentNode | StructuredContentNode[];
  isInsideRuby?: boolean;
  onToggleSense?: (id: string) => void;
  selectedSenseIds?: Set<string>;
}

/**
 * Indicador de selección que consume el contexto directamente
 */
const SelectionIndicator = React.memo(({ id, isSmall = false }: { id: string, isSmall?: boolean }) => {
  const { theme } = useTheme();
  const { selectedIds, onToggle, isSelectionEnabled } = useContext(SelectionContext);
  const dynamicStyles = styles(theme);
  
  if (!isSelectionEnabled) return null;
  
  const isSelected = selectedIds.has(id);

  return (
    <TouchableOpacity 
      style={[
        isSmall ? dynamicStyles.liCheckbox : dynamicStyles.checkbox, 
        isSelected && (isSmall ? dynamicStyles.liCheckboxSelected : dynamicStyles.checkboxSelected)
      ]} 
      onPress={() => onToggle(id)}
      activeOpacity={0.7}
    >
      {isSelected && <Text style={isSmall ? dynamicStyles.liCheckboxTick : dynamicStyles.checkboxTick}>✓</Text>}
    </TouchableOpacity>
  );
});

/**
 * Componente principal recursivo
 */
const ContentRenderer: React.FC<{ content: StructuredContentNode | StructuredContentNode[], isInsideRuby?: boolean }> = React.memo(({ 
  content, 
  isInsideRuby = false
}) => {
  const { theme } = useTheme();
  const dynamicStyles = styles(theme);

  if (!content) return null;

  if (typeof content === 'string') {
    return <Text style={isInsideRuby ? dynamicStyles.rubyBaseText : dynamicStyles.textNode}>{content}</Text>;
  }

  if (Array.isArray(content)) {
    const allInline = content.every(
      item => typeof item === 'string' || (typeof item === 'object' && (item?.tag === 'ruby' || item?.tag === 'span' || item?.tag === 'a'))
    );
    
    if (allInline) {
      return (
        <Text style={dynamicStyles.inlineWrap}>
          {content.map((item, i) => <ContentRenderer key={i} content={item} isInsideRuby={isInsideRuby} />)}
        </Text>
      );
    }
    return <>{content.map((item, i) => <ContentRenderer key={i} content={item} isInsideRuby={isInsideRuby} />)}</>;
  }

  if (typeof content === 'object') {
    if ('type' in content && content.type === 'structured-content') {
      return <ContentRenderer content={content.content as StructuredContentNode} />;
    }

    const { tag, content: innerContent, text: nodeText, data, id } = content;
    const role = data?.content;

    if (role === 'sense') {
      return (
        <View style={[dynamicStyles.block, dynamicStyles.senseBlock]}>
          <View style={dynamicStyles.senseSelector}>
            {id && <SelectionIndicator id={id} />}
            <View style={{ flex: 1 }}>
              {nodeText && <Text style={dynamicStyles.textNode}>{nodeText}</Text>}
              {innerContent && <ContentRenderer content={innerContent as StructuredContentNode} />}
            </View>
          </View>
        </View>
      );
    }

    if (tag === 'li') {
      return (
        <View style={dynamicStyles.listItem}>
          {id ? <SelectionIndicator id={id} isSmall={true} /> : <View style={dynamicStyles.bulletPoint} />}
          <View style={dynamicStyles.listItemContent}>
            {innerContent && <ContentRenderer content={innerContent as StructuredContentNode} />}
          </View>
        </View>
      );
    }

    if (tag === 'ruby') {
      return (
        <View style={dynamicStyles.rubyContainer}>
          <ContentRenderer content={innerContent as StructuredContentNode} isInsideRuby={true} />
        </View>
      );
    }

    if (tag === 'rt') {
      return (
        <Text style={dynamicStyles.rtText}>
          {nodeText || <ContentRenderer content={innerContent as StructuredContentNode} />}
        </Text>
      );
    }

    if (tag === 'ul' || role === 'sense-groups' || role === 'sense-group') {
      return (
        <View style={dynamicStyles.listContainer}>
          <ContentRenderer content={innerContent as StructuredContentNode} />
        </View>
      );
    }

    const layoutStyles: ViewStyle[] = [dynamicStyles.block];
    if (role === 'extra-info') layoutStyles.push(dynamicStyles.extraInfoBlock);
    if (role === 'example-sentence') layoutStyles.push(dynamicStyles.exampleSentence);
    if (role === 'attribution') layoutStyles.push(dynamicStyles.attributionLine);

    if (tag === 'span') {
      const isTag = data?.class === 'tag';
      return (
        <Text style={isTag ? dynamicStyles.posTag : dynamicStyles.spanText}>
          {nodeText || <ContentRenderer content={innerContent as StructuredContentNode} />}
        </Text>
      );
    }

    if (tag === 'a') {
      return (
        <Text style={dynamicStyles.link}>
          {nodeText || <ContentRenderer content={innerContent as StructuredContentNode} />}
        </Text>
      );
    }

    return (
      <View style={layoutStyles}>
        {nodeText && <Text style={dynamicStyles.textNode}>{nodeText}</Text>}
        {innerContent && <ContentRenderer content={innerContent as StructuredContentNode} />}
      </View>
    );
  }

  return null;
});

/**
 * Wrapper que proporciona el contexto si es necesario
 */
export const StructuredContent: React.FC<StructuredContentProps> = React.memo(({ 
  content, 
  isInsideRuby = false,
  onToggleSense,
  selectedSenseIds
}) => {
  const contextValue = useMemo(() => ({
    selectedIds: selectedSenseIds || new Set<string>(),
    onToggle: onToggleSense || (() => {}),
    isSelectionEnabled: !!onToggleSense
  }), [selectedSenseIds, onToggleSense]);

  return (
    <SelectionContext.Provider value={contextValue}>
      <ContentRenderer content={content} isInsideRuby={isInsideRuby} />
    </SelectionContext.Provider>
  );
});

const styles = (theme: any) => StyleSheet.create({
  textNode: { fontSize: 15, color: theme.colors.text, lineHeight: 22 } as TextStyle,
  spanText: { fontSize: 15, color: theme.colors.text } as TextStyle,
  posTag: { fontSize: 12, color: theme.colors.textMuted, fontStyle: 'italic', marginRight: 5 } as TextStyle,
  link: { color: theme.colors.accent, textDecorationLine: 'underline' } as TextStyle,
  inlineWrap: { flexDirection: 'row', flexWrap: 'wrap' } as ViewStyle,
  listContainer: { marginVertical: 4 } as ViewStyle,
  listItem: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' } as ViewStyle,
  bulletPoint: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.secondary, marginTop: 10, marginRight: 10 } as ViewStyle,
  listItemContent: { flex: 1 } as ViewStyle,
  block: { marginVertical: 2 } as ViewStyle,
  senseBlock: { marginBottom: 12, padding: 4, borderRadius: theme.radius.md } as ViewStyle,
  extraInfoBlock: { marginTop: 10, padding: 12, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, borderLeftWidth: 3, borderLeftColor: theme.colors.border } as ViewStyle,
  exampleSentence: { marginTop: 5, opacity: 0.8 } as ViewStyle,
  attributionLine: { marginTop: 15, opacity: 0.3 } as ViewStyle,
  rubyContainer: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 10, marginRight: 5 } as ViewStyle,
  rubyBaseText: { fontSize: 16, color: theme.colors.text } as TextStyle,
  rtText: { fontSize: 9, color: theme.colors.textMuted, position: 'absolute', top: -12, width: '100%', textAlign: 'center', fontWeight: 'bold' } as TextStyle,
  senseSelector: { flexDirection: 'row', alignItems: 'flex-start' } as ViewStyle,
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  } as ViewStyle,
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  } as ViewStyle,
  checkboxTick: { color: theme.colors.background, fontSize: 14, fontWeight: 'bold' } as TextStyle,
  liCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    marginRight: 10,
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  } as ViewStyle,
  liCheckboxSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  } as ViewStyle,
  liCheckboxTick: { color: theme.colors.background, fontSize: 11, fontWeight: 'bold' } as TextStyle,
});
