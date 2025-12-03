
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
  ListRenderItem,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import AdhanPlayer from '@/components/AdhanPlayer';
import VerseOfTheDay from '@/components/VerseOfTheDay';
import AdvancedNotifications from '@/components/AdvancedNotifications';
import { useSubscription } from '@/contexts/SubscriptionContext';
import SpiritualProgressTracker from '@/components/SpiritualProgressTracker';
import MosqueFinder from '@/components/MosqueFinder';
import DuaLibrary from '@/components/DuaLibrary';
import HijriCalendar from '@/components/HijriCalendar';
import ARQiblaCompass from '@/components/ARQiblaCompass';
import NavigationHeader from '@/components/NavigationHeader';
import { useRevenueCatPaywall } from '@/hooks/useRevenueCatPaywall';
import { useRevenueCatCustomerCenter } from '@/hooks/useRevenueCatCustomerCenter';
import SubscriptionStatus from '@/components/premium/SubscriptionStatus';
import FeatureCard from '@/components/premium/FeatureCard';
import { PREMIUM_FEATURES, PremiumFeature } from '@/constants/premiumFeatures';
import { IconSymbol } from '@/components/IconSymbol';

/**
 * Premium screen with RevenueCat Paywall integration
 * 
 * This version uses:
 * - RevenueCat Paywall for upgrades (instead of custom modal)
 * - Customer Center for subscription management
 * - Feature gates with automatic paywall display
 */
export default function PremiumScreenWithPaywall() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { currentTier, hasFeature } = useSubscription();
  const { showPaywall, showPaywallIfNeeded, loading: paywallLoading } = useRevenueCatPaywall();
  const { showCustomerCenter, loading: customerCenterLoading } = useRevenueCatCustomerCenter();
  const router = useRouter();

  const loading = paywallLoading || customerCenterLoading;

  const openFeature = async (feature: PremiumFeature) => {
    console.log('Opening feature:', feature.component);
    
    // Check if feature requires premium access
    if (feature.isPremium && !hasFeature(feature.requiredFeature || '')) {
      // Show paywall if user doesn't have access
      const result = await showPaywallIfNeeded('my prayer Pro');
      
      if (result === null) {
        // User has access, show the feature
        setActiveModal(feature.component);
      }
      // If result is not null, paywall was shown and user either:
      // - Purchased (will refresh and show feature)
      // - Cancelled (do nothing)
      // - Restored (will refresh and show feature)
    } else {
      // Free feature or user has access
      setActiveModal(feature.component);
    }
  };

  const closeModal = () => {
    console.log('Closing modal');
    setActiveModal(null);
  };

  const handleAdhanSelection = (recording: any) => {
    console.log('Selected adhan recording:', recording);
    closeModal();
  };

  const handleUpgrade = async () => {
    // Show RevenueCat Paywall
    await showPaywall();
  };

  const handleManageSubscription = async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // Show Customer Center
      await showCustomerCenter();
    } else {
      Alert.alert(
        'Not Available',
        'Subscription management is only available on iOS and Android devices.'
      );
    }
  };

  const renderFeatureCard: ListRenderItem<PremiumFeature> = ({ item }) => (
    <FeatureCard feature={item} onPress={openFeature} />
  );

  const renderHeader = () => (
    <>
      <SubscriptionStatus
        currentTier={currentTier}
        onUpgrade={handleUpgrade}
        onManageSubscription={handleManageSubscription}
        onRestore={() => {}} // Restore is handled in Customer Center
        isLoading={loading}
      />

      <Text style={styles.sectionTitle}>Available Features</Text>
    </>
  );

  const renderFooter = () => (
    <>
      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Why Upgrade?</Text>
        <View style={styles.infoItem}>
          <IconSymbol name="check-circle" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Unlock all premium features instantly
          </Text>
        </View>
        <View style={styles.infoItem}>
          <IconSymbol name="check-circle" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Support the development of Islamic apps
          </Text>
        </View>
        <View style={styles.infoItem}>
          <IconSymbol name="check-circle" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Cancel anytime, no questions asked
          </Text>
        </View>
        <View style={styles.infoItem}>
          <IconSymbol name="check-circle" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Regular updates and new features
          </Text>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <NavigationHeader
        title="Premium Features"
        showBack={false}
        showClose={false}
      />

      <FlatList
        data={PREMIUM_FEATURES}
        renderItem={renderFeatureCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Feature Modals */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  separator: {
    height: 12,
  },
  infoSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 120,
  },
});
