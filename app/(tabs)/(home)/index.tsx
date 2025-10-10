
import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';

export default function HomeScreen() {
  // Redirect to prayer times screen
  return <Redirect href="/(tabs)/(home)/prayer-times" />;
}
