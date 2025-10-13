
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';
import { QuranQuote, fetchQuote, getQuoteForTime } from '@/utils/quranQuotes';
import { generateEnhancedQuranQuote } from '@/utils/geminiService';
import { IconSymbol } from '@/components/IconSymbol';

interface QuoteDisplayProps {
  timing?: 'before' | 'after' | 'general';
}

export default function QuoteDisplay({ timing = 'general' }: QuoteDisplayProps) {
  const [quote, setQuote] = useState<QuranQuote | null>(null);
  const [enhancedQuote, setEnhancedQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEnhanced, setShowEnhanced] = useState(false);
  const [loadingEnhanced, setLoadingEnhanced] = useState(false);

  const isBeforeFirstPrayer = timing === 'before';
  const isAfterLastPrayer = timing === 'after';

  const loadQuote = useCallback(async () => {
    try {
      setLoading(true);
      
      if (isBeforeFirstPrayer || isAfterLastPrayer) {
        const specificQuote = getQuoteForTime(isBeforeFirstPrayer, isAfterLastPrayer);
        setQuote(specificQuote);
      } else {
        const fetchedQuote = await fetchQuote();
        setQuote(fetchedQuote);
      }
    } catch (error) {
      console.error('Error loading quote:', error);
      setQuote({
        text: "And establish prayer and give zakah and bow with those who bow.",
        reference: "Quran 2:43",
        arabic: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ"
      });
    } finally {
      setLoading(false);
    }
  }, [isBeforeFirstPrayer, isAfterLastPrayer]);

  const loadEnhancedQuote = async () => {
    try {
      setLoadingEnhanced(true);
      const topic = isBeforeFirstPrayer ? 'morning prayer and starting the day' : 
                    isAfterLastPrayer ? 'evening reflection and gratitude' : 
                    'faith and spirituality';
      
      const enhanced = await generateEnhancedQuranQuote(topic);
      if (enhanced) {
        setEnhancedQuote(enhanced);
        setShowEnhanced(true);
      }
    } catch (error) {
      console.error('Error loading enhanced quote:', error);
    } finally {
      setLoadingEnhanced(false);
    }
  };

  useEffect(() => {
    loadQuote();
  }, [loadQuote]);

  if (loading || !quote) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Loading inspiration...</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(800)}
      exiting={FadeOut.duration(400)}
    >
      <View style={styles.quoteContainer}>
        {showEnhanced && enhancedQuote ? (
          <>
            <Text style={styles.arabicText}>{enhancedQuote.arabic}</Text>
            <Text style={styles.quoteText}>"{enhancedQuote.translation}"</Text>
            <Text style={styles.reference}>{enhancedQuote.reference}</Text>
            
            <View style={styles.enhancedSection}>
              <View style={styles.enhancedHeader}>
                <IconSymbol name="sparkles" size={16} color={colors.accent} />
                <Text style={styles.enhancedLabel}>AI-Enhanced Insight</Text>
              </View>
              <Text style={styles.contextText}>{enhancedQuote.context}</Text>
              <Text style={styles.reflectionText}>{enhancedQuote.reflection}</Text>
            </View>

            <TouchableOpacity 
              style={styles.toggleButton}
              onPress={() => setShowEnhanced(false)}
            >
              <Text style={styles.toggleButtonText}>Show Simple View</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.arabicText}>{quote.arabic}</Text>
            <Text style={styles.quoteText}>"{quote.text}"</Text>
            <Text style={styles.reference}>{quote.reference}</Text>
            
            {(isBeforeFirstPrayer || isAfterLastPrayer) && (
              <View style={styles.timingIndicator}>
                <Text style={styles.timingText}>
                  {isBeforeFirstPrayer ? '🌅 Morning Reflection' : '🌙 Evening Reflection'}
                </Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.enhanceButton}
              onPress={loadEnhancedQuote}
              disabled={loadingEnhanced}
            >
              {loadingEnhanced ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <IconSymbol name="sparkles" size={18} color={colors.primary} />
                  <Text style={styles.enhanceButtonText}>Get AI Insights</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  loadingContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  quoteContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 4px 8px ${colors.shadow}`,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  arabicText: {
    fontSize: 18,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
    fontWeight: '500',
  },
  quoteText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  reference: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  timingIndicator: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  timingText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
  },
  enhanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(212, 163, 115, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  enhanceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  enhancedSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  enhancedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  enhancedLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contextText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
    marginBottom: 12,
  },
  reflectionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
    fontStyle: 'italic',
    backgroundColor: 'rgba(0, 70, 67, 0.05)',
    padding: 12,
    borderRadius: 8,
  },
  toggleButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 13,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
