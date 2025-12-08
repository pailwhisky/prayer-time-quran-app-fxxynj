
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
  borderRadius = 24,
  bottomMargin = 16,
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
          intensity={Platform.OS === 'web' ? 0 : 60}
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
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.3)',
    ...Platform.select({
      ios: {
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
      },
      android: {
        backgroundColor: 'rgba(245, 245, 220, 0.5)',
        elevation: 8,
      },
      web: {
        backgroundColor: 'rgba(245, 245, 220, 0.5)',
        backdropFilter: 'blur(10px)',
      },
    }),
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  indicator: {
    position: 'absolute',
    top: 3,
    left: 8,
    bottom: 3,
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 32,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.quranGreen,
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: colors.card,
    fontSize: 22,
    fontWeight: '800',
  },
});
