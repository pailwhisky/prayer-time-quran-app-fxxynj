
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useSubscription } from '@/contexts/SubscriptionContext';
import PremiumGate from '@/components/PremiumGate';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

const surahs: Surah[] = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Fatihah', englishNameTranslation: 'The Opening', numberOfAyahs: 7, revelationType: 'Meccan' },
  { number: 2, name: 'البقرة', englishName: 'Al-Baqarah', englishNameTranslation: 'The Cow', numberOfAyahs: 286, revelationType: 'Medinan' },
  { number: 3, name: 'آل عمران', englishName: 'Ali \'Imran', englishNameTranslation: 'Family of Imran', numberOfAyahs: 200, revelationType: 'Medinan' },
  { number: 4, name: 'النساء', englishName: 'An-Nisa', englishNameTranslation: 'The Women', numberOfAyahs: 176, revelationType: 'Medinan' },
  { number: 5, name: 'المائدة', englishName: 'Al-Ma\'idah', englishNameTranslation: 'The Table Spread', numberOfAyahs: 120, revelationType: 'Medinan' },
  // Add more surahs as needed
];

export default function QuranScreen() {
  const { hasFeature } = useSubscription();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>(surahs);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);

  const hasQuranAccess = hasFeature('quran_reader');

  useEffect(() => {
    loadBookmarks();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSurahs(surahs);
    } else {
      const filtered = surahs.filter(
        (surah) =>
          surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          surah.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          surah.number.toString().includes(searchQuery)
      );
      setFilteredSurahs(filtered);
    }
  }, [searchQuery]);

  const loadBookmarks = async () => {
    try {
      const stored = await AsyncStorage.getItem('quran_bookmarks');
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const renderSurahCard = (surah: Surah) => (
    <TouchableOpacity
      key={surah.number}
      style={styles.surahCard}
      onPress={() => setSelectedSurah(surah)}
    >
      <View style={styles.surahNumber}>
        <Text style={styles.surahNumberText}>{surah.number}</Text>
      </View>
      <View style={styles.surahInfo}>
        <Text style={styles.surahName}>{surah.englishName}</Text>
        <Text style={styles.surahTranslation}>{surah.englishNameTranslation}</Text>
        <Text style={styles.surahDetails}>
          {surah.numberOfAyahs} verses • {surah.revelationType}
        </Text>
      </View>
      <Text style={styles.surahArabic}>{surah.name}</Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (!hasQuranAccess) {
      return (
        <PremiumGate
          featureKey="quran_reader"
          featureName="Full Quran Reader"
          requiredTier="premium"
        >
          {null}
        </PremiumGate>
      );
    }

    if (showBookmarks) {
      return (
        <View style={styles.bookmarksContainer}>
          <Text style={styles.sectionTitle}>Your Bookmarks</Text>
          {bookmarks.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="bookmark-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>No bookmarks yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Bookmark verses while reading to save them here
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {bookmarks.map((bookmark, index) => (
                <View key={index} style={styles.bookmarkCard}>
                  <Text style={styles.bookmarkTitle}>
                    Surah {bookmark.surah}:{bookmark.ayah}
                  </Text>
                  {bookmark.note && (
                    <Text style={styles.bookmarkNote}>{bookmark.note}</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      );
    }

    return (
      <>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Surah..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Surahs List */}
        <ScrollView
          style={styles.surahsList}
          showsVerticalScrollIndicator={false}
        >
          {filteredSurahs.map(renderSurahCard)}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Quran',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowBookmarks(!showBookmarks)}
              >
                <IconSymbol
                  name={showBookmarks ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        {renderContent()}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
    marginRight: 8,
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  surahsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  surahCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  surahNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  surahNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  surahTranslation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  surahDetails: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  surahArabic: {
    fontSize: 20,
    fontFamily: 'Amiri_700Bold',
    color: colors.text,
  },
  bookmarksContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  bookmarkCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  bookmarkNote: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
});
