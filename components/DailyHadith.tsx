
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { generateDailyHadith } from '@/utils/geminiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavigationHeader from '@/components/NavigationHeader';
import PremiumGate from '@/components/PremiumGate';

interface DailyHadithProps {
  visible: boolean;
  onClose: () => void;
}

interface HadithData {
  hadith: string;
  explanation: string;
  reference: string;
  date: string;
}

export default function DailyHadith({ visible, onClose }: DailyHadithProps) {
  const [hadithData, setHadithData] = useState<HadithData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (visible) {
      loadDailyHadith();
    }
  }, [visible]);

  const loadDailyHadith = async () => {
    try {
      setLoading(true);
      setError(false);

      const today = new Date().toISOString().split('T')[0];
      const storageKey = `daily_hadith_${today}`;

      // Check if we already have today's hadith
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        setHadithData(JSON.parse(stored));
        setLoading(false);
        return;
      }

      // Generate new hadith using AI
      const generated = await generateDailyHadith();
      
      if (generated) {
        const data: HadithData = {
          ...generated,
          date: today,
        };
        setHadithData(data);
        await AsyncStorage.setItem(storageKey, JSON.stringify(data));
      } else {
        // Fallback hadith
        const fallback: HadithData = {
          hadith: 'The Prophet (ﷺ) said: "The best of you are those who are best to their families, and I am the best of you to my family."',
          explanation: 'This hadith emphasizes the importance of treating family members with kindness, respect, and compassion. It reminds us that true character is shown in how we treat those closest to us.',
          reference: 'Sunan al-Tirmidhi 3895',
          date: today,
        };
        setHadithData(fallback);
        await AsyncStorage.setItem(storageKey, JSON.stringify(fallback));
      }
    } catch (err) {
      console.error('Error loading daily hadith:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!hadithData) return;

    try {
      await Share.share({
        message: `Daily Hadith\n\n${hadithData.hadith}\n\n${hadithData.explanation}\n\nReference: ${hadithData.reference}`,
      });
    } catch (error) {
      console.error('Error sharing hadith:', error);
    }
  };

  const handleRefresh = async () => {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `daily_hadith_${today}`;
    await AsyncStorage.removeItem(storageKey);
    loadDailyHadith();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <NavigationHeader
          title="Daily Hadith"
          showClose={true}
          onClosePress={onClose}
          rightComponent={
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
              <IconSymbol 
                ios_icon_name="arrow.clockwise" 
                android_material_icon_name="refresh" 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          }
        />

        <PremiumGate
          featureKey="daily_hadith"
          featureName="AI-Generated Daily Hadith"
          requiredTier="iman"
        >

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading today&apos;s Hadith...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <IconSymbol 
                ios_icon_name="exclamationmark.triangle" 
                android_material_icon_name="warning" 
                size={48} 
                color={colors.highlight} 
              />
              <Text style={styles.errorText}>Unable to load Hadith</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadDailyHadith}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : hadithData ? (
            <>
              <View style={styles.dateCard}>
                <IconSymbol 
                  ios_icon_name="calendar" 
                  android_material_icon_name="calendar_today" 
                  size={20} 
                  color={colors.accent} 
                />
                <Text style={styles.dateText}>
                  {new Date(hadithData.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>

              <View style={styles.hadithCard}>
                <View style={styles.quoteIcon}>
                  <IconSymbol 
                    ios_icon_name="quote.opening" 
                    android_material_icon_name="format_quote" 
                    size={32} 
                    color={colors.accent} 
                  />
                </View>
                <Text style={styles.hadithText}>{hadithData.hadith}</Text>
                <View style={styles.referenceContainer}>
                  <IconSymbol 
                    ios_icon_name="book.closed" 
                    android_material_icon_name="menu_book" 
                    size={16} 
                    color={colors.textSecondary} 
                  />
                  <Text style={styles.referenceText}>{hadithData.reference}</Text>
                </View>
              </View>

              <View style={styles.explanationCard}>
                <View style={styles.explanationHeader}>
                  <IconSymbol 
                    ios_icon_name="lightbulb" 
                    android_material_icon_name="lightbulb" 
                    size={20} 
                    color={colors.primary} 
                  />
                  <Text style={styles.explanationTitle}>Understanding & Reflection</Text>
                </View>
                <Text style={styles.explanationText}>{hadithData.explanation}</Text>
              </View>

              <View style={styles.actionsCard}>
                <Text style={styles.actionsTitle}>Apply This Teaching</Text>
                <View style={styles.actionsList}>
                  <View style={styles.actionItem}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle" 
                      android_material_icon_name="check_circle" 
                      size={20} 
                      color={colors.accent} 
                    />
                    <Text style={styles.actionText}>Reflect on this Hadith during your day</Text>
                  </View>
                  <View style={styles.actionItem}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle" 
                      android_material_icon_name="check_circle" 
                      size={20} 
                      color={colors.accent} 
                    />
                    <Text style={styles.actionText}>Share this wisdom with family and friends</Text>
                  </View>
                  <View style={styles.actionItem}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle" 
                      android_material_icon_name="check_circle" 
                      size={20} 
                      color={colors.accent} 
                    />
                    <Text style={styles.actionText}>Practice the teaching in your actions</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <IconSymbol 
                  ios_icon_name="square.and.arrow.up" 
                  android_material_icon_name="share" 
                  size={20} 
                  color="#FFFFFF" 
                />
                <Text style={styles.shareButtonText}>Share This Hadith</Text>
              </TouchableOpacity>

              <View style={styles.reminderCard}>
                <Text style={styles.reminderText}>
                  💚 The Prophet (ﷺ) said: "Whoever guides someone to goodness will have a reward like the one who did it."
                </Text>
                <Text style={styles.reminderReference}>Sahih Muslim 1893</Text>
              </View>

              <View style={{ height: 40 }} />
            </>
          ) : null}
        </ScrollView>
        </PremiumGate>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    fontSize: 17,
    color: colors.textSecondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  errorText: {
    fontSize: 19,
    color: colors.text,
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  hadithCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 4,
  },
  quoteIcon: {
    marginBottom: 16,
    opacity: 0.3,
  },
  hadithText: {
    fontSize: 19,
    lineHeight: 30,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 20,
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  referenceText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  explanationCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 2px 6px ${colors.shadow}`,
    elevation: 3,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 25,
    color: colors.text,
  },
  actionsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  actionsList: {
    gap: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 23,
    color: colors.text,
  },
  shareButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 4,
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  reminderCard: {
    backgroundColor: 'rgba(212, 163, 115, 0.1)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  reminderText: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.text,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  reminderReference: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
