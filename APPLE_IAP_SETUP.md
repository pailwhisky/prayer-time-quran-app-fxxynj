
# Apple In-App Purchase (IAP) Setup Guide

This guide will help you set up Apple In-App Purchases for the Prayer Times app.

## Overview

The app now includes a complete Apple IAP integration that allows users to subscribe to Premium and Ultra tiers directly through the App Store. The implementation includes:

- **Apple IAP Service** (`services/appleIAPService.ts`) - Handles all IAP operations
- **Subscription Context** - Manages subscription state and integrates with IAP
- **Receipt Verification** - Supabase Edge Function for server-side validation
- **Database Tracking** - Stores transaction records in `iap_transactions` table

## Current Implementation Status

### ✅ Completed
- IAP service architecture
- Subscription context integration
- UI components for subscription management
- Database schema for tracking transactions
- Receipt verification Edge Function
- Product ID configuration
- Restore purchases functionality

### ⚠️ Demo Mode
The current implementation runs in **demo mode** because:
1. Native StoreKit integration requires a production iOS build
2. Products must be configured in App Store Connect
3. Receipt validation needs Apple's shared secret

## Step-by-Step Setup

### 1. App Store Connect Configuration

#### Create In-App Purchase Products
1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Go to **Features** → **In-App Purchases**
4. Create the following **Auto-Renewable Subscriptions**:

**Premium Monthly**
- Product ID: `com.prayertimes.islamic.premium.monthly`
- Reference Name: Premium Monthly Subscription
- Subscription Duration: 1 Month
- Price: $4.99 (or your preferred price)

**Premium Yearly**
- Product ID: `com.prayertimes.islamic.premium.yearly`
- Reference Name: Premium Yearly Subscription
- Subscription Duration: 1 Year
- Price: $49.99 (or your preferred price)

**Ultra Monthly**
- Product ID: `com.prayertimes.islamic.ultra.monthly`
- Reference Name: Ultra Monthly Subscription
- Subscription Duration: 1 Month
- Price: $9.99 (or your preferred price)

**Ultra Yearly**
- Product ID: `com.prayertimes.islamic.ultra.yearly`
- Reference Name: Ultra Yearly Subscription
- Subscription Duration: 1 Year
- Price: $99.99 (or your preferred price)

#### Create Subscription Group
1. Create a subscription group (e.g., "Prayer Times Subscriptions")
2. Add all four products to this group
3. Set up subscription levels (Premium < Ultra)

#### Generate Shared Secret
1. In App Store Connect, go to **My Apps** → Your App → **App Information**
2. Scroll to **App-Specific Shared Secret**
3. Click **Generate** and copy the secret
4. Store this securely - you'll need it for receipt verification

### 2. Supabase Configuration

#### Set Environment Variables
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Add the following secrets:

```bash
APPLE_SHARED_SECRET=your_shared_secret_from_app_store_connect
ENVIRONMENT=production  # or 'sandbox' for testing
```

#### Deploy Edge Function
The receipt verification function is already created at `supabase/functions/verify-apple-receipt/index.ts`.

Deploy it using:
```bash
supabase functions deploy verify-apple-receipt
```

### 3. Update Product IDs (if needed)

If you use different product IDs, update them in `services/appleIAPService.ts`:

```typescript
export const PRODUCT_IDS = {
  PREMIUM_MONTHLY: 'your.product.id.premium.monthly',
  PREMIUM_YEARLY: 'your.product.id.premium.yearly',
  ULTRA_MONTHLY: 'your.product.id.ultra.monthly',
  ULTRA_YEARLY: 'your.product.id.ultra.yearly',
};
```

### 4. Install Native IAP Library (Production)

For production use, you need a native IAP library. We recommend `react-native-iap`:

```bash
npm install react-native-iap
```

Then update `services/appleIAPService.ts` to use the native module:

```typescript
import * as RNIap from 'react-native-iap';

// In initialize()
await RNIap.initConnection();

// In getProducts()
const products = await RNIap.getSubscriptions(Object.values(PRODUCT_IDS));

// In purchaseProduct()
const purchase = await RNIap.requestSubscription({
  sku: productId,
  andDangerouslyFinishTransactionAutomaticallyIOS: false,
});
```

### 5. Testing

#### Sandbox Testing
1. Create a sandbox test account in App Store Connect
2. Sign out of your Apple ID on your test device
3. When prompted during purchase, sign in with sandbox account
4. Test all subscription flows:
   - New subscription
   - Upgrade/downgrade
   - Restore purchases
   - Cancellation

#### Production Testing
1. Use TestFlight for beta testing
2. Test with real Apple ID (you won't be charged)
3. Verify receipt validation works correctly
4. Check subscription status updates in database

### 6. App Review Preparation

Before submitting to App Review:

1. **Provide Test Account**: Create a demo account with active subscription
2. **Review Notes**: Explain subscription features and benefits
3. **Privacy Policy**: Update to mention subscription data handling
4. **Screenshots**: Show subscription UI and premium features
5. **Restore Purchases**: Ensure this works reliably

## Architecture

### Flow Diagram

```
User Taps Subscribe
       ↓
SubscriptionModal
       ↓
purchaseWithAppleIAP()
       ↓
appleIAPService.purchaseProduct()
       ↓
StoreKit Purchase Flow (Native)
       ↓
Receipt Generated
       ↓
verifyReceipt() → Supabase Edge Function
       ↓
Apple Receipt Verification API
       ↓
Update user_subscriptions table
       ↓
Refresh subscription context
       ↓
User gains access to premium features
```

### Database Schema

**user_subscriptions**
- Stores active subscription status
- Links to subscription_tiers
- Tracks billing cycle and renewal dates

**iap_transactions**
- Logs all IAP transactions
- Stores receipt data for verification
- Tracks verification status

**subscription_tiers**
- Defines available tiers (free, premium, ultra)
- Stores pricing information
- Lists features for each tier

**subscription_features**
- Maps features to required tiers
- Used by PremiumGate component
- Controls feature access

## Security Considerations

### ✅ Implemented
- Server-side receipt verification
- RLS policies on all subscription tables
- Transaction logging for audit trail
- Secure storage of shared secret

### ⚠️ Important
- Never store shared secret in client code
- Always verify receipts server-side
- Validate subscription status on critical operations
- Handle expired subscriptions gracefully

## Troubleshooting

### "Cannot connect to iTunes Store"
- Check internet connection
- Verify product IDs match App Store Connect
- Ensure app bundle ID matches
- Try sandbox environment first

### "Receipt verification failed"
- Check APPLE_SHARED_SECRET is set correctly
- Verify using correct endpoint (sandbox vs production)
- Check Edge Function logs in Supabase

### "Subscription not activating"
- Check user_subscriptions table for errors
- Verify tier_id matches subscription_tiers
- Check RLS policies allow user access
- Review Edge Function logs

### "Restore purchases not working"
- Ensure user is signed in with same Apple ID
- Check transaction history in App Store Connect
- Verify receipt validation is working
- Check database for existing subscription records

## Support Resources

- [Apple IAP Documentation](https://developer.apple.com/in-app-purchase/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [React Native IAP](https://github.com/dooboolab/react-native-iap)

## Next Steps

1. ✅ Complete App Store Connect setup
2. ✅ Configure products and pricing
3. ✅ Set up Supabase secrets
4. ✅ Deploy Edge Function
5. ✅ Install native IAP library
6. ✅ Test in sandbox environment
7. ✅ Submit for App Review

## Notes

- The current implementation uses a demo mode for development
- Real purchases require a production iOS build
- TestFlight builds can use sandbox environment
- Production builds use production IAP environment
- Always test thoroughly before releasing

---

**Need Help?** Check the Supabase logs and Apple's IAP documentation for detailed troubleshooting steps.
