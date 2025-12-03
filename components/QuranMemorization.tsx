
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavigationHeader from '@/components/NavigationHeader';

interface QuranMemorizationProps {
  visible: boolean;
  onClose: () => void;
}

interface MemorizationSession {
  id: string;
  surahNumber: number;
  surahName: string;
  verseStart: number;
  verseEnd: number;
  date: string;
  status: 'learning' | 'reviewing' | 'memorized';
  reviewCount: number;
  lastReviewed?: string;
}

const POPULAR_SURAHS = [
  { number: 1, name: 'Al-Fatihah', verses: 7 },
  { number: 67, name: 'Al-Mulk', verses: 30 },
  { number: 36, name: 'Ya-Sin', verses: 83 },
  { number: 18, name: 'Al-Kahf', verses: 110 },
  { number: 55, name: 'Ar-Rahman', verses: 78 },
  { number: 56, name: 'Al-Waqiah', verses: 96 },
  { number: 78, name: 'An-Naba', verses: 40 },
];

export default function QuranMemorization({ visible, onClose }: QuranMemorizationProps) {
  const [sessions, setSessions] = useState<MemorizationSession[]>([]);
  const [showAddSession, setShowAddSession] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState(POPULAR_SURAHS[0]);
  const [verseStart, setVerseStart] = useState('1');
  const [verseEnd, setVerseEnd] = useState('7');

  useEffect(() => {
    if (visible) {
      loadSessions();
    }
  }, [visible]);

  const loadSessions = async () => {
    try {
      const stored = await AsyncStorage.getItem('memorization_sessions');
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const saveSessions = async (newSessions: MemorizationSession[]) => {
    try {
      await AsyncStorage.setItem('memorization_sessions', JSON.stringify(newSessions));
      setSessions(newSessions);
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  };

  const handleAddSession = () => {
    const start = parseInt(verseStart, 10);
    const end = parseInt(verseEnd, 10);

    if (isNaN(start) || isNaN(end) || start < 1 || end < start || end > selectedSurah.verses) {
      Alert.alert('Invalid Range', 'Please enter a valid verse range.');
      return;
    }

    const newSession: MemorizationSession = {
      id: Date.now().toString(),
      surahNumber: selectedSurah.number,
      surahName: selectedSurah.name,
      verseStart: start,
      verseEnd: end,
      date: new Date().toISOString().split('T')[0],
      status: 'learning',
      reviewCount: 0,
    };

    saveSessions([newSession, ...sessions]);
    setShowAddSession(false);
    setVerseStart('1');
    setVerseEnd('7');
  };

  const handleUpdateStatus = (sessionId: string, newStatus: 'learning' | 'reviewing' | 'memorized') => {
    const updated = sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          status: newStatus,
          lastReviewed: new Date().toISOString().split('T')[0],
          reviewCount: newStatus === 'reviewing' ? session.reviewCount + 1 : session.reviewCount,
        };
      }
      return session;
    });
    saveSessions(updated);
  };

  const handleDeleteSession = (sessionId: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this memorization session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const filtered = sessions.filter(s => s.id !== sessionId);
            saveSessions(filtered);
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'learning': return colors.highlight;
      case 'reviewing': return colors.accent;
      case 'memorized': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'learning': return 'school';
      case 'reviewing': return 'refresh';
      case 'memorized': return 'check-circle';
      default: return 'circle';
    }
  };

  const stats = {
    total: sessions.length,
    learning: sessions.filter(s => s.status === 'learning').length,
    reviewing: sessions.filter(s => s.status === 'reviewing').length,
    memorized: sessions.filter(s => s.status === 'memorized').length,
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <NavigationHeader
          title="Quran Memorization"
          showClose={true}
          onClosePress={onClose}
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📖 Memorization Tips</Text>
            <Text style={styles.infoText}>
              - Start with short surahs{'\n'}
              - Review daily for retention{'\n'}
              - Recite to someone for verification{'\n'}
              - Be consistent, even if it&apos;s just one verse
            </Text>
          </View>

          {/* Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={[styles.statCard, { borderColor: colors.highlight }]}>
              <Text style={[styles.statValue, { color: colors.highlight }]}>{stats.learning}</Text>
              <Text style={styles.statLabel}>Learning</Text>
            </View>
            <View style={[styles.statCard, { borderColor: colors.accent }]}>
              <Text style={[styles.statValue, { color: colors.accent }]}>{stats.reviewing}</Text>
              <Text style={styles.statLabel}>Reviewing</Text>
            </View>
            <View style={[styles.statCard, { borderColor: colors.primary }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{stats.memorized}</Text>
              <Text style={styles.statLabel}>Memorized</Text>
            </View>
          </View>

          {/* Add Session Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddSession(!showAddSession)}
          >
            <IconSymbol name="add-circle" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Start New Memorization</Text>
          </TouchableOpacity>

          {/* Add Session Form */}
          {showAddSession && (
            <View style={styles.addSessionForm}>
              <Text style={styles.formTitle}>Select Surah</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.surahScroll}>
                {POPULAR_SURAHS.map((surah) => (
                  <TouchableOpacity
                    key={surah.number}
                    style={[
                      styles.surahChip,
                      selectedSurah.number === surah.number && styles.surahChipSelected,
                    ]}
                    onPress={() => setSelectedSurah(surah)}
                  >
                    <Text style={[
                      styles.surahChipText,
                      selectedSurah.number === surah.number && styles.surahChipTextSelected,
                    ]}>
                      {surah.number}. {surah.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.formTitle}>Verse Range</Text>
              <View style={styles.verseRangeContainer}>
                <View style={styles.verseInputWrapper}>
                  <Text style={styles.verseLabel}>From</Text>
                  <TextInput
                    style={styles.verseInput}
                    value={verseStart}
                    onChangeText={setVerseStart}
                    keyboardType="number-pad"
                    placeholder="1"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <Text style={styles.verseSeparator}>-</Text>
                <View style={styles.verseInputWrapper}>
                  <Text style={styles.verseLabel}>To</Text>
                  <TextInput
                    style={styles.verseInput}
                    value={verseEnd}
                    onChangeText={setVerseEnd}
                    keyboardType="number-pad"
                    placeholder={selectedSurah.verses.toString()}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAddSession(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleAddSession}
                >
                  <Text style={styles.saveButtonText}>Start Memorizing</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Sessions List */}
          <Text style={styles.sectionTitle}>Your Memorization Sessions</Text>
          {sessions.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="menu-book" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No memorization sessions yet</Text>
              <Text style={styles.emptySubtext}>Start your journey by adding a new session</Text>
            </View>
          ) : (
            sessions.map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionTitleRow}>
                    <Text style={styles.sessionSurah}>{session.surahName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status) }]}>
                      <IconSymbol name={getStatusIcon(session.status)} size={14} color="#FFFFFF" />
                      <Text style={styles.statusText}>{session.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.sessionVerses}>
                    Verses {session.verseStart}-{session.verseEnd}
                  </Text>
                  <Text style={styles.sessionDate}>
                    Started: {new Date(session.date).toLocaleDateString()}
                  </Text>
                  {session.lastReviewed && (
                    <Text style={styles.sessionReview}>
                      Last reviewed: {new Date(session.lastReviewed).toLocaleDateString()} ({session.reviewCount}x)
                    </Text>
                  )}
                </View>

                <View style={styles.sessionActions}>
                  {session.status === 'learning' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.accent }]}
                      onPress={() => handleUpdateStatus(session.id, 'reviewing')}
                    >
                      <IconSymbol name="refresh" size={16} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Start Reviewing</Text>
                    </TouchableOpacity>
                  )}
                  {session.status === 'reviewing' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.accent }]}
                        onPress={() => handleUpdateStatus(session.id, 'reviewing')}
                      >
                        <IconSymbol name="refresh" size={16} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Review Again</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.primary }]}
                        onPress={() => handleUpdateStatus(session.id, 'memorized')}
                      >
                        <IconSymbol name="check-circle" size={16} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Mark Memorized</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {session.status === 'memorized' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.accent }]}
                      onPress={() => handleUpdateStatus(session.id, 'reviewing')}
                    >
                      <IconSymbol name="refresh" size={16} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Review</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.highlight }]}
                    onPress={() => handleDeleteSession(session.id)}
                  >
                    <IconSymbol name="delete" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    boxShadow: `0px 4px 8px ${colors.shadow}`,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    boxShadow: `0px 2px 4px ${colors.shadow}`,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    boxShadow: `0px 4px 8px ${colors.shadow}`,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addSessionForm: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 4px 8px ${colors.shadow}`,
    elevation: 3,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  surahScroll: {
    marginBottom: 20,
  },
  surahChip: {
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  surahChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  surahChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  surahChipTextSelected: {
    color: '#FFFFFF',
  },
  verseRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  verseInputWrapper: {
    flex: 1,
  },
  verseLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  verseInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  verseSeparator: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginTop: 20,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text,
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  sessionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 2px 4px ${colors.shadow}`,
    elevation: 2,
  },
  sessionHeader: {
    marginBottom: 12,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionSurah: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  sessionVerses: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  sessionReview: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 8,
    padding: 10,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
