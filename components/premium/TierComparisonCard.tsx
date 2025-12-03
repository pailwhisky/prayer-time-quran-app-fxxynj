
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { SubscriptionTier } from '@/constants/premiumFeatures';

interface TierComparisonCardProps {
  tier: SubscriptionTier;
  isCurrentTier: boolean;
  onSelect: () => void;
}

export default function TierComparisonCard({ 
  tier, 
  isCurrentTier, 
  onSelect 
}: TierComparisonCardProps) {
  const isIman = tier.id === 'iman';
  const isFree = tier.id === 'free';

  return (
    <View style={[
      styles.tierCard,
      isIman && styles.tierCardIman,
      isCurrentTier && styles.tierCardCurrent,
    ]}>
      {isIman && (
        <>
          <View style={styles.imanBadge}>
            <Text style={styles.imanBadgeText}>✨ BEST VALUE ✨</Text>
          </View>
          <View style={styles.goldCornerTL} />
          <View style={styles.goldCornerTR} />
          <View style={styles.goldCornerBL} />
          <View style={styles.goldCornerBR} />
        </>
      )}

      {/* Header */}
      <LinearGradient
        colors={tier.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tierHeader}
      >
        <IconSymbol 
          name={tier.icon} 
          size={32} 
          color={isIman ? colors.superUltraGoldDeep : isFree ? colors.textSecondary : colors.card} 
        />
        <Text style={[
          styles.tierName,
          isIman && styles.tierNameIman,
          isFree && styles.tierNameFree,
        ]}>
          {tier.displayName}
        </Text>
        <Text style={[
          styles.tierTagline,
          isIman && styles.tierTaglineIman,
          isFree && styles.tierTaglineFree,
        ]}>
          {tier.tagline}
        </Text>
      </LinearGradient>

      {/* Pricing */}
      <View style={styles.pricingSection}>
        <View style={styles.priceRow}>
          <Text style={[
            styles.price,
            isIman && styles.priceIman,
          ]}>
            {tier.price}
          </Text>
          {isCurrentTier && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>CURRENT</Text>
            </View>
          )}
        </View>
        <Text style={styles.priceDetail}>{tier.priceDetail}</Text>
      </View>

      {/* Highlights */}
      {tier.highlights.length > 0 && (
        <View style={styles.highlightsSection}>
          {tier.highlights.map((highlight, index) => (
            <View key={index} style={styles.highlightItem}>
              <IconSymbol 
                name="check-circle" 
                size={16} 
                color={isIman ? colors.superUltraGold : colors.primary} 
              />
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Features List */}
      <View style={styles.featuresSection}>
        <Text style={styles.featuresSectionTitle}>Features Included:</Text>
        <ScrollView 
          style={styles.featuresScroll}
          showsVerticalScrollIndicator={false}
        >
          {tier.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <IconSymbol 
                name={feature.included ? 'check' : 'close'} 
                size={18} 
                color={feature.included 
                  ? (isIman ? colors.superUltraGold : colors.primary)
                  : colors.textSecondary
                } 
              />
              <View style={styles.featureTextContainer}>
                <Text style={[
                  styles.featureName,
                  !feature.included && styles.featureNameDisabled,
                ]}>
                  {feature.name}
                </Text>
                {feature.description && feature.included && (
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Action Button */}
      {!isCurrentTier && !isFree && (
        <TouchableOpacity
          style={[
            styles.selectButton,
            isIman && styles.selectButtonIman,
          ]}
          onPress={onSelect}
        >
          <Text style={[
            styles.selectButtonText,
            isIman && styles.selectButtonTextIman,
          ]}>
            {isIman ? 'Get Lifetime Access' : 'Subscribe Now'}
          </Text>
          <IconSymbol 
            name="arrow-forward" 
            size={20} 
            color={isIman ? colors.superUltraGoldDeep : colors.card} 
          />
        </TouchableOpacity>
      )}

      {isCurrentTier && !isFree && (
        <View style={styles.currentTierIndicator}>
          <IconSymbol name="check-circle" size={20} color={colors.primary} />
          <Text style={styles.currentTierText}>Your Current Plan</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tierCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
    boxShadow: `0 4px 12px ${colors.shadow}`,
    elevation: 4,
  },
  tierCardIman: {
    borderColor: colors.superUltraGold,
    borderWidth: 3,
    boxShadow: `0 8px 24px ${colors.superUltraGold}60, 0 0 40px ${colors.superUltraGoldShine}40`,
    elevation: 8,
    backgroundColor: colors.superUltraGoldPale,
  },
  tierCardCurrent: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  imanBadge: {
    position: 'absolute',
    top: 16,
    right: -40,
    backgroundColor: colors.superUltraGold,
    paddingVertical: 6,
    paddingHorizontal: 50,
    transform: [{ rotate: '45deg' }],
    zIndex: 10,
    boxShadow: `0 2px 8px ${colors.superUltraGold}80`,
  },
  imanBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.superUltraGoldDeep,
    letterSpacing: 1,
  },
  goldCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.superUltraGold,
    borderTopLeftRadius: 20,
    zIndex: 5,
  },
  goldCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.superUltraGold,
    borderTopRightRadius: 20,
    zIndex: 5,
  },
  goldCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.superUltraGold,
    borderBottomLeftRadius: 20,
    zIndex: 5,
  },
  goldCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.superUltraGold,
    borderBottomRightRadius: 20,
    zIndex: 5,
  },
  tierHeader: {
    padding: 24,
    alignItems: 'center',
  },
  tierName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.card,
    marginTop: 12,
    marginBottom: 4,
  },
  tierNameIman: {
    color: colors.superUltraGoldDeep,
    fontSize: 26,
  },
  tierNameFree: {
    color: colors.text,
  },
  tierTagline: {
    fontSize: 14,
    color: colors.card,
    opacity: 0.9,
  },
  tierTaglineIman: {
    color: colors.superUltraGoldDark,
    fontWeight: '600',
  },
  tierTaglineFree: {
    color: colors.textSecondary,
  },
  pricingSection: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
  },
  priceIman: {
    color: colors.superUltraGold,
  },
  priceDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  currentBadge: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.card,
  },
  highlightsSection: {
    padding: 20,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  featuresSection: {
    padding: 20,
  },
  featuresSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  featuresScroll: {
    maxHeight: 300,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  featureNameDisabled: {
    color: colors.textSecondary,
    opacity: 0.5,
  },
  featureDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    margin: 20,
    marginTop: 0,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  selectButtonIman: {
    backgroundColor: colors.superUltraGold,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.card,
  },
  selectButtonTextIman: {
    color: colors.superUltraGoldDeep,
  },
  currentTierIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    marginTop: 0,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    gap: 8,
  },
  currentTierText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
