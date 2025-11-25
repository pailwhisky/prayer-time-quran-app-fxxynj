
# Subscription System Documentation

## Overview

The Prayer Times app uses a **three-tier subscription model**:

1. **Free** - Basic features
2. **Premium** - Enhanced features ($4.99/month or $49.99/year)
3. **Ultra** - All features ($9.99/month or $99.99/year)

## Architecture

### Database Tables

#### `subscription_tiers`
Defines available subscription tiers:
```sql
- id (uuid)
- name (text) - 'free', 'premium', 'ultra'
- display_name (text) - User-friendly name
- description (text) - Tier description
- price_monthly (numeric)
- price_yearly (numeric)
- features (text[]) - Array of feature descriptions
- sort_order (integer)
- is_active (boolean)
```

#### `subscription_features`
Maps features to required tiers:
```sql
- id (uuid)
- feature_key (text) - Unique identifier
- feature_name (text) - Display name
- description (text)
- category (text)
- is_premium (boolean)
- required_tier (text) - 'free', 'premium', 'ultra'
```

#### `user_subscriptions`
Tracks user subscription status:
```sql
- id (uuid)
- user_id (uuid) - References auth.users
- tier_id (uuid) - References subscription_tiers
- status (text) - 'active', 'cancelled', 'expired'
- billing_cycle (text) - 'monthly', 'yearly'
- start_date (timestamptz)
- end_date (timestamptz)
- auto_renew (boolean)
- payment_method (text) - 'apple_iap', 'google_play', 'demo'
- last_payment_date (timestamptz)
- next_payment_date (timestamptz)
```

#### `iap_transactions`
Logs all IAP transactions:
```sql
- id (uuid)
- user_id (uuid)
- product_id (text)
- transaction_id (text) - Unique from Apple/Google
- receipt_data (text)
- verification_status (text) - 'pending', 'verified', 'failed'
- apple_response (jsonb)
- created_at (timestamptz)
```

### Components

#### `SubscriptionContext`
**Location**: `contexts/SubscriptionContext.tsx`

**Purpose**: Global state management for subscriptions

**Key Functions**:
- `hasFeature(featureKey)` - Check if user has access to a feature
- `upgradeTier(tier, cycle)` - Upgrade to a new tier
- `purchaseWithAppleIAP(productId)` - Process Apple IAP purchase
- `restorePurchases()` - Restore previous purchases
- `cancelSubscription()` - Cancel active subscription
- `refreshSubscription()` - Reload subscription data

**State**:
- `currentTier` - User's current tier
- `subscription` - Active subscription details
- `tiers` - Available tiers
- `features` - Available features
- `iapProducts` - IAP products from store
- `loading` - Loading state

#### `SubscriptionModal`
**Location**: `components/SubscriptionModal.tsx`

**Purpose**: Subscription purchase UI

**Features**:
- Tier selection
- Monthly/yearly toggle
- Real-time pricing
- Apple IAP integration
- Restore purchases button
- Feature comparison

#### `PremiumGate`
**Location**: `components/PremiumGate.tsx`

**Purpose**: Feature access control

**Usage**:
```tsx
<PremiumGate 
  featureKey="adhan_player"
  featureName="Adhan Player"
  requiredTier="premium"
>
  <AdhanPlayer />
</PremiumGate>
```

**Behavior**:
- Shows children if user has access
- Shows upgrade prompt if locked
- Opens SubscriptionModal on upgrade tap

### Services

#### `appleIAPService`
**Location**: `services/appleIAPService.ts`

**Purpose**: Handle Apple In-App Purchases

**Key Methods**:
- `initialize()` - Set up IAP connection
- `getProducts()` - Fetch products from App Store
- `purchaseProduct(productId)` - Initiate purchase
- `restorePurchases()` - Restore previous purchases
- `verifyReceipt(purchase)` - Validate with backend
- `hasActiveSubscription()` - Check subscription status

**Product IDs**:
```typescript
PREMIUM_MONTHLY: 'com.prayertimes.islamic.premium.monthly'
PREMIUM_YEARLY: 'com.prayertimes.islamic.premium.yearly'
ULTRA_MONTHLY: 'com.prayertimes.islamic.ultra.monthly'
ULTRA_YEARLY: 'com.prayertimes.islamic.ultra.yearly'
```

### Edge Functions

#### `verify-apple-receipt`
**Location**: `supabase/functions/verify-apple-receipt/index.ts`

**Purpose**: Server-side receipt verification

**Flow**:
1. Receive receipt from client
2. Validate with Apple's servers
3. Handle sandbox/production environments
4. Log transaction to database
5. Return verification result

**Environment Variables**:
- `APPLE_SHARED_SECRET` - From App Store Connect
- `ENVIRONMENT` - 'production' or 'sandbox'

## Feature List

### Free Tier
- Basic prayer times
- Qibla compass
- Daily Quran quote
- Prayer notifications

### Premium Tier ($4.99/month)
- ✅ Adhan Player - Beautiful call to prayer
- ✅ AR Qibla Compass - Augmented reality direction
- ✅ Dua Library - Comprehensive supplications
- ✅ Islamic Calendar - Hijri dates and events
- ✅ Mosque Finder - Nearby mosques with times
- ✅ Spiritual Progress - Track prayers and deeds
- ✅ Advanced Notifications - Custom reminders

### Ultra Tier ($9.99/month)
- ✅ All Premium features
- ✅ Verse of the Day - Daily inspiration with mini reader
- ✅ Priority support
- ✅ Early access to new features
- ✅ Ad-free experience

## Usage Examples

### Check Feature Access
```typescript
const { hasFeature } = useSubscription();

if (hasFeature('adhan_player')) {
  // Show adhan player
} else {
  // Show upgrade prompt
}
```

### Gate a Feature
```tsx
<PremiumGate 
  featureKey="mosque_finder"
  featureName="Mosque Finder"
  requiredTier="premium"
>
  <MosqueFinder />
</PremiumGate>
```

### Upgrade Subscription
```typescript
const { upgradeTier } = useSubscription();

await upgradeTier('premium', 'monthly');
```

### Purchase with Apple IAP
```typescript
const { purchaseWithAppleIAP } = useSubscription();

await purchaseWithAppleIAP('com.prayertimes.islamic.premium.monthly');
```

### Restore Purchases
```typescript
const { restorePurchases } = useSubscription();

await restorePurchases();
```

## User Flows

### New Subscription
1. User taps "Upgrade Now" on premium feature
2. SubscriptionModal opens
3. User selects tier and billing cycle
4. User taps "Subscribe with Apple"
5. Apple IAP flow initiates
6. User completes purchase
7. Receipt sent to backend for verification
8. Subscription activated in database
9. User gains access to features

### Restore Purchases
1. User taps "Restore Purchases"
2. App queries Apple for previous purchases
3. Receipts verified with backend
4. Subscription status updated
5. Features unlocked

### Cancellation
1. User goes to App Store subscriptions
2. User cancels subscription
3. Subscription remains active until end date
4. Auto-renew disabled
5. User loses access after expiration

## Testing

### Test Accounts
Create sandbox test accounts in App Store Connect for testing.

### Test Scenarios
1. **New Purchase**
   - Monthly subscription
   - Yearly subscription
   - Different tiers

2. **Restore**
   - After reinstall
   - On new device
   - After logout/login

3. **Upgrade/Downgrade**
   - Premium to Ultra
   - Yearly to Monthly
   - Immediate vs end of period

4. **Cancellation**
   - Cancel and continue using
   - Cancel and immediate loss
   - Resubscribe after cancel

5. **Edge Cases**
   - Network errors
   - Receipt verification failures
   - Expired subscriptions
   - Multiple devices

## Monitoring

### Key Metrics
- Active subscriptions by tier
- Monthly recurring revenue (MRR)
- Churn rate
- Upgrade/downgrade rates
- Failed transactions
- Restore success rate

### Database Queries

**Active Subscriptions**:
```sql
SELECT tier_id, COUNT(*) 
FROM user_subscriptions 
WHERE status = 'active' 
GROUP BY tier_id;
```

**Revenue Estimate**:
```sql
SELECT 
  st.name,
  us.billing_cycle,
  COUNT(*) as subscribers,
  CASE 
    WHEN us.billing_cycle = 'monthly' THEN st.price_monthly * COUNT(*)
    ELSE st.price_yearly * COUNT(*) / 12
  END as monthly_revenue
FROM user_subscriptions us
JOIN subscription_tiers st ON us.tier_id = st.id
WHERE us.status = 'active'
GROUP BY st.name, us.billing_cycle, st.price_monthly, st.price_yearly;
```

**Failed Transactions**:
```sql
SELECT * 
FROM iap_transactions 
WHERE verification_status = 'failed' 
ORDER BY created_at DESC;
```

## Security

### Best Practices
- ✅ Server-side receipt verification
- ✅ RLS policies on all tables
- ✅ Secure storage of shared secrets
- ✅ Transaction logging
- ✅ Rate limiting on Edge Functions

### RLS Policies
All subscription tables have Row Level Security enabled:
- Users can only view their own data
- Service role can manage all data
- Public cannot access subscription data

## Troubleshooting

### Common Issues

**Subscription not activating**
- Check user_subscriptions table
- Verify receipt verification succeeded
- Check RLS policies
- Review Edge Function logs

**Restore not working**
- Verify user is signed in
- Check Apple ID matches
- Review transaction history
- Check receipt validation

**Wrong pricing displayed**
- Verify product IDs match
- Check App Store Connect configuration
- Ensure IAP products loaded
- Review currency settings

## Maintenance

### Regular Tasks
- Monitor failed transactions
- Review subscription metrics
- Update pricing if needed
- Add new features to tiers
- Clean up expired subscriptions

### Updates
When adding new features:
1. Add to `subscription_features` table
2. Update tier feature lists
3. Implement feature gating
4. Update documentation
5. Test access control

## Support

### User Support
- Subscription management in profile
- Restore purchases button
- Clear upgrade prompts
- Helpful error messages

### Developer Support
- Comprehensive logging
- Error tracking
- Transaction history
- Receipt storage

---

**Last Updated**: [Current Date]
**Version**: 1.0.0
