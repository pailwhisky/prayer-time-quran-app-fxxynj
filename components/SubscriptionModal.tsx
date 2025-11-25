
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
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
      return null; // Don't show free tier in upgrade modal
    }

    return (
      <TouchableOpacity
        key={tier.id}
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
        {isLifetimeTier && (
          <View style={[styles.lifetimeBanner, isSuperUltra && styles.lifetimeBannerSuperUltra]}>
            <IconSymbol name="star" size={16} color={colors.card} />
            <Text style={styles.lifetimeBannerText}>
              {isSuperUltra ? '✨ ULTIMATE LIFETIME ACCESS ✨' : 'LIFETIME ACCESS'}
            </Text>
            <IconSymbol name="star" size={16} color={colors.card} />
          </View>
        )}
        
        <View style={styles.tierHeader}>
          <View>
            <Text style={[styles.tierName, isSuperUltra && styles.tierNameSuperUltra]}>
              {tier.display_name}
            </Text>
            <Text style={[styles.tierPrice, isLifetimeTier && styles.tierPriceLifetime, isSuperUltra && styles.tierPriceSuperUltra]}>
              ${price.toFixed(2)}
              <Text style={styles.tierPriceLabel}>{priceLabel}</Text>
            </Text>
          </View>
          {isCurrentTier && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          )}
          {isSelected && !isCurrentTier && (
            <IconSymbol name="check-circle" size={24} color={isSuperUltra ? colors.highlight : colors.primary} />
          )}
        </View>

        <Text style={[styles.tierDescription, isSuperUltra && styles.tierDescriptionSuperUltra]}>
          {tier.description}
        </Text>

        {isSuperUltra && (
          <View style={styles.exclusiveBadge}>
            <IconSymbol name="award" size={16} color={colors.highlight} />
            <Text style={styles.exclusiveBadgeText}>8 Exclusive Features Not Available in Other Tiers</Text>
          </View>
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
              <View key={index} style={styles.featureItem}>
                <IconSymbol 
                  name={getFeatureIcon(feature)} 
                  size={16} 
                  color={isSuperUltra && isExclusiveFeature ? colors.highlight : isLifetimeTier ? colors.highlight : colors.primary} 
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
    );
  };

  // Check if selected tier is lifetime
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
            <Text style={styles.infoTitle}>
              {isSuperUltraSelected ? '✨ Super Ultra Benefits:' : 'What you get:'}
            </Text>
            <View style={styles.infoItem}>
              <IconSymbol name="check-circle" size={20} color={isSuperUltraSelected ? colors.highlight : colors.primary} />
              <Text style={styles.infoText}>
                {isLifetimeSelected ? 'One-time payment, lifetime access' : 'Cancel anytime, no questions asked'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <IconSymbol name="check-circle" size={20} color={isSuperUltraSelected ? colors.highlight : colors.primary} />
              <Text style={styles.infoText}>Instant access to all features</Text>
            </View>
            <View style={styles.infoItem}>
              <IconSymbol name="check-circle" size={20} color={isSuperUltraSelected ? colors.highlight : colors.primary} />
              <Text style={styles.infoText}>Regular updates and new features</Text>
            </View>
            <View style={styles.infoItem}>
              <IconSymbol name="check-circle" size={20} color={isSuperUltraSelected ? colors.highlight : colors.primary} />
              <Text style={styles.infoText}>Support the development of Islamic apps</Text>
            </View>
            {isLifetimeSelected && (
              <>
                <View style={styles.infoItem}>
                  <IconSymbol name="check-circle" size={20} color={colors.highlight} />
                  <Text style={[styles.infoText, styles.infoTextHighlight]}>
                    Priority support & early access to new features
                  </Text>
                </View>
                {isSuperUltraSelected && (
                  <>
                    <View style={styles.infoItem}>
                      <IconSymbol name="star" size={20} color={colors.highlight} />
                      <Text style={[styles.infoText, styles.infoTextHighlight]}>
                        Monthly virtual sessions with Islamic scholars
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <IconSymbol name="star" size={20} color={colors.highlight} />
                      <Text style={[styles.infoText, styles.infoTextHighlight]}>
                        Exclusive community of dedicated Muslims
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <IconSymbol name="star" size={20} color={colors.highlight} />
                      <Text style={[styles.infoText, styles.infoTextHighlight]}>
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
                isSuperUltraSelected && styles.upgradeButtonSuperUltra,
              ]}
              onPress={handleUpgrade}
              disabled={upgrading}
            >
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
    borderColor: colors.highlight,
    backgroundColor: colors.highlight + '15',
    borderWidth: 3,
  },
  lifetimeBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.highlight,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  lifetimeBannerSuperUltra: {
    backgroundColor: colors.highlight,
    paddingVertical: 10,
  },
  lifetimeBannerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.card,
    letterSpacing: 1,
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
    fontSize: 26,
    color: colors.highlight,
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
    fontSize: 36,
    color: colors.highlight,
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
    fontWeight: '500',
    color: colors.text,
  },
  exclusiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlight + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  exclusiveBadgeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.highlight,
  },
  featuresContainer: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    textTransform: 'capitalize',
  },
  featureTextExclusive: {
    fontWeight: '600',
    color: colors.highlight,
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
    backgroundColor: colors.highlight + '10',
    borderColor: colors.highlight,
    borderWidth: 2,
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
  infoTextHighlight: {
    color: colors.highlight,
    fontWeight: '600',
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
  },
  upgradeButtonDisabled: {
    opacity: 0.6,
  },
  upgradeButtonLifetime: {
    backgroundColor: colors.highlight,
  },
  upgradeButtonSuperUltra: {
    backgroundColor: colors.highlight,
    paddingVertical: 18,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.card,
  },
});
