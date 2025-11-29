
import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  getCustomerInfo,
  hasMyPrayerProAccess,
} from '@/utils/revenueCatService';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { PurchasesPackage, PurchasesOffering } from 'react-native-purchases';

/**
 * Custom hook for RevenueCat operations
 * Provides easy access to subscription functionality
 */
export function useRevenueCat() {
  const [loading, setLoading] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const { refreshEntitlements } = useSubscription();

  /**
   * Load available subscription offerings
   */
  const loadOfferings = async () => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      console.log('RevenueCat not supported on this platform');
      return;
    }

    try {
      setLoading(true);
      console.log('Loading offerings...');
      const currentOffering = await getOfferings();
      setOfferings(currentOffering);
      console.log('✅ Offerings loaded successfully');
    } catch (error) {
      console.error('❌ Error loading offerings:', error);
      Alert.alert(
        'Error',
        'Failed to load subscription options. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Purchase a subscription package
   */
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
      console.log('Starting purchase...');
      const result = await purchasePackage(packageToPurchase);

      if (result.success) {
        // Refresh entitlements to update UI
        await refreshEntitlements();

        // Check if user now has "my prayer Pro" access
        if (result.customerInfo) {
          const hasAccess = hasMyPrayerProAccess(result.customerInfo);
          console.log('my prayer Pro access:', hasAccess);
        }

        Alert.alert(
          '🎉 Purchase Successful!',
          'Thank you for your purchase. You now have access to my prayer Pro features.',
          [{ text: 'OK' }]
        );
      } else if (result.error !== 'User cancelled') {
        Alert.alert(
          'Purchase Failed',
          result.error || 'An error occurred during purchase'
        );
      }
    } catch (error: any) {
      console.error('❌ Error during purchase:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Restore previous purchases
   */
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
      console.log('Restoring purchases...');
      const result = await restorePurchases();

      if (result.success) {
        // Refresh entitlements to update UI
        await refreshEntitlements();

        const activeEntitlements = Object.keys(
          result.customerInfo?.entitlements.active || {}
        );

        if (activeEntitlements.length > 0) {
          Alert.alert(
            '✅ Purchases Restored',
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
        Alert.alert(
          'Restore Failed',
          result.error || 'An error occurred during restore'
        );
      }
    } catch (error: any) {
      console.error('❌ Error restoring purchases:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check current subscription status
   */
  const checkSubscriptionStatus = async () => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return;
    }

    try {
      const info = await getCustomerInfo();
      console.log('Current subscription status:', {
        activeEntitlements: Object.keys(info.entitlements.active),
        activeSubscriptions: Object.keys(info.activeSubscriptions),
      });
      return info;
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  /**
   * Get a specific package by type
   */
  const getPackageByType = (type: 'monthly' | 'yearly' | 'lifetime'): PurchasesPackage | null => {
    if (!offerings) return null;

    const packageTypeMap = {
      monthly: 'MONTHLY',
      yearly: 'ANNUAL',
      lifetime: 'LIFETIME',
    };

    const targetType = packageTypeMap[type];
    const pkg = offerings.availablePackages.find(
      p => p.packageType === targetType
    );

    return pkg || null;
  };

  return {
    loading,
    offerings,
    loadOfferings,
    purchase,
    restore,
    checkSubscriptionStatus,
    getPackageByType,
  };
}
