
# 🔧 Troubleshooting Guide

## Common Issues & Solutions

---

## 🗄️ Database Issues

### Issue: "Database connection failed"
**Symptoms:**
- Verification tool shows database errors
- Subscription tiers don't load
- Features don't display

**Solutions:**
1. Check `.env` file has correct Supabase URL and key
2. Verify Supabase project is active
3. Check internet connection
4. Restart app

**How to verify:**
```typescript
// Check in console
console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('Has Anon Key:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
```

### Issue: "No subscription tiers found"
**Symptoms:**
- Subscription modal empty
- Pricing doesn't show
- Upgrade button doesn't work

**Solutions:**
1. Check database has data:
   ```sql
   SELECT * FROM subscription_tiers WHERE is_active = true;
   ```
2. Verify RLS policies allow read access
3. Check Supabase logs for errors

**Quick fix:**
Run the Feature Verification Tool - it will show exactly what's missing.

---

## 📍 Permission Issues

### Issue: "Location permission denied"
**Symptoms:**
- Prayer times don't calculate
- Qibla compass doesn't work
- "Location required" message

**Solutions:**
1. **iOS:** Settings → Privacy → Location Services → My Prayer → While Using
2. **Android:** Settings → Apps → My Prayer → Permissions → Location → Allow
3. Restart app after granting permission

**Code check:**
```typescript
const { status } = await Location.requestForegroundPermissionsAsync();
console.log('Location permission:', status);
```

### Issue: "Notification permission denied"
**Symptoms:**
- No prayer reminders
- Notifications don't appear
- Permission prompt doesn't show

**Solutions:**
1. **iOS:** Settings → Notifications → My Prayer → Allow Notifications
2. **Android:** Settings → Apps → My Prayer → Notifications → Allow
3. Request permission again in app

**Code check:**
```typescript
const { status } = await Notifications.requestPermissionsAsync();
console.log('Notification permission:', status);
```

---

## 🧭 Qibla Compass Issues

### Issue: "Compass not working"
**Symptoms:**
- Direction doesn't update
- Compass stuck
- App crashes when opening compass

**Solutions:**
1. Grant sensor/motion permission
2. Calibrate device compass (wave in figure-8)
3. Check magnetometer available:
   ```typescript
   const available = await Magnetometer.isAvailableAsync();
   console.log('Magnetometer available:', available);
   ```
4. Restart app

### Issue: "AR Qibla crashes"
**Symptoms:**
- App crashes when opening AR compass
- Black screen
- Sensor errors

**Solutions:**
1. Check sensor cleanup in code (already fixed)
2. Grant camera permission (for AR)
3. Test on real device (not simulator)
4. Check console for errors

---

## 💳 Subscription Issues

### Issue: "Subscription modal doesn't open"
**Symptoms:**
- Tapping "Upgrade" does nothing
- Modal doesn't appear
- No response to button press

**Solutions:**
1. Check console for errors
2. Verify SubscriptionContext initialized
3. Check modal state:
   ```typescript
   console.log('Modal visible:', showSubscriptionModal);
   ```
4. Restart app

### Issue: "Demo purchase doesn't work"
**Symptoms:**
- Tapping "Upgrade" shows error
- Subscription doesn't activate
- Features don't unlock

**Solutions:**
1. Check database connection
2. Verify user is logged in (or create guest session)
3. Check console logs for errors
4. Run Feature Verification Tool

### Issue: "Features still locked after purchase"
**Symptoms:**
- Purchased subscription
- Features still show lock icon
- Premium gate still appears

**Solutions:**
1. Refresh subscription status:
   ```typescript
   await refreshSubscription();
   ```
2. Check database for user subscription
3. Verify tier_id matches
4. Restart app

---

## 📱 App Performance Issues

### Issue: "App is slow/laggy"
**Symptoms:**
- Slow animations
- Delayed responses
- Choppy scrolling

**Solutions:**
1. Check for memory leaks (run verification tool)
2. Close and reopen app
3. Clear app cache
4. Restart device

### Issue: "App crashes on launch"
**Symptoms:**
- App opens then immediately closes
- White screen
- Error screen

**Solutions:**
1. Check console logs
2. Verify all dependencies installed
3. Rebuild app:
   ```bash
   rm -rf node_modules
   npm install
   npm run ios
   ```
4. Check for JavaScript errors

### Issue: "Memory leak detected"
**Symptoms:**
- App gets slower over time
- Device gets hot
- Battery drains fast

**Solutions:**
1. Check sensor cleanup (already fixed in QiblaCompass)
2. Verify useEffect cleanup functions
3. Check for unsubscribed listeners
4. Restart app

---

## 🔔 Notification Issues

### Issue: "Notifications don't appear"
**Symptoms:**
- No prayer reminders
- Scheduled notifications don't fire
- Silent notifications

**Solutions:**
1. Check permission granted
2. Verify notification scheduled:
   ```typescript
   const notifications = await Notifications.getAllScheduledNotificationsAsync();
   console.log('Scheduled:', notifications.length);
   ```
3. Check device Do Not Disturb mode
4. Test with immediate notification

### Issue: "Notification sound doesn't play"
**Symptoms:**
- Notification appears but silent
- No sound or vibration

**Solutions:**
1. Check device volume
2. Verify notification settings
3. Check sound file exists
4. Test with default sound

---

## 🌐 Network Issues

### Issue: "API calls failing"
**Symptoms:**
- Quotes don't load
- AI assistant doesn't respond
- Data doesn't sync

**Solutions:**
1. Check internet connection
2. Verify API keys in `.env`
3. Check Supabase project status
4. Review API logs

### Issue: "Gemini AI not working"
**Symptoms:**
- Quotes don't generate
- AI responses fail
- "API error" message

**Solutions:**
1. Verify Gemini API key in `.env`
2. Check API quota/limits
3. Test API key:
   ```bash
   curl -H "x-goog-api-key: YOUR_KEY" \
     https://generativelanguage.googleapis.com/v1/models
   ```
4. Check console for error details

---

## 🎨 UI Issues

### Issue: "Icons not displaying"
**Symptoms:**
- Missing icons
- Blank spaces where icons should be
- Icon errors in console

**Solutions:**
1. Check IconSymbol component
2. Verify icon names correct
3. Check @expo/vector-icons installed
4. Rebuild app

### Issue: "Text not displaying correctly"
**Symptoms:**
- Arabic text broken
- Fonts not loading
- Text overlapping

**Solutions:**
1. Check fonts loaded:
   ```typescript
   const [fontsLoaded] = useFonts({...});
   console.log('Fonts loaded:', fontsLoaded);
   ```
2. Verify font files exist
3. Check text direction (RTL for Arabic)
4. Restart app

---

## 🔍 Debugging Tools

### 1. Feature Verification Tool
**Location:** Premium tab → "Verify Features" button

**What it checks:**
- Database connection
- Subscription system
- Permissions
- Core features
- Premium features
- Performance

**How to use:**
1. Open Premium tab
2. Tap "Verify Features"
3. Tap "Run All Tests"
4. Review results
5. Fix any failures

### 2. Console Logs
**How to access:**
- **iOS Simulator:** Check terminal
- **Android:** `adb logcat`
- **Expo:** Shake device → Debug

**What to look for:**
- Error messages
- Warning messages
- API responses
- State changes

### 3. React Native Debugger
**How to enable:**
1. Shake device
2. Tap "Debug"
3. Opens Chrome DevTools

**What you can do:**
- Inspect state
- Check network requests
- View console logs
- Debug JavaScript

### 4. Supabase Dashboard
**How to access:**
1. Go to supabase.com
2. Open your project
3. Check:
   - Table Editor (view data)
   - SQL Editor (run queries)
   - Logs (check errors)
   - API (test endpoints)

---

## 🚨 Critical Issues

### Issue: "App won't build"
**Solutions:**
1. Clear cache:
   ```bash
   rm -rf node_modules
   rm -rf .expo
   npm install
   ```
2. Check dependencies:
   ```bash
   npm install
   ```
3. Update Expo:
   ```bash
   npm install expo@latest
   ```
4. Check for TypeScript errors

### Issue: "Database tables missing"
**Solutions:**
1. Check Supabase dashboard
2. Run migrations if needed
3. Verify RLS policies
4. Check table permissions

### Issue: "Environment variables not loading"
**Solutions:**
1. Check `.env` file exists
2. Verify variable names start with `EXPO_PUBLIC_`
3. Restart development server
4. Rebuild app

---

## 📊 Performance Optimization

### If app is slow:
1. ✅ Run Feature Verification Tool
2. ✅ Check memory usage
3. ✅ Verify sensor cleanup
4. ✅ Optimize re-renders
5. ✅ Lazy load components

### If battery drains fast:
1. ✅ Check background tasks
2. ✅ Verify sensor subscriptions cleaned up
3. ✅ Reduce API calls
4. ✅ Optimize location updates

### If app size is large:
1. ✅ Optimize images
2. ✅ Remove unused dependencies
3. ✅ Enable Hermes (Android)
4. ✅ Use production build

---

## 🆘 Still Having Issues?

### Step 1: Run Feature Verification Tool
This will identify most issues automatically.

### Step 2: Check Console Logs
Look for error messages and warnings.

### Step 3: Review Documentation
- `READY_FOR_PUBLISH_SUMMARY.md`
- `IAP_VERIFICATION_CHECKLIST.md`
- `COMPLETE_IAP_SETUP_GUIDE.md`

### Step 4: Check Supabase
- Verify tables exist
- Check RLS policies
- Review logs

### Step 5: Rebuild App
Sometimes a clean rebuild fixes everything:
```bash
rm -rf node_modules
rm -rf .expo
npm install
npm run ios
```

---

## 💡 Prevention Tips

### To avoid issues:
1. ✅ Run verification tool regularly
2. ✅ Test on real devices
3. ✅ Check console logs
4. ✅ Monitor Supabase dashboard
5. ✅ Keep dependencies updated
6. ✅ Use TypeScript
7. ✅ Handle errors gracefully
8. ✅ Clean up resources (sensors, listeners)

### Best practices:
1. ✅ Test after every major change
2. ✅ Use Feature Verification Tool before commits
3. ✅ Check permissions before using features
4. ✅ Handle network errors
5. ✅ Provide user feedback
6. ✅ Log errors for debugging
7. ✅ Clean up in useEffect
8. ✅ Validate data before using

---

## 📞 Quick Reference

### Common Commands
```bash
# Start development
npm run dev

# Run on iOS
npm run ios

# Run on Android
npm run android

# Clear cache
rm -rf node_modules .expo
npm install

# Check logs
# iOS: Check terminal
# Android: adb logcat

# Build for testing
eas build --platform ios --profile preview
```

### Common Checks
```typescript
// Check database
const { data, error } = await supabase.from('subscription_tiers').select('*');

// Check permissions
const location = await Location.getForegroundPermissionsAsync();
const notifications = await Notifications.getPermissionsAsync();

// Check subscription
console.log('Current tier:', currentTier);
console.log('Has feature:', hasFeature('feature_key'));
```

---

## ✅ Issue Resolved?

After fixing an issue:
1. ✅ Run Feature Verification Tool
2. ✅ Test the specific feature
3. ✅ Check for related issues
4. ✅ Test on real device
5. ✅ Document the fix

---

**Remember:** Most issues can be identified and fixed using the Feature Verification Tool!

**Still stuck?** Check the detailed guides or review console logs for specific error messages.
