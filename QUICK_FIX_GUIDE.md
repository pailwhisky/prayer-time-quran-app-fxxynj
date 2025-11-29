
# 🔧 Quick Fix Guide - Common Issues

## 🚨 Common Issues & Solutions

### 1. Prayer Times Not Loading

**Symptoms:**
- Loading spinner never stops
- "Location Required" error
- Prayer times show as undefined

**Solutions:**
```bash
# Check location permissions
- iOS: Settings > Privacy > Location Services > My Prayer
- Android: Settings > Apps > My Prayer > Permissions > Location

# Verify GPS is enabled
- iOS: Settings > Privacy > Location Services (ON)
- Android: Settings > Location (ON)

# Check console for errors
- Look for "Error getting location" messages
- Verify latitude/longitude are valid numbers
```

**Code Fix:**
If prayer times calculation fails, check `utils/prayerTimes.ts`:
- Ensure latitude and longitude are valid
- Verify date calculations are correct
- Check for timezone issues

---

### 2. Notifications Not Working

**Symptoms:**
- No notifications at prayer times
- "Enable Notifications" button doesn't work
- Notifications permission denied

**Solutions:**
```bash
# iOS
1. Settings > Notifications > My Prayer
2. Enable "Allow Notifications"
3. Enable "Sounds", "Badges", "Banners"

# Android
1. Settings > Apps > My Prayer > Notifications
2. Enable "All My Prayer notifications"
3. Disable battery optimization for the app
```

**Code Fix:**
Check `app/(tabs)/(home)/prayer-times.tsx`:
- Verify notification permissions are requested
- Check notification channel is created (Android)
- Ensure notifications are scheduled correctly

---

### 3. Subscriptions Not Loading

**Symptoms:**
- "No Subscriptions Available" message
- Loading spinner never stops
- Purchase button doesn't work

**Solutions:**
```bash
# Check RevenueCat API keys
1. Open .env file
2. Verify EXPO_PUBLIC_REVENUECAT_IOS_API_KEY is set
3. Verify EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY is set

# Check RevenueCat Dashboard
1. Visit app.revenuecat.com
2. Verify products are created
3. Verify entitlements are configured
4. Check for any errors in the dashboard

# Use sandbox accounts
- iOS: Settings > App Store > Sandbox Account
- Android: Use test account in Play Console
```

**Code Fix:**
Check `utils/revenueCatService.ts`:
- Verify API keys are loaded correctly
- Check initialization logic
- Ensure offerings are fetched properly

---

### 4. AI Features Not Working

**Symptoms:**
- Chatbot doesn't respond
- Daily Hadith shows fallback content
- "AI service unavailable" errors

**Solutions:**
```bash
# Check Google AI API key
1. Open .env file
2. Verify EXPO_PUBLIC_GOOGLE_AI_API_KEY is set
3. Visit https://aistudio.google.com/app/apikey
4. Verify API key is valid and active

# Check API limits
1. Visit Google AI Studio
2. Check usage quotas
3. Verify you haven't exceeded limits
```

**Code Fix:**
Check `utils/geminiService.ts`:
- Verify API key is loaded
- Check error handling
- Ensure fallback content works

---

### 5. Quran Not Loading

**Symptoms:**
- "Loading Quran..." never finishes
- Surahs don't display
- Error loading surahs

**Solutions:**
```bash
# Check Supabase connection
1. Verify internet connection
2. Check Supabase project status
3. Verify Edge Function is deployed

# Check Edge Function
1. Visit Supabase Dashboard
2. Go to Edge Functions
3. Verify "quran-api" is deployed
4. Check function logs for errors
```

**Code Fix:**
Check `app/(tabs)/quran.tsx`:
- Verify Supabase client is initialized
- Check Edge Function invocation
- Ensure error handling works

---

### 6. Icons Not Displaying

**Symptoms:**
- Missing icons
- Square boxes instead of icons
- "Icon not found" warnings

**Solutions:**
```bash
# Check icon mappings
1. Open components/IconSymbol.tsx
2. Verify icon name exists in MAPPING
3. Add missing icon if needed

# Platform-specific
- iOS: Verify SF Symbol name is correct
- Android: Verify Material Icon name is correct
```

**Code Fix:**
Add missing icon to `components/IconSymbol.tsx`:
```typescript
const MAPPING = {
  // ... existing mappings
  "your-icon-name": "material-icon-name",
};
```

---

### 7. App Crashes on Launch

**Symptoms:**
- App closes immediately after opening
- White screen of death
- Error boundary shows error

**Solutions:**
```bash
# Check console logs
1. Run: npm run ios (or android)
2. Look for error messages
3. Check for missing dependencies

# Clear cache
1. Run: npm start -- --clear
2. Delete node_modules
3. Run: npm install
4. Rebuild app
```

**Code Fix:**
- Check `app/_layout.tsx` for initialization errors
- Verify all imports are correct
- Check for syntax errors

---

### 8. Compass Not Working

**Symptoms:**
- Compass doesn't rotate
- "Compass not available" message
- Qibla direction incorrect

**Solutions:**
```bash
# Check sensor permissions
- iOS: Settings > Privacy > Motion & Fitness
- Android: No permission needed, but check sensor availability

# Calibrate compass
- iOS: Move device in figure-8 pattern
- Android: Move device in figure-8 pattern

# Check device compatibility
- Verify device has magnetometer sensor
- Some emulators don't support sensors
```

**Code Fix:**
Check `components/QiblaCompass.tsx`:
- Verify magnetometer is available
- Check sensor subscription
- Ensure calculations are correct

---

### 9. Dark Mode Issues

**Symptoms:**
- Text not visible in dark mode
- Colors look wrong
- UI elements blend together

**Solutions:**
```bash
# Check color scheme
1. Open styles/commonStyles.ts
2. Verify colors work in both modes
3. Test on device with dark mode enabled
```

**Code Fix:**
Update `styles/commonStyles.ts`:
- Ensure sufficient contrast
- Use semantic color names
- Test in both light and dark modes

---

### 10. Build Errors

**Symptoms:**
- "Build failed" message
- TypeScript errors
- Missing dependencies

**Solutions:**
```bash
# Clear and rebuild
npm run clean
npm install
npm run ios (or android)

# Check for TypeScript errors
npm run lint

# Update dependencies
npm update

# Check EAS Build
eas build --platform ios --profile development
```

**Common Build Errors:**
- Missing fonts: Install @expo-google-fonts packages
- Missing icons: Install @expo/vector-icons
- Native module errors: Run `npx expo prebuild`

---

## 🔍 Debugging Tips

### Enable Debug Mode
```typescript
// In app/_layout.tsx
console.log('Debug mode enabled');
```

### Check Supabase Logs
1. Visit Supabase Dashboard
2. Go to Logs
3. Filter by service (API, Auth, etc.)
4. Look for errors

### Check RevenueCat Logs
1. Visit RevenueCat Dashboard
2. Go to Customer History
3. Search for user
4. Check purchase events

### Check Device Logs
```bash
# iOS
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "My Prayer"'

# Android
adb logcat | grep "My Prayer"
```

---

## 📞 Getting Help

If you're still stuck:

1. **Check Documentation:**
   - APP_CONFIGURATION_GUIDE.md
   - PRE_LAUNCH_CHECKLIST.md
   - README.md

2. **Check Logs:**
   - Console logs in development
   - Supabase logs
   - RevenueCat dashboard

3. **Search Issues:**
   - Expo documentation
   - React Native documentation
   - Stack Overflow

4. **Ask for Help:**
   - Expo Discord
   - React Native Community
   - Supabase Discord

---

## ✅ Prevention

To avoid issues:

1. **Test Regularly:**
   - Test on real devices
   - Test both iOS and Android
   - Test in different scenarios

2. **Monitor Logs:**
   - Check console regularly
   - Monitor Supabase logs
   - Monitor RevenueCat dashboard

3. **Keep Updated:**
   - Update dependencies regularly
   - Follow Expo updates
   - Check for security patches

4. **Use Version Control:**
   - Commit working code
   - Use branches for features
   - Tag releases

---

## 🎉 Success!

If you've fixed your issue:
- Document the solution
- Update this guide if needed
- Share with the team
- Continue building! 🚀
