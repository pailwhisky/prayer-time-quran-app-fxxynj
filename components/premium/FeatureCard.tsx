
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
  const isIman = feature.requiredTier === 'iman';
  const isIhsan = feature.requiredTier === 'ihsan';

  return (
    <TouchableOpacity
      style={styles.featureCard}
      onPress={() => onPress(feature)}
    >
      <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
        <IconSymbol 
          ios_icon_name={feature.icon} 
          android_material_icon_name={feature.icon} 
          size={32} 
          color={feature.color} 
        />
      </View>

      <View style={styles.featureInfo}>
        <View style={styles.featureTitleRow}>
          <Text style={styles.featureTitle}>{feature.title}</Text>
          {isIman && (
            <View style={styles.imanBadge}>
              <IconSymbol 
                ios_icon_name="crown.fill" 
                android_material_icon_name="workspace_premium" 
                size={14} 
                color="#FFFFFF" 
              />
              <Text style={styles.imanBadgeText}>Iman</Text>
            </View>
          )}
          {isIhsan && (
            <View style={styles.ihsanBadge}>
              <IconSymbol 
                ios_icon_name="star.fill" 
                android_material_icon_name="star" 
                size={14} 
                color="#FFFFFF" 
              />
              <Text style={styles.ihsanBadgeText}>Ihsan</Text>
            </View>
          )}
        </View>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>

      <IconSymbol 
        ios_icon_name="chevron.right" 
        android_material_icon_name="chevron_right" 
        size={24} 
        color={colors.textSecondary} 
      />
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
    gap: 8,
    flexWrap: 'wrap',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  imanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.superUltraGold,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.superUltraGoldDark,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
    elevation: 3,
  },
  imanBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  ihsanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.accent,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
    elevation: 3,
  },
  ihsanBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
