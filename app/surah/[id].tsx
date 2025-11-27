
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import NavigationHeader from '@/components/NavigationHeader';
import { supabase } from '@/app/integrations/supabase/client';
import { Audio } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Ayah {
  number: number;
  text: string;
  translation: string;
  audio: string;
}

export default function SurahDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [surah, setSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<number[]>([]);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    loadSurah();
    loadBookmarks();
    
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [id]);

  const loadSurah = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke(`quran-api/surah/${id}`);
      
      if (error) {
        console.error('Error loading surah:', error);
        Alert.alert('Error', 'Failed to load Surah. Please try again.');
        return;
      }

      if (data?.success && data?.data) {
        setSurah(data.data.surah);
        setAyahs(data.data.ayahs);
      }
    } catch (error) {
      console.error('Error loading surah:', error);
      Alert.alert('Error', 'Failed to load Surah. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    try {
      const stored = await AsyncStorage.getItem(`surah_${id}_bookmarks`);
      if (stored) {
        setBookmarkedAyahs(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const toggleAyahBookmark = async (ayahNumber: number) => {
    try {
      let newBookmarks: number[];
      if (bookmarkedAyahs.includes(ayahNumber)) {
        newBookmarks = bookmarkedAyahs.filter(b => b !== ayahNumber);
      } else {
        newBookmarks = [...bookmarkedAyahs, ayahNumber];
      }
      setBookmarkedAyahs(newBookmarks);
      await AsyncStorage.setItem(`surah_${id}_bookmarks`, JSON.stringify(newBookmarks));
    } catch (error) {
      console.error('Error saving bookmark:', error);
    }
  };

  const playAyahAudio = async (ayah: Ayah) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      if (playingAyah === ayah.number) {
        setPlayingAyah(null);
        return;
      }

      setPlayingAyah(ayah.number);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: ayah.audio },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlayingAyah(null);
          }
        }
      );
      
      soundRef.current = sound;
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio. Please try again.');
      setPlayingAyah(null);
    }
  };

  const renderAyah = (ayah: Ayah) => {
    const isPlaying = playingAyah === ayah.number;
    const isBookmarked = bookmarkedAyahs.includes(ayah.number);

    return (
      <View key={ayah.number} style={styles.ayahCard}>
        <View style={styles.ayahHeader}>
          <View style={styles.ayahNumberBadge}>
            <Text style={styles.ayahNumberText}>{ayah.number}</Text>
          </View>
          
          <View style={styles.ayahActions}>
            <TouchableOpacity 
              onPress={() => playAyahAudio(ayah)}
              style={styles.actionButton}
            >
              <IconSymbol 
                ios_icon_name={isPlaying ? "pause.circle.fill" : "play.circle.fill"}
                android_material_icon_name={isPlaying ? "pause_circle" : "play_circle"}
                size={28} 
                color={isPlaying ? colors.primary : colors.textSecondary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => toggleAyahBookmark(ayah.number)}
              style={styles.actionButton}
            >
              <IconSymbol 
                ios_icon_name={isBookmarked ? "bookmark.fill" : "bookmark"}
                android_material_icon_name={isBookmarked ? "bookmark" : "bookmark_border"}
                size={24} 
                color={isBookmarked ? colors.primary : colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.ayahTextArabic}>{ayah.text}</Text>
        
        {showTranslation && (
          <Text style={styles.ayahTranslation}>{ayah.translation}</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Stack.Screen options={{ headerShown: false }} />
        <NavigationHeader
          title="Loading..."
          showBack={true}
          showClose={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading Surah...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!surah) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Stack.Screen options={{ headerShown: false }} />
        <NavigationHeader
          title="Error"
          showBack={true}
          showClose={false}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Surah not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <NavigationHeader
        title={surah.englishName}
        showBack={true}
        showClose={false}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.surahHeader}>
          <Text style={styles.surahNameArabic}>{surah.name}</Text>
          <Text style={styles.surahNameEnglish}>{surah.englishName}</Text>
          <Text style={styles.surahTranslation}>{surah.englishNameTranslation}</Text>
          <Text style={styles.surahMeta}>
            {surah.numberOfAyahs} verses • {surah.revelationType}
          </Text>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.controlButton, showTranslation && styles.controlButtonActive]}
            onPress={() => setShowTranslation(!showTranslation)}
          >
            <IconSymbol 
              ios_icon_name="text.bubble"
              android_material_icon_name="translate"
              size={20} 
              color={showTranslation ? colors.card : colors.text} 
            />
            <Text style={[styles.controlButtonText, showTranslation && styles.controlButtonTextActive]}>
              Translation
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bismillahContainer}>
          <Text style={styles.bismillahText}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
          {showTranslation && (
            <Text style={styles.bismillahTranslation}>
              In the name of Allah, the Most Gracious, the Most Merciful
            </Text>
          )}
        </View>

        <View style={styles.ayahsList}>
          {ayahs.map((ayah) => renderAyah(ayah))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  },
  surahHeader: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  surahNameArabic: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Amiri_700Bold',
  },
  surahNameEnglish: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  surahTranslation: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  surahMeta: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  controlButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  controlButtonTextActive: {
    color: colors.card,
  },
  bismillahContainer: {
    backgroundColor: colors.lightGold,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  bismillahText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Amiri_700Bold',
    textAlign: 'center',
  },
  bismillahTranslation: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  ayahsList: {
    gap: 16,
  },
  ayahCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ayahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ayahNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ayahNumberText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: 'bold',
  },
  ayahActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  ayahTextArabic: {
    fontSize: 22,
    lineHeight: 40,
    color: colors.text,
    marginBottom: 12,
    fontFamily: 'Amiri_400Regular',
    textAlign: 'right',
  },
  ayahTranslation: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 40,
  },
});
