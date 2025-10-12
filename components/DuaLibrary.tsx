
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Dua {
  id: string;
  title: string;
  arabic_text: string;
  transliteration: string;
  translation: string;
  category: string;
  occasion: string;
  audio_url?: string;
}

interface DuaLibraryProps {
  visible: boolean;
  onClose: () => void;
}

export default function DuaLibrary({ visible, onClose }: DuaLibraryProps) {
  const [duas, setDuas] = useState<Dua[]>([]);
  const [filteredDuas, setFilteredDuas] = useState<Dua[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);
  const [showTasbeeh, setShowTasbeeh] = useState(false);
  const [tasbeehCount, setTasbeehCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'morning', 'evening', 'prayer', 'sleep', 'travel', 'general'];

  useEffect(() => {
    if (visible) {
      loadDuas();
      loadTasbeehCount();
    }
  }, [visible]);

  const filterDuas = useCallback(() => {
    let filtered = duas;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(dua => dua.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(dua =>
        dua.title.toLowerCase().includes(query) ||
        dua.translation.toLowerCase().includes(query) ||
        dua.category.toLowerCase().includes(query)
      );
    }

    setFilteredDuas(filtered);
  }, [duas, searchQuery, selectedCategory]);

  useEffect(() => {
    filterDuas();
  }, [filterDuas]);

  const loadDuas = async () => {
    try {
      const { data, error } = await supabase
        .from('duas')
        .select('*')
        .order('category', { ascending: true });

      if (error) {
        console.error('Error loading duas:', error);
        Alert.alert('Error', 'Failed to load duas');
        return;
      }

      setDuas(data || []);
    } catch (error) {
      console.error('Error loading duas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasbeehCount = async () => {
    try {
      const count = await AsyncStorage.getItem('tasbeeh_count');
      setTasbeehCount(count ? parseInt(count, 10) : 0);
    } catch (error) {
      console.error('Error loading tasbeeh count:', error);
    }
  };

  const saveTasbeehCount = async (count: number) => {
    try {
      await AsyncStorage.setItem('tasbeeh_count', count.toString());
    } catch (error) {
      console.error('Error saving tasbeeh count:', error);
    }
  };

  const incrementTasbeeh = () => {
    const newCount = tasbeehCount + 1;
    setTasbeehCount(newCount);
    saveTasbeehCount(newCount);
  };

  const resetTasbeeh = () => {
    setTasbeehCount(0);
    saveTasbeehCount(0);
  };

  const renderDuaCard = (dua: Dua) => (
    <TouchableOpacity
      key={dua.id}
      style={styles.duaCard}
      onPress={() => setSelectedDua(dua)}
    >
      <Text style={styles.duaTitle}>{dua.title}</Text>
      <Text style={styles.duaCategory}>{dua.category}</Text>
      <Text style={styles.duaTranslation} numberOfLines={2}>
        {dua.translation}
      </Text>
    </TouchableOpacity>
  );

  const renderDuaDetail = () => (
    <Modal
      visible={!!selectedDua}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setSelectedDua(null)}
    >
      <View style={styles.duaDetailContainer}>
        <View style={styles.duaDetailHeader}>
          <Text style={styles.duaDetailTitle}>{selectedDua?.title}</Text>
          <TouchableOpacity onPress={() => setSelectedDua(null)}>
            <IconSymbol name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.duaDetailContent}>
          <View style={styles.arabicContainer}>
            <Text style={styles.arabicText}>{selectedDua?.arabic_text}</Text>
          </View>

          {selectedDua?.transliteration && (
            <View style={styles.transliterationContainer}>
              <Text style={styles.sectionLabel}>Transliteration:</Text>
              <Text style={styles.transliterationText}>{selectedDua.transliteration}</Text>
            </View>
          )}

          <View style={styles.translationContainer}>
            <Text style={styles.sectionLabel}>Translation:</Text>
            <Text style={styles.translationText}>{selectedDua?.translation}</Text>
          </View>

          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>Category: {selectedDua?.category}</Text>
            {selectedDua?.occasion && (
              <Text style={styles.occasionLabel}>Occasion: {selectedDua.occasion}</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderTasbeehCounter = () => (
    <Modal
      visible={showTasbeeh}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowTasbeeh(false)}
    >
      <View style={styles.tasbeehContainer}>
        <View style={styles.tasbeehHeader}>
          <Text style={styles.tasbeehTitle}>Digital Tasbeeh</Text>
          <TouchableOpacity onPress={() => setShowTasbeeh(false)}>
            <IconSymbol name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.tasbeehContent}>
          <View style={styles.countDisplay}>
            <Text style={styles.countNumber}>{tasbeehCount}</Text>
            <Text style={styles.countLabel}>Count</Text>
          </View>

          <TouchableOpacity style={styles.incrementButton} onPress={incrementTasbeeh}>
            <Text style={styles.incrementButtonText}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={resetTasbeeh}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>

          <View style={styles.dhikrSuggestions}>
            <Text style={styles.dhikrTitle}>Common Dhikr:</Text>
            <Text style={styles.dhikrText}>سُبْحَانَ اللَّهِ (SubhanAllah)</Text>
            <Text style={styles.dhikrText}>الْحَمْدُ لِلَّهِ (Alhamdulillah)</Text>
            <Text style={styles.dhikrText}>اللَّهُ أَكْبَرُ (Allahu Akbar)</Text>
          </View>
        </View>
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
          <Text style={styles.title}>Dua & Dhikr Library</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.tasbeehHeaderButton}
              onPress={() => setShowTasbeeh(true)}
            >
              <IconSymbol name="radio-button-checked" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search duas..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <ScrollView
          horizontal
          style={styles.categoryContainer}
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive,
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView style={styles.duasList} showsVerticalScrollIndicator={false}>
          {loading ? (
            <Text style={styles.loadingText}>Loading duas...</Text>
          ) : filteredDuas.length > 0 ? (
            filteredDuas.map(renderDuaCard)
          ) : (
            <Text style={styles.emptyText}>No duas found</Text>
          )}
        </ScrollView>

        {renderDuaDetail()}
        {renderTasbeehCounter()}
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
  tasbeehHeaderButton: {
    padding: 8,
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
  categoryContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  categoryButton: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: colors.card,
  },
  duasList: {
    flex: 1,
    padding: 20,
  },
  duaCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 2px 4px ${colors.shadow}`,
    elevation: 2,
  },
  duaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  duaCategory: {
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  duaTranslation: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  loadingText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 40,
  },
  // Dua Detail Modal Styles
  duaDetailContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  duaDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  duaDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  duaDetailContent: {
    flex: 1,
    padding: 20,
  },
  arabicContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  arabicText: {
    fontSize: 24,
    color: colors.text,
    textAlign: 'right',
    lineHeight: 40,
    fontFamily: 'Amiri_400Regular',
  },
  transliterationContainer: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  transliterationText: {
    fontSize: 16,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  translationContainer: {
    marginBottom: 16,
  },
  translationText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  categoryContainer: {
    marginTop: 16,
  },
  categoryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  occasionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Tasbeeh Counter Styles
  tasbeehContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tasbeehHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tasbeehTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  tasbeehContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  countDisplay: {
    alignItems: 'center',
    marginBottom: 40,
  },
  countNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: colors.primary,
  },
  countLabel: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 8,
  },
  incrementButton: {
    backgroundColor: colors.primary,
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    boxShadow: `0px 4px 8px ${colors.shadow}`,
    elevation: 4,
  },
  incrementButtonText: {
    fontSize: 48,
    color: colors.card,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 40,
  },
  resetButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  dhikrSuggestions: {
    alignItems: 'center',
  },
  dhikrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  dhikrText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
    fontFamily: 'NotoSansArabic_400Regular',
  },
});
