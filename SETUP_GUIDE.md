
# Prayer Times App - Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Git
- A code editor (VS Code recommended)

For mobile development:
- **iOS**: macOS with Xcode installed
- **Android**: Android Studio with Android SDK

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd prayer-times-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file and add your API keys:

```env
# Google AI API Key for Gemini AI features
EXPO_PUBLIC_GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

**Getting a Google AI API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env` file

**Note:** The API is **FREE** with generous quotas (60 requests/min, 1,500/day). No credit card required!

For detailed Gemini AI setup instructions, see [GEMINI_INTEGRATION_GUIDE.md](./GEMINI_INTEGRATION_GUIDE.md)

### 4. Configure Supabase

The app uses Supabase for backend services. The configuration is already set up in `app/integrations/supabase/client.ts`.

**Supabase Project Details:**
- Project URL: `https://asuhklwnekgmfdfvjxms.supabase.co`
- Project ID: `asuhklwnekgmfdfvjxms`

The database tables are already created and configured with RLS policies.

### 5. Start the Development Server

```bash
npm run dev
```

This will start the Expo development server with tunnel mode enabled.

### 6. Run on Your Device

**Option A: Expo Go App (Easiest)**
1. Install Expo Go on your iOS or Android device
2. Scan the QR code shown in the terminal
3. The app will load on your device

**Option B: iOS Simulator**
```bash
npm run ios
```

**Option C: Android Emulator**
```bash
npm run android
```

**Option D: Web Browser**
```bash
npm run web
```

## 🤖 Gemini AI Integration

This app uses **Google's Gemini AI** to provide enhanced Islamic content. The integration includes:

### AI-Powered Features

1. **Enhanced Quran Quotes**
   - Historical context for verses
   - Modern-day reflections
   - Deeper spiritual insights

2. **Islamic Q&A Chatbot**
   - Ask questions about Islam
   - Get answers with references
   - Based on Quran and Hadith

3. **Daily Hadith**
   - Authentic Hadith with AI explanations
   - Practical applications
   - Daily spiritual inspiration

4. **Spiritual Guidance**
   - Personalized duas
   - Prayer reflections
   - Compassionate advice

### Testing AI Features

After setting up your API key:

1. Open the app
2. Go to **Profile & Settings** tab
3. Tap **"Gemini AI Setup"**
4. Tap **"Test API Connection"**
5. You should see a success message ✅

### Troubleshooting AI Features

If AI features aren't working:

- Verify `EXPO_PUBLIC_GOOGLE_AI_API_KEY` is set in `.env`
- Restart the app after adding the key
- Check console logs for error messages
- Use the built-in test feature in the app

For complete Gemini AI documentation, see [GEMINI_INTEGRATION_GUIDE.md](./GEMINI_INTEGRATION_GUIDE.md)

## 🔧 Configuration

### App Configuration

Edit `app.json` to customize:
- App name
- Bundle identifier (iOS) / Package name (Android)
- App icon
- Splash screen
- Permissions

### Color Scheme

The app's color scheme is defined in `styles/commonStyles.ts`:

```typescript
export const colors = {
  background: '#F5F5DC',  // Beige
  card: '#FFFFFF',        // White
  text: '#2C3E50',        // Dark gray
  textSecondary: '#7F8C8D', // Medium gray
  primary: '#004643',     // Deep teal
  accent: '#D4A373',      // Warm gold
  highlight: '#E07A5F',   // Coral
  // ... more colors
};
```

## 📱 Features Overview

### Core Features
- **Prayer Times**: Automatic calculation based on location
- **Qibla Compass**: Standard and AR compass for Qibla direction
- **Quran Reader**: Read and bookmark Quranic verses
- **AI Integration**: Gemini AI for quotes, Q&A, and hadith
- **Premium Features**: Subscription-based advanced features
- **Spiritual Tracking**: Track prayers, Quran reading, and more

### Premium Features
- Advanced notifications
- Mosque finder
- Hijri calendar
- Dua library
- Spiritual progress tracker
- Sadaqah donation tracking
- AR Qibla compass
- Adhan player

## 🗄️ Database Schema

The app uses Supabase with the following main tables:

- `subscription_tiers`: Subscription plans (free, premium, ultra)
- `subscription_features`: Feature definitions
- `user_subscriptions`: User subscription data
- `mosques`: Mosque locations and information
- `duas`: Collection of Islamic supplications
- `hijri_events`: Islamic calendar events
- `spiritual_progress`: User spiritual tracking data
- `quran_bookmarks`: User Quran bookmarks

All tables have RLS (Row Level Security) enabled.

## 🔐 Security

### Environment Variables
- Never commit `.env` file to version control
- Use `.env.example` as a template
- Keep API keys secure

### Supabase Security
- RLS policies are enabled on all tables
- User data is protected by authentication
- API keys are properly secured

### Gemini AI Security
- API key stored locally on device
- Direct communication with Google servers
- No data logged by the app
- Real-time AI responses

## 🧪 Testing

### Manual Testing Checklist

1. **Prayer Times**
   - [ ] Location permission requested
   - [ ] Prayer times calculated correctly
   - [ ] Times update at midnight
   - [ ] Next prayer highlighted

2. **Qibla Compass**
   - [ ] Sensor permission requested
   - [ ] Compass rotates smoothly
   - [ ] Direction accurate
   - [ ] AR mode works

3. **Quran Reader**
   - [ ] Surahs load correctly
   - [ ] Bookmarks save
   - [ ] Search works
   - [ ] Arabic text displays properly

4. **AI Features**
   - [ ] API key configured
   - [ ] Enhanced quotes load
   - [ ] Chatbot responds
   - [ ] Daily Hadith generates
   - [ ] Test connection works

5. **Notifications**
   - [ ] Permission requested
   - [ ] Notifications scheduled
   - [ ] Notifications fire at correct times
   - [ ] Notification sound plays

6. **Premium Features**
   - [ ] Subscription modal shows
   - [ ] Feature gating works
   - [ ] Upgrade flow works

## 📦 Building for Production

### iOS Build

1. **Configure EAS Build**
```bash
npm install -g eas-cli
eas login
eas build:configure
```

2. **Build for iOS**
```bash
eas build --platform ios
```

3. **Submit to App Store**
```bash
eas submit --platform ios
```

### Android Build

1. **Build for Android**
```bash
eas build --platform android
```

2. **Submit to Play Store**
```bash
eas submit --platform android
```

### Web Build

```bash
npm run build:web
```

The build output will be in the `dist` folder.

## 🐛 Troubleshooting

### Common Issues

**Issue: "Gemini AI not working"**
- Solution: Check that `EXPO_PUBLIC_GOOGLE_AI_API_KEY` is set in `.env`
- Verify the API key is valid
- Restart the app after adding the key
- Use the "Test API Connection" feature in Profile & Settings
- Check console for error messages (look for 🤖 emoji logs)

**Issue: "Location not detected"**
- Solution: Ensure location permissions are granted
- Check device location services are enabled
- Try on a real device (simulators may have issues)

**Issue: "Compass not working"**
- Solution: Test on a real device (simulators don't have magnetometer)
- Ensure sensor permissions are granted
- Calibrate device compass

**Issue: "Notifications not firing"**
- Solution: Check notification permissions
- Verify notifications are scheduled (check console logs)
- Test on real device (simulators may not support all notification features)

**Issue: "Database errors"**
- Solution: Check Supabase connection
- Verify RLS policies
- Check console for specific error messages

### Getting Help

- Check the console logs for error messages
- Review the `DISTRIBUTION_CHECKLIST.md` for known issues
- Check `GEMINI_INTEGRATION_GUIDE.md` for AI-specific issues
- Check Expo documentation: https://docs.expo.dev
- Check Supabase documentation: https://supabase.com/docs
- Check Google AI documentation: https://ai.google.dev/docs

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Google AI Documentation](https://ai.google.dev/docs)
- [Gemini API Setup](https://ai.google.dev/tutorials/setup)
- [React Navigation](https://reactnavigation.org)

## 🔄 Updates and Maintenance

### Updating Dependencies

```bash
npm update
```

### Checking for Outdated Packages

```bash
npm outdated
```

### Updating Expo SDK

```bash
npx expo install --fix
```

## 📝 Development Workflow

1. Create a new branch for features
2. Make changes and test thoroughly
3. Test AI features if modified
4. Commit with descriptive messages
5. Push to repository
6. Create pull request
7. Review and merge

## 🎨 Customization

### Changing App Name
Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
```

### Changing Colors
Edit `styles/commonStyles.ts`:
```typescript
export const colors = {
  primary: '#YOUR_COLOR',
  // ... other colors
};
```

### Adding New Features
1. Create component in `components/` folder
2. Add route in `app/` folder if needed
3. Update navigation if needed
4. Add to premium features if applicable
5. Update database schema if needed
6. Add AI integration if applicable

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All features tested
- [ ] AI features working (test with API key)
- [ ] No console errors
- [ ] Environment variables configured
- [ ] App icons and splash screen set
- [ ] Privacy policy created (mention AI usage)
- [ ] Terms of service created
- [ ] App store assets prepared
- [ ] Version number updated
- [ ] Build successful
- [ ] Beta testing completed
- [ ] API key instructions in app store description

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation
- Review the Gemini Integration Guide

## 🔑 Important Notes

### API Keys
- Keep your `.env` file secure
- Never share API keys publicly
- Regenerate keys if compromised
- Monitor API usage in Google AI Studio

### AI Content Disclaimer
- AI responses are for guidance only
- Always verify important religious matters with scholars
- AI should complement, not replace, traditional Islamic learning

---

**Happy Coding! 🎉**

May this app help Muslims around the world in their spiritual journey. 🕌
