
import { useState } from 'react';
import { Platform, Alert } from 'react-native';
import { presentCustomerCenter } from 'react-native-purchases-ui';
import { useSubscription } from '@/contexts/SubscriptionContext';

/**
 * Custom hook for RevenueCat Customer Center
 * Provides easy access to subscription management UI
 * 
 * Documentation: https://www.revenuecat.com/docs/tools/customer-center
 */
export function useRevenueCatCustomerCenter() {
  const [loading, setLoading] = useState(false);
  const { refreshEntitlements } = useSubscription();

  /**
   * Present the RevenueCat Customer Center
   * This shows a pre-built screen for managing subscriptions
   * 
   * Features:
   * - View subscription status
   * - Manage subscription (upgrade/downgrade)
   * - Cancel subscription
   * - Restore purchases
   * - Contact support
   */
  const showCustomerCenter = async (): Promise<void> => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      Alert.alert(
        'Not Supported',
        'Customer Center is only available on iOS and Android'
      );
      return;
    }

    try {
      setLoading(true);
      console.log('🏪 Presenting RevenueCat Customer Center...');

      await presentCustomerCenter();

      console.log('✅ Customer Center presented');

      // Refresh entitlements after user returns
      // (in case they made changes)
      await refreshEntitlements();

    } catch (error) {
      console.error('❌ Error presenting Customer Center:', error);
      Alert.alert(
        'Error',
        'Failed to load Customer Center. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    showCustomerCenter,
  };
}
