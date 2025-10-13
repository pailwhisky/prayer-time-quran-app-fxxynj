
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import FloatingTabBar from '@/components/FloatingTabBar';

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
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="(home)" options={{ headerShown: false }} />
        <Tabs.Screen name="quran" options={{ headerShown: false }} />
        <Tabs.Screen name="premium" options={{ headerShown: false }} />
        <Tabs.Screen name="profile" options={{ headerShown: false }} />
      </Tabs>
      
      <FloatingTabBar
        tabs={tabs}
        containerWidth={340}
        borderRadius={28}
        bottomMargin={Platform.OS === 'ios' ? 10 : 20}
      />
    </>
  );
}
