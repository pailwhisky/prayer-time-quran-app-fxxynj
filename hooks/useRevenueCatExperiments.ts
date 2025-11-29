
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

/**
 * Custom hook for RevenueCat Experiments (A/B Testing)
 * 
 * RevenueCat Experiments allow you to test different paywall configurations,
 * pricing strategies, and offerings to optimize conversion rates.
 * 
 * Documentation: https://www.revenuecat.com/docs/experiments-v1
 */
export function useRevenueCatExperiments() {
  const [currentExperiment, setCurrentExperiment] = useState<string | null>(null);
  const [experimentVariant, setExperimentVariant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperimentData();
  }, []);

  /**
   * Load current experiment data
   * RevenueCat automatically assigns users to experiment variants
   */
  const loadExperimentData = async () => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      console.log('Experiments not supported on this platform');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🧪 Loading experiment data...');

      // Get customer info which includes experiment data
      const customerInfo = await Purchases.getCustomerInfo();

      // Check if user is in an experiment
      // Note: Experiment data is available in customerInfo.entitlements
      // The actual experiment assignment is handled server-side by RevenueCat
      
      console.log('✅ Experiment data loaded');
      console.log('Customer info:', {
        originalAppUserId: customerInfo.originalAppUserId,
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
      });

      // You can track which offering the user sees
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setCurrentExperiment(offerings.current.identifier);
        console.log('Current offering (experiment):', offerings.current.identifier);
      }

    } catch (error) {
      console.error('❌ Error loading experiment data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Track experiment event
   * Use this to track custom events within your experiment
   * 
   * @param eventName - Name of the event to track
   * @param properties - Optional properties to attach to the event
   */
  const trackExperimentEvent = async (
    eventName: string,
    properties?: Record<string, any>
  ) => {
    try {
      console.log('📊 Tracking experiment event:', eventName, properties);

      // Get current customer info to include in tracking
      const customerInfo = await Purchases.getCustomerInfo();

      // Log event with experiment context
      console.log('Event tracked:', {
        event: eventName,
        experiment: currentExperiment,
        variant: experimentVariant,
        userId: customerInfo.originalAppUserId,
        properties,
      });

      // Note: RevenueCat automatically tracks purchase events
      // Custom events can be sent to your analytics platform
      // or tracked via RevenueCat's webhook system

    } catch (error) {
      console.error('❌ Error tracking experiment event:', error);
    }
  };

  /**
   * Get the current offering identifier
   * This can be used to determine which experiment variant the user is seeing
   */
  const getCurrentOffering = async (): Promise<string | null> => {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current?.identifier || null;
    } catch (error) {
      console.error('Error getting current offering:', error);
      return null;
    }
  };

  /**
   * Force refresh experiment data
   * Useful after user actions that might affect experiment assignment
   */
  const refreshExperiment = async () => {
    await loadExperimentData();
  };

  return {
    loading,
    currentExperiment,
    experimentVariant,
    trackExperimentEvent,
    getCurrentOffering,
    refreshExperiment,
  };
}
