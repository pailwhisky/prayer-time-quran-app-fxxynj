
# RevenueCat Advanced Features - Quick Reference

## 🧪 A/B Testing (Experiments)

### Setup Hook
```typescript
import { useRevenueCatExperiments } from '@/hooks/useRevenueCatExperiments';

const { currentExperiment, trackExperimentEvent } = useRevenueCatExperiments();
```

### Track Events
```typescript
// Track paywall view
await trackExperimentEvent('paywall_viewed', { source: 'premium_screen' });

// Track button click
await trackExperimentEvent('upgrade_clicked', { plan: 'yearly' });

// Track feature interaction
await trackExperimentEvent('feature_accessed', { feature: 'quran_reader' });
```

### Dashboard Setup
1. RevenueCat Dashboard → Experiments → Create
2. Configure variants (Control vs Test)
3. Set traffic split (50/50 recommended)
4. Launch and monitor results

---

## 📊 Analytics

### Setup Hook
```typescript
import { useRevenueCatAnalytics } from '@/hooks/useRevenueCatAnalytics';

const { metrics, trackEvent, setSubscriberAttributes } = useRevenueCatAnalytics();
```

### Key Metrics
```typescript
metrics.isSubscribed          // Boolean
metrics.subscriptionTier      // 'free' | 'premium' | 'ultra' | 'super_ultra'
metrics.daysSinceSubscribed   // Number
metrics.willRenew             // Boolean
metrics.isInTrialPeriod       // Boolean
metrics.billingIssueDetected  // Boolean
```

### Track Custom Events
```typescript
await trackEvent('feature_used', {
  feature: 'quran_reader',
  duration: 300,
});
```

### Set User Attributes
```typescript
await setSubscriberAttributes({
  '$email': 'user@example.com',
  'preferred_language': 'ar',
  'location': 'New York',
});
```

---

## 🏪 Customer Center

### Setup Hook
```typescript
import { useRevenueCatCustomerCenter } from '@/hooks/useRevenueCatCustomerCenter';

const { showCustomerCenter, loading } = useRevenueCatCustomerCenter();
```

### Show Customer Center
```typescript
await showCustomerCenter();
```

### Features Included
- ✅ View subscription status
- ✅ Upgrade/downgrade plans
- ✅ Cancel subscription
- ✅ Restore purchases
- ✅ Contact support

---

## 🎯 Common Use Cases

### Feature Gate with Paywall
```typescript
const { showPaywallIfNeeded } = useRevenueCatPaywall();
const { trackExperimentEvent } = useRevenueCatExperiments();

const openPremiumFeature = async () => {
  await trackExperimentEvent('feature_gate_shown', { feature: 'quran_reader' });
  
  const result = await showPaywallIfNeeded('my prayer Pro');
  
  if (result === null) {
    // User has access, show feature
    showFeature();
  }
};
```

### Track Conversion Funnel
```typescript
// Step 1: User views paywall
await trackEvent('paywall_viewed', { source: 'feature_gate' });

// Step 2: User selects plan
await trackEvent('plan_selected', { plan: 'yearly' });

// Step 3: Purchase completed (automatic)
// RevenueCat tracks this automatically

// Step 4: Feature accessed
await trackEvent('feature_accessed', { feature: 'quran_reader' });
```

### Monitor Subscription Health
```typescript
const { metrics } = useRevenueCatAnalytics();

if (metrics.billingIssueDetected) {
  // Show payment update prompt
  showPaymentUpdateAlert();
}

if (metrics.isInGracePeriod) {
  // User has payment issue but still has access
  showGracePeriodNotice();
}

if (!metrics.willRenew) {
  // User cancelled, show win-back offer
  showWinBackOffer();
}
```

---

## 📱 Component Integration

### Premium Screen
```typescript
import ExperimentTracker from '@/components/premium/ExperimentTracker';

<ExperimentTracker
  onExperimentLoaded={(experimentId) => {
    console.log('Experiment:', experimentId);
  }}
/>
```

### Analytics Dashboard
```typescript
import AnalyticsDashboard from '@/components/premium/AnalyticsDashboard';

<AnalyticsDashboard />
```

### Analytics Screen
```typescript
// Navigate to analytics
router.push('/(tabs)/analytics');
```

---

## 🔧 Configuration

### RevenueCat Dashboard
1. **Experiments**: Dashboard → Experiments
2. **Customer Center**: Dashboard → Customer Center
3. **Charts**: Dashboard → Charts (view analytics)
4. **Webhooks**: Dashboard → Integrations → Webhooks

### App Configuration
- Experiments: Automatic (no code changes needed)
- Analytics: Automatic tracking enabled
- Customer Center: Configured in dashboard

---

## 📊 Key Metrics to Monitor

| Metric | Target | Where to Check |
|--------|--------|----------------|
| Conversion Rate | 2-5% | RevenueCat Charts |
| Trial Conversion | 40-60% | RevenueCat Charts |
| Monthly Churn | <5% | RevenueCat Charts |
| Days to Convert | <7 days | Analytics Dashboard |
| LTV | Varies | RevenueCat Charts |

---

## 🚨 Common Issues

### Experiments not showing
```typescript
// Force refresh
const { refreshExperiment } = useRevenueCatExperiments();
await refreshExperiment();
```

### Analytics not updating
```typescript
// Force refresh
const { refresh } = useRevenueCatAnalytics();
await refresh();
```

### Customer Center not opening
```typescript
// Check platform
if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
  Alert.alert('Not Supported', 'Only available on iOS and Android');
  return;
}
```

---

## 🎓 Best Practices

### A/B Testing
- ✅ Test one variable at a time
- ✅ Run for 2-4 weeks minimum
- ✅ Wait for statistical significance
- ✅ Document hypotheses and results

### Analytics
- ✅ Track key user actions
- ✅ Set meaningful attributes
- ✅ Review metrics weekly
- ✅ Use data to inform decisions

### Customer Center
- ✅ Make easily accessible
- ✅ Show in settings/profile
- ✅ Test the flow regularly
- ✅ Monitor support tickets

---

## 📚 Resources

- [Full Guide](./REVENUECAT_ADVANCED_FEATURES.md)
- [RevenueCat Docs](https://docs.revenuecat.com)
- [Experiments Guide](https://www.revenuecat.com/docs/experiments-v1)
- [Customer Center Guide](https://www.revenuecat.com/docs/tools/customer-center)

---

**Quick Links**
- Analytics Screen: `app/(tabs)/analytics.tsx`
- Experiments Hook: `hooks/useRevenueCatExperiments.ts`
- Analytics Hook: `hooks/useRevenueCatAnalytics.ts`
- Customer Center Hook: `hooks/useRevenueCatCustomerCenter.ts`
