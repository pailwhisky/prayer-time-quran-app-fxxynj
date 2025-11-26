
import { supabase } from '../app/integrations/supabase/client';

export interface IAPVerificationRequest {
  receipt: string;
  productId: string;
  transactionId: string;
}

export interface IAPEntitlements {
  hasAccess: boolean;
  tierName: string;
  status: string;
  expiresAt?: string;
  features: string[];
  isLifetime: boolean;
  isActive: boolean;
}

export interface IAPVerificationResponse {
  success: boolean;
  entitlements?: IAPEntitlements;
  error?: string;
  details?: string;
}

/**
 * Verify an Apple IAP receipt and update user entitlements
 * @param receipt - Base64 encoded receipt data from Apple
 * @param productId - The product identifier (e.g., com.natively.premium.monthly)
 * @param transactionId - The transaction identifier from the purchase
 * @returns Verification response with entitlements
 */
export async function verifyAppleIAPReceipt(
  receipt: string,
  productId: string,
  transactionId: string
): Promise<IAPVerificationResponse> {
  try {
    console.log('Verifying Apple IAP receipt...');
    console.log('Product ID:', productId);
    console.log('Transaction ID:', transactionId);

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User not authenticated:', userError);
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Get the Edge Function URL
    const { data: { url }, error: urlError } = await supabase.functions.getUrl('apple-iap-verify');
    
    if (urlError) {
      console.error('Error getting function URL:', urlError);
      return {
        success: false,
        error: 'Failed to get verification service URL',
      };
    }

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('apple-iap-verify', {
      body: {
        receipt,
        userId: user.id,
        productId,
        transactionId,
      },
    });

    if (error) {
      console.error('Error calling verification function:', error);
      return {
        success: false,
        error: 'Verification failed',
        details: error.message,
      };
    }

    // Check if the response contains an error
    if (data.error) {
      console.error('Verification error:', data.error);
      return {
        success: false,
        error: data.error,
        details: data.details,
      };
    }

    console.log('Verification successful:', data);
    return {
      success: true,
      entitlements: data as IAPEntitlements,
    };
  } catch (error: any) {
    console.error('Exception during verification:', error);
    return {
      success: false,
      error: 'Unexpected error during verification',
      details: error.message,
    };
  }
}

/**
 * Get current user entitlements without verification
 * Useful for checking subscription status on app launch
 */
export async function getCurrentEntitlements(): Promise<IAPVerificationResponse> {
  try {
    console.log('Fetching current entitlements...');

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User not authenticated:', userError);
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Query user subscription directly
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_tiers (
          name,
          display_name,
          features
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (subError) {
      // No subscription found - return free tier
      if (subError.code === 'PGRST116') {
        console.log('No subscription found, returning free tier');
        return {
          success: true,
          entitlements: {
            hasAccess: false,
            tierName: 'free',
            status: 'none',
            features: [],
            isLifetime: false,
            isActive: false,
          },
        };
      }
      
      console.error('Error fetching subscription:', subError);
      return {
        success: false,
        error: 'Failed to fetch subscription',
        details: subError.message,
      };
    }

    const tier = subscription.subscription_tiers;
    const isLifetime = subscription.status === 'lifetime';
    const isActive = subscription.status === 'active' || subscription.status === 'lifetime';

    // Check if subscription is expired
    const isExpired = subscription.end_date && new Date(subscription.end_date) < new Date() && !isLifetime;

    console.log('Current entitlements:', {
      tierName: tier.name,
      status: subscription.status,
      isActive,
      isLifetime,
      isExpired,
    });

    return {
      success: true,
      entitlements: {
        hasAccess: isActive && !isExpired,
        tierName: tier.name,
        status: isExpired ? 'expired' : subscription.status,
        expiresAt: subscription.end_date || undefined,
        features: tier.features || [],
        isLifetime,
        isActive: isActive && !isExpired,
      },
    };
  } catch (error: any) {
    console.error('Exception fetching entitlements:', error);
    return {
      success: false,
      error: 'Unexpected error fetching entitlements',
      details: error.message,
    };
  }
}

/**
 * Restore purchases by verifying the latest receipt
 * This should be called when user taps "Restore Purchases"
 */
export async function restorePurchases(receipt: string): Promise<IAPVerificationResponse> {
  try {
    console.log('Restoring purchases...');

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User not authenticated:', userError);
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Call the Edge Function with a special restore flag
    const { data, error } = await supabase.functions.invoke('apple-iap-verify', {
      body: {
        receipt,
        userId: user.id,
        productId: 'restore', // Special flag for restore
        transactionId: 'restore',
      },
    });

    if (error) {
      console.error('Error restoring purchases:', error);
      return {
        success: false,
        error: 'Restore failed',
        details: error.message,
      };
    }

    if (data.error) {
      console.error('Restore error:', data.error);
      return {
        success: false,
        error: data.error,
        details: data.details,
      };
    }

    console.log('Purchases restored successfully:', data);
    return {
      success: true,
      entitlements: data as IAPEntitlements,
    };
  } catch (error: any) {
    console.error('Exception during restore:', error);
    return {
      success: false,
      error: 'Unexpected error during restore',
      details: error.message,
    };
  }
}
