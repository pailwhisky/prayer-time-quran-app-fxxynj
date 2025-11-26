
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentEntitlements, IAPEntitlements } from '@/utils/appleIAPVerification';

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
  entitlements: IAPEntitlements | null;
  hasFeature: (featureKey: string) => boolean;
  upgradeTier: (tierName: SubscriptionTier, billingCycle: 'monthly' | 'yearly' | 'lifetime') => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
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
  const [entitlements, setEntitlements] = useState<IAPEntitlements | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      console.log('Loading subscription data...');

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
        console.log('Loaded tiers:', tiersData);
      }

      // Load subscription features
      const { data: featuresData, error: featuresError } = await supabase
        .from('subscription_features')
        .select('*');

      if (featuresError) {
        console.error('Error loading features:', featuresError);
      } else {
        setFeatures(featuresData || []);
        console.log('Loaded features:', featuresData);
      }

      // Load user subscription and entitlements
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch entitlements from the verification system
        const entitlementsResult = await getCurrentEntitlements();
        
        if (entitlementsResult.success && entitlementsResult.entitlements) {
          setEntitlements(entitlementsResult.entitlements);
          const tierName = entitlementsResult.entitlements.tierName as SubscriptionTier;
          setCurrentTier(tierName);
          await AsyncStorage.setItem('subscription_tier', tierName);
          console.log('User entitlements loaded:', entitlementsResult.entitlements);
        } else {
          console.log('Failed to load entitlements, using free tier');
          setCurrentTier('free');
          setEntitlements(null);
        }

        // Also load subscription data for UI display
        const { data: subData, error: subError } = await supabase
          .from('user_subscriptions')
          .select('*, subscription_tiers(name)')
          .eq('user_id', user.id)
          .single();

        if (!subError && subData) {
          setSubscription(subData);
        } else {
          setSubscription(null);
        }
      } else {
        console.log('No user logged in, using free tier');
        setCurrentTier('free');
        setSubscription(null);
        setEntitlements(null);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      setCurrentTier('free');
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (featureKey: string): boolean => {
    // For now, allow all features for free tier to test the app
    // In production, you would check the actual feature requirements
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

  const upgradeTier = async (tierName: SubscriptionTier, billingCycle: 'monthly' | 'yearly' | 'lifetime'): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('User not logged in');
        return false;
      }

      const tier = tiers.find(t => t.name === tierName);
      if (!tier) {
        console.error('Tier not found');
        return false;
      }

      const startDate = new Date();
      let endDate: Date | null = null;
      
      // Lifetime subscriptions don't have an end date
      if (billingCycle !== 'lifetime') {
        endDate = new Date();
        if (billingCycle === 'monthly') {
          endDate.setMonth(endDate.getMonth() + 1);
        } else {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }
      }

      const subscriptionData = {
        user_id: user.id,
        tier_id: tier.id,
        status: 'active',
        billing_cycle: billingCycle,
        start_date: startDate.toISOString(),
        end_date: endDate ? endDate.toISOString() : null,
        auto_renew: billingCycle !== 'lifetime', // Lifetime doesn't auto-renew
        payment_method: 'demo',
        last_payment_date: startDate.toISOString(),
        next_payment_date: endDate ? endDate.toISOString() : null,
      };

      const { error } = await supabase
        .from('user_subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'user_id',
        });

      if (error) {
        console.error('Error upgrading subscription:', error);
        return false;
      }

      await loadSubscriptionData();
      return true;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      return false;
    }
  };

  const cancelSubscription = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('User not logged in');
        return false;
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'cancelled',
          auto_renew: false,
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error cancelling subscription:', error);
        return false;
      }

      await loadSubscriptionData();
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }
  };

  const refreshSubscription = async () => {
    await loadSubscriptionData();
  };

  const refreshEntitlements = async () => {
    try {
      console.log('Refreshing entitlements...');
      const entitlementsResult = await getCurrentEntitlements();
      
      if (entitlementsResult.success && entitlementsResult.entitlements) {
        setEntitlements(entitlementsResult.entitlements);
        const tierName = entitlementsResult.entitlements.tierName as SubscriptionTier;
        setCurrentTier(tierName);
        await AsyncStorage.setItem('subscription_tier', tierName);
        console.log('Entitlements refreshed:', entitlementsResult.entitlements);
      } else {
        console.log('Failed to refresh entitlements');
      }
    } catch (error) {
      console.error('Error refreshing entitlements:', error);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        currentTier,
        subscription,
        tiers,
        features,
        loading,
        entitlements,
        hasFeature,
        upgradeTier,
        cancelSubscription,
        refreshSubscription,
        refreshEntitlements,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
