
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { BlurView } from 'expo-blur';
import { colors } from '@/styles/commonStyles';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

export interface TabBarItem {
  name: string;
  route: string;
  icon: string;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

export default function FloatingTabBar({
  tabs,
  containerWidth = 340,
  borderRadius = 28,
  bottomMargin = 20,
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const animatedValue = useSharedValue(0);

  const activeTabIndex = React.useMemo(() => {
    let bestMatch = -1;
    let bestMatchScore = 0;

    tabs.forEach((tab, index) => {
      let score = 0;

      if (pathname === tab.route) {
        score = 100;
      } else if (pathname.startsWith(tab.route)) {
        score = 80;
      } else if (pathname.includes(tab.name)) {
        score = 60;
      }

      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = index;
      }
    });

    return bestMatch >= 0 ? bestMatch : 0;
  }, [pathname, tabs]);

  React.useEffect(() => {
    animatedValue.value = withSpring(activeTabIndex, {
      damping: 20,
      stiffness: 120,
      mass: 1,
    });
  }, [activeTabIndex, animatedValue]);

  const handleTabPress = (route: string) => {
    router.push(route);
  };

  const indicatorStyle = useAnimatedStyle(() => {
    const tabWidth = (containerWidth - 16) / tabs.length;
    return {
      transform: [
        {
          translateX: interpolate(
            animatedValue.value,
            [0, tabs.length - 1],
            [0, tabWidth * (tabs.length - 1)]
          ),
        },
      ],
    };
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={[styles.container, { width: containerWidth, marginBottom: bottomMargin }]}>
        <BlurView
          intensity={Platform.OS === 'web' ? 0 : 80}
          style={[styles.blurContainer, { borderRadius }]}
        >
          <View style={styles.background} />
          <Animated.View style={[styles.indicator, indicatorStyle, { width: `${(100 / tabs.length) - 3}%` }]} />
          <View style={styles.tabsContainer}>
            {tabs.map((tab, index) => {
              const isActive = activeTabIndex === index;

              return (
                <TouchableOpacity
                  key={tab.name}
                  style={styles.tab}
                  onPress={() => handleTabPress(tab.route)}
                  activeOpacity={0.7}
                >
                  <View style={styles.tabContent}>
                    <Text style={[
                      styles.tabLabel,
                      isActive && styles.tabLabelActive
                    ]}>
                      {tab.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
  },
  container: {
    marginHorizontal: 20,
    alignSelf: 'center',
  },
  blurContainer: {
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
      },
      android: {
        backgroundColor: colors.card,
        elevation: 10,
      },
      web: {
        backgroundColor: colors.card,
        backdropFilter: 'blur(10px)',
        boxShadow: `0 8px 32px ${colors.shadow}`,
      },
    }),
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(245, 245, 220, 0.1)',
  },
  indicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    bottom: 8,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.quranGreen,
    textTransform: 'capitalize',
  },
  tabLabelActive: {
    color: colors.card,
  },
});
