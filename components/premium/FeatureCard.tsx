
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { PremiumFeature } from '@/constants/premiumFeatures';

interface FeatureCardProps {
  feature: PremiumFeature;
  onPress: (feature: PremiumFeature) => void;
}

export default function FeatureCard({ feature, onPress }: FeatureCardProps) {
  return (
    <TouchableOpacity
      style={styles.featureCard}
      onPress={() => onPress(feature)}
    >
      <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
        <IconSymbol name={feature.icon} size={32} color={feature.color} />
      </View>

      <View style={styles.featureInfo}>
        <View style={styles.featureTitleRow}>
          <Text style={styles.featureTitle}>{feature.title}</Text>
          {feature.requiredTier === 'ultra' && (
            <View style={styles.ultraBadge}>
              <Text style={styles.ultraBadgeText}>ULTRA</Text>
            </View>
          )}
        </View>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>

      <IconSymbol name="chevron-right" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0 2px 4px ${colors.shadow}`,
    elevation: 2,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  ultraBadge: {
    backgroundColor: colors.highlight,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ultraBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.card,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
