
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useSubscription } from '@/contexts/SubscriptionContext';
import SubscriptionModal from '@/components/SubscriptionModal';

interface PremiumGateProps {
  featureKey: string;
  featureName?: string;
  requiredTier?: string;
  children: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export default function PremiumGate({
  featureKey,
  featureName = 'This feature',
  requiredTier = 'premium',
  children,
  showUpgradePrompt = true,
}: PremiumGateProps) {
  const { hasFeature, currentTier, features } = useSubscription();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const hasAccess = hasFeature(featureKey);

  // Get the actual required tier from the feature definition
  const feature = features.find(f => f.feature_key === featureKey);
  const actualRequiredTier = feature?.required_tier || requiredTier;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.lockIcon}>
          <IconSymbol name="lock" size={32} color={colors.highlight} />
        </View>
        <Text style={styles.title}>Premium Feature</Text>
        <Text style={styles.description}>
          {featureName} is available with{' '}
          {actualRequiredTier.charAt(0).toUpperCase() + actualRequiredTier.slice(1)} subscription
        </Text>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => setShowSubscriptionModal(true)}
        >
          <IconSymbol name="star" size={20} color={colors.card} />
          <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
        </TouchableOpacity>
        <Text style={styles.currentTier}>
          Current plan: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
        </Text>
      </View>

      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        requiredTier={actualRequiredTier}
        featureName={featureName}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.background,
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.highlight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.card,
  },
  currentTier: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 16,
  },
});
