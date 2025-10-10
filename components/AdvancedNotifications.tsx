
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettings {
  enabled: boolean;
  preReminders: {
    fajr: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
  sounds: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  vibration: boolean;
  customMessages: boolean;
}

interface AdvancedNotificationsProps {
  visible: boolean;
  onClose: () => void;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  preReminders: {
    fajr: 15,
    dhuhr: 10,
    asr: 10,
    maghrib: 5,
    isha: 15,
  },
  sounds: {
    fajr: 'default',
    dhuhr: 'default',
    asr: 'default',
    maghrib: 'default',
    isha: 'default',
  },
  vibration: true,
  customMessages: false,
};

const availableSounds = [
  { id: 'default', name: 'Default', description: 'System default notification sound' },
  { id: 'adhan_makkah', name: 'Makkah Adhan', description: 'Beautiful Adhan from Makkah' },
  { id: 'adhan_madinah', name: 'Madinah Adhan', description: 'Peaceful Adhan from Madinah' },
  { id: 'bell', name: 'Bell', description: 'Simple bell sound' },
  { id: 'chime', name: 'Chime', description: 'Gentle chime sound' },
];

const prayerNames = {
  fajr: { english: 'Fajr', arabic: 'الفجر' },
  dhuhr: { english: 'Dhuhr', arabic: 'الظهر' },
  asr: { english: 'Asr', arabic: 'العصر' },
  maghrib: { english: 'Maghrib', arabic: 'المغرب' },
  isha: { english: 'Isha', arabic: 'العشاء' },
};

export default function AdvancedNotifications({ visible, onClose }: AdvancedNotificationsProps) {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [showSoundPicker, setShowSoundPicker] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    try {
      // Load from AsyncStorage first
      const storedSettings = await AsyncStorage.getItem('notification_settings');
      if (storedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(storedSettings) });
      }

      // Load from Supabase if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('notification_settings')
          .eq('user_id', user.id)
          .single();

        if (!error && data?.notification_settings) {
          setSettings({ ...defaultSettings, ...data.notification_settings });
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      setSettings(newSettings);

      // Save to AsyncStorage
      await AsyncStorage.setItem('notification_settings', JSON.stringify(newSettings));

      // Save to Supabase if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            notification_settings: newSettings,
          }, {
            onConflict: 'user_id',
          });

        if (error) {
          console.error('Error saving to Supabase:', error);
        }
      }

      // Reschedule notifications with new settings
      await scheduleNotifications(newSettings);
      
      Alert.alert('Success', 'Notification settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
    }
  };

  const scheduleNotifications = async (notificationSettings: NotificationSettings) => {
    try {
      // Cancel existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (!notificationSettings.enabled) return;

      // This is a simplified version - in a real app, you'd integrate with your prayer times calculation
      const now = new Date();
      const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

      for (const prayer of prayers) {
        const preReminderMinutes = notificationSettings.preReminders[prayer];
        const sound = notificationSettings.sounds[prayer];

        // Schedule pre-prayer reminder
        if (preReminderMinutes > 0) {
          const reminderTime = new Date(now.getTime() + (preReminderMinutes * 60 * 1000));
          
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${prayerNames[prayer].english} Prayer Reminder`,
              body: `${prayerNames[prayer].english} prayer is in ${preReminderMinutes} minutes. Time to prepare.`,
              sound: sound !== 'default' ? sound : true,
              data: { prayer, type: 'reminder' },
            },
            trigger: {
              date: reminderTime,
            },
          });
        }

        // Schedule prayer time notification
        const prayerTime = new Date(now.getTime() + (60 * 60 * 1000)); // Simplified - 1 hour from now
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${prayerNames[prayer].english} Prayer Time`,
            body: notificationSettings.customMessages 
              ? `It's time for ${prayerNames[prayer].english} prayer (${prayerNames[prayer].arabic}). May Allah accept your prayers.`
              : `Time for ${prayerNames[prayer].english} prayer`,
            sound: sound !== 'default' ? sound : true,
            data: { prayer, type: 'prayer_time' },
          },
          trigger: {
            date: prayerTime,
          },
        });
      }

      console.log('Notifications scheduled successfully');
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  };

  const updatePreReminder = (prayer: keyof typeof prayerNames, minutes: number) => {
    const newSettings = {
      ...settings,
      preReminders: {
        ...settings.preReminders,
        [prayer]: minutes,
      },
    };
    saveSettings(newSettings);
  };

  const updateSound = (prayer: keyof typeof prayerNames, soundId: string) => {
    const newSettings = {
      ...settings,
      sounds: {
        ...settings.sounds,
        [prayer]: soundId,
      },
    };
    saveSettings(newSettings);
    setShowSoundPicker(null);
  };

  const renderPrayerSettings = (prayer: keyof typeof prayerNames) => (
    <View key={prayer} style={styles.prayerSettingsCard}>
      <View style={styles.prayerHeader}>
        <Text style={styles.prayerName}>{prayerNames[prayer].english}</Text>
        <Text style={styles.prayerArabic}>{prayerNames[prayer].arabic}</Text>
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Pre-reminder (minutes)</Text>
        <View style={styles.reminderButtons}>
          {[0, 5, 10, 15, 30].map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.reminderButton,
                settings.preReminders[prayer] === minutes && styles.reminderButtonActive,
              ]}
              onPress={() => updatePreReminder(prayer, minutes)}
            >
              <Text
                style={[
                  styles.reminderButtonText,
                  settings.preReminders[prayer] === minutes && styles.reminderButtonTextActive,
                ]}
              >
                {minutes}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Notification Sound</Text>
        <TouchableOpacity
          style={styles.soundButton}
          onPress={() => setShowSoundPicker(prayer)}
        >
          <Text style={styles.soundButtonText}>
            {availableSounds.find(s => s.id === settings.sounds[prayer])?.name || 'Default'}
          </Text>
          <IconSymbol name="chevron-right" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSoundPicker = () => (
    <Modal
      visible={!!showSoundPicker}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowSoundPicker(null)}
    >
      <View style={styles.soundPickerContainer}>
        <View style={styles.soundPickerHeader}>
          <Text style={styles.soundPickerTitle}>
            Select Sound for {showSoundPicker ? prayerNames[showSoundPicker as keyof typeof prayerNames].english : ''}
          </Text>
          <TouchableOpacity onPress={() => setShowSoundPicker(null)}>
            <IconSymbol name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.soundList}>
          {availableSounds.map((sound) => (
            <TouchableOpacity
              key={sound.id}
              style={[
                styles.soundItem,
                settings.sounds[showSoundPicker as keyof typeof prayerNames] === sound.id && styles.soundItemActive,
              ]}
              onPress={() => updateSound(showSoundPicker as keyof typeof prayerNames, sound.id)}
            >
              <View style={styles.soundInfo}>
                <Text style={styles.soundName}>{sound.name}</Text>
                <Text style={styles.soundDescription}>{sound.description}</Text>
              </View>
              {settings.sounds[showSoundPicker as keyof typeof prayerNames] === sound.id && (
                <IconSymbol name="check" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Advanced Notifications</Text>
          <TouchableOpacity onPress={onClose}>
            <IconSymbol name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Global Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General Settings</Text>
            
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Enable Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Turn on/off all prayer notifications
                  </Text>
                </View>
                <Switch
                  value={settings.enabled}
                  onValueChange={(value) => saveSettings({ ...settings, enabled: value })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.card}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Vibration</Text>
                  <Text style={styles.settingDescription}>
                    Enable vibration for notifications
                  </Text>
                </View>
                <Switch
                  value={settings.vibration}
                  onValueChange={(value) => saveSettings({ ...settings, vibration: value })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.card}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Custom Messages</Text>
                  <Text style={styles.settingDescription}>
                    Use personalized prayer reminders
                  </Text>
                </View>
                <Switch
                  value={settings.customMessages}
                  onValueChange={(value) => saveSettings({ ...settings, customMessages: value })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.card}
                />
              </View>
            </View>
          </View>

          {/* Prayer-specific Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prayer-specific Settings</Text>
            <Text style={styles.sectionDescription}>
              Customize reminders and sounds for each prayer
            </Text>
            
            {Object.keys(prayerNames).map((prayer) =>
              renderPrayerSettings(prayer as keyof typeof prayerNames)
            )}
          </View>

          {/* Test Notification */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.testButton}
              onPress={async () => {
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: 'Test Notification',
                    body: 'This is a test of your notification settings.',
                    sound: true,
                  },
                  trigger: {
                    seconds: 1,
                  },
                });
                Alert.alert('Test Sent', 'A test notification will appear shortly');
              }}
            >
              <IconSymbol name="notifications" size={20} color={colors.card} />
              <Text style={styles.testButtonText}>Send Test Notification</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {renderSoundPicker()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  settingCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  prayerSettingsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  prayerArabic: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: 'NotoSansArabic_400Regular',
  },
  reminderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  reminderButton: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 40,
    alignItems: 'center',
  },
  reminderButtonActive: {
    backgroundColor: colors.primary,
  },
  reminderButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  reminderButtonTextActive: {
    color: colors.card,
  },
  soundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  soundButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  testButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  testButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Sound Picker Styles
  soundPickerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  soundPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  soundPickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  soundList: {
    flex: 1,
    padding: 20,
  },
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  soundItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  soundInfo: {
    flex: 1,
  },
  soundName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  soundDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
