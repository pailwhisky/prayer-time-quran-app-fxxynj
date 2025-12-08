
import React, { useEffect, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface PrayerTimeItemProps {
  name: string;
  arabicName: string;
  time: Date;
  isNext: boolean;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
}

function PrayerTimeItemComponent({
  name,
  arabicName,
  time,
  isNext,
  isCompleted = false,
  onToggleComplete,
}: PrayerTimeItemProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const checkScale = useSharedValue(isCompleted ? 1 : 0);

  useEffect(() => {
    if (isNext) {
      // Gentle pulse animation
      scale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );

      // Subtle glow effect
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 1500 }),
          withTiming(0.1, { duration: 1500 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1, { duration: 300 });
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isNext, scale, opacity, glowOpacity]);

  useEffect(() => {
    checkScale.value = withSpring(isCompleted ? 1 : 0, {
      damping: 12,
      stiffness: 200,
    });
  }, [isCompleted, checkScale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  const checkAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: checkScale.value }],
      opacity: checkScale.value,
    };
  });

  const formatTime = (time: Date): string => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTimeUntilPrayer = (time: Date): string => {
    const now = new Date();
    const diff = time.getTime() - now.getTime();

    if (diff <= 0) return 'Passed';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    } else {
      return `in ${minutes}m`;
    }
  };

  const isPassed = time.getTime() < Date.now();

  const handlePress = () => {
    if (onToggleComplete && isPassed) {
      onToggleComplete();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={isPassed ? 0.7 : 1}
      disabled={!isPassed || !onToggleComplete}
    >
      <Animated.View
        style={[
          styles.container,
          isNext && styles.nextPrayerContainer,
          isCompleted && styles.completedContainer,
          animatedStyle,
        ]}
      >
        {/* Glow effect for next prayer */}
        {isNext && (
          <Animated.View style={[styles.glowEffect, glowStyle]} />
        )}

        {/* Completion checkmark */}
        {isPassed && (
          <View style={styles.checkmarkWrapper}>
            {isCompleted ? (
              <Animated.View style={[styles.checkmarkComplete, checkAnimStyle]}>
                <IconSymbol name="check-circle" size={28} color={colors.primary} />
              </Animated.View>
            ) : (
              <View style={styles.checkmarkEmpty}>
                <IconSymbol name="radio-button-unchecked" size={28} color={colors.textSecondary} />
              </View>
            )}
          </View>
        )}

        {/* Ornamental corner decorations */}
        <View style={styles.cornerTopLeft}>
          <Text style={styles.cornerIcon}>◆</Text>
        </View>
        <View style={styles.cornerTopRight}>
          <Text style={styles.cornerIcon}>◆</Text>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.leftSection}>
            <Text style={[
              styles.prayerName,
              isNext && styles.nextPrayerText,
              isCompleted && styles.completedText,
            ]}>
              {name}
            </Text>
            <Text style={[
              styles.arabicName,
              isNext && styles.nextPrayerArabic,
              isCompleted && styles.completedArabic,
            ]}>
              {arabicName}
            </Text>
          </View>

          <View style={styles.rightSection}>
            <Text style={[
              styles.time,
              isNext && styles.nextPrayerTime,
              isCompleted && styles.completedTimeText,
            ]}>
              {formatTime(time)}
            </Text>
            {isNext && (
              <Text style={styles.timeUntil}>
                {getTimeUntilPrayer(time)}
              </Text>
            )}
            {isPassed && !isNext && !isCompleted && (
              <Text style={styles.tapToComplete}>Tap to mark ✓</Text>
            )}
          </View>
        </View>

        {isNext && (
          <View style={styles.nextIndicator}>
            <View style={styles.nextBadge}>
              <Text style={styles.nextIcon}>✦</Text>
              <Text style={styles.nextText}>NEXT</Text>
              <Text style={styles.nextIcon}>✦</Text>
            </View>
          </View>
        )}

        {/* Ornamental corner decorations */}
        <View style={styles.cornerBottomLeft}>
          <Text style={styles.cornerIcon}>◆</Text>
        </View>
        <View style={styles.cornerBottomRight}>
          <Text style={styles.cornerIcon}>◆</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: colors.border,
    boxShadow: `0px 3px 6px ${colors.shadow}`,
    elevation: 3,
    position: 'relative',
    overflow: 'visible',
  },
  nextPrayerContainer: {
    backgroundColor: colors.highlight,
    borderColor: colors.gold,
    borderWidth: 3,
    boxShadow: `0px 6px 12px rgba(224, 122, 95, 0.4)`,
    elevation: 6,
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: colors.gold,
    borderRadius: 18,
    zIndex: -1,
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  prayerName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  nextPrayerText: {
    color: colors.card,
    fontWeight: '800',
  },
  arabicName: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'left',
    fontWeight: '600',
    letterSpacing: 1,
  },
  nextPrayerArabic: {
    color: 'rgba(255, 255, 255, 0.95)',
  },
  time: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  nextPrayerTime: {
    color: colors.card,
    fontSize: 24,
  },
  timeUntil: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  nextIndicator: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -50 }],
    zIndex: 10,
  },
  nextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.card,
    boxShadow: `0px 2px 4px ${colors.shadow}`,
    elevation: 5,
  },
  nextIcon: {
    fontSize: 10,
    color: colors.card,
  },
  nextText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.card,
    letterSpacing: 1.5,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  cornerIcon: {
    fontSize: 8,
    color: colors.gold,
    opacity: 0.6,
  },
  // Completion tracking styles
  completedContainer: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  checkmarkWrapper: {
    position: 'absolute',
    left: -14,
    top: '50%',
    transform: [{ translateY: -14 }],
    zIndex: 20,
  },
  checkmarkComplete: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 0,
  },
  checkmarkEmpty: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 0,
    opacity: 0.7,
  },
  completedText: {
    color: colors.primary,
    textDecorationLine: 'line-through',
    opacity: 0.8,
  },
  completedArabic: {
    color: colors.primary,
    opacity: 0.6,
  },
  completedTimeText: {
    color: colors.primary,
    opacity: 0.7,
  },
  tapToComplete: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

// Memoize to prevent unnecessary re-renders in prayer list
const PrayerTimeItem = memo(PrayerTimeItemComponent);
export default PrayerTimeItem;
