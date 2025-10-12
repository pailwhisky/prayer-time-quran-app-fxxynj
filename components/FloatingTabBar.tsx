
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
  containerWidth = 280,
  borderRadius = 25,
  bottomMargin
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const animatedValue = useSharedValue(0);

  // Improved active tab detection with better path matching
  const activeTabIndex = React.useMemo(() => {
    // Find the best matching tab based on the current pathname
    let bestMatch = -1;
    let bestMatchScore = 0;

    tabs.forEach((tab, index) => {
      let score = 0;

      // Exact route match gets highest score
      if (pathname === tab.route) {
        score = 100;
      }
      // Check if pathname starts with tab route (for nested routes)
      else if (pathname.startsWith(tab.route)) {
        score = 80;
      }
      // Check if pathname contains the tab name
      else if (pathname.includes(tab.name)) {
        score = 60;
      }
      // Check for partial matches in the route
      else if (tab.route.includes('/(tabs)/') && pathname.includes(tab.route.split('/(tabs)/')[1])) {
        score = 40;
      }

      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = index;
      }
    });

    // Default to first tab if no match found
    return bestMatch >= 0 ? bestMatch : 0;
  }, [pathname, tabs]);

  React.useEffect(() => {
    if (activeTabIndex >= 0) {
      animatedValue.value = withSpring(activeTabIndex, {
        damping: 20,
        stiffness: 120,
        mass: 1,
      });
    }
  }, [activeTabIndex, animatedValue]);

  const handleTabPress = (route: string) => {
    router.push(route);
  };

  const indicatorStyle = useAnimatedStyle(() => {
    const tabWidth = (containerWidth - 16) / tabs.length; // Account for container padding (8px on each side)
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

  // Dynamic styles using our prayer app colors
  const dynamicStyles = {
    blurContainer: {
      ...styles.blurContainer,
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
      ...styles.background,
      backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(245, 245, 220, 0.1)',
    },
    indicator: {
      ...styles.indicator,
      backgroundColor: colors.accent,
      width: `${(100 / tabs.length) - 3}%`, // Dynamic width based on number of tabs
    },
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={[
        styles.container,
        {
          width: containerWidth,
          marginBottom: bottomMargin ?? (Platform.OS === 'ios' ? 10 : 20)
        }
      ]}>
        <BlurView
          intensity={Platform.OS === 'web' ? 0 : 80}
          style={[dynamicStyles.blurContainer, { borderRadius }]}
        >
          <View style={dynamicStyles.background} />
          <Animated.View style={[dynamicStyles.indicator, indicatorStyle]} />
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
                    <IconSymbol
                      name={tab.icon}
                      size={26}
                      color={isActive ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.tabLabel,
                        { color: colors.textSecondary },
                        isActive && { 
                          color: colors.primary, 
                          fontWeight: '700',
                          textShadowColor: 'rgba(0, 70, 67, 0.15)',
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        },
                      ]}
                    >
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
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  indicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    bottom: 8,
    borderRadius: 17,
    width: `${(100 / 2) - 3}%`, // Default for 2 tabs, will be overridden by dynamic styles
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 68,
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
    gap: 4,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3,
    letterSpacing: 0.2,
  },
});
