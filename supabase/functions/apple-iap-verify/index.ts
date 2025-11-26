
// eslint-disable-next-line import/no-unresolved
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// eslint-disable-next-line import/no-unresolved
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AppleReceiptRequest {
  receipt: string;
  userId: string;
  productId: string;
  transactionId: string;
}

interface AppleTransaction {
  transactionId: string;
  originalTransactionId: string;
  productId: string;
  purchaseDate: number;
  expiresDate?: number;
  cancellationDate?: number;
  isTrialPeriod?: boolean;
  isInIntroOfferPeriod?: boolean;
  webOrderLineItemId?: string;
  subscriptionGroupIdentifier?: string;
}

interface EntitlementResponse {
  hasAccess: boolean;
  tierName: string;
  status: string;
  expiresAt?: string;
  features: string[];
  isLifetime: boolean;
  isActive: boolean;
}

// Product ID to tier mapping
const PRODUCT_TIER_MAP: Record<string, { tier: string; cycle: string }> = {
  // Premium Monthly
  "com.natively.premium.monthly": { tier: "premium", cycle: "monthly" },
  // Premium Yearly
  "com.natively.premium.yearly": { tier: "premium", cycle: "yearly" },
  // Ultra Monthly
  "com.natively.ultra.monthly": { tier: "ultra", cycle: "monthly" },
  // Ultra Yearly
  "com.natively.ultra.yearly": { tier: "ultra", cycle: "yearly" },
  // Super Ultra Lifetime
  "com.natively.superultra.lifetime": { tier: "super_ultra", cycle: "lifetime" },
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const requestData: AppleReceiptRequest = await req.json();
    const { receipt, userId, productId, transactionId } = requestData;

    console.log("Processing Apple IAP verification for user:", userId);
    console.log("Product ID:", productId);
    console.log("Transaction ID:", transactionId);

    // Validate receipt with Apple
    const appleResponse = await validateAppleReceipt(receipt);

    if (!appleResponse.success) {
      console.error("Apple receipt validation failed:", appleResponse.error);
      return new Response(
        JSON.stringify({
          error: "Receipt validation failed",
          details: appleResponse.error,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Decode and process transactions
    const transactions = decodeTransactions(appleResponse.data);
    console.log("Decoded transactions:", transactions.length);

    // Find the relevant transaction
    const relevantTransaction = transactions.find(
      (t) =>
        t.transactionId === transactionId ||
        t.originalTransactionId === transactionId
    );

    if (!relevantTransaction) {
      console.error("Transaction not found in receipt");
      return new Response(
        JSON.stringify({
          error: "Transaction not found in receipt",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check for refunds and cancellations
    const isRefunded = !!relevantTransaction.cancellationDate;
    const isExpired = relevantTransaction.expiresDate
      ? relevantTransaction.expiresDate < Date.now()
      : false;
    const isLifetime = !relevantTransaction.expiresDate;

    console.log("Transaction status:", {
      isRefunded,
      isExpired,
      isLifetime,
    });

    // Store transaction in iap_transactions table
    const { error: transactionError } = await supabase
      .from("iap_transactions")
      .upsert(
        {
          user_id: userId,
          product_id: productId,
          transaction_id: transactionId,
          receipt_data: receipt,
          verification_status: isRefunded ? "refunded" : "verified",
          apple_response: appleResponse.data,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "transaction_id",
        }
      );

    if (transactionError) {
      console.error("Error storing transaction:", transactionError);
    }

    // Update subscription status
    const subscriptionUpdate = await updateSubscriptionStatus(
      supabase,
      userId,
      productId,
      relevantTransaction,
      isRefunded
    );

    if (!subscriptionUpdate.success) {
      console.error("Error updating subscription:", subscriptionUpdate.error);
      return new Response(
        JSON.stringify({
          error: "Failed to update subscription",
          details: subscriptionUpdate.error,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calculate and return entitlements
    const entitlements = await calculateEntitlements(supabase, userId);

    console.log("Entitlements calculated:", entitlements);

    return new Response(JSON.stringify(entitlements), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing Apple IAP:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function validateAppleReceipt(
  receipt: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Use Apple's production environment
    const appleUrl = "https://buy.itunes.apple.com/verifyReceipt";
    const applePassword = Deno.env.get("APPLE_SHARED_SECRET");

    if (!applePassword) {
      console.error("APPLE_SHARED_SECRET not configured");
      return {
        success: false,
        error: "Apple shared secret not configured",
      };
    }

    const response = await fetch(appleUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "receipt-data": receipt,
        password: applePassword,
        "exclude-old-transactions": false,
      }),
    });

    const data = await response.json();

    // Status codes: 0 = valid, 21007 = sandbox receipt (retry with sandbox)
    if (data.status === 21007) {
      console.log("Sandbox receipt detected, retrying with sandbox URL");
      const sandboxUrl = "https://sandbox.itunes.apple.com/verifyReceipt";
      const sandboxResponse = await fetch(sandboxUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "receipt-data": receipt,
          password: applePassword,
          "exclude-old-transactions": false,
        }),
      });

      const sandboxData = await sandboxResponse.json();
      if (sandboxData.status === 0) {
        return { success: true, data: sandboxData };
      } else {
        return {
          success: false,
          error: `Apple validation failed with status: ${sandboxData.status}`,
        };
      }
    }

    if (data.status === 0) {
      return { success: true, data };
    } else {
      return {
        success: false,
        error: `Apple validation failed with status: ${data.status}`,
      };
    }
  } catch (error) {
    console.error("Error validating Apple receipt:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

function decodeTransactions(appleData: any): AppleTransaction[] {
  const transactions: AppleTransaction[] = [];

  // Handle latest_receipt_info (for subscriptions)
  if (appleData.latest_receipt_info) {
    for (const item of appleData.latest_receipt_info) {
      transactions.push({
        transactionId: item.transaction_id,
        originalTransactionId: item.original_transaction_id,
        productId: item.product_id,
        purchaseDate: parseInt(item.purchase_date_ms),
        expiresDate: item.expires_date_ms
          ? parseInt(item.expires_date_ms)
          : undefined,
        cancellationDate: item.cancellation_date_ms
          ? parseInt(item.cancellation_date_ms)
          : undefined,
        isTrialPeriod: item.is_trial_period === "true",
        isInIntroOfferPeriod: item.is_in_intro_offer_period === "true",
        webOrderLineItemId: item.web_order_line_item_id,
        subscriptionGroupIdentifier: item.subscription_group_identifier,
      });
    }
  }

  // Handle in_app purchases (for non-consumables and lifetime purchases)
  if (appleData.receipt?.in_app) {
    for (const item of appleData.receipt.in_app) {
      transactions.push({
        transactionId: item.transaction_id,
        originalTransactionId: item.original_transaction_id,
        productId: item.product_id,
        purchaseDate: parseInt(item.purchase_date_ms),
        expiresDate: item.expires_date_ms
          ? parseInt(item.expires_date_ms)
          : undefined,
        cancellationDate: item.cancellation_date_ms
          ? parseInt(item.cancellation_date_ms)
          : undefined,
        isTrialPeriod: item.is_trial_period === "true",
        isInIntroOfferPeriod: item.is_in_intro_offer_period === "true",
        webOrderLineItemId: item.web_order_line_item_id,
        subscriptionGroupIdentifier: item.subscription_group_identifier,
      });
    }
  }

  return transactions;
}

async function updateSubscriptionStatus(
  supabase: any,
  userId: string,
  productId: string,
  transaction: AppleTransaction,
  isRefunded: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get tier mapping
    const tierMapping = PRODUCT_TIER_MAP[productId];
    if (!tierMapping) {
      console.error("Unknown product ID:", productId);
      return { success: false, error: "Unknown product ID" };
    }

    // Get tier ID from database
    const { data: tierData, error: tierError } = await supabase
      .from("subscription_tiers")
      .select("id")
      .eq("name", tierMapping.tier)
      .single();

    if (tierError || !tierData) {
      console.error("Error fetching tier:", tierError);
      return { success: false, error: "Tier not found" };
    }

    const tierId = tierData.id;

    // Determine subscription status
    let status = "active";
    if (isRefunded) {
      status = "refunded";
    } else if (transaction.expiresDate && transaction.expiresDate < Date.now()) {
      status = "expired";
    } else if (!transaction.expiresDate) {
      status = "lifetime";
    }

    // Calculate dates
    const startDate = new Date(transaction.purchaseDate).toISOString();
    const endDate = transaction.expiresDate
      ? new Date(transaction.expiresDate).toISOString()
      : null;

    // Update or insert subscription
    const { error: upsertError } = await supabase
      .from("user_subscriptions")
      .upsert(
        {
          user_id: userId,
          tier_id: tierId,
          status,
          billing_cycle: tierMapping.cycle,
          start_date: startDate,
          end_date: endDate,
          auto_renew: !isRefunded && !!transaction.expiresDate,
          payment_method: "apple_iap",
          last_payment_date: startDate,
          next_payment_date: endDate,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (upsertError) {
      console.error("Error upserting subscription:", upsertError);
      return { success: false, error: upsertError.message };
    }

    console.log("Subscription updated successfully for user:", userId);
    return { success: true };
  } catch (error) {
    console.error("Error in updateSubscriptionStatus:", error);
    return { success: false, error: error.message };
  }
}

async function calculateEntitlements(
  supabase: any,
  userId: string
): Promise<EntitlementResponse> {
  try {
    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select(
        `
        *,
        subscription_tiers (
          name,
          display_name,
          features
        )
      `
      )
      .eq("user_id", userId)
      .single();

    if (subError || !subscription) {
      console.log("No subscription found for user:", userId);
      // Return free tier entitlements
      return {
        hasAccess: false,
        tierName: "free",
        status: "none",
        features: [],
        isLifetime: false,
        isActive: false,
      };
    }

    const tier = subscription.subscription_tiers;
    const isLifetime = subscription.status === "lifetime";
    const isActive =
      subscription.status === "active" || subscription.status === "lifetime";

    // Check if subscription is expired
    if (
      subscription.end_date &&
      new Date(subscription.end_date) < new Date() &&
      !isLifetime
    ) {
      // Update status to expired
      await supabase
        .from("user_subscriptions")
        .update({ status: "expired" })
        .eq("user_id", userId);

      return {
        hasAccess: false,
        tierName: tier.name,
        status: "expired",
        expiresAt: subscription.end_date,
        features: [],
        isLifetime: false,
        isActive: false,
      };
    }

    return {
      hasAccess: isActive,
      tierName: tier.name,
      status: subscription.status,
      expiresAt: subscription.end_date || undefined,
      features: tier.features || [],
      isLifetime,
      isActive,
    };
  } catch (error) {
    console.error("Error calculating entitlements:", error);
    // Return free tier on error
    return {
      hasAccess: false,
      tierName: "free",
      status: "error",
      features: [],
      isLifetime: false,
      isActive: false,
    };
  }
}
