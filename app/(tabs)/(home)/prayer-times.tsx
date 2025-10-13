
import QiblaCompass from '@/components/QiblaCompass';
import NavigationHeader from '@/components/NavigationHeader';
import QuoteDisplay from '@/components/QuoteDisplay';
import PrayerTimeItem from '@/components/PrayerTimeItem';
import * as Location from 'expo-location';
import { PrayerCalculator, PrayerTimesData, PrayerTime } from '@/utils/prayerTimes';
import { colors } from '@/styles/commonStyles';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { SafeAreaView } from 'react-native-safe-area-context';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function PrayerTimesScreen() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const initializeApp = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Initializing prayer times app...');

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'This app needs your location to calculate accurate prayer times.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      console.log('Getting current location...');
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLocation);
      console.log('Location obtained:', currentLocation.coords);

      const times = PrayerCalculator.calculatePrayerTimes(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        new Date()
      );
      setPrayerTimes(times);
      console.log('Prayer times calculated:', times);

      setLoading(false);
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Error', 'Failed to get location. Please try again.');
      setLoading(false);
    }
  }, []);

  const setupNotifications = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        console.log('Notifications not supported on web');
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permission not granted');
        return;
      }

      console.log('Notification permissions granted');
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  }, []);

  useEffect(() => {
    initializeApp();
    setupNotifications();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (prayerTimes && location) {
      const now = new Date();
      const prayers = PrayerCalculator.getPrayerTimesList(prayerTimes);
      
      prayers.forEach((prayer) => {
        if (prayer.isNext && prayer.time > now) {
          const timeUntil = prayer.time.getTime() - now.getTime();
          console.log(`Next prayer: ${prayer.name} in ${Math.floor(timeUntil / 60000)} minutes`);
        }
      });
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
      hour12: true,
    });
  };

  const getLocationString = () => {
    if (!location) return 'Getting location...';
    return `${location.coords.latitude.toFixed(2)}°, ${location.coords.longitude.toFixed(2)}°`;
  };

  const isBeforeFirstPrayer = () => {
    if (!prayerTimes) return false;
    const now = new Date();
    return now < prayerTimes.fajr.time;
  };

  const isAfterLastPrayer = () => {
    if (!prayerTimes) return false;
    const now = new Date();
    return now > prayerTimes.isha.time;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Stack.Screen options={{ headerShown: false }} />
        <NavigationHeader title="Prayer Times" showBack={false} showClose={false} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading prayer times...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <NavigationHeader title="Prayer Times" showBack={false} showClose={false} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.clockContainer}>
          <Text style={styles.currentTime}>{formatCurrentTime()}</Text>
          <Text style={styles.locationText}>{getLocationString()}</Text>
        </View>

        {isBeforeFirstPrayer() && (
          <QuoteDisplay timing="before" />
        )}

        {prayerTimes && (
          <View style={styles.prayerTimesContainer}>
            {PrayerCalculator.getPrayerTimesList(prayerTimes).map((prayer) => (
              <PrayerTimeItem
                key={prayer.name}
                name={prayer.name}
                arabicName={prayer.arabicName}
                time={prayer.time}
                isNext={prayer.isNext}
              />
            ))}
          </View>
        )}

        {isAfterLastPrayer() && (
          <QuoteDisplay timing="after" />
        )}

        {location && (
          <View style={styles.qiblaContainer}>
            <QiblaCompass
              latitude={location.coords.latitude}
              longitude={location.coords.longitude}
            />
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  clockContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0 4px 8px ${colors.shadow}`,
    elevation: 3,
  },
  currentTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  prayerTimesContainer: {
    marginBottom: 24,
  },
  qiblaContainer: {
    marginBottom: 24,
  },
  bottomSpacer: {
    height: 120,
  },
});
