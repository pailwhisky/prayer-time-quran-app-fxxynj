
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { verifyAppleIAPReceipt, restorePurchases } from '@/utils/appleIAPVerification';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { colors } from '@/styles/commonStyles';

/**
 * Example component demonstrating Apple IAP verification integration
 * 
 * This component shows how to:
 * 1. Verify a purchase after completing an IAP transaction
 * 2. Restore previous purchases
 * 3. Display current entitlements
 * 
 * In a real app, you would integrate this with react-native-iap or similar library
 */
export default function AppleIAPExample() {
  const { entitlements, refreshEntitlements } = useSubscription();
  const [loading, setLoading] = useState(false);

  /**
   * Handle purchase verification
   * This should be called after a successful IAP purchase
   * 
   * @param receipt - Base64 encoded receipt from Apple
   * @param productId - Product identifier (e.g., com.natively.premium.monthly)
   * @param transactionId - Transaction ID from the purchase
   */
  const handleVerifyPurchase = async (
    receipt: string,
    productId: string,
    transactionId: string
  ) => {
    try {
      setLoading(true);
      console.log('Verifying purchase...');

      const result = await verifyAppleIAPReceipt(receipt, productId, transactionId);

      if (result.success && result.entitlements) {
        console.log('Purchase verified successfully!');
        console.log('Entitlements:', result.entitlements);

        // Refresh subscription context
        await refreshEntitlements();

        Alert.alert(
          'Purchase Successful',
          `You now have access to ${result.entitlements.tierName} tier features!`,
          [{ text: 'OK' }]
        );
      } else {
        console.error('Purchase verification failed:', result.error);
        Alert.alert(
          'Verification Failed',
          result.error || 'Unable to verify your purchase. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Error verifying purchase:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle restore purchases
   * This should be called when user taps "Restore Purchases" button
   */
  const handleRestorePurchases = async () => {
    try {
      setLoading(true);
      console.log('Restoring purchases...');

      // In a real app, you would get the latest receipt from the device
      // For now, we'll show an alert
      Alert.alert(
        'Restore Purchases',
        'In a production app, this would fetch your latest receipt from the device and verify it with Apple.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Continue',
            onPress: async () => {
              // Example: const receipt = await getLatestReceiptFromDevice();
              // const result = await restorePurchases(receipt);
              
              // For demonstration purposes:
              Alert.alert(
                'Info',
                'To restore purchases, you need to integrate with react-native-iap or similar library to get the receipt from the device.',
                [{ text: 'OK' }]
              );
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error restoring purchases:', error);
      Alert.alert(
        'Error',
        'Unable to restore purchases. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Example: Simulate a purchase flow
   * In a real app, this would trigger the IAP purchase flow
   */
  const handleExamplePurchase = () => {
    Alert.alert(
      'Example Purchase Flow',
      'In a production app, this would:\n\n' +
      '1. Trigger Apple IAP purchase dialog\n' +
      '2. Wait for purchase completion\n' +
      '3. Get receipt from Apple\n' +
      '4. Call verifyAppleIAPReceipt()\n' +
      '5. Update user entitlements\n\n' +
      'Product IDs:\n' +
      '• com.natively.premium.monthly\n' +
      '• com.natively.premium.yearly\n' +
      '• com.natively.ultra.monthly\n' +
      '• com.natively.ultra.yearly\n' +
      '• com.natively.superultra.lifetime',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apple IAP Integration</Text>

      {/* Current Entitlements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Entitlements</Text>
        {entitlements ? (
          <View style={styles.entitlementsCard}>
            <View style={styles.entitlementRow}>
              <Text style={styles.label}>Tier:</Text>
              <Text style={styles.value}>{entitlements.tierName}</Text>
            </View>
            <View style={styles.entitlementRow}>
              <Text style={styles.label}>Status:</Text>
              <Text style={[
                styles.value,
                { color: entitlements.isActive ? colors.success : colors.error }
              ]}>
                {entitlements.status}
              </Text>
            </View>
            <View style={styles.entitlementRow}>
              <Text style={styles.label}>Access:</Text>
              <Text style={[
                styles.value,
                { color: entitlements.hasAccess ? colors.success : colors.error }
              ]}>
                {entitlements.hasAccess ? 'Active' : 'No Access'}
              </Text>
            </View>
            {entitlements.isLifetime && (
              <View style={styles.entitlementRow}>
                <Text style={styles.label}>Type:</Text>
                <Text style={[styles.value, { color: colors.gold }]}>
                  Lifetime
                </Text>
              </View>
            )}
            {entitlements.expiresAt && !entitlements.isLifetime && (
              <View style={styles.entitlementRow}>
                <Text style={styles.label}>Expires:</Text>
                <Text style={styles.value}>
                  {new Date(entitlements.expiresAt).toLocaleDateString()}
                </Text>
              </View>
            )}
            {entitlements.features && entitlements.features.length > 0 && (
              <View style={styles.featuresContainer}>
                <Text style={styles.label}>Features:</Text>
                {entitlements.features.map((feature, index) => (
                  <Text key={index} style={styles.featureItem}>
                    • {feature}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.noEntitlements}>No active subscription</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleExamplePurchase}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Example Purchase Flow</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleRestorePurchases}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Restore Purchases
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.tertiaryButton]}
          onPress={refreshEntitlements}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={[styles.buttonText, styles.tertiaryButtonText]}>
              Refresh Entitlements
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Integration Guide */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Integration Guide</Text>
        <View style={styles.guideCard}>
          <Text style={styles.guideText}>
            1. Install react-native-iap or similar IAP library
          </Text>
          <Text style={styles.guideText}>
            2. Configure your products in App Store Connect
          </Text>
          <Text style={styles.guideText}>
            3. Implement purchase flow in your app
          </Text>
          <Text style={styles.guideText}>
            4. After successful purchase, call verifyAppleIAPReceipt()
          </Text>
          <Text style={styles.guideText}>
            5. The Edge Function will validate with Apple and update entitlements
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  entitlementsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  entitlementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  featuresContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  featureItem: {
    fontSize: 13,
    color: colors.text,
    marginTop: 4,
    marginLeft: 8,
  },
  noEntitlements: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  tertiaryButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tertiaryButtonText: {
    color: colors.text,
  },
  guideCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  guideText: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
});
