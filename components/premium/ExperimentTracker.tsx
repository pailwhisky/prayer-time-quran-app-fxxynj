
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useRevenueCatExperiments } from '@/hooks/useRevenueCatExperiments';
import { IconSymbol } from '@/components/IconSymbol';

interface ExperimentTrackerProps {
  onExperimentLoaded?: (experimentId: string | null) => void;
}

/**
 * Component to track and display A/B test experiments
 * Shows which experiment variant the user is seeing
 */
export default function ExperimentTracker({ onExperimentLoaded }: ExperimentTrackerProps) {
  const {
    loading,
    currentExperiment,
    trackExperimentEvent,
    getCurrentOffering,
    refreshExperiment,
  } = useRevenueCatExperiments();

  const [showDebugInfo, setShowDebugInfo] = useState(__DEV__);

  useEffect(() => {
    if (currentExperiment && onExperimentLoaded) {
      onExperimentLoaded(currentExperiment);
    }
  }, [currentExperiment]);

  const handleTrackEvent = async (eventName: string) => {
    await trackExperimentEvent(eventName, {
      timestamp: new Date().toISOString(),
      screen: 'premium',
    });
    
    Alert.alert(
      'Event Tracked',
      `Event "${eventName}" has been tracked for experiment analysis.`
    );
  };

  const handleRefresh = async () => {
    await refreshExperiment();
    const offering = await getCurrentOffering();
    Alert.alert(
      'Experiment Refreshed',
      offering ? `Current offering: ${offering}` : 'No active experiment'
    );
  };

  if (!showDebugInfo && !__DEV__) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconSymbol name="flask" size={20} color={colors.primary} />
        <Text style={styles.title}>A/B Test Experiment</Text>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading experiment data...</Text>
      ) : (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Current Experiment:</Text>
            <Text style={styles.value}>
              {currentExperiment || 'No active experiment'}
            </Text>
          </View>

          {currentExperiment && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Status:</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
          )}

          {/* Debug Actions */}
          {__DEV__ && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleTrackEvent('paywall_viewed')}
              >
                <Text style={styles.actionButtonText}>Track View</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleTrackEvent('upgrade_button_clicked')}
              >
                <Text style={styles.actionButtonText}>Track Click</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSecondary]}
                onPress={handleRefresh}
              >
                <IconSymbol name="refresh" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.note}>
            💡 Experiments are configured in the RevenueCat dashboard.
            {'\n'}
            Track conversion rates and optimize your paywall!
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  statusBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonSecondary: {
    flex: 0,
    backgroundColor: colors.secondary + '20',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
  },
  note: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 8,
  },
});
