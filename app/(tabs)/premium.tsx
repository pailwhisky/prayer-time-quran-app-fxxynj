
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
import { IconSymbol } from '@/components/IconSymbol';
import { useSubscription } from '@/contexts/SubscriptionContext';
import SubscriptionModal from '@/components/SubscriptionModal';
import PremiumGate from '@/components/PremiumGate';
import AdhanPlayer from '@/components/AdhanPlayer';
import DuaLibrary from '@/components/DuaLibrary';
import SpiritualProgressTracker from '@/components/SpiritualProgressTracker';
import HijriCalendar from '@/components/HijriCalendar';
import MosqueFinder from '@/components/MosqueFinder';
import VerseOfTheDay from '@/components/VerseOfTheDay';
import AdvancedNotifications from '@/components/AdvancedNotifications';
import ARQiblaCompass from '@/components/ARQiblaCompass';

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

const premiumFeatures: PremiumFeature[] = [
  {
    id: 'adhan_player',
    title: 'Audio Adhan Player',
    description: 'Beautiful call to prayer from holy places around the world',
    icon: 'volume-up',
    color: colors.primary,
    component: 'AdhanPlayer',
    featureKey: 'adhan_sounds',
    requiredTier: 'premium',
  },
  {
    id: 'ar_qibla',
    title: 'AR Qibla Compass',
    description: 'Augmented reality compass pointing directly to the Kaaba',
    icon: 'explore',
    color: colors.highlight,
    component: 'ARQiblaCompass',
    featureKey: 'qibla_direction',
    requiredTier: 'premium',
  },
  {
    id: 'dua_library',
    title: 'Dua & Dhikr Library',
    description: 'Comprehensive collection of supplications with Tasbeeh counter',
    icon: 'menu-book',
    color: colors.secondary,
    component: 'DuaLibrary',
    featureKey: 'allah_names',
    requiredTier: 'premium',
  },
  {
    id: 'progress_tracker',
    title: 'Spiritual Progress Tracker',
    description: 'Track your daily prayers, Quran reading, and spiritual habits',
    icon: 'trending-up',
    color: colors.highlight,
    component: 'SpiritualProgressTracker',
    featureKey: 'prayer_times',
    requiredTier: 'premium',
  },
  {
    id: 'hijri_calendar',
    title: 'Islamic Calendar',
    description: 'Hijri calendar with Islamic events and personal reminders',
    icon: 'calendar-today',
    color: colors.primary,
    component: 'HijriCalendar',
    featureKey: 'fasting_tracker',
    requiredTier: 'premium',
  },
  {
    id: 'mosque_finder',
    title: 'Nearby Mosque Finder',
    description: 'Find mosques near you with prayer times and facilities',
    icon: 'location-on',
    color: colors.secondary,
    component: 'MosqueFinder',
    featureKey: 'halal_finder',
    requiredTier: 'premium',
  },
  {
    id: 'verse_of_day',
    title: 'Verse of the Day',
    description: 'Daily Quran verses with mini Quran reader',
    icon: 'auto-stories',
    color: colors.highlight,
    component: 'VerseOfTheDay',
    featureKey: 'quran_reader',
    requiredTier: 'premium',
  },
  {
    id: 'advanced_notifications',
    title: 'Advanced Notifications',
    description: 'Customizable prayer reminders with different sounds',
    icon: 'notifications-active',
    color: colors.primary,
    component: 'AdvancedNotifications',
    featureKey: 'advanced_notifications',
    requiredTier: 'premium',
  },
];

export default function PremiumScreen() {
  const { currentTier, subscription, hasFeature, cancelSubscription } = useSubscription();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedAdhan, setSelectedAdhan] = useState<any>(null);

  const openFeature = (feature: PremiumFeature) => {
    if (hasFeature(feature.featureKey)) {
      setActiveModal(feature.id);
    } else {
      setShowSubscriptionModal(true);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleAdhanSelection = (recording: any) => {
    setSelectedAdhan(recording);
    Alert.alert(
      'Adhan Selected',
      `${recording.name} has been set as your default Adhan for prayer notifications.`,
      [{ text: 'OK' }]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
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

  const renderSubscriptionStatus = () => {
    if (currentTier === 'free') {
      return (
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <IconSymbol name="info" size={24} color={colors.primary} />
            <Text style={styles.statusTitle}>Free Plan</Text>
          </View>
          <Text style={styles.statusDescription}>
            You're currently on the free plan. Upgrade to unlock powerful features for your spiritual journey.
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => setShowSubscriptionModal(true)}
          >
            <IconSymbol name="star" size={20} color={colors.card} />
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <IconSymbol name="check-circle" size={24} color={colors.primary} />
          <Text style={styles.statusTitle}>
            {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Plan
          </Text>
        </View>
        <Text style={styles.statusDescription}>
          You have access to all {currentTier} features. Thank you for your support!
        </Text>
        {subscription && (
          <View style={styles.subscriptionDetails}>
            <Text style={styles.subscriptionDetailText}>
              Billing: {subscription.billing_cycle}
            </Text>
            {subscription.next_payment_date && (
              <Text style={styles.subscriptionDetailText}>
                Next payment: {new Date(subscription.next_payment_date).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}
        <View style={styles.subscriptionActions}>
          {currentTier === 'premium' && (
            <TouchableOpacity
              style={styles.upgradeToUltraButton}
              onPress={() => setShowSubscriptionModal(true)}
            >
              <Text style={styles.upgradeToUltraButtonText}>Upgrade to Ultra</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelSubscription}
          >
            <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFeatureCard = (feature: PremiumFeature) => {
    const hasAccess = hasFeature(feature.featureKey);

    return (
      <TouchableOpacity
        key={feature.id}
        style={[styles.featureCard, { borderLeftColor: feature.color }]}
        onPress={() => openFeature(feature)}
      >
        <View style={styles.featureHeader}>
          <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
            <IconSymbol name={feature.icon} size={24} color={colors.card} />
          </View>
          <View style={styles.featureInfo}>
            <View style={styles.featureTitleRow}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              {!hasAccess && (
                <IconSymbol name="lock" size={16} color={colors.highlight} />
              )}
            </View>
            <Text style={styles.featureDescription}>{feature.description}</Text>
            {!hasAccess && (
              <Text style={styles.featureRequirement}>
                Requires {feature.requiredTier.charAt(0).toUpperCase() + feature.requiredTier.slice(1)}
              </Text>
            )}
          </View>
          <IconSymbol name="chevron-right" size={20} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Premium Features',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Premium Features</Text>
            <Text style={styles.subtitle}>
              Enhance your spiritual journey with these powerful tools
            </Text>
          </View>

          {/* Subscription Status */}
          {renderSubscriptionStatus()}

          {/* Features Grid */}
          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>Available Features</Text>
            {premiumFeatures.map(renderFeatureCard)}
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <IconSymbol name="info" size={24} color={colors.primary} />
              <Text style={styles.infoText}>
                These premium features are designed to deepen your connection with Allah
                and make your daily prayers more meaningful and organized.
              </Text>
            </View>
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Modals */}
        <AdhanPlayer
          visible={activeModal === 'adhan_player'}
          onClose={closeModal}
          onSelectAdhan={handleAdhanSelection}
        />

        <ARQiblaCompass
          visible={activeModal === 'ar_qibla'}
          onClose={closeModal}
        />

        <DuaLibrary
          visible={activeModal === 'dua_library'}
          onClose={closeModal}
        />

        <SpiritualProgressTracker
          visible={activeModal === 'progress_tracker'}
          onClose={closeModal}
        />

        <HijriCalendar
          visible={activeModal === 'hijri_calendar'}
          onClose={closeModal}
        />

        <MosqueFinder
          visible={activeModal === 'mosque_finder'}
          onClose={closeModal}
        />

        <VerseOfTheDay
          visible={activeModal === 'verse_of_day'}
          onClose={closeModal}
        />

        <AdvancedNotifications
          visible={activeModal === 'advanced_notifications'}
          onClose={closeModal}
        />

        <SubscriptionModal
          visible={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      </SafeAreaView>
    </>
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
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  subscriptionDetails: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  subscriptionDetailText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  subscriptionActions: {
    gap: 12,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.card,
  },
  upgradeToUltraButton: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  upgradeToUltraButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.card,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    boxShadow: `0px 4px 8px ${colors.shadow}`,
    elevation: 3,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    gap: 8,
    marginBottom: 4,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  featureRequirement: {
    fontSize: 12,
    color: colors.highlight,
    marginTop: 4,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
});
