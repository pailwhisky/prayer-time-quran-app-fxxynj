
# 🚀 Prayer Times App - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional but Recommended)

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

**Get your free API key:** https://makersuite.google.com/app/apikey

**Note:** The app works without this key, but AI features will use fallback content.

### 3. Start Development Server
```bash
npm run dev
```

This will start the Expo development server with tunnel mode enabled.

### 4. Open on Your Device

- **iOS:** Scan QR code with Camera app
- **Android:** Scan QR code with Expo Go app
- **Web:** Press `w` in terminal

---

## 📱 Features Overview

### **Free Features (No Subscription Required):**
- ✅ Accurate prayer times based on your location
- ✅ Qibla direction finder
- ✅ Daily Quran quotes with Arabic text
- ✅ Prayer time notifications
- ✅ Beautiful Islamic UI design

### **Premium Features ($4.99/month):**
- ✅ Full Quran reader with search
- ✅ Daily Hadith with explanations
- ✅ Mosque finder with directions
- ✅ Dua library with audio
- ✅ Hijri calendar with events
- ✅ Spiritual progress tracker
- ✅ Advanced notification settings
- ✅ Multiple Adhan sounds
- ✅ Fasting tracker
- ✅ Hajj/Umrah guides

### **Ultra Features ($9.99/month):**
- ✅ AI Islamic chatbot (powered by Gemini)
- ✅ AI-enhanced Quran quotes with context
- ✅ Personalized spiritual advice
- ✅ Islamic knowledge quizzes
- ✅ Recitation feedback (coming soon)
- ✅ Priority support

---

## 🔧 Troubleshooting

### **Location Not Working:**
1. Ensure location services are enabled on your device
2. Grant location permission when prompted
3. Try restarting the app
4. Check if location works in other apps

### **Notifications Not Appearing:**
1. Grant notification permission when prompted
2. Check device notification settings
3. Ensure "Do Not Disturb" is off during prayer times
4. Restart the app to reschedule notifications

### **Compass Not Accurate:**
1. Calibrate your device compass (figure-8 motion)
2. Move away from magnetic interference
3. Ensure sensor permissions are granted
4. Try restarting the app

### **AI Features Not Working:**
1. Check if GOOGLE_AI_API_KEY is configured in `.env`
2. Verify API key is valid
3. Check internet connection
4. App will use fallback content if AI is unavailable

---

## 🗄️ Database Setup

The app uses Supabase for backend services. The database is already configured with:

- **Subscription tiers** (Free, Premium, Ultra)
- **26 subscription features** properly categorized
- **Sample mosques** for mosque finder
- **Sample duas** for dua library
- **Hijri events** for Islamic calendar
- **RLS policies** for data security

No additional database setup required!

---

## 🎨 Customization

### **Colors:**
Edit `styles/commonStyles.ts` to customize the color scheme:

```typescript
export const colors = {
  background: '#F5F5DC',      // Soft Beige
  text: '#004643',            // Deep Teal
  textSecondary: '#006B5F',   // Quran Green
  primary: '#004643',         // Deep Teal
  secondary: '#D4A373',       // Light Brown
  accent: '#D4A373',          // Light Brown
  card: '#FFFFFF',            // White
  highlight: '#E07A5F',       // Burnt Orange
};
```

### **Prayer Calculation Method:**
The app uses astronomical calculations. To adjust:

Edit `utils/prayerTimes.ts` and modify the angle constants:
- Fajr: -18° (can be adjusted to -15° or -12°)
- Isha: -18° (can be adjusted to -15° or -12°)

---

## 📦 Building for Production

### **iOS:**
```bash
eas build --platform ios
```

### **Android:**
```bash
eas build --platform android
```

### **Web:**
```bash
npm run build:web
```

---

## 🧪 Testing

### **Manual Testing Checklist:**

1. **Prayer Times:**
   - [ ] Location permission granted
   - [ ] Prayer times displayed correctly
   - [ ] Next prayer highlighted
   - [ ] Times update at midnight

2. **Notifications:**
   - [ ] Permission granted
   - [ ] Notifications scheduled
   - [ ] Notifications appear at prayer time
   - [ ] Sound plays

3. **Qibla:**
   - [ ] Compass initializes
   - [ ] Arrow points correctly
   - [ ] Smooth rotation
   - [ ] Distance calculated

4. **Navigation:**
   - [ ] Tab bar visible
   - [ ] Smooth transitions
   - [ ] Active tab highlighted
   - [ ] Back buttons work

5. **Premium Features:**
   - [ ] Feature gating works
   - [ ] Subscription modal appears
   - [ ] Upgrade process works
   - [ ] Features unlock after upgrade

---

## 📞 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the code comments
3. Check console logs for errors
4. Verify all permissions are granted

---

## 🎯 Development Tips

### **Hot Reload:**
- Save any file to see changes instantly
- Shake device to open developer menu
- Press `r` in terminal to reload

### **Debugging:**
- Check console logs in terminal
- Use React DevTools for component inspection
- Enable remote debugging for breakpoints

### **Performance:**
- Use React DevTools Profiler
- Monitor re-renders
- Check for memory leaks

---

## 📚 Resources

- **Expo Documentation:** https://docs.expo.dev
- **React Native:** https://reactnative.dev
- **Supabase:** https://supabase.com/docs
- **Google AI:** https://ai.google.dev/docs

---

## ✨ Contributing

To contribute to this project:

1. Follow the existing code style
2. Add comments for complex logic
3. Test thoroughly before committing
4. Keep files under 500 lines
5. Use TypeScript types

---

**May Allah (SWT) accept this work and make it beneficial for the Muslim Ummah. Ameen.**

🕌 Built with love for the Muslim community
