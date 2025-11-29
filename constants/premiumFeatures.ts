
import { colors } from '@/styles/commonStyles';

export interface PremiumFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  component: string;
  featureKey: string;
  requiredTier: 'premium' | 'ultra';
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: '1',
    title: 'Adhan Player',
    description: 'Beautiful call to prayer from famous muezzins',
    icon: 'volume-up',
    color: colors.primary,
    component: 'AdhanPlayer',
    featureKey: 'adhan_player',
    requiredTier: 'premium',
  },
  {
    id: '2',
    title: 'AR Qibla Compass',
    description: 'Augmented reality Qibla direction finder',
    icon: 'explore',
    color: colors.accent,
    component: 'ARQiblaCompass',
    featureKey: 'ar_qibla',
    requiredTier: 'premium',
  },
  {
    id: '3',
    title: 'Dua Library',
    description: 'Comprehensive collection of Islamic supplications',
    icon: 'menu-book',
    color: colors.highlight,
    component: 'DuaLibrary',
    featureKey: 'dua_library',
    requiredTier: 'premium',
  },
  {
    id: '4',
    title: 'Islamic Calendar',
    description: 'Hijri calendar with important Islamic dates',
    icon: 'calendar-today',
    color: colors.secondary,
    component: 'HijriCalendar',
    featureKey: 'islamic_calendar',
    requiredTier: 'premium',
  },
  {
    id: '5',
    title: 'Mosque Finder',
    description: 'Find nearby mosques with prayer times',
    icon: 'place',
    color: colors.primary,
    component: 'MosqueFinder',
    featureKey: 'mosque_finder',
    requiredTier: 'premium',
  },
  {
    id: '6',
    title: 'Spiritual Progress',
    description: 'Track your prayers, fasting, and good deeds',
    icon: 'trending-up',
    color: colors.accent,
    component: 'SpiritualProgressTracker',
    featureKey: 'prayer_stats',
    requiredTier: 'premium',
  },
  {
    id: '7',
    title: 'Advanced Notifications',
    description: 'Customize prayer reminders and sounds',
    icon: 'notifications',
    color: colors.highlight,
    component: 'AdvancedNotifications',
    featureKey: 'custom_notifications',
    requiredTier: 'premium',
  },
  {
    id: '8',
    title: 'Verse of the Day',
    description: 'Daily inspiring verses with mini Quran reader',
    icon: 'auto-stories',
    color: colors.secondary,
    component: 'VerseOfTheDay',
    featureKey: 'verse_of_day',
    requiredTier: 'ultra',
  },
];
