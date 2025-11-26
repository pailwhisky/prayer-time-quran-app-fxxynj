
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  initializeRevenueCat,
  loginRevenueCatUser,
  logoutRevenueCatUser,
  getCustomerInfo,
  parseEntitlements,
  RevenueCatEntitlements,
} from '@/utils/revenueCatService';
import Purchases, { CustomerInfo } from 'react-native-purchases';

export type SubscriptionTier = 'free' | 'premium' | 'ultra' | 'super_ultra';

export interface SubscriptionTierData {
  id: string;
  name: SubscriptionTier;
  display_name: string;
  description: string;
  price_monthly: number | null;
  price_yearly: number | null;
  price_lifetime: number | null;
  features: string[];
  sort_order: number;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  tier_id: string;
  status: string;
  billing_cycle: string;
  start_date: string;
  end_date: string | null;
  auto_renew: boolean;
}

export interface SubscriptionFeature {
  feature_key: string;
  feature_name: string;
  description: string;
  category: string;
  is_premium: boolean;
  required_tier: SubscriptionTier;
}

interface SubscriptionContextType {
  currentTier: SubscriptionTier;
  subscription: UserSubscription | null;
  tiers: SubscriptionTierData[];
  features: SubscriptionFeature[];
  loading: boolean;
  entitlements: RevenueCatEntitlements | null;
  customerInfo: CustomerInfo | null;
  hasFeature: (featureKey: string) => boolean;
  refreshSubscription: () => Promise<void>;
  refreshEntitlements: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('free');
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [tiers, setTiers] = useState<SubscriptionTierData[]>([]);
  const [features, setFeatures] = useState<SubscriptionFeature[]>([]);
  const [entitlements, setEntitlements] = useState<RevenueCatEntitlements | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeSubscriptionSystem();
  }, []);

  const initializeSubscriptionSystem = async () => {
    try {
      setLoading(true);
      console.log('Initializing subscription system...');

      // Load subscription tiers and features from database
      await loadSubscriptionData();

      // Initialize RevenueCat
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        try {
          await initializeRevenueCat(user.id);
          await loadRevenueCatEntitlements();
        } catch (error) {
          console.error('Error initializing RevenueCat:', error);
          // Fall back to free tier
          setCurrentTier('free');
          setEntitlements(null);
        }
      } else {
        console.log('No user logged in or unsupported platform, using free tier');
        setCurrentTier('free');
        setEntitlements(null);
      }
    } catch (error) {
      console.error('Error initializing subscription system:', error);
      setCurrentTier('free');
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionData = async () => {
    try {
      console.log('Loading subscription data from database...');

      // Load subscription tiers
      const { data: tiersData, error: tiersError } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (tiersError) {
        console.error('Error loading tiers:', tiersError);
      } else {
        setTiers(tiersData || []);
        console.log('Loaded tiers:', tiersData?.length);
      }

      // Load subscription features
      const { data: featuresData, error: featuresError } = await supabase
        .from('subscription_features')
        .select('*');

      if (featuresError) {
        console.error('Error loading features:', featuresError);
      } else {
        setFeatures(featuresData || []);
        console.log('Loaded features:', featuresData?.length);
      }

      // Load user subscription for UI display
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: subData, error: subError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!subError && subData) {
          setSubscription(subData);
        } else {
          setSubscription(null);
        }
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    }
  };

  const loadRevenueCatEntitlements = async () => {
    try {
      console.log('Loading RevenueCat entitlements...');
      
      const info = await getCustomerInfo();
      setCustomerInfo(info);
      
      const parsedEntitlements = parseEntitlements(info);
      setEntitlements(parsedEntitlements);
      setCurrentTier(parsedEntitlements.tierName);
      
      await AsyncStorage.setItem('subscription_tier', parsedEntitlements.tierName);
      console.log('RevenueCat entitlements loaded:', parsedEntitlements.tierName);
    } catch (error) {
      console.error('Error loading RevenueCat entitlements:', error);
      setCurrentTier('free');
      setEntitlements(null);
    }
  };

  const hasFeature = (featureKey: string): boolean => {
    // Check RevenueCat entitlements first
    if (entitlements && entitlements.features.includes(featureKey)) {
      return true;
    }

    // Fall back to database feature check
    const feature = features.find(f => f.feature_key === featureKey);
    
    if (!feature) {
      console.log(`Feature ${featureKey} not found, allowing access`);
      return true; // Allow access if feature not found
    }

    // Free features are always available
    if (!feature.is_premium) {
      return true;
    }

    // Check tier hierarchy
    const tierHierarchy: SubscriptionTier[] = ['free', 'premium', 'ultra', 'super_ultra'];
    const currentTierIndex = tierHierarchy.indexOf(currentTier);
    const requiredTierIndex = tierHierarchy.indexOf(feature.required_tier);

    const hasAccess = currentTierIndex >= requiredTierIndex;
    console.log(`Feature ${featureKey}: current tier ${currentTier}, required ${feature.required_tier}, access: ${hasAccess}`);
    return hasAccess;
  };

  const refreshSubscription = async () => {
    await loadSubscriptionData();
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await loadRevenueCatEntitlements();
    }
  };

  const refreshEntitlements = async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await loadRevenueCatEntitlements();
    }
  };

  // Set up RevenueCat listener for purchase updates
  useEffect(() => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return;
    }

    const customerInfoUpdateListener = Purchases.addCustomerInfoUpdateListener(
      async (info) => {
        console.log('RevenueCat customer info updated');
        setCustomerInfo(info);
        
        const parsedEntitlements = parseEntitlements(info);
        setEntitlements(parsedEntitlements);
        setCurrentTier(parsedEntitlements.tierName);
        
        await AsyncStorage.setItem('subscription_tier', parsedEntitlements.tierName);
      }
    );

    return () => {
      customerInfoUpdateListener.remove();
    };
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        currentTier,
        subscription,
        tiers,
        features,
        loading,
        entitlements,
        customerInfo,
        hasFeature,
        refreshSubscription,
        refreshEntitlements,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
