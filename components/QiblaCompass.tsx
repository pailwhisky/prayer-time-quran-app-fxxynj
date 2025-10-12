
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';
import { getQiblaDirection } from '@/utils/prayerTimes';

interface QiblaCompassProps {
  latitude: number;
  longitude: number;
}

const { width } = Dimensions.get('window');
const COMPASS_SIZE = Math.min(width * 0.7, 280);

export default function QiblaCompass({ latitude, longitude }: QiblaCompassProps) {
  const [magnetometerData, setMagnetometerData] = useState({ x: 0, y: 0, z: 0 });
  const [subscription, setSubscription] = useState<any>(null);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  
  const rotation = useSharedValue(0);
  const qiblaRotation = useSharedValue(0);

  useEffect(() => {
    // Calculate Qibla direction
    const direction = getQiblaDirection(latitude, longitude);
    setQiblaDirection(direction);
    qiblaRotation.value = withSpring(direction);
    console.log('Qibla direction calculated:', direction);
  }, [latitude, longitude, qiblaRotation]);

  const subscribeMagnetometer = useCallback(async () => {
    try {
      const { status } = await Magnetometer.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Magnetometer permission is needed for compass functionality');
        return;
      }

      const isAvailable = await Magnetometer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Compass Not Available', 'Your device does not support compass functionality');
        return;
      }

      Magnetometer.setUpdateInterval(100);
      const sub = Magnetometer.addListener((data) => {
        setMagnetometerData(data);
        
        // Calculate compass heading
        const angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
        const heading = (angle + 360) % 360;
        rotation.value = withSpring(-heading);
      });
      
      setSubscription(sub);
      console.log('Magnetometer subscription started');
    } catch (error) {
      console.error('Error setting up magnetometer:', error);
      Alert.alert('Error', 'Failed to initialize compass');
    }
  }, [rotation]);

  useEffect(() => {
    subscribeMagnetometer();

    return () => {
      if (subscription) {
        subscription.remove();
        console.log('Magnetometer subscription removed');
      }
    };
  }, [subscribeMagnetometer, subscription]);

  const compassStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const qiblaArrowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${qiblaRotation.value + rotation.value}deg` }],
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Qibla Direction</Text>
      <Text style={styles.subtitle}>Point your device towards the Kaaba</Text>
      
      <View style={styles.compassContainer}>
        <Animated.View style={[styles.compass, compassStyle]}>
          {/* Compass markings */}
          <View style={styles.compassRing}>
            {/* North marker */}
            <View style={[styles.directionMarker, styles.northMarker]}>
              <Text style={styles.directionText}>N</Text>
            </View>
            
            {/* Other direction markers */}
            <View style={[styles.directionMarker, styles.eastMarker]}>
              <Text style={styles.directionText}>E</Text>
            </View>
            <View style={[styles.directionMarker, styles.southMarker]}>
              <Text style={styles.directionText}>S</Text>
            </View>
            <View style={[styles.directionMarker, styles.westMarker]}>
              <Text style={styles.directionText}>W</Text>
            </View>
            
            {/* Degree markings */}
            {Array.from({ length: 36 }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.degreeMarker,
                  {
                    transform: [{ rotate: `${i * 10}deg` }],
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>
        
        {/* Qibla arrow */}
        <Animated.View style={[styles.qiblaArrow, qiblaArrowStyle]}>
          <View style={styles.arrowHead} />
          <View style={styles.arrowBody} />
          <Text style={styles.qiblaText}>QIBLA</Text>
        </Animated.View>
        
        {/* Center dot */}
        <View style={styles.centerDot} />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Qibla Direction: {qiblaDirection.toFixed(1)}°
        </Text>
        <Text style={styles.infoSubtext}>
          Hold your device flat and rotate until the arrow points up
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 30,
    textAlign: 'center',
  },
  compassContainer: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  compass: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 5,
  },
  compassRing: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  directionMarker: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  northMarker: {
    top: 10,
    left: '50%',
    marginLeft: -15,
    backgroundColor: colors.highlight,
    borderRadius: 15,
  },
  eastMarker: {
    right: 10,
    top: '50%',
    marginTop: -15,
  },
  southMarker: {
    bottom: 10,
    left: '50%',
    marginLeft: -15,
  },
  westMarker: {
    left: 10,
    top: '50%',
    marginTop: -15,
  },
  directionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  degreeMarker: {
    position: 'absolute',
    width: 2,
    height: 15,
    backgroundColor: colors.border,
    top: 5,
    left: '50%',
    marginLeft: -1,
    transformOrigin: `1px ${COMPASS_SIZE / 2 - 5}px`,
  },
  qiblaArrow: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.highlight,
    marginBottom: -5,
  },
  arrowBody: {
    width: 6,
    height: 60,
    backgroundColor: colors.highlight,
    borderRadius: 3,
  },
  qiblaText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.highlight,
    marginTop: 5,
    textAlign: 'center',
  },
  centerDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  infoContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
