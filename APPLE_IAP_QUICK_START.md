
# 🚀 Apple IAP Quick Start Guide

Get your Apple In-App Purchases working in 5 steps!

## Step 1: Set Apple Shared Secret (2 minutes)

### Get Your Secret
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → Select your app
3. Go to "App Information"
4. Scroll to "App-Specific Shared Secret"
5. Click "Generate" or copy existing secret

### Set in Supabase
```bash
# Option 1: Using Supabase CLI
supabase secrets set APPLE_SHARED_SECRET=your_secret_here

# Option 2: Using Supabase Dashboard
# Go to: Project Settings → Edge Functions → Secrets
# Add: APPLE_SHARED_SECRET = your_secret_here
```

## Step 2: Configure Products in App Store Connect (10 minutes)

### Create Subscription Groups
1. In App Store Connect, go to your app
2. Click "Subscriptions" in sidebar
3. Create two groups:
   - **Premium** (for premium tier)
   - **Ultra** (for ultra tier)

### Add Products

#### Premium Monthly
- Product ID: `com.natively.premium.monthly`
- Type: Auto-Renewable Subscription
- Group: Premium
- Duration: 1 month
- Price: $4.99 (or your choice)

#### Premium Yearly
- Product ID: `com.natively.premium.yearly`
- Type: Auto-Renewable Subscription
- Group: Premium
- Duration: 1 year
- Price: $49.99 (or your choice)

#### Ultra Monthly
- Product ID: `com.natively.ultra.monthly`
- Type: Auto-Renewable Subscription
- Group: Ultra
- Duration: 1 month
- Price: $9.99 (or your choice)

#### Ultra Yearly
- Product ID: `com.natively.ultra.yearly`
- Type: Auto-Renewable Subscription
- Group: Ultra
- Duration: 1 year
- Price: $99.99 (or your choice)

#### Super Ultra Lifetime
- Product ID: `com.natively.superultra.lifetime`
- Type: Non-Consumable
- Price: $888 (or your choice)

## Step 3: Install IAP Library (1 minute)

```bash
npm install react-native-iap
```

## Step 4: Implement Purchase Flow (15 minutes)

### Create a Purchase Hook

<write file="hooks/useAppleIAP.ts">
import { useEffect, useState } from 'react';
import * as RNIap from 'react-native-iap';
import { Platform, Alert } from 'react-native';
import { verifyAppleIAPReceipt } from '@/utils/appleIAPVerification';
import { useSubscription } from '@/contexts/SubscriptionContext';

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
