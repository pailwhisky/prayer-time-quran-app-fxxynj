
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';
import { QuranQuote, fetchQuote, getQuoteForTime } from '@/utils/quranQuotes';
import { generateEnhancedQuranQuote } from '@/utils/geminiService';
import { IconSymbol } from '@/components/IconSymbol';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface QuoteDisplayProps {
  timing?: 'before' | 'after' | 'general';
}

export default function QuoteDisplay({ timing = 'general' }: QuoteDisplayProps) {
  const [quote, setQuote] = useState<QuranQuote | null>(null);
  const [enhancedQuote, setEnhancedQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEnhanced, setShowEnhanced] = useState(false);
  const [loadingEnhanced, setLoadingEnhanced] = useState(false);
  const { hasFeature, currentTier } = useSubscription();

  const isBeforeFirstPrayer = timing === 'before';
  const isAfterLastPrayer = timing === 'after';
  const canUseAI = hasFeature('daily_quotes') || currentTier === 'ihsan' || currentTier === 'iman' || currentTier === 'iman_lifetime';

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
      if (enhanced && !enhanced.error) {
        setEnhancedQuote(enhanced);
        setShowEnhanced(true);
      } else {
        console.log('Enhanced quote not available:', enhanced);
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
          <ActivityIndicator size="small" color={colors.gold} />
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
        {/* Ornamental top border */}
        <View style={styles.ornamentalTop}>
          <View style={styles.ornamentDot} />
          <View style={styles.ornamentLine} />
          <View style={styles.ornamentCenter}>
            <Text style={styles.ornamentIcon}>✦</Text>
          </View>
          <View style={styles.ornamentLine} />
          <View style={styles.ornamentDot} />
        </View>

        {showEnhanced && enhancedQuote ? (
          <>
            <Text style={styles.arabicText}>{enhancedQuote.arabic}</Text>
            <Text style={styles.quoteText}>"{enhancedQuote.translation}"</Text>
            <Text style={styles.reference}>{enhancedQuote.reference}</Text>
            
            <View style={styles.enhancedSection}>
              <View style={styles.enhancedHeader}>
                <IconSymbol 
                  ios_icon_name="sparkles"
                  android_material_icon_name="auto_awesome"
                  size={16} 
                  color={colors.gold} 
                />
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
            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerIcon}>❖</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.quoteText}>"{quote.text}"</Text>
            <Text style={styles.reference}>{quote.reference}</Text>
            
            {(isBeforeFirstPrayer || isAfterLastPrayer) && (
              <View style={styles.timingIndicator}>
                <View style={styles.timingBadge}>
                  <Text style={styles.timingIcon}>
                    {isBeforeFirstPrayer ? '🌅' : '🌙'}
                  </Text>
                  <Text style={styles.timingText}>
                    {isBeforeFirstPrayer ? 'Morning Reflection' : 'Evening Reflection'}
                  </Text>
                </View>
              </View>
            )}

            {canUseAI ? (
              <TouchableOpacity 
                style={styles.enhanceButton}
                onPress={loadEnhancedQuote}
                disabled={loadingEnhanced}
              >
                {loadingEnhanced ? (
                  <ActivityIndicator size="small" color={colors.gold} />
                ) : (
                  <>
                    <IconSymbol 
                      ios_icon_name="sparkles"
                      android_material_icon_name="auto_awesome"
                      size={18} 
                      color={colors.gold} 
                    />
                    <Text style={styles.enhanceButtonText}>Get AI Insights</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.premiumPrompt}>
                <IconSymbol 
                  ios_icon_name="lock.fill"
                  android_material_icon_name="lock"
                  size={16} 
                  color={colors.textSecondary} 
                />
                <Text style={styles.premiumPromptText}>
                  AI insights available with Ihsan or Iman subscription
                </Text>
              </View>
            )}
          </>
        )}

        {/* Ornamental bottom border */}
        <View style={styles.ornamentalBottom}>
          <View style={styles.ornamentDot} />
          <View style={styles.ornamentLine} />
          <View style={styles.ornamentCenter}>
            <Text style={styles.ornamentIcon}>✦</Text>
          </View>
          <View style={styles.ornamentLine} />
          <View style={styles.ornamentDot} />
        </View>
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
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gold,
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
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.gold,
    boxShadow: `0px 6px 12px ${colors.shadow}`,
    elevation: 4,
    position: 'relative',
  },
  ornamentalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  ornamentalBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  ornamentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
  },
  ornamentLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gold,
  },
  ornamentCenter: {
    paddingHorizontal: 8,
  },
  ornamentIcon: {
    fontSize: 16,
    color: colors.gold,
  },
  arabicText: {
    fontSize: 22,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerIcon: {
    fontSize: 12,
    color: colors.gold,
  },
  quoteText: {
    fontSize: 17,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 16,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  reference: {
    fontSize: 15,
    color: colors.gold,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timingIndicator: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.gold,
    alignItems: 'center',
  },
  timingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.lightGold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  timingIcon: {
    fontSize: 16,
  },
  timingText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  enhanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.lightGold,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gold,
  },
  enhanceButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  enhancedSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.gold,
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
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contextText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  reflectionText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
    backgroundColor: colors.lightGold,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gold,
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
  premiumPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  premiumPromptText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
