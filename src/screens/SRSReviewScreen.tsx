import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useSRS } from '../hooks/useSRS';
import { useTheme } from '../ThemeContext';
import { StructuredContent } from '../components/StructuredContent';
import { MoreStackParamList } from '../navigation/AppNavigator';
import { calculateNextReview } from '../utils/srsLogic';
import { useSettings } from '../hooks/useSettings';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

type SRSReviewRouteProp = RouteProp<MoreStackParamList, 'SRSReview'>;

export const SRSReviewScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<SRSReviewRouteProp>();
  const { mode = 'normal' } = route.params || {};
  const { getPendingReviews, processReview } = useSRS();
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [initialTotal, setInitialTotal] = useState(0); // Total original de la sesión
  const [showAnswer, setShowAnswer] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);

  const { isAdFree } = useSettings();
  const [interstitial, setInterstitial] = useState<any>(null);
  const [adLoaded, setAdLoaded] = useState(false);

  // Carga condicional del Intersticial
  useEffect(() => {
    if (isAdFree) return; // 🛑 Salida inmediata si es Premium: no crea ni precarga nada.

    const adInstance = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = adInstance.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setAdLoaded(true);
      }
    );

    const unsubscribeClosed = adInstance.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        navigation.goBack();
      }
    );

    adInstance.load();
    setInterstitial(adInstance);

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, [isAdFree, navigation]);

  const handleFinish = () => {
    if (!isAdFree && adLoaded && interstitial) {
      interstitial.show();
    } else {
      navigation.goBack();
    }
  };

  // Contar duplicados reales (distintos vocab_id) en la sesión actual
  const duplicateTerms = useMemo(() => {
    const termMap: { [key: string]: Set<number> } = {};
    reviews.forEach(r => {
      if (!termMap[r.term]) termMap[r.term] = new Set();
      termMap[r.term].add(r.vocab_id);
    });
    
    const counts: { [key: string]: number } = {};
    Object.keys(termMap).forEach(term => {
      counts[term] = termMap[term].size;
    });
    return counts;
  }, [reviews]);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    // Si el modo es 'queue', ordenamos por último encuentro en el lector
    const data = await getPendingReviews(mode === 'queue');
    setReviews(data);
    setInitialTotal(data.length); // Guardamos el total inicial de palabras pendientes
    setLoading(false);
  }, [getPendingReviews, mode]);

  // RESETEAR Y CARGAR AL ENTRAR (Solo usamos useFocusEffect para evitar doble carga)
  useFocusEffect(
    useCallback(() => {
      setSessionFinished(false);
      setCurrentIndex(0);
      setShowAnswer(false);
      setShowContext(false);
      loadReviews();
    }, [loadReviews])
  );

  const handleGrade = async (grade: number) => {
    const currentReview = reviews[currentIndex];
    
    // Procesamos el repaso en la BD
    const result = await processReview(currentReview.vocab_id, grade);
    
    // IMPORTANTE: Calculamos la nueva lista de reviews ANTES de actualizar el estado
    let updatedReviews = [...reviews];
    if (grade < 5) {
        const updatedCard = {
            ...currentReview,
            interval: result?.interval || 0,
            ease_factor: result?.ease_factor || 2.5,
            repetitions: result?.repetitions || 0,
            card_type: result?.card_type || 1,
            isRelearning: true
        };
        updatedReviews.push(updatedCard);
        setReviews(updatedReviews);
    }
    
    // Usamos updatedReviews.length para saber si realmente hemos terminado
    if (currentIndex < updatedReviews.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setShowContext(false);
    } else {
      // Fin de la sesión real
      setSessionFinished(true);
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

  if (reviews.length === 0 || sessionFinished) {
    return (
      <View style={dynamicStyles.center}>
        <Text style={dynamicStyles.emptyIcon}>🎉</Text>
        <Text style={dynamicStyles.emptyText}>
          {sessionFinished ? 'Session Finished!' : mode === 'queue' ? 'Queue empty!' : 'All caught up for today!'}
        </Text>
        {sessionFinished && (
            <Text style={dynamicStyles.summaryText}>
                You have processed {initialTotal} items.
            </Text>
        )}
        <TouchableOpacity 
          style={dynamicStyles.backButton} 
          onPress={handleFinish}
        >
          <Text style={dynamicStyles.backButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const current = reviews[currentIndex];
  const isReadingCard = current.card_type === 0;
  const isDuplicated = duplicateTerms[current.term] > 1;
  const shouldShowContext = isDuplicated || mode === 'queue' || showContext;

  // Calcular intervalos previstos para mostrar en los botones
  const getPreview = (grade: number) => {
    if (grade < 5) return 'Re-learn';

    const res = calculateNextReview(
        current.interval || 0,
        current.ease_factor || 2.5,
        current.repetitions || 0,
        grade,
        current.card_type || 1
    );
    
    const time = res.interval >= 30 ? `${Math.round(res.interval/30)}mo` : `${res.interval}d`;
    return time;
  };

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.modeBadge}>
            <Text style={dynamicStyles.modeBadgeText}>
                {mode === 'queue' ? 'MINING QUEUE' : 'DAILY REVIEW'}
            </Text>
        </View>
        <Text style={dynamicStyles.progressText}>
          {Math.min(currentIndex + 1, initialTotal)} / {initialTotal}
          {currentIndex + 1 > initialTotal && <Text style={{fontSize: 10, color: theme.colors.accent}}> (+{currentIndex + 1 - initialTotal} retry)</Text>}
        </Text>
      </View>

      <View style={dynamicStyles.card}>
        {current.isRelearning && (
            <View style={dynamicStyles.relearningBadge}>
                <Text style={dynamicStyles.relearningBadgeText}>RE-LEARNING</Text>
            </View>
        )}
        <Text style={dynamicStyles.term}>{current.term}</Text>

        {shouldShowContext && !showAnswer && (
          <View style={dynamicStyles.duplicateWarning}>
            <Text style={dynamicStyles.duplicateWarningText}>
              {mode === 'queue' ? 'Recent encounter context:' : isDuplicated ? '⚠️ Duplicate term. Use context:' : 'Context:'}
            </Text>
            <Text style={dynamicStyles.duplicateSentencePreview} numberOfLines={3}>
              "{current.sentence}"
            </Text>
          </View>
        )}
        
        {!showAnswer && !shouldShowContext && (
          <TouchableOpacity 
            style={dynamicStyles.showContextButton} 
            onPress={() => setShowContext(true)}
          >
            <Text style={dynamicStyles.showContextButtonText}>Show Context</Text>
          </TouchableOpacity>
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
              <Text style={dynamicStyles.gradeInterval}>{getPreview(1)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[dynamicStyles.gradeButton, { backgroundColor: theme.colors.secondary }]} 
              onPress={() => handleGrade(3)}
            >
              <Text style={dynamicStyles.gradeButtonText}>Forgot Reading</Text>
              <Text style={dynamicStyles.gradeInterval}>{getPreview(3)}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.gradeButton, { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border }]} 
              onPress={() => handleGrade(5)}
            >
              <Text style={[dynamicStyles.gradeButtonText, { color: theme.colors.text }]}>YES</Text>
              <Text style={[dynamicStyles.gradeInterval, { color: theme.colors.textMuted }]}>{getPreview(5)}</Text>
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
  relearningBadge: {
    backgroundColor: theme.colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.accent + '40',
  },
  relearningBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: theme.colors.accent,
    letterSpacing: 1,
  },
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
  showContextButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 20,
  },
  showContextButtonText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
  },
  answerContainer: { width: '100%' },
  readingLabel: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 4, fontWeight: 'bold' },
  reading: { fontSize: 24, color: theme.colors.accent, marginBottom: 20 },
  meaningLabel: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 4, marginTop: 10, fontWeight: 'bold' },
  contextLabel: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 4, marginTop: 20, fontWeight: 'bold' },
  contextText: { fontSize: 16, color: theme.colors.text, fontStyle: 'italic', lineHeight: 22 },
  footer: { padding: 20, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border },
  footerLabel: { textAlign: 'center', marginBottom: 15, color: theme.colors.textMuted, fontWeight: 'bold' },
  gradeButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  gradeButton: { flex: 1, marginHorizontal: 5, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  gradeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 10, textAlign: 'center' },
  gradeInterval: { color: 'rgba(255,255,255,0.7)', fontSize: 9, marginTop: 2, fontWeight: 'bold' },
  emptyIcon: { fontSize: 64, marginBottom: 20 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text, marginBottom: 10 },
  summaryText: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 30 },
  backButton: { backgroundColor: theme.colors.primary, paddingHorizontal: 40, paddingVertical: 12, borderRadius: 25 },
  backButtonText: { color: theme.colors.onPrimary, fontWeight: 'bold' }
});
