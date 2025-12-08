
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

const getTierDisplayName = (tier: string): string => {
  const tierMap: { [key: string]: string } = {
    'free': 'Free',
    'ihsan': 'Ihsan',
    'iman': 'Iman',
    'iman_lifetime': 'Iman Lifetime',
    'premium': 'Ihsan',
    'ultra': 'Iman',
  };
  return tierMap[tier.toLowerCase()] || tier.charAt(0).toUpperCase() + tier.slice(1);
};

const getTierBadgeStyle = (tier: string) => {
  const lowerTier = tier.toLowerCase();
  if (lowerTier === 'iman' || lowerTier === 'iman_lifetime' || lowerTier === 'ultra') {
    return {
      backgroundColor: colors.superUltraGold,
      borderColor: colors.superUltraGoldDark,
    };
  }
  if (lowerTier === 'ihsan' || lowerTier === 'premium') {
    return {
      backgroundColor: colors.primary,
      borderColor: colors.accent,
    };
  }
  return {
    backgroundColor: colors.highlight,
    borderColor: colors.border,
  };
};

export default function PremiumGate({
  featureKey,
  featureName = 'This feature',
  requiredTier = 'ihsan',
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

  const tierDisplayName = getTierDisplayName(actualRequiredTier);
  const currentTierDisplayName = getTierDisplayName(currentTier);
  const badgeStyle = getTierBadgeStyle(actualRequiredTier);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.lockIcon}>
          <IconSymbol 
            ios_icon_name="lock.fill" 
            android_material_icon_name="lock" 
            size={32} 
            color={colors.highlight} 
          />
        </View>
        
        <View style={[styles.tierBadge, badgeStyle]}>
          <IconSymbol 
            ios_icon_name={actualRequiredTier.toLowerCase().includes('iman') ? 'crown.fill' : 'star.fill'}
            android_material_icon_name={actualRequiredTier.toLowerCase().includes('iman') ? 'workspace_premium' : 'star'}
            size={16} 
            color="#FFFFFF" 
          />
          <Text style={styles.tierBadgeText}>{tierDisplayName}</Text>
        </View>

        <Text style={styles.title}>Premium Feature</Text>
        <Text style={styles.description}>
          {featureName} is available with {tierDisplayName} subscription
        </Text>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => setShowSubscriptionModal(true)}
        >
          <IconSymbol 
            ios_icon_name="star.fill" 
            android_material_icon_name="star" 
            size={20} 
            color={colors.card} 
          />
          <Text style={styles.upgradeButtonText}>Upgrade to {tierDisplayName}</Text>
        </TouchableOpacity>
        <Text style={styles.currentTier}>
          Current plan: {currentTierDisplayName}
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
    marginBottom: 16,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  tierBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
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
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
    elevation: 6,
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
