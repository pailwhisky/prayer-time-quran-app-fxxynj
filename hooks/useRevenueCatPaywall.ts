
import { useState } from 'react';
import { Platform, Alert } from 'react-native';
import { 
  presentPaywall, 
  presentPaywallIfNeeded,
  PaywallResult,
} from 'react-native-purchases-ui';
import { useSubscription } from '@/contexts/SubscriptionContext';

/**
 * Custom hook for RevenueCat Paywall UI
 * Provides easy access to pre-built paywall screens
 * 
 * Documentation: https://www.revenuecat.com/docs/tools/paywalls
 */
export function useRevenueCatPaywall() {
  const [loading, setLoading] = useState(false);
  const { refreshEntitlements } = useSubscription();

  /**
   * Present the RevenueCat Paywall
   * This shows a pre-built, customizable paywall screen
   * 
   * @param offeringIdentifier - Optional offering identifier to display
   * @returns PaywallResult indicating what happened
   */
  const showPaywall = async (offeringIdentifier?: string): Promise<PaywallResult | null> => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      Alert.alert(
        'Not Supported',
        'Paywalls are only available on iOS and Android'
      );
      return null;
    }

    try {
      setLoading(true);
      console.log('🎨 Presenting RevenueCat Paywall...');

      const result = await presentPaywall({
        offering: offeringIdentifier,
      });

      console.log('Paywall result:', result);

      // Handle different results
      switch (result) {
        case PaywallResult.PURCHASED:
          console.log('✅ User made a purchase');
          await refreshEntitlements();
          Alert.alert(
            '🎉 Purchase Successful!',
            'Thank you for your purchase. You now have access to my prayer Pro features.'
          );
          break;
        
        case PaywallResult.RESTORED:
          console.log('🔄 User restored purchases');
          await refreshEntitlements();
          Alert.alert(
            '✅ Purchases Restored',
            'Your previous purchases have been restored successfully.'
          );
          break;
        
        case PaywallResult.CANCELLED:
          console.log('User cancelled paywall');
          break;
        
        case PaywallResult.ERROR:
          console.log('❌ Error in paywall');
          Alert.alert(
            'Error',
            'An error occurred. Please try again.'
          );
          break;
      }

      return result;
    } catch (error) {
      console.error('❌ Error presenting paywall:', error);
      Alert.alert(
        'Error',
        'Failed to load paywall. Please try again.'
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Present paywall only if user doesn't have active entitlement
   * This is useful for feature gates
   * 
   * @param requiredEntitlementIdentifier - Entitlement to check (default: "my prayer Pro")
   * @returns PaywallResult or null if user already has access
   */
  const showPaywallIfNeeded = async (
    requiredEntitlementIdentifier: string = 'my prayer Pro'
  ): Promise<PaywallResult | null> => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      Alert.alert(
        'Not Supported',
        'Paywalls are only available on iOS and Android'
      );
      return null;
    }

    try {
      setLoading(true);
      console.log('🔐 Checking if paywall is needed...');

      const result = await presentPaywallIfNeeded({
        requiredEntitlementIdentifier,
      });

      if (result === null) {
        console.log('✅ User already has access, paywall not shown');
        return null;
      }

      console.log('Paywall result:', result);

      // Handle different results
      switch (result) {
        case PaywallResult.PURCHASED:
          console.log('✅ User made a purchase');
          await refreshEntitlements();
          Alert.alert(
            '🎉 Purchase Successful!',
            'Thank you for your purchase. You now have access to my prayer Pro features.'
          );
          break;
        
        case PaywallResult.RESTORED:
          console.log('🔄 User restored purchases');
          await refreshEntitlements();
          Alert.alert(
            '✅ Purchases Restored',
            'Your previous purchases have been restored successfully.'
          );
          break;
        
        case PaywallResult.CANCELLED:
          console.log('User cancelled paywall');
          break;
        
        case PaywallResult.ERROR:
          console.log('❌ Error in paywall');
          Alert.alert(
            'Error',
            'An error occurred. Please try again.'
          );
          break;
      }

      return result;
    } catch (error) {
      console.error('❌ Error presenting paywall:', error);
      Alert.alert(
        'Error',
        'Failed to load paywall. Please try again.'
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    showPaywall,
    showPaywallIfNeeded,
  };
}
