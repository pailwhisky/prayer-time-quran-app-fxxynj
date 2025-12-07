/**
 * Goals & Streaks Service
 * 
 * Tracks daily Islamic goals including prayers, dhikr, and Quran reading.
 * Provides streak tracking and progress analytics.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface DailyGoal {
    id: string;
    name: string;
    arabicName: string;
    icon: string;
    target: number;
    current: number;
    unit: string;
    category: 'prayer' | 'dhikr' | 'quran' | 'charity';
}

export interface DailyProgress {
    date: string; // YYYY-MM-DD format
    goals: DailyGoal[];
    completedCount: number;
    totalCount: number;
    isComplete: boolean;
}

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate: string | null;
    totalDaysCompleted: number;
    startDate: string;
}

export interface WeeklySummary {
    week: string;
    daysCompleted: number;
    totalPrayers: number;
    totalDhikr: number;
    quranPages: number;
    averageCompletion: number;
    prayerBreakdown: {
        fajr: number;
        dhuhr: number;
        asr: number;
        maghrib: number;
        isha: number;
    };
}

// Storage keys
const STORAGE_KEYS = {
    DAILY_PROGRESS: 'daily_progress_',
    STREAK_DATA: 'streak_data',
    GOALS_CONFIG: 'goals_config',
};

// Default goals configuration
const DEFAULT_GOALS: Omit<DailyGoal, 'current'>[] = [
    {
        id: 'fajr',
        name: 'Fajr Prayer',
        arabicName: 'صلاة الفجر',
        icon: 'sun.horizon',
        target: 1,
        unit: 'prayer',
        category: 'prayer',
    },
    {
        id: 'dhuhr',
        name: 'Dhuhr Prayer',
        arabicName: 'صلاة الظهر',
        icon: 'sun.max',
        target: 1,
        unit: 'prayer',
        category: 'prayer',
    },
    {
        id: 'asr',
        name: 'Asr Prayer',
        arabicName: 'صلاة العصر',
        icon: 'sun.min',
        target: 1,
        unit: 'prayer',
        category: 'prayer',
    },
    {
        id: 'maghrib',
        name: 'Maghrib Prayer',
        arabicName: 'صلاة المغرب',
        icon: 'sun.horizon.fill',
        target: 1,
        unit: 'prayer',
        category: 'prayer',
    },
    {
        id: 'isha',
        name: 'Isha Prayer',
        arabicName: 'صلاة العشاء',
        icon: 'moon.stars',
        target: 1,
        unit: 'prayer',
        category: 'prayer',
    },
    {
        id: 'morning_dhikr',
        name: 'Morning Dhikr',
        arabicName: 'أذكار الصباح',
        icon: 'sparkles',
        target: 1,
        unit: 'session',
        category: 'dhikr',
    },
    {
        id: 'evening_dhikr',
        name: 'Evening Dhikr',
        arabicName: 'أذكار المساء',
        icon: 'moon',
        target: 1,
        unit: 'session',
        category: 'dhikr',
    },
    {
        id: 'quran_reading',
        name: 'Quran Reading',
        arabicName: 'قراءة القرآن',
        icon: 'book',
        target: 5,
        unit: 'pages',
        category: 'quran',
    },
];

// Helper functions
const getDateKey = (date: Date = new Date()): string => {
    return date.toISOString().split('T')[0];
};

const isYesterday = (dateStr: string): boolean => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return getDateKey(yesterday) === dateStr;
};

const isToday = (dateStr: string): boolean => {
    return getDateKey() === dateStr;
};

// Core service functions
export const GoalsService = {
    /**
     * Get today's progress or create a new one
     */
    async getTodayProgress(): Promise<DailyProgress> {
        const dateKey = getDateKey();
        const storageKey = STORAGE_KEYS.DAILY_PROGRESS + dateKey;

        try {
            const stored = await AsyncStorage.getItem(storageKey);

            if (stored) {
                return JSON.parse(stored);
            }

            // Create new progress for today
            const goals: DailyGoal[] = DEFAULT_GOALS.map(goal => ({
                ...goal,
                current: 0,
            }));

            const progress: DailyProgress = {
                date: dateKey,
                goals,
                completedCount: 0,
                totalCount: goals.length,
                isComplete: false,
            };

            await AsyncStorage.setItem(storageKey, JSON.stringify(progress));
            return progress;
        } catch (error) {
            console.error('❌ Error getting today progress:', error);
            // Return default progress on error
            return {
                date: dateKey,
                goals: DEFAULT_GOALS.map(g => ({ ...g, current: 0 })),
                completedCount: 0,
                totalCount: DEFAULT_GOALS.length,
                isComplete: false,
            };
        }
    },

    /**
     * Mark a goal as completed
     */
    async markGoalComplete(goalId: string, increment: number = 1): Promise<DailyProgress> {
        const progress = await this.getTodayProgress();

        const goal = progress.goals.find(g => g.id === goalId);
        if (goal) {
            goal.current = Math.min(goal.current + increment, goal.target);
        }

        // Recalculate completion
        progress.completedCount = progress.goals.filter(
            g => g.current >= g.target
        ).length;
        progress.isComplete = progress.completedCount === progress.totalCount;

        // Save progress
        const storageKey = STORAGE_KEYS.DAILY_PROGRESS + progress.date;
        await AsyncStorage.setItem(storageKey, JSON.stringify(progress));

        // Update streak if day is complete
        if (progress.isComplete) {
            await this.updateStreak(progress.date);
        }

        console.log(`✅ Goal ${goalId} marked complete (${goal?.current}/${goal?.target})`);
        return progress;
    },

    /**
     * Mark a prayer as completed
     */
    async markPrayerComplete(
        prayerName: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
    ): Promise<DailyProgress> {
        return this.markGoalComplete(prayerName);
    },

    /**
     * Toggle a goal completion status
     */
    async toggleGoal(goalId: string): Promise<DailyProgress> {
        const progress = await this.getTodayProgress();

        const goal = progress.goals.find(g => g.id === goalId);
        if (goal) {
            if (goal.current >= goal.target) {
                goal.current = 0; // Unmark
            } else {
                goal.current = goal.target; // Mark complete
            }
        }

        // Recalculate completion
        progress.completedCount = progress.goals.filter(
            g => g.current >= g.target
        ).length;
        progress.isComplete = progress.completedCount === progress.totalCount;

        // Save progress
        const storageKey = STORAGE_KEYS.DAILY_PROGRESS + progress.date;
        await AsyncStorage.setItem(storageKey, JSON.stringify(progress));

        // Update streak
        if (progress.isComplete) {
            await this.updateStreak(progress.date);
        } else {
            // Check if we need to break the streak
            const streakData = await this.getStreakData();
            if (streakData.lastCompletedDate === progress.date) {
                // Day was complete but now isn't - don't break streak yet
                // as user might complete it again
            }
        }

        return progress;
    },

    /**
     * Get current streak data
     */
    async getStreakData(): Promise<StreakData> {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_DATA);

            if (stored) {
                const data = JSON.parse(stored) as StreakData;

                // Check if streak is still valid
                if (data.lastCompletedDate) {
                    const isStillValid =
                        isToday(data.lastCompletedDate) ||
                        isYesterday(data.lastCompletedDate);

                    if (!isStillValid) {
                        // Streak broken - reset current but keep longest
                        data.currentStreak = 0;
                        await AsyncStorage.setItem(STORAGE_KEYS.STREAK_DATA, JSON.stringify(data));
                    }
                }

                return data;
            }

            // Return default streak data
            return {
                currentStreak: 0,
                longestStreak: 0,
                lastCompletedDate: null,
                totalDaysCompleted: 0,
                startDate: getDateKey(),
            };
        } catch (error) {
            console.error('❌ Error getting streak data:', error);
            return {
                currentStreak: 0,
                longestStreak: 0,
                lastCompletedDate: null,
                totalDaysCompleted: 0,
                startDate: getDateKey(),
            };
        }
    },

    /**
     * Update streak when a day is completed
     */
    async updateStreak(completedDate: string): Promise<StreakData> {
        const streakData = await this.getStreakData();

        // Don't increment if already counted this date
        if (streakData.lastCompletedDate === completedDate) {
            return streakData;
        }

        // Check if this continues the streak
        const continuesStreak =
            !streakData.lastCompletedDate ||
            isYesterday(streakData.lastCompletedDate) ||
            isToday(streakData.lastCompletedDate);

        if (continuesStreak) {
            streakData.currentStreak += 1;
        } else {
            // Streak was broken, start fresh
            streakData.currentStreak = 1;
        }

        // Update longest streak
        streakData.longestStreak = Math.max(
            streakData.longestStreak,
            streakData.currentStreak
        );

        streakData.lastCompletedDate = completedDate;
        streakData.totalDaysCompleted += 1;

        await AsyncStorage.setItem(
            STORAGE_KEYS.STREAK_DATA,
            JSON.stringify(streakData)
        );

        console.log(`🔥 Streak updated: ${streakData.currentStreak} days`);
        return streakData;
    },

    /**
     * Get weekly summary
     */
    async getWeeklySummary(): Promise<WeeklySummary> {
        const today = new Date();
        let daysCompleted = 0;
        let totalPrayers = 0;
        let totalDhikr = 0;
        let quranPages = 0;
        let totalCompletion = 0;
        const prayerBreakdown = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };

        // Get last 7 days
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = getDateKey(date);
            const storageKey = STORAGE_KEYS.DAILY_PROGRESS + dateKey;

            try {
                const stored = await AsyncStorage.getItem(storageKey);
                if (stored) {
                    const progress = JSON.parse(stored) as DailyProgress;

                    if (progress.isComplete) {
                        daysCompleted += 1;
                    }

                    // Count prayers completed
                    const completedPrayers = progress.goals
                        .filter(g => g.category === 'prayer' && g.current >= g.target);
                    totalPrayers += completedPrayers.length;

                    // Track individual prayers
                    completedPrayers.forEach(p => {
                        if (p.id in prayerBreakdown) {
                            prayerBreakdown[p.id as keyof typeof prayerBreakdown] += 1;
                        }
                    });

                    // Count dhikr sessions
                    totalDhikr += progress.goals
                        .filter(g => g.category === 'dhikr' && g.current >= g.target)
                        .length;

                    // Count Quran pages
                    const quranGoal = progress.goals.find(g => g.id === 'quran_reading');
                    if (quranGoal) {
                        quranPages += quranGoal.current;
                    }

                    totalCompletion += (progress.completedCount / progress.totalCount) * 100;
                }
            } catch {
                // Ignore errors for individual days
            }
        }

        return {
            week: `${getDateKey(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000))} to ${getDateKey()}`,
            daysCompleted,
            totalPrayers,
            totalDhikr,
            quranPages,
            averageCompletion: Math.round(totalCompletion / 7),
            prayerBreakdown,
        };
    },

    /**
     * Get prayer completion status for today
     */
    async getPrayerCompletionStatus(): Promise<Record<string, boolean>> {
        const progress = await this.getTodayProgress();
        const prayerIds = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

        const status: Record<string, boolean> = {};
        for (const id of prayerIds) {
            const goal = progress.goals.find(g => g.id === id);
            status[id] = goal ? goal.current >= goal.target : false;
        }

        return status;
    },

    /**
     * Reset all streak and progress data (for testing)
     */
    async resetAllData(): Promise<void> {
        const keys = await AsyncStorage.getAllKeys();
        const goalsKeys = keys.filter(
            k => k.startsWith(STORAGE_KEYS.DAILY_PROGRESS) ||
                k === STORAGE_KEYS.STREAK_DATA ||
                k === STORAGE_KEYS.GOALS_CONFIG
        );

        await AsyncStorage.multiRemove(goalsKeys);
        console.log('🗑️ All goals data reset');
    },
};

export default GoalsService;
