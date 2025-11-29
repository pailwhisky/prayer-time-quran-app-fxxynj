
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { useRevenueCatPaywall } from '@/hooks/useRevenueCatPaywall';
import { useRevenueCatCustomerCenter } from '@/hooks/useRevenueCatCustomerCenter';
import { IconSymbol } from '@/components/IconSymbol';

/**
 * Example component demonstrating all RevenueCat features
 * 
 * This component shows:
 * 1. Entitlement checking
 * 2. Custom purchase UI
 * 3. RevenueCat Paywall
 * 4. Customer Center
 * 5. Restore purchases
 * 6. Subscription status display
 */
export default function RevenueCatExample() {
  const { 
    currentTier, 
    entitlements, 
    hasFeature, 
    loading: contextLoading 
  } = useSubscription();
  
  const {
    offerings,
    loadOfferings,
    purchase,
    restore,
    loading: purchaseLoading,
  } = useRevenueCat();
  
  const {
    showPaywall,
    showPaywallIfNeeded,
    loading: paywallLoading,
  } = useRevenueCatPaywall();
  
  const {
    showCustomerCenter,
    loading: customerCenterLoading,
  } = useRevenueCatCustomerCenter();

  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loading = contextLoading || purchaseLoading || paywallLoading || customerCenterLoading;

  // Example 1: Check if user has "my prayer Pro" access
  const hasProAccess = entitlements?.hasAccess || false;

  // Example 2: Check specific features
  const canUseAdvancedNotifications = hasFeature('advanced_notifications');
  const canUseMosqueFinder = hasFeature('mosque_finder');
  const canUseAIAssistant = hasFeature('ai_assistant');

  // Example 3: Handle premium feature access
  const handlePremiumFeature = async () => {
    // Show paywall only if user doesn't have access
    const result = await showPaywallIfNeeded('my prayer Pro');
    
    if (result === null) {
      // User has access, show the feature
      Alert.alert('Success', 'You have access to this premium feature!');
    }
  };

  // Example 4: Purchase with custom UI
  const handleCustomPurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('No Package Selected', 'Please select a subscription package');
      return;
    }
    await purchase(selectedPackage);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Subscription Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Subscription Status</Text>
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.label}>Current Tier:</Text>
            <Text style={styles.value}>{currentTier}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.label}>Has Pro Access:</Text>
            <Text style={[styles.value, hasProAccess && styles.valueSuccess]}>
              {hasProAccess ? '✅ Yes' : '❌ No'}
            </Text>
          </View>
          {entitlements?.expiresAt && (
            <View style={styles.statusRow}>
              <Text style={styles.label}>Expires:</Text>
              <Text style={styles.value}>
                {new Date(entitlements.expiresAt).toLocaleDateString()}
              </Text>
            </View>
          )}
          {entitlements?.isLifetime && (
            <View style={styles.statusRow}>
              <Text style={styles.label}>Type:</Text>
              <Text style={[styles.value, styles.valueSuccess]}>
                ⭐ Lifetime
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Feature Access */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔐 Feature Access</Text>
        <View style={styles.card}>
          <View style={styles.featureRow}>
            <Text style={styles.featureText}>Advanced Notifications</Text>
            <IconSymbol 
              name={canUseAdvancedNotifications ? 'check-circle' : 'x-circle'}
              size={20}
              color={canUseAdvancedNotifications ? colors.primary : colors.textSecondary}
            />
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureText}>Mosque Finder</Text>
            <IconSymbol 
              name={canUseMosqueFinder ? 'check-circle' : 'x-circle'}
              size={20}
              color={canUseMosqueFinder ? colors.primary : colors.textSecondary}
            />
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureText}>AI Assistant</Text>
            <IconSymbol 
              name={canUseAIAssistant ? 'check-circle' : 'x-circle'}
              size={20}
              color={canUseAIAssistant ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>
      </View>

      {/* RevenueCat Paywall (Recommended) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎨 RevenueCat Paywall</Text>
        <Text style={styles.description}>
          Pre-built, conversion-optimized UI with remote configuration
        </Text>
        
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={() => showPaywall()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <>
              <IconSymbol name="star" size={20} color={colors.card} />
              <Text style={styles.buttonText}>Show Paywall</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handlePremiumFeature}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <IconSymbol name="lock" size={20} color={colors.primary} />
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                Access Premium Feature
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Custom Purchase UI */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛒 Custom Purchase UI</Text>
        <Text style={styles.description}>
          Build your own subscription UI with full control
        </Text>
        
        {offerings?.availablePackages.map((pkg) => (
          <TouchableOpacity
            key={pkg.identifier}
            style={[
              styles.packageCard,
              selectedPackage?.identifier === pkg.identifier && styles.packageCardSelected
            ]}
            onPress={() => setSelectedPackage(pkg)}
          >
            <View style={styles.packageInfo}>
              <Text style={styles.packageTitle}>
                {pkg.packageType === 'MONTHLY' && '📅 Monthly'}
                {pkg.packageType === 'ANNUAL' && '📆 Yearly'}
                {pkg.packageType === 'LIFETIME' && '⭐ Lifetime'}
              </Text>
              <Text style={styles.packagePrice}>
                {pkg.product.priceString}
              </Text>
            </View>
            {selectedPackage?.identifier === pkg.identifier && (
              <IconSymbol name="check-circle" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleCustomPurchase}
          disabled={loading || !selectedPackage}
        >
          {loading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <>
              <IconSymbol name="shopping-cart" size={20} color={colors.card} />
              <Text style={styles.buttonText}>Purchase Selected</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Customer Center */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏪 Customer Center</Text>
        <Text style={styles.description}>
          Self-service portal for subscription management
        </Text>
        
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={showCustomerCenter}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <IconSymbol name="settings" size={20} color={colors.primary} />
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                Manage Subscription
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Restore Purchases */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔄 Restore Purchases</Text>
        <Text style={styles.description}>
          Required for iOS, recommended for Android
        </Text>
        
        <TouchableOpacity
          style={[styles.button, styles.buttonOutline]}
          onPress={restore}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <IconSymbol name="refresh-cw" size={20} color={colors.primary} />
              <Text style={[styles.buttonText, styles.buttonTextOutline]}>
                Restore Purchases
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  valueSuccess: {
    color: colors.primary,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
  },
  packageCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  packageCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  packageInfo: {
    flex: 1,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary + '20',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
  buttonTextSecondary: {
    color: colors.primary,
  },
  buttonTextOutline: {
    color: colors.primary,
  },
  bottomSpacer: {
    height: 40,
  },
});
