
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo } from 'react-native-purchases';

export interface SubscriptionMetrics {
  // User identification
  userId: string;
  
  // Subscription status
  isSubscribed: boolean;
  subscriptionTier: string;
  
  // Timing metrics
  firstSeenDate?: string;
  subscriptionStartDate?: string;
  subscriptionExpirationDate?: string;
  
  // Billing metrics
  billingIssueDetected: boolean;
  willRenew: boolean;
  
  // Product information
  activeProductIdentifier?: string;
  originalPurchaseDate?: string;
  
  // Lifecycle metrics
  daysSinceFirstSeen: number;
  daysSinceSubscribed: number;
  isInTrialPeriod: boolean;
  isInGracePeriod: boolean;
  
  // Revenue metrics
  totalRevenue: number;
  
  // Engagement metrics
  lastSeenDate: string;
  daysSinceLastSeen: number;
}

/**
 * Custom hook for RevenueCat Analytics
 * 
 * Provides detailed subscription metrics and analytics data
 * for tracking user behavior and subscription performance.
 * 
 * Documentation: https://www.revenuecat.com/docs/customer-info
 */
export function useRevenueCatAnalytics() {
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();

    // Set up listener for real-time updates
    const listener = Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      console.log('📊 Customer info updated, refreshing analytics...');
      calculateMetrics(customerInfo);
    });

    // Cleanup listener on unmount
    return () => {
      // Note: There's no explicit remove method in the current SDK
      // The listener is automatically cleaned up
    };
  }, []);

  /**
   * Load analytics data
   */
  const loadAnalytics = async () => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      console.log('Analytics not supported on this platform');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('📊 Loading analytics data...');

      const customerInfo = await Purchases.getCustomerInfo();
      calculateMetrics(customerInfo);

      console.log('✅ Analytics data loaded successfully');
    } catch (err: any) {
      console.error('❌ Error loading analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate metrics from customer info
   */
  const calculateMetrics = (customerInfo: CustomerInfo) => {
    try {
      const now = new Date();
      
      // Get active entitlement
      const activeEntitlements = Object.values(customerInfo.entitlements.active);
      const primaryEntitlement = activeEntitlements[0];
      
      // Calculate days since first seen
      const firstSeenDate = customerInfo.firstSeen;
      const daysSinceFirstSeen = firstSeenDate
        ? Math.floor((now.getTime() - new Date(firstSeenDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      // Calculate days since subscribed
      const subscriptionStartDate = primaryEntitlement?.latestPurchaseDate;
      const daysSinceSubscribed = subscriptionStartDate
        ? Math.floor((now.getTime() - new Date(subscriptionStartDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      // Calculate days since last seen
      const lastSeenDate = customerInfo.requestDate;
      const daysSinceLastSeen = Math.floor(
        (now.getTime() - new Date(lastSeenDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Check for billing issues
      const billingIssueDetected = primaryEntitlement?.billingIssueDetectedAt !== null;
      
      // Check trial and grace period
      const isInTrialPeriod = primaryEntitlement?.periodType === 'TRIAL';
      const isInGracePeriod = primaryEntitlement?.periodType === 'GRACE';
      
      // Calculate total revenue (approximate)
      // Note: This is a simplified calculation
      // For accurate revenue, use RevenueCat's Charts dashboard
      let totalRevenue = 0;
      Object.values(customerInfo.nonSubscriptionTransactions).forEach((transaction) => {
        // Revenue calculation would need product price data
        // This is a placeholder
        totalRevenue += 0;
      });

      const calculatedMetrics: SubscriptionMetrics = {
        userId: customerInfo.originalAppUserId,
        isSubscribed: activeEntitlements.length > 0,
        subscriptionTier: primaryEntitlement?.productIdentifier || 'free',
        firstSeenDate: customerInfo.firstSeen,
        subscriptionStartDate: primaryEntitlement?.latestPurchaseDate,
        subscriptionExpirationDate: primaryEntitlement?.expirationDate || undefined,
        billingIssueDetected,
        willRenew: primaryEntitlement?.willRenew || false,
        activeProductIdentifier: primaryEntitlement?.productIdentifier,
        originalPurchaseDate: primaryEntitlement?.originalPurchaseDate,
        daysSinceFirstSeen,
        daysSinceSubscribed,
        isInTrialPeriod,
        isInGracePeriod,
        totalRevenue,
        lastSeenDate,
        daysSinceLastSeen,
      };

      setMetrics(calculatedMetrics);
      
      console.log('📊 Calculated metrics:', {
        isSubscribed: calculatedMetrics.isSubscribed,
        tier: calculatedMetrics.subscriptionTier,
        daysSinceFirstSeen: calculatedMetrics.daysSinceFirstSeen,
        daysSinceSubscribed: calculatedMetrics.daysSinceSubscribed,
      });

    } catch (err) {
      console.error('Error calculating metrics:', err);
    }
  };

  /**
   * Track a custom analytics event
   * 
   * @param eventName - Name of the event
   * @param properties - Event properties
   */
  const trackEvent = async (
    eventName: string,
    properties?: Record<string, any>
  ) => {
    try {
      console.log('📊 Tracking event:', eventName, properties);

      // Get current customer info for context
      const customerInfo = await Purchases.getCustomerInfo();

      // Log event with full context
      const eventData = {
        event: eventName,
        timestamp: new Date().toISOString(),
        userId: customerInfo.originalAppUserId,
        subscriptionStatus: {
          isSubscribed: Object.keys(customerInfo.entitlements.active).length > 0,
          activeEntitlements: Object.keys(customerInfo.entitlements.active),
        },
        properties,
      };

      console.log('Event data:', eventData);

      // Note: For production, you would send this to your analytics platform
      // Examples: Mixpanel, Amplitude, Firebase Analytics, etc.
      // You can also use RevenueCat's webhook system to send events to your backend

    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  /**
   * Get subscriber attributes
   * These can be used for segmentation and targeting
   */
  const getSubscriberAttributes = async (): Promise<Record<string, any>> => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      
      return {
        userId: customerInfo.originalAppUserId,
        firstSeen: customerInfo.firstSeen,
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
        activeSubscriptions: Object.keys(customerInfo.activeSubscriptions),
        allPurchasedProductIdentifiers: customerInfo.allPurchasedProductIdentifiers,
        nonSubscriptionTransactions: customerInfo.nonSubscriptionTransactions,
      };
    } catch (error) {
      console.error('Error getting subscriber attributes:', error);
      return {};
    }
  };

  /**
   * Set custom subscriber attributes
   * These can be used for targeting and segmentation in RevenueCat
   * 
   * @param attributes - Key-value pairs of attributes
   */
  const setSubscriberAttributes = async (
    attributes: Record<string, string | null>
  ) => {
    try {
      console.log('Setting subscriber attributes:', attributes);
      await Purchases.setAttributes(attributes);
      console.log('✅ Attributes set successfully');
    } catch (error) {
      console.error('Error setting attributes:', error);
    }
  };

  /**
   * Refresh analytics data
   */
  const refresh = async () => {
    await loadAnalytics();
  };

  return {
    metrics,
    loading,
    error,
    trackEvent,
    getSubscriberAttributes,
    setSubscriberAttributes,
    refresh,
  };
}
