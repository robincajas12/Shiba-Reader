import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSRS } from '../hooks/useSRS';
import { useTheme } from '../ThemeContext';
import { StructuredContent } from '../components/StructuredContent';
import { MoreStackParamList } from '../navigation/AppNavigator';

type SRSReviewRouteProp = RouteProp<MoreStackParamList, 'SRSReview'>;

export const SRSReviewScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<SRSReviewRouteProp>();
  const { mode = 'normal' } = route.params || {};
  const { getPendingReviews, processReview } = useSRS();
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Contar duplicados en la sesión actual
  const duplicateTerms = useMemo(() => {
    const counts: { [key: string]: number } = {};
    reviews.forEach(r => {
      counts[r.term] = (counts[r.term] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    // Si el modo es 'queue', ordenamos por último encuentro en el lector
    const data = await getPendingReviews(mode === 'queue');
    setReviews(data);
    setLoading(false);
  }, [getPendingReviews, mode]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleGrade = async (grade: number) => {
    const currentReview = reviews[currentIndex];
    await processReview(currentReview.vocab_id, grade);
    
    if (currentIndex < reviews.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      // Fin de la sesión
      setReviews([]);
    }
  };

  const dynamicStyles = styles(theme);

  if (loading) {
    return (
      <View style={dynamicStyles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={dynamicStyles.center}>
        <Text style={dynamicStyles.emptyIcon}>🎉</Text>
        <Text style={dynamicStyles.emptyText}>
          {mode === 'queue' ? 'Queue empty!' : 'All caught up for today!'}
        </Text>
        <TouchableOpacity 
          style={dynamicStyles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={dynamicStyles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const current = reviews[currentIndex];
  const isReadingCard = current.card_type === 0;
  const isDuplicated = duplicateTerms[current.term] > 1;

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.modeBadge}>
            <Text style={dynamicStyles.modeBadgeText}>
                {mode === 'queue' ? 'MINING QUEUE' : 'DAILY REVIEW'}
            </Text>
        </View>
        <Text style={dynamicStyles.progressText}>
          {currentIndex + 1} / {reviews.length}
        </Text>
      </View>

      <View style={dynamicStyles.card}>
        <Text style={dynamicStyles.term}>{current.term}</Text>

        {(isDuplicated || mode === 'queue') && !showAnswer && (
          <View style={dynamicStyles.duplicateWarning}>
            <Text style={dynamicStyles.duplicateWarningText}>
              {mode === 'queue' ? 'Recent encounter context:' : '⚠️ Duplicate term. Use context:'}
            </Text>
            <Text style={dynamicStyles.duplicateSentencePreview} numberOfLines={3}>
              "{current.sentence}"
            </Text>
          </View>
        )}
        
        {showAnswer ? (
          <ScrollView style={dynamicStyles.answerContainer}>
            <Text style={dynamicStyles.readingLabel}>Reading:</Text>
            <Text style={dynamicStyles.reading}>{current.reading}</Text>
            
            {!isReadingCard && (
              <>
                <Text style={dynamicStyles.meaningLabel}>Meaning:</Text>
                <StructuredContent content={JSON.parse(current.definition)} />
              </>
            )}

            <Text style={dynamicStyles.contextLabel}>Context:</Text>
            <Text style={dynamicStyles.contextText}>{current.sentence}</Text>
          </ScrollView>
        ) : (
          <TouchableOpacity 
            style={dynamicStyles.revealButton} 
            onPress={() => setShowAnswer(true)}
          >
            <Text style={dynamicStyles.revealButtonText}>Show Answer</Text>
            <Text style={dynamicStyles.revealSubtext}>
              {isReadingCard ? "Reading Only" : "Reading + Meaning"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showAnswer && (
        <View style={dynamicStyles.footer}>
          <Text style={dynamicStyles.footerLabel}>Did you remember?</Text>
          <View style={dynamicStyles.gradeButtons}>
            <TouchableOpacity 
              style={[dynamicStyles.gradeButton, { backgroundColor: theme.colors.error }]} 
              onPress={() => handleGrade(1)}
            >
              <Text style={dynamicStyles.gradeButtonText}>Forgot Meaning</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[dynamicStyles.gradeButton, { backgroundColor: theme.colors.secondary }]} 
              onPress={() => handleGrade(3)}
            >
              <Text style={dynamicStyles.gradeButtonText}>Forgot Reading</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.gradeButton, { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border }]} 
              onPress={() => handleGrade(5)}
            >
              <Text style={[dynamicStyles.gradeButtonText, { color: theme.colors.text }]}>YES</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { 
    padding: 15, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  modeBadge: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: 1,
  },
  progressText: { color: theme.colors.textMuted, fontWeight: 'bold' },
  card: { 
    flex: 1, 
    margin: 20, 
    backgroundColor: theme.colors.surface, 
    borderRadius: 20, 
    padding: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignItems: 'center'
  },
  term: { fontSize: 48, fontWeight: 'bold', color: theme.colors.header, marginBottom: 40, textAlign: 'center' },
  duplicateWarning: {
    backgroundColor: theme.colors.primary + '10',
    padding: 12,
    borderRadius: 10,
    marginTop: -20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
    width: '100%',
  },
  duplicateWarningText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  duplicateSentencePreview: {
    fontSize: 14,
    color: theme.colors.text,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  revealButton: { 
    backgroundColor: theme.colors.primary, 
    paddingHorizontal: 30, 
    paddingVertical: 15, 
    borderRadius: 30,
    marginTop: 40
  },
  revealButtonText: { color: theme.colors.onPrimary, fontSize: 18, fontWeight: 'bold' },
  revealSubtext: { color: theme.colors.onPrimary, opacity: 0.7, fontSize: 12, textAlign: 'center', marginTop: 5 },
  answerContainer: { width: '100%' },
  readingLabel: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 4, fontWeight: 'bold' },
  reading: { fontSize: 24, color: theme.colors.accent, marginBottom: 20 },
  meaningLabel: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 4, marginTop: 10, fontWeight: 'bold' },
  contextLabel: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 4, marginTop: 20, fontWeight: 'bold' },
  contextText: { fontSize: 16, color: theme.colors.text, fontStyle: 'italic', lineHeight: 22 },
  footer: { padding: 20, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border },
  footerLabel: { textAlign: 'center', marginBottom: 15, color: theme.colors.textMuted, fontWeight: 'bold' },
  gradeButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  gradeButton: { flex: 1, marginHorizontal: 5, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  gradeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center' },
  emptyIcon: { fontSize: 64, marginBottom: 20 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text, marginBottom: 30 },
  backButton: { backgroundColor: theme.colors.primary, paddingHorizontal: 40, paddingVertical: 12, borderRadius: 25 },
  backButtonText: { color: theme.colors.onPrimary, fontWeight: 'bold' }
});
