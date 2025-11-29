
# RevenueCat Quick Reference

## 🚀 Quick Setup

```typescript
// 1. Initialize (automatic in SubscriptionContext)
import { initializeRevenueCat } from '@/utils/revenueCatService';
await initializeRevenueCat(userId);

// 2. Check entitlements
import { useSubscription } from '@/contexts/SubscriptionContext';
const { entitlements, hasFeature } = useSubscription();
const hasAccess = entitlements?.hasAccess;

// 3. Show paywall
import { useRevenueCatPaywall } from '@/hooks/useRevenueCatPaywall';
const { showPaywallIfNeeded } = useRevenueCatPaywall();
await showPaywallIfNeeded('my prayer Pro');
```

## 📦 Product Configuration

Configure in RevenueCat Dashboard:

| Product | Type | Identifier |
|---------|------|------------|
| Monthly | Auto-renewable | `monthly` |
| Yearly | Auto-renewable | `yearly` |
| Lifetime | Non-consumable | `lifetime` |

**Entitlement:** `my prayer Pro`

## 🔐 Entitlement Checking

```typescript
// Method 1: Context (recommended)
const { entitlements, hasFeature } = useSubscription();
const hasProAccess = entitlements?.hasAccess;
const canUseFeature = hasFeature('advanced_notifications');

// Method 2: Direct
import { getCustomerInfo, hasMyPrayerProAccess } from '@/utils/revenueCatService';
const customerInfo = await getCustomerInfo();
const hasAccess = hasMyPrayerProAccess(customerInfo);
```

## 🎨 Show Paywall

```typescript
import { useRevenueCatPaywall } from '@/hooks/useRevenueCatPaywall';

// Show unconditionally
const { showPaywall } = useRevenueCatPaywall();
await showPaywall();

// Show only if needed (recommended)
const { showPaywallIfNeeded } = useRevenueCatPaywall();
const result = await showPaywallIfNeeded('my prayer Pro');
if (result === null) {
  // User has access
}
```

## 🏪 Customer Center

```typescript
import { useRevenueCatCustomerCenter } from '@/hooks/useRevenueCatCustomerCenter';

const { showCustomerCenter } = useRevenueCatCustomerCenter();
await showCustomerCenter();
```

## 🛒 Custom Purchase

```typescript
import { useRevenueCat } from '@/hooks/useRevenueCat';

const { offerings, loadOfferings, purchase } = useRevenueCat();

// Load offerings
await loadOfferings();

// Purchase
const pkg = offerings?.availablePackages[0];
await purchase(pkg);
```

## 🔄 Restore Purchases

```typescript
import { useRevenueCat } from '@/hooks/useRevenueCat';

const { restore } = useRevenueCat();
await restore();
```

## 📊 Get Customer Info

```typescript
import { getCustomerInfo, getSubscriptionStatus } from '@/utils/revenueCatService';

const customerInfo = await getCustomerInfo();
const status = getSubscriptionStatus(customerInfo);

console.log(status.tier); // 'free' | 'premium' | 'ultra' | 'super_ultra'
console.log(status.isActive); // boolean
console.log(status.expiresAt); // string | undefined
console.log(status.willRenew); // boolean
```

## 🔧 Configuration

**API Key:** `test_amHZgULphTOfAXgpIlAcujAxXvZ` (TEST)

**Location:** `utils/revenueCatService.ts`

```typescript
const REVENUECAT_API_KEY = 'test_amHZgULphTOfAXgpIlAcujAxXvZ';
export const ENTITLEMENT_ID = 'my prayer Pro';
```

## ⚠️ Error Handling

```typescript
const result = await purchasePackage(pkg);

if (result.success) {
  // Success
} else if (result.error === 'User cancelled') {
  // User cancelled
} else {
  // Error
  console.error(result.error);
}
```

## 🧪 Testing

1. Use TEST API key (already configured)
2. Test all purchase flows
3. Test restore purchases
4. Test entitlement checks
5. Test paywall display
6. Test Customer Center

## 🚀 Production

1. Replace TEST key with PRODUCTION key
2. Configure products in App Store / Google Play
3. Link products in RevenueCat Dashboard
4. Test with sandbox purchases
5. Deploy!

## 📱 Platform Support

- ✅ iOS
- ✅ Android
- ❌ Web (not supported)

## 🔗 Links

- [Dashboard](https://app.revenuecat.com/)
- [Docs](https://www.revenuecat.com/docs)
- [Paywall Docs](https://www.revenuecat.com/docs/tools/paywalls)
- [Customer Center Docs](https://www.revenuecat.com/docs/tools/customer-center)

## 💡 Best Practices

1. ✅ Use `showPaywallIfNeeded` for feature gates
2. ✅ Implement restore purchases (required for iOS)
3. ✅ Use Customer Center for subscription management
4. ✅ Check entitlements, not product IDs
5. ✅ Handle errors gracefully
6. ✅ Test thoroughly before production
7. ✅ Keep SDK updated

---

**API Key:** test_amHZgULphTOfAXgpIlAcujAxXvZ  
**Entitlement:** my prayer Pro  
**Products:** monthly, yearly, lifetime
