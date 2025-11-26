
import { useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';
import { verifyAppleIAPReceipt } from '@/utils/appleIAPVerification';
import { useSubscription } from '@/contexts/SubscriptionContext';

// Note: react-native-iap is not installed yet
// Install with: npm install react-native-iap
// This is a template - uncomment when react-native-iap is installed

/*
import * as RNIap from 'react-native-iap';

const PRODUCT_IDS = [
  'com.natively.premium.monthly',
  'com.natively.premium.yearly',
  'com.natively.ultra.monthly',
  'com.natively.ultra.yearly',
  'com.natively.superultra.lifetime',
];

export function useAppleIAP() {
  const [products, setProducts] = useState<RNIap.Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { refreshEntitlements } = useSubscription();

  useEffect(() => {
    if (Platform.OS === 'ios') {
      initIAP();
    }

    return () => {
      if (Platform.OS === 'ios') {
        RNIap.endConnection();
      }
    };
  }, []);

  const initIAP = async () => {
    try {
      await RNIap.initConnection();
      console.log('IAP connection initialized');

      // Get available products
      const availableProducts = await RNIap.getProducts({ skus: PRODUCT_IDS });
      setProducts(availableProducts);
      console.log('Available products:', availableProducts);

      // Set up purchase listener
      const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
        async (purchase) => {
          console.log('Purchase updated:', purchase);
          await handlePurchase(purchase);
        }
      );

      const purchaseErrorSubscription = RNIap.purchaseErrorListener(
        (error) => {
          console.error('Purchase error:', error);
          Alert.alert('Purchase Failed', error.message);
        }
      );

      return () => {
        purchaseUpdateSubscription.remove();
        purchaseErrorSubscription.remove();
      };
    } catch (error: any) {
      console.error('Error initializing IAP:', error);
    }
  };

  const handlePurchase = async (purchase: RNIap.Purchase) => {
    try {
      console.log('Processing purchase:', purchase.productId);

      // Get receipt
      const receipt = purchase.transactionReceipt;
      if (!receipt) {
        console.error('No receipt found');
        return;
      }

      // Verify with Edge Function
      const result = await verifyAppleIAPReceipt(
        receipt,
        purchase.productId,
        purchase.transactionId
      );

      if (result.success && result.entitlements) {
        console.log('Purchase verified successfully!');
        
        // Refresh entitlements
        await refreshEntitlements();

        // Show success message
        Alert.alert(
          'Purchase Successful!',
          `You now have access to ${result.entitlements.tierName} features.`,
          [{ text: 'OK' }]
        );

        // Finish transaction
        await RNIap.finishTransaction({ purchase, isConsumable: false });
      } else {
        console.error('Purchase verification failed:', result.error);
        Alert.alert(
          'Verification Failed',
          'Unable to verify your purchase. Please contact support.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Error handling purchase:', error);
      Alert.alert('Error', 'An error occurred processing your purchase.');
    }
  };

  const purchaseProduct = async (productId: string) => {
    try {
      setLoading(true);
      console.log('Purchasing product:', productId);

      // Check if it's a subscription or non-consumable
      const isLifetime = productId.includes('lifetime');

      if (isLifetime) {
        await RNIap.requestPurchase({ sku: productId });
      } else {
        await RNIap.requestSubscription({ sku: productId });
      }
    } catch (error: any) {
      console.error('Error purchasing product:', error);
      if (error.code !== 'E_USER_CANCELLED') {
        Alert.alert('Purchase Failed', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const restorePurchases = async () => {
    try {
      setLoading(true);
      console.log('Restoring purchases...');

      // Get available purchases
      const purchases = await RNIap.getAvailablePurchases();
      console.log('Available purchases:', purchases);

      if (purchases.length === 0) {
        Alert.alert(
          'No Purchases Found',
          'No previous purchases were found for this account.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Verify each purchase
      let restoredCount = 0;
      for (const purchase of purchases) {
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          const result = await verifyAppleIAPReceipt(
            receipt,
            purchase.productId,
            purchase.transactionId
          );

          if (result.success) {
            restoredCount++;
          }
        }
      }

      // Refresh entitlements
      await refreshEntitlements();

      Alert.alert(
        'Purchases Restored',
        `Successfully restored ${restoredCount} purchase(s).`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error restoring purchases:', error);
      Alert.alert('Restore Failed', 'Unable to restore purchases.');
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    purchaseProduct,
    restorePurchases,
  };
}
*/

// Placeholder hook until react-native-iap is installed
export function useAppleIAP() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { refreshEntitlements } = useSubscription();

  const purchaseProduct = async (productId: string) => {
    Alert.alert(
      'IAP Not Configured',
      'Please install react-native-iap and uncomment the code in hooks/useAppleIAP.ts',
      [{ text: 'OK' }]
    );
  };

  const restorePurchases = async () => {
    Alert.alert(
      'IAP Not Configured',
      'Please install react-native-iap and uncomment the code in hooks/useAppleIAP.ts',
      [{ text: 'OK' }]
    );
  };

  return {
    products,
    loading,
    purchaseProduct,
    restorePurchases,
  };
}
