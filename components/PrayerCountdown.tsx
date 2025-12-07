/**
 * PrayerCountdown Component
 * 
 * Displays a real-time countdown to the next prayer time
 * with visual progress indicator
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';

interface PrayerCountdownProps {
    nextPrayer: {
        name: string;
        arabicName: string;
        time: Date;
    } | null;
}

export default function PrayerCountdown({ nextPrayer }: PrayerCountdownProps) {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!nextPrayer) return;

        const updateCountdown = () => {
            const now = new Date();
            const diff = nextPrayer.time.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ hours, minutes, seconds });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [nextPrayer]);

    // Pulse animation when less than 5 minutes
    useEffect(() => {
        if (timeLeft.hours === 0 && timeLeft.minutes < 5) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        }
    }, [timeLeft.hours, timeLeft.minutes, pulseAnim]);

    if (!nextPrayer) {
        return null;
    }

    const isUrgent = timeLeft.hours === 0 && timeLeft.minutes < 15;
    const formatNumber = (n: number) => n.toString().padStart(2, '0');

    return (
        <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
                colors={isUrgent ? ['#FF6B35', colors.highlight] : [colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <Text style={styles.label}>⏰ Next Prayer</Text>
                    <Text style={styles.prayerName}>{nextPrayer.name}</Text>
                    <Text style={styles.arabicName}>{nextPrayer.arabicName}</Text>
                </View>

                <View style={styles.countdown}>
                    <View style={styles.timeBlock}>
                        <Text style={styles.timeNumber}>{formatNumber(timeLeft.hours)}</Text>
                        <Text style={styles.timeLabel}>HR</Text>
                    </View>
                    <Text style={styles.timeSeparator}>:</Text>
                    <View style={styles.timeBlock}>
                        <Text style={styles.timeNumber}>{formatNumber(timeLeft.minutes)}</Text>
                        <Text style={styles.timeLabel}>MIN</Text>
                    </View>
                    <Text style={styles.timeSeparator}>:</Text>
                    <View style={styles.timeBlock}>
                        <Text style={styles.timeNumber}>{formatNumber(timeLeft.seconds)}</Text>
                        <Text style={styles.timeLabel}>SEC</Text>
                    </View>
                </View>

                {isUrgent && (
                    <Text style={styles.urgentMessage}>
                        🙏 Prepare for prayer
                    </Text>
                )}
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        marginVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    gradient: {
        padding: 20,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        marginBottom: 4,
    },
    prayerName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
    },
    arabicName: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'Amiri',
        marginTop: 4,
    },
    countdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    timeBlock: {
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        minWidth: 70,
    },
    timeNumber: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFF',
        fontVariant: ['tabular-nums'],
    },
    timeLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        marginTop: 4,
    },
    timeSeparator: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
    },
    urgentMessage: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
});
