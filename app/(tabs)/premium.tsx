
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import AdhanPlayer from '@/components/AdhanPlayer';
import VerseOfTheDay from '@/components/VerseOfTheDay';
import AdvancedNotifications from '@/components/AdvancedNotifications';
import { useSubscription } from '@/contexts/SubscriptionContext';
import SpiritualProgressTracker from '@/components/SpiritualProgressTracker';
import MosqueFinder from '@/components/MosqueFinder';
import SubscriptionModal from '@/components/SubscriptionModal';
import DuaLibrary from '@/components/DuaLibrary';
import HijriCalendar from '@/components/HijriCalendar';
import ARQiblaCompass from '@/components/ARQiblaCompass';
import NavigationHeader from '@/components/NavigationHeader';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import SubscriptionStatus from '@/components/premium/SubscriptionStatus';
import FeatureCard from '@/components/premium/FeatureCard';
import { PREMIUM_FEATURES, PremiumFeature } from '@/constants/premiumFeatures';

export default function PremiumScreen() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { currentTier } = useSubscription();
  const { restorePurchases, loading: revenueCatLoading } = useRevenueCat();

  const openFeature = (feature: PremiumFeature) => {
    console.log('Opening feature:', feature.component);
    setActiveModal(feature.component);
  };

  const closeModal = () => {
    console.log('Closing modal');
    setActiveModal(null);
  };

  const handleAdhanSelection = (recording: any) => {
    console.log('Selected adhan recording:', recording);
    closeModal();
  };

  const handleRestorePurchases = async () => {
    try {
      Alert.alert('Please wait...', 'Restoring your purchases');
      await restorePurchases();
    } catch (error) {
      console.log('Error restoring purchases:', error);
    }
  };

  const renderFeatureCard: ListRenderItem<PremiumFeature> = ({ item }) => (
    <FeatureCard feature={item} onPress={openFeature} />
  );

  const renderHeader = () => (
    <>
      <SubscriptionStatus
        currentTier={currentTier}
        onUpgrade={() => setShowSubscriptionModal(true)}
        onManageSubscription={() => {}}
        onRestore={handleRestorePurchases}
        isLoading={revenueCatLoading}
      />
      <Text style={styles.sectionTitle}>Available Features</Text>
    </>
  );

  const renderFooter = () => <View style={styles.bottomSpacer} />;

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
  bottomSpacer: {
    height: 120,
  },
});
