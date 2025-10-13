
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Pressable,
  Linking,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import DailyHadith from '@/components/DailyHadith';
import { IconSymbol } from '@/components/IconSymbol';
import IslamicChatbot from '@/components/IslamicChatbot';
import SadaqahDonation from '@/components/SadaqahDonation';
import NavigationHeader from '@/components/NavigationHeader';
import AdvancedNotifications from '@/components/AdvancedNotifications';

export default function ProfileScreen() {
  const [showHadith, setShowHadith] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showSadaqah, setShowSadaqah] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const handleNotificationSettings = () => {
    setShowNotifications(true);
  };

  const handleAbout = () => {
    Alert.alert(
      'About Prayer Times App',
      'Version 1.0.0\n\nA comprehensive Islamic app for prayer times, Quran reading, and spiritual growth.\n\nPremium AI features powered by advanced language models provide personalized Islamic guidance and content.\n\nDeveloped with ❤️ for the Muslim community.',
      [{ text: 'OK' }]
    );
  };

  const handleFeedback = () => {
    setShowFeedback(true);
  };

  const submitFeedback = () => {
    if (!feedbackText.trim()) {
      Alert.alert('Empty Feedback', 'Please enter your feedback before submitting.');
      return;
    }

    // In a real app, this would send to a backend or email
    Alert.alert(
      'Thank You!',
      'Your feedback has been received. We appreciate your input and will use it to improve the app.',
      [
        {
          text: 'OK',
          onPress: () => {
            setFeedbackText('');
            setShowFeedback(false);
          }
        }
      ]
    );
  };

  const renderFeedbackModal = () => (
    <Modal
      visible={showFeedback}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFeedback(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Send Feedback</Text>
          <TouchableOpacity onPress={() => setShowFeedback(false)}>
            <IconSymbol name="xmark" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.feedbackLabel}>
            We&apos;d love to hear your thoughts, suggestions, or report any issues you&apos;ve encountered.
          </Text>

          <TextInput
            style={styles.feedbackInput}
            value={feedbackText}
            onChangeText={setFeedbackText}
            placeholder="Share your feedback here..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.submitButton} onPress={submitFeedback}>
            <IconSymbol name="paperplane.fill" size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          </TouchableOpacity>

          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Other Ways to Reach Us:</Text>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => Linking.openURL('mailto:support@prayertimes.app')}
            >
              <IconSymbol name="envelope" size={18} color={colors.primary} />
              <Text style={styles.contactText}>support@prayertimes.app</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

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
              <IconSymbol name="book.closed" size={24} color={colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <View style={styles.titleRow}>
                <Text style={styles.menuTitle}>Daily Hadith</Text>
                <View style={styles.premiumBadge}>
                  <IconSymbol name="star.fill" size={12} color={colors.accent} />
                  <Text style={styles.premiumBadgeText}>Premium</Text>
                </View>
              </View>
              <Text style={styles.menuDescription}>
                Read authentic Hadith with AI-powered explanations
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={24} color={colors.textSecondary} />
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => setShowChatbot(true)}
          >
            <View style={styles.menuIconContainer}>
              <IconSymbol name="message" size={24} color={colors.accent} />
            </View>
            <View style={styles.menuContent}>
              <View style={styles.titleRow}>
                <Text style={styles.menuTitle}>Islamic AI Assistant</Text>
                <View style={[styles.premiumBadge, styles.ultraBadge]}>
                  <IconSymbol name="star.fill" size={12} color="#FFFFFF" />
                  <Text style={[styles.premiumBadgeText, styles.ultraBadgeText]}>Ultra</Text>
                </View>
              </View>
              <Text style={styles.menuDescription}>
                Ask questions about Islam with AI-powered guidance
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={24} color={colors.textSecondary} />
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => setShowSadaqah(true)}
          >
            <View style={styles.menuIconContainer}>
              <IconSymbol name="heart.fill" size={24} color={colors.highlight} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Sadaqah & Charity</Text>
              <Text style={styles.menuDescription}>
                Give charity and track your donations
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>



        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <Pressable
            style={styles.menuItem}
            onPress={handleNotificationSettings}
          >
            <View style={styles.menuIconContainer}>
              <IconSymbol name="bell" size={24} color={colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Notifications</Text>
              <Text style={styles.menuDescription}>
                Manage prayer time alerts
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <Pressable style={styles.menuItem} onPress={handleAbout}>
            <View style={styles.menuIconContainer}>
              <IconSymbol name="info.circle" size={24} color={colors.accent} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>About</Text>
              <Text style={styles.menuDescription}>
                App version and information
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={24} color={colors.textSecondary} />
          </Pressable>

          <Pressable style={styles.menuItem} onPress={handleFeedback}>
            <View style={styles.menuIconContainer}>
              <IconSymbol name="paperplane" size={24} color={colors.highlight} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Feedback</Text>
              <Text style={styles.menuDescription}>
                Share your thoughts with us
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Bottom spacer for floating tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <DailyHadith visible={showHadith} onClose={() => setShowHadith(false)} />
      <IslamicChatbot visible={showChatbot} onClose={() => setShowChatbot(false)} />
      <SadaqahDonation visible={showSadaqah} onClose={() => setShowSadaqah(false)} />
      <AdvancedNotifications visible={showNotifications} onClose={() => setShowNotifications(false)} />
      {renderFeedbackModal()}
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
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  menuDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 163, 115, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
  },
  ultraBadge: {
    backgroundColor: colors.highlight,
    borderColor: colors.highlight,
  },
  ultraBadgeText: {
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 120,
  },
  // Feedback Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  feedbackLabel: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  feedbackInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    fontSize: 15,
    color: colors.text,
    minHeight: 150,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contactInfo: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 15,
    color: colors.primary,
  },
});
