
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
import { colors } from '@/styles/commonStyles';
import DailyHadith from '@/components/DailyHadith';
import { IconSymbol } from '@/components/IconSymbol';
import IslamicChatbot from '@/components/IslamicChatbot';
import SadaqahDonation from '@/components/SadaqahDonation';
import NavigationHeader from '@/components/NavigationHeader';
import GeminiSetup from '@/components/GeminiSetup';

export default function ProfileScreen() {
  const [showHadith, setShowHadith] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showSadaqah, setShowSadaqah] = useState(false);
  const [showGeminiSetup, setShowGeminiSetup] = useState(false);

  const handleNotificationSettings = () => {
    Alert.alert('Notification Settings', 'Configure your prayer time notifications here.');
  };

  const handleAbout = () => {
    Alert.alert(
      'About',
      'Prayer Times App\nVersion 1.0.0\n\nA comprehensive Islamic app for prayer times, Quran reading, and spiritual growth.\n\nPowered by Google Gemini AI for enhanced Islamic content.',
      [{ text: 'OK' }]
    );
  };

  const handleFeedback = () => {
    Alert.alert('Feedback', 'Thank you for your interest! Feedback feature coming soon.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <NavigationHeader
        title="Profile & Settings"
        showBack={false}
        showClose={false}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Islamic Resources</Text>

          <Pressable
            style={styles.menuItem}
            onPress={() => setShowHadith(true)}
          >
            <View style={styles.menuIconContainer}>
              <IconSymbol name="auto-stories" size={24} color={colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Daily Hadith</Text>
              <Text style={styles.menuDescription}>
                Read authentic Hadith with AI-powered explanations
              </Text>
            </View>
            <IconSymbol name="chevron-right" size={24} color={colors.textSecondary} />
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => setShowChatbot(true)}
          >
            <View style={styles.menuIconContainer}>
              <IconSymbol name="chat" size={24} color={colors.accent} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Islamic AI Assistant</Text>
              <Text style={styles.menuDescription}>
                Ask questions about Islam with Gemini AI
              </Text>
            </View>
            <IconSymbol name="chevron-right" size={24} color={colors.textSecondary} />
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => setShowSadaqah(true)}
          >
            <View style={styles.menuIconContainer}>
              <IconSymbol name="volunteer-activism" size={24} color={colors.highlight} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Sadaqah & Charity</Text>
              <Text style={styles.menuDescription}>
                Give charity and track your donations
              </Text>
            </View>
            <IconSymbol name="chevron-right" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Configuration</Text>

          <Pressable
            style={[styles.menuItem, styles.geminiMenuItem]}
            onPress={() => setShowGeminiSetup(true)}
          >
            <View style={[styles.menuIconContainer, styles.geminiIconContainer]}>
              <IconSymbol name="sparkles" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Gemini AI Setup</Text>
              <Text style={styles.menuDescription}>
                Configure your Google AI API key for enhanced features
              </Text>
            </View>
            <IconSymbol name="chevron-right" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <Pressable
            style={styles.menuItem}
            onPress={handleNotificationSettings}
          >
            <View style={styles.menuIconContainer}>
              <IconSymbol name="notifications" size={24} color={colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Notifications</Text>
              <Text style={styles.menuDescription}>
                Manage prayer time alerts
              </Text>
            </View>
            <IconSymbol name="chevron-right" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <Pressable style={styles.menuItem} onPress={handleAbout}>
            <View style={styles.menuIconContainer}>
              <IconSymbol name="info" size={24} color={colors.accent} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>About</Text>
              <Text style={styles.menuDescription}>
                App version and information
              </Text>
            </View>
            <IconSymbol name="chevron-right" size={24} color={colors.textSecondary} />
          </Pressable>

          <Pressable style={styles.menuItem} onPress={handleFeedback}>
            <View style={styles.menuIconContainer}>
              <IconSymbol name="feedback" size={24} color={colors.highlight} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Feedback</Text>
              <Text style={styles.menuDescription}>
                Share your thoughts with us
              </Text>
            </View>
            <IconSymbol name="chevron-right" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Bottom spacer for floating tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <DailyHadith visible={showHadith} onClose={() => setShowHadith(false)} />
      <IslamicChatbot visible={showChatbot} onClose={() => setShowChatbot(false)} />
      <SadaqahDonation visible={showSadaqah} onClose={() => setShowSadaqah(false)} />
      <GeminiSetup visible={showGeminiSetup} onClose={() => setShowGeminiSetup(false)} />
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0 2px 4px ${colors.shadow}`,
    elevation: 2,
  },
  geminiMenuItem: {
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: 'rgba(212, 163, 115, 0.05)',
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  geminiIconContainer: {
    backgroundColor: colors.accent,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 120,
  },
});
