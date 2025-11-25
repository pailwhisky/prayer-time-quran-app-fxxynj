
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useSubscription, SubscriptionTier } from '@/contexts/SubscriptionContext';

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
  const { tiers, currentTier, upgradeTier, loading } = useSubscription();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('premium');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'lifetime'>('monthly');
  const [upgrading, setUpgrading] = useState(false);
  
  // Animation values for Super Ultra shimmer effect
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
  }, []);

  const handleUpgrade = async () => {
    try {
      setUpgrading(true);
      const success = await upgradeTier(selectedTier, billingCycle);
      
      if (success) {
        Alert.alert(
          'Success!',
          `You've successfully upgraded to ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1).replace('_', ' ')}!`,
          [
            {
              text: 'OK',
              onPress: onClose,
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to upgrade subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error upgrading:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setUpgrading(false);
    }
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

  const renderTierCard = (tier: any) => {
    const isCurrentTier = tier.name === currentTier;
    const isSelected = tier.name === selectedTier;
    const isLifetimeTier = tier.price_lifetime !== null && tier.price_monthly === null && tier.price_yearly === null;
    const isSuperUltra = tier.name === 'super_ultra';
    
    let price = 0;
    let priceLabel = '';
    
    if (isLifetimeTier) {
      price = tier.price_lifetime;
      priceLabel = ' one-time';
    } else {
      price = billingCycle === 'monthly' ? tier.price_monthly : tier.price_yearly;
      priceLabel = billingCycle === 'monthly' ? '/month' : '/year';
    }

    if (tier.name === 'free') {
      return null;
    }

    const shimmerOpacity = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });

    return (
      <Animated.View
        key={tier.id}
        style={[
          isSuperUltra && { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tierCard,
            isSelected && styles.tierCardSelected,
            isCurrentTier && styles.tierCardCurrent,
            isLifetimeTier && styles.tierCardLifetime,
            isSuperUltra && styles.tierCardSuperUltra,
          ]}
          onPress={() => !isCurrentTier && setSelectedTier(tier.name)}
          disabled={isCurrentTier}
        >
          {isSuperUltra && (
            <>
              {/* Gold shimmer overlay */}
              <Animated.View 
                style={[
                  styles.goldShimmerOverlay,
                  { opacity: shimmerOpacity }
                ]}
              />
              
              {/* Decorative gold corners */}
              <View style={styles.goldCornerTopLeft} />
              <View style={styles.goldCornerTopRight} />
              <View style={styles.goldCornerBottomLeft} />
              <View style={styles.goldCornerBottomRight} />
            </>
          )}

          {isLifetimeTier && (
            <LinearGradient
              colors={
                isSuperUltra 
                  ? [colors.superUltraGold, colors.superUltraGoldShine, colors.superUltraGoldDark]
                  : [colors.highlight, colors.highlight + 'DD', colors.highlight]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.lifetimeBanner, isSuperUltra && styles.lifetimeBannerSuperUltra]}
            >
              <IconSymbol name="star" size={16} color={isSuperUltra ? colors.superUltraGoldDeep : colors.card} />
              <Text style={[styles.lifetimeBannerText, isSuperUltra && styles.lifetimeBannerTextSuperUltra]}>
                {isSuperUltra ? '✨ ULTIMATE LIFETIME ACCESS ✨' : 'LIFETIME ACCESS'}
              </Text>
              <IconSymbol name="star" size={16} color={isSuperUltra ? colors.superUltraGoldDeep : colors.card} />
            </LinearGradient>
          )}
          
          <View style={styles.tierHeader}>
            <View>
              <Text style={[styles.tierName, isSuperUltra && styles.tierNameSuperUltra]}>
                {isSuperUltra && '👑 '}
                {tier.display_name}
                {isSuperUltra && ' 👑'}
              </Text>
              <Text style={[styles.tierPrice, isLifetimeTier && styles.tierPriceLifetime, isSuperUltra && styles.tierPriceSuperUltra]}>
                ${price.toFixed(2)}
                <Text style={styles.tierPriceLabel}>{priceLabel}</Text>
              </Text>
            </View>
            {isCurrentTier && (
              <View style={[styles.currentBadge, isSuperUltra && styles.currentBadgeSuperUltra]}>
                <Text style={styles.currentBadgeText}>Current</Text>
              </View>
            )}
            {isSelected && !isCurrentTier && (
              <IconSymbol 
                name="check-circle" 
                size={24} 
                color={isSuperUltra ? colors.superUltraGold : colors.primary} 
              />
            )}
          </View>

          <Text style={[styles.tierDescription, isSuperUltra && styles.tierDescriptionSuperUltra]}>
            {tier.description}
          </Text>

          {isSuperUltra && (
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
            {tier.features.map((feature: string, index: number) => {
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
                    isSuperUltra && isExclusiveFeature && styles.featureItemSuperUltra
                  ]}
                >
                  <IconSymbol 
                    name={getFeatureIcon(feature)} 
                    size={16} 
                    color={
                      isSuperUltra && isExclusiveFeature 
                        ? colors.superUltraGold 
                        : isLifetimeTier 
                          ? colors.highlight 
                          : colors.primary
                    } 
                  />
                  <Text style={[
                    styles.featureText,
                    isSuperUltra && isExclusiveFeature && styles.featureTextExclusive
                  ]}>
                    {feature.replace(/_/g, ' ')}
                    {isSuperUltra && isExclusiveFeature && ' ⭐'}
                  </Text>
                </View>
              );
            })}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const selectedTierData = tiers.find(t => t.name === selectedTier);
  const isLifetimeSelected = selectedTierData?.price_lifetime !== null && 
                             selectedTierData?.price_monthly === null && 
                             selectedTierData?.price_yearly === null;
  const isSuperUltraSelected = selectedTier === 'super_ultra';

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
              {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1).replace('_', ' ')} subscription
            </Text>
          </View>
        )}

        {!isLifetimeSelected && (
          <View style={styles.billingToggle}>
            <TouchableOpacity
              style={[
                styles.billingButton,
                billingCycle === 'monthly' && styles.billingButtonActive,
              ]}
              onPress={() => setBillingCycle('monthly')}
            >
              <Text
                style={[
                  styles.billingButtonText,
                  billingCycle === 'monthly' && styles.billingButtonTextActive,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.billingButton,
                billingCycle === 'yearly' && styles.billingButtonActive,
              ]}
              onPress={() => setBillingCycle('yearly')}
            >
              <Text
                style={[
                  styles.billingButtonText,
                  billingCycle === 'yearly' && styles.billingButtonTextActive,
                ]}
              >
                Yearly
                <Text style={styles.saveBadge}> Save 17%</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            tiers.map(renderTierCard)
          )}

          <View style={[styles.infoSection, isSuperUltraSelected && styles.infoSectionSuperUltra]}>
            <Text style={[styles.infoTitle, isSuperUltraSelected && styles.infoTitleSuperUltra]}>
              {isSuperUltraSelected ? '✨ Super Ultra Benefits:' : 'What you get:'}
            </Text>
            <View style={styles.infoItem}>
              <IconSymbol 
                name="check-circle" 
                size={20} 
                color={isSuperUltraSelected ? colors.superUltraGold : colors.primary} 
              />
              <Text style={styles.infoText}>
                {isLifetimeSelected ? 'One-time payment, lifetime access' : 'Cancel anytime, no questions asked'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <IconSymbol 
                name="check-circle" 
                size={20} 
                color={isSuperUltraSelected ? colors.superUltraGold : colors.primary} 
              />
              <Text style={styles.infoText}>Instant access to all features</Text>
            </View>
            <View style={styles.infoItem}>
              <IconSymbol 
                name="check-circle" 
                size={20} 
                color={isSuperUltraSelected ? colors.superUltraGold : colors.primary} 
              />
              <Text style={styles.infoText}>Regular updates and new features</Text>
            </View>
            <View style={styles.infoItem}>
              <IconSymbol 
                name="check-circle" 
                size={20} 
                color={isSuperUltraSelected ? colors.superUltraGold : colors.primary} 
              />
              <Text style={styles.infoText}>Support the development of Islamic apps</Text>
            </View>
            {isLifetimeSelected && (
              <>
                <View style={styles.infoItem}>
                  <IconSymbol 
                    name="check-circle" 
                    size={20} 
                    color={isSuperUltraSelected ? colors.superUltraGold : colors.highlight} 
                  />
                  <Text style={[styles.infoText, styles.infoTextHighlight]}>
                    Priority support & early access to new features
                  </Text>
                </View>
                {isSuperUltraSelected && (
                  <>
                    <View style={styles.infoItem}>
                      <IconSymbol name="star" size={20} color={colors.superUltraGold} />
                      <Text style={[styles.infoText, styles.infoTextSuperUltra]}>
                        Monthly virtual sessions with Islamic scholars
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <IconSymbol name="star" size={20} color={colors.superUltraGold} />
                      <Text style={[styles.infoText, styles.infoTextSuperUltra]}>
                        Exclusive community of dedicated Muslims
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <IconSymbol name="star" size={20} color={colors.superUltraGold} />
                      <Text style={[styles.infoText, styles.infoTextSuperUltra]}>
                        Advanced AI-powered learning & memorization
                      </Text>
                    </View>
                  </>
                )}
              </>
            )}
          </View>
        </ScrollView>

        {selectedTier !== currentTier && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.upgradeButton,
                upgrading && styles.upgradeButtonDisabled,
                isLifetimeSelected && styles.upgradeButtonLifetime,
              ]}
              onPress={handleUpgrade}
              disabled={upgrading}
            >
              {isSuperUltraSelected ? (
                <LinearGradient
                  colors={[colors.superUltraGold, colors.superUltraGoldShine, colors.superUltraGoldDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.upgradeButtonGradient}
                >
                  {upgrading ? (
                    <ActivityIndicator color={colors.superUltraGoldDeep} />
                  ) : (
                    <>
                      <IconSymbol name="crown" size={20} color={colors.superUltraGoldDeep} />
                      <Text style={styles.upgradeButtonTextSuperUltra}>
                        Get Ultimate Lifetime Access
                      </Text>
                      <IconSymbol name="star" size={20} color={colors.superUltraGoldDeep} />
                    </>
                  )}
                </LinearGradient>
              ) : (
                <>
                  {upgrading ? (
                    <ActivityIndicator color={colors.card} />
                  ) : (
                    <>
                      <Text style={styles.upgradeButtonText}>
                        {isLifetimeSelected ? 'Get Lifetime Access' : `Upgrade to ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1).replace('_', ' ')}`}
                      </Text>
                      {isLifetimeSelected && (
                        <IconSymbol name="star" size={20} color={colors.card} />
                      )}
                    </>
                  )}
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
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
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  billingButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  billingButtonActive: {
    backgroundColor: colors.primary,
  },
  billingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  billingButtonTextActive: {
    color: colors.card,
  },
  saveBadge: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
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
  tierCardSuperUltra: {
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
  lifetimeBannerSuperUltra: {
    paddingVertical: 12,
    boxShadow: `0px 4px 12px ${colors.superUltraGold}60`,
  },
  lifetimeBannerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.card,
    letterSpacing: 1,
  },
  lifetimeBannerTextSuperUltra: {
    fontSize: 13,
    color: colors.superUltraGoldDeep,
    textShadow: `0px 1px 2px ${colors.superUltraGoldShine}`,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    marginTop: 32,
  },
  tierName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  tierNameSuperUltra: {
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
  tierPriceSuperUltra: {
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
  currentBadgeSuperUltra: {
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
  tierDescriptionSuperUltra: {
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
  featureItemSuperUltra: {
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
  infoSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoSectionSuperUltra: {
    backgroundColor: colors.superUltraGoldPale,
    borderColor: colors.superUltraGold,
    borderWidth: 3,
    boxShadow: `0px 4px 16px ${colors.superUltraGold}40`,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  infoTitleSuperUltra: {
    fontSize: 20,
    color: colors.superUltraGoldDeep,
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
  infoTextHighlight: {
    color: colors.highlight,
    fontWeight: '600',
  },
  infoTextSuperUltra: {
    color: colors.superUltraGoldDeep,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  upgradeButtonDisabled: {
    opacity: 0.6,
  },
  upgradeButtonLifetime: {
    backgroundColor: colors.highlight,
  },
  upgradeButtonGradient: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.card,
  },
  upgradeButtonTextSuperUltra: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.superUltraGoldDeep,
    textShadow: `0px 1px 2px ${colors.superUltraGoldShine}`,
  },
});
