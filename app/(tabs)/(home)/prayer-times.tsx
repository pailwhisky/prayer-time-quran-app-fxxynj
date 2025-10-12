
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

// Configure notifications
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
  const [prayers, setPrayers] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showQibla, setShowQibla] = useState(false);

  const requestLocationPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'This app needs location access to calculate accurate prayer times for your area.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: requestLocationPermission },
        ]
      );
      throw new Error('Location permission denied');
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setLocation(locationData);
      console.log('Location obtained:', locationData.coords);
      
      // Calculate prayer times
      const times = PrayerCalculator.calculatePrayerTimes(
        locationData.coords.latitude,
        locationData.coords.longitude
      );
      
      setPrayerTimes(times);
      console.log('Prayer times calculated:', times);
      
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please ensure location services are enabled.',
        [{ text: 'Retry', onPress: getCurrentLocation }]
      );
    }
  }, []);

  const scheduleNotifications = useCallback(async () => {
    try {
      // Cancel existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      if (!prayerTimes) return;

      const prayerList = PrayerCalculator.getPrayerTimesList(prayerTimes);
      
      for (const prayer of prayerList) {
        if (prayer.time > new Date()) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${prayer.name} Prayer Time`,
              body: `It's time for ${prayer.name} prayer (${prayer.arabicName})`,
              sound: true,
            },
            trigger: {
              date: prayer.time,
            },
          });
        }
      }
      
      console.log('Prayer notifications scheduled');
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }, [prayerTimes]);

  const setupNotifications = useCallback(async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
        return;
      }

      // Schedule notifications for prayer times
      if (prayerTimes) {
        await scheduleNotifications();
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  }, [prayerTimes, scheduleNotifications]);

  const initializeApp = useCallback(async () => {
    try {
      await requestLocationPermission();
      await getCurrentLocation();
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Error', 'Failed to initialize the app. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [requestLocationPermission, getCurrentLocation]);

  useEffect(() => {
    initializeApp();
    setupNotifications();
    
    // Update current time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, [initializeApp, setupNotifications]);

  useEffect(() => {
    if (prayerTimes) {
      const updatedPrayers = PrayerCalculator.getPrayerTimesList(prayerTimes);
      setPrayers(updatedPrayers);
    }
  }, [prayerTimes, currentTime]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getCurrentLocation();
      if (prayerTimes) {
        await scheduleNotifications();
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrentTime = (): string => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const getLocationString = (): string => {
    if (!location) return 'Location not available';
    
    const { latitude, longitude } = location.coords;
    return `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
  };

  const isBeforeFirstPrayer = (): boolean => {
    if (!prayers.length) return false;
    return currentTime < prayers[0].time;
  };

  const isAfterLastPrayer = (): boolean => {
    if (!prayers.length) return false;
    return currentTime > prayers[prayers.length - 1].time;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Calculating prayer times...</Text>
          <Text style={styles.loadingSubtext}>Getting your location</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Prayer Times',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <SafeAreaView style={styles.container}>
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
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.currentTime}>{formatCurrentTime()}</Text>
            <Text style={styles.location}>📍 {getLocationString()}</Text>
            <Text style={styles.date}>
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          {/* Quote Section */}
          <QuoteDisplay
            isBeforeFirstPrayer={isBeforeFirstPrayer()}
            isAfterLastPrayer={isAfterLastPrayer()}
            shouldRefresh={refreshing}
          />

          {/* Prayer Times Section */}
          <View style={styles.prayerTimesSection}>
            <Text style={styles.sectionTitle}>Today's Prayer Times</Text>
            {prayers.map((prayer, index) => (
              <PrayerTimeItem key={`${prayer.name}-${index}`} prayer={prayer} />
            ))}
          </View>

          {/* Qibla Section */}
          {location && (
            <View style={styles.qiblaSection}>
              <QiblaCompass
                latitude={location.coords.latitude}
                longitude={location.coords.longitude}
              />
            </View>
          )}

          {/* Bottom spacing for tab bar */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </>
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
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  currentTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  prayerTimesSection: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  qiblaSection: {
    marginVertical: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 4px 8px ${colors.shadow}`,
    elevation: 3,
  },
  bottomSpacing: {
    height: Platform.OS === 'ios' ? 20 : 100,
  },
});
