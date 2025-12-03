
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconSymbol } from '@/components/IconSymbol';
import NavigationHeader from '@/components/NavigationHeader';
import { supabase } from '@/app/integrations/supabase/client';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export default function QuranScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSurahs();
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
  }, [searchQuery, surahs]);

  const loadSurahs = async () => {
    try {
      setLoading(true);
      console.log('Loading surahs...');
      
      const { data, error } = await supabase.functions.invoke('quran-api', {
        body: { path: '/surahs' }
      });
      
      console.log('Surahs response:', { data, error });
      
      if (error) {
        console.error('Error loading surahs:', error);
        return;
      }

      if (data?.success && data?.data) {
        console.log('Loaded', data.data.length, 'surahs');
        setSurahs(data.data);
        setFilteredSurahs(data.data);
      } else {
        console.error('Invalid response format:', data);
      }
    } catch (error) {
      console.error('Error loading surahs:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const toggleBookmark = async (surahNumber: number) => {
    try {
      let newBookmarks: number[];
      if (bookmarks.includes(surahNumber)) {
        newBookmarks = bookmarks.filter(b => b !== surahNumber);
      } else {
        newBookmarks = [...bookmarks, surahNumber];
      }
      setBookmarks(newBookmarks);
      await AsyncStorage.setItem('quran_bookmarks', JSON.stringify(newBookmarks));
    } catch (error) {
      console.error('Error saving bookmark:', error);
    }
  };

  const navigateToSurah = (surahNumber: number) => {
    router.push(`/surah/${surahNumber}` as any);
  };

  const renderSurahCard = (surah: Surah) => {
    const isBookmarked = bookmarks.includes(surah.number);

    return (
      <TouchableOpacity
        key={surah.number}
        style={styles.surahCard}
        onPress={() => navigateToSurah(surah.number)}
      >
        <View style={styles.surahNumber}>
          <Text style={styles.surahNumberText}>{surah.number}</Text>
        </View>

        <View style={styles.surahInfo}>
          <Text style={styles.surahNameArabic}>{surah.name}</Text>
          <Text style={styles.surahNameEnglish}>{surah.englishName}</Text>
          <Text style={styles.surahTranslation}>{surah.englishNameTranslation}</Text>
          <Text style={styles.surahMeta}>
            {surah.numberOfAyahs} verses • {surah.revelationType}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation();
            toggleBookmark(surah.number);
          }}
          style={styles.bookmarkButton}
        >
          <IconSymbol 
            ios_icon_name={isBookmarked ? "bookmark.fill" : "bookmark"} 
            android_material_icon_name={isBookmarked ? "bookmark" : "bookmark_border"}
            size={24} 
            color={isBookmarked ? colors.primary : colors.textSecondary} 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading Quran...</Text>
        </View>
      );
    }

    if (surahs.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Failed to load Quran data</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadSurahs}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchContainer}>
          <IconSymbol 
            ios_icon_name="magnifyingglass" 
            android_material_icon_name="search"
            size={20} 
            color={colors.textSecondary} 
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Surahs..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol 
                ios_icon_name="xmark.circle.fill" 
                android_material_icon_name="cancel"
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>114</Text>
            <Text style={styles.statLabel}>Surahs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>6,236</Text>
            <Text style={styles.statLabel}>Verses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{bookmarks.length}</Text>
            <Text style={styles.statLabel}>Bookmarks</Text>
          </View>
        </View>

        <View style={styles.surahList}>
          {filteredSurahs.map((surah) => renderSurahCard(surah))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <NavigationHeader
        title="Holy Quran"
        showBack={false}
        showClose={false}
      />

      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  surahList: {
    gap: 12,
  },
  surahCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0 2px 4px ${colors.shadow}`,
    elevation: 2,
  },
  surahNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  surahNumberText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: 'bold',
  },
  surahInfo: {
    flex: 1,
  },
  surahNameArabic: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Amiri_700Bold',
  },
  surahNameEnglish: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  surahTranslation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  surahMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  bookmarkButton: {
    padding: 8,
  },
  bottomSpacer: {
    height: 120,
  },
});
