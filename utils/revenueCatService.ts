
import Purchases, {
  CustomerInfo,
  PurchasesPackage,
  PurchasesOffering,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { supabase } from '@/app/integrations/supabase/client';

/**
 * RevenueCat Configuration
 * 
 * IMPORTANT: Use your actual API key from RevenueCat Dashboard
 * API Key: test_amHZgULphTOfAXgpIlAcujAxXvZ
 * 
 * SECURITY NOTE: RevenueCat API keys are PUBLIC keys and are safe to expose.
 * They work similarly to your Supabase anon key - they identify your app
 * but don't grant privileged access. The actual subscription verification
 * and entitlement management happens on RevenueCat's servers.
 */
const REVENUECAT_API_KEY = 'test_amHZgULphTOfAXgpIlAcujAxXvZ';

// Entitlement identifier - this should match what you configure in RevenueCat Dashboard
export const ENTITLEMENT_ID = 'my prayer Pro';

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
 * 
 * @param userId - Optional user ID to identify the user across devices
 */
export async function initializeRevenueCat(userId?: string): Promise<void> {
  try {
    console.log('🚀 Initializing RevenueCat...');

    // Set log level for debugging (use LOG_LEVEL.INFO in production)
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    } else {
      Purchases.setLogLevel(LOG_LEVEL.INFO);
    }

    // Check platform support
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      console.log('⚠️ RevenueCat not supported on this platform');
      return;
    }

    // Configure SDK with API key
    await Purchases.configure({ 
      apiKey: REVENUECAT_API_KEY,
      // Optional: Set app user ID for cross-platform identification
      appUserID: userId,
    });

    console.log('✅ RevenueCat initialized successfully');

    // Log in user if provided (for cross-device subscription sync)
    if (userId) {
      await loginRevenueCatUser(userId);
    }

    // Set up listener for customer info updates
    setupCustomerInfoListener();

  } catch (error) {
    console.error('❌ Error initializing RevenueCat:', error);
    throw error;
  }
}

/**
 * Set up listener for real-time customer info updates
 * This ensures the app stays in sync with subscription changes
 */
function setupCustomerInfoListener(): void {
  Purchases.addCustomerInfoUpdateListener((customerInfo) => {
    console.log('📱 Customer info updated:', {
      activeEntitlements: Object.keys(customerInfo.entitlements.active),
      activeSubscriptions: Object.keys(customerInfo.activeSubscriptions),
    });
    
    // Sync with Supabase whenever customer info changes
    syncCustomerInfoWithSupabase(customerInfo).catch(error => {
      console.error('Error syncing customer info:', error);
    });
  });
}

/**
 * Log in a user to RevenueCat
 * This enables cross-device subscription sync
 * 
 * @param userId - Unique user identifier (e.g., Supabase user ID)
 */
export async function loginRevenueCatUser(userId: string): Promise<CustomerInfo> {
  try {
    console.log('👤 Logging in RevenueCat user:', userId);
    const { customerInfo } = await Purchases.logIn(userId);
    console.log('✅ RevenueCat user logged in successfully');
    console.log('Active entitlements:', Object.keys(customerInfo.entitlements.active));
    return customerInfo;
  } catch (error) {
    console.error('❌ Error logging in RevenueCat user:', error);
    throw error;
  }
}

/**
 * Log out the current user from RevenueCat
 * Call this when user signs out of your app
 */
export async function logoutRevenueCatUser(): Promise<CustomerInfo> {
  try {
    console.log('👋 Logging out RevenueCat user');
    const { customerInfo } = await Purchases.logOut();
    console.log('✅ RevenueCat user logged out successfully');
    return customerInfo;
  } catch (error) {
    console.error('❌ Error logging out RevenueCat user:', error);
    throw error;
  }
}

/**
 * Get available subscription offerings from RevenueCat
 * Offerings are configured in the RevenueCat Dashboard
 * 
 * @returns Current offering with available packages (monthly, yearly, lifetime)
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    console.log('📦 Fetching RevenueCat offerings...');
    const offerings = await Purchases.getOfferings();
    
    if (offerings.current !== null) {
      console.log('✅ Current offering:', offerings.current.identifier);
      console.log('Available packages:', offerings.current.availablePackages.map(p => ({
        identifier: p.identifier,
        packageType: p.packageType,
        product: {
          identifier: p.product.identifier,
          price: p.product.priceString,
        }
      })));
      return offerings.current;
    } else {
      console.log('⚠️ No current offering available');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching offerings:', error);
    throw error;
  }
}

/**
 * Purchase a subscription package
 * 
 * @param packageToPurchase - The package to purchase (from getOfferings)
 * @returns Purchase result with customer info
 */
export async function purchasePackage(
  packageToPurchase: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
  try {
    console.log('💳 Purchasing package:', packageToPurchase.identifier);
    
    const { customerInfo, productIdentifier } = await Purchases.purchasePackage(
      packageToPurchase
    );

    console.log('✅ Purchase successful!');
    console.log('Product ID:', productIdentifier);
    console.log('Active entitlements:', Object.keys(customerInfo.entitlements.active));

    // Sync with Supabase
    await syncCustomerInfoWithSupabase(customerInfo);

    return { success: true, customerInfo };
  } catch (error: any) {
    console.error('❌ Error purchasing package:', error);
    
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
 * Important for iOS App Store guidelines
 * 
 * @returns Restore result with customer info
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  try {
    console.log('🔄 Restoring purchases...');
    const customerInfo = await Purchases.restorePurchases();
    
    console.log('✅ Purchases restored successfully');
    console.log('Active entitlements:', Object.keys(customerInfo.entitlements.active));

    // Sync with Supabase
    await syncCustomerInfoWithSupabase(customerInfo);

    return { success: true, customerInfo };
  } catch (error: any) {
    console.error('❌ Error restoring purchases:', error);
    return { success: false, error: error.message || 'Restore failed' };
  }
}

/**
 * Get current customer info and entitlements
 * This is cached by RevenueCat and updated automatically
 * 
 * @returns Current customer info with entitlements
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  try {
    console.log('📊 Fetching customer info...');
    const customerInfo = await Purchases.getCustomerInfo();
    console.log('✅ Customer info fetched successfully');
    console.log('Active entitlements:', Object.keys(customerInfo.entitlements.active));
    return customerInfo;
  } catch (error) {
    console.error('❌ Error fetching customer info:', error);
    throw error;
  }
}

/**
 * Check if user has access to "my prayer Pro" entitlement
 * This is the main entitlement check for your app
 * 
 * @param customerInfo - Customer info from RevenueCat
 * @returns True if user has active "my prayer Pro" entitlement
 */
export function hasMyPrayerProAccess(customerInfo: CustomerInfo): boolean {
  const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
  const hasAccess = entitlement?.isActive === true;
  
  console.log(`🔐 Checking "${ENTITLEMENT_ID}" access:`, hasAccess);
  
  return hasAccess;
}

/**
 * Parse RevenueCat customer info into app entitlements
 * Maps RevenueCat entitlements to your app's tier system
 * 
 * @param customerInfo - Customer info from RevenueCat
 * @returns Parsed entitlements with tier and features
 */
export function parseEntitlements(customerInfo: CustomerInfo): RevenueCatEntitlements {
  const activeEntitlements = customerInfo.entitlements.active;
  
  // Check for entitlements in order of priority
  let tierName: SubscriptionTier = 'free';
  let isLifetime = false;
  let expiresAt: string | undefined;
  let features: string[] = [];

  // Check for "my prayer Pro" entitlement
  const myPrayerPro = activeEntitlements[ENTITLEMENT_ID];
  
  if (myPrayerPro && myPrayerPro.isActive) {
    // Determine tier based on product identifier
    const productId = myPrayerPro.productIdentifier.toLowerCase();
    
    if (productId.includes('super_ultra') || productId.includes('superultra')) {
      tierName = 'super_ultra';
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
    } else if (productId.includes('ultra')) {
      tierName = 'ultra';
      features = [
        'all_premium_features',
        'advanced_notifications',
        'mosque_finder',
        'hijri_calendar',
        'ai_assistant',
        'daily_hadith',
        'enhanced_quotes',
      ];
    } else {
      tierName = 'premium';
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
    
    // Check if it's a lifetime purchase
    isLifetime = productId.includes('lifetime');
    expiresAt = myPrayerPro.expirationDate || undefined;
  }

  const hasAccess = tierName !== 'free';
  const isActive = hasAccess;

  console.log('📋 Parsed entitlements:', {
    tierName,
    hasAccess,
    isLifetime,
    expiresAt,
    featuresCount: features.length,
  });

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
 * This keeps your database in sync with subscription status
 * 
 * @param customerInfo - Customer info from RevenueCat
 */
async function syncCustomerInfoWithSupabase(customerInfo: CustomerInfo): Promise<void> {
  try {
    console.log('🔄 Syncing customer info with Supabase...');

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

    // Determine billing cycle
    let billingCycle = 'monthly';
    const activeEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    if (activeEntitlement) {
      const productId = activeEntitlement.productIdentifier.toLowerCase();
      if (productId.includes('yearly') || productId.includes('annual')) {
        billingCycle = 'yearly';
      } else if (productId.includes('lifetime')) {
        billingCycle = 'lifetime';
      }
    }

    // Update or insert subscription
    const { error: upsertError } = await supabase
      .from('user_subscriptions')
      .upsert(
        {
          user_id: user.id,
          tier_id: tierData.id,
          status,
          billing_cycle: billingCycle,
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
      console.log('✅ Subscription synced successfully');
    }
  } catch (error) {
    console.error('❌ Error syncing with Supabase:', error);
  }
}

/**
 * Check if user has access to a specific feature
 * 
 * @param customerInfo - Customer info from RevenueCat
 * @param featureKey - Feature key to check
 * @returns True if user has access to the feature
 */
export function hasFeatureAccess(
  customerInfo: CustomerInfo,
  featureKey: string
): boolean {
  const entitlements = parseEntitlements(customerInfo);
  const hasAccess = entitlements.features.includes(featureKey);
  
  console.log(`🔐 Feature "${featureKey}" access:`, hasAccess);
  
  return hasAccess;
}

/**
 * Get subscription status for display
 * 
 * @param customerInfo - Customer info from RevenueCat
 * @returns Subscription status details
 */
export function getSubscriptionStatus(customerInfo: CustomerInfo): {
  tier: SubscriptionTier;
  isActive: boolean;
  expiresAt?: string;
  willRenew: boolean;
  productIdentifier?: string;
} {
  const entitlements = parseEntitlements(customerInfo);
  
  // Check if any active subscription will renew
  const activeEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
  const willRenew = activeEntitlement?.willRenew || false;
  const productIdentifier = activeEntitlement?.productIdentifier;

  return {
    tier: entitlements.tierName,
    isActive: entitlements.isActive,
    expiresAt: entitlements.expiresAt,
    willRenew,
    productIdentifier,
  };
}

/**
 * Check if RevenueCat is properly configured
 * 
 * @returns True if RevenueCat is configured
 */
export function isRevenueCatConfigured(): boolean {
  return Purchases.isConfigured();
}

/**
 * Get the app user ID currently set in RevenueCat
 * 
 * @returns Current app user ID
 */
export async function getAppUserId(): Promise<string> {
  try {
    const appUserId = await Purchases.getAppUserID();
    console.log('Current app user ID:', appUserId);
    return appUserId;
  } catch (error) {
    console.error('Error getting app user ID:', error);
    throw error;
  }
}
