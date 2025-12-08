
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { SUBSCRIPTION_TIERS } from '@/constants/premiumFeatures';

export default function TierComparisonCard() {
  // State to track which pricing option is selected for Iman tier
  const [imanPricingOption, setImanPricingOption] = useState<'monthly' | 'lifetime'>('monthly');

  // Get unique tiers
  const ihsanTier = SUBSCRIPTION_TIERS.find(t => t.id === 'ihsan');
  const imanMonthlyTier = SUBSCRIPTION_TIERS.find(t => t.id === 'iman');
  const imanLifetimeTier = SUBSCRIPTION_TIERS.find(t => t.id === 'iman_lifetime');

  // Display only 2 cards: Ihsan and Iman (with pricing toggle)
  const displayTiers = [ihsanTier, imanMonthlyTier].filter(Boolean);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compare Plans</Text>
      <Text style={styles.subtitle}>Choose the perfect plan for your spiritual journey</Text>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tiersContainer}
      >
        {displayTiers.map((tier) => {
          if (!tier) return null;
          
          const isIman = tier.id === 'iman';
          
          // For Iman tier, use the selected pricing option
          const displayTier = isIman && imanPricingOption === 'lifetime' ? imanLifetimeTier : tier;
          if (!displayTier) return null;

          const isLifetime = displayTier.id === 'iman_lifetime';

          return (
            <View 
              key={tier.id} 
              style={[
                styles.tierCard,
                isIman && styles.tierCardIman,
              ]}
            >
              {isIman && (
                <View style={styles.pricingToggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.pricingToggleButton,
                      imanPricingOption === 'monthly' && styles.pricingToggleButtonActive,
                    ]}
                    onPress={() => setImanPricingOption('monthly')}
                  >
                    <Text style={[
                      styles.pricingToggleText,
                      imanPricingOption === 'monthly' && styles.pricingToggleTextActive,
                    ]}>
                      Monthly
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.pricingToggleButton,
                      imanPricingOption === 'lifetime' && styles.pricingToggleButtonActive,
                    ]}
                    onPress={() => setImanPricingOption('lifetime')}
                  >
                    <IconSymbol 
                      ios_icon_name="star.fill" 
                      android_material_icon_name="star" 
                      size={12} 
                      color={imanPricingOption === 'lifetime' ? colors.superUltraGoldDeep : colors.textSecondary} 
                    />
                    <Text style={[
                      styles.pricingToggleText,
                      imanPricingOption === 'lifetime' && styles.pricingToggleTextActive,
                    ]}>
                      Lifetime
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.tierHeader}>
                <IconSymbol 
                  ios_icon_name={tier.id === 'ihsan' ? 'star.fill' : 'crown.fill'}
                  android_material_icon_name={tier.id === 'ihsan' ? 'star' : 'workspace_premium'}
                  size={36} 
                  color={isIman ? colors.superUltraGold : displayTier.color} 
                />
                <Text style={[styles.tierName, isIman && styles.tierNameIman]}>
                  {isIman ? 'Iman - Faith' : displayTier.displayName}
                </Text>
                <Text style={[styles.tierPrice, isIman && styles.tierPriceIman]}>
                  {displayTier.price}
                </Text>
                <Text style={styles.tierPriceDetail}>{displayTier.priceDetail}</Text>
                {isLifetime && (
                  <View style={styles.savingsBadgeInline}>
                    <IconSymbol 
                      ios_icon_name="arrow.down.circle.fill"
                      android_material_icon_name="trending_down"
                      size={14} 
                      color={colors.superUltraGoldDeep} 
                    />
                    <Text style={styles.savingsTextInline}>Save $350+ vs monthly</Text>
                  </View>
                )}
                <Text style={[styles.tierTagline, isIman && styles.tierTaglineIman]}>
                  {displayTier.tagline}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.featuresSection}>
                <Text style={styles.featuresTitle}>Features:</Text>
                {displayTier.features
                  .filter(f => f.included)
                  .slice(0, 8)
                  .map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <IconSymbol 
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check_circle"
                        size={18} 
                        color={isIman ? colors.superUltraGold : colors.primary} 
                      />
                      <Text style={styles.featureName}>{feature.name}</Text>
                    </View>
                  ))}
                {displayTier.features.filter(f => f.included).length > 8 && (
                  <Text style={styles.moreFeatures}>
                    + {displayTier.features.filter(f => f.included).length - 8} more features
                  </Text>
                )}
              </View>

              <View style={styles.divider} />

              <View style={styles.highlightsSection}>
                {displayTier.highlights.slice(0, 4).map((highlight, index) => (
                  <View key={index} style={styles.highlightRow}>
                    <IconSymbol 
                      ios_icon_name="star.fill"
                      android_material_icon_name="star"
                      size={15} 
                      color={isIman ? colors.superUltraGold : colors.accent} 
                    />
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  tiersContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  tierCard: {
    width: 280,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border,
    boxShadow: `0 4px 12px ${colors.shadow}`,
    elevation: 4,
  },
  tierCardIman: {
    borderColor: colors.superUltraGold,
    backgroundColor: colors.superUltraGoldPale,
    borderWidth: 3,
    boxShadow: `0 8px 24px ${colors.superUltraGold}80`,
    elevation: 8,
  },
  pricingToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  pricingToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  pricingToggleButtonActive: {
    backgroundColor: colors.superUltraGold,
  },
  pricingToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pricingToggleTextActive: {
    color: colors.superUltraGoldDeep,
    fontWeight: 'bold',
  },
  tierHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tierName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  tierNameIman: {
    fontSize: 26,
    color: colors.superUltraGoldDeep,
  },
  tierPrice: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  tierPriceIman: {
    fontSize: 38,
    color: colors.superUltraGold,
  },
  tierPriceDetail: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  savingsBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: colors.superUltraGoldLight,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.superUltraGold,
  },
  savingsTextInline: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.superUltraGoldDeep,
  },
  tierTagline: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tierTaglineIman: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.superUltraGoldDark,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  featuresSection: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  featureName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  moreFeatures: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  highlightsSection: {
    gap: 8,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  highlightText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
});
