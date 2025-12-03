
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
  onManageSubscription,
  onRestore,
  isLoading,
}: SubscriptionStatusProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isIman = currentTier === 'iman';

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
            <IconSymbol name="crown" size={24} color={colors.superUltraGoldDeep} />
            <Text style={styles.imanBannerText}>✨ IMAN MEMBER ✨</Text>
            <IconSymbol name="star" size={24} color={colors.superUltraGoldDeep} />
          </LinearGradient>

          <View style={styles.statusHeader}>
            <View style={styles.imanIconContainer}>
              <IconSymbol
                name="check-circle"
                size={40}
                color={colors.superUltraGold}
              />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitleIman}>
                👑 Iman Plan 👑
              </Text>
              <Text style={styles.statusDescriptionIman}>
                Lifetime access to all premium features!
              </Text>
            </View>
          </View>

          <View style={styles.imanPerks}>
            <View style={styles.perkItem}>
              <IconSymbol name="infinity" size={20} color={colors.superUltraGold} />
              <Text style={styles.perkText}>Lifetime Access</Text>
            </View>
            <View style={styles.perkItem}>
              <IconSymbol name="star" size={20} color={colors.superUltraGold} />
              <Text style={styles.perkText}>8 Exclusive Features</Text>
            </View>
            <View style={styles.perkItem}>
              <IconSymbol name="award" size={20} color={colors.superUltraGold} />
              <Text style={styles.perkText}>Priority Support</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <View style={styles.subscriptionStatus}>
      <View style={styles.statusHeader}>
        <IconSymbol
          name={currentTier === 'free' ? 'lock' : 'check-circle'}
          size={32}
          color={currentTier === 'free' ? colors.textSecondary : colors.primary}
        />
        <View style={styles.statusInfo}>
          <Text style={styles.statusTitle}>
            {currentTier === 'free' ? 'Free Plan' : `${currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Plan`}
          </Text>
          <Text style={styles.statusDescription}>
            {currentTier === 'free'
              ? 'Upgrade to unlock premium features'
              : 'Thank you for your support!'}
          </Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        {currentTier === 'free' ? (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={onUpgrade}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            <IconSymbol name="arrow-forward" size={20} color={colors.card} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={onRestore}
            disabled={isLoading}
          >
            <IconSymbol name="refresh" size={20} color={colors.primary} />
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          </TouchableOpacity>
        )}
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
  statusDescriptionIman: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.superUltraGoldDark,
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
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.card,
    marginRight: 8,
  },
  restoreButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 8,
  },
  restoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
