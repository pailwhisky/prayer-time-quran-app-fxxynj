
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Linking,
} from 'react-native';
import * as Location from 'expo-location';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';

interface Mosque {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  facilities: {
    parking?: boolean;
    womens_area?: boolean;
    wheelchair_accessible?: boolean;
    wudu_facilities?: boolean;
  };
  prayer_times: {
    fajr?: string;
    dhuhr?: string;
    asr?: string;
    maghrib?: string;
    isha?: string;
  };
  distance?: number;
}

interface MosqueFinderProps {
  visible: boolean;
  onClose: () => void;
}

export default function MosqueFinder({ visible, onClose }: MosqueFinderProps) {
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState(false);

  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'This feature needs location access to find nearby mosques.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', onPress: requestLocationPermission },
          ]
        );
        setLoading(false);
        return;
      }

      setLocationPermission(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      requestLocationPermission();
    }
  }, [visible, requestLocationPermission]);

  const loadNearbyMosques = useCallback(async () => {
    try {
      if (!userLocation) return;

      // In a real app, you would query based on proximity
      // For now, we'll load all mosques and calculate distance client-side
      const { data, error } = await supabase
        .from('mosques')
        .select('*');

      if (error) {
        console.error('Error loading mosques:', error);
        Alert.alert('Error', 'Failed to load nearby mosques');
        return;
      }

      // Calculate distances and sort by proximity
      const mosquesWithDistance = (data || []).map((mosque: any) => ({
        ...mosque,
        distance: calculateDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          mosque.latitude,
          mosque.longitude
        ),
      })).sort((a, b) => a.distance - b.distance);

      setMosques(mosquesWithDistance);
    } catch (error) {
      console.error('Error loading mosques:', error);
    } finally {
      setLoading(false);
    }
  }, [userLocation, calculateDistance]);

  useEffect(() => {
    if (userLocation) {
      loadNearbyMosques();
    }
  }, [userLocation, loadNearbyMosques]);

  const openDirections = (mosque: Mosque) => {
    const url = `https://maps.google.com/maps?daddr=${mosque.latitude},${mosque.longitude}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open maps application');
    });
  };

  const callMosque = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Could not make phone call');
    });
  };

  const openWebsite = (website: string) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open website');
    });
  };

  const renderFacilityIcon = (facility: string, available: boolean) => {
    const icons: { [key: string]: string } = {
      parking: 'local-parking',
      womens_area: 'woman',
      wheelchair_accessible: 'accessible',
      wudu_facilities: 'water-drop',
    };

    return (
      <View key={facility} style={styles.facilityIcon}>
        <IconSymbol
          name={icons[facility] || 'check'}
          size={16}
          color={available ? colors.primary : colors.textSecondary}
        />
      </View>
    );
  };

  const renderMosqueCard = (mosque: Mosque) => (
    <TouchableOpacity
      key={mosque.id}
      style={styles.mosqueCard}
      onPress={() => setSelectedMosque(mosque)}
    >
      <View style={styles.mosqueHeader}>
        <Text style={styles.mosqueName}>{mosque.name}</Text>
        {mosque.distance && (
          <Text style={styles.mosqueDistance}>
            {mosque.distance.toFixed(1)} km
          </Text>
        )}
      </View>

      <Text style={styles.mosqueAddress}>{mosque.address}</Text>

      <View style={styles.facilitiesContainer}>
        {Object.entries(mosque.facilities || {}).map(([facility, available]) =>
          renderFacilityIcon(facility, available as boolean)
        )}
      </View>

      <View style={styles.mosqueActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openDirections(mosque)}
        >
          <IconSymbol name="directions" size={16} color={colors.primary} />
          <Text style={styles.actionButtonText}>Directions</Text>
        </TouchableOpacity>

        {mosque.phone && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => callMosque(mosque.phone!)}
          >
            <IconSymbol name="phone" size={16} color={colors.primary} />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderMosqueDetail = () => (
    <Modal
      visible={!!selectedMosque}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setSelectedMosque(null)}
    >
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailTitle}>{selectedMosque?.name}</Text>
          <TouchableOpacity onPress={() => setSelectedMosque(null)}>
            <IconSymbol name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.detailContent}>
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Address</Text>
            <Text style={styles.detailText}>{selectedMosque?.address}</Text>
            {selectedMosque?.distance && (
              <Text style={styles.detailDistance}>
                {selectedMosque.distance.toFixed(1)} km away
              </Text>
            )}
          </View>

          {selectedMosque?.prayer_times && Object.keys(selectedMosque.prayer_times).length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Prayer Times</Text>
              <View style={styles.prayerTimesGrid}>
                {Object.entries(selectedMosque.prayer_times).map(([prayer, time]) => (
                  <View key={prayer} style={styles.prayerTimeItem}>
                    <Text style={styles.prayerName}>
                      {prayer.charAt(0).toUpperCase() + prayer.slice(1)}
                    </Text>
                    <Text style={styles.prayerTime}>{time}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Facilities</Text>
            <View style={styles.facilitiesGrid}>
              {Object.entries(selectedMosque?.facilities || {}).map(([facility, available]) => (
                <View key={facility} style={styles.facilityItem}>
                  <IconSymbol
                    name={
                      facility === 'parking' ? 'local-parking' :
                      facility === 'womens_area' ? 'woman' :
                      facility === 'wheelchair_accessible' ? 'accessible' :
                      facility === 'wudu_facilities' ? 'water-drop' : 'check'
                    }
                    size={20}
                    color={available ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[
                    styles.facilityText,
                    { color: available ? colors.text : colors.textSecondary }
                  ]}>
                    {facility.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.detailActions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => selectedMosque && openDirections(selectedMosque)}
            >
              <IconSymbol name="directions" size={20} color={colors.card} />
              <Text style={styles.primaryButtonText}>Get Directions</Text>
            </TouchableOpacity>

            {selectedMosque?.phone && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => callMosque(selectedMosque.phone!)}
              >
                <IconSymbol name="phone" size={20} color={colors.primary} />
                <Text style={styles.secondaryButtonText}>Call</Text>
              </TouchableOpacity>
            )}

            {selectedMosque?.website && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => openWebsite(selectedMosque.website!)}
              >
                <IconSymbol name="language" size={20} color={colors.primary} />
                <Text style={styles.secondaryButtonText}>Website</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Nearby Mosques</Text>
          <TouchableOpacity onPress={onClose}>
            <IconSymbol name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!locationPermission ? (
            <View style={styles.permissionContainer}>
              <IconSymbol name="location-off" size={48} color={colors.textSecondary} />
              <Text style={styles.permissionTitle}>Location Permission Required</Text>
              <Text style={styles.permissionText}>
                We need access to your location to find nearby mosques.
              </Text>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={requestLocationPermission}
              >
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          ) : loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Finding nearby mosques...</Text>
            </View>
          ) : mosques.length > 0 ? (
            <>
              <Text style={styles.subtitle}>
                Found {mosques.length} mosque{mosques.length !== 1 ? 's' : ''} near you
              </Text>
              {mosques.map(renderMosqueCard)}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <IconSymbol name="location-searching" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Mosques Found</Text>
              <Text style={styles.emptyText}>
                We couldn&apos;t find any mosques in our database near your location.
              </Text>
            </View>
          )}
        </ScrollView>

        {renderMosqueDetail()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  mosqueCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 2px 4px ${colors.shadow}`,
    elevation: 2,
  },
  mosqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mosqueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  mosqueDistance: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  mosqueAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  facilitiesContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  facilityIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mosqueActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  // Permission styles
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  permissionButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Detail modal styles
  detailContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  detailContent: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  detailDistance: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  prayerTimesGrid: {
    gap: 8,
  },
  prayerTimeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  prayerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  prayerTime: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  facilitiesGrid: {
    gap: 12,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  facilityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailActions: {
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
