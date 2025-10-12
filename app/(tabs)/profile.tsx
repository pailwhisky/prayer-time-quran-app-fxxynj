
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import SadaqahDonation from '@/components/SadaqahDonation';
import IslamicChatbot from '@/components/IslamicChatbot';
import DailyHadith from '@/components/DailyHadith';

export default function ProfileScreen() {
  const [showSadaqah, setShowSadaqah] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showHadith, setShowHadith] = useState(false);

  const handleNotificationSettings = () => {
    Alert.alert(
      'Notification Settings',
      'Prayer notifications are managed automatically. Make sure notifications are enabled in your device settings.',
      [{ text: 'OK' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Prayer Times',
      'This app calculates Islamic prayer times based on your location using astronomical calculations. The Qibla direction points towards the Kaaba in Mecca.\n\nMay Allah accept your prayers.',
      [{ text: 'Ameen' }]
    );
  };

  const handleFeedback = () => {
    Alert.alert(
      'Feedback',
      'We value your feedback to improve this app. Please share your thoughts and suggestions.',
      [{ text: 'OK' }]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Profile & More',
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
            <View style={styles.iconContainer}>
              <IconSymbol name="moon.stars.fill" size={60} color={colors.primary} />
            </View>
            <Text style={styles.appName}>Islamic Companion</Text>
            <Text style={styles.appDescription}>
              Your complete Islamic lifestyle app
            </Text>
          </View>

          {/* Featured Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured</Text>
            
            <Pressable style={styles.featureCard} onPress={() => setShowSadaqah(true)}>
              <View style={[styles.featureIcon, { backgroundColor: 'rgba(0, 70, 67, 0.1)' }]}>
                <IconSymbol name="heart.fill" size={28} color={colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Sadaqah</Text>
                <Text style={styles.featureDescription}>Track your charitable giving</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>

            <Pressable style={styles.featureCard} onPress={() => setShowChatbot(true)}>
              <View style={[styles.featureIcon, { backgroundColor: 'rgba(212, 163, 115, 0.2)' }]}>
                <IconSymbol name="sparkles" size={28} color={colors.accent} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>AI Islamic Assistant</Text>
                <Text style={styles.featureDescription}>Ask questions about Islam</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>

            <Pressable style={styles.featureCard} onPress={() => setShowHadith(true)}>
              <View style={[styles.featureIcon, { backgroundColor: 'rgba(224, 122, 95, 0.15)' }]}>
                <IconSymbol name="book.closed.fill" size={28} color={colors.highlight} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Daily Hadith</Text>
                <Text style={styles.featureDescription}>Wisdom from the Prophet (ﷺ)</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <Pressable style={styles.settingItem} onPress={handleNotificationSettings}>
              <View style={styles.settingLeft}>
                <IconSymbol name="bell.fill" size={24} color={colors.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Notifications</Text>
                  <Text style={styles.settingSubtitle}>Prayer time reminders</Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Information</Text>
            
            <Pressable style={styles.settingItem} onPress={handleAbout}>
              <View style={styles.settingLeft}>
                <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>About</Text>
                  <Text style={styles.settingSubtitle}>App information and calculations</Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
            </Pressable>

            <Pressable style={styles.settingItem} onPress={handleFeedback}>
              <View style={styles.settingLeft}>
                <IconSymbol name="heart.fill" size={24} color={colors.highlight} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Feedback</Text>
                  <Text style={styles.settingSubtitle}>Help us improve the app</Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Prayer Times Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Prayer Time Calculations</Text>
            <Text style={styles.infoText}>
              Prayer times are calculated using astronomical methods based on your geographic location. 
              The calculations follow standard Islamic conventions:
            </Text>
            <View style={styles.infoList}>
              <Text style={styles.infoListItem}>- Fajr: 18° below horizon</Text>
              <Text style={styles.infoListItem}>- Dhuhr: Solar noon</Text>
              <Text style={styles.infoListItem}>- Asr: Shadow length method</Text>
              <Text style={styles.infoListItem}>- Maghrib: Sunset</Text>
              <Text style={styles.infoListItem}>- Isha: 18° below horizon</Text>
            </View>
          </View>

          {/* Qibla Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Qibla Direction</Text>
            <Text style={styles.infoText}>
              The Qibla compass points towards the Kaaba in Mecca, Saudi Arabia. 
              For accurate readings, hold your device flat and away from magnetic interference.
            </Text>
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>

      {/* Modals */}
      <SadaqahDonation visible={showSadaqah} onClose={() => setShowSadaqah(false)} />
      <IslamicChatbot visible={showChatbot} onClose={() => setShowChatbot(false)} />
      <DailyHadith visible={showHadith} onClose={() => setShowHadith(false)} />
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
    paddingVertical: 30,
    marginBottom: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
    boxShadow: `0px 4px 8px ${colors.shadow}`,
    elevation: 3,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 4px 8px ${colors.shadow}`,
    elevation: 3,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  settingItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 2px 4px ${colors.shadow}`,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    boxShadow: `0px 4px 8px ${colors.shadow}`,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoList: {
    marginLeft: 8,
  },
  infoListItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  bottomSpacing: {
    height: Platform.OS === 'ios' ? 20 : 100,
  },
});
