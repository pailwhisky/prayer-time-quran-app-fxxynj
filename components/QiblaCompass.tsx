
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { getQiblaDirection } from '@/utils/prayerTimes';
import { colors } from '@/styles/commonStyles';

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
  const [magnetometerAvailable, setMagnetometerAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const qiblaRotation = useSharedValue(0);
  const subscriptionRef = useRef<any>(null);
  const isMountedRef = useRef(true);

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
  useEffect(() => {
    const checkMagnetometer = async () => {
      try {
        const isAvailable = await Magnetometer.isAvailableAsync();
        if (!isAvailable) {
          setMagnetometerAvailable(false);
          setError('Magnetometer not available on this device');
          console.warn('Magnetometer not available');
        }
      } catch (err) {
        console.error('Error checking magnetometer availability:', err);
        setMagnetometerAvailable(false);
        setError('Unable to access magnetometer');
      }
    };

    checkMagnetometer();
  }, []);

  // Handle magnetometer subscription
  useEffect(() => {
    isMountedRef.current = true;

    if (!visible || !magnetometerAvailable) {
      return;
    }

    const setupMagnetometer = async () => {
      try {
        // Set update interval
        await Magnetometer.setUpdateInterval(100);

        // Subscribe to magnetometer updates
        subscriptionRef.current = Magnetometer.addListener((data) => {
          if (!isMountedRef.current) {
            return;
          }

          try {
            const { x, y } = data;
            let angle = Math.atan2(y, x) * (180 / Math.PI);
            angle = (angle + 360) % 360;
            setDeviceHeading(angle);
          } catch (err) {
            console.error('Error processing magnetometer data:', err);
          }
        });

        console.log('Magnetometer subscription established');
      } catch (err) {
        console.error('Error setting up magnetometer:', err);
        setError('Unable to access device magnetometer');
        setMagnetometerAvailable(false);
        
        Alert.alert(
          'Sensor Error',
          'Unable to access device magnetometer. Please ensure location and sensor permissions are granted.',
          [{ text: 'OK' }]
        );
      }
    };

    setupMagnetometer();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.remove();
          subscriptionRef.current = null;
          console.log('Magnetometer subscription removed');
        } catch (err) {
          console.error('Error removing magnetometer subscription:', err);
        }
      }
    };
  }, [visible, magnetometerAvailable]);

  // Update rotation animation
  useEffect(() => {
    if (!magnetometerAvailable) {
      return;
    }

    const targetRotation = qiblaDirection - deviceHeading;
    qiblaRotation.value = withSpring(targetRotation, {
      damping: 15,
      stiffness: 100,
    });
  }, [deviceHeading, qiblaDirection, qiblaRotation, magnetometerAvailable]);

  const arrowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${qiblaRotation.value}deg` }],
    };
  });

  if (!visible) {
    return null;
  }

  if (error || !magnetometerAvailable) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || 'Magnetometer not available'}
          </Text>
          <Text style={styles.errorSubtext}>
            Qibla direction: {Math.round(qiblaDirection)}° from North
          </Text>
        </View>
      </View>
    );
  }

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
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.error || colors.text,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 12,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
