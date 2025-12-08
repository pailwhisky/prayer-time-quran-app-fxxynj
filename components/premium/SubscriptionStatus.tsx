
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface SubscriptionStatusProps {
  currentTier: string;
  onUpgrade: () => void;
  onManageSubscription: () => void;
  onRestore: () => void;
  isLoading: boolean;
}

export default function SubscriptionStatus({
  currentTier,
  onUpgrade,
  onRestore,
  isLoading,
}: SubscriptionStatusProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isIman = currentTier === 'iman' || currentTier === 'iman_lifetime';
  const isIhsan = currentTier === 'ihsan';

  useEffect(() => {
    if (isIman) {
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
            toValue: 1.02,
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
    }
  }, [isIman, shimmerAnim, pulseAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.6],
  });

  // Iman tier display
  if (isIman) {
    return (
      <Animated.View style={[{ transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.subscriptionStatusIman}>
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

          <LinearGradient
            colors={[colors.superUltraGold, colors.superUltraGoldShine, colors.superUltraGoldDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.imanBanner}
          >
            <Text style={styles.imanBannerIcon}>👑</Text>
            <Text style={styles.imanBannerText}>✨ IMAN MEMBER ✨</Text>
            <Text style={styles.imanBannerIcon}>⭐</Text>
          </LinearGradient>

          <View style={styles.statusHeader}>
            <View style={styles.imanIconContainer}>
              <IconSymbol
                name="checkmark.circle.fill"
                size={40}
                color={colors.superUltraGold}
              />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitleIman}>
                👑 Iman - Faith 👑
              </Text>
              <Text style={styles.statusDescriptionIman}>
                {currentTier === 'iman_lifetime' 
                  ? 'Lifetime access to all premium features!' 
                  : 'Monthly access to all premium features!'}
              </Text>
            </View>
          </View>

          <View style={styles.imanPerks}>
            <View style={styles.perkItem}>
              <IconSymbol 
                name="infinity"
                size={20} 
                color={colors.superUltraGold} 
              />
              <Text style={styles.perkText}>
                {currentTier === 'iman_lifetime' ? 'Lifetime' : 'Monthly'}
              </Text>
            </View>
            <View style={styles.perkItem}>
              <IconSymbol 
                name="star.fill"
                size={20} 
                color={colors.superUltraGold} 
              />
              <Text style={styles.perkText}>All Features</Text>
            </View>
            <View style={styles.perkItem}>
              <IconSymbol 
                name="award"
                size={20} 
                color={colors.superUltraGold} 
              />
              <Text style={styles.perkText}>Priority Support</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.restoreButtonIman}
            onPress={onRestore}
            disabled={isLoading}
          >
            <IconSymbol 
              name="arrow.clockwise"
              size={20} 
              color={colors.superUltraGoldDeep} 
            />
            <Text style={styles.restoreButtonTextIman}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  // Ihsan tier display
  if (isIhsan) {
    return (
      <View style={styles.subscriptionStatusIhsan}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ihsanBanner}
        >
          <Text style={styles.ihsanBannerIcon}>⭐</Text>
          <Text style={styles.ihsanBannerText}>⭐ IHSAN MEMBER ⭐</Text>
          <Text style={styles.ihsanBannerIcon}>⭐</Text>
        </LinearGradient>

        <View style={styles.statusHeader}>
          <View style={styles.ihsanIconContainer}>
            <IconSymbol
              name="checkmark.circle.fill"
              size={36}
              color={colors.primary}
            />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitleIhsan}>
              ⭐ Ihsan - Excellence ⭐
            </Text>
            <Text style={styles.statusDescriptionIhsan}>
              Thank you for your support!
            </Text>
          </View>
        </View>

        <View style={styles.ihsanPerks}>
          <View style={styles.perkItem}>
            <IconSymbol 
              name="checkmark.circle.fill"
              size={18} 
              color={colors.primary} 
            />
            <Text style={styles.perkTextIhsan}>7 Features</Text>
          </View>
          <View style={styles.perkItem}>
            <IconSymbol 
              name="heart.fill"
              size={18} 
              color={colors.primary} 
            />
            <Text style={styles.perkTextIhsan}>Premium Access</Text>
          </View>
          <View style={styles.perkItem}>
            <IconSymbol 
              name="sparkles"
              size={18} 
              color={colors.primary} 
            />
            <Text style={styles.perkTextIhsan}>Excellence</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.restoreButtonIhsan}
          onPress={onRestore}
          disabled={isLoading}
        >
          <IconSymbol 
            name="arrow.clockwise"
            size={20} 
            color={colors.primary} 
          />
          <Text style={styles.restoreButtonTextIhsan}>Restore Purchases</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Free tier display
  return (
    <View style={styles.subscriptionStatus}>
      <View style={styles.statusHeader}>
        <IconSymbol
          name="lock.fill"
          size={32}
          color={colors.textSecondary}
        />
        <View style={styles.statusInfo}>
          <Text style={styles.statusTitle}>Free Plan</Text>
          <Text style={styles.statusDescription}>
            Upgrade to unlock premium features
          </Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={onUpgrade}
        >
          <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          <IconSymbol 
            name="arrow.right"
            size={20} 
            color={colors.card} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  subscriptionStatus: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0 4px 8px ${colors.shadow}`,
    elevation: 3,
  },
  subscriptionStatusIhsan: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 22,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: colors.primary,
    boxShadow: `0 6px 16px ${colors.primary}40`,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  subscriptionStatusIman: {
    backgroundColor: colors.superUltraGoldPale,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 4,
    borderColor: colors.superUltraGold,
    boxShadow: `0 8px 24px ${colors.superUltraGold}80, 0 0 40px ${colors.superUltraGoldShine}40`,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  goldShimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.superUltraGoldShine,
  },
  goldCornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderColor: colors.superUltraGold,
    borderTopLeftRadius: 20,
  },
  goldCornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderColor: colors.superUltraGold,
    borderTopRightRadius: 20,
  },
  goldCornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderColor: colors.superUltraGold,
    borderBottomLeftRadius: 20,
  },
  goldCornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: colors.superUltraGold,
    borderBottomRightRadius: 20,
  },
  ihsanBanner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 18,
    boxShadow: `0 3px 10px ${colors.primary}50`,
  },
  ihsanBannerIcon: {
    fontSize: 20,
  },
  ihsanBannerText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.card,
    letterSpacing: 1.5,
  },
  imanBanner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    boxShadow: `0 4px 12px ${colors.superUltraGold}60`,
  },
  imanBannerIcon: {
    fontSize: 22,
  },
  imanBannerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.superUltraGoldDeep,
    letterSpacing: 2,
    textShadow: `0 1px 2px ${colors.superUltraGoldShine}`,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ihsanIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.lightGold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    boxShadow: `0 3px 10px ${colors.primary}40`,
  },
  imanIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.superUltraGoldLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.superUltraGold,
    boxShadow: `0 4px 12px ${colors.superUltraGold}60`,
  },
  statusInfo: {
    flex: 1,
    marginLeft: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statusTitleIhsan: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  statusTitleIman: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.superUltraGoldDeep,
    marginBottom: 6,
    textShadow: `0 1px 2px ${colors.superUltraGold}40`,
  },
  statusDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusDescriptionIhsan: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  statusDescriptionIman: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.superUltraGoldDark,
  },
  ihsanPerks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 18,
    paddingVertical: 14,
    backgroundColor: colors.lightGold,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  imanPerks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: colors.superUltraGoldLight,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.superUltraGold,
  },
  perkItem: {
    alignItems: 'center',
    gap: 6,
  },
  perkText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.superUltraGoldDeep,
    textAlign: 'center',
  },
  perkTextIhsan: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  upgradeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.card,
  },
  restoreButtonIhsan: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: colors.primary,
    gap: 8,
  },
  restoreButtonTextIhsan: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  restoreButtonIman: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.superUltraGoldLight,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: colors.superUltraGold,
    gap: 8,
  },
  restoreButtonTextIman: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.superUltraGoldDeep,
  },
});
