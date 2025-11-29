
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useRevenueCatAnalytics } from '@/hooks/useRevenueCatAnalytics';
import { IconSymbol } from '@/components/IconSymbol';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = colors.primary,
}) => (
  <View style={[styles.metricCard, { borderLeftColor: color }]}>
    <View style={styles.metricHeader}>
      <IconSymbol name={icon} size={24} color={color} />
      <Text style={styles.metricTitle}>{title}</Text>
    </View>
    <Text style={styles.metricValue}>{value}</Text>
    {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
  </View>
);

export default function AnalyticsDashboard() {
  const { metrics, loading, error, refresh, trackEvent } = useRevenueCatAnalytics();

  useEffect(() => {
    // Track dashboard view
    trackEvent('analytics_dashboard_viewed');
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <IconSymbol name="alert-circle" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!metrics) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No analytics data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Subscription Analytics</Text>
        <Text style={styles.headerSubtitle}>
          Track your subscription journey
        </Text>
      </View>

      {/* Subscription Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Status</Text>
        <MetricCard
          title="Subscription Status"
          value={metrics.isSubscribed ? 'Active' : 'Free'}
          subtitle={metrics.subscriptionTier}
          icon={metrics.isSubscribed ? 'check-circle' : 'circle'}
          color={metrics.isSubscribed ? colors.success : colors.textSecondary}
        />
      </View>

      {/* Timing Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        <MetricCard
          title="Days Since First Visit"
          value={metrics.daysSinceFirstSeen}
          subtitle={`First seen: ${new Date(metrics.firstSeenDate || '').toLocaleDateString()}`}
          icon="calendar"
          color={colors.primary}
        />
        {metrics.isSubscribed && (
          <MetricCard
            title="Days Subscribed"
            value={metrics.daysSinceSubscribed}
            subtitle={`Started: ${new Date(metrics.subscriptionStartDate || '').toLocaleDateString()}`}
            icon="trending-up"
            color={colors.success}
          />
        )}
      </View>

      {/* Subscription Details */}
      {metrics.isSubscribed && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription Details</Text>
          
          <MetricCard
            title="Will Renew"
            value={metrics.willRenew ? 'Yes' : 'No'}
            subtitle={
              metrics.subscriptionExpirationDate
                ? `Expires: ${new Date(metrics.subscriptionExpirationDate).toLocaleDateString()}`
                : undefined
            }
            icon={metrics.willRenew ? 'refresh' : 'alert-circle'}
            color={metrics.willRenew ? colors.success : colors.warning}
          />

          {metrics.billingIssueDetected && (
            <MetricCard
              title="Billing Issue"
              value="Detected"
              subtitle="Please update your payment method"
              icon="alert-triangle"
              color={colors.error}
            />
          )}

          {metrics.isInTrialPeriod && (
            <MetricCard
              title="Trial Period"
              value="Active"
              subtitle="Enjoying your trial?"
              icon="gift"
              color={colors.primary}
            />
          )}

          {metrics.isInGracePeriod && (
            <MetricCard
              title="Grace Period"
              value="Active"
              subtitle="Please update payment to continue"
              icon="clock"
              color={colors.warning}
            />
          )}
        </View>
      )}

      {/* Engagement Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Engagement</Text>
        <MetricCard
          title="Last Active"
          value={`${metrics.daysSinceLastSeen} days ago`}
          subtitle={new Date(metrics.lastSeenDate).toLocaleDateString()}
          icon="activity"
          color={colors.primary}
        />
      </View>

      {/* Refresh Button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => {
          trackEvent('analytics_refreshed');
          refresh();
        }}
      >
        <IconSymbol name="refresh" size={20} color={colors.primary} />
        <Text style={styles.refreshButtonText}>Refresh Analytics</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  metricCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: colors.secondary + '20',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 120,
  },
});
