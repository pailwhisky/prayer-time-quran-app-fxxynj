
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';
import { QuranQuote, fetchQuote, getQuoteForTime } from '@/utils/quranQuotes';

interface QuoteDisplayProps {
  isBeforeFirstPrayer?: boolean;
  isAfterLastPrayer?: boolean;
  shouldRefresh?: boolean;
}

export default function QuoteDisplay({ 
  isBeforeFirstPrayer = false, 
  isAfterLastPrayer = false,
  shouldRefresh = false 
}: QuoteDisplayProps) {
  const [quote, setQuote] = useState<QuranQuote | null>(null);
  const [loading, setLoading] = useState(true);

  const loadQuote = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use specific quotes for prayer times, or fetch random one
      if (isBeforeFirstPrayer || isAfterLastPrayer) {
        const specificQuote = getQuoteForTime(isBeforeFirstPrayer, isAfterLastPrayer);
        setQuote(specificQuote);
      } else {
        const fetchedQuote = await fetchQuote();
        setQuote(fetchedQuote);
      }
    } catch (error) {
      console.error('Error loading quote:', error);
      // Fallback quote
      setQuote({
        text: "And establish prayer and give zakah and bow with those who bow.",
        reference: "Quran 2:43",
        arabic: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ"
      });
    } finally {
      setLoading(false);
    }
  }, [isBeforeFirstPrayer, isAfterLastPrayer]);

  useEffect(() => {
    loadQuote();
  }, [loadQuote, shouldRefresh]);

  if (loading || !quote) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
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
    fontFamily: 'Amiri_400Regular',
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
});
