
import { colors } from '@/styles/commonStyles';
import { getQiblaDirection } from '@/utils/prayerTimes';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/IconSymbol';
import { Magnetometer } from 'expo-sensors';
import { View, Text, StyleSheet, Dimensions, Alert, TouchableOpacity } from 'react-native';

interface QiblaCompassProps {
  latitude: number;
  longitude: number;
  visible?: boolean;
  onClose?: () => void;
}

const COMPASS_SIZE = Math.min(Dimensions.get('window').width - 80, 300);

export default function QiblaCompass({ latitude, longitude, visible = true, onClose }: QiblaCompassProps) {
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [magnetometerAvailable, setMagnetometerAvailable] = useState<boolean>(true);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  
  const qiblaRotation = useSharedValue(0);
  const compassRotation = useSharedValue(0);
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);

  // Calculate Qibla direction
  useEffect(() => {
    const direction = getQiblaDirection(latitude, longitude);
    setQiblaDirection(direction);
    console.log(`🧭 Qibla direction calculated: ${direction.toFixed(2)}°`);
  }, [latitude, longitude]);

  // Initialize magnetometer
  const initializeMagnetometer = useCallback(async () => {
    try {
      setIsInitializing(true);
      console.log('🧭 Initializing magnetometer...');
      
      const available = await Magnetometer.isAvailableAsync();
      console.log(`🧭 Magnetometer available: ${available}`);
      
      if (!available) {
        setMagnetometerAvailable(false);
        Alert.alert(
          'Compass Not Available',
          'Your device does not have a magnetometer sensor. The compass will show the Qibla direction relative to North.',
          [{ text: 'OK' }]
        );
        setIsInitializing(false);
        return;
      }

      setMagnetometerAvailable(true);
      
      // Set update interval
      Magnetometer.setUpdateInterval(100);
      
      // Subscribe to magnetometer updates
      const subscription = Magnetometer.addListener((data) => {
        const { x, y } = data;
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        angle = (angle + 360) % 360;
        setDeviceHeading(angle);
      });
      
      subscriptionRef.current = subscription;
      console.log('✅ Magnetometer initialized successfully');
      setIsInitializing(false);
    } catch (error) {
      console.error('❌ Error initializing magnetometer:', error);
      setMagnetometerAvailable(false);
      setIsInitializing(false);
      Alert.alert(
        'Compass Error',
        'Unable to access device compass. Please check your device permissions.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  // Cleanup magnetometer
  const cleanupMagnetometer = useCallback(() => {
    console.log('🧹 Cleaning up magnetometer subscription');
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
  }, []);

  // Initialize on mount if visible
  useEffect(() => {
    if (visible && magnetometerAvailable) {
      initializeMagnetometer();
    }
    
    return () => {
      cleanupMagnetometer();
    };
  }, [visible, magnetometerAvailable, initializeMagnetometer, cleanupMagnetometer]);

  // Update compass rotation
  useEffect(() => {
    if (!isInitializing && magnetometerAvailable) {
      const relativeQibla = (qiblaDirection - deviceHeading + 360) % 360;
      qiblaRotation.value = withSpring(relativeQibla, {
        damping: 15,
        stiffness: 100,
      });
      compassRotation.value = withSpring(-deviceHeading, {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [deviceHeading, qiblaDirection, qiblaRotation, magnetometerAvailable, isInitializing, compassRotation]);

  const qiblaAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${qiblaRotation.value}deg` }],
    };
  });

  const compassAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${compassRotation.value}deg` }],
    };
  });

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.compassContainer}>
        {/* Ornamental border */}
        <View style={styles.ornamentalBorder}>
          <View style={[styles.cornerOrnament, styles.cornerTopLeft]}>
            <Text style={styles.cornerText}>◆</Text>
          </View>
          <View style={[styles.cornerOrnament, styles.cornerTopRight]}>
            <Text style={styles.cornerText}>◆</Text>
          </View>
          <View style={[styles.cornerOrnament, styles.cornerBottomLeft]}>
            <Text style={styles.cornerText}>◆</Text>
          </View>
          <View style={[styles.cornerOrnament, styles.cornerBottomRight]}>
            <Text style={styles.cornerText}>◆</Text>
          </View>
        </View>

        {/* Compass background with Islamic pattern */}
        <View style={styles.compassBackground}>
          {/* Decorative circles */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.decorativeCircle3} />

          {/* Compass rose with cardinal directions */}
          <Animated.View style={[styles.compassRose, compassAnimatedStyle]}>
            {/* Cardinal directions */}
            <View style={[styles.directionMarker, styles.directionTop]}>
              <Text style={styles.directionText}>N</Text>
            </View>
            <View style={[styles.directionMarker, styles.directionRight]}>
              <Text style={styles.directionText}>E</Text>
            </View>
            <View style={[styles.directionMarker, styles.directionBottom]}>
              <Text style={styles.directionText}>S</Text>
            </View>
            <View style={[styles.directionMarker, styles.directionLeft]}>
              <Text style={styles.directionText}>W</Text>
            </View>

            {/* Degree markers */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((degree) => (
              <View
                key={degree}
                style={[
                  styles.degreeMarker,
                  {
                    transform: [
                      { rotate: `${degree}deg` },
                      { translateY: -COMPASS_SIZE / 2 + 20 },
                    ],
                  },
                ]}
              >
                <View style={degree % 90 === 0 ? styles.majorTick : styles.minorTick} />
              </View>
            ))}
          </Animated.View>

          {/* Qibla indicator (Kaaba icon) */}
          <Animated.View style={[styles.qiblaIndicator, qiblaAnimatedStyle]}>
            <View style={styles.qiblaArrow}>
              <View style={styles.arrowHead} />
              <View style={styles.arrowBody} />
              <Text style={styles.kaabaIcon}>🕋</Text>
            </View>
          </Animated.View>

          {/* Center ornament */}
          <View style={styles.centerOrnament}>
            <View style={styles.centerDot} />
            <Text style={styles.centerStar}>✦</Text>
          </View>
        </View>

        {/* Status text */}
        <View style={styles.statusContainer}>
          {isInitializing ? (
            <Text style={styles.statusText}>Initializing compass...</Text>
          ) : !magnetometerAvailable ? (
            <Text style={styles.statusText}>Compass not available</Text>
          ) : (
            <>
              <Text style={styles.directionLabel}>Qibla Direction</Text>
              <Text style={styles.directionValue}>{qiblaDirection.toFixed(0)}°</Text>
              <Text style={styles.statusHint}>Point your device towards the Kaaba</Text>
            </>
          )}
        </View>

        {/* Decorative bottom border */}
        <View style={styles.bottomOrnament}>
          <View style={styles.ornamentDot} />
          <View style={styles.ornamentLine} />
          <Text style={styles.ornamentStar}>✦</Text>
          <View style={styles.ornamentLine} />
          <View style={styles.ornamentDot} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  compassContainer: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.gold,
    elevation: 4,
    position: 'relative',
  },
  ornamentalBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  cornerOrnament: {
    position: 'absolute',
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
  },
  cornerText: {
    fontSize: 12,
    color: colors.gold,
    fontWeight: 'bold',
  },
  compassBackground: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    backgroundColor: colors.lightGold,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 3,
    borderColor: colors.gold,
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: COMPASS_SIZE - 20,
    height: COMPASS_SIZE - 20,
    borderRadius: (COMPASS_SIZE - 20) / 2,
    borderWidth: 1,
    borderColor: colors.gold,
    opacity: 0.3,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: COMPASS_SIZE - 60,
    height: COMPASS_SIZE - 60,
    borderRadius: (COMPASS_SIZE - 60) / 2,
    borderWidth: 1,
    borderColor: colors.gold,
    opacity: 0.4,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: COMPASS_SIZE - 100,
    height: COMPASS_SIZE - 100,
    borderRadius: (COMPASS_SIZE - 100) / 2,
    borderWidth: 2,
    borderColor: colors.gold,
    opacity: 0.5,
  },
  compassRose: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionTop: {
    top: 10,
  },
  directionRight: {
    right: 10,
  },
  directionBottom: {
    bottom: 10,
  },
  directionLeft: {
    left: 10,
  },
  directionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    textShadowColor: colors.card,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  degreeMarker: {
    position: 'absolute',
    width: 2,
    height: 10,
    alignItems: 'center',
  },
  majorTick: {
    width: 3,
    height: 15,
    backgroundColor: colors.primary,
  },
  minorTick: {
    width: 2,
    height: 10,
    backgroundColor: colors.textSecondary,
  },
  qiblaIndicator: {
    position: 'absolute',
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  qiblaArrow: {
    alignItems: 'center',
    marginTop: 30,
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.highlight,
  },
  arrowBody: {
    width: 8,
    height: 40,
    backgroundColor: colors.highlight,
    marginTop: -2,
  },
  kaabaIcon: {
    fontSize: 32,
    marginTop: 8,
  },
  centerOrnament: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.gold,
    borderWidth: 2,
    borderColor: colors.card,
  },
  centerStar: {
    position: 'absolute',
    fontSize: 24,
    color: colors.gold,
    opacity: 0.3,
  },
  statusContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  directionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  directionValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statusHint: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  bottomOrnament: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
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
    fontSize: 14,
    color: colors.gold,
  },
});
