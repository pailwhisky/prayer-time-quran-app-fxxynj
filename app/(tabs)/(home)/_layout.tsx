
import { Stack } from 'expo-router';
import React from 'react';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // We'll use custom NavigationHeader component
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="prayer-times" />
    </Stack>
  );
}
