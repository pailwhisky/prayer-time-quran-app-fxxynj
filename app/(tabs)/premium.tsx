
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
}

const premiumFeatures: PremiumFeature[] = [
  {
    id: 'adhan_player',
    title: 'Audio Adhan Player',
    description: 'Beautiful call to prayer from holy places around the world',
    icon: 'volume-up',
    color: colors.primary,
    component: 'AdhanPlayer',
  },
  {
    id: 'ar_qibla',
    title: 'AR Qibla Compass',
    description: 'Augmented reality compass pointing directly to the Kaaba',
    icon: 'explore',
    color: colors.highlight,
    component: 'ARQiblaCompass',
  },
  {
    id: 'dua_library',
    title: 'Dua & Dhikr Library',
    description: 'Comprehensive collection of supplications with Tasbeeh counter',
    icon: 'menu-book',
    color: colors.secondary,
    component: 'DuaLibrary',
  },
  {
    id: 'progress_tracker',
    title: 'Spiritual Progress Tracker',
    description: 'Track your daily prayers, Quran reading, and spiritual habits',
    icon: 'trending-up',
    color: colors.highlight,
    component: 'SpiritualProgressTracker',
  },
  {
    id: 'hijri_calendar',
    title: 'Islamic Calendar',
    description: 'Hijri calendar with Islamic events and personal reminders',
    icon: 'calendar-today',
    color: colors.primary,
    component: 'HijriCalendar',
  },
  {
    id: 'mosque_finder',
    title: 'Nearby Mosque Finder',
    description: 'Find mosques near you with prayer times and facilities',
    icon: 'location-on',
    color: colors.secondary,
    component: 'MosqueFinder',
  },
  {
    id: 'verse_of_day',
    title: 'Verse of the Day',
    description: 'Daily Quran verses with mini Quran reader',
    icon: 'auto-stories',
    color: colors.highlight,
    component: 'VerseOfTheDay',
  },
  {
    id: 'advanced_notifications',
    title: 'Advanced Notifications',
    description: 'Customizable prayer reminders with different sounds',
    icon: 'notifications-active',
    color: colors.primary,
    component: 'AdvancedNotifications',
  },
];

export default function PremiumScreen() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedAdhan, setSelectedAdhan] = useState<any>(null);

  const openFeature = (featureId: string) => {
    setActiveModal(featureId);
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

  const renderFeatureCard = (feature: PremiumFeature) => (
    <TouchableOpacity
      key={feature.id}
      style={[styles.featureCard, { borderLeftColor: feature.color }]}
      onPress={() => openFeature(feature.id)}
    >
      <View style={styles.featureHeader}>
        <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
          <IconSymbol name={feature.icon} size={24} color={colors.card} />
        </View>
        <View style={styles.featureInfo}>
          <Text style={styles.featureTitle}>{feature.title}</Text>
          <Text style={styles.featureDescription}>{feature.description}</Text>
        </View>
        <IconSymbol name="chevron-right" size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

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

          {/* Features Grid */}
          <View style={styles.featuresContainer}>
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
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
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
