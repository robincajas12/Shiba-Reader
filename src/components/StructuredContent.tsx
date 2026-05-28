import React from 'react';
import { StyleSheet, Text, View, TextStyle, ViewStyle } from 'react-native';
import { StructuredContentNode } from '../types';

interface StructuredContentProps {
  content: StructuredContentNode | StructuredContentNode[];
  isInsideRuby?: boolean;
}

/**
 * Recursive renderer for Jitendex's complex JSON data structure.
 */
export const StructuredContent: React.FC<StructuredContentProps> = ({ content, isInsideRuby = false }) => {
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
          {content.map((item, i) => <StructuredContent key={i} content={item} isInsideRuby={isInsideRuby} />)}
        </Text>
      );
    }
    return <>{content.map((item, i) => <StructuredContent key={i} content={item} isInsideRuby={isInsideRuby} />)}</>;
  }

  if (typeof content === 'object') {
    if ('type' in content && content.type === 'structured-content') {
      return <StructuredContent content={content.content as StructuredContentNode} />;
    }

    const { tag, content: innerContent, text: nodeText, data } = content;
    const role = data?.content;

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
          <StructuredContent content={innerContent as StructuredContentNode} />
        </View>
      );
    }

    if (tag === 'li') {
      return (
        <View style={styles.listItem}>
          <View style={styles.bulletPoint} />
          <View style={styles.listItemContent}>
            <StructuredContent content={innerContent as StructuredContentNode} />
          </View>
        </View>
      );
    }

    const layoutStyles: ViewStyle[] = [styles.block];
    if (role === 'sense') layoutStyles.push(styles.senseBlock);
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
        {innerContent && <StructuredContent content={innerContent as StructuredContentNode} />}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  textNode: { fontSize: 15, color: '#444', lineHeight: 22 } as TextStyle,
  spanText: { fontSize: 15, color: '#444' } as TextStyle,
  posTag: { fontSize: 12, color: '#888', fontStyle: 'italic', marginRight: 5 } as TextStyle,
  link: { color: '#3182ce', textDecorationLine: 'underline' } as TextStyle,
  inlineWrap: { flexDirection: 'row', flexWrap: 'wrap' } as ViewStyle,
  listContainer: { marginVertical: 4 } as ViewStyle,
  listItem: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' } as ViewStyle,
  bulletPoint: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#CCC', marginTop: 10, marginRight: 10 } as ViewStyle,
  listItemContent: { flex: 1 } as ViewStyle,
  block: { marginVertical: 2 } as ViewStyle,
  senseBlock: { marginBottom: 12 } as ViewStyle,
  extraInfoBlock: { marginTop: 10, padding: 12, backgroundColor: '#F9F9F9', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#EEE' } as ViewStyle,
  exampleSentence: { marginTop: 5, opacity: 0.8 } as ViewStyle,
  attributionLine: { marginTop: 15, opacity: 0.3 } as ViewStyle,
  rubyContainer: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 10, marginRight: 5 } as ViewStyle,
  rubyBaseText: { fontSize: 16, color: '#000' } as TextStyle,
  rtText: { fontSize: 9, color: '#999', position: 'absolute', top: -12, width: '100%', textAlign: 'center', fontWeight: 'bold' } as TextStyle,
});
