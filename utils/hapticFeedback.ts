/**
 * Haptic Feedback Utility
 * 
 * Provides consistent haptic feedback across the app
 * Uses expo-haptics for native haptic feedback
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const HapticFeedback = {
    /**
     * Light tap - for small UI interactions
     */
    light: async () => {
        if (Platform.OS === 'web') return;
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
            console.log('Haptic feedback not available');
        }
    },

    /**
     * Medium tap - for button presses
     */
    medium: async () => {
        if (Platform.OS === 'web') return;
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
            console.log('Haptic feedback not available');
        }
    },

    /**
     * Heavy tap - for important actions
     */
    heavy: async () => {
        if (Platform.OS === 'web') return;
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (error) {
            console.log('Haptic feedback not available');
        }
    },

    /**
     * Selection feedback - for selecting items
     */
    selection: async () => {
        if (Platform.OS === 'web') return;
        try {
            await Haptics.selectionAsync();
        } catch (error) {
            console.log('Haptic feedback not available');
        }
    },

    /**
     * Success feedback - for successful actions
     */
    success: async () => {
        if (Platform.OS === 'web') return;
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.log('Haptic feedback not available');
        }
    },

    /**
     * Warning feedback - for warnings
     */
    warning: async () => {
        if (Platform.OS === 'web') return;
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch (error) {
            console.log('Haptic feedback not available');
        }
    },

    /**
     * Error feedback - for errors
     */
    error: async () => {
        if (Platform.OS === 'web') return;
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (error) {
            console.log('Haptic feedback not available');
        }
    },
};

export default HapticFeedback;
