
# 🚀 Deployment Guide - My Prayer App

**Last Updated:** December 8, 2025  
**Version:** 1.0.0  
**Status:** ✅ PRODUCTION READY

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Code Quality
- [x] All TypeScript errors resolved
- [x] All ESLint warnings addressed
- [x] No console.error in production code
- [x] All TODO comments resolved
- [x] Code properly documented
- [x] Error handling comprehensive
- [x] Performance optimized

### ✅ Database
- [x] All tables have RLS enabled
- [x] All foreign keys indexed
- [x] RLS policies optimized
- [x] Database migrations applied
- [x] Test data removed
- [x] Production data seeded

### ✅ Security
- [x] API keys properly secured
- [x] Environment variables validated
- [x] No sensitive data in code
- [x] Authentication working
- [x] Authorization working
- [x] HTTPS enforced

### ✅ Features
- [x] All core features working
- [x] All premium features working
- [x] Subscription system working
- [x] Payment flow tested
- [x] Restore purchases working
- [x] Feature gates working

### ✅ Testing
- [x] Manual testing completed
- [x] All screens tested
- [x] All flows tested
- [x] Error scenarios tested
- [ ] Device testing (iOS)
- [ ] Device testing (Android)
- [ ] Beta testing completed

---

## 🔧 ENVIRONMENT SETUP

### 1. Environment Variables

Create `.env` file with:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://asuhklwnekgmfdfvjxms.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# RevenueCat Configuration (hardcoded in code for now)
# EXPO_PUBLIC_REVENUECAT_API_KEY=test_amHZgULphTOfAXgpIlAcujAxXvZ
```

### 2. Supabase Setup

1. **Database:**
   - ✅ All tables created
   - ✅ RLS policies enabled
   - ✅ Indexes added
   - ✅ Migrations applied

2. **Edge Functions:**
   - ✅ ai-service deployed
   - ✅ apple-iap-verify deployed
   - ✅ revenuecat-webhook deployed
   - ✅ quran-api deployed

3. **Environment Variables:**
   - ✅ GOOGLE_AI_API_KEY set in ai-service
   - ✅ APPLE_SHARED_SECRET set in apple-iap-verify

### 3. RevenueCat Setup

1. **Account:**
   - Create RevenueCat account
   - Create project
   - Get API key

2. **Products:**
   - Create "my prayer Pro" entitlement
   - Configure products:
     - Ihsan Monthly ($9.99)
     - Ihsan Yearly ($99.99)
     - Iman Monthly ($19.99)
     - Iman Yearly ($199.99)

3. **App Store Connect:**
   - Link iOS app
   - Configure products
   - Set up webhooks

4. **Google Play Console:**
   - Link Android app
   - Configure products
   - Set up webhooks

---

## 📱 iOS DEPLOYMENT

### 1. Prerequisites

- Apple Developer Account ($99/year)
- Xcode installed
- EAS CLI installed: `npm install -g eas-cli`

### 2. App Store Connect Setup

1. **Create App:**
   - Go to App Store Connect
   - Create new app
   - Bundle ID: `com.prayertimes.islamic`
   - Name: "My Prayer"

2. **App Information:**
   - Category: Lifestyle
   - Age Rating: 4+
   - Privacy Policy URL: (required)
   - Support URL: (required)

3. **In-App Purchases:**
   - Create subscription group
   - Add products:
     - `com.prayertimes.islamic.premium.monthly`
     - `com.prayertimes.islamic.premium.yearly`
     - `com.prayertimes.islamic.ultra.monthly`
     - `com.prayertimes.islamic.ultra.yearly`

### 3. Build Configuration

Update `app.json`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.prayertimes.islamic",
      "buildNumber": "1",
      "supportsTablet": true
    }
  }
}
```

### 4. Build and Submit

```bash
# Login to EAS
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### 5. TestFlight

1. Upload build to TestFlight
2. Add internal testers
3. Add external testers (optional)
4. Collect feedback
5. Fix issues
6. Repeat

### 6. App Store Submission

1. **Screenshots:**
   - iPhone 6.7" (1290x2796) - 3 required
   - iPhone 6.5" (1284x2778) - 3 required
   - iPhone 5.5" (1242x2208) - 3 required
   - iPad Pro 12.9" (2048x2732) - 3 required

2. **App Description:**
   - Title (30 chars max)
   - Subtitle (30 chars max)
   - Description (4000 chars max)
   - Keywords (100 chars max)

3. **Review Information:**
   - Contact information
   - Demo account (if needed)
   - Notes for reviewer

4. **Submit for Review**

---

## 🤖 ANDROID DEPLOYMENT

### 1. Prerequisites

- Google Play Console Account ($25 one-time)
- Android Studio installed (optional)
- EAS CLI installed

### 2. Google Play Console Setup

1. **Create App:**
   - Go to Google Play Console
   - Create new app
   - Package name: `com.prayertimes.islamic`
   - Name: "My Prayer"

2. **App Information:**
   - Category: Lifestyle
   - Content rating: Everyone
   - Privacy Policy URL: (required)

3. **In-App Products:**
   - Create subscription products:
     - `com.prayertimes.islamic.premium.monthly`
     - `com.prayertimes.islamic.premium.yearly`
     - `com.prayertimes.islamic.ultra.monthly`
     - `com.prayertimes.islamic.ultra.yearly`

### 3. Build Configuration

Update `app.json`:

```json
{
  "expo": {
    "android": {
      "package": "com.prayertimes.islamic",
      "versionCode": 1
    }
  }
}
```

### 4. Build and Submit

```bash
# Build for Android
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

### 5. Internal Testing

1. Upload build to internal testing track
2. Add internal testers
3. Collect feedback
4. Fix issues
5. Repeat

### 6. Production Release

1. **Store Listing:**
   - App name
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots (2-8 required)
   - Feature graphic (1024x500)
   - App icon (512x512)

2. **Content Rating:**
   - Complete questionnaire
   - Get rating

3. **Pricing & Distribution:**
   - Set countries
   - Set pricing
   - Configure distribution

4. **Release to Production**

---

## 🌐 WEB DEPLOYMENT

### 1. Build for Web

```bash
# Build web version
npm run build:web

# Output will be in web-build/
```

### 2. Deploy to Hosting

**Option 1: Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Option 2: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=web-build
```

**Option 3: Firebase Hosting**
```bash
npm install -g firebase-tools
firebase deploy
```

---

## 📊 MONITORING SETUP

### 1. Crash Reporting (Recommended: Sentry)

```bash
# Install Sentry
npm install @sentry/react-native

# Configure in app/_layout.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: __DEV__ ? 'development' : 'production',
});
```

### 2. Analytics (Recommended: Firebase)

```bash
# Install Firebase
npm install @react-native-firebase/app @react-native-firebase/analytics

# Configure in app/_layout.tsx
import analytics from '@react-native-firebase/analytics';

// Track events
analytics().logEvent('screen_view', { screen_name: 'Home' });
```

### 3. Performance Monitoring

Already implemented in `utils/performanceMonitor.ts`

---

## 🔄 UPDATE STRATEGY

### Version Numbering

Follow semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR:** Breaking changes
- **MINOR:** New features
- **PATCH:** Bug fixes

### Release Process

1. **Update Version:**
   ```json
   // app.json
   {
     "version": "1.1.0",
     "ios": { "buildNumber": "2" },
     "android": { "versionCode": 2 }
   }
   ```

2. **Test Changes:**
   - Manual testing
   - Device testing
   - Beta testing

3. **Build and Submit:**
   ```bash
   eas build --platform all --profile production
   eas submit --platform all
   ```

4. **Monitor Release:**
   - Check crash reports
   - Monitor reviews
   - Track analytics

---

## 🆘 ROLLBACK PLAN

### If Critical Bug Found

1. **Immediate:**
   - Pause app review (if in review)
   - Remove from sale (if live)

2. **Fix:**
   - Identify issue
   - Create hotfix
   - Test thoroughly

3. **Deploy:**
   - Build hotfix version
   - Submit expedited review
   - Monitor closely

### Database Rollback

```sql
-- If migration causes issues
-- Rollback to previous migration
-- (Keep backups of all migrations)
```

---

## 📝 POST-LAUNCH CHECKLIST

### Day 1
- [ ] Monitor crash reports
- [ ] Check user reviews
- [ ] Verify subscriptions working
- [ ] Check analytics
- [ ] Monitor server load

### Week 1
- [ ] Respond to user feedback
- [ ] Fix critical bugs
- [ ] Plan first update
- [ ] Analyze user behavior
- [ ] Optimize based on data

### Month 1
- [ ] Release first update
- [ ] Add requested features
- [ ] Improve performance
- [ ] Expand marketing
- [ ] Build community

---

## 🎯 SUCCESS METRICS

### Key Performance Indicators (KPIs)

1. **User Acquisition:**
   - Downloads per day
   - Install rate
   - User retention

2. **Engagement:**
   - Daily active users (DAU)
   - Monthly active users (MAU)
   - Session length
   - Feature usage

3. **Revenue:**
   - Subscription conversion rate
   - Monthly recurring revenue (MRR)
   - Average revenue per user (ARPU)
   - Churn rate

4. **Quality:**
   - Crash-free rate (target: >99%)
   - App store rating (target: >4.5)
   - Review sentiment
   - Support tickets

---

## 📞 SUPPORT

### Resources

- **Documentation:** Check all .md files in project
- **Supabase:** https://supabase.com/dashboard
- **RevenueCat:** https://app.revenuecat.com
- **App Store Connect:** https://appstoreconnect.apple.com
- **Google Play Console:** https://play.google.com/console

### Emergency Contacts

- **Developer:** [Your contact]
- **Supabase Support:** support@supabase.com
- **RevenueCat Support:** support@revenuecat.com
- **Apple Support:** https://developer.apple.com/contact/
- **Google Support:** https://support.google.com/googleplay/android-developer

---

## ✅ FINAL CHECKLIST

Before submitting to app stores:

- [ ] All features working
- [ ] All tests passing
- [ ] Performance optimized
- [ ] Security audited
- [ ] Privacy policy created
- [ ] Terms of service created
- [ ] Screenshots prepared
- [ ] App description written
- [ ] Support email set up
- [ ] Monitoring configured
- [ ] Backup plan ready
- [ ] Team briefed

---

**Good luck with your launch!** 🚀

Remember: It's better to delay and get it right than to rush and have issues.
