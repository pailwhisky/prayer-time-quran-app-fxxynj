
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useSubscription, SubscriptionTier } from '@/contexts/SubscriptionContext';
import { useRevenueCat } from '@/hooks/useRevenueCat';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  requiredTier?: SubscriptionTier;
  featureName?: string;
}

export default function SubscriptionModal({
  visible,
  onClose,
  requiredTier,
  featureName,
}: SubscriptionModalProps) {
  const { tiers, currentTier, loading: contextLoading } = useSubscription();
  const { offerings, loadOfferings, purchase, restore, loading: revenueCatLoading } = useRevenueCat();
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  
  // Animation values for Iman shimmer effect
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible && (Platform.OS === 'ios' || Platform.OS === 'android')) {
      loadOfferings();
    }
  }, [visible]);

  useEffect(() => {
    // Shimmer animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim, pulseAnim]);

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('No Package Selected', 'Please select a subscription package');
      return;
    }

    await purchase(selectedPackage);
  };

  const handleRestore = async () => {
    await restore();
  };

  const getFeatureIcon = (feature: string) => {
    const iconMap: { [key: string]: string } = {
      'lifetime_access': 'infinity',
      'all_premium_features': 'star',
      'all_ultra_features': 'sparkles',
      'priority_support': 'headphones',
      'early_access_to_new_features': 'rocket',
      'exclusive_content': 'lock-open',
      'ad_free_forever': 'eye-off',
      'unlimited_ai_queries': 'cpu',
      'custom_prayer_reminders': 'bell',
      'advanced_analytics': 'trending-up',
      'personalized_learning_path': 'book-open',
      'exclusive_community_access': 'users',
      'one_on_one_spiritual_guidance': 'user-check',
      'custom_app_themes': 'palette',
      'offline_quran_audio': 'download',
      'advanced_memorization_tools': 'brain',
      'advanced_notifications': 'bell',
      'mosque_finder': 'map-pin',
      'hijri_calendar': 'calendar',
      'ai_assistant': 'message-circle',
      'daily_hadith': 'book',
      'enhanced_quotes': 'quote',
      'prayer_times': 'clock',
      'quran_reader': 'book-open',
      'qibla_compass': 'compass',
    };
    return iconMap[feature] || 'check';
  };

  const getTierDisplayName = (tierName: string) => {
    const nameMap: { [key: string]: string } = {
      'premium': 'Ihsan',
      'ultra': 'Ihsan',
      'super_ultra': 'Iman',
      'iman': 'Iman',
      'ihsan': 'Ihsan',
    };
    return nameMap[tierName.toLowerCase()] || tierName;
  };

  const renderPackageCard = (pkg: any, tier: any) => {
    const isSelected = selectedPackage?.identifier === pkg.identifier;
    const isCurrentTier = tier.name === currentTier;
    const isIman = tier.name === 'super_ultra' || tier.name === 'iman';
    const isLifetime = pkg.packageType === 'LIFETIME';
    
    const shimmerOpacity = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });

    // Get price information
    const priceString = pkg.product.priceString;
    const period = pkg.packageType === 'ANNUAL' ? '/year' : 
                   pkg.packageType === 'MONTHLY' ? '/month' : 
                   pkg.packageType === 'LIFETIME' ? ' one-time' : '';

    const displayName = getTierDisplayName(tier.name);

    return (
      <Animated.View
        key={pkg.identifier}
        style={[
          isIman && { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tierCard,
            isSelected && styles.tierCardSelected,
            isCurrentTier && styles.tierCardCurrent,
            isLifetime && styles.tierCardLifetime,
            isIman && styles.tierCardIman,
          ]}
          onPress={() => !isCurrentTier && setSelectedPackage(pkg)}
          disabled={isCurrentTier}
        >
          {isIman && (
            <>
              <Animated.View 
                style={[
                  styles.goldShimmerOverlay,
                  { opacity: shimmerOpacity }
                ]}
              />
              
              <View style={styles.goldCornerTopLeft} />
              <View style={styles.goldCornerTopRight} />
              <View style={styles.goldCornerBottomLeft} />
              <View style={styles.goldCornerBottomRight} />
            </>
          )}

          {isLifetime && (
            <LinearGradient
              colors={
                isIman 
                  ? [colors.superUltraGold, colors.superUltraGoldShine, colors.superUltraGoldDark]
                  : [colors.highlight, colors.highlight + 'DD', colors.highlight]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.lifetimeBanner, isIman && styles.lifetimeBannerIman]}
            >
              <IconSymbol name="star" size={16} color={isIman ? colors.superUltraGoldDeep : colors.card} />
              <Text style={[styles.lifetimeBannerText, isIman && styles.lifetimeBannerTextIman]}>
                {isIman ? '✨ ULTIMATE LIFETIME ACCESS ✨' : 'LIFETIME ACCESS'}
              </Text>
              <IconSymbol name="star" size={16} color={isIman ? colors.superUltraGoldDeep : colors.card} />
            </LinearGradient>
          )}
          
          <View style={[styles.tierHeader, isLifetime && styles.tierHeaderLifetime]}>
            <View>
              <Text style={[styles.tierName, isIman && styles.tierNameIman]}>
                {isIman && '👑 '}
                {displayName}
                {isIman && ' 👑'}
                {isLifetime && ' - Lifetime'}
              </Text>
              <Text style={[styles.tierPrice, isLifetime && styles.tierPriceLifetime, isIman && styles.tierPriceIman]}>
                {priceString}
                <Text style={styles.tierPriceLabel}>{period}</Text>
              </Text>
            </View>
            {isCurrentTier && (
              <View style={[styles.currentBadge, isIman && styles.currentBadgeIman]}>
                <Text style={styles.currentBadgeText}>Current</Text>
              </View>
            )}
            {isSelected && !isCurrentTier && (
              <IconSymbol 
                name="check-circle" 
                size={24} 
                color={isIman ? colors.superUltraGold : colors.primary} 
              />
            )}
          </View>

          <Text style={[styles.tierDescription, isIman && styles.tierDescriptionIman]}>
            {tier.description}
          </Text>

          {isIman && (
            <LinearGradient
              colors={[colors.superUltraGoldLight, colors.superUltraGoldPale]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.exclusiveBadge}
            >
              <IconSymbol name="award" size={16} color={colors.superUltraGoldDeep} />
              <Text style={styles.exclusiveBadgeText}>
                8 Exclusive Features Not Available in Other Tiers
              </Text>
            </LinearGradient>
          )}

          <View style={styles.featuresContainer}>
            {tier.features.slice(0, 5).map((feature: string, index: number) => {
              const isExclusiveFeature = [
                'custom_prayer_reminders',
                'advanced_analytics',
                'personalized_learning_path',
                'exclusive_community_access',
                'one_on_one_spiritual_guidance',
                'custom_app_themes',
                'offline_quran_audio',
                'advanced_memorization_tools'
              ].includes(feature);

              return (
                <View 
                  key={index} 
                  style={[
                    styles.featureItem,
                    isIman && isExclusiveFeature && styles.featureItemIman
                  ]}
                >
                  <IconSymbol 
                    name={getFeatureIcon(feature)} 
                    size={16} 
                    color={
                      isIman && isExclusiveFeature 
                        ? colors.superUltraGold 
                        : isLifetime
                          ? colors.highlight 
                          : colors.primary
                    } 
                  />
                  <Text style={[
                    styles.featureText,
                    isIman && isExclusiveFeature && styles.featureTextExclusive
                  ]}>
                    {feature.replace(/_/g, ' ')}
                    {isIman && isExclusiveFeature && ' ⭐'}
                  </Text>
                </View>
              );
            })}
            {tier.features.length > 5 && (
              <Text style={styles.moreFeatures}>
                + {tier.features.length - 5} more features
              </Text>
            )}
          </View>

          {isLifetime && (
            <View style={[styles.savingsBadge, isIman && styles.savingsBadgeIman]}>
              <IconSymbol name="trending-down" size={16} color={isIman ? colors.superUltraGoldDeep : colors.highlight} />
              <Text style={[styles.savingsText, isIman && styles.savingsTextIman]}>
                {isIman ? 'Save over $350 compared to monthly!' : 'Best value - pay once, use forever!'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderContent = () => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return (
        <View style={styles.unsupportedContainer}>
          <IconSymbol name="info" size={48} color={colors.textSecondary} />
          <Text style={styles.unsupportedTitle}>Not Available</Text>
          <Text style={styles.unsupportedText}>
            In-app purchases are only available on iOS and Android devices.
          </Text>
        </View>
      );
    }

    if (contextLoading || revenueCatLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading subscription options...</Text>
        </View>
      );
    }

    if (!offerings || !offerings.availablePackages || offerings.availablePackages.length === 0) {
      return (
        <View style={styles.unsupportedContainer}>
          <IconSymbol name="error" size={48} color={colors.textSecondary} />
          <Text style={styles.unsupportedTitle}>No Subscriptions Available</Text>
          <Text style={styles.unsupportedText}>
            Unable to load subscription options. Please try again later.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadOfferings}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {offerings.availablePackages.map((pkg: any) => {
            // Match package to tier based on identifier
            const tier = tiers.find(t => 
              pkg.identifier.toLowerCase().includes(t.name.toLowerCase())
            );
            
            if (!tier || tier.name === 'free') return null;
            
            return renderPackageCard(pkg, tier);
          })}

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>What you get:</Text>
            <View style={styles.infoItem}>
              <IconSymbol name="check-circle" size={20} color={colors.primary} />
              <Text style={styles.infoText}>Cancel anytime, no questions asked</Text>
            </View>
            <View style={styles.infoItem}>
              <IconSymbol name="check-circle" size={20} color={colors.primary} />
              <Text style={styles.infoText}>Instant access to all features</Text>
            </View>
            <View style={styles.infoItem}>
              <IconSymbol name="check-circle" size={20} color={colors.primary} />
              <Text style={styles.infoText}>Regular updates and new features</Text>
            </View>
            <View style={styles.infoItem}>
              <IconSymbol name="check-circle" size={20} color={colors.primary} />
              <Text style={styles.infoText}>Support the development of Islamic apps</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          </TouchableOpacity>
        </ScrollView>

        {selectedPackage && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={handlePurchase}
              disabled={revenueCatLoading}
            >
              {revenueCatLoading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.purchaseButtonText}>
                  Subscribe Now
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Upgrade Your Experience</Text>
          <TouchableOpacity onPress={onClose}>
            <IconSymbol name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {featureName && requiredTier && (
          <View style={styles.featureAlert}>
            <IconSymbol name="lock" size={20} color={colors.highlight} />
            <Text style={styles.featureAlertText}>
              <Text style={styles.featureAlertBold}>{featureName}</Text> requires{' '}
              {getTierDisplayName(requiredTier)} subscription
            </Text>
          </View>
        )}

        {renderContent()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  featureAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlight + '20',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    gap: 12,
  },
  featureAlertText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  featureAlertBold: {
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  unsupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  unsupportedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  unsupportedText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
  tierCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  tierCardSelected: {
    borderColor: colors.primary,
    boxShadow: `0px 4px 12px ${colors.primary}40`,
    elevation: 4,
  },
  tierCardCurrent: {
    opacity: 0.6,
  },
  tierCardLifetime: {
    borderColor: colors.highlight,
    backgroundColor: colors.highlight + '10',
  },
  tierCardIman: {
    borderColor: colors.superUltraGold,
    backgroundColor: colors.superUltraGoldPale,
    borderWidth: 3,
    boxShadow: `0px 8px 24px ${colors.superUltraGold}80, 0px 0px 40px ${colors.superUltraGoldShine}40`,
    elevation: 12,
  },
  goldShimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.superUltraGoldShine,
    opacity: 0.1,
  },
  goldCornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.superUltraGold,
    borderTopLeftRadius: 16,
  },
  goldCornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.superUltraGold,
    borderTopRightRadius: 16,
  },
  goldCornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.superUltraGold,
    borderBottomLeftRadius: 16,
  },
  goldCornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.superUltraGold,
    borderBottomRightRadius: 16,
  },
  lifetimeBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  lifetimeBannerIman: {
    paddingVertical: 12,
    boxShadow: `0px 4px 12px ${colors.superUltraGold}60`,
  },
  lifetimeBannerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.card,
    letterSpacing: 1,
  },
  lifetimeBannerTextIman: {
    fontSize: 13,
    color: colors.superUltraGoldDeep,
    textShadow: `0px 1px 2px ${colors.superUltraGoldShine}`,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tierHeaderLifetime: {
    marginTop: 32,
  },
  tierName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  tierNameIman: {
    fontSize: 28,
    color: colors.superUltraGoldDeep,
    textShadow: `0px 2px 4px ${colors.superUltraGold}60`,
  },
  tierPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  tierPriceLifetime: {
    color: colors.highlight,
  },
  tierPriceIman: {
    fontSize: 38,
    color: colors.superUltraGold,
    textShadow: `0px 2px 4px ${colors.superUltraGoldDark}40`,
  },
  tierPriceLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  currentBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  currentBadgeIman: {
    backgroundColor: colors.superUltraGold,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.card,
  },
  tierDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  tierDescriptionIman: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.superUltraGoldDeep,
  },
  exclusiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: colors.superUltraGold,
  },
  exclusiveBadgeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.superUltraGoldDeep,
  },
  featuresContainer: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  featureItemIman: {
    backgroundColor: colors.superUltraGoldLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.superUltraGold,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    textTransform: 'capitalize',
  },
  featureTextExclusive: {
    fontWeight: '700',
    color: colors.superUltraGoldDeep,
  },
  moreFeatures: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.highlight + '20',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  savingsBadgeIman: {
    backgroundColor: colors.superUltraGoldLight,
    borderColor: colors.superUltraGold,
    borderWidth: 2,
  },
  savingsText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.highlight,
  },
  savingsTextIman: {
    color: colors.superUltraGoldDeep,
  },
  infoSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  restoreButton: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  purchaseButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.card,
  },
});
