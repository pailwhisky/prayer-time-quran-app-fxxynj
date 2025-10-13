
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
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
  const [subscription, setSubscription] = useState<any>(null);
  const qiblaRotation = useSharedValue(0);

  const subscribeMagnetometer = useCallback(() => {
    const sub = Magnetometer.addListener((data) => {
      const { x, y } = data;
      let angle = Math.atan2(y, x) * (180 / Math.PI);
      angle = (angle + 360) % 360;
      setDeviceHeading(angle);
    });
    setSubscription(sub);
  }, []);

  useEffect(() => {
    if (visible) {
      Magnetometer.setUpdateInterval(100);
      subscribeMagnetometer();
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [visible, subscribeMagnetometer, subscription]);

  useEffect(() => {
    const direction = getQiblaDirection(latitude, longitude);
    setQiblaDirection(direction);
    console.log('Qibla direction calculated:', direction);
  }, [latitude, longitude]);

  useEffect(() => {
    const targetRotation = qiblaDirection - deviceHeading;
    qiblaRotation.value = withSpring(targetRotation, {
      damping: 15,
      stiffness: 100,
    });
  }, [deviceHeading, qiblaDirection, qiblaRotation]);

  const arrowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${qiblaRotation.value}deg` }],
    };
  });

  if (!visible) {
    return null;
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
});
