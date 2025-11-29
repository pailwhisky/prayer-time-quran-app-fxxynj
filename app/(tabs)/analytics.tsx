
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import NavigationHeader from '@/components/NavigationHeader';
import AnalyticsDashboard from '@/components/premium/AnalyticsDashboard';

/**
 * Analytics screen showing subscription metrics and insights
 * 
 * Features:
 * - Subscription status and timeline
 * - Engagement metrics
 * - Billing information
 * - Trial and grace period status
 */
export default function AnalyticsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <NavigationHeader
        title="Analytics"
        showBack={true}
        showClose={false}
      />

      <AnalyticsDashboard />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
