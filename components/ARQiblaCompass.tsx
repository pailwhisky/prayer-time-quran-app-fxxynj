
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Location from 'expo-location';
import { getQiblaDirection } from '@/utils/prayerTimes';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface ARQiblaCompassProps {
  visible: boolean;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export default function ARQiblaCompass({ visible, onClose }: ARQiblaCompassProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const compassRotation = useSharedValue(0);
  const arrowRotation = useSharedValue(0);

  const simulateCompass = useCallback(() => {
    // Simulate compass readings - in a real app, this would come from magnetometer
    let heading = 0;
    const interval = setInterval(() => {
      heading = (heading + 1) % 360;
      setDeviceHeading(heading);
    }, 100);

    // Cleanup interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  const initializeCompass = useCallback(async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location access is needed for Qibla direction');
        setLoading(false);
        return;
      }

      // Get current location
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(locationData);

      // Note: In a real AR implementation, you would use:
      // - Camera permissions and access
      // - Device orientation/magnetometer
      // - AR frameworks like react-native-arcore or react-native-arkit
      
      // For this demo, we'll simulate compass functionality
      simulateCompass();
      
    } catch (error) {
      console.error('Error initializing compass:', error);
      Alert.alert('Error', 'Failed to initialize AR compass');
    } finally {
      setLoading(false);
    }
  }, [simulateCompass]);

  useEffect(() => {
    if (visible) {
      initializeCompass();
    }
  }, [visible, initializeCompass]);

  useEffect(() => {
    if (location) {
      const direction = getQiblaDirection(
        location.coords.latitude,
        location.coords.longitude
      );
      setQiblaDirection(direction);
    }
  }, [location]);

  useEffect(() => {
    // Update compass rotation
    compassRotation.value = withSpring(-deviceHeading);
    
    // Update arrow rotation to point to Qibla
    const qiblaRelativeToNorth = qiblaDirection - deviceHeading;
    arrowRotation.value = withSpring(qiblaRelativeToNorth);
  }, [deviceHeading, qiblaDirection, compassRotation, arrowRotation]);

  const compassAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${compassRotation.value}deg` }],
    };
  });

  const arrowAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${arrowRotation.value}deg` }],
    };
  });

  const renderARView = () => (
    <View style={styles.arContainer}>
      {/* Simulated Camera View */}
      <View style={styles.cameraView}>
        <Text style={styles.cameraPlaceholder}>
          📱 AR Camera View
        </Text>
        <Text style={styles.arNote}>
          Note: react-native-maps is not supported in Natively.
          Full AR functionality would require additional native modules.
        </Text>
      </View>

      {/* Compass Overlay */}
      <View style={styles.compassOverlay}>
        <Animated.View style={[styles.compass, compassAnimatedStyle]}>
          {/* Compass Rose */}
          <View style={styles.compassRose}>
            <Text style={[styles.compassDirection, styles.northDirection]}>N</Text>
            <Text style={[styles.compassDirection, styles.eastDirection]}>E</Text>
            <Text style={[styles.compassDirection, styles.southDirection]}>S</Text>
            <Text style={[styles.compassDirection, styles.westDirection]}>W</Text>
          </View>
        </Animated.View>

        {/* Qibla Arrow */}
        <Animated.View style={[styles.qiblaArrow, arrowAnimatedStyle]}>
          <View style={styles.arrowContainer}>
            <IconSymbol name="navigation" size={40} color={colors.primary} />
            <Text style={styles.qiblaLabel}>QIBLA</Text>
          </View>
        </Animated.View>

        {/* Direction Info */}
        <View style={styles.directionInfo}>
          <Text style={styles.directionText}>
            Qibla Direction: {qiblaDirection.toFixed(1)}°
          </Text>
          <Text style={styles.directionText}>
            Device Heading: {deviceHeading.toFixed(1)}°
          </Text>
          {location && (
            <Text style={styles.locationText}>
              📍 {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>AR Qibla Compass</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="close" size={24} color={colors.card} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Initializing AR Compass...</Text>
            <Text style={styles.loadingSubtext}>Getting your location and calibrating</Text>
          </View>
        ) : (
          renderARView()
        )}

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How to use:</Text>
          <Text style={styles.instructionsText}>
            • Hold your device upright and point it forward
          </Text>
          <Text style={styles.instructionsText}>
            • The green arrow points toward the Kaaba in Mecca
          </Text>
          <Text style={styles.instructionsText}>
            • Move your device slowly to calibrate the compass
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.card,
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  arContainer: {
    flex: 1,
    position: 'relative',
  },
  cameraView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  cameraPlaceholder: {
    fontSize: 48,
    marginBottom: 20,
  },
  arNote: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  compassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compass: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  compassRose: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
  },
  compassDirection: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.card,
  },
  northDirection: {
    top: 10,
    left: '50%',
    marginLeft: -8,
  },
  eastDirection: {
    right: 10,
    top: '50%',
    marginTop: -8,
  },
  southDirection: {
    bottom: 10,
    left: '50%',
    marginLeft: -8,
  },
  westDirection: {
    left: 10,
    top: '50%',
    marginTop: -8,
  },
  qiblaArrow: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowContainer: {
    alignItems: 'center',
  },
  qiblaLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  directionInfo: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 16,
  },
  directionText: {
    color: colors.card,
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  instructions: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    paddingBottom: 40,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.card,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    lineHeight: 18,
  },
});
