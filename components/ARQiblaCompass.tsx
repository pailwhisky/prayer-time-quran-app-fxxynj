
import { getQiblaDirection } from '@/utils/prayerTimes';
import NavigationHeader from '@/components/NavigationHeader';
import { IconSymbol } from '@/components/IconSymbol';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { colors } from '@/styles/commonStyles';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface ARQiblaCompassProps {
  visible: boolean;
  onClose: () => void;
}

const COMPASS_SIZE = Dimensions.get('window').width * 0.8;

export default function ARQiblaCompass({ visible, onClose }: ARQiblaCompassProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [magnetometerAvailable, setMagnetometerAvailable] = useState<boolean | null>(null);

  const qiblaRotation = useSharedValue(0);
  const compassRotation = useSharedValue(0);
  
  const subscriptionRef = useRef<any>(null);
  const isMountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  // Cleanup magnetometer subscription
  const cleanupMagnetometer = useCallback(() => {
    if (subscriptionRef.current) {
      try {
        console.log('Cleaning up AR magnetometer subscription...');
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
        console.log('AR magnetometer subscription removed successfully');
      } catch (err) {
        console.error('Error removing AR magnetometer subscription:', err);
      }
    }
  }, []);

  // Setup magnetometer subscription
  const setupMagnetometer = useCallback(async () => {
    if (!isMountedRef.current) {
      console.log('Component unmounted, skipping magnetometer setup');
      return false;
    }

    try {
      console.log('Setting up AR magnetometer subscription...');
      
      // Check if magnetometer is available
      const isAvailable = await Magnetometer.isAvailableAsync();
      console.log('AR Magnetometer available:', isAvailable);
      
      if (!isAvailable) {
        setMagnetometerAvailable(false);
        setError('Magnetometer not available on this device');
        return false;
      }
      
      setMagnetometerAvailable(true);
      
      // Set update interval (100ms = 10Hz)
      await Magnetometer.setUpdateInterval(100);
      
      // Subscribe to magnetometer updates
      subscriptionRef.current = Magnetometer.addListener((data) => {
        if (!isMountedRef.current) {
          console.log('Component unmounted, ignoring magnetometer data');
          return;
        }

        try {
          const { x, y } = data;
          
          // Validate data
          if (isNaN(x) || isNaN(y)) {
            console.warn('Invalid magnetometer data received:', data);
            return;
          }

          // Calculate heading from magnetometer data
          let angle = Math.atan2(y, x) * (180 / Math.PI);
          angle = (angle + 360) % 360;
          
          setDeviceHeading(angle);
        } catch (err) {
          console.error('Error processing magnetometer data:', err);
        }
      });

      console.log('AR magnetometer subscription established successfully');
      retryCountRef.current = 0;
      return true;
    } catch (err) {
      console.error('Error setting up AR magnetometer:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Magnetometer error: ${errorMessage}`);
      
      // Retry logic
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        console.log(`Retrying AR magnetometer setup (${retryCountRef.current}/${MAX_RETRIES})...`);
        
        setTimeout(() => {
          if (isMountedRef.current) {
            setupMagnetometer();
          }
        }, 1000 * retryCountRef.current);
      }
      
      return false;
    }
  }, []);

  // Initialize compass with location and magnetometer
  const initializeCompass = useCallback(async () => {
    if (!isMountedRef.current) {
      console.log('Component unmounted, skipping initialization');
      return;
    }

    try {
      console.log('Initializing AR Qibla Compass...');
      setLoading(true);
      setError(null);

      // Request location permission
      console.log('Requesting location permission...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Location permission denied');
        setError('Location permission is required');
        Alert.alert(
          'Permission Required',
          'Location permission is required to determine Qibla direction.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      console.log('Location permission granted');

      // Get current location
      console.log('Getting current location...');
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      if (!isMountedRef.current) {
        console.log('Component unmounted during location fetch');
        return;
      }
      
      setLocation(currentLocation);
      console.log('Location obtained:', currentLocation.coords);

      // Calculate Qibla direction
      const direction = getQiblaDirection(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
      setQiblaDirection(direction);
      console.log('Qibla direction calculated:', direction);

      // Set up magnetometer
      const magnetometerSetup = await setupMagnetometer();
      
      if (!magnetometerSetup) {
        console.warn('Magnetometer setup failed');
        setError('Unable to access magnetometer sensor');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error initializing AR compass:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Initialization error: ${errorMessage}`);
      
      Alert.alert(
        'Error',
        'Failed to initialize compass. Please ensure location and sensor permissions are granted.',
        [{ text: 'OK' }]
      );
      
      setLoading(false);
    }
  }, [setupMagnetometer]);

  // Handle retry button press
  const handleRetry = useCallback(() => {
    retryCountRef.current = 0;
    setError(null);
    initializeCompass();
  }, [initializeCompass]);

  // Initialize when visible
  useEffect(() => {
    isMountedRef.current = true;

    if (visible) {
      initializeCompass();
    } else {
      cleanupMagnetometer();
    }

    // Cleanup on unmount
    return () => {
      console.log('ARQiblaCompass unmounting, cleaning up...');
      isMountedRef.current = false;
      cleanupMagnetometer();
    };
  }, [visible, initializeCompass, cleanupMagnetometer]);

  // Update rotation animations
  useEffect(() => {
    if (!loading && location && magnetometerAvailable) {
      const targetRotation = qiblaDirection - deviceHeading;
      qiblaRotation.value = withSpring(targetRotation, {
        damping: 15,
        stiffness: 100,
      });

      compassRotation.value = withTiming(-deviceHeading, {
        duration: 100,
      });
    }
  }, [deviceHeading, qiblaDirection, loading, location, magnetometerAvailable, qiblaRotation, compassRotation]);

  const arrowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${qiblaRotation.value}deg` }],
    };
  });

  const compassStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${compassRotation.value}deg` }],
    };
  });

  const getDistanceToKaaba = (): string => {
    if (!location) return 'Calculating...';

    const kaabaLat = 21.4225;
    const kaabaLng = 39.8262;

    const R = 6371; // Earth's radius in km
    const dLat = ((kaabaLat - location.coords.latitude) * Math.PI) / 180;
    const dLon = ((kaabaLng - location.coords.longitude) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((location.coords.latitude * Math.PI) / 180) *
        Math.cos((kaabaLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return `${Math.round(distance)} km`;
  };

  const renderARView = () => {
    // Loading state
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Initializing compass...</Text>
          <Text style={styles.loadingSubtext}>
            Getting location and calibrating sensors
          </Text>
        </View>
      );
    }

    // Error state
    if (error || magnetometerAvailable === false) {
      return (
        <View style={styles.errorContainer}>
          <IconSymbol name="error" size={64} color={colors.error || colors.text} />
          <Text style={styles.errorTitle}>Compass Unavailable</Text>
          <Text style={styles.errorText}>
            {error || 'Magnetometer not available on this device'}
          </Text>
          {location && (
            <Text style={styles.errorSubtext}>
              Qibla direction: {Math.round(qiblaDirection)}° from North
            </Text>
          )}
          {magnetometerAvailable !== false && (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <IconSymbol name="refresh" size={20} color={colors.background} />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.helpText}>
            {magnetometerAvailable === false
              ? 'Your device does not have a magnetometer sensor required for the compass.'
              : 'Make sure location and sensor permissions are granted, then try again.'}
          </Text>
        </View>
      );
    }

    // Normal AR view
    return (
      <View style={styles.arContainer}>
        <View style={styles.compassContainer}>
          <Animated.View style={[styles.compass, compassStyle]}>
            <Text style={[styles.directionLabel, styles.northLabel]}>N</Text>
            <Text style={[styles.directionLabel, styles.eastLabel]}>E</Text>
            <Text style={[styles.directionLabel, styles.southLabel]}>S</Text>
            <Text style={[styles.directionLabel, styles.westLabel]}>W</Text>

            <View style={styles.centerDot} />

            {/* Compass markings */}
            {[...Array(36)].map((_, i) => {
              const angle = i * 10;
              const isCardinal = angle % 90 === 0;
              const isMajor = angle % 30 === 0;

              return (
                <View
                  key={i}
                  style={[
                    styles.compassMark,
                    {
                      transform: [
                        { rotate: `${angle}deg` },
                        { translateY: -COMPASS_SIZE / 2 + 20 },
                      ],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.mark,
                      isCardinal
                        ? styles.cardinalMark
                        : isMajor
                        ? styles.majorMark
                        : styles.minorMark,
                    ]}
                  />
                </View>
              );
            })}
          </Animated.View>

          <Animated.View style={[styles.qiblaArrow, arrowStyle]}>
            <View style={styles.arrowHead} />
            <View style={styles.arrowBody} />
            <Text style={styles.qiblaLabel}>QIBLA</Text>
          </Animated.View>
        </View>

        <View style={styles.infoPanel}>
          <View style={styles.infoRow}>
            <IconSymbol name="explore" size={24} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Qibla Direction</Text>
              <Text style={styles.infoValue}>{Math.round(qiblaDirection)}°</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <IconSymbol name="navigation" size={24} color={colors.accent} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Device Heading</Text>
              <Text style={styles.infoValue}>{Math.round(deviceHeading)}°</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <IconSymbol name="place" size={24} color={colors.highlight} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Distance to Kaaba</Text>
              <Text style={styles.infoValue}>{getDistanceToKaaba()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Hold your device flat and rotate until the arrow points upward
          </Text>
          <Text style={styles.calibrationHint}>
            Move device in figure-8 pattern to calibrate
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <NavigationHeader
          title="AR Qibla Compass"
          showBack={false}
          showClose={true}
          onClose={onClose}
        />
        {renderARView()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 20,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.error || colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  helpText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
  arContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  compassContainer: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  compass: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 8px 24px ${colors.shadow}`,
    elevation: 8,
  },
  directionLabel: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  northLabel: {
    top: 15,
  },
  eastLabel: {
    right: 15,
  },
  southLabel: {
    bottom: 15,
  },
  westLabel: {
    left: 15,
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  compassMark: {
    position: 'absolute',
    width: 2,
    alignItems: 'center',
  },
  mark: {
    backgroundColor: colors.border,
  },
  cardinalMark: {
    width: 3,
    height: 20,
    backgroundColor: colors.primary,
  },
  majorMark: {
    width: 2,
    height: 15,
    backgroundColor: colors.textSecondary,
  },
  minorMark: {
    width: 1,
    height: 10,
    backgroundColor: colors.border,
  },
  qiblaArrow: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 50,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.highlight,
  },
  arrowBody: {
    width: 10,
    height: 100,
    backgroundColor: colors.highlight,
    borderRadius: 5,
  },
  qiblaLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.highlight,
    letterSpacing: 2,
  },
  infoPanel: {
    width: '90%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0 4px 12px ${colors.shadow}`,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  instructionsContainer: {
    width: '90%',
    backgroundColor: `${colors.primary}15`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  calibrationHint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
