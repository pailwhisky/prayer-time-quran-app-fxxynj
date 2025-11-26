
# Apple IAP Edge Function Integration Guide

## Overview

This guide explains how to use the Apple In-App Purchase (IAP) verification Edge Function that has been deployed to your Supabase project. The function handles receipt validation, refund detection, and automatic entitlement updates.

## Features

✅ **Apple App Store Server API V2 Compatible**
✅ **Automatic Receipt Validation** (Production & Sandbox)
✅ **Refund Detection**
✅ **Cancellation Detection**
✅ **Lifetime Purchase Support**
✅ **Monthly & Yearly Subscription Support**
✅ **Automatic Database Updates**
✅ **Entitlement Calculation**

## Architecture

### Edge Function: `apple-iap-verify`

**Endpoint:** `https://asuhklwnekgmfdfvjxms.supabase.co/functions/v1/apple-iap-verify`

**Method:** POST

**Request Body:**
```typescript
{
  receipt: string;        // Base64 encoded receipt from Apple
  userId: string;         // Supabase user ID
  productId: string;      // Product identifier (e.g., com.natively.premium.monthly)
  transactionId: string;  // Transaction ID from the purchase
}
```

**Response:**
```typescript
{
  hasAccess: boolean;     // Whether user has active access
  tierName: string;       // Subscription tier name (free, premium, ultra, super_ultra)
  status: string;         // Subscription status (active, expired, refunded, lifetime)
  expiresAt?: string;     // Expiration date (ISO 8601)
  features: string[];     // Array of feature keys
  isLifetime: boolean;    // Whether it's a lifetime purchase
  isActive: boolean;      // Whether subscription is currently active
}
```

## Product ID Mapping

The Edge Function automatically maps product IDs to subscription tiers:

| Product ID | Tier | Billing Cycle |
|------------|------|---------------|
| `com.natively.premium.monthly` | premium | monthly |
| `com.natively.premium.yearly` | premium | yearly |
| `com.natively.ultra.monthly` | ultra | monthly |
| `com.natively.ultra.yearly` | ultra | yearly |
| `com.natively.superultra.lifetime` | super_ultra | lifetime |

**Note:** Update the `PRODUCT_TIER_MAP` in the Edge Function if you add new products.

## Database Schema

### Tables Used

#### 1. `iap_transactions`
Stores all IAP transaction records for audit and verification tracking.

```sql
- id: uuid (primary key)
- user_id: uuid (foreign key to auth.users)
- product_id: text
- transaction_id: text (unique)
- receipt_data: text
- verification_status: text (pending, verified, refunded)
- apple_response: jsonb
- created_at: timestamptz
- updated_at: timestamptz
```

#### 2. `user_subscriptions`
Stores current subscription status for each user.

```sql
- id: uuid (primary key)
- user_id: uuid (unique, foreign key to auth.users)
- tier_id: uuid (foreign key to subscription_tiers)
- status: text (active, expired, cancelled, refunded, lifetime)
- billing_cycle: text (monthly, yearly, lifetime)
- start_date: timestamptz
- end_date: timestamptz (null for lifetime)
- auto_renew: boolean
- payment_method: text
- last_payment_date: timestamptz
- next_payment_date: timestamptz
- created_at: timestamptz
- updated_at: timestamptz
```

#### 3. `subscription_tiers`
Defines available subscription tiers and their features.

```sql
- id: uuid (primary key)
- name: text (unique: free, premium, ultra, super_ultra)
- display_name: text
- description: text
- price_monthly: numeric
- price_yearly: numeric
- price_lifetime: numeric
- features: text[]
- sort_order: integer
- is_active: boolean
- created_at: timestamptz
```

## Client-Side Integration

### 1. Import the Utility Functions

```typescript
import { 
  verifyAppleIAPReceipt, 
  getCurrentEntitlements,
  restorePurchases 
} from '@/utils/appleIAPVerification';
```

### 2. Verify a Purchase

After a successful IAP purchase, verify the receipt:

```typescript
const handlePurchaseComplete = async (purchase) => {
  const { receipt, productId, transactionId } = purchase;
  
  const result = await verifyAppleIAPReceipt(
    receipt,
    productId,
    transactionId
  );
  
  if (result.success && result.entitlements) {
    console.log('Purchase verified!');
    console.log('Tier:', result.entitlements.tierName);
    console.log('Features:', result.entitlements.features);
    
    // Refresh your app's subscription context
    await refreshEntitlements();
  } else {
    console.error('Verification failed:', result.error);
  }
};
```

### 3. Check Current Entitlements

On app launch or when needed:

```typescript
const checkSubscription = async () => {
  const result = await getCurrentEntitlements();
  
  if (result.success && result.entitlements) {
    console.log('Current tier:', result.entitlements.tierName);
    console.log('Has access:', result.entitlements.hasAccess);
    console.log('Is lifetime:', result.entitlements.isLifetime);
  }
};
```

### 4. Restore Purchases

When user taps "Restore Purchases":

```typescript
const handleRestore = async () => {
  // Get latest receipt from device (using react-native-iap or similar)
  const receipt = await getLatestReceipt();
  
  const result = await restorePurchases(receipt);
  
  if (result.success) {
    Alert.alert('Success', 'Purchases restored successfully!');
  } else {
    Alert.alert('Error', result.error || 'Failed to restore purchases');
  }
};
```

## Subscription Context Integration

The `SubscriptionContext` has been updated to automatically fetch entitlements:

```typescript
import { useSubscription } from '@/contexts/SubscriptionContext';

function MyComponent() {
  const { 
    currentTier,
    entitlements,
    hasFeature,
    refreshEntitlements 
  } = useSubscription();
  
  // Check if user has access to a feature
  const canUseFeature = hasFeature('advanced_analytics');
  
  // Refresh entitlements after purchase
  const handlePurchase = async () => {
    // ... purchase flow ...
    await refreshEntitlements();
  };
  
  return (
    <View>
      <Text>Current Tier: {currentTier}</Text>
      {entitlements?.isLifetime && (
        <Text>🎉 Lifetime Access!</Text>
      )}
    </View>
  );
}
```

## Environment Variables

The Edge Function requires the following environment variable:

### `APPLE_SHARED_SECRET`

This is your App Store Connect shared secret for receipt validation.

**How to get it:**
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to "My Apps" → Your App → "App Information"
3. Scroll to "App-Specific Shared Secret"
4. Generate or copy the secret

**How to set it in Supabase:**
```bash
# Using Supabase CLI
supabase secrets set APPLE_SHARED_SECRET=your_secret_here

# Or via Supabase Dashboard
# Project Settings → Edge Functions → Secrets
```

## Testing

### Sandbox Testing

The Edge Function automatically detects sandbox receipts and retries with Apple's sandbox environment.

**Test Flow:**
1. Use a sandbox test account in your iOS app
2. Make a test purchase
3. The receipt will be validated against sandbox.itunes.apple.com
4. Subscription will be created in your database

### Production Testing

1. Submit your app for TestFlight
2. Use TestFlight to test real purchases
3. Receipts will be validated against buy.itunes.apple.com

## Error Handling

The Edge Function returns detailed error messages:

```typescript
{
  error: string;      // Human-readable error message
  details?: string;   // Additional error details
}
```

**Common Errors:**

| Error | Cause | Solution |
|-------|-------|----------|
| "Receipt validation failed" | Invalid receipt or Apple API error | Check receipt format and Apple status |
| "Transaction not found in receipt" | Transaction ID mismatch | Verify transaction ID matches receipt |
| "Unknown product ID" | Product not in PRODUCT_TIER_MAP | Add product to mapping in Edge Function |
| "Tier not found" | Tier doesn't exist in database | Ensure subscription_tiers table is populated |
| "Apple shared secret not configured" | Missing environment variable | Set APPLE_SHARED_SECRET in Supabase |

## Refund Detection

The Edge Function automatically detects refunds:

1. Checks for `cancellation_date` in transaction data
2. Updates `iap_transactions.verification_status` to "refunded"
3. Updates `user_subscriptions.status` to "refunded"
4. Removes user access to premium features

## Subscription Status Flow

```
Purchase → active
  ↓
Expires → expired
  ↓
Renews → active

Purchase (lifetime) → lifetime (never expires)

Refund → refunded (access removed)
```

## Security Considerations

✅ **Server-Side Validation:** All receipt validation happens server-side
✅ **Service Role Key:** Edge Function uses service role key for database access
✅ **Transaction Deduplication:** Transactions are stored with unique constraint
✅ **Audit Trail:** All transactions logged in `iap_transactions` table
✅ **RLS Policies:** Row Level Security enabled on all tables

## Monitoring & Logs

View Edge Function logs in Supabase Dashboard:
1. Go to Edge Functions → apple-iap-verify
2. Click "Logs" tab
3. Monitor for errors or validation issues

**Key Log Messages:**
- "Processing Apple IAP verification for user: {userId}"
- "Decoded transactions: {count}"
- "Transaction status: {isRefunded, isExpired, isLifetime}"
- "Subscription updated successfully for user: {userId}"

## Next Steps

1. **Install IAP Library:** Install `react-native-iap` or similar
2. **Configure Products:** Set up products in App Store Connect
3. **Implement Purchase Flow:** Add purchase UI to your app
4. **Test with Sandbox:** Test with sandbox accounts
5. **Submit for Review:** Submit app to App Store

## Example Component

See `components/AppleIAPExample.tsx` for a complete working example.

## Support

For issues or questions:
1. Check Edge Function logs in Supabase Dashboard
2. Verify environment variables are set correctly
3. Ensure database tables exist and have correct schema
4. Test with sandbox receipts first

## Additional Resources

- [Apple In-App Purchase Documentation](https://developer.apple.com/in-app-purchase/)
- [App Store Server API](https://developer.apple.com/documentation/appstoreserverapi)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [react-native-iap](https://github.com/dooboolab/react-native-iap)
