
import { colors } from '@/styles/commonStyles';

export interface PremiumFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  component: string;
  featureKey: string;
  requiredTier: 'ihsan' | 'iman';
  isPremium?: boolean;
  requiredFeature?: string;
}

export interface TierFeatureDetail {
  name: string;
  included: boolean;
  description?: string;
}

export interface SubscriptionTier {
  id: 'free' | 'ihsan' | 'iman';
  name: string;
  displayName: string;
  price: string;
  priceDetail: string;
  tagline: string;
  color: string;
  gradientColors: string[];
  icon: string;
  features: TierFeatureDetail[];
  highlights: string[];
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
    requiredTier: 'ihsan',
    isPremium: true,
    requiredFeature: 'adhan_player',
  },
  {
    id: '2',
    title: 'AR Qibla Compass',
    description: 'Augmented reality Qibla direction finder',
    icon: 'explore',
    color: colors.accent,
    component: 'ARQiblaCompass',
    featureKey: 'ar_qibla',
    requiredTier: 'ihsan',
    isPremium: true,
    requiredFeature: 'ar_qibla',
  },
  {
    id: '3',
    title: 'Dua Library',
    description: 'Comprehensive collection of Islamic supplications',
    icon: 'menu-book',
    color: colors.highlight,
    component: 'DuaLibrary',
    featureKey: 'dua_library',
    requiredTier: 'ihsan',
    isPremium: true,
    requiredFeature: 'dua_library',
  },
  {
    id: '4',
    title: 'Islamic Calendar',
    description: 'Hijri calendar with important Islamic dates',
    icon: 'calendar-today',
    color: colors.secondary,
    component: 'HijriCalendar',
    featureKey: 'islamic_calendar',
    requiredTier: 'ihsan',
    isPremium: true,
    requiredFeature: 'islamic_calendar',
  },
  {
    id: '5',
    title: 'Mosque Finder',
    description: 'Find nearby mosques with prayer times',
    icon: 'place',
    color: colors.primary,
    component: 'MosqueFinder',
    featureKey: 'mosque_finder',
    requiredTier: 'ihsan',
    isPremium: true,
    requiredFeature: 'mosque_finder',
  },
  {
    id: '6',
    title: 'Spiritual Progress',
    description: 'Track your prayers, fasting, and good deeds',
    icon: 'trending-up',
    color: colors.accent,
    component: 'SpiritualProgressTracker',
    featureKey: 'prayer_stats',
    requiredTier: 'ihsan',
    isPremium: true,
    requiredFeature: 'prayer_stats',
  },
  {
    id: '7',
    title: 'Advanced Notifications',
    description: 'Customize prayer reminders and sounds',
    icon: 'notifications',
    color: colors.highlight,
    component: 'AdvancedNotifications',
    featureKey: 'custom_notifications',
    requiredTier: 'ihsan',
    isPremium: true,
    requiredFeature: 'custom_notifications',
  },
  {
    id: '8',
    title: 'Verse of the Day',
    description: 'Daily inspiring verses with mini Quran reader',
    icon: 'auto-stories',
    color: colors.secondary,
    component: 'VerseOfTheDay',
    featureKey: 'verse_of_day',
    requiredTier: 'iman',
    isPremium: true,
    requiredFeature: 'verse_of_day',
  },
];

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    displayName: 'Basic',
    price: '$0',
    priceDetail: 'Forever',
    tagline: 'Essential prayer times',
    color: colors.textSecondary,
    gradientColors: [colors.card, colors.background],
    icon: 'lock-open',
    features: [
      { name: 'Prayer Times', included: true, description: 'Accurate daily prayer times based on location' },
      { name: 'Qibla Direction', included: true, description: 'Basic compass pointing to Mecca' },
      { name: 'Quran Reader', included: true, description: 'Read the Holy Quran with translations' },
      { name: 'Basic Notifications', included: true, description: 'Simple prayer time reminders' },
      { name: 'Adhan Player', included: false },
      { name: 'AR Qibla Compass', included: false },
      { name: 'Dua Library', included: false },
      { name: 'Islamic Calendar', included: false },
      { name: 'Mosque Finder', included: false },
      { name: 'Spiritual Progress Tracker', included: false },
      { name: 'Advanced Notifications', included: false },
      { name: 'Verse of the Day', included: false },
    ],
    highlights: [
      'Perfect for getting started',
      'Core prayer functionality',
      'No credit card required',
    ],
  },
  {
    id: 'ihsan',
    name: 'Ihsan',
    displayName: 'Ihsan - Excellence',
    price: '$9.99',
    priceDetail: 'per month',
    tagline: 'Worship with excellence',
    color: colors.primary,
    gradientColors: [colors.primary, colors.accent],
    icon: 'star',
    features: [
      { name: 'Prayer Times', included: true, description: 'Accurate daily prayer times based on location' },
      { name: 'Qibla Direction', included: true, description: 'Basic compass pointing to Mecca' },
      { name: 'Quran Reader', included: true, description: 'Read the Holy Quran with translations' },
      { name: 'Basic Notifications', included: true, description: 'Simple prayer time reminders' },
      { name: 'Adhan Player', included: true, description: 'Beautiful adhans from famous muezzins worldwide' },
      { name: 'AR Qibla Compass', included: true, description: 'Augmented reality Qibla finder with camera overlay' },
      { name: 'Dua Library', included: true, description: '100+ authentic duas with Arabic, transliteration & translation' },
      { name: 'Islamic Calendar', included: true, description: 'Hijri calendar with important Islamic dates & events' },
      { name: 'Mosque Finder', included: true, description: 'Locate nearby mosques with directions & prayer times' },
      { name: 'Spiritual Progress Tracker', included: true, description: 'Track prayers, fasting, Quran reading & good deeds' },
      { name: 'Advanced Notifications', included: true, description: 'Customizable reminders with multiple adhan sounds' },
      { name: 'Verse of the Day', included: false },
    ],
    highlights: [
      'All essential features unlocked',
      'Perfect for daily worship',
      'Cancel anytime',
      'Regular updates included',
    ],
  },
  {
    id: 'iman',
    name: 'Iman',
    displayName: 'Iman - Faith',
    price: '$888',
    priceDetail: 'one-time payment',
    tagline: 'Lifetime spiritual companion',
    color: colors.superUltraGold,
    gradientColors: [colors.superUltraGold, colors.superUltraGoldShine, colors.superUltraGoldDark],
    icon: 'crown',
    features: [
      { name: 'Prayer Times', included: true, description: 'Accurate daily prayer times based on location' },
      { name: 'Qibla Direction', included: true, description: 'Basic compass pointing to Mecca' },
      { name: 'Quran Reader', included: true, description: 'Read the Holy Quran with translations' },
      { name: 'Basic Notifications', included: true, description: 'Simple prayer time reminders' },
      { name: 'Adhan Player', included: true, description: 'Beautiful adhans from famous muezzins worldwide' },
      { name: 'AR Qibla Compass', included: true, description: 'Augmented reality Qibla finder with camera overlay' },
      { name: 'Dua Library', included: true, description: '100+ authentic duas with Arabic, transliteration & translation' },
      { name: 'Islamic Calendar', included: true, description: 'Hijri calendar with important Islamic dates & events' },
      { name: 'Mosque Finder', included: true, description: 'Locate nearby mosques with directions & prayer times' },
      { name: 'Spiritual Progress Tracker', included: true, description: 'Track prayers, fasting, Quran reading & good deeds' },
      { name: 'Advanced Notifications', included: true, description: 'Customizable reminders with multiple adhan sounds' },
      { name: 'Verse of the Day', included: true, description: 'Daily inspiring verses with AI-powered mini Quran reader' },
    ],
    highlights: [
      'Lifetime access - pay once, use forever',
      'All features unlocked permanently',
      'Priority customer support',
      'Early access to new features',
      'Support Islamic app development',
      'Best value for committed users',
    ],
  },
];
