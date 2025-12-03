
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
      console.log('Returning cached surahs');
      return this.cache.get(cacheKey);
    }

    try {
      console.log('Fetching surahs from API...');
      const { data, error } = await supabase.functions.invoke('quran-api', {
        body: { path: '/surahs' }
      });
      
      if (error) {
        console.error('Error fetching surahs:', error);
        throw error;
      }

      if (data?.success && data?.data) {
        console.log('Successfully fetched', data.data.length, 'surahs');
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
      console.log('Returning cached surah', surahNumber);
      return this.cache.get(cacheKey);
    }

    try {
      console.log('Fetching surah', surahNumber, 'from API...');
      const { data, error } = await supabase.functions.invoke('quran-api', {
        body: { path: `/surah/${surahNumber}` }
      });
      
      if (error) {
        console.error('Error fetching surah:', error);
        throw error;
      }

      if (data?.success && data?.data) {
        console.log('Successfully fetched surah', surahNumber, 'with', data.data.ayahs?.length || 0, 'ayahs');
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
    console.log('Clearing Quran service cache');
    this.cache.clear();
  }

  getCachedSurah(surahNumber: number): SurahWithAyahs | null {
    const cacheKey = `surah_${surahNumber}`;
    return this.cache.get(cacheKey) || null;
  }
}

export const quranService = new QuranService();
