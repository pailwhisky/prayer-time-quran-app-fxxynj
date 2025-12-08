/**
 * RamadanCountdown Component
 * 
 * Displays countdown to Ramadan with inspirational messages
 * Shows special content during Ramadan
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';

interface RamadanCountdownProps {
    compact?: boolean;
}

// Calculate Ramadan dates (approximate - actual dates depend on moon sighting)
// Using approximate Gregorian dates for Ramadan 2025: Feb 28 - Mar 30, 2025
// Ramadan 2026: Feb 17 - Mar 19, 2026
const getRamadanDates = () => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Approximate Ramadan start dates (1st of Ramadan)
    const ramadanDates: Record<number, { start: Date; end: Date }> = {
        2024: { start: new Date(2024, 2, 11), end: new Date(2024, 3, 9) },
        2025: { start: new Date(2025, 1, 28), end: new Date(2025, 2, 30) },
        2026: { start: new Date(2026, 1, 17), end: new Date(2026, 2, 19) },
        2027: { start: new Date(2027, 1, 7), end: new Date(2027, 2, 8) },
    };

    // Find next Ramadan
    for (let year = currentYear; year <= currentYear + 2; year++) {
        const dates = ramadanDates[year];
        if (dates) {
            if (now < dates.start) {
                return { ...dates, isActive: false, year };
            }
            if (now >= dates.start && now <= dates.end) {
                return { ...dates, isActive: true, year };
            }
        }
    }

    // Default to next year's approximate date
    return {
        start: new Date(currentYear + 1, 1, 28),
        end: new Date(currentYear + 1, 2, 30),
        isActive: false,
        year: currentYear + 1,
    };
};

export default function RamadanCountdown({ compact = false }: RamadanCountdownProps) {
    const [ramadan, setRamadan] = useState(getRamadanDates());
    const [daysLeft, setDaysLeft] = useState(0);
    const [dayOfRamadan, setDayOfRamadan] = useState(0);

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const ramadanData = getRamadanDates();
            setRamadan(ramadanData);

            if (ramadanData.isActive) {
                // Calculate which day of Ramadan we're on
                const diffTime = now.getTime() - ramadanData.start.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
                setDayOfRamadan(diffDays);
            } else {
                // Calculate days until Ramadan
                const diffTime = ramadanData.start.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setDaysLeft(diffDays);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000 * 60 * 60); // Update hourly

        return () => clearInterval(interval);
    }, []);

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <Text style={styles.compactEmoji}>🌙</Text>
                <Text style={styles.compactText}>
                    {ramadan.isActive ? `Day ${dayOfRamadan}` : `${daysLeft}d`}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={ramadan.isActive ? ['#1a1a2e', '#16213e'] : [colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <Text style={styles.emoji}>🌙</Text>
                    <Text style={styles.title}>
                        {ramadan.isActive ? 'Ramadan Mubarak!' : 'Ramadan is Coming'}
                    </Text>
                    <Text style={styles.arabicTitle}>
                        {ramadan.isActive ? 'رمضان مبارك' : 'رمضان كريم'}
                    </Text>
                </View>

                {ramadan.isActive ? (
                    <View style={styles.activeContent}>
                        <View style={styles.dayBadge}>
                            <Text style={styles.dayNumber}>{dayOfRamadan}</Text>
                            <Text style={styles.dayLabel}>DAY</Text>
                        </View>
                        <Text style={styles.message}>
                            May your fasts be accepted 🤲
                        </Text>
                    </View>
                ) : (
                    <View style={styles.countdownContent}>
                        <View style={styles.daysContainer}>
                            <Text style={styles.daysNumber}>{daysLeft}</Text>
                            <Text style={styles.daysLabel}>DAYS</Text>
                        </View>
                        <Text style={styles.message}>
                            Start preparing your heart ❤️
                        </Text>
                        <Text style={styles.dateText}>
                            Starts: {ramadan.start.toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </Text>
                    </View>
                )}

                {/* Decorative stars */}
                <View style={styles.starsContainer}>
                    <Text style={styles.star}>✦</Text>
                    <Text style={styles.star}>✧</Text>
                    <Text style={styles.star}>✦</Text>
                    <Text style={styles.star}>✧</Text>
                    <Text style={styles.star}>✦</Text>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        marginVertical: 12,
    },
    gradient: {
        padding: 24,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    emoji: {
        fontSize: 48,
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    arabicTitle: {
        fontSize: 22,
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'Amiri',
        marginTop: 4,
    },
    activeContent: {
        alignItems: 'center',
    },
    dayBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 50,
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    dayNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
    },
    dayLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    countdownContent: {
        alignItems: 'center',
    },
    daysContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: 'center',
        marginBottom: 12,
    },
    daysNumber: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFF',
        fontVariant: ['tabular-nums'],
    },
    daysLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        marginTop: 4,
    },
    message: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 8,
    },
    dateText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
    },
    starsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 12,
    },
    star: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.5)',
    },
    // Compact styles
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.primary + '20',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    compactEmoji: {
        fontSize: 16,
    },
    compactText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary,
    },
});
