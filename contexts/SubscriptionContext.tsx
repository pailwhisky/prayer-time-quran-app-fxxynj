
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SubscriptionTier = 'free' | 'premium' | 'ultra';

export interface SubscriptionTierData {
  id: string;
  name: SubscriptionTier;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
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
  hasFeature: (featureKey: string) => boolean;
  upgradeTier: (tierName: SubscriptionTier, billingCycle: 'monthly' | 'yearly') => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);

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
      }

      // Load subscription features
      const { data: featuresData, error: featuresError } = await supabase
        .from('subscription_features')
        .select('*');

      if (featuresError) {
        console.error('Error loading features:', featuresError);
      } else {
        setFeatures(featuresData || []);
      }

      // Load user subscription
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: subData, error: subError } = await supabase
          .from('user_subscriptions')
          .select('*, subscription_tiers(name)')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (subError) {
          console.log('No active subscription found, using free tier');
          setCurrentTier('free');
          setSubscription(null);
        } else if (subData) {
          setSubscription(subData);
          const tierName = (subData as any).subscription_tiers?.name || 'free';
          setCurrentTier(tierName);
          await AsyncStorage.setItem('subscription_tier', tierName);
        }
      } else {
        // Not logged in, use free tier
        setCurrentTier('free');
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      setCurrentTier('free');
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (featureKey: string): boolean => {
    const feature = features.find(f => f.feature_key === featureKey);
    
    if (!feature) {
      console.warn(`Feature ${featureKey} not found`);
      return false;
    }

    // Free features are always available
    if (!feature.is_premium) {
      return true;
    }

    // Check tier hierarchy
    const tierHierarchy: SubscriptionTier[] = ['free', 'premium', 'ultra'];
    const currentTierIndex = tierHierarchy.indexOf(currentTier);
    const requiredTierIndex = tierHierarchy.indexOf(feature.required_tier);

    return currentTierIndex >= requiredTierIndex;
  };

  const upgradeTier = async (tierName: SubscriptionTier, billingCycle: 'monthly' | 'yearly'): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('User not logged in');
        return false;
      }

      // Find the tier
      const tier = tiers.find(t => t.name === tierName);
      if (!tier) {
        console.error('Tier not found');
        return false;
      }

      // Calculate end date based on billing cycle
      const startDate = new Date();
      const endDate = new Date();
      if (billingCycle === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Create or update subscription
      const subscriptionData = {
        user_id: user.id,
        tier_id: tier.id,
        status: 'active',
        billing_cycle: billingCycle,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: true,
        payment_method: 'demo', // In production, integrate with payment provider
        last_payment_date: startDate.toISOString(),
        next_payment_date: endDate.toISOString(),
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

      // Refresh subscription data
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

      // Refresh subscription data
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

  return (
    <SubscriptionContext.Provider
      value={{
        currentTier,
        subscription,
        tiers,
        features,
        loading,
        hasFeature,
        upgradeTier,
        cancelSubscription,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
