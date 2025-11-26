
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  getCustomerInfo,
} from '@/utils/revenueCatService';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { PurchasesPackage } from 'react-native-purchases';

export function useRevenueCat() {
  const [loading, setLoading] = useState(false);
  const [offerings, setOfferings] = useState<any>(null);
  const { refreshEntitlements } = useSubscription();

  const loadOfferings = async () => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      console.log('RevenueCat not supported on this platform');
      return;
    }

    try {
      setLoading(true);
      const currentOffering = await getOfferings();
      setOfferings(currentOffering);
      console.log('Offerings loaded successfully');
    } catch (error) {
      console.error('Error loading offerings:', error);
      Alert.alert('Error', 'Failed to load subscription options');
    } finally {
      setLoading(false);
    }
  };

  const purchase = async (packageToPurchase: PurchasesPackage) => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      Alert.alert(
        'Not Supported',
        'In-app purchases are only available on iOS and Android'
      );
      return;
    }

    try {
      setLoading(true);
      const result = await purchasePackage(packageToPurchase);

      if (result.success) {
        // Refresh entitlements
        await refreshEntitlements();

        Alert.alert(
          'Purchase Successful!',
          'Thank you for your purchase. You now have access to premium features.',
          [{ text: 'OK' }]
        );
      } else if (result.error !== 'User cancelled') {
        Alert.alert('Purchase Failed', result.error || 'An error occurred');
      }
    } catch (error: any) {
      console.error('Error during purchase:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const restore = async () => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      Alert.alert(
        'Not Supported',
        'Purchase restoration is only available on iOS and Android'
      );
      return;
    }

    try {
      setLoading(true);
      const result = await restorePurchases();

      if (result.success) {
        // Refresh entitlements
        await refreshEntitlements();

        const activeEntitlements = Object.keys(
          result.customerInfo?.entitlements.active || {}
        );

        if (activeEntitlements.length > 0) {
          Alert.alert(
            'Purchases Restored',
            'Your previous purchases have been restored successfully.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'No Purchases Found',
            'No previous purchases were found for this account.',
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert('Restore Failed', result.error || 'An error occurred');
      }
    } catch (error: any) {
      console.error('Error restoring purchases:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return;
    }

    try {
      const info = await getCustomerInfo();
      console.log('Current subscription status:', info.entitlements.active);
      return info;
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  return {
    loading,
    offerings,
    loadOfferings,
    purchase,
    restore,
    checkSubscriptionStatus,
  };
}
