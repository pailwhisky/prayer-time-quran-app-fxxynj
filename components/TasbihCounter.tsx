
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavigationHeader from '@/components/NavigationHeader';
import * as Haptics from 'expo-haptics';

interface TasbihCounterProps {
  visible: boolean;
  onClose: () => void;
}

interface DhikrPreset {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  goal: number;
  color: string;
}

const DHIKR_PRESETS: DhikrPreset[] = [
  {
    id: '1',
    arabic: 'سُبْحَانَ اللهِ',
    transliteration: 'SubhanAllah',
    translation: 'Glory be to Allah',
    goal: 33,
    color: colors.primary,
  },
  {
    id: '2',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise is due to Allah',
    goal: 33,
    color: colors.accent,
  },
  {
    id: '3',
    arabic: 'اللهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    goal: 34,
    color: colors.highlight,
  },
  {
    id: '4',
    arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    transliteration: 'La ilaha illallah',
    translation: 'There is no god but Allah',
    goal: 100,
    color: colors.secondary,
  },
  {
    id: '5',
    arabic: 'أَسْتَغْفِرُ اللهَ',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah',
    goal: 100,
    color: colors.primary,
  },
];

export default function TasbihCounter({ visible, onClose }: TasbihCounterProps) {
  const [count, setCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState<DhikrPreset>(DHIKR_PRESETS[0]);
  const [customGoal, setCustomGoal] = useState('33');
  const [totalCount, setTotalCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (visible) {
      loadTotalCount();
    }
  }, [visible]);

  const loadTotalCount = async () => {
    try {
      const stored = await AsyncStorage.getItem('tasbih_total_count');
      if (stored) {
        setTotalCount(parseInt(stored, 10));
      }
    } catch (error) {
      console.error('Error loading total count:', error);
    }
  };

  const saveTotalCount = async (newTotal: number) => {
    try {
      await AsyncStorage.setItem('tasbih_total_count', newTotal.toString());
      setTotalCount(newTotal);
    } catch (error) {
      console.error('Error saving total count:', error);
    }
  };

  const handleCount = () => {
    const newCount = count + 1;
    setCount(newCount);
    saveTotalCount(totalCount + 1);

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Check if goal reached
    const goal = parseInt(customGoal, 10) || selectedDhikr.goal;
    if (newCount === goal) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Goal Reached! 🎉',
        `You have completed ${goal} ${selectedDhikr.transliteration}.\n\nMay Allah accept your dhikr.`,
        [
          { text: 'Continue', onPress: () => setCount(0) },
          { text: 'Done', onPress: onClose },
        ]
      );
    } else if (newCount % 33 === 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Counter',
      'Are you sure you want to reset the counter?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => setCount(0),
        },
      ]
    );
  };

  const handleDhikrSelect = (dhikr: DhikrPreset) => {
    setSelectedDhikr(dhikr);
    setCustomGoal(dhikr.goal.toString());
    setCount(0);
    setShowSettings(false);
  };

  const goal = parseInt(customGoal, 10) || selectedDhikr.goal;
  const progress = Math.min((count / goal) * 100, 100);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <NavigationHeader
          title="Tasbih Counter"
          showClose={true}
          onClosePress={onClose}
          rightComponent={
            <TouchableOpacity onPress={() => setShowSettings(!showSettings)} style={styles.settingsButton}>
              <IconSymbol name="settings" size={20} color={colors.primary} />
            </TouchableOpacity>
          }
        />

        {showSettings ? (
          <ScrollView style={styles.settingsContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.settingsTitle}>Select Dhikr</Text>
            {DHIKR_PRESETS.map((dhikr) => (
              <TouchableOpacity
                key={dhikr.id}
                style={[
                  styles.dhikrCard,
                  selectedDhikr.id === dhikr.id && styles.dhikrCardSelected,
                ]}
                onPress={() => handleDhikrSelect(dhikr)}
              >
                <View style={[styles.dhikrColorBar, { backgroundColor: dhikr.color }]} />
                <View style={styles.dhikrContent}>
                  <Text style={styles.dhikrArabic}>{dhikr.arabic}</Text>
                  <Text style={styles.dhikrTransliteration}>{dhikr.transliteration}</Text>
                  <Text style={styles.dhikrTranslation}>{dhikr.translation}</Text>
                  <Text style={styles.dhikrGoal}>Goal: {dhikr.goal}x</Text>
                </View>
                {selectedDhikr.id === dhikr.id && (
                  <IconSymbol name="check-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}

            <View style={styles.customGoalSection}>
              <Text style={styles.settingsTitle}>Custom Goal</Text>
              <TextInput
                style={styles.goalInput}
                value={customGoal}
                onChangeText={setCustomGoal}
                keyboardType="number-pad"
                placeholder="Enter goal"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.statsSection}>
              <Text style={styles.settingsTitle}>Statistics</Text>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{totalCount.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Total Dhikr Count</Text>
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.counterContent}>
            {/* Selected Dhikr Display */}
            <View style={styles.dhikrDisplay}>
              <Text style={styles.displayArabic}>{selectedDhikr.arabic}</Text>
              <Text style={styles.displayTransliteration}>{selectedDhikr.transliteration}</Text>
              <Text style={styles.displayTranslation}>{selectedDhikr.translation}</Text>
            </View>

            {/* Progress Ring */}
            <View style={styles.progressContainer}>
              <View style={styles.progressRing}>
                <View style={[styles.progressFill, { 
                  transform: [{ rotate: `${(progress * 3.6)}deg` }],
                  backgroundColor: selectedDhikr.color,
                }]} />
                <View style={styles.progressInner}>
                  <Text style={styles.countText}>{count}</Text>
                  <Text style={styles.goalText}>of {goal}</Text>
                  <Text style={styles.percentText}>{Math.round(progress)}%</Text>
                </View>
              </View>
            </View>

            {/* Counter Button */}
            <TouchableOpacity
              style={[styles.counterButton, { backgroundColor: selectedDhikr.color }]}
              onPress={handleCount}
              activeOpacity={0.7}
            >
              <IconSymbol name="add" size={48} color="#FFFFFF" />
              <Text style={styles.counterButtonText}>Tap to Count</Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleReset}>
                <IconSymbol name="refresh" size={24} color={colors.primary} />
                <Text style={styles.actionButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => setShowSettings(true)}>
                <IconSymbol name="swap-horiz" size={24} color={colors.primary} />
                <Text style={styles.actionButtonText}>Change Dhikr</Text>
              </TouchableOpacity>
            </View>

            {/* Total Count Display */}
            <View style={styles.totalCountCard}>
              <Text style={styles.totalCountLabel}>Lifetime Total</Text>
              <Text style={styles.totalCountValue}>{totalCount.toLocaleString()}</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  settingsButton: {
    padding: 8,
  },
  settingsContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 16,
  },
  dhikrCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
    boxShadow: `0px 2px 4px ${colors.shadow}`,
    elevation: 2,
  },
  dhikrCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  dhikrColorBar: {
    width: 6,
  },
  dhikrContent: {
    flex: 1,
    padding: 16,
  },
  dhikrArabic: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  dhikrTransliteration: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  dhikrTranslation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  dhikrGoal: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  customGoalSection: {
    marginTop: 24,
  },
  goalInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },
  statsSection: {
    marginTop: 24,
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 4px 8px ${colors.shadow}`,
    elevation: 3,
  },
  statValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  counterContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  dhikrDisplay: {
    alignItems: 'center',
    marginBottom: 32,
  },
  displayArabic: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  displayTransliteration: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 6,
  },
  displayTranslation: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  progressRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: `0px 8px 16px ${colors.shadow}`,
    elevation: 5,
  },
  progressFill: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.3,
  },
  progressInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: colors.text,
  },
  goalText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  percentText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 8,
  },
  counterButton: {
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    boxShadow: `0px 8px 20px ${colors.shadow}`,
    elevation: 6,
  },
  counterButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 2px 4px ${colors.shadow}`,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  totalCountCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 4px 8px ${colors.shadow}`,
    elevation: 3,
  },
  totalCountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  totalCountValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.accent,
  },
});
