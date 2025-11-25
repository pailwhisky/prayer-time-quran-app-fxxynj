
# Apple IAP Quick Reference

## 🎯 Current Status

✅ **Fully Implemented** - Ready for production with App Store Connect setup

## 📦 Product IDs

```
Premium Monthly:  com.prayertimes.islamic.premium.monthly
Premium Yearly:   com.prayertimes.islamic.premium.yearly
Ultra Monthly:    com.prayertimes.islamic.ultra.monthly
Ultra Yearly:     com.prayertimes.islamic.ultra.yearly
```

## 💰 Pricing

| Tier    | Monthly | Yearly  | Savings |
|---------|---------|---------|---------|
| Premium | $4.99   | $49.99  | 17%     |
| Ultra   | $9.99   | $99.99  | 17%     |

## 🔑 Key Files

- `services/appleIAPService.ts` - IAP logic
- `contexts/SubscriptionContext.tsx` - State management
- `components/SubscriptionModal.tsx` - Purchase UI
- `components/PremiumGate.tsx` - Feature gating
- `supabase/functions/verify-apple-receipt/` - Receipt verification

## 🚀 Quick Setup (Production)

### 1. App Store Connect
```
1. Create subscription group
2. Add 4 products (use exact IDs above)
3. Generate shared secret
4. Submit products for review
```

### 2. Supabase
```bash
# Set secrets
APPLE_SHARED_SECRET=your_secret
ENVIRONMENT=production

# Deploy function
supabase functions deploy verify-apple-receipt
```

### 3. Build & Test
```bash
# Create build
eas build --platform ios --profile production

# Test with sandbox account
# (Create in App Store Connect → Users and Access)
```

## 🧪 Testing Commands

```sql
-- Check active subscriptions
SELECT * FROM user_subscriptions WHERE status = 'active';

-- View transaction log
SELECT * FROM iap_transactions ORDER BY created_at DESC LIMIT 10;

-- Check subscription tiers
SELECT * FROM subscription_tiers WHERE is_active = true;
```

## 🔧 Common Tasks

### Update Pricing
```sql
UPDATE subscription_tiers
SET price_monthly = 5.99, price_yearly = 59.99
WHERE name = 'premium';
```

### Add Feature
```sql
INSERT INTO subscription_features (
  feature_key, feature_name, required_tier, is_premium
) VALUES (
  'new_feature', 'New Feature', 'premium', true
);
```

### Check User Subscription
```sql
SELECT 
  us.*,
  st.display_name as tier_name
FROM user_subscriptions us
JOIN subscription_tiers st ON us.tier_id = st.id
WHERE us.user_id = 'user_uuid';
```

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| No products | Wait 2-4 hours after creating in App Store Connect |
| Can't connect | Check internet, sign out/in sandbox account |
| Receipt fails | Verify APPLE_SHARED_SECRET and ENVIRONMENT |
| Not activating | Check user_subscriptions table and RLS policies |
| Restore fails | Ensure same Apple ID, check transaction history |

## 📱 User Flows

### Purchase
```
Premium Tab → Upgrade Now → Select Tier → 
Subscribe with Apple → Face ID → Done
```

### Restore
```
Premium Tab → Restore Purchases → 
Verifying... → Subscription Restored
```

### Cancel
```
iPhone Settings → Apple ID → Subscriptions → 
Prayer Times → Cancel Subscription
```

## 🔐 Security Checklist

- [x] Server-side receipt verification
- [x] RLS policies enabled
- [x] Secrets stored securely
- [x] Transaction logging
- [x] HTTPS only

## 📊 Key Metrics

```sql
-- Monthly Recurring Revenue
SELECT 
  SUM(CASE 
    WHEN billing_cycle = 'monthly' THEN st.price_monthly
    ELSE st.price_yearly / 12
  END) as mrr
FROM user_subscriptions us
JOIN subscription_tiers st ON us.tier_id = st.id
WHERE us.status = 'active';

-- Conversion Rate
SELECT 
  COUNT(DISTINCT user_id) FILTER (WHERE status = 'active') * 100.0 / 
  COUNT(DISTINCT user_id) as conversion_rate
FROM user_subscriptions;
```

## 🎨 UI Components

### Gate a Feature
```tsx
<PremiumGate 
  featureKey="adhan_player"
  featureName="Adhan Player"
  requiredTier="premium"
>
  <AdhanPlayer />
</PremiumGate>
```

### Check Access
```tsx
const { hasFeature } = useSubscription();

if (hasFeature('mosque_finder')) {
  // Show feature
}
```

### Manual Purchase
```tsx
const { purchaseWithAppleIAP } = useSubscription();

await purchaseWithAppleIAP('com.prayertimes.islamic.premium.monthly');
```

## 📞 Support Links

- [App Store Connect](https://appstoreconnect.apple.com)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Apple IAP Docs](https://developer.apple.com/in-app-purchase/)
- [react-native-iap](https://github.com/dooboolab/react-native-iap)

## ⚡ Quick Commands

```bash
# View logs
supabase functions logs verify-apple-receipt

# Test Edge Function locally
supabase functions serve verify-apple-receipt

# Check database
supabase db pull

# Deploy changes
supabase db push
```

---

**Need more details?** See `COMPLETE_IAP_SETUP_GUIDE.md`
