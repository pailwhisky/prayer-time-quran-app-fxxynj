
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { testGeminiConnection } from '@/utils/geminiService';

interface GeminiSetupProps {
  visible: boolean;
  onClose: () => void;
}

export default function GeminiSetup({ visible, onClose }: GeminiSetupProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'failure' | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await testGeminiConnection();
      setTestResult(result ? 'success' : 'failure');
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestResult('failure');
    } finally {
      setTesting(false);
    }
  };

  const openAPIKeyPage = () => {
    Linking.openURL('https://aistudio.google.com/app/apikey');
  };

  const openDocumentation = () => {
    Linking.openURL('https://ai.google.dev/tutorials/setup');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gemini AI Setup</Text>
          <TouchableOpacity onPress={onClose}>
            <IconSymbol name="xmark" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <IconSymbol name="sparkles" size={48} color={colors.accent} />
            </View>
            <Text style={styles.heroTitle}>Unlock AI-Powered Features</Text>
            <Text style={styles.heroSubtitle}>
              Connect your Google AI API key to enable enhanced Islamic content and personalized guidance
            </Text>
          </View>

          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>AI Features Available</Text>
            
            <View style={styles.featureCard}>
              <IconSymbol name="book.closed" size={24} color={colors.primary} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Enhanced Quran Quotes</Text>
                <Text style={styles.featureDescription}>
                  Get AI-generated context and modern reflections for Quranic verses
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <IconSymbol name="message" size={24} color={colors.primary} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Islamic Q&A Chatbot</Text>
                <Text style={styles.featureDescription}>
                  Ask questions about Islam and receive knowledgeable answers with references
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <IconSymbol name="text.quote" size={24} color={colors.primary} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Daily Hadith</Text>
                <Text style={styles.featureDescription}>
                  Receive authentic Hadith with AI-generated explanations and practical applications
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <IconSymbol name="heart" size={24} color={colors.primary} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Spiritual Guidance</Text>
                <Text style={styles.featureDescription}>
                  Get personalized duas and spiritual advice based on your needs
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.setupSection}>
            <Text style={styles.sectionTitle}>Setup Instructions</Text>
            
            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Get Your API Key</Text>
                <Text style={styles.stepDescription}>
                  Visit Google AI Studio to create a free API key
                </Text>
                <TouchableOpacity style={styles.linkButton} onPress={openAPIKeyPage}>
                  <Text style={styles.linkButtonText}>Open Google AI Studio</Text>
                  <IconSymbol name="arrow.up.right" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Add to Environment File</Text>
                <Text style={styles.stepDescription}>
                  Copy your API key and add it to the .env file:
                </Text>
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText}>
                    EXPO_PUBLIC_GOOGLE_AI_API_KEY=your_key_here
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Restart the App</Text>
                <Text style={styles.stepDescription}>
                  Close and restart the app for changes to take effect
                </Text>
              </View>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Test Connection</Text>
                <Text style={styles.stepDescription}>
                  Use the button below to verify your API key is working
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.testSection}>
            <TouchableOpacity
              style={[styles.testButton, testing && styles.testButtonDisabled]}
              onPress={handleTestConnection}
              disabled={testing}
            >
              {testing ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.testButtonText}>Testing Connection...</Text>
                </>
              ) : (
                <>
                  <IconSymbol name="checkmark.circle" size={20} color="#FFFFFF" />
                  <Text style={styles.testButtonText}>Test API Connection</Text>
                </>
              )}
            </TouchableOpacity>

            {testResult === 'success' && (
              <View style={styles.resultCard}>
                <IconSymbol name="checkmark.circle.fill" size={32} color="#4CAF50" />
                <Text style={styles.resultTitle}>Connection Successful! ✅</Text>
                <Text style={styles.resultDescription}>
                  Your Gemini AI API key is working correctly. All AI features are now enabled.
                </Text>
              </View>
            )}

            {testResult === 'failure' && (
              <View style={[styles.resultCard, styles.resultCardError]}>
                <IconSymbol name="xmark.circle.fill" size={32} color="#F44336" />
                <Text style={styles.resultTitle}>Connection Failed ❌</Text>
                <Text style={styles.resultDescription}>
                  Unable to connect to Gemini AI. Please check:
                </Text>
                <View style={styles.checkList}>
                  <Text style={styles.checkItem}>• API key is correctly added to .env file</Text>
                  <Text style={styles.checkItem}>• App has been restarted after adding the key</Text>
                  <Text style={styles.checkItem}>• API key is valid and not expired</Text>
                  <Text style={styles.checkItem}>• You have internet connection</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <IconSymbol name="info.circle" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                The API key is free to use with generous quotas. No credit card required.
              </Text>
            </View>

            <TouchableOpacity style={styles.docButton} onPress={openDocumentation}>
              <IconSymbol name="book" size={18} color={colors.primary} />
              <Text style={styles.docButtonText}>View Full Documentation</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 163, 115, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  setupSection: {
    marginBottom: 32,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  codeBlock: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
  },
  codeText: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: colors.text,
  },
  testSection: {
    marginBottom: 32,
  },
  testButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 4,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
  },
  resultCardError: {
    borderColor: '#F44336',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  checkList: {
    alignSelf: 'stretch',
    marginTop: 8,
  },
  checkItem: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 24,
  },
  infoSection: {
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 70, 67, 0.05)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  docButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  docButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
});
