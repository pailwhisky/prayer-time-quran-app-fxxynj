
# RevenueCat Advanced Features Guide

This guide covers the advanced RevenueCat features implemented in your prayer app:
- A/B Testing with Experiments
- Advanced Analytics & Metrics
- Enhanced Customer Center Integration

## 🧪 A/B Testing with Experiments

### Overview
RevenueCat Experiments allow you to test different paywall configurations, pricing strategies, and offerings to optimize conversion rates.

### Implementation

#### Hook: `useRevenueCatExperiments`
Located in `hooks/useRevenueCatExperiments.ts`

```typescript
import { useRevenueCatExperiments } from '@/hooks/useRevenueCatExperiments';

function MyComponent() {
  const {
    loading,
    currentExperiment,
    experimentVariant,
    trackExperimentEvent,
    getCurrentOffering,
    refreshExperiment,
  } = useRevenueCatExperiments();

  // Track custom events
  const handleButtonClick = async () => {
    await trackExperimentEvent('upgrade_button_clicked', {
      screen: 'premium',
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <View>
      <Text>Current Experiment: {currentExperiment}</Text>
      <Button onPress={handleButtonClick} title="Upgrade" />
    </View>
  );
}
```

### Setting Up Experiments in RevenueCat Dashboard

1. **Navigate to Experiments**
   - Go to RevenueCat Dashboard
   - Click on "Experiments" in the sidebar
   - Click "Create Experiment"

2. **Configure Your Experiment**
   - **Name**: Give your experiment a descriptive name (e.g., "Pricing Test Q1 2024")
   - **Hypothesis**: What are you testing? (e.g., "Higher annual price will increase LTV")
   - **Offerings**: Select which offerings to test
   - **Traffic Split**: Decide how to split users (e.g., 50/50)
   - **Duration**: Set start and end dates

3. **Create Variants**
   - **Control**: Your current offering
   - **Variant A**: Modified offering (e.g., different pricing)
   - **Variant B**: Another variation (optional)

4. **Launch Experiment**
   - Review settings
   - Click "Start Experiment"
   - Monitor results in real-time

### Best Practices for A/B Testing

#### What to Test
- **Pricing**: Different price points for monthly/yearly subscriptions
- **Trial Periods**: 3 days vs 7 days vs 14 days
- **Paywall Design**: Different layouts and messaging (configure in RevenueCat Paywall)
- **Product Positioning**: Which features to highlight
- **Discount Strategies**: Introductory offers vs standard pricing

#### Testing Guidelines
- **Sample Size**: Run experiments until you have statistical significance
- **Duration**: Run for at least 2-4 weeks to account for weekly patterns
- **One Variable**: Test one thing at a time for clear results
- **Segment Users**: Consider testing different strategies for different user segments

### Tracking Custom Events

```typescript
// Track paywall views
await trackExperimentEvent('paywall_viewed', {
  source: 'premium_screen',
  tier: currentTier,
});

// Track feature interactions
await trackExperimentEvent('feature_clicked', {
  feature: 'quran_reader',
  hasAccess: false,
});

// Track upgrade attempts
await trackExperimentEvent('upgrade_initiated', {
  selectedPlan: 'yearly',
  currentTier: 'free',
});
```

### Analyzing Results

RevenueCat automatically tracks:
- **Conversion Rate**: % of users who purchase
- **Revenue**: Total revenue per variant
- **Trial Starts**: Number of trial activations
- **Cancellations**: Churn rate per variant

Access results in:
- RevenueCat Dashboard → Experiments → [Your Experiment]
- View real-time metrics and statistical significance

---

## 📊 Advanced Analytics

### Overview
Track detailed subscription metrics and user behavior to understand your subscription business.

### Implementation

#### Hook: `useRevenueCatAnalytics`
Located in `hooks/useRevenueCatAnalytics.ts`

```typescript
import { useRevenueCatAnalytics } from '@/hooks/useRevenueCatAnalytics';

function AnalyticsScreen() {
  const {
    metrics,
    loading,
    error,
    trackEvent,
    getSubscriberAttributes,
    setSubscriberAttributes,
    refresh,
  } = useRevenueCatAnalytics();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <View>
      <Text>Subscription Status: {metrics.isSubscribed ? 'Active' : 'Free'}</Text>
      <Text>Days Subscribed: {metrics.daysSinceSubscribed}</Text>
      <Text>Will Renew: {metrics.willRenew ? 'Yes' : 'No'}</Text>
    </View>
  );
}
```

### Available Metrics

#### Subscription Status
- `isSubscribed`: Boolean indicating active subscription
- `subscriptionTier`: Current tier (free, premium, ultra, super_ultra)
- `willRenew`: Whether subscription will auto-renew
- `billingIssueDetected`: Payment problems detected

#### Timeline Metrics
- `daysSinceFirstSeen`: Days since user first opened app
- `daysSinceSubscribed`: Days since subscription started
- `daysSinceLastSeen`: Days since last app open
- `firstSeenDate`: Date of first app open
- `subscriptionStartDate`: Date subscription started
- `subscriptionExpirationDate`: When subscription expires

#### Lifecycle Metrics
- `isInTrialPeriod`: User is in trial period
- `isInGracePeriod`: User is in grace period (payment failed but still has access)
- `originalPurchaseDate`: Date of first purchase

### Tracking Custom Events

```typescript
// Track feature usage
await trackEvent('feature_used', {
  feature: 'quran_reader',
  duration: 300, // seconds
  verses_read: 10,
});

// Track engagement
await trackEvent('daily_active', {
  prayers_completed: 3,
  quotes_viewed: 5,
});

// Track conversion funnel
await trackEvent('paywall_viewed', { source: 'feature_gate' });
await trackEvent('plan_selected', { plan: 'yearly' });
await trackEvent('purchase_completed', { plan: 'yearly', price: 29.99 });
```

### Setting Subscriber Attributes

Use attributes for segmentation and targeting:

```typescript
// Set user attributes
await setSubscriberAttributes({
  '$email': 'user@example.com',
  '$displayName': 'John Doe',
  'preferred_language': 'ar',
  'prayer_notifications': 'enabled',
  'location': 'New York',
  'user_type': 'power_user',
});

// Clear an attribute
await setSubscriberAttributes({
  'temporary_flag': null,
});
```

### Analytics Dashboard Component

The `AnalyticsDashboard` component (`components/premium/AnalyticsDashboard.tsx`) provides a visual interface for viewing metrics:

- Subscription status cards
- Timeline visualization
- Engagement metrics
- Billing information
- Refresh functionality

Access it via the Analytics screen: `app/(tabs)/analytics.tsx`

---

## 🏪 Enhanced Customer Center

### Overview
The Customer Center provides a self-service interface for users to manage their subscriptions.

### Implementation

#### Hook: `useRevenueCatCustomerCenter`
Located in `hooks/useRevenueCatCustomerCenter.ts`

```typescript
import { useRevenueCatCustomerCenter } from '@/hooks/useRevenueCatCustomerCenter';

function SettingsScreen() {
  const { showCustomerCenter, loading } = useRevenueCatCustomerCenter();

  const handleManageSubscription = async () => {
    await showCustomerCenter();
  };

  return (
    <Button
      onPress={handleManageSubscription}
      title="Manage Subscription"
      disabled={loading}
    />
  );
}
```

### Customer Center Features

The Customer Center automatically provides:

1. **Subscription Overview**
   - Current plan and status
   - Next billing date
   - Subscription history

2. **Plan Management**
   - Upgrade to higher tier
   - Downgrade to lower tier
   - Switch billing cycle (monthly ↔ yearly)

3. **Cancellation**
   - Cancel subscription
   - Pause subscription (if enabled)
   - Reactivate cancelled subscription

4. **Purchase Restoration**
   - Restore purchases from other devices
   - Sync subscription across platforms

5. **Support**
   - Contact support
   - View FAQs
   - Report issues

### Configuring Customer Center

Configure in RevenueCat Dashboard:

1. **Navigate to Customer Center**
   - Dashboard → Customer Center
   - Click "Configure"

2. **Customize Appearance**
   - Brand colors
   - Logo
   - Custom messaging

3. **Configure Options**
   - Enable/disable features
   - Set cancellation flow
   - Configure support contact

4. **Localization**
   - Add translations
   - Set default language

### Best Practices

#### When to Show Customer Center
- Settings screen
- Profile screen
- After successful purchase
- When user wants to manage subscription

#### User Experience
- Make it easily accessible
- Show subscription status before opening
- Provide clear call-to-action buttons

---

## 🔗 Integration Points

### Premium Screen Integration

The premium screen (`app/(tabs)/premium-with-paywall.tsx`) integrates all features:

```typescript
// A/B Testing
<ExperimentTracker
  onExperimentLoaded={(experimentId) => {
    console.log('Experiment loaded:', experimentId);
  }}
/>

// Analytics Link
<TouchableOpacity onPress={() => router.push('/(tabs)/analytics')}>
  <Text>View Subscription Analytics</Text>
</TouchableOpacity>

// Customer Center
<Button onPress={showCustomerCenter} title="Manage Subscription" />
```

### Automatic Tracking

The app automatically tracks:
- Paywall views
- Purchase attempts
- Successful purchases
- Cancellations
- Restorations
- Feature usage (when gated)

---

## 📈 Monitoring & Optimization

### Key Metrics to Monitor

1. **Conversion Rate**
   - % of users who subscribe
   - Target: 2-5% for freemium apps

2. **Trial Conversion**
   - % of trial users who convert to paid
   - Target: 40-60%

3. **Churn Rate**
   - % of subscribers who cancel
   - Target: <5% monthly

4. **Lifetime Value (LTV)**
   - Average revenue per user
   - Compare across experiments

5. **Time to Convert**
   - Days from install to purchase
   - Optimize onboarding to reduce

### Optimization Strategies

#### Improve Conversion
- Test different pricing
- Optimize paywall messaging
- Highlight most valuable features
- Offer limited-time discounts

#### Reduce Churn
- Send re-engagement notifications
- Offer win-back campaigns
- Improve feature value
- Gather feedback before cancellation

#### Increase LTV
- Encourage annual subscriptions
- Offer lifetime plans
- Upsell to higher tiers
- Add new premium features

---

## 🚀 Next Steps

### Immediate Actions
1. ✅ Set up your first A/B test in RevenueCat Dashboard
2. ✅ Configure Customer Center branding
3. ✅ Review analytics dashboard regularly
4. ✅ Set up webhook integrations for your backend

### Advanced Features to Explore
- **Promotional Offers**: Create limited-time discounts
- **Win-back Campaigns**: Re-engage churned users
- **Subscriber Attributes**: Segment users for targeted offers
- **Webhooks**: Integrate with your backend systems
- **Charts**: Use RevenueCat's built-in analytics charts

### Resources
- [RevenueCat Experiments Documentation](https://www.revenuecat.com/docs/experiments-v1)
- [Customer Center Guide](https://www.revenuecat.com/docs/tools/customer-center)
- [Analytics & Metrics](https://www.revenuecat.com/docs/customer-info)
- [Subscriber Attributes](https://www.revenuecat.com/docs/subscriber-attributes)
- [Webhooks](https://www.revenuecat.com/docs/webhooks)

---

## 💡 Tips & Best Practices

### A/B Testing
- Run experiments for at least 2-4 weeks
- Wait for statistical significance before making decisions
- Test one variable at a time
- Document your hypotheses and results

### Analytics
- Check metrics weekly
- Set up alerts for unusual patterns
- Compare cohorts over time
- Use data to inform product decisions

### Customer Center
- Make it easily discoverable
- Test the flow yourself regularly
- Monitor support tickets for common issues
- Update FAQs based on user questions

### General
- Always test on real devices
- Monitor app store reviews for feedback
- Keep RevenueCat SDK updated
- Use sandbox testing before production

---

## 🆘 Troubleshooting

### Experiments Not Showing
- Check experiment is active in dashboard
- Verify user is in experiment cohort
- Clear app data and reinstall
- Check SDK version compatibility

### Analytics Not Updating
- Verify SDK is configured correctly
- Check network connectivity
- Force refresh customer info
- Review logs for errors

### Customer Center Issues
- Ensure SDK version supports Customer Center
- Check platform compatibility (iOS/Android only)
- Verify customer has active subscription
- Review dashboard configuration

---

## 📞 Support

If you need help:
1. Check [RevenueCat Documentation](https://docs.revenuecat.com)
2. Visit [RevenueCat Community](https://community.revenuecat.com)
3. Contact RevenueCat Support (support@revenuecat.com)
4. Review app logs for error messages

---

**Last Updated**: January 2024
**SDK Version**: react-native-purchases ^9.6.7
**Platform Support**: iOS, Android
