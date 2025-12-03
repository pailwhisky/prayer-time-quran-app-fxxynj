
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { SUBSCRIPTION_TIERS } from '@/constants/premiumFeatures';

export default function TierComparisonCard() {
  // Get unique tiers (excluding free, and combining iman monthly/lifetime)
  const ihsanTier = SUBSCRIPTION_TIERS.find(t => t.id === 'ihsan');
  const imanMonthlyTier = SUBSCRIPTION_TIERS.find(t => t.id === 'iman');
  const imanLifetimeTier = SUBSCRIPTION_TIERS.find(t => t.id === 'iman_lifetime');

  const displayTiers = [ihsanTier, imanMonthlyTier, imanLifetimeTier].filter(Boolean);

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
          
          const isIman = tier.id === 'iman' || tier.id === 'iman_lifetime';
          const isLifetime = tier.id === 'iman_lifetime';

          return (
            <View 
              key={tier.id} 
              style={[
                styles.tierCard,
                isIman && styles.tierCardIman,
                isLifetime && styles.tierCardLifetime,
              ]}
            >
              {isLifetime && (
                <LinearGradient
                  colors={[colors.superUltraGold, colors.superUltraGoldShine, colors.superUltraGoldDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.lifetimeBanner}
                >
                  <IconSymbol ios_icon_name="star.fill" android_material_icon_name="star" size={14} color={colors.superUltraGoldDeep} />
                  <Text style={styles.lifetimeBannerText}>LIFETIME ACCESS</Text>
                  <IconSymbol ios_icon_name="star.fill" android_material_icon_name="star" size={14} color={colors.superUltraGoldDeep} />
                </LinearGradient>
              )}

              <View style={styles.tierHeader}>
                <IconSymbol 
                  ios_icon_name={tier.id === 'ihsan' ? 'star.fill' : 'crown.fill'}
                  android_material_icon_name={tier.id === 'ihsan' ? 'star' : 'workspace_premium'}
                  size={32} 
                  color={isIman ? colors.superUltraGold : tier.color} 
                />
                <Text style={[styles.tierName, isIman && styles.tierNameIman]}>
                  {tier.displayName}
                </Text>
                <Text style={[styles.tierPrice, isIman && styles.tierPriceIman]}>
                  {tier.price}
                </Text>
                <Text style={styles.tierPriceDetail}>{tier.priceDetail}</Text>
                <Text style={[styles.tierTagline, isIman && styles.tierTaglineIman]}>
                  {tier.tagline}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.featuresSection}>
                <Text style={styles.featuresTitle}>Features:</Text>
                {tier.features
                  .filter(f => f.included)
                  .slice(0, 8)
                  .map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <IconSymbol 
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check_circle"
                        size={16} 
                        color={isIman ? colors.superUltraGold : colors.primary} 
                      />
                      <Text style={styles.featureName}>{feature.name}</Text>
                    </View>
                  ))}
                {tier.features.filter(f => f.included).length > 8 && (
                  <Text style={styles.moreFeatures}>
                    + {tier.features.filter(f => f.included).length - 8} more features
                  </Text>
                )}
              </View>

              <View style={styles.divider} />

              <View style={styles.highlightsSection}>
                {tier.highlights.slice(0, 4).map((highlight, index) => (
                  <View key={index} style={styles.highlightRow}>
                    <IconSymbol 
                      ios_icon_name="star.fill"
                      android_material_icon_name="star"
                      size={14} 
                      color={isIman ? colors.superUltraGold : colors.accent} 
                    />
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>

              {isLifetime && (
                <View style={styles.savingsBadge}>
                  <IconSymbol 
                    ios_icon_name="arrow.down.circle.fill"
                    android_material_icon_name="trending_down"
                    size={16} 
                    color={colors.superUltraGoldDeep} 
                  />
                  <Text style={styles.savingsText}>Save $350+ vs monthly</Text>
                </View>
              )}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
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
  tierCardLifetime: {
    paddingTop: 48,
  },
  lifetimeBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  lifetimeBannerText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.superUltraGoldDeep,
    letterSpacing: 1,
  },
  tierHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tierName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  tierNameIman: {
    fontSize: 24,
    color: colors.superUltraGoldDeep,
  },
  tierPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  tierPriceIman: {
    fontSize: 36,
    color: colors.superUltraGold,
  },
  tierPriceDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  tierTagline: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tierTaglineIman: {
    fontSize: 15,
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
    fontSize: 16,
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
    fontSize: 13,
    color: colors.text,
  },
  moreFeatures: {
    fontSize: 13,
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
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.superUltraGoldLight,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.superUltraGold,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.superUltraGoldDeep,
  },
});
