
import { supabase } from '@/app/integrations/supabase/client';

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  translation: string;
  audio: string;
}

export interface SurahWithAyahs {
  surah: Surah;
  ayahs: Ayah[];
}

class QuranService {
  private cache: Map<string, any> = new Map();

  async getSurahs(): Promise<Surah[]> {
    const cacheKey = 'all_surahs';
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const { data, error } = await supabase.functions.invoke('quran-api/surahs');
      
      if (error) {
        console.error('Error fetching surahs:', error);
        throw error;
      }

      if (data?.success && data?.data) {
        this.cache.set(cacheKey, data.data);
        return data.data;
      }

      throw new Error('Failed to fetch surahs');
    } catch (error) {
      console.error('Error in getSurahs:', error);
      throw error;
    }
  }

  async getSurah(surahNumber: number): Promise<SurahWithAyahs> {
    const cacheKey = `surah_${surahNumber}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const { data, error } = await supabase.functions.invoke(`quran-api/surah/${surahNumber}`);
      
      if (error) {
        console.error('Error fetching surah:', error);
        throw error;
      }

      if (data?.success && data?.data) {
        this.cache.set(cacheKey, data.data);
        return data.data;
      }

      throw new Error('Failed to fetch surah');
    } catch (error) {
      console.error('Error in getSurah:', error);
      throw error;
    }
  }

  clearCache() {
    this.cache.clear();
  }

  getCachedSurah(surahNumber: number): SurahWithAyahs | null {
    const cacheKey = `surah_${surahNumber}`;
    return this.cache.get(cacheKey) || null;
  }
}

export const quranService = new QuranService();
