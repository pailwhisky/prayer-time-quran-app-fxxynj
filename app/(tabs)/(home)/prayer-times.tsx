
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { PrayerCalculator, PrayerTimesData, PrayerTime } from '@/utils/prayerTimes';
import PrayerTimeItem from '@/components/PrayerTimeItem';
import QuoteDisplay from '@/components/QuoteDisplay';
import QiblaCompass from '@/components/QiblaCompass';
import NavigationHeader from '@/components/NavigationHeader';

export default function PrayerTimesScreen() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);
  const [showQibla, setShowQibla] = useState(false);

  const setupNotifications = useCallback(async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('prayer-times', {
          name: 'Prayer Times',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: colors.primary,
        });
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      console.log('Notifications setup complete');
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  }, []);

  const initializeApp = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Required',
          'This app needs your location to calculate accurate prayer times.',
          [{ text: 'OK' }]
        );
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(locationData);

      const calculator = new PrayerCalculator(
        locationData.coords.latitude,
        locationData.coords.longitude
      );
      const times = calculator.getTodayPrayerTimes();
      setPrayerTimes(times);

      console.log('Prayer times initialized:', times);
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    }
  }, []);

  useEffect(() => {
    initializeApp();
    setupNotifications();
  }, [initializeApp, setupNotifications]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!prayerTimes) return;

    const now = new Date();
    const prayers: PrayerTime[] = [
      prayerTimes.fajr,
      prayerTimes.dhuhr,
      prayerTimes.asr,
      prayerTimes.maghrib,
      prayerTimes.isha,
    ];

    let foundNext = false;
    for (const prayer of prayers) {
      if (prayer.time > now) {
        setNextPrayer(prayer.name);
        foundNext = true;
        break;
      }
    }

    if (!foundNext) {
      setNextPrayer('fajr');
    }
  }, [prayerTimes, currentTime]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await initializeApp();
    setRefreshing(false);
  }, [initializeApp]);

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getLocationString = () => {
    if (!location) return 'Getting location...';
    return `${location.coords.latitude.toFixed(2)}°, ${location.coords.longitude.toFixed(2)}°`;
  };

  const isBeforeFirstPrayer = () => {
    if (!prayerTimes) return false;
    return currentTime < prayerTimes.fajr.time;
  };

  const isAfterLastPrayer = () => {
    if (!prayerTimes) return false;
    return currentTime > prayerTimes.isha.time;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <NavigationHeader
        title="Prayer Times"
        showBack={false}
        showClose={false}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.currentTime}>{formatCurrentTime()}</Text>
          <Text style={styles.location}>{getLocationString()}</Text>
        </View>

        {(isBeforeFirstPrayer() || isAfterLastPrayer()) && (
          <QuoteDisplay />
        )}

        {prayerTimes && (
          <View style={styles.prayerTimesContainer}>
            <PrayerTimeItem
              prayer={prayerTimes.fajr}
              isNext={nextPrayer === 'fajr'}
            />
            <PrayerTimeItem
              prayer={prayerTimes.dhuhr}
              isNext={nextPrayer === 'dhuhr'}
            />
            <PrayerTimeItem
              prayer={prayerTimes.asr}
              isNext={nextPrayer === 'asr'}
            />
            <PrayerTimeItem
              prayer={prayerTimes.maghrib}
              isNext={nextPrayer === 'maghrib'}
            />
            <PrayerTimeItem
              prayer={prayerTimes.isha}
              isNext={nextPrayer === 'isha'}
            />
          </View>
        )}

        {/* Add bottom padding to prevent content from being hidden by floating tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {location && (
        <QiblaCompass
          visible={showQibla}
          onClose={() => setShowQibla(false)}
          latitude={location.coords.latitude}
          longitude={location.coords.longitude}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  currentTime: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  prayerTimesContainer: {
    marginTop: 16,
  },
  bottomSpacer: {
    height: 120, // Space for floating tab bar
  },
});
