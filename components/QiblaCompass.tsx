
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { getQiblaDirection } from '@/utils/prayerTimes';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface QiblaCompassProps {
  latitude: number;
  longitude: number;
  visible?: boolean;
  onClose?: () => void;
}

const COMPASS_SIZE = Dimensions.get('window').width * 0.7;

export default function QiblaCompass({ latitude, longitude, visible = true, onClose }: QiblaCompassProps) {
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [magnetometerAvailable, setMagnetometerAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const qiblaRotation = useSharedValue(0);
  const subscriptionRef = useRef<any>(null);
  const isMountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  // Calculate Qibla direction when coordinates change
  useEffect(() => {
    try {
      const direction = getQiblaDirection(latitude, longitude);
      setQiblaDirection(direction);
      console.log('Qibla direction calculated:', direction);
    } catch (error) {
      console.error('Error calculating Qibla direction:', error);
      setError('Unable to calculate Qibla direction');
    }
  }, [latitude, longitude]);

  // Check magnetometer availability
  const checkMagnetometerAvailability = useCallback(async () => {
    try {
      console.log('Checking magnetometer availability...');
      const isAvailable = await Magnetometer.isAvailableAsync();
      console.log('Magnetometer available:', isAvailable);
      
      if (!isAvailable) {
        setMagnetometerAvailable(false);
        setError('Magnetometer not available on this device');
        console.warn('Magnetometer not available on this device');
        return false;
      }
      
      setMagnetometerAvailable(true);
      return true;
    } catch (err) {
      console.error('Error checking magnetometer availability:', err);
      setMagnetometerAvailable(false);
      setError('Unable to access magnetometer sensor');
      return false;
    }
  }, []);

  // Setup magnetometer subscription
  const setupMagnetometer = useCallback(async () => {
    if (!isMountedRef.current) {
      console.log('Component unmounted, skipping magnetometer setup');
      return false;
    }

    try {
      console.log('Setting up magnetometer subscription...');
      
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

      console.log('Magnetometer subscription established successfully');
      setError(null);
      retryCountRef.current = 0;
      return true;
    } catch (err) {
      console.error('Error setting up magnetometer:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Magnetometer error: ${errorMessage}`);
      
      // Retry logic
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        console.log(`Retrying magnetometer setup (${retryCountRef.current}/${MAX_RETRIES})...`);
        
        setTimeout(() => {
          if (isMountedRef.current) {
            setupMagnetometer();
          }
        }, 1000 * retryCountRef.current);
      } else {
        Alert.alert(
          'Sensor Error',
          'Unable to access device magnetometer after multiple attempts. Please ensure sensor permissions are granted and try restarting the app.',
          [{ text: 'OK' }]
        );
      }
      
      return false;
    }
  }, []);

  // Cleanup magnetometer subscription
  const cleanupMagnetometer = useCallback(() => {
    if (subscriptionRef.current) {
      try {
        console.log('Cleaning up magnetometer subscription...');
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
        console.log('Magnetometer subscription removed successfully');
      } catch (err) {
        console.error('Error removing magnetometer subscription:', err);
      }
    }
  }, []);

  // Initialize magnetometer when component becomes visible
  const initializeMagnetometer = useCallback(async () => {
    if (!visible) {
      console.log('Component not visible, skipping initialization');
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      // Check if magnetometer is available
      const isAvailable = await checkMagnetometerAvailability();
      
      if (!isAvailable) {
        setIsInitializing(false);
        return;
      }

      // Setup magnetometer subscription
      await setupMagnetometer();
    } catch (err) {
      console.error('Error initializing magnetometer:', err);
      setError('Failed to initialize magnetometer');
    } finally {
      setIsInitializing(false);
    }
  }, [visible, checkMagnetometerAvailability, setupMagnetometer]);

  // Handle retry button press
  const handleRetry = useCallback(() => {
    retryCountRef.current = 0;
    initializeMagnetometer();
  }, [initializeMagnetometer]);

  // Initialize on mount and when visibility changes
  useEffect(() => {
    isMountedRef.current = true;

    if (visible && magnetometerAvailable !== false) {
      initializeMagnetometer();
    } else {
      cleanupMagnetometer();
    }

    // Cleanup on unmount
    return () => {
      console.log('QiblaCompass unmounting, cleaning up...');
      isMountedRef.current = false;
      cleanupMagnetometer();
    };
  }, [visible, magnetometerAvailable, initializeMagnetometer, cleanupMagnetometer]);

  // Update rotation animation
  useEffect(() => {
    if (!magnetometerAvailable || isInitializing) {
      return;
    }

    const targetRotation = qiblaDirection - deviceHeading;
    qiblaRotation.value = withSpring(targetRotation, {
      damping: 15,
      stiffness: 100,
    });
  }, [deviceHeading, qiblaDirection, qiblaRotation, magnetometerAvailable, isInitializing]);

  const arrowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${qiblaRotation.value}deg` }],
    };
  });

  if (!visible) {
    return null;
  }

  // Loading state
  if (isInitializing) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <IconSymbol name="explore" size={48} color={colors.primary} />
          <Text style={styles.loadingText}>Initializing compass...</Text>
          <Text style={styles.loadingSubtext}>
            Calibrating magnetometer sensor
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error || magnetometerAvailable === false) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol name="error" size={48} color={colors.error || colors.text} />
          <Text style={styles.errorText}>
            {error || 'Magnetometer not available'}
          </Text>
          <Text style={styles.errorSubtext}>
            Qibla direction: {Math.round(qiblaDirection)}° from North
          </Text>
          {magnetometerAvailable !== false && (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <IconSymbol name="refresh" size={20} color={colors.background} />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.helpText}>
            {magnetometerAvailable === false
              ? 'Your device does not have a magnetometer sensor.'
              : 'Make sure sensor permissions are granted and try again.'}
          </Text>
        </View>
      </View>
    );
  }

  // Normal compass view
  return (
    <View style={styles.container}>
      <View style={styles.compassContainer}>
        <View style={styles.compass}>
          <Text style={styles.directionLabel}>N</Text>
          <Animated.View style={[styles.arrow, arrowStyle]}>
            <View style={styles.arrowHead} />
            <View style={styles.arrowBody} />
          </Animated.View>
        </View>
      </View>
      <Text style={styles.infoText}>
        Point your device towards the arrow to face Qibla
      </Text>
      <Text style={styles.degreeText}>
        Qibla: {Math.round(qiblaDirection)}° | Device: {Math.round(deviceHeading)}°
      </Text>
      <Text style={styles.calibrationHint}>
        Move your device in a figure-8 pattern to calibrate
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  compassContainer: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
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
    boxShadow: `0 4px 12px ${colors.shadow}`,
    elevation: 5,
  },
  directionLabel: {
    position: 'absolute',
    top: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  arrow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 40,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.highlight,
  },
  arrowBody: {
    width: 8,
    height: 80,
    backgroundColor: colors.highlight,
    borderRadius: 4,
  },
  infoText: {
    marginTop: 24,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  degreeText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  calibrationHint: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: colors.error || colors.text,
    textAlign: 'center',
    fontWeight: '600',
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
    marginTop: 8,
    lineHeight: 18,
  },
});
