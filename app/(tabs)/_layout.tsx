
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: '700',
          marginTop: 4,
        },
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            height: 72,
            paddingBottom: 6,
            paddingTop: 6,
          },
          default: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            height: 68,
            paddingBottom: 6,
            paddingTop: 6,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              ios_icon_name="house.fill"
              android_material_icon_name="home"
              size={30}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: 'Quran',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              ios_icon_name="book.fill"
              android_material_icon_name="book"
              size={30}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="premium-with-paywall"
        options={{
          title: 'Premium',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={30}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              size={30}
              color={color}
            />
          ),
        }}
      />
      
      {/* Hidden tabs */}
      <Tabs.Screen
        name="premium"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
