
# Apple IAP Product IDs Configuration

## Product IDs for App Store Connect

Configure these product IDs in App Store Connect before submitting your app.

### Premium Tier

#### Monthly Subscription
- **Product ID:** `com.natively.premium.monthly`
- **Type:** Auto-Renewable Subscription
- **Price:** $4.99/month (or your chosen price)
- **Subscription Group:** Premium
- **Features:**
  - Advanced prayer time customization
  - Qibla compass with AR
  - Daily Hadith notifications
  - Quran memorization tracker
  - Ad-free experience

#### Yearly Subscription
- **Product ID:** `com.natively.premium.yearly`
- **Type:** Auto-Renewable Subscription
- **Price:** $49.99/year (or your chosen price)
- **Subscription Group:** Premium
- **Features:** Same as monthly, billed annually

### Ultra Tier

#### Monthly Subscription
- **Product ID:** `com.natively.ultra.monthly`
- **Type:** Auto-Renewable Subscription
- **Price:** $9.99/month (or your chosen price)
- **Subscription Group:** Ultra
- **Features:**
  - All Premium features
  - AI Islamic chatbot
  - Mosque finder with reviews
  - Halal restaurant locator
  - Community forum access
  - Spiritual progress analytics

#### Yearly Subscription
- **Product ID:** `com.natively.ultra.yearly`
- **Type:** Auto-Renewable Subscription
- **Price:** $99.99/year (or your chosen price)
- **Subscription Group:** Ultra
- **Features:** Same as monthly, billed annually

### Super Ultra Tier

#### Lifetime Purchase
- **Product ID:** `com.natively.superultra.lifetime`
- **Type:** Non-Consumable
- **Price:** $888.00 (or your chosen price)
- **Features:**
  - All Ultra features
  - Lifetime access (no recurring payments)
  - Exclusive gold-themed UI
  - Priority support
  - Early access to new features
  - Exclusive community badge

## App Store Connect Configuration Steps

### 1. Create Subscription Groups

1. Go to App Store Connect
2. Select your app
3. Navigate to "Subscriptions"
4. Create two subscription groups:
   - **Premium** (for premium tier subscriptions)
   - **Ultra** (for ultra tier subscriptions)

### 2. Add Auto-Renewable Subscriptions

For each monthly/yearly subscription:

1. Click "+" to add a new subscription
2. Enter the Product ID (exactly as shown above)
3. Select the appropriate subscription group
4. Set the subscription duration (1 month or 1 year)
5. Add localized names and descriptions
6. Set pricing in your target markets
7. Configure subscription benefits
8. Save and submit for review

### 3. Add Non-Consumable Product

For the lifetime purchase:

1. Navigate to "In-App Purchases"
2. Click "+" to add a new in-app purchase
3. Select "Non-Consumable"
4. Enter Product ID: `com.natively.superultra.lifetime`
5. Add localized names and descriptions
6. Set pricing ($888 or your chosen price)
7. Upload a screenshot (required)
8. Save and submit for review

## Pricing Recommendations

### Premium Tier
- **Monthly:** $4.99 - $7.99
- **Yearly:** $49.99 - $79.99 (save 15-20%)

### Ultra Tier
- **Monthly:** $9.99 - $14.99
- **Yearly:** $99.99 - $149.99 (save 15-20%)

### Super Ultra Tier
- **Lifetime:** $299 - $888 (premium positioning)

## Subscription Descriptions

### Premium Monthly/Yearly
```
Unlock advanced features to enhance your spiritual journey:

• Advanced prayer time customization
• Qibla compass with augmented reality
• Daily Hadith notifications
• Quran memorization tracker
• Ad-free experience
• Priority customer support

Cancel anytime. No commitment.
```

### Ultra Monthly/Yearly
```
Everything in Premium, plus:

• AI-powered Islamic chatbot for questions
• Mosque finder with community reviews
• Halal restaurant locator
• Community forum access
• Spiritual progress analytics
• Exclusive content and features

Cancel anytime. No commitment.
```

### Super Ultra Lifetime
```
One-time payment. Lifetime access.

Get everything in Ultra, plus:

• Lifetime access - pay once, use forever
• Exclusive gold-themed premium UI
• Priority support with direct access
• Early access to all new features
• Exclusive community badge
• VIP member benefits

No subscriptions. No recurring charges. Ever.
```

## Testing Product IDs

### Sandbox Testing

1. Create sandbox test accounts in App Store Connect
2. Sign out of your Apple ID on your test device
3. Sign in with sandbox account when prompted during purchase
4. Test each product ID to ensure they work correctly

### Important Notes

- Sandbox purchases don't charge real money
- Subscriptions renew much faster in sandbox (e.g., 1 month = 5 minutes)
- Always test refunds and cancellations
- Test restore purchases functionality

## Updating Product IDs

If you need to change product IDs:

1. Update the IDs in App Store Connect
2. Update `PRODUCT_TIER_MAP` in the Edge Function:

```typescript
// In supabase/functions/apple-iap-verify/index.ts
const PRODUCT_TIER_MAP: Record<string, { tier: string; cycle: string }> = {
  "com.yourapp.premium.monthly": { tier: "premium", cycle: "monthly" },
  "com.yourapp.premium.yearly": { tier: "premium", cycle: "yearly" },
  // ... add your product IDs here
};
```

3. Redeploy the Edge Function
4. Update any hardcoded product IDs in your app code

## App Store Review Guidelines

When submitting for review:

1. **Provide Test Account:** Give Apple a sandbox test account
2. **Explain Features:** Clearly describe what each tier unlocks
3. **Show Restore:** Demonstrate restore purchases functionality
4. **Privacy Policy:** Include IAP information in privacy policy
5. **Terms of Service:** Include subscription terms

## Subscription Management

Users can manage subscriptions via:
- iOS Settings → Apple ID → Subscriptions
- App Store → Account → Subscriptions

Your app should include a link to subscription management:

```typescript
import { Linking } from 'react-native';

const openSubscriptionManagement = () => {
  Linking.openURL('https://apps.apple.com/account/subscriptions');
};
```

## Refund Policy

Apple handles refunds directly. When a refund is issued:

1. Apple notifies your app via receipt validation
2. The Edge Function detects the refund
3. User subscription status is updated to "refunded"
4. User loses access to premium features

## Revenue & Analytics

Track your IAP revenue in:
- App Store Connect → Sales and Trends
- App Store Connect → Payments and Financial Reports

## Compliance Checklist

✅ Product IDs configured in App Store Connect
✅ Subscription groups created
✅ Pricing set for all markets
✅ Localized descriptions added
✅ Screenshots uploaded (for non-consumables)
✅ Restore purchases implemented
✅ Subscription management link added
✅ Privacy policy updated
✅ Terms of service updated
✅ Sandbox testing completed
✅ Edge Function deployed with correct product IDs

## Support

For IAP-related issues:
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [In-App Purchase FAQ](https://developer.apple.com/in-app-purchase/faq/)
- [Contact Apple Developer Support](https://developer.apple.com/contact/)
