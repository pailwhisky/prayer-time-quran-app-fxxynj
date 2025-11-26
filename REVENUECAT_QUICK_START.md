
# RevenueCat Quick Start

Get your subscription system up and running in 15 minutes!

## Prerequisites

- [ ] RevenueCat account (sign up at https://www.revenuecat.com/)
- [ ] iOS app in App Store Connect (for iOS)
- [ ] Android app in Google Play Console (for Android)

## Quick Setup (5 Steps)

### Step 1: Create RevenueCat Project (2 min)

1. Go to https://app.revenuecat.com/
2. Click "Create New Project"
3. Enter your app name
4. Click "Create"

### Step 2: Add Your App (3 min)

**For iOS:**
1. Click "Add App" → "iOS"
2. Enter Bundle ID: `com.yourcompany.prayerapp`
3. Upload App Store Connect API Key (or skip for now)
4. Copy the iOS API Key

**For Android:**
1. Click "Add App" → "Android"
2. Enter Package Name: `com.yourcompany.prayerapp`
3. Upload Google Play Service Account JSON (or skip for now)
4. Copy the Android API Key

### Step 3: Configure Products (5 min)

1. Go to "Products" tab
2. Create Entitlements:
   - Click "New Entitlement"
   - Name: `premium`, Identifier: `premium`
   - Repeat for `ultra` and `super_ultra`

3. Create Products:
   - Click "New Product"
   - Add these products:
     - `premium_monthly` → Link to `premium` entitlement
     - `premium_yearly` → Link to `premium` entitlement
     - `ultra_monthly` → Link to `ultra` entitlement
     - `ultra_yearly` → Link to `ultra` entitlement
     - `super_ultra_lifetime` → Link to `super_ultra` entitlement

4. Create Offering:
   - Go to "Offerings" tab
   - Click "New Offering"
   - Name: `default`
   - Add packages:
     - Monthly → `premium_monthly`
     - Yearly → `premium_yearly`
     - Ultra Monthly → `ultra_monthly`
     - Ultra Yearly → `ultra_yearly`
     - Lifetime → `super_ultra_lifetime`

### Step 4: Configure App (2 min)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your API keys to `.env`:
   ```env
   EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_xxxxxxxxxxxxx
   EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_xxxxxxxxxxxxx
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

### Step 5: Set Up Webhook (3 min)

1. In RevenueCat dashboard, go to "Integrations" → "Webhooks"
2. Click "Add Webhook"
3. Enter URL:
   ```
   https://asuhklwnekgmfdfvjxms.supabase.co/functions/v1/revenuecat-webhook
   ```
4. Select all events
5. Copy the webhook secret
6. Add to Supabase:
   ```bash
   supabase secrets set REVENUECAT_WEBHOOK_SECRET=your_secret_here
   ```

## Test Your Setup

### Quick Test (iOS Simulator)

1. Run app: `npm run ios`
2. Navigate to Premium tab
3. Tap "Upgrade Now"
4. You should see subscription options

**Note:** Actual purchases won't work in simulator. You need a real device with a sandbox test account.

### Test on Real Device

1. Create sandbox test user in App Store Connect
2. Sign out of Apple ID on device
3. Run app on device
4. Try to purchase
5. Sign in with sandbox test user
6. Complete purchase
7. Check RevenueCat dashboard to see the purchase

## Verify Everything Works

- [ ] App shows subscription options
- [ ] Can select different packages
- [ ] Purchase button appears
- [ ] RevenueCat dashboard shows your app
- [ ] Webhook URL is configured

## Common Issues

### "No offerings available"

**Solution:** Make sure you created the "default" offering in RevenueCat dashboard.

### "API key not configured"

**Solution:** Check that `.env` file exists and has the correct API keys.

### "Purchase failed"

**Solution:** 
- Make sure you're using a sandbox test account
- Verify products are created in App Store Connect
- Check that product IDs match exactly

## Next Steps

1. **Create Products in App Store Connect**
   - Go to App Store Connect
   - Create in-app purchases with the same IDs
   - Set pricing and descriptions

2. **Test Thoroughly**
   - Test all subscription tiers
   - Test restore purchases
   - Test subscription expiration
   - Test cancellation

3. **Monitor Dashboard**
   - Check RevenueCat dashboard for purchases
   - Monitor webhook events
   - Review subscription metrics

## Need Help?

- **Full Setup Guide**: See `REVENUECAT_SETUP_GUIDE.md`
- **Migration Details**: See `REVENUECAT_MIGRATION_SUMMARY.md`
- **RevenueCat Docs**: https://docs.revenuecat.com/
- **Community**: https://community.revenuecat.com/

## Production Checklist

Before launching:

- [ ] All products created in App Store Connect / Google Play
- [ ] Products approved and available
- [ ] Webhook tested and working
- [ ] Test purchases completed successfully
- [ ] Restore purchases works
- [ ] Subscription status displays correctly
- [ ] Privacy policy updated
- [ ] Terms of service updated

---

**You're all set! 🚀**

Your app now has a professional subscription system powered by RevenueCat.
