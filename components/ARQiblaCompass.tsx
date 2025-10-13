
import { getQiblaDirection } from '@/utils/prayerTimes';
import NavigationHeader from '@/components/NavigationHeader';
import * as Location from 'expo-location';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { Magnetometer } from 'expo-sensors';

interface ARQiblaCompassProps {
  visible: boolean;
  onClose: () => void;
}

const COMPASS_SIZE = Dimensions.get('window').width * 0.75;

export default function ARQiblaCompass({ visible, onClose }: ARQiblaCompassProps) {
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  
  const qiblaRotation = useSharedValue(0);
  const compassRotation = useSharedValue(0);

  // Initialize compass and location
  const initializeCompass = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🧭 Initializing AR Qibla Compass...');

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Location access is needed to determine Qibla direction.',
          [{ text: 'OK', onPress: onClose }]
        );
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLocation);

      // Calculate Qibla direction
      const direction = getQiblaDirection(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
      setQiblaDirection(direction);
      console.log('✅ Qibla direction calculated:', direction);

      // Start magnetometer
      Magnetometer.setUpdateInterval(100);
      const sub = Magnetometer.addListener((data) => {
        const { x, y } = data;
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        angle = (angle + 360) % 360;
        setDeviceHeading(angle);
      });
      setSubscription(sub);
      console.log('✅ Magnetometer started');

      setLoading(false);
    } catch (error) {
      console.error('Error initializing compass:', error);
      Alert.alert(
        'Error',
        'Unable to initialize compass. Please check your device sensors.',
        [{ text: 'OK', onPress: onClose }]
      );
      setLoading(false);
    }
  }, [onClose]);

  // Initialize when visible
  useEffect(() => {
    if (visible) {
      initializeCompass();
    }

    // Cleanup function
    return () => {
      if (subscription) {
        console.log('🧹 Cleaning up magnetometer subscription');
        subscription.remove();
        setSubscription(null);
      }
    };
  }, [visible, initializeCompass]);

  // Update compass rotation
  useEffect(() => {
    if (!loading && location) {
      const targetRotation = qiblaDirection - deviceHeading;
      qiblaRotation.value = withSpring(targetRotation, {
        damping: 15,
        stiffness: 100,
      });
      
      compassRotation.value = withSpring(-deviceHeading, {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [deviceHeading, qiblaDirection, loading, location, qiblaRotation, compassRotation]);

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

  const getDistanceToKaaba = () => {
    if (!location) return 'Calculating...';
    
    const kaabaLat = 21.4225;
    const kaabaLng = 39.8262;
    
    const R = 6371; // Earth's radius in km
    const dLat = (kaabaLat - location.coords.latitude) * (Math.PI / 180);
    const dLon = (kaabaLng - location.coords.longitude) * (Math.PI / 180);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(location.coords.latitude * (Math.PI / 180)) *
      Math.cos(kaabaLat * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return `${Math.round(distance).toLocaleString()} km`;
  };

  const renderARView = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🧭</Text>
          <Text style={styles.loadingTitle}>Initializing Compass</Text>
          <Text style={styles.loadingSubtitle}>Calibrating sensors...</Text>
        </View>
      );
    }

    return (
      <View style={styles.arContainer}>
        <View style={styles.compassContainer}>
          <Animated.View style={[styles.compass, compassStyle]}>
            <Text style={[styles.directionLabel, styles.northLabel]}>N</Text>
            <Text style={[styles.directionLabel, styles.eastLabel]}>E</Text>
            <Text style={[styles.directionLabel, styles.southLabel]}>S</Text>
            <Text style={[styles.directionLabel, styles.westLabel]}>W</Text>
            
            <Animated.View style={[styles.arrow, arrowStyle]}>
              <View style={styles.arrowHead} />
              <View style={styles.arrowBody} />
            </Animated.View>
          </Animated.View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Qibla Direction</Text>
            <Text style={styles.infoValue}>{Math.round(qiblaDirection)}°</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Device Heading</Text>
            <Text style={styles.infoValue}>{Math.round(deviceHeading)}°</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Distance to Kaaba</Text>
            <Text style={styles.infoValue}>{getDistanceToKaaba()}</Text>
          </View>
        </View>

        <Text style={styles.instructionText}>
          Point your device towards the green arrow to face the Qibla
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <NavigationHeader
          title="AR Qibla Compass"
          showBack={false}
          showClose={true}
          onClosePress={onClose}
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
  arContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  compassContainer: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  compass: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    backgroundColor: colors.card,
    borderWidth: 4,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 8px 16px ${colors.shadow}`,
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
  arrow: {
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
    borderBottomColor: '#4CAF50',
  },
  arrowBody: {
    width: 10,
    height: 100,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  infoContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0 2px 4px ${colors.shadow}`,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});
