
import Purchases, {
  CustomerInfo,
  PurchasesPackage,
  PurchasesOffering,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { supabase } from '@/app/integrations/supabase/client';

/**
 * RevenueCat API Keys Configuration
 * 
 * SECURITY NOTE: RevenueCat API keys are PUBLIC keys and are safe to expose.
 * They work similarly to your Supabase anon key - they identify your app
 * but don't grant privileged access. The actual subscription verification
 * and entitlement management happens on RevenueCat's servers.
 * 
 * These keys should be set in your .env file:
 * - EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
 * - EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
 */
const REVENUECAT_IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '';
const REVENUECAT_ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || '';

export type SubscriptionTier = 'free' | 'premium' | 'ultra' | 'super_ultra';

export interface RevenueCatEntitlements {
  hasAccess: boolean;
  tierName: SubscriptionTier;
  status: string;
  expiresAt?: string;
  features: string[];
  isLifetime: boolean;
  isActive: boolean;
}

/**
 * Initialize RevenueCat SDK
 * Call this once when the app starts
 */
export async function initializeRevenueCat(userId?: string): Promise<void> {
  try {
    console.log('Initializing RevenueCat...');

    // Set log level for debugging (remove in production)
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    // Configure SDK with platform-specific API key
    if (Platform.OS === 'ios') {
      if (!REVENUECAT_IOS_API_KEY) {
        console.warn('RevenueCat iOS API key not configured');
        return;
      }
      await Purchases.configure({ apiKey: REVENUECAT_IOS_API_KEY });
    } else if (Platform.OS === 'android') {
      if (!REVENUECAT_ANDROID_API_KEY) {
        console.warn('RevenueCat Android API key not configured');
        return;
      }
      await Purchases.configure({ apiKey: REVENUECAT_ANDROID_API_KEY });
    } else {
      console.log('RevenueCat not supported on this platform');
      return;
    }

    // Set user ID if provided
    if (userId) {
      await Purchases.logIn(userId);
      console.log('RevenueCat user logged in:', userId);
    }

    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
    throw error;
  }
}

/**
 * Log in a user to RevenueCat
 */
export async function loginRevenueCatUser(userId: string): Promise<void> {
  try {
    console.log('Logging in RevenueCat user:', userId);
    const { customerInfo } = await Purchases.logIn(userId);
    console.log('RevenueCat user logged in successfully');
    return;
  } catch (error) {
    console.error('Error logging in RevenueCat user:', error);
    throw error;
  }
}

/**
 * Log out the current user from RevenueCat
 */
export async function logoutRevenueCatUser(): Promise<void> {
  try {
    console.log('Logging out RevenueCat user');
    const { customerInfo } = await Purchases.logOut();
    console.log('RevenueCat user logged out successfully');
    return;
  } catch (error) {
    console.error('Error logging out RevenueCat user:', error);
    throw error;
  }
}

/**
 * Get available subscription offerings from RevenueCat
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    console.log('Fetching RevenueCat offerings...');
    const offerings = await Purchases.getOfferings();
    
    if (offerings.current !== null) {
      console.log('Current offering:', offerings.current.identifier);
      console.log('Available packages:', offerings.current.availablePackages.length);
      return offerings.current;
    } else {
      console.log('No current offering available');
      return null;
    }
  } catch (error) {
    console.error('Error fetching offerings:', error);
    throw error;
  }
}

/**
 * Purchase a subscription package
 */
export async function purchasePackage(
  packageToPurchase: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
  try {
    console.log('Purchasing package:', packageToPurchase.identifier);
    
    const { customerInfo, productIdentifier } = await Purchases.purchasePackage(
      packageToPurchase
    );

    console.log('Purchase successful!');
    console.log('Product ID:', productIdentifier);
    console.log('Active entitlements:', Object.keys(customerInfo.entitlements.active));

    // Sync with Supabase
    await syncCustomerInfoWithSupabase(customerInfo);

    return { success: true, customerInfo };
  } catch (error: any) {
    console.error('Error purchasing package:', error);
    
    // Check if user cancelled
    if (error.userCancelled) {
      console.log('User cancelled purchase');
      return { success: false, error: 'User cancelled' };
    }

    return { success: false, error: error.message || 'Purchase failed' };
  }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  try {
    console.log('Restoring purchases...');
    const customerInfo = await Purchases.restorePurchases();
    
    console.log('Purchases restored successfully');
    console.log('Active entitlements:', Object.keys(customerInfo.entitlements.active));

    // Sync with Supabase
    await syncCustomerInfoWithSupabase(customerInfo);

    return { success: true, customerInfo };
  } catch (error: any) {
    console.error('Error restoring purchases:', error);
    return { success: false, error: error.message || 'Restore failed' };
  }
}

/**
 * Get current customer info and entitlements
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  try {
    console.log('Fetching customer info...');
    const customerInfo = await Purchases.getCustomerInfo();
    console.log('Customer info fetched successfully');
    console.log('Active entitlements:', Object.keys(customerInfo.entitlements.active));
    return customerInfo;
  } catch (error) {
    console.error('Error fetching customer info:', error);
    throw error;
  }
}

/**
 * Parse RevenueCat customer info into app entitlements
 */
export function parseEntitlements(customerInfo: CustomerInfo): RevenueCatEntitlements {
  const activeEntitlements = customerInfo.entitlements.active;
  
  // Check for entitlements in order of priority
  let tierName: SubscriptionTier = 'free';
  let isLifetime = false;
  let expiresAt: string | undefined;
  let features: string[] = [];

  // Super Ultra (highest tier)
  if (activeEntitlements['super_ultra']) {
    tierName = 'super_ultra';
    const entitlement = activeEntitlements['super_ultra'];
    isLifetime = entitlement.willRenew === false && entitlement.periodType === 'NORMAL';
    expiresAt = entitlement.expirationDate || undefined;
    features = [
      'lifetime_access',
      'all_premium_features',
      'all_ultra_features',
      'priority_support',
      'early_access_to_new_features',
      'exclusive_content',
      'custom_prayer_reminders',
      'advanced_analytics',
      'personalized_learning_path',
      'exclusive_community_access',
      'one_on_one_spiritual_guidance',
      'custom_app_themes',
      'offline_quran_audio',
      'advanced_memorization_tools',
    ];
  }
  // Ultra
  else if (activeEntitlements['ultra']) {
    tierName = 'ultra';
    const entitlement = activeEntitlements['ultra'];
    expiresAt = entitlement.expirationDate || undefined;
    features = [
      'all_premium_features',
      'advanced_notifications',
      'mosque_finder',
      'hijri_calendar',
      'ai_assistant',
      'daily_hadith',
      'enhanced_quotes',
    ];
  }
  // Premium
  else if (activeEntitlements['premium']) {
    tierName = 'premium';
    const entitlement = activeEntitlements['premium'];
    expiresAt = entitlement.expirationDate || undefined;
    features = [
      'prayer_times',
      'quran_reader',
      'qibla_compass',
      'adhan_player',
      'ar_qibla',
      'dua_library',
      'islamic_calendar',
    ];
  }

  const hasAccess = tierName !== 'free';
  const isActive = hasAccess;

  return {
    hasAccess,
    tierName,
    status: isActive ? 'active' : 'none',
    expiresAt,
    features,
    isLifetime,
    isActive,
  };
}

/**
 * Sync RevenueCat customer info with Supabase database
 */
async function syncCustomerInfoWithSupabase(customerInfo: CustomerInfo): Promise<void> {
  try {
    console.log('Syncing customer info with Supabase...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user logged in');
      return;
    }

    const entitlements = parseEntitlements(customerInfo);

    // Get tier ID from database
    const { data: tierData, error: tierError } = await supabase
      .from('subscription_tiers')
      .select('id')
      .eq('name', entitlements.tierName)
      .single();

    if (tierError || !tierData) {
      console.error('Error fetching tier:', tierError);
      return;
    }

    // Determine status
    let status = 'active';
    if (entitlements.isLifetime) {
      status = 'lifetime';
    } else if (!entitlements.isActive) {
      status = 'expired';
    }

    // Update or insert subscription
    const { error: upsertError } = await supabase
      .from('user_subscriptions')
      .upsert(
        {
          user_id: user.id,
          tier_id: tierData.id,
          status,
          billing_cycle: entitlements.isLifetime ? 'lifetime' : 'monthly',
          start_date: new Date().toISOString(),
          end_date: entitlements.expiresAt || null,
          auto_renew: !entitlements.isLifetime,
          payment_method: 'revenuecat',
          last_payment_date: new Date().toISOString(),
          next_payment_date: entitlements.expiresAt || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      );

    if (upsertError) {
      console.error('Error syncing subscription:', upsertError);
    } else {
      console.log('Subscription synced successfully');
    }
  } catch (error) {
    console.error('Error syncing with Supabase:', error);
  }
}

/**
 * Check if user has access to a specific feature
 */
export function hasFeatureAccess(
  customerInfo: CustomerInfo,
  featureKey: string
): boolean {
  const entitlements = parseEntitlements(customerInfo);
  return entitlements.features.includes(featureKey);
}

/**
 * Get subscription status for display
 */
export function getSubscriptionStatus(customerInfo: CustomerInfo): {
  tier: SubscriptionTier;
  isActive: boolean;
  expiresAt?: string;
  willRenew: boolean;
} {
  const entitlements = parseEntitlements(customerInfo);
  
  // Check if any active subscription will renew
  const activeEntitlements = Object.values(customerInfo.entitlements.active);
  const willRenew = activeEntitlements.some(e => e.willRenew);

  return {
    tier: entitlements.tierName,
    isActive: entitlements.isActive,
    expiresAt: entitlements.expiresAt,
    willRenew,
  };
}
