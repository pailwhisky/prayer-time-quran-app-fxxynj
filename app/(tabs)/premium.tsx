
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import AdhanPlayer from '@/components/AdhanPlayer';
import VerseOfTheDay from '@/components/VerseOfTheDay';
import AdvancedNotifications from '@/components/AdvancedNotifications';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { IconSymbol } from '@/components/IconSymbol';
import SpiritualProgressTracker from '@/components/SpiritualProgressTracker';
import MosqueFinder from '@/components/MosqueFinder';
import SubscriptionModal from '@/components/SubscriptionModal';
import DuaLibrary from '@/components/DuaLibrary';
import HijriCalendar from '@/components/HijriCalendar';
import ARQiblaCompass from '@/components/ARQiblaCompass';
import NavigationHeader from '@/components/NavigationHeader';
import FeatureVerificationTool from '@/components/FeatureVerificationTool';

interface PremiumFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  component: string;
  featureKey: string;
  requiredTier: 'premium' | 'ultra';
}

const PREMIUM_FEATURES: PremiumFeature[] = [
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

export default function PremiumScreen() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showVerificationTool, setShowVerificationTool] = useState(false);
  const { currentTier, cancelSubscription } = useSubscription();

  const openFeature = (feature: PremiumFeature) => {
    setActiveModal(feature.component);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleAdhanSelection = (recording: any) => {
    console.log('Selected adhan recording:', recording);
    closeModal();
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const success = await cancelSubscription();
            if (success) {
              Alert.alert('Subscription Cancelled', 'Your subscription has been cancelled.');
            } else {
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderSubscriptionStatus = () => (
    <View style={styles.subscriptionStatus}>
      <View style={styles.statusHeader}>
        <IconSymbol
          name={currentTier === 'free' ? 'lock' : 'check-circle'}
          size={32}
          color={currentTier === 'free' ? colors.textSecondary : colors.primary}
        />
        <View style={styles.statusInfo}>
          <Text style={styles.statusTitle}>
            {currentTier === 'free' ? 'Free Plan' : `${currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Plan`}
          </Text>
          <Text style={styles.statusDescription}>
            {currentTier === 'free'
              ? 'Upgrade to unlock premium features'
              : 'Thank you for your support!'}
          </Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        {currentTier === 'free' ? (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => setShowSubscriptionModal(true)}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            <IconSymbol name="arrow-forward" size={20} color={colors.card} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.manageButton}
            onPress={handleCancelSubscription}
          >
            <Text style={styles.manageButtonText}>Manage Subscription</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={() => setShowVerificationTool(true)}
        >
          <IconSymbol name="verified" size={20} color={colors.primary} />
          <Text style={styles.verifyButtonText}>Verify Features</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFeatureCard = (feature: PremiumFeature) => (
    <TouchableOpacity
      key={feature.id}
      style={styles.featureCard}
      onPress={() => openFeature(feature)}
    >
      <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
        <IconSymbol name={feature.icon} size={32} color={feature.color} />
      </View>

      <View style={styles.featureInfo}>
        <View style={styles.featureTitleRow}>
          <Text style={styles.featureTitle}>{feature.title}</Text>
          {feature.requiredTier === 'ultra' && (
            <View style={styles.ultraBadge}>
              <Text style={styles.ultraBadgeText}>ULTRA</Text>
            </View>
          )}
        </View>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>

      <IconSymbol name="chevron-right" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <NavigationHeader
        title="Premium Features"
        showBack={false}
        showClose={false}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderSubscriptionStatus()}

        <Text style={styles.sectionTitle}>Available Features</Text>

        <View style={styles.featuresList}>
          {PREMIUM_FEATURES.map((feature) => renderFeatureCard(feature))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <AdhanPlayer
        visible={activeModal === 'AdhanPlayer'}
        onClose={closeModal}
        onSelectAdhan={handleAdhanSelection}
      />
      <ARQiblaCompass
        visible={activeModal === 'ARQiblaCompass'}
        onClose={closeModal}
      />
      <DuaLibrary
        visible={activeModal === 'DuaLibrary'}
        onClose={closeModal}
      />
      <HijriCalendar
        visible={activeModal === 'HijriCalendar'}
        onClose={closeModal}
      />
      <MosqueFinder
        visible={activeModal === 'MosqueFinder'}
        onClose={closeModal}
      />
      <SpiritualProgressTracker
        visible={activeModal === 'SpiritualProgressTracker'}
        onClose={closeModal}
      />
      <AdvancedNotifications
        visible={activeModal === 'AdvancedNotifications'}
        onClose={closeModal}
      />
      <VerseOfTheDay
        visible={activeModal === 'VerseOfTheDay'}
        onClose={closeModal}
      />

      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />

      <FeatureVerificationTool
        visible={showVerificationTool}
        onClose={() => setShowVerificationTool(false)}
      />
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
  subscriptionStatus: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0 4px 8px ${colors.shadow}`,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusInfo: {
    flex: 1,
    marginLeft: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  upgradeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.card,
    marginRight: 8,
  },
  manageButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 6,
  },
  verifyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureCard: {
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
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  ultraBadge: {
    backgroundColor: colors.highlight,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ultraBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.card,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 120,
  },
});
