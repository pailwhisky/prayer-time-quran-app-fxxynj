
import QiblaCompass from '@/components/QiblaCompass';
import NavigationHeader from '@/components/NavigationHeader';
import QuoteDisplay from '@/components/QuoteDisplay';
import PrayerTimeItem from '@/components/PrayerTimeItem';
import * as Location from 'expo-location';
import { PrayerCalculator, PrayerTimesData, PrayerTime } from '@/utils/prayerTimes';
import { colors } from '@/styles/commonStyles';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function PrayerTimesScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState(false);

  // Schedule notifications for prayer times
  const schedulePrayerNotifications = useCallback(async (times: PrayerTimesData) => {
    try {
      // Cancel all existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🔔 Scheduling prayer notifications...');

      const prayers = PrayerCalculator.getPrayerTimesList(times);
      
      for (const prayer of prayers) {
        const now = new Date();
        if (prayer.time > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${prayer.name} Prayer Time`,
              body: `It's time for ${prayer.name} prayer (${prayer.arabicName})`,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: {
              date: prayer.time,
            },
          });
          console.log(`✅ Notification scheduled for ${prayer.name} at ${prayer.time.toLocaleTimeString()}`);
        }
      }
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }, []);

  // Request notification permissions
  const requestNotificationPermissions = useCallback(async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus === 'granted') {
        console.log('✅ Notification permissions granted');
        setNotificationPermission(true);
      } else {
        console.log('⚠️ Notification permissions denied');
        setNotificationPermission(false);
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  }, []);

  // Request location and load prayer times
  const requestLocationAndLoadPrayerTimes = useCallback(async () => {
    try {
      setLoading(true);
      setLocationError(null);
      console.log('📍 Requesting location permission...');

      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationError('Location permission is required to calculate accurate prayer times.');
        Alert.alert(
          'Location Permission Required',
          'This app needs your location to provide accurate prayer times for your area.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      console.log('✅ Location permission granted, getting current location...');
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      console.log('📍 Location obtained:', currentLocation.coords.latitude, currentLocation.coords.longitude);
      setLocation(currentLocation);

      // Calculate prayer times
      const times = PrayerCalculator.calculatePrayerTimes(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
      
      console.log('🕌 Prayer times calculated:', times);
      setPrayerTimes(times);

      // Schedule notifications for prayer times
      if (notificationPermission) {
        await schedulePrayerNotifications(times);
      }
    } catch (error) {
      console.error('Error getting location or calculating prayer times:', error);
      setLocationError('Unable to get your location. Please check your device settings.');
      Alert.alert(
        'Error',
        'Unable to get your location. Please ensure location services are enabled.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [notificationPermission, schedulePrayerNotifications]);

  // Initialize on mount
  useEffect(() => {
    requestNotificationPermissions();
    requestLocationAndLoadPrayerTimes();
  }, []);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Recalculate next prayer when time changes
  useEffect(() => {
    if (prayerTimes && location) {
      const updatedTimes = PrayerCalculator.calculatePrayerTimes(
        location.coords.latitude,
        location.coords.longitude
      );
      setPrayerTimes(updatedTimes);
    }
  }, [currentTime]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    requestLocationAndLoadPrayerTimes();
  }, [requestLocationAndLoadPrayerTimes]);

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getLocationString = () => {
    if (!location) return 'Loading location...';
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

  if (loading && !prayerTimes) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Stack.Screen options={{ headerShown: false }} />
        <NavigationHeader title="Prayer Times" showBack={false} showClose={false} />
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🕌</Text>
          <Text style={styles.loadingTitle}>Loading Prayer Times</Text>
          <Text style={styles.loadingSubtitle}>Getting your location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (locationError && !prayerTimes) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Stack.Screen options={{ headerShown: false }} />
        <NavigationHeader title="Prayer Times" showBack={false} showClose={false} />
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>📍</Text>
          <Text style={styles.errorTitle}>Location Required</Text>
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Current Time Display */}
        <View style={styles.timeCard}>
          <Text style={styles.currentTime}>{formatCurrentTime()}</Text>
          <Text style={styles.locationText}>{getLocationString()}</Text>
          {!notificationPermission && (
            <Text style={styles.notificationWarning}>
              ⚠️ Enable notifications to receive prayer reminders
            </Text>
          )}
        </View>

        {/* Quran Quote */}
        <QuoteDisplay 
          timing={isBeforeFirstPrayer() ? 'before' : isAfterLastPrayer() ? 'after' : 'general'}
        />

        {/* Prayer Times List */}
        {prayerTimes && (
          <View style={styles.prayerTimesContainer}>
            <Text style={styles.sectionTitle}>Today&apos;s Prayer Times</Text>
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

        {/* Qibla Compass */}
        {location && (
          <View style={styles.qiblaSection}>
            <Text style={styles.sectionTitle}>Qibla Direction</Text>
            <QiblaCompass
              latitude={location.coords.latitude}
              longitude={location.coords.longitude}
              visible={true}
            />
          </View>
        )}

        {/* Bottom spacer for floating tab bar */}
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
    padding: 40,
  },
  loadingText: {
    fontSize: 64,
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  timeCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 4px 8px ${colors.shadow}`,
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
  notificationWarning: {
    fontSize: 12,
    color: colors.highlight,
    marginTop: 8,
    textAlign: 'center',
  },
  prayerTimesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  qiblaSection: {
    marginBottom: 24,
  },
  bottomSpacer: {
    height: 120,
  },
});
