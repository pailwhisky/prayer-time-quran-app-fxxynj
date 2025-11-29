
# Prayer Times App - Configuration Guide

## 🚀 Quick Start

This guide will help you configure all the necessary API keys and services to make the app fully functional.

## 📋 Prerequisites

Before you begin, make sure you have:
- A Google account (for Gemini AI)
- A Supabase account (already configured)
- A RevenueCat account (for in-app purchases)
- Xcode (for iOS development)
- Android Studio (for Android development)

## 🔑 Required API Keys

### 1. Google AI (Gemini) API Key

**Purpose:** Powers AI features like Islamic chatbot, daily Hadith explanations, and enhanced Quran quotes.

**Steps:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Open `.env` file in the project root
6. Replace `your_google_ai_api_key_here` with your actual key:
   ```
   EXPO_PUBLIC_GOOGLE_AI_API_KEY=AIzaSy...your_actual_key
   ```

**Note:** The app will work without this key, but AI features will use fallback content.

### 2. RevenueCat API Keys

**Purpose:** Manages in-app purchases and subscriptions across iOS and Android.

**Steps:**
1. Visit [RevenueCat](https://www.revenuecat.com/) and create an account
2. Create a new project
3. Add your iOS app:
   - Bundle ID: `com.prayertimes.islamic`
   - Add App Store Connect credentials
4. Add your Android app:
   - Package name: `com.prayertimes.islamic`
   - Add Google Play Console credentials
5. Copy the API keys from project settings
6. Add them to `.env`:
   ```
   EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_...your_ios_key
   EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_...your_android_key
   ```

### 3. Supabase Configuration

**Already Configured!** ✅

The app is already connected to Supabase with:
- Project URL: `https://asuhklwnekgmfdfvjxms.supabase.co`
- Database tables created
- Edge Functions deployed
- RLS policies enabled

## 📱 App Store Configuration

### iOS (App Store Connect)

1. **Create App in App Store Connect:**
   - Bundle ID: `com.prayertimes.islamic`
   - App Name: "My Prayer"
   - Category: Lifestyle
   - Age Rating: 4+

2. **Configure In-App Purchases:**
   Create the following subscription products:
   - `com.prayertimes.premium.monthly` - Premium Monthly ($4.99/month)
   - `com.prayertimes.premium.yearly` - Premium Yearly ($39.99/year)
   - `com.prayertimes.ultra.monthly` - Ultra Monthly ($9.99/month)
   - `com.prayertimes.ultra.yearly` - Ultra Yearly ($79.99/year)
   - `com.prayertimes.superultra.lifetime` - Super Ultra Lifetime ($199.99 one-time)

3. **Link to RevenueCat:**
   - In RevenueCat dashboard, go to your iOS app
   - Add the product IDs from App Store Connect
   - Create entitlements: `premium`, `ultra`, `super_ultra`

### Android (Google Play Console)

1. **Create App in Google Play Console:**
   - Package name: `com.prayertimes.islamic`
   - App Name: "My Prayer"
   - Category: Lifestyle
   - Content Rating: Everyone

2. **Configure In-App Products:**
   Create the following subscription products:
   - `premium_monthly` - Premium Monthly ($4.99/month)
   - `premium_yearly` - Premium Yearly ($39.99/year)
   - `ultra_monthly` - Ultra Monthly ($9.99/month)
   - `ultra_yearly` - Ultra Yearly ($79.99/year)
   - `superultra_lifetime` - Super Ultra Lifetime ($199.99 one-time)

3. **Link to RevenueCat:**
   - In RevenueCat dashboard, go to your Android app
   - Add the product IDs from Google Play Console
   - Map to the same entitlements as iOS

## 🔧 Development Setup

### Install Dependencies

```bash
npm install
```

### Run on iOS

```bash
npm run ios
```

### Run on Android

```bash
npm run android
```

### Run on Web

```bash
npm run web
```

## 🧪 Testing

### Test Prayer Times
1. Grant location permissions when prompted
2. Verify prayer times are calculated correctly
3. Test notification scheduling

### Test Subscriptions
1. Use sandbox accounts for testing
2. Test purchase flow for each tier
3. Test restore purchases
4. Verify feature access after purchase

### Test AI Features
1. Ensure Google AI API key is configured
2. Test Islamic chatbot
3. Test daily Hadith with AI explanations
4. Test enhanced Quran quotes

## 📊 Database Tables

The following tables are already created in Supabase:

- `subscription_tiers` - Subscription tier definitions
- `subscription_features` - Feature definitions
- `user_subscriptions` - User subscription records
- `quran_surahs` - Quran surah data
- `quran_ayahs` - Quran ayah data
- `quran_translations` - Quran translations
- `hadiths` - Hadith collection
- `duas` - Dua library
- `mosques` - Mosque locations
- `spiritual_progress` - User spiritual tracking
- And more...

## 🔐 Security

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:
- Users can only access their own data
- Public data is readable by all
- Admin operations are restricted

### API Keys

- Never commit `.env` file to version control
- Use environment variables for all sensitive data
- Rotate keys regularly

## 🚀 Deployment

### Build for iOS

```bash
eas build --platform ios
```

### Build for Android

```bash
eas build --platform android
```

### Submit to App Store

```bash
eas submit --platform ios
```

### Submit to Google Play

```bash
eas submit --platform android
```

## 📝 Checklist Before Publishing

- [ ] All API keys configured in `.env`
- [ ] RevenueCat products created and linked
- [ ] App Store Connect app created
- [ ] Google Play Console app created
- [ ] Privacy policy URL added
- [ ] Terms of service URL added
- [ ] App icons and splash screens configured
- [ ] Screenshots prepared for both platforms
- [ ] App description and keywords optimized
- [ ] Age rating completed
- [ ] Content rating completed
- [ ] Test on real devices (iOS and Android)
- [ ] Test all subscription tiers
- [ ] Test all premium features
- [ ] Test notifications
- [ ] Test location services
- [ ] Test offline functionality

## 🆘 Troubleshooting

### Prayer Times Not Loading
- Check location permissions
- Verify GPS is enabled
- Check console for errors

### Subscriptions Not Working
- Verify RevenueCat API keys are correct
- Check product IDs match between stores and RevenueCat
- Ensure sandbox accounts are configured
- Check RevenueCat dashboard for errors

### AI Features Not Working
- Verify Google AI API key is configured
- Check API key has proper permissions
- Monitor API usage limits
- Check console for API errors

### Notifications Not Appearing
- Check notification permissions
- Verify notification channel is created (Android)
- Check notification settings in device settings
- Ensure app is not in battery optimization mode

## 📞 Support

For issues or questions:
- Check the troubleshooting guide above
- Review the documentation files in the project
- Check Supabase logs for backend errors
- Check RevenueCat dashboard for subscription issues

## 🎉 You're Ready!

Once all API keys are configured and tested, your app is ready for:
- Development testing
- Beta testing (TestFlight/Internal Testing)
- Production release

Good luck with your app! 🚀
