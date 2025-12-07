/**
 * NetworkStatus Component
 * 
 * Displays offline/online status indicator with toast notification
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
} from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { colors } from '@/styles/commonStyles';

interface NetworkStatusProps {
    showAlways?: boolean;
}

export default function NetworkStatus({ showAlways = false }: NetworkStatusProps) {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);
    const [showBanner, setShowBanner] = useState(false);
    const slideAnim = useRef(new Animated.Value(-50)).current;

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            const connected = state.isConnected ?? false;

            if (connected !== isConnected) {
                setIsConnected(connected);

                // Show banner when status changes
                setShowBanner(true);
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 8,
                }).start();

                // Hide banner after 3 seconds (only for online notification)
                if (connected) {
                    setTimeout(() => {
                        Animated.timing(slideAnim, {
                            toValue: -50,
                            duration: 300,
                            useNativeDriver: true,
                        }).start(() => setShowBanner(false));
                    }, 3000);
                }
            }
        });

        return () => unsubscribe();
    }, [isConnected, slideAnim]);

    // Don't show anything if connected and not showAlways
    if (isConnected && !showBanner && !showAlways) {
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                isConnected ? styles.onlineContainer : styles.offlineContainer,
                { transform: [{ translateY: slideAnim }] },
            ]}
        >
            <View style={styles.content}>
                <Text style={styles.emoji}>
                    {isConnected ? '✅' : '📡'}
                </Text>
                <View style={styles.textContainer}>
                    <Text style={styles.statusText}>
                        {isConnected ? 'Back Online' : 'Offline Mode'}
                    </Text>
                    <Text style={styles.descriptionText}>
                        {isConnected
                            ? 'Connection restored'
                            : 'Prayer times available offline'
                        }
                    </Text>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 50,
        paddingBottom: 12,
        paddingHorizontal: 16,
        zIndex: 1000,
    },
    offlineContainer: {
        backgroundColor: '#FF6B35',
    },
    onlineContainer: {
        backgroundColor: colors.primary,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    emoji: {
        fontSize: 24,
    },
    textContainer: {
        flex: 1,
    },
    statusText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    },
    descriptionText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
});
