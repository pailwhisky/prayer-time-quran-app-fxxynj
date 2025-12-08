/**
 * PrayerStats Component
 * 
 * Displays prayer statistics dashboard with weekly/monthly analytics
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import { GoalsService, WeeklySummary } from '@/utils/goalsService';

interface PrayerStatsProps {
    onViewDetails?: () => void;
}

export default function PrayerStats({ onViewDetails }: PrayerStatsProps) {
    const [weeklyData, setWeeklyData] = useState<WeeklySummary | null>(null);
    const [activeTab, setActiveTab] = useState<'week' | 'month'>('week');

    useEffect(() => {
        const loadStats = async () => {
            const summary = await GoalsService.getWeeklySummary();
            setWeeklyData(summary);
        };
        loadStats();
    }, []);

    if (!weeklyData) {
        return null;
    }

    // Safely get breakdown with defaults
    const breakdown = weeklyData.prayerBreakdown || { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };

    // Calculate statistics
    const totalPrayers = breakdown.fajr +
        breakdown.dhuhr +
        breakdown.asr +
        breakdown.maghrib +
        breakdown.isha;
    const possiblePrayers = 7 * 5; // 7 days * 5 prayers
    const weeklyPercentage = Math.round((totalPrayers / possiblePrayers) * 100);

    const prayerData = [
        { name: 'Fajr', emoji: '🌅', count: breakdown.fajr, max: 7 },
        { name: 'Dhuhr', emoji: '☀️', count: breakdown.dhuhr, max: 7 },
        { name: 'Asr', emoji: '🌤️', count: breakdown.asr, max: 7 },
        { name: 'Maghrib', emoji: '🌇', count: breakdown.maghrib, max: 7 },
        { name: 'Isha', emoji: '🌙', count: breakdown.isha, max: 7 },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📊 Prayer Statistics</Text>
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'week' && styles.tabActive]}
                        onPress={() => setActiveTab('week')}
                    >
                        <Text style={[styles.tabText, activeTab === 'week' && styles.tabTextActive]}>
                            Week
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'month' && styles.tabActive]}
                        onPress={() => setActiveTab('month')}
                    >
                        <Text style={[styles.tabText, activeTab === 'month' && styles.tabTextActive]}>
                            Month
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Overall Score */}
            <View style={styles.scoreCard}>
                <LinearGradient
                    colors={
                        weeklyPercentage >= 80 ? [colors.primary, colors.secondary] :
                            weeklyPercentage >= 50 ? [colors.accent, colors.highlight] :
                                [colors.textSecondary, colors.border]
                    }
                    style={styles.scoreGradient}
                >
                    <Text style={styles.scoreNumber}>{weeklyPercentage}%</Text>
                    <Text style={styles.scoreLabel}>Weekly Score</Text>
                    <Text style={styles.scoreSublabel}>{totalPrayers}/{possiblePrayers} prayers</Text>
                </LinearGradient>
            </View>

            {/* Prayer Breakdown */}
            <View style={styles.breakdownContainer}>
                <Text style={styles.breakdownTitle}>Prayer Breakdown</Text>
                {prayerData.map((prayer) => {
                    const percentage = (prayer.count / prayer.max) * 100;
                    return (
                        <View key={prayer.name} style={styles.prayerRow}>
                            <View style={styles.prayerInfo}>
                                <Text style={styles.prayerEmoji}>{prayer.emoji}</Text>
                                <Text style={styles.prayerName}>{prayer.name}</Text>
                            </View>
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${percentage}%` },
                                            percentage === 100 && styles.progressComplete,
                                        ]}
                                    />
                                </View>
                                <Text style={styles.prayerCount}>{prayer.count}/{prayer.max}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* Weekly Summary */}
            <View style={styles.summaryContainer}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNumber}>{weeklyData.daysCompleted}</Text>
                    <Text style={styles.summaryLabel}>Perfect Days</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNumber}>{weeklyData.averageCompletion}%</Text>
                    <Text style={styles.summaryLabel}>Avg Completion</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNumber}>{weeklyData.totalPrayers}</Text>
                    <Text style={styles.summaryLabel}>Total Prayers</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginVertical: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 2,
    },
    tab: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    tabActive: {
        backgroundColor: colors.primary,
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    tabTextActive: {
        color: '#FFF',
    },
    scoreCard: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
    },
    scoreGradient: {
        padding: 24,
        alignItems: 'center',
    },
    scoreNumber: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFF',
    },
    scoreLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    scoreSublabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    breakdownContainer: {
        marginBottom: 16,
    },
    breakdownTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
    },
    prayerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    prayerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 100,
    },
    prayerEmoji: {
        fontSize: 20,
        marginRight: 8,
    },
    prayerName: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    progressContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    progressComplete: {
        backgroundColor: colors.highlight,
    },
    prayerCount: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
        minWidth: 35,
        textAlign: 'right',
    },
    summaryContainer: {
        flexDirection: 'row',
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 11,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        fontWeight: '500',
        textAlign: 'center',
    },
    summaryDivider: {
        width: 1,
        backgroundColor: colors.border,
        marginHorizontal: 8,
    },
});
