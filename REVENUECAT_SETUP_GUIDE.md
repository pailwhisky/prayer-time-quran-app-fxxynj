
# RevenueCat Integration Setup Guide

This guide will help you set up RevenueCat for subscription management in your prayer reminder app.

## Overview

RevenueCat is a subscription management platform that handles:
- ✅ In-app purchase verification
- ✅ Subscription status tracking
- ✅ Cross-platform subscription management
- ✅ Webhook notifications for subscription events
- ✅ Analytics and revenue tracking
- ✅ Refund detection
- ✅ Trial management

## Prerequisites

- A RevenueCat account (free tier available)
- iOS and/or Android app configured in App Store Connect / Google Play Console
- Supabase project with subscription tables

## Step 1: Create RevenueCat Account

1. Go to [https://www.revenuecat.com/](https://www.revenuecat.com/)
2. Sign up for a free account
3. Create a new project for your app

## Step 2: Configure iOS App (if applicable)

### In App Store Connect:
1. Create your in-app purchase products:
   - `premium_monthly` - Premium Monthly Subscription
   - `premium_yearly` - Premium Yearly Subscription
   - `ultra_monthly` - Ultra Monthly Subscription
   - `ultra_yearly` - Ultra Yearly Subscription
   - `super_ultra_lifetime` - Super Ultra Lifetime Purchase

2. Configure each product with:
   - Product ID (must match the identifiers above)
   - Pricing
   - Localized descriptions
   - Subscription duration (for subscriptions)

### In RevenueCat Dashboard:
1. Go to your project settings
2. Click "Add App" → "iOS"
3. Enter your app's Bundle ID
4. Upload your App Store Connect API Key:
   - In App Store Connect, go to Users and Access → Keys
   - Create a new key with "App Manager" access
   - Download the .p8 file
   - Upload to RevenueCat along with Issuer ID and Key ID
5. Copy your iOS API Key from RevenueCat

## Step 3: Configure Android App (if applicable)

### In Google Play Console:
1. Create your in-app purchase products with the same IDs as iOS
2. Configure pricing and descriptions

### In RevenueCat Dashboard:
1. Go to your project settings
2. Click "Add App" → "Android"
3. Enter your app's Package Name
4. Upload your Google Play Service Account JSON:
   - In Google Play Console, go to Setup → API access
   - Create a service account
   - Grant necessary permissions
   - Download the JSON key file
   - Upload to RevenueCat
5. Copy your Android API Key from RevenueCat

## Step 4: Configure Products in RevenueCat

1. Go to "Products" in RevenueCat dashboard
2. Create entitlements:
   - `premium` - Premium tier access
   - `ultra` - Ultra tier access
   - `super_ultra` - Super Ultra tier access

3. Link products to entitlements:
   - Link `premium_monthly` and `premium_yearly` to `premium` entitlement
   - Link `ultra_monthly` and `ultra_yearly` to `ultra` entitlement
   - Link `super_ultra_lifetime` to `super_ultra` entitlement

4. Create offerings:
   - Create a "default" offering
   - Add packages:
     - Monthly package → premium_monthly
     - Yearly package → premium_yearly
     - Ultra Monthly → ultra_monthly
     - Ultra Yearly → ultra_yearly
     - Lifetime → super_ultra_lifetime

## Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Add your RevenueCat API keys:

```env
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=your_ios_api_key_here
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=your_android_api_key_here
```

## Step 6: Set Up Webhook

The webhook allows RevenueCat to notify your backend when subscription events occur.

### In Supabase:
1. Your webhook Edge Function is already deployed at:
   `https://asuhklwnekgmfdfvjxms.supabase.co/functions/v1/revenuecat-webhook`

### In RevenueCat Dashboard:
1. Go to "Integrations" → "Webhooks"
2. Click "Add Webhook"
3. Enter your webhook URL:
   ```
   https://asuhklwnekgmfdfvjxms.supabase.co/functions/v1/revenuecat-webhook
   ```
4. Select events to send:
   - ✅ Initial Purchase
   - ✅ Renewal
   - ✅ Cancellation
   - ✅ Expiration
   - ✅ Billing Issue
   - ✅ Product Change
5. Copy the webhook secret
6. Add the secret to your Supabase Edge Function secrets:
   ```bash
   supabase secrets set REVENUECAT_WEBHOOK_SECRET=your_webhook_secret_here
   ```

## Step 7: Test Your Integration

### Test on iOS:
1. Create a sandbox test user in App Store Connect
2. Sign out of your Apple ID on your test device
3. Run the app and try to purchase a subscription
4. Sign in with your sandbox test user when prompted
5. Complete the purchase
6. Verify the subscription appears in RevenueCat dashboard

### Test on Android:
1. Add test users in Google Play Console
2. Create a closed testing track
3. Upload a test build
4. Install on test device
5. Try to purchase a subscription
6. Verify the subscription appears in RevenueCat dashboard

### Test Webhook:
1. Make a test purchase
2. Check Supabase Edge Function logs:
   ```bash
   supabase functions logs revenuecat-webhook
   ```
3. Verify subscription was created in `user_subscriptions` table

## Step 8: Production Checklist

Before going live:

- [ ] All products created in App Store Connect / Google Play Console
- [ ] Products configured in RevenueCat with correct entitlements
- [ ] Offerings created and packages linked
- [ ] Webhook configured and tested
- [ ] Environment variables set correctly
- [ ] Test purchases completed successfully
- [ ] Subscription status displays correctly in app
- [ ] Restore purchases works correctly
- [ ] Webhook events update database correctly

## Troubleshooting

### "No offerings available"
- Check that offerings are configured in RevenueCat dashboard
- Verify API keys are correct in `.env` file
- Check that products are approved in App Store Connect / Google Play Console

### "Purchase failed"
- Verify you're using a sandbox test account
- Check that product IDs match exactly between app and store
- Ensure products are approved and available

### "Webhook not receiving events"
- Verify webhook URL is correct
- Check Edge Function logs for errors
- Ensure webhook secret is set correctly
- Verify events are selected in RevenueCat webhook configuration

### "Subscription not showing in app"
- Check RevenueCat dashboard to see if purchase was recorded
- Verify entitlements are configured correctly
- Check app logs for RevenueCat errors
- Try restoring purchases

## Support

- RevenueCat Documentation: [https://docs.revenuecat.com/](https://docs.revenuecat.com/)
- RevenueCat Community: [https://community.revenuecat.com/](https://community.revenuecat.com/)
- Supabase Documentation: [https://supabase.com/docs](https://supabase.com/docs)

## Migration from Apple IAP

If you're migrating from the old Apple IAP system:

1. ✅ Old IAP files have been removed
2. ✅ RevenueCat SDK installed
3. ✅ Subscription context updated to use RevenueCat
4. ✅ Webhook handler deployed
5. ✅ UI components updated

The migration is complete! Just follow the setup steps above to configure RevenueCat.

## Key Benefits of RevenueCat

1. **Simplified Implementation**: No need to handle receipt validation manually
2. **Cross-Platform**: Single API for iOS and Android
3. **Server-Side Validation**: Secure subscription verification
4. **Real-Time Updates**: Webhook notifications for all subscription events
5. **Analytics**: Built-in revenue and subscription analytics
6. **Refund Detection**: Automatic detection and handling of refunds
7. **Trial Management**: Easy setup of free trials
8. **Customer Support**: Tools to help users with subscription issues

## Next Steps

1. Complete the setup steps above
2. Test thoroughly in sandbox environment
3. Submit your app for review
4. Monitor RevenueCat dashboard for subscription metrics
5. Set up email notifications for important events

Good luck with your subscription implementation! 🚀
