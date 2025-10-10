
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';
import { Svg, Circle, Text as SvgText } from 'react-native-svg';

interface SpiritualProgress {
  id?: string;
  date: string;
  prayers_completed: number;
  quran_reading_minutes: number;
  dhikr_count: number;
  fasting: boolean;
  charity_amount: number;
  notes: string;
}

interface SpiritualProgressTrackerProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');
const chartSize = width * 0.6;

export default function SpiritualProgressTracker({ visible, onClose }: SpiritualProgressTrackerProps) {
  const [progress, setProgress] = useState<SpiritualProgress[]>([]);
  const [todayProgress, setTodayProgress] = useState<SpiritualProgress>({
    date: new Date().toISOString().split('T')[0],
    prayers_completed: 0,
    quran_reading_minutes: 0,
    dhikr_count: 0,
    fasting: false,
    charity_amount: 0,
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [showAddProgress, setShowAddProgress] = useState(false);

  useEffect(() => {
    if (visible) {
      loadProgress();
    }
  }, [visible]);

  const loadProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('spiritual_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error loading progress:', error);
        Alert.alert('Error', 'Failed to load spiritual progress');
        return;
      }

      setProgress(data || []);
      
      // Load today's progress if it exists
      const today = new Date().toISOString().split('T')[0];
      const todayData = data?.find(p => p.date === today);
      if (todayData) {
        setTodayProgress(todayData);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please log in to save progress');
        return;
      }

      const progressData = {
        ...todayProgress,
        user_id: user.id,
      };

      const { error } = await supabase
        .from('spiritual_progress')
        .upsert(progressData, {
          onConflict: 'user_id,date',
        });

      if (error) {
        console.error('Error saving progress:', error);
        Alert.alert('Error', 'Failed to save progress');
        return;
      }

      Alert.alert('Success', 'Progress saved successfully');
      loadProgress();
      setShowAddProgress(false);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const calculateWeeklyAverage = (field: keyof SpiritualProgress) => {
    if (progress.length === 0) return 0;
    
    const lastWeek = progress.slice(0, 7);
    const sum = lastWeek.reduce((acc, p) => {
      const value = p[field];
      return acc + (typeof value === 'number' ? value : 0);
    }, 0);
    
    return Math.round(sum / lastWeek.length);
  };

  const renderProgressChart = (value: number, maxValue: number, label: string, color: string) => {
    const percentage = Math.min((value / maxValue) * 100, 100);
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <View style={styles.chartContainer}>
        <Svg width={100} height={100}>
          <Circle
            cx={50}
            cy={50}
            r={45}
            stroke={colors.border}
            strokeWidth={8}
            fill="transparent"
          />
          <Circle
            cx={50}
            cy={50}
            r={45}
            stroke={color}
            strokeWidth={8}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          <SvgText
            x={50}
            y={50}
            textAnchor="middle"
            dy={5}
            fontSize={16}
            fontWeight="bold"
            fill={colors.text}
          >
            {value}
          </SvgText>
        </Svg>
        <Text style={styles.chartLabel}>{label}</Text>
      </View>
    );
  };

  const renderAddProgressModal = () => (
    <Modal
      visible={showAddProgress}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddProgress(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Today's Progress</Text>
          <TouchableOpacity onPress={() => setShowAddProgress(false)}>
            <IconSymbol name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Prayers Completed (0-5)</Text>
            <TextInput
              style={styles.numberInput}
              value={todayProgress.prayers_completed.toString()}
              onChangeText={(text) =>
                setTodayProgress({
                  ...todayProgress,
                  prayers_completed: Math.max(0, Math.min(5, parseInt(text) || 0)),
                })
              }
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Quran Reading (minutes)</Text>
            <TextInput
              style={styles.numberInput}
              value={todayProgress.quran_reading_minutes.toString()}
              onChangeText={(text) =>
                setTodayProgress({
                  ...todayProgress,
                  quran_reading_minutes: Math.max(0, parseInt(text) || 0),
                })
              }
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dhikr Count</Text>
            <TextInput
              style={styles.numberInput}
              value={todayProgress.dhikr_count.toString()}
              onChangeText={(text) =>
                setTodayProgress({
                  ...todayProgress,
                  dhikr_count: Math.max(0, parseInt(text) || 0),
                })
              }
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Charity Amount</Text>
            <TextInput
              style={styles.numberInput}
              value={todayProgress.charity_amount.toString()}
              onChangeText={(text) =>
                setTodayProgress({
                  ...todayProgress,
                  charity_amount: Math.max(0, parseFloat(text) || 0),
                })
              }
              keyboardType="numeric"
              placeholder="0.00"
            />
          </View>

          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={[
                styles.fastingButton,
                todayProgress.fasting && styles.fastingButtonActive,
              ]}
              onPress={() =>
                setTodayProgress({
                  ...todayProgress,
                  fasting: !todayProgress.fasting,
                })
              }
            >
              <IconSymbol
                name={todayProgress.fasting ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={todayProgress.fasting ? colors.card : colors.text}
              />
              <Text
                style={[
                  styles.fastingButtonText,
                  todayProgress.fasting && styles.fastingButtonTextActive,
                ]}
              >
                Fasting Today
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={styles.textInput}
              value={todayProgress.notes}
              onChangeText={(text) =>
                setTodayProgress({
                  ...todayProgress,
                  notes: text,
                })
              }
              placeholder="Any reflections or notes..."
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={saveProgress}>
            <Text style={styles.saveButtonText}>Save Progress</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Spiritual Progress</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddProgress(true)}
            >
              <IconSymbol name="add" size={20} color={colors.card} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Today's Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Progress</Text>
            <View style={styles.chartsContainer}>
              {renderProgressChart(
                todayProgress.prayers_completed,
                5,
                'Prayers',
                colors.primary
              )}
              {renderProgressChart(
                Math.min(todayProgress.quran_reading_minutes, 60),
                60,
                'Quran (min)',
                colors.secondary
              )}
              {renderProgressChart(
                Math.min(todayProgress.dhikr_count, 100),
                100,
                'Dhikr',
                colors.highlight
              )}
            </View>
          </View>

          {/* Weekly Averages */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Averages</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{calculateWeeklyAverage('prayers_completed')}</Text>
                <Text style={styles.statLabel}>Prayers/Day</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{calculateWeeklyAverage('quran_reading_minutes')}</Text>
                <Text style={styles.statLabel}>Minutes/Day</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{calculateWeeklyAverage('dhikr_count')}</Text>
                <Text style={styles.statLabel}>Dhikr/Day</Text>
              </View>
            </View>
          </View>

          {/* Recent Progress */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Progress</Text>
            {loading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : progress.length > 0 ? (
              progress.slice(0, 7).map((item) => (
                <View key={item.date} style={styles.progressCard}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressDate}>
                      {new Date(item.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    {item.fasting && (
                      <View style={styles.fastingBadge}>
                        <Text style={styles.fastingBadgeText}>Fasting</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.progressStats}>
                    <Text style={styles.progressStat}>
                      🕌 {item.prayers_completed}/5
                    </Text>
                    <Text style={styles.progressStat}>
                      📖 {item.quran_reading_minutes}min
                    </Text>
                    <Text style={styles.progressStat}>
                      📿 {item.dhikr_count}
                    </Text>
                    {item.charity_amount > 0 && (
                      <Text style={styles.progressStat}>
                        💝 ${item.charity_amount}
                      </Text>
                    )}
                  </View>
                  {item.notes && (
                    <Text style={styles.progressNotes}>{item.notes}</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No progress recorded yet</Text>
            )}
          </View>
        </ScrollView>

        {renderAddProgressModal()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  chartsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  fastingBadge: {
    backgroundColor: colors.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fastingBadgeText: {
    fontSize: 10,
    color: colors.card,
    fontWeight: '600',
  },
  progressStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  progressStat: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressNotes: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
    fontStyle: 'italic',
  },
  loadingText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  numberInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fastingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fastingButtonActive: {
    backgroundColor: colors.primary,
  },
  fastingButtonText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  fastingButtonTextActive: {
    color: colors.card,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
