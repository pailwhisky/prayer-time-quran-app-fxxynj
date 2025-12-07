/**
 * DailyGoals Component
 * 
 * A premium component displaying daily Islamic goals with streak tracking.
 * Shows prayer completion, dhikr goals, and Quran reading progress.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { GoalsService, DailyProgress, StreakData, DailyGoal } from '@/utils/goalsService';
import { HapticFeedback } from '@/utils/hapticFeedback';

interface DailyGoalsProps {
    onPrayerComplete?: (prayerName: string) => void;
    compact?: boolean;
}

export default function DailyGoals({ onPrayerComplete, compact = false }: DailyGoalsProps) {
    const [progress, setProgress] = useState<DailyProgress | null>(null);
    const [streakData, setStreakData] = useState<StreakData | null>(null);
    const [loading, setLoading] = useState(true);

    // Animation values
    const streakScale = useRef(new Animated.Value(1)).current;
    const progressWidth = useRef(new Animated.Value(0)).current;

    const loadData = useCallback(async () => {
        try {
            const [todayProgress, streak] = await Promise.all([
                GoalsService.getTodayProgress(),
                GoalsService.getStreakData(),
            ]);

            setProgress(todayProgress);
            setStreakData(streak);

            // Animate progress bar
            const percentage = (todayProgress.completedCount / todayProgress.totalCount) * 100;
            Animated.spring(progressWidth, {
                toValue: percentage,
                useNativeDriver: false,
                friction: 8,
            }).start();

        } catch (error) {
            console.error('Error loading goals:', error);
        } finally {
            setLoading(false);
        }
    }, [progressWidth]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleGoalToggle = async (goal: DailyGoal) => {
        // Haptic feedback
        HapticFeedback.success();

        // Animate the tap
        Animated.sequence([
            Animated.timing(streakScale, {
                toValue: 1.2,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(streakScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        const updatedProgress = await GoalsService.toggleGoal(goal.id);
        setProgress(updatedProgress);

        // Update streak data
        const newStreakData = await GoalsService.getStreakData();
        setStreakData(newStreakData);

        // Animate progress bar
        const percentage = (updatedProgress.completedCount / updatedProgress.totalCount) * 100;
        Animated.spring(progressWidth, {
            toValue: percentage,
            useNativeDriver: false,
            friction: 8,
        }).start();

        // Notify parent if prayer completed
        if (goal.category === 'prayer' && goal.current < goal.target) {
            onPrayerComplete?.(goal.id);
        }
    };

    const getGoalEmoji = (goalId: string): string => {
        const emojiMap: Record<string, string> = {
            'fajr': '🌅',
            'dhuhr': '☀️',
            'asr': '🌤️',
            'maghrib': '🌇',
            'isha': '🌙',
            'morning_dhikr': '✨',
            'evening_dhikr': '🌛',
            'quran_reading': '📖',
        };
        return emojiMap[goalId] || '✅';
    };

    const getCategoryColor = (category: DailyGoal['category']): string => {
        const colorMap = {
            prayer: colors.primary,
            dhikr: colors.accent,
            quran: colors.highlight,
            charity: colors.secondary,
        };
        return colorMap[category];
    };

    if (loading || !progress || !streakData) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading goals...</Text>
            </View>
        );
    }

    const completionPercentage = Math.round(
        (progress.completedCount / progress.totalCount) * 100
    );

    // Group goals by category
    const prayerGoals = progress.goals.filter(g => g.category === 'prayer');
    const otherGoals = progress.goals.filter(g => g.category !== 'prayer');

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                {/* Streak Badge */}
                <View style={styles.compactStreakBadge}>
                    <Text style={styles.emojiIcon}>🔥</Text>
                    <Text style={styles.compactStreakText}>{streakData.currentStreak}</Text>
                </View>

                {/* Progress Ring */}
                <View style={styles.compactProgress}>
                    <Text style={styles.compactProgressText}>
                        {progress.completedCount}/{progress.totalCount}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header with Streak */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Daily Goals</Text>
                    <Text style={styles.subtitle}>
                        {progress.completedCount} of {progress.totalCount} completed
                    </Text>
                </View>

                <Animated.View
                    style={[
                        styles.streakBadge,
                        { transform: [{ scale: streakScale }] }
                    ]}
                >
                    <LinearGradient
                        colors={
                            streakData.currentStreak > 0
                                ? [colors.highlight, '#FF6B35']
                                : [colors.border, colors.textSecondary]
                        }
                        style={styles.streakGradient}
                    >
                        <Text style={styles.streakEmoji}>🔥</Text>
                        <Text style={styles.streakNumber}>{streakData.currentStreak}</Text>
                        <Text style={styles.streakLabel}>day streak</Text>
                    </LinearGradient>
                </Animated.View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <Animated.View
                        style={[
                            styles.progressFill,
                            {
                                width: progressWidth.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: ['0%', '100%'],
                                }),
                            },
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>{completionPercentage}%</Text>
            </View>

            {/* Prayer Goals */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    🕌 Daily Prayers
                </Text>
                <View style={styles.prayerGrid}>
                    {prayerGoals.map((goal) => {
                        const isComplete = goal.current >= goal.target;
                        return (
                            <TouchableOpacity
                                key={goal.id}
                                style={[
                                    styles.prayerItem,
                                    isComplete && styles.prayerItemComplete,
                                ]}
                                onPress={() => handleGoalToggle(goal)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.prayerEmoji}>
                                    {isComplete ? '✅' : getGoalEmoji(goal.id)}
                                </Text>
                                <Text style={[
                                    styles.prayerName,
                                    isComplete && styles.prayerNameComplete,
                                ]}>
                                    {goal.name.replace(' Prayer', '')}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Other Goals */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    ✨ Other Goals
                </Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.otherGoalsContainer}
                >
                    {otherGoals.map((goal) => {
                        const isComplete = goal.current >= goal.target;
                        const categoryColor = getCategoryColor(goal.category);

                        return (
                            <TouchableOpacity
                                key={goal.id}
                                style={[
                                    styles.otherGoalCard,
                                    { borderColor: isComplete ? categoryColor : colors.border },
                                    isComplete && { backgroundColor: categoryColor + '20' },
                                ]}
                                onPress={() => handleGoalToggle(goal)}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.goalIconWrapper,
                                    { backgroundColor: categoryColor + '20' },
                                ]}>
                                    <Text style={styles.goalEmoji}>
                                        {getGoalEmoji(goal.id)}
                                    </Text>
                                </View>
                                <Text style={styles.goalName}>{goal.name}</Text>
                                <Text style={styles.goalArabic}>{goal.arabicName}</Text>
                                <View style={styles.goalProgress}>
                                    <Text style={styles.goalProgressText}>
                                        {goal.current}/{goal.target} {goal.unit}
                                    </Text>
                                    {isComplete && (
                                        <Text style={styles.checkEmoji}>✅</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Stats Summary */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{streakData.totalDaysCompleted}</Text>
                    <Text style={styles.statLabel}>Total Days</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{streakData.longestStreak}</Text>
                    <Text style={styles.statLabel}>Longest Streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: colors.primary }]}>
                        {prayerGoals.filter(g => g.current >= g.target).length}/5
                    </Text>
                    <Text style={styles.statLabel}>Prayers Today</Text>
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
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    streakBadge: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    streakGradient: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 12,
    },
    streakNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginTop: 2,
    },
    streakLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.9)',
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
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
    progressText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
        minWidth: 40,
        textAlign: 'right',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
    },
    prayerGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    prayerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: colors.background,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.border,
    },
    prayerItemComplete: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    prayerName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    prayerNameComplete: {
        color: '#FFF',
    },
    otherGoalsContainer: {
        gap: 12,
        paddingVertical: 4,
    },
    otherGoalCard: {
        width: 140,
        padding: 14,
        backgroundColor: colors.background,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
    },
    goalIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    goalName: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 2,
    },
    goalArabic: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 8,
        fontFamily: 'Amiri',
    },
    goalProgress: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    goalProgressText: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        marginTop: 4,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        backgroundColor: colors.border,
        marginHorizontal: 8,
    },
    // Compact styles
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    compactStreakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.highlight + '20',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    compactStreakText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.highlight,
    },
    compactProgress: {
        backgroundColor: colors.primary + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    compactProgressText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary,
    },
    // Emoji styles
    emojiIcon: {
        fontSize: 16,
    },
    streakEmoji: {
        fontSize: 24,
        marginBottom: 2,
    },
    prayerEmoji: {
        fontSize: 22,
    },
    goalEmoji: {
        fontSize: 24,
    },
    checkEmoji: {
        fontSize: 14,
    },
});
