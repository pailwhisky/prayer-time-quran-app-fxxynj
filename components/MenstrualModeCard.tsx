/**
 * MenstrualModeCard Component
 * 
 * A discrete, privacy-first component for women to enable menstrual mode.
 * When active, modifies prayer notifications and shows relevant duas.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Modal,
    ScrollView,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import {
    MenstrualModeService,
    MenstrualModeSettings,
    MenstrualDua,
    MENSTRUAL_DUAS,
} from '@/utils/menstrualModeService';

interface MenstrualModeCardProps {
    onStateChange?: (isActive: boolean) => void;
}

export default function MenstrualModeCard({ onStateChange }: MenstrualModeCardProps) {
    const [settings, setSettings] = useState<MenstrualModeSettings | null>(null);
    const [showDuasModal, setShowDuasModal] = useState(false);
    const [daysPassed, setDaysPassed] = useState<number | null>(null);
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            const [settingsData, passed, remaining] = await Promise.all([
                MenstrualModeService.getSettings(),
                MenstrualModeService.getDaysPassed(),
                MenstrualModeService.getDaysRemaining(),
            ]);
            setSettings(settingsData);
            setDaysPassed(passed);
            setDaysRemaining(remaining);
        } catch (error) {
            console.error('Error loading menstrual mode data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleToggle = async (enabled: boolean) => {
        try {
            if (enabled) {
                await MenstrualModeService.enable();
            } else {
                await MenstrualModeService.disable();
            }
            await loadData();
            onStateChange?.(enabled);
        } catch (error) {
            console.error('Error toggling menstrual mode:', error);
        }
    };

    if (loading || !settings) {
        return null; // Don't show anything while loading
    }

    const dailyDua = MenstrualModeService.getDailyDua();

    return (
        <>
            <View style={[
                styles.container,
                settings.isEnabled && styles.containerActive,
            ]}>
                <View style={styles.header}>
                    <View style={styles.titleRow}>
                        <View style={styles.iconWrapper}>
                            <IconSymbol
                                name={settings.isEnabled ? "moon.fill" : "moon"}
                                size={24}
                                color={settings.isEnabled ? colors.accent : colors.textSecondary}
                            />
                        </View>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>Period Mode</Text>
                            <Text style={styles.subtitle}>
                                {settings.isEnabled
                                    ? `Day ${daysPassed || 1} • ~${daysRemaining || 'few'} days remaining`
                                    : 'Discrete prayer adjustments'}
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={settings.isEnabled}
                        onValueChange={handleToggle}
                        trackColor={{ false: colors.border, true: colors.accent }}
                        thumbColor={settings.isEnabled ? colors.card : colors.textSecondary}
                    />
                </View>

                {settings.isEnabled && (
                    <View style={styles.activeContent}>
                        {/* Status Indicator */}
                        <View style={styles.statusBar}>
                            <LinearGradient
                                colors={[colors.accent, colors.secondary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${Math.min(100, ((daysPassed || 1) / (settings.typicalDuration || 7)) * 100)}%`
                                    },
                                ]}
                            />
                        </View>

                        {/* Daily Dua Preview */}
                        <TouchableOpacity
                            style={styles.duaPreview}
                            onPress={() => setShowDuasModal(true)}
                        >
                            <View style={styles.duaPreviewHeader}>
                                <IconSymbol name="sparkles" size={16} color={colors.accent} />
                                <Text style={styles.duaPreviewTitle}>Today's Dua</Text>
                            </View>
                            <Text style={styles.duaPreviewArabic} numberOfLines={1}>
                                {dailyDua.arabic}
                            </Text>
                            <Text style={styles.duaPreviewTranslation} numberOfLines={2}>
                                {dailyDua.translation}
                            </Text>
                            <Text style={styles.viewAllLink}>View all duas →</Text>
                        </TouchableOpacity>

                        {/* Info Message */}
                        <View style={styles.infoMessage}>
                            <IconSymbol name="info.circle" size={16} color={colors.textSecondary} />
                            <Text style={styles.infoText}>
                                Prayer notifications are paused. Dhikr reminders continue.
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Duas Modal */}
            <Modal
                visible={showDuasModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowDuasModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Special Duas</Text>
                        <TouchableOpacity
                            onPress={() => setShowDuasModal(false)}
                            style={styles.closeButton}
                        >
                            <IconSymbol name="xmark" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.modalContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.modalSubtitle}>
                            Special supplications for this time. May Allah grant you comfort and ease.
                        </Text>

                        {MENSTRUAL_DUAS.map((dua) => (
                            <DuaCard key={dua.id} dua={dua} />
                        ))}

                        <View style={styles.bottomSpacer} />
                    </ScrollView>
                </View>
            </Modal>
        </>
    );
}

// Individual Dua Card Component
function DuaCard({ dua }: { dua: MenstrualDua }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <TouchableOpacity
            style={styles.duaCard}
            onPress={() => setExpanded(!expanded)}
            activeOpacity={0.8}
        >
            <View style={styles.duaCardHeader}>
                <View>
                    <Text style={styles.duaTitle}>{dua.title}</Text>
                    <Text style={styles.duaTitleArabic}>{dua.titleArabic}</Text>
                </View>
                <IconSymbol
                    name={expanded ? "chevron.up" : "chevron.down"}
                    size={20}
                    color={colors.textSecondary}
                />
            </View>

            <Text style={styles.duaArabic}>{dua.arabic}</Text>

            {expanded && (
                <>
                    <Text style={styles.duaTransliteration}>{dua.transliteration}</Text>
                    <Text style={styles.duaTranslation}>{dua.translation}</Text>
                    <View style={styles.duaWhenContainer}>
                        <IconSymbol name="clock" size={14} color={colors.textSecondary} />
                        <Text style={styles.duaWhen}>{dua.when}</Text>
                    </View>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    containerActive: {
        borderColor: colors.accent,
        backgroundColor: colors.accent + '10',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    activeContent: {
        marginTop: 16,
    },
    statusBar: {
        height: 6,
        backgroundColor: colors.border,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 16,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    duaPreview: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    duaPreviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    duaPreviewTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.accent,
    },
    duaPreviewArabic: {
        fontSize: 18,
        color: colors.text,
        textAlign: 'right',
        fontFamily: 'Amiri',
        marginBottom: 6,
    },
    duaPreviewTranslation: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 18,
        fontStyle: 'italic',
    },
    viewAllLink: {
        fontSize: 13,
        color: colors.primary,
        fontWeight: '600',
        marginTop: 8,
    },
    infoMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: colors.textSecondary,
        lineHeight: 16,
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.card,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    closeButton: {
        padding: 8,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    modalSubtitle: {
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 22,
        marginBottom: 20,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    duaCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    duaCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    duaTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    duaTitleArabic: {
        fontSize: 15,
        color: colors.textSecondary,
        fontFamily: 'Amiri',
    },
    duaArabic: {
        fontSize: 22,
        color: colors.text,
        textAlign: 'right',
        fontFamily: 'Amiri',
        lineHeight: 36,
        marginBottom: 8,
    },
    duaTransliteration: {
        fontSize: 14,
        color: colors.accent,
        fontStyle: 'italic',
        lineHeight: 20,
        marginBottom: 8,
    },
    duaTranslation: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: 12,
    },
    duaWhenContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 8,
        alignSelf: 'flex-start',
    },
    duaWhen: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    bottomSpacer: {
        height: 60,
    },
});
