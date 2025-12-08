/**
 * Menstrual Mode Service
 * 
 * Privacy-first feature for women during menstruation.
 * Adjusts prayer notifications and provides relevant duas.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface MenstrualModeSettings {
    isEnabled: boolean;
    startDate: string | null; // ISO date string
    notifyBeforeEnding: boolean;
    typicalDuration: number; // days
    showSpecialDuas: boolean;
}

export interface MenstrualDua {
    id: string;
    title: string;
    titleArabic: string;
    arabic: string;
    transliteration: string;
    translation: string;
    when: string;
}

// Storage keys
const STORAGE_KEYS = {
    SETTINGS: 'menstrual_mode_settings',
    HISTORY: 'menstrual_mode_history',
};

// Default settings
const DEFAULT_SETTINGS: MenstrualModeSettings = {
    isEnabled: false,
    startDate: null,
    notifyBeforeEnding: true,
    typicalDuration: 7,
    showSpecialDuas: true,
};

// Duas for this period
const MENSTRUAL_DUAS: MenstrualDua[] = [
    {
        id: 'cleansing',
        title: 'Dua for Cleansing',
        titleArabic: 'دعاء التطهر',
        arabic: 'اللَّهُمَّ طَهِّرْنِي مِنَ الذُّنُوبِ وَالْخَطَايَا كَمَا يُنَقَّى الثَّوْبُ الأَبْيَضُ مِنَ الدَّنَسِ',
        transliteration: 'Allahumma tahhirni minadh-dhunubi wal-khataya kama yunaqqa ath-thawbul abyadhu minad-danas',
        translation: 'O Allah, cleanse me from sins and mistakes as a white garment is cleansed from dirt.',
        when: 'When seeking spiritual purification',
    },
    {
        id: 'patience',
        title: 'Dua for Patience',
        titleArabic: 'دعاء الصبر',
        arabic: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ',
        transliteration: "Rabbana afrigh 'alayna sabran wa tawaffana muslimeen",
        translation: 'Our Lord, pour upon us patience and let us die as Muslims (in submission to You).',
        when: 'When feeling restless or uncomfortable',
    },
    {
        id: 'healing',
        title: 'Dua for Healing',
        titleArabic: 'دعاء الشفاء',
        arabic: 'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِهِ وَأَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا',
        transliteration: 'Allahumma Rabban-nas, adhhibil-ba\'s, ishfihi wa Antash-Shafi, la shifa\'a illa shifa\'uk, shifaa\'an la yughadiru saqama',
        translation: 'O Allah, Lord of mankind, remove the affliction. Heal, for You are the Healer. There is no cure but Your cure, a cure that leaves no illness behind.',
        when: 'When experiencing pain or discomfort',
    },
    {
        id: 'gratitude',
        title: 'Dua for Gratitude',
        titleArabic: 'دعاء الشكر',
        arabic: 'الْحَمْدُ لِلَّهِ عَلَى كُلِّ حَالٍ',
        transliteration: 'Alhamdulillahi \'ala kulli hal',
        translation: 'All praise is due to Allah in every condition.',
        when: 'Expressing gratitude for natural bodily processes',
    },
    {
        id: 'forgiveness',
        title: 'Dua for Forgiveness',
        titleArabic: 'دعاء المغفرة',
        arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
        transliteration: 'Astaghfirullaha al-\'Adhim, alladhi la ilaha illa Huwa, al-Hayyul-Qayyum wa atubu ilayh',
        translation: 'I seek forgiveness from Allah, the Almighty, there is no god but He, the Living, the Self-Subsisting, and I repent to Him.',
        when: 'Daily remembrance',
    },
    {
        id: 'end_period',
        title: 'Dua After Period Ends',
        titleArabic: 'دعاء بعد الطهارة',
        arabic: 'اللَّهُمَّ اغْفِرْ لِي ذَنْبِي وَوَسِّعْ لِي فِي دَارِي وَبَارِكْ لِي فِي رِزْقِي',
        transliteration: "Allahumma-ghfir li dhanbi, wa wassi' li fi dari, wa barik li fi rizqi",
        translation: 'O Allah, forgive my sins, expand my dwelling, and bless my provision.',
        when: 'After completing ghusl (purification bath)',
    },
];

export const MenstrualModeService = {
    /**
     * Get current settings
     */
    async getSettings(): Promise<MenstrualModeSettings> {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
            if (stored) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            }
            return DEFAULT_SETTINGS;
        } catch (error) {
            console.error('❌ Error getting menstrual mode settings:', error);
            return DEFAULT_SETTINGS;
        }
    },

    /**
     * Update settings
     */
    async updateSettings(
        updates: Partial<MenstrualModeSettings>
    ): Promise<MenstrualModeSettings> {
        try {
            const current = await this.getSettings();
            const updated = { ...current, ...updates };
            await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
            console.log('✅ Menstrual mode settings updated:', updates);
            return updated;
        } catch (error) {
            console.error('❌ Error updating menstrual mode settings:', error);
            throw error;
        }
    },

    /**
     * Enable menstrual mode
     */
    async enable(): Promise<MenstrualModeSettings> {
        return this.updateSettings({
            isEnabled: true,
            startDate: new Date().toISOString(),
        });
    },

    /**
     * Disable menstrual mode
     */
    async disable(): Promise<MenstrualModeSettings> {
        // Save to history before clearing
        const current = await this.getSettings();
        if (current.startDate) {
            await this.saveToHistory({
                startDate: current.startDate,
                endDate: new Date().toISOString(),
                duration: this.calculateDays(current.startDate, new Date().toISOString()),
            });
        }

        return this.updateSettings({
            isEnabled: false,
            startDate: null,
        });
    },

    /**
     * Check if mode is currently active
     */
    async isActive(): Promise<boolean> {
        const settings = await this.getSettings();
        return settings.isEnabled;
    },

    /**
     * Get days remaining (estimate based on typical duration)
     */
    async getDaysRemaining(): Promise<number | null> {
        const settings = await this.getSettings();
        if (!settings.isEnabled || !settings.startDate) {
            return null;
        }

        const daysPassed = this.calculateDays(
            settings.startDate,
            new Date().toISOString()
        );
        const remaining = settings.typicalDuration - daysPassed;
        return Math.max(0, remaining);
    },

    /**
     * Get days passed since start
     */
    async getDaysPassed(): Promise<number | null> {
        const settings = await this.getSettings();
        if (!settings.isEnabled || !settings.startDate) {
            return null;
        }

        return this.calculateDays(settings.startDate, new Date().toISOString());
    },

    /**
     * Get relevant duas
     */
    getDuas(): MenstrualDua[] {
        return MENSTRUAL_DUAS;
    },

    /**
     * Get a random dua for the day
     */
    getDailyDua(): MenstrualDua {
        const today = new Date().getDay();
        return MENSTRUAL_DUAS[today % MENSTRUAL_DUAS.length];
    },

    /**
     * Calculate days between two dates
     */
    calculateDays(startDate: string, endDate: string): number {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    /**
     * Save period data to history
     */
    async saveToHistory(entry: {
        startDate: string;
        endDate: string;
        duration: number;
    }): Promise<void> {
        try {
            const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
            const history = historyJson ? JSON.parse(historyJson) : [];
            history.push({
                ...entry,
                savedAt: new Date().toISOString(),
            });
            // Keep only last 12 months
            const trimmed = history.slice(-12);
            await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
        } catch (error) {
            console.error('❌ Error saving to history:', error);
        }
    },

    /**
     * Get period history
     */
    async getHistory(): Promise<Array<{
        startDate: string;
        endDate: string;
        duration: number;
        savedAt: string;
    }>> {
        try {
            const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
            return historyJson ? JSON.parse(historyJson) : [];
        } catch (error) {
            console.error('❌ Error getting history:', error);
            return [];
        }
    },

    /**
     * Calculate average cycle length from history
     */
    async getAverageCycleLength(): Promise<number | null> {
        const history = await this.getHistory();
        if (history.length < 2) return null;

        let totalDays = 0;
        for (let i = 1; i < history.length; i++) {
            const prevStart = new Date(history[i - 1].startDate);
            const currStart = new Date(history[i].startDate);
            totalDays += this.calculateDays(
                prevStart.toISOString(),
                currStart.toISOString()
            );
        }

        return Math.round(totalDays / (history.length - 1));
    },

    /**
     * Get next expected date
     */
    async getNextExpectedDate(): Promise<Date | null> {
        const history = await this.getHistory();
        const avgCycle = await this.getAverageCycleLength();

        if (!avgCycle || history.length === 0) return null;

        const lastStart = new Date(history[history.length - 1].startDate);
        const nextDate = new Date(lastStart);
        nextDate.setDate(nextDate.getDate() + avgCycle);

        return nextDate;
    },
};

export default MenstrualModeService;
export { MENSTRUAL_DUAS };
