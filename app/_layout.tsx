
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme, Platform } from 'react-native';
import {
  Amiri_400Regular,
  Amiri_700Bold,
} from '@expo-google-fonts/amiri';
import {
  NotoSansArabic_400Regular,
  NotoSansArabic_700Bold,
} from '@expo-google-fonts/noto-sans-arabic';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import * as Notifications from 'expo-notifications';
import { logger, logInfo, logError } from '@/utils/productionLogger';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { validateEnvironment } from '@/utils/environmentValidator';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Amiri_400Regular,
    Amiri_700Bold,
    NotoSansArabic_400Regular,
    NotoSansArabic_700Bold,
  });
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    const startTime = Date.now();
    
    try {
      logInfo('🚀 Initializing app...');

      // Validate environment configuration
      try {
        validateEnvironment();
        logInfo('✅ Environment validated');
      } catch (error) {
        logError('❌ Environment validation failed', error as Error);
        // Continue anyway in development
        if (!__DEV__) {
          throw error;
        }
      }

      // Set up notification categories
      await setupNotificationCategories();

      // Track startup time
      const duration = Date.now() - startTime;
      performanceMonitor.trackStartup(duration);
      logInfo(`✅ App initialized in ${duration}ms`);

      setAppReady(true);
    } catch (error) {
      logError('❌ App initialization failed', error as Error);
      setAppReady(true); // Still show app with error boundary
    }
  };

  const setupNotificationCategories = async () => {
    if (Platform.OS === 'ios') {
      try {
        await Notifications.setNotificationCategoryAsync('prayer-reminder', [
          {
            identifier: 'view',
            buttonTitle: 'View',
            options: {
              opensAppToForeground: true,
            },
          },
          {
            identifier: 'dismiss',
            buttonTitle: 'Dismiss',
            options: {
              opensAppToForeground: false,
            },
          },
        ]);
        logInfo('✅ iOS notification categories set up');
      } catch (error) {
        logError('❌ Error setting up notification categories', error as Error);
      }
    }
  };

  useEffect(() => {
    if (loaded && appReady) {
      SplashScreen.hideAsync();
      logInfo('✅ Splash screen hidden');
    }
  }, [loaded, appReady]);

  if (!loaded || !appReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SubscriptionProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="surah/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="transparent-modal" options={{ presentation: 'transparentModal' }} />
            <Stack.Screen name="formsheet" options={{ presentation: 'formSheet' }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </SubscriptionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
