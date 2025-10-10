
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
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QuranVerse {
  surah: number;
  ayah: number;
  arabic: string;
  translation: string;
  transliteration: string;
  surahName: string;
  surahNameArabic: string;
}

interface Surah {
  number: number;
  name: string;
  arabicName: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface VerseOfTheDayProps {
  visible: boolean;
  onClose: () => void;
}

// Sample Quran data - in a real app, this would come from an API or database
const sampleVerses: QuranVerse[] = [
  {
    surah: 2,
    ayah: 255,
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ",
    translation: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth.",
    transliteration: "Allahu la ilaha illa huwa al-hayyu al-qayyum. La ta'khudhuhu sinatun wa la nawm. Lahu ma fi as-samawati wa ma fi al-ard.",
    surahName: "Al-Baqarah",
    surahNameArabic: "البقرة"
  },
  {
    surah: 3,
    ayah: 200,
    arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُفْلِحُونَ",
    translation: "O you who believe! Persevere in patience and constancy; vie in such perseverance; strengthen each other; and fear Allah; that you may prosper.",
    transliteration: "Ya ayyuha alladhina amanu isbiru wa sabiru wa rabitu wa ittaqu Allah la'allakum tuflihun.",
    surahName: "Ali 'Imran",
    surahNameArabic: "آل عمران"
  },
  {
    surah: 13,
    ayah: 28,
    arabic: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    translation: "Those who believe and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.",
    transliteration: "Alladhina amanu wa tatma'innu qulubuhum bidhikri Allah. Ala bidhikri Allah tatma'innu al-qulub.",
    surahName: "Ar-Ra'd",
    surahNameArabic: "الرعد"
  },
  {
    surah: 94,
    ayah: 5,
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "For indeed, with hardship [will be] ease.",
    transliteration: "Fa inna ma'a al-'usri yusra.",
    surahName: "Ash-Sharh",
    surahNameArabic: "الشرح"
  },
  {
    surah: 65,
    ayah: 3,
    arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ ۚ قَدْ جَعَلَ اللَّهُ لِكُلِّ شَيْءٍ قَدْرًا",
    translation: "And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose. Allah has already set for everything a [decreed] extent.",
    transliteration: "Wa man yatawakkal 'ala Allah fahuwa hasbuhu. Inna Allah baligu amrihi. Qad ja'ala Allah likulli shay'in qadra.",
    surahName: "At-Talaq",
    surahNameArabic: "الطلاق"
  }
];

const sampleSurahs: Surah[] = [
  { number: 1, name: "Al-Fatihah", arabicName: "الفاتحة", englishName: "The Opening", numberOfAyahs: 7, revelationType: "Meccan" },
  { number: 2, name: "Al-Baqarah", arabicName: "البقرة", englishName: "The Cow", numberOfAyahs: 286, revelationType: "Medinan" },
  { number: 3, name: "Ali 'Imran", arabicName: "آل عمران", englishName: "Family of Imran", numberOfAyahs: 200, revelationType: "Medinan" },
  { number: 13, name: "Ar-Ra'd", arabicName: "الرعد", englishName: "The Thunder", numberOfAyahs: 43, revelationType: "Medinan" },
  { number: 94, name: "Ash-Sharh", arabicName: "الشرح", englishName: "The Relief", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 65, name: "At-Talaq", arabicName: "الطلاق", englishName: "The Divorce", numberOfAyahs: 12, revelationType: "Medinan" },
];

export default function VerseOfTheDay({ visible, onClose }: VerseOfTheDayProps) {
  const [todayVerse, setTodayVerse] = useState<QuranVerse | null>(null);
  const [showQuranReader, setShowQuranReader] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>(sampleSurahs);

  useEffect(() => {
    if (visible) {
      loadTodayVerse();
    }
  }, [visible]);

  useEffect(() => {
    filterSurahs();
  }, [searchQuery]);

  const loadTodayVerse = async () => {
    try {
      const today = new Date().toDateString();
      const storedVerse = await AsyncStorage.getItem(`verse_${today}`);
      
      if (storedVerse) {
        setTodayVerse(JSON.parse(storedVerse));
      } else {
        // Generate a new verse for today
        const randomIndex = Math.floor(Math.random() * sampleVerses.length);
        const verse = sampleVerses[randomIndex];
        setTodayVerse(verse);
        
        // Store it for today
        await AsyncStorage.setItem(`verse_${today}`, JSON.stringify(verse));
      }
    } catch (error) {
      console.error('Error loading today\'s verse:', error);
      // Fallback to first verse
      setTodayVerse(sampleVerses[0]);
    }
  };

  const filterSurahs = () => {
    if (!searchQuery.trim()) {
      setFilteredSurahs(sampleSurahs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = sampleSurahs.filter(surah =>
      surah.name.toLowerCase().includes(query) ||
      surah.englishName.toLowerCase().includes(query) ||
      surah.number.toString().includes(query)
    );
    setFilteredSurahs(filtered);
  };

  const openQuranReader = (surah?: Surah) => {
    if (surah) {
      setSelectedSurah(surah);
    }
    setShowQuranReader(true);
  };

  const renderVerseCard = () => {
    if (!todayVerse) return null;

    return (
      <View style={styles.verseCard}>
        <View style={styles.verseHeader}>
          <Text style={styles.verseTitle}>Verse of the Day</Text>
          <Text style={styles.verseReference}>
            {todayVerse.surahName} {todayVerse.surah}:{todayVerse.ayah}
          </Text>
        </View>

        <View style={styles.arabicContainer}>
          <Text style={styles.arabicText}>{todayVerse.arabic}</Text>
        </View>

        <View style={styles.transliterationContainer}>
          <Text style={styles.transliterationText}>{todayVerse.transliteration}</Text>
        </View>

        <View style={styles.translationContainer}>
          <Text style={styles.translationText}>{todayVerse.translation}</Text>
        </View>

        <TouchableOpacity
          style={styles.readMoreButton}
          onPress={() => {
            const surah = sampleSurahs.find(s => s.number === todayVerse.surah);
            openQuranReader(surah);
          }}
        >
          <Text style={styles.readMoreButtonText}>Read Full Surah</Text>
          <IconSymbol name="arrow-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuranReader = () => (
    <Modal
      visible={showQuranReader}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowQuranReader(false)}
    >
      <View style={styles.readerContainer}>
        <View style={styles.readerHeader}>
          <Text style={styles.readerTitle}>
            {selectedSurah ? selectedSurah.name : 'Quran Reader'}
          </Text>
          <TouchableOpacity onPress={() => setShowQuranReader(false)}>
            <IconSymbol name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {selectedSurah ? (
          <ScrollView style={styles.surahContent}>
            <View style={styles.surahHeader}>
              <Text style={styles.surahName}>{selectedSurah.arabicName}</Text>
              <Text style={styles.surahEnglishName}>{selectedSurah.englishName}</Text>
              <Text style={styles.surahInfo}>
                {selectedSurah.numberOfAyahs} verses • {selectedSurah.revelationType}
              </Text>
            </View>

            <View style={styles.bismillahContainer}>
              <Text style={styles.bismillahText}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </Text>
              <Text style={styles.bismillahTranslation}>
                In the name of Allah, the Entirely Merciful, the Especially Merciful.
              </Text>
            </View>

            {/* Sample verses for the selected surah */}
            {sampleVerses
              .filter(verse => verse.surah === selectedSurah.number)
              .map((verse, index) => (
                <View key={index} style={styles.verseContainer}>
                  <View style={styles.verseNumber}>
                    <Text style={styles.verseNumberText}>{verse.ayah}</Text>
                  </View>
                  <View style={styles.verseContent}>
                    <Text style={styles.verseArabic}>{verse.arabic}</Text>
                    <Text style={styles.verseTranslation}>{verse.translation}</Text>
                  </View>
                </View>
              ))}

            <Text style={styles.moreVersesNote}>
              This is a sample. In a full app, all verses would be displayed here.
            </Text>
          </ScrollView>
        ) : (
          <ScrollView style={styles.surahList}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search surahs..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {filteredSurahs.map((surah) => (
              <TouchableOpacity
                key={surah.number}
                style={styles.surahItem}
                onPress={() => setSelectedSurah(surah)}
              >
                <View style={styles.surahNumber}>
                  <Text style={styles.surahNumberText}>{surah.number}</Text>
                </View>
                <View style={styles.surahDetails}>
                  <Text style={styles.surahItemName}>{surah.name}</Text>
                  <Text style={styles.surahItemEnglish}>{surah.englishName}</Text>
                  <Text style={styles.surahItemInfo}>
                    {surah.numberOfAyahs} verses • {surah.revelationType}
                  </Text>
                </View>
                <Text style={styles.surahArabicName}>{surah.arabicName}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
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
          <Text style={styles.title}>Verse of the Day</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.quranButton}
              onPress={() => openQuranReader()}
            >
              <IconSymbol name="menu-book" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            Start your day with inspiration from the Holy Quran
          </Text>

          {renderVerseCard()}

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openQuranReader()}
            >
              <IconSymbol name="menu-book" size={20} color={colors.card} />
              <Text style={styles.actionButtonText}>Open Quran Reader</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={loadTodayVerse}
            >
              <IconSymbol name="refresh" size={20} color={colors.primary} />
              <Text style={styles.secondaryActionButtonText}>New Verse</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {renderQuranReader()}
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
  quranButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  verseCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 4px 8px ${colors.shadow}`,
    elevation: 3,
  },
  verseHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  verseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  verseReference: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  arabicContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  arabicText: {
    fontSize: 22,
    color: colors.text,
    textAlign: 'right',
    lineHeight: 36,
    fontFamily: 'NotoSansArabic_400Regular',
  },
  transliterationContainer: {
    marginBottom: 16,
  },
  transliterationText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 24,
    textAlign: 'center',
  },
  translationContainer: {
    marginBottom: 20,
  },
  translationText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'center',
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 8,
  },
  readMoreButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryActionButton: {
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  secondaryActionButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  // Quran Reader Styles
  readerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  readerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  readerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  surahList: {
    flex: 1,
  },
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
    fontSize: 14,
    fontWeight: 'bold',
  },
  surahDetails: {
    flex: 1,
  },
  surahItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  surahItemEnglish: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  surahItemInfo: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  surahArabicName: {
    fontSize: 18,
    color: colors.primary,
    fontFamily: 'NotoSansArabic_400Regular',
  },
  // Surah Content Styles
  surahContent: {
    flex: 1,
    padding: 20,
  },
  surahHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  surahName: {
    fontSize: 28,
    color: colors.primary,
    fontFamily: 'NotoSansArabic_700Bold',
    marginBottom: 8,
  },
  surahEnglishName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  surahInfo: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bismillahContainer: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bismillahText: {
    fontSize: 20,
    color: colors.primary,
    fontFamily: 'NotoSansArabic_400Regular',
    marginBottom: 8,
  },
  bismillahTranslation: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  verseContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  verseNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    alignSelf: 'flex-start',
  },
  verseNumberText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: 'bold',
  },
  verseContent: {
    flex: 1,
  },
  verseArabic: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'right',
    lineHeight: 32,
    fontFamily: 'NotoSansArabic_400Regular',
    marginBottom: 12,
  },
  verseTranslation: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  moreVersesNote: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 20,
    padding: 16,
  },
});
