
import React, { useState, useEffect, useCallback } from 'react';
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
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { getQiblaDirection } from '@/utils/prayerTimes';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import NavigationHeader from '@/components/NavigationHeader';

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
  const [magnetometerAvailable, setMagnetometerAvailable] = useState(false);
  const [calibrationNeeded, setCalibrationNeeded] = useState(false);

  const compassRotation = useSharedValue(0);
  const arrowRotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  const initializeCompass = useCallback(async () => {
    try {
      console.log('Initializing AR Qibla Compass...');
      
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
      console.log('Location obtained:', locationData.coords);

      // Calculate Qibla direction
      const direction = getQiblaDirection(
        locationData.coords.latitude,
        locationData.coords.longitude
      );
      setQiblaDirection(direction);
      console.log('Qibla direction calculated:', direction);

      // Check if magnetometer is available
      const available = await Magnetometer.isAvailableAsync();
      setMagnetometerAvailable(available);
      console.log('Magnetometer available:', available);

      if (available) {
        // Set update interval for smooth animation
        Magnetometer.setUpdateInterval(100);

        // Subscribe to magnetometer updates
        const subscription = Magnetometer.addListener((data) => {
          // Calculate heading from magnetometer data
          let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
          
          // Normalize angle to 0-360
          angle = (angle + 360) % 360;
          
          // Adjust for device orientation
          if (Platform.OS === 'ios') {
            angle = (angle + 90) % 360;
          }

          setDeviceHeading(angle);

          // Check if calibration is needed (weak magnetic field)
          const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
          if (magnitude < 25 || magnitude > 65) {
            setCalibrationNeeded(true);
          } else {
            setCalibrationNeeded(false);
          }
        });

        // Store subscription for cleanup
        return () => {
          subscription.remove();
        };
      } else {
        Alert.alert(
          'Sensor Not Available',
          'Your device does not support compass functionality. The AR compass requires a magnetometer sensor.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error initializing compass:', error);
      Alert.alert('Error', 'Failed to initialize AR compass. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (visible) {
      initializeCompass().then((cleanupFn) => {
        cleanup = cleanupFn;
      });
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [visible, initializeCompass]);

  useEffect(() => {
    // Update compass rotation smoothly
    compassRotation.value = withSpring(-deviceHeading, {
      damping: 15,
      stiffness: 100,
    });
    
    // Calculate relative angle to Qibla
    let qiblaRelativeToNorth = qiblaDirection - deviceHeading;
    
    // Normalize to -180 to 180 range for shortest rotation
    while (qiblaRelativeToNorth > 180) qiblaRelativeToNorth -= 360;
    while (qiblaRelativeToNorth < -180) qiblaRelativeToNorth += 360;
    
    // Update arrow rotation
    arrowRotation.value = withSpring(qiblaRelativeToNorth, {
      damping: 15,
      stiffness: 100,
    });

    // Pulse effect when pointing towards Qibla (within 10 degrees)
    if (Math.abs(qiblaRelativeToNorth) < 10) {
      pulseScale.value = withTiming(1.2, { duration: 500 }, () => {
        pulseScale.value = withTiming(1, { duration: 500 });
      });
    }
  }, [deviceHeading, qiblaDirection]);

  const compassAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${compassRotation.value}deg` }],
    };
  });

  const arrowAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${arrowRotation.value}deg` },
        { scale: pulseScale.value },
      ],
    };
  });

  const getDistanceToKaaba = () => {
    if (!location) return 0;
    
    const KAABA_LAT = 21.4225;
    const KAABA_LON = 39.8262;
    
    const R = 6371; // Earth's radius in km
    const dLat = (KAABA_LAT - location.coords.latitude) * Math.PI / 180;
    const dLon = (KAABA_LON - location.coords.longitude) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(location.coords.latitude * Math.PI / 180) * 
              Math.cos(KAABA_LAT * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance);
  };

  const renderARView = () => (
    <View style={styles.arContainer}>
      {/* Simulated Camera View */}
      <View style={styles.cameraView}>
        <Text style={styles.cameraPlaceholder}>📱</Text>
        <Text style={styles.arNote}>
          AR Camera View
        </Text>
        <Text style={styles.arSubnote}>
          Note: Full AR camera integration requires additional native modules.
          {'\n'}Using compass-based direction instead.
        </Text>
      </View>

      {/* Compass Overlay */}
      <View style={styles.compassOverlay}>
        <Animated.View style={[styles.compass, compassAnimatedStyle]}>
          {/* Compass Rose */}
          <View style={styles.compassRose}>
            <View style={styles.compassCircle} />
            <Text style={[styles.compassDirection, styles.northDirection]}>N</Text>
            <Text style={[styles.compassDirection, styles.eastDirection]}>E</Text>
            <Text style={[styles.compassDirection, styles.southDirection]}>S</Text>
            <Text style={[styles.compassDirection, styles.westDirection]}>W</Text>
            
            {/* Degree markers */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((degree) => (
              <View
                key={degree}
                style={[
                  styles.degreeMarker,
                  {
                    transform: [
                      { rotate: `${degree}deg` },
                      { translateY: -85 },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Qibla Arrow */}
        <Animated.View style={[styles.qiblaArrow, arrowAnimatedStyle]}>
          <View style={styles.arrowContainer}>
            <View style={styles.arrowIcon}>
              <IconSymbol name="navigation" size={50} color={colors.primary} />
            </View>
            <Text style={styles.qiblaLabel}>QIBLA</Text>
            <Text style={styles.distanceLabel}>
              {getDistanceToKaaba()} km
            </Text>
          </View>
        </Animated.View>

        {/* Direction Info */}
        <View style={styles.directionInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Qibla Direction:</Text>
            <Text style={styles.infoValue}>{qiblaDirection.toFixed(1)}°</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Device Heading:</Text>
            <Text style={styles.infoValue}>{deviceHeading.toFixed(1)}°</Text>
          </View>
          {location && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>
                {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
              </Text>
            </View>
          )}
        </View>

        {/* Calibration Warning */}
        {calibrationNeeded && (
          <View style={styles.calibrationWarning}>
            <IconSymbol name="warning" size={20} color={colors.highlight} />
            <Text style={styles.calibrationText}>
              Move your device in a figure-8 pattern to calibrate
            </Text>
          </View>
        )}

        {/* Accuracy Indicator */}
        <View style={styles.accuracyIndicator}>
          {Math.abs((qiblaDirection - deviceHeading + 360) % 360 - 180) < 10 ? (
            <>
              <IconSymbol name="check-circle" size={24} color={colors.primary} />
              <Text style={styles.accuracyText}>Pointing towards Qibla ✓</Text>
            </>
          ) : (
            <Text style={styles.accuracyText}>Rotate to align with Qibla</Text>
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
        <NavigationHeader
          title="AR Qibla Compass"
          showBack={false}
          showClose={true}
          onClosePress={onClose}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Initializing AR Compass...</Text>
            <Text style={styles.loadingSubtext}>
              Getting your location and calibrating sensors
            </Text>
          </View>
        ) : !magnetometerAvailable ? (
          <View style={styles.errorContainer}>
            <IconSymbol name="error" size={64} color={colors.highlight} />
            <Text style={styles.errorText}>Compass Not Available</Text>
            <Text style={styles.errorSubtext}>
              Your device does not support compass functionality.
              Please use the standard Qibla compass instead.
            </Text>
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
            • Move slowly in a figure-8 pattern if calibration is needed
          </Text>
          <Text style={styles.instructionsText}>
            • When aligned, you&apos;ll see a checkmark indicator
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.card,
    marginTop: 20,
    marginBottom: 12,
  },
  errorSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
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
    fontSize: 64,
    marginBottom: 20,
  },
  arNote: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    textAlign: 'center',
    marginBottom: 12,
  },
  arSubnote: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 18,
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
    width: 220,
    height: 220,
    position: 'relative',
  },
  compassRose: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 110,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    position: 'absolute',
  },
  compassDirection: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.card,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  northDirection: {
    top: 15,
    left: '50%',
    marginLeft: -10,
  },
  eastDirection: {
    right: 15,
    top: '50%',
    marginTop: -10,
  },
  southDirection: {
    bottom: 15,
    left: '50%',
    marginLeft: -10,
  },
  westDirection: {
    left: 15,
    top: '50%',
    marginTop: -10,
  },
  degreeMarker: {
    position: 'absolute',
    width: 2,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    top: '50%',
    left: '50%',
    marginLeft: -1,
  },
  qiblaArrow: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowContainer: {
    alignItems: 'center',
  },
  arrowIcon: {
    backgroundColor: 'rgba(0, 70, 67, 0.2)',
    borderRadius: 40,
    padding: 15,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  qiblaLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  distanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  directionInfo: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
  },
  infoValue: {
    color: colors.card,
    fontSize: 13,
    fontWeight: '600',
  },
  calibrationWarning: {
    position: 'absolute',
    bottom: 180,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(224, 122, 95, 0.9)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  calibrationText: {
    color: colors.card,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  accuracyIndicator: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 70, 67, 0.9)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accuracyText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructions: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
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
    marginBottom: 6,
    lineHeight: 20,
  },
});
