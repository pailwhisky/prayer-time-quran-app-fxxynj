
import QiblaCompass from '@/components/QiblaCompass';
import NavigationHeader from '@/components/NavigationHeader';
import QuoteDisplay from '@/components/QuoteDisplay';
import PrayerTimeItem from '@/components/PrayerTimeItem';
import * as Location from 'expo-location';
import { PrayerCalculator, PrayerTimesData, PrayerTime } from '@/utils/prayerTimes';
import { colors } from '@/styles/commonStyles';
import { Stack, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as Notifications from 'expo-notifications';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function PrayerTimesScreen() {
  const navigation = useNavigation();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState(false);

  // Add close button to header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginRight: 12, padding: 4 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Close"
        >
          <IconSymbol name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Memoize screen options to prevent re-creation on every render
  const screenOptions = useMemo(() => ({ headerShown: false }), []);

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
  }, [requestNotificationPermissions, requestLocationAndLoadPrayerTimes]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [currentTime]);

  // Recalculate next prayer when time changes (but only update if needed)
  useEffect(() => {
    if (prayerTimes && location) {
      const updatedTimes = PrayerCalculator.calculatePrayerTimes(
        location.coords.latitude,
        location.coords.longitude
      );
      
      // Only update if the next prayer has changed
      const currentNextPrayer = PrayerCalculator.getPrayerTimesList(prayerTimes).find(p => p.isNext);
      const updatedNextPrayer = PrayerCalculator.getPrayerTimesList(updatedTimes).find(p => p.isNext);
      
      if (currentNextPrayer?.name !== updatedNextPrayer?.name) {
        console.log('🔄 Next prayer changed, updating prayer times');
        setPrayerTimes(updatedTimes);
      }
    }
  }, [currentTime, location, prayerTimes]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    requestLocationAndLoadPrayerTimes();
  }, [requestLocationAndLoadPrayerTimes]);

  const formatCurrentTime = useCallback(() => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, [currentTime]);

  const getLocationString = useCallback(() => {
    if (!location) return 'Loading location...';
    return `${location.coords.latitude.toFixed(2)}°, ${location.coords.longitude.toFixed(2)}°`;
  }, [location]);

  const isBeforeFirstPrayer = useCallback(() => {
    if (!prayerTimes) return false;
    const now = new Date();
    return now < prayerTimes.fajr.time;
  }, [prayerTimes]);

  const isAfterLastPrayer = useCallback(() => {
    if (!prayerTimes) return false;
    const now = new Date();
    return now > prayerTimes.isha.time;
  }, [prayerTimes]);

  if (loading && !prayerTimes) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Stack.Screen options={screenOptions} />
        <NavigationHeader title="Prayer Times" showBack={true} showClose={false} />
        
        <View style={styles.loadingContainer}>
          <View style={styles.loadingOrnament}>
            <Text style={styles.loadingIcon}>🕌</Text>
            <View style={styles.loadingBorder} />
          </View>
          <Text style={styles.loadingTitle}>Loading Prayer Times</Text>
          <Text style={styles.loadingSubtitle}>Getting your location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (locationError && !prayerTimes) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Stack.Screen options={screenOptions} />
        <NavigationHeader title="Prayer Times" showBack={true} showClose={false} />
        
        <View style={styles.errorContainer}>
          <View style={styles.errorOrnament}>
            <Text style={styles.errorIcon}>📍</Text>
            <View style={styles.errorBorder} />
          </View>
          <Text style={styles.errorTitle}>Location Required</Text>
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={screenOptions} />
      
      <NavigationHeader
        title="Prayer Times"
        showBack={true}
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
            tintColor={colors.gold}
            colors={[colors.gold]}
          />
        }
      >
        {/* Current Time Display with Islamic Design */}
        <View style={styles.timeCard}>
          <View style={styles.timeOrnamentTop}>
            <View style={styles.ornamentDot} />
            <View style={styles.ornamentLine} />
            <Text style={styles.ornamentStar}>✦</Text>
            <View style={styles.ornamentLine} />
            <View style={styles.ornamentDot} />
          </View>

          <Text style={styles.currentTime}>{formatCurrentTime()}</Text>
          <Text style={styles.locationText}>{getLocationString()}</Text>
          
          {!notificationPermission && (
            <View style={styles.notificationWarningContainer}>
              <Text style={styles.notificationWarning}>
                ⚠️ Enable notifications to receive prayer reminders
              </Text>
            </View>
          )}

          <View style={styles.timeOrnamentBottom}>
            <View style={styles.ornamentDot} />
            <View style={styles.ornamentLine} />
            <Text style={styles.ornamentStar}>✦</Text>
            <View style={styles.ornamentLine} />
            <View style={styles.ornamentDot} />
          </View>
        </View>

        {/* Quran Quote */}
        <QuoteDisplay 
          timing={isBeforeFirstPrayer() ? 'before' : isAfterLastPrayer() ? 'after' : 'general'}
        />

        {/* Prayer Times List */}
        {prayerTimes && (
          <View style={styles.prayerTimesContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionTitle}>Today&apos;s Prayer Times</Text>
              <View style={styles.sectionLine} />
            </View>
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
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionTitle}>Qibla Direction</Text>
              <View style={styles.sectionLine} />
            </View>
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
  loadingOrnament: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingIcon: {
    fontSize: 72,
    marginBottom: 12,
  },
  loadingBorder: {
    width: 100,
    height: 2,
    backgroundColor: colors.gold,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.5,
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
  errorOrnament: {
    alignItems: 'center',
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 72,
    marginBottom: 12,
  },
  errorBorder: {
    width: 100,
    height: 2,
    backgroundColor: colors.highlight,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  timeCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.gold,
    boxShadow: `0px 6px 12px ${colors.shadow}`,
    elevation: 4,
  },
  timeOrnamentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
    width: '100%',
  },
  timeOrnamentBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
    width: '100%',
  },
  ornamentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
  },
  ornamentLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gold,
  },
  ornamentStar: {
    fontSize: 16,
    color: colors.gold,
  },
  currentTime: {
    fontSize: 52,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: 1,
  },
  locationText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  notificationWarningContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notificationWarning: {
    fontSize: 12,
    color: colors.highlight,
    textAlign: 'center',
    fontWeight: '600',
  },
  prayerTimesContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sectionLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.gold,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  qiblaSection: {
    marginBottom: 24,
  },
  bottomSpacer: {
    height: 120,
  },
});
