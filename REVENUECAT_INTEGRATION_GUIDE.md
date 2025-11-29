
# RevenueCat Integration Guide

## 📋 Overview

This guide covers the complete RevenueCat integration for your prayer app, including:

- ✅ SDK Installation
- ✅ Configuration with API key
- ✅ Basic subscription functionality
- ✅ Entitlement checking for "my prayer Pro"
- ✅ Customer info handling
- ✅ Product configuration (monthly, yearly, lifetime)
- ✅ RevenueCat Paywall UI
- ✅ Customer Center support
- ✅ Modern best practices

## 🚀 Quick Start

### 1. Installation

The required packages are already installed:

```bash
npm install --save react-native-purchases react-native-purchases-ui
```

**Installed versions:**
- `react-native-purchases`: ^9.6.7
- `react-native-purchases-ui`: ^9.6.8

### 2. Configuration

Your API key is configured in `utils/revenueCatService.ts`:

```typescript
const REVENUECAT_API_KEY = 'test_amHZgULphTOfAXgpIlAcujAxXvZ';
```

**Important:** This is a TEST key. For production, replace it with your production API key from the RevenueCat Dashboard.

### 3. Entitlement Configuration

The main entitlement identifier is:

```typescript
export const ENTITLEMENT_ID = 'my prayer Pro';
```

This should match the entitlement you configure in the RevenueCat Dashboard.

## 📦 Product Configuration

Configure these products in your RevenueCat Dashboard:

### Product Identifiers

1. **Monthly Subscription**
   - Product ID: `monthly` (or `com.yourapp.monthly`)
   - Type: Auto-renewable subscription
   - Duration: 1 month

2. **Yearly Subscription**
   - Product ID: `yearly` (or `com.yourapp.yearly`)
   - Type: Auto-renewable subscription
   - Duration: 1 year

3. **Lifetime Purchase**
   - Product ID: `lifetime` (or `com.yourapp.lifetime`)
   - Type: Non-consumable
   - Duration: Lifetime

### Offering Setup

In RevenueCat Dashboard:

1. Go to **Offerings**
2. Create a new offering (or use the default)
3. Add packages:
   - Monthly package → Link to monthly product
   - Yearly package → Link to yearly product
   - Lifetime package → Link to lifetime product
4. Attach entitlement "my prayer Pro" to all packages

## 🔧 Implementation

### Initialize RevenueCat

RevenueCat is automatically initialized in `SubscriptionContext.tsx`:

```typescript
import { initializeRevenueCat } from '@/utils/revenueCatService';

// Initialize with user ID for cross-device sync
await initializeRevenueCat(user.id);
```

### Check Entitlements

```typescript
import { useSubscription } from '@/contexts/SubscriptionContext';

function MyComponent() {
  const { hasFeature, currentTier, entitlements } = useSubscription();
  
  // Check if user has "my prayer Pro" access
  const hasProAccess = entitlements?.hasAccess;
  
  // Check specific feature
  const canUseFeature = hasFeature('advanced_notifications');
  
  return (
    <View>
      {hasProAccess ? (
        <Text>Welcome, Pro user!</Text>
      ) : (
        <Text>Upgrade to Pro</Text>
      )}
    </View>
  );
}
```

### Purchase Subscriptions

#### Option 1: Custom UI (Current Implementation)

```typescript
import { useRevenueCat } from '@/hooks/useRevenueCat';

function SubscriptionScreen() {
  const { offerings, loadOfferings, purchase } = useRevenueCat();
  
  useEffect(() => {
    loadOfferings();
  }, []);
  
  const handlePurchase = async (pkg) => {
    await purchase(pkg);
  };
  
  return (
    <View>
      {offerings?.availablePackages.map(pkg => (
        <TouchableOpacity 
          key={pkg.identifier}
          onPress={() => handlePurchase(pkg)}
        >
          <Text>{pkg.product.priceString}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

#### Option 2: RevenueCat Paywall (Recommended)

```typescript
import { useRevenueCatPaywall } from '@/hooks/useRevenueCatPaywall';

function FeatureGate() {
  const { showPaywallIfNeeded } = useRevenueCatPaywall();
  
  const handleFeatureAccess = async () => {
    // Show paywall only if user doesn't have "my prayer Pro"
    const result = await showPaywallIfNeeded('my prayer Pro');
    
    if (result === null) {
      // User has access, proceed with feature
      console.log('User has access!');
    }
  };
  
  return (
    <TouchableOpacity onPress={handleFeatureAccess}>
      <Text>Access Premium Feature</Text>
    </TouchableOpacity>
  );
}
```

### Restore Purchases

```typescript
import { useRevenueCat } from '@/hooks/useRevenueCat';

function SettingsScreen() {
  const { restore, loading } = useRevenueCat();
  
  return (
    <TouchableOpacity 
      onPress={restore}
      disabled={loading}
    >
      <Text>Restore Purchases</Text>
    </TouchableOpacity>
  );
}
```

### Customer Center

```typescript
import { useRevenueCatCustomerCenter } from '@/hooks/useRevenueCatCustomerCenter';

function ProfileScreen() {
  const { showCustomerCenter } = useRevenueCatCustomerCenter();
  
  return (
    <TouchableOpacity onPress={showCustomerCenter}>
      <Text>Manage Subscription</Text>
    </TouchableOpacity>
  );
}
```

## 🎨 RevenueCat Paywall

The RevenueCat Paywall is a pre-built, customizable UI for presenting subscriptions.

### Benefits

- ✅ No UI code needed
- ✅ A/B testing support
- ✅ Remote configuration
- ✅ Beautiful, conversion-optimized design
- ✅ Automatic localization
- ✅ Handles all purchase flows

### Usage

```typescript
import { useRevenueCatPaywall } from '@/hooks/useRevenueCatPaywall';

function App() {
  const { showPaywall, showPaywallIfNeeded } = useRevenueCatPaywall();
  
  // Show paywall unconditionally
  const handleUpgrade = async () => {
    await showPaywall();
  };
  
  // Show paywall only if needed (recommended)
  const handlePremiumFeature = async () => {
    const result = await showPaywallIfNeeded('my prayer Pro');
    
    if (result === null) {
      // User has access, show feature
      showPremiumFeature();
    }
  };
}
```

### Customization

Customize the paywall in the RevenueCat Dashboard:

1. Go to **Paywalls**
2. Create or edit a paywall
3. Customize:
   - Colors and fonts
   - Images and icons
   - Copy and messaging
   - Package display order
   - Call-to-action buttons

## 🏪 Customer Center

The Customer Center provides a self-service portal for subscription management.

### Features

- View subscription status
- Upgrade/downgrade plans
- Cancel subscription
- Restore purchases
- Contact support
- View billing history

### Usage

```typescript
import { useRevenueCatCustomerCenter } from '@/hooks/useRevenueCatCustomerCenter';

function SettingsScreen() {
  const { showCustomerCenter, loading } = useRevenueCatCustomerCenter();
  
  return (
    <TouchableOpacity 
      onPress={showCustomerCenter}
      disabled={loading}
    >
      <Text>Manage Subscription</Text>
    </TouchableOpacity>
  );
}
```

### When to Use

Show the Customer Center:

- ✅ In settings/profile screen
- ✅ When user wants to manage subscription
- ✅ When user wants to cancel
- ✅ For subscription support

## 🔐 Entitlement Checking

### Main Entitlement: "my prayer Pro"

```typescript
import { hasMyPrayerProAccess } from '@/utils/revenueCatService';
import { useSubscription } from '@/contexts/SubscriptionContext';

// Method 1: Using context (recommended)
function MyComponent() {
  const { entitlements } = useSubscription();
  const hasAccess = entitlements?.hasAccess;
}

// Method 2: Direct check
import { getCustomerInfo, hasMyPrayerProAccess } from '@/utils/revenueCatService';

async function checkAccess() {
  const customerInfo = await getCustomerInfo();
  const hasAccess = hasMyPrayerProAccess(customerInfo);
}
```

### Feature-Level Checks

```typescript
import { useSubscription } from '@/contexts/SubscriptionContext';

function FeatureComponent() {
  const { hasFeature } = useSubscription();
  
  // Check specific features
  const canUseAdvancedNotifications = hasFeature('advanced_notifications');
  const canUseMosqueFinder = hasFeature('mosque_finder');
  const canUseAIAssistant = hasFeature('ai_assistant');
  
  return (
    <View>
      {canUseAdvancedNotifications && <AdvancedNotifications />}
      {canUseMosqueFinder && <MosqueFinder />}
      {canUseAIAssistant && <AIAssistant />}
    </View>
  );
}
```

## 📊 Customer Info

### Get Customer Info

```typescript
import { getCustomerInfo, getSubscriptionStatus } from '@/utils/revenueCatService';

async function displaySubscriptionInfo() {
  const customerInfo = await getCustomerInfo();
  const status = getSubscriptionStatus(customerInfo);
  
  console.log('Tier:', status.tier);
  console.log('Active:', status.isActive);
  console.log('Expires:', status.expiresAt);
  console.log('Will Renew:', status.willRenew);
  console.log('Product:', status.productIdentifier);
}
```

### Real-Time Updates

Customer info is automatically updated via listener:

```typescript
// In revenueCatService.ts
Purchases.addCustomerInfoUpdateListener((customerInfo) => {
  console.log('Customer info updated!');
  // Automatically syncs with Supabase
});
```

## 🔄 Supabase Sync

Customer info is automatically synced with your Supabase database:

```typescript
// Automatic sync happens on:
// 1. Purchase
// 2. Restore
// 3. Customer info update
// 4. App launch

// Manual sync (if needed)
import { getCustomerInfo } from '@/utils/revenueCatService';

async function manualSync() {
  const customerInfo = await getCustomerInfo();
  // Sync happens automatically in the function
}
```

## ⚠️ Error Handling

All RevenueCat operations include comprehensive error handling:

```typescript
import { purchasePackage } from '@/utils/revenueCatService';

async function handlePurchase(pkg) {
  const result = await purchasePackage(pkg);
  
  if (result.success) {
    console.log('Purchase successful!');
  } else if (result.error === 'User cancelled') {
    console.log('User cancelled purchase');
  } else {
    console.error('Purchase failed:', result.error);
  }
}
```

## 🧪 Testing

### Test Mode

Your API key (`test_amHZgULphTOfAXgpIlAcujAxXvZ`) is a TEST key.

In test mode:
- ✅ No real charges
- ✅ Instant subscription activation
- ✅ Fast subscription expiration (for testing)
- ✅ Easy testing of all flows

### Testing Checklist

- [ ] Purchase monthly subscription
- [ ] Purchase yearly subscription
- [ ] Purchase lifetime subscription
- [ ] Restore purchases
- [ ] Check entitlement access
- [ ] Test feature gates
- [ ] Test paywall display
- [ ] Test Customer Center
- [ ] Test subscription expiration
- [ ] Test cross-device sync

## 🚀 Production Checklist

Before going to production:

- [ ] Replace TEST API key with PRODUCTION key
- [ ] Configure products in App Store Connect / Google Play Console
- [ ] Link products in RevenueCat Dashboard
- [ ] Set up entitlements in RevenueCat
- [ ] Configure offerings in RevenueCat
- [ ] Customize paywall design
- [ ] Set up webhooks (optional)
- [ ] Test with real purchases (sandbox)
- [ ] Set up analytics tracking
- [ ] Configure Customer Center
- [ ] Add privacy policy link
- [ ] Add terms of service link
- [ ] Test restore purchases flow
- [ ] Test subscription management
- [ ] Test cancellation flow

## 📱 Platform-Specific Notes

### iOS

- Restore purchases button is REQUIRED by Apple
- Subscriptions managed through App Store
- Sandbox testing available
- Family Sharing support

### Android

- Restore purchases recommended
- Subscriptions managed through Google Play
- Test purchases available
- Proration support for upgrades/downgrades

## 🔗 Useful Links

- [RevenueCat Dashboard](https://app.revenuecat.com/)
- [RevenueCat Documentation](https://www.revenuecat.com/docs)
- [Paywall Documentation](https://www.revenuecat.com/docs/tools/paywalls)
- [Customer Center Documentation](https://www.revenuecat.com/docs/tools/customer-center)
- [React Native SDK Reference](https://www.revenuecat.com/docs/getting-started/installation/reactnative)

## 💡 Best Practices

1. **Always use entitlement checks**, not product IDs
2. **Implement restore purchases** (required for iOS)
3. **Use paywall for better conversion**
4. **Provide Customer Center for self-service**
5. **Sync with your backend** (Supabase)
6. **Handle errors gracefully**
7. **Test thoroughly** before production
8. **Monitor analytics** in RevenueCat Dashboard
9. **Use offerings** for remote configuration
10. **Keep SDK updated** for latest features

## 🆘 Troubleshooting

### No offerings available

- Check API key is correct
- Verify products are configured in RevenueCat
- Ensure offerings are set up
- Check network connection

### Purchase fails

- Verify product IDs match
- Check App Store Connect / Google Play setup
- Ensure test account is configured
- Check RevenueCat logs

### Entitlements not updating

- Check entitlement configuration
- Verify product-to-entitlement mapping
- Force refresh customer info
- Check Supabase sync

### Paywall not showing

- Verify react-native-purchases-ui is installed
- Check platform support (iOS/Android only)
- Ensure offering is configured
- Check console logs for errors

## 📞 Support

For RevenueCat support:
- [Documentation](https://www.revenuecat.com/docs)
- [Community](https://community.revenuecat.com/)
- [Support](https://app.revenuecat.com/settings/support)

---

**Last Updated:** 2024
**SDK Version:** react-native-purchases ^9.6.7
**UI Version:** react-native-purchases-ui ^9.6.8
