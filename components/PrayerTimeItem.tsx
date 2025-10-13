
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';

interface PrayerTimeItemProps {
  name: string;
  arabicName: string;
  time: Date;
  isNext: boolean;
}

export default function PrayerTimeItem({ name, arabicName, time, isNext }: PrayerTimeItemProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isNext) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
      
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [isNext, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
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

  return (
    <Animated.View
      style={[
        styles.container,
        isNext && styles.nextPrayerContainer,
        animatedStyle,
      ]}
    >
      <View style={styles.leftSection}>
        <Text style={[styles.prayerName, isNext && styles.nextPrayerText]}>
          {name}
        </Text>
        <Text style={[styles.arabicName, isNext && styles.nextPrayerArabic]}>
          {arabicName}
        </Text>
      </View>
      
      <View style={styles.rightSection}>
        <Text style={[styles.time, isNext && styles.nextPrayerTime]}>
          {formatTime(time)}
        </Text>
        {isNext && (
          <Text style={styles.timeUntil}>
            {getTimeUntilPrayer(time)}
          </Text>
        )}
      </View>
      
      {isNext && (
        <View style={styles.nextIndicator}>
          <Text style={styles.nextText}>NEXT</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 2px 4px ${colors.shadow}`,
    elevation: 2,
  },
  nextPrayerContainer: {
    backgroundColor: colors.highlight,
    borderColor: colors.highlight,
    boxShadow: `0px 4px 8px rgba(224, 122, 95, 0.3)`,
    elevation: 4,
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  prayerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  nextPrayerText: {
    color: colors.card,
    fontWeight: '700',
  },
  arabicName: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'left',
  },
  nextPrayerArabic: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  time: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  nextPrayerTime: {
    color: colors.card,
    fontSize: 22,
  },
  timeUntil: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  nextIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  nextText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.card,
    letterSpacing: 1,
  },
});
