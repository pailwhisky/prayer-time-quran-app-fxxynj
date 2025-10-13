
# Prayer Times - Islamic Companion App

A comprehensive Islamic mobile application built with React Native and Expo, featuring prayer times, Qibla direction, Quran reader, and AI-powered Islamic content.

## 🌟 Features

### Core Features (Free)
- **Accurate Prayer Times**: Automatic calculation based on your location
- **Qibla Compass**: Find the direction to Mecca with ease
- **Quran Reader**: Read and bookmark verses from the Holy Quran
- **Daily Quotes**: Inspirational verses from the Quran
- **Prayer Notifications**: Get notified when it's time to pray

### Premium Features
- **Advanced Notifications**: Customizable prayer reminders
- **Mosque Finder**: Locate nearby mosques with directions
- **Hijri Calendar**: Islamic calendar with important dates
- **Dua Library**: Collection of authentic Islamic supplications
- **Spiritual Progress Tracker**: Track your prayers, Quran reading, and more
- **AR Qibla Compass**: Augmented reality compass for Qibla direction
- **Adhan Player**: Listen to beautiful Adhan from around the world

### Ultra Features
- **AI Islamic Assistant**: Ask questions about Islam powered by Gemini AI
- **Daily Hadith**: Authentic Hadith with AI-powered explanations
- **Enhanced Quotes**: AI-generated insights on Quranic verses
- **Sadaqah Tracking**: Track your charitable donations

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (macOS) or Android Emulator

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd prayer-times-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Google AI API key:
```env
EXPO_PUBLIC_GOOGLE_AI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Run on your device:
- **iOS**: `npm run ios`
- **Android**: `npm run android`
- **Web**: `npm run web`

For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md).

## 📱 Tech Stack

- **Framework**: React Native with Expo 54
- **Navigation**: Expo Router (file-based routing)
- **Database**: Supabase (PostgreSQL with RLS)
- **AI**: Google Gemini AI
- **Animations**: React Native Reanimated
- **State Management**: React Context API
- **Styling**: StyleSheet with custom theme

## 🏗️ Project Structure

```
├── app/                      # Expo Router pages
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── (home)/          # Home stack
│   │   ├── quran.tsx        # Quran reader
│   │   ├── premium.tsx      # Premium features
│   │   └── profile.tsx      # Profile & settings
│   ├── _layout.tsx          # Root layout
│   └── integrations/        # Supabase integration
├── components/              # Reusable components
│   ├── QiblaCompass.tsx
│   ├── ARQiblaCompass.tsx
│   ├── FloatingTabBar.tsx
│   └── ...
├── contexts/                # React contexts
│   └── SubscriptionContext.tsx
├── utils/                   # Utility functions
│   ├── prayerTimes.ts
│   ├── geminiService.ts
│   └── quranQuotes.ts
├── styles/                  # Shared styles
│   └── commonStyles.ts
└── assets/                  # Images, fonts, etc.
```

## 🎨 Design System

The app uses a carefully crafted color palette inspired by Islamic art:

- **Primary**: Deep Teal (#004643) - Represents spirituality and peace
- **Accent**: Warm Gold (#D4A373) - Represents enlightenment
- **Highlight**: Coral (#E07A5F) - Represents warmth and community
- **Background**: Beige (#F5F5DC) - Represents purity and simplicity

## 🔐 Security

- All API keys are stored in environment variables
- Supabase RLS (Row Level Security) enabled on all tables
- User data is protected by authentication
- No sensitive data exposed in client code

## 📊 Database Schema

The app uses Supabase with the following main tables:

- `subscription_tiers` - Subscription plans
- `subscription_features` - Feature definitions
- `user_subscriptions` - User subscription data
- `mosques` - Mosque locations
- `duas` - Islamic supplications
- `hijri_events` - Islamic calendar events
- `spiritual_progress` - User spiritual tracking
- `quran_bookmarks` - User bookmarks

All tables have RLS policies to protect user data.

## 🧪 Testing

### Manual Testing
- Prayer time calculations verified
- Qibla compass tested on real devices
- All navigation flows tested
- Premium features gated correctly
- Notifications working properly

### Known Issues
- None critical

For the complete testing checklist, see [DISTRIBUTION_CHECKLIST.md](DISTRIBUTION_CHECKLIST.md).

## 📦 Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

### Web
```bash
npm run build:web
```

For detailed build instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md).

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Prayer time calculations based on astronomical formulas
- Qibla direction calculated using geodesic formulas
- AI features powered by Google Gemini
- Database and authentication by Supabase
- Icons from Expo Symbols

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Check the [SETUP_GUIDE.md](SETUP_GUIDE.md)
- Review the [DISTRIBUTION_CHECKLIST.md](DISTRIBUTION_CHECKLIST.md)

## 🗺️ Roadmap

- [ ] Add more languages
- [ ] Implement offline mode
- [ ] Add social features
- [ ] Integrate with wearables
- [ ] Add more Quran translations
- [ ] Implement Tajweed coloring
- [ ] Add Quran audio recitations

---

**May this app help Muslims around the world in their spiritual journey. 🕌**

*Built with ❤️ for the Muslim community*
