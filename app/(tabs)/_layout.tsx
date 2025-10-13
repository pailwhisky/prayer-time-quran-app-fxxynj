
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import FloatingTabBar from '@/components/FloatingTabBar';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  const tabs = [
    {
      name: '(home)',
      route: '/(tabs)/(home)',
      icon: 'home',
      label: 'Home',
    },
    {
      name: 'quran',
      route: '/(tabs)/quran',
      icon: 'menu-book',
      label: 'Quran',
    },
    {
      name: 'premium',
      route: '/(tabs)/premium',
      icon: 'star',
      label: 'Premium',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person',
      label: 'Profile',
    },
  ];

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Hide default tab bar
        }}
        tabBar={() => null} // Remove default tab bar completely
      >
        <Tabs.Screen name="(home)" />
        <Tabs.Screen name="quran" />
        <Tabs.Screen name="premium" />
        <Tabs.Screen name="profile" />
      </Tabs>
      
      {/* Apple Liquid Style Floating Tab Bar - Always visible */}
      <FloatingTabBar
        tabs={tabs}
        containerWidth={340}
        borderRadius={28}
        bottomMargin={Platform.OS === 'ios' ? 10 : 20}
      />
    </>
  );
}
