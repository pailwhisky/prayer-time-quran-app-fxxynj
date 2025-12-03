
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Switch,
  Slider,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavigationHeader from '@/components/NavigationHeader';

interface NightReadingModeProps {
  visible: boolean;
  onClose: () => void;
}

export default function NightReadingMode({ visible, onClose }: NightReadingModeProps) {
  const [brightness, setBrightness] = useState(30);
  const [fontSize, setFontSize] = useState(18);
  const [redFilter, setRedFilter] = useState(true);
  const [autoMode, setAutoMode] = useState(false);

  const saveSettings = async () => {
    try {
      const settings = {
        brightness,
        fontSize,
        redFilter,
        autoMode,
      };
      await AsyncStorage.setItem('night_reading_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleApply = () => {
    saveSettings();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.container, redFilter && styles.redFilterContainer]}>
        <NavigationHeader
          title="Night Reading Mode"
          showClose={true}
          onClosePress={onClose}
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🌙 Night Reading Mode</Text>
            <Text style={styles.infoText}>
              Optimized for reading during Tahajjud and night prayers. Reduces eye strain with lower brightness and optional red filter.
            </Text>
          </View>

          {/* Preview */}
          <View style={[styles.previewCard, redFilter && styles.redFilterPreview]}>
            <Text style={[styles.previewArabic, { fontSize: fontSize + 8 }]}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </Text>
            <Text style={[styles.previewText, { fontSize }]}>
              In the name of Allah, the Most Gracious, the Most Merciful
            </Text>
          </View>

          {/* Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Display Settings</Text>

            {/* Brightness */}
            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <IconSymbol name="brightness-6" size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>Brightness</Text>
                <Text style={styles.settingValue}>{brightness}%</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={10}
                maximumValue={100}
                value={brightness}
                onValueChange={setBrightness}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
              />
            </View>

            {/* Font Size */}
            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <IconSymbol name="format-size" size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>Font Size</Text>
                <Text style={styles.settingValue}>{fontSize}pt</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={14}
                maximumValue={28}
                value={fontSize}
                onValueChange={setFontSize}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
              />
            </View>

            {/* Red Filter */}
            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <IconSymbol name="filter" size={20} color={colors.primary} />
                <View style={styles.settingLabelContainer}>
                  <Text style={styles.settingLabel}>Red Light Filter</Text>
                  <Text style={styles.settingDescription}>
                    Reduces blue light for better sleep
                  </Text>
                </View>
                <Switch
                  value={redFilter}
                  onValueChange={setRedFilter}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Auto Mode */}
            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <IconSymbol name="schedule" size={20} color={colors.primary} />
                <View style={styles.settingLabelContainer}>
                  <Text style={styles.settingLabel}>Auto Night Mode</Text>
                  <Text style={styles.settingDescription}>
                    Activate between Isha and Fajr
                  </Text>
                </View>
                <Switch
                  value={autoMode}
                  onValueChange={setAutoMode}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>Benefits</Text>
            <View style={styles.benefitItem}>
              <IconSymbol name="check-circle" size={20} color={colors.accent} />
              <Text style={styles.benefitText}>Reduces eye strain during night prayers</Text>
            </View>
            <View style={styles.benefitItem}>
              <IconSymbol name="check-circle" size={20} color={colors.accent} />
              <Text style={styles.benefitText}>Minimizes blue light exposure</Text>
            </View>
            <View style={styles.benefitItem}>
              <IconSymbol name="check-circle" size={20} color={colors.accent} />
              <Text style={styles.benefitText}>Helps maintain sleep quality</Text>
            </View>
            <View style={styles.benefitItem}>
              <IconSymbol name="check-circle" size={20} color={colors.accent} />
              <Text style={styles.benefitText}>Optimized for Tahajjud reading</Text>
            </View>
          </View>

          {/* Apply Button */}
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <IconSymbol name="check" size={20} color="#FFFFFF" />
            <Text style={styles.applyButtonText}>Apply Settings</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  redFilterContainer: {
    backgroundColor: '#1a0000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    boxShadow: `0px 4px 8px ${colors.shadow}`,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  previewCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 4px 8px ${colors.shadow}`,
    elevation: 3,
  },
  redFilterPreview: {
    backgroundColor: '#2a0000',
  },
  previewArabic: {
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  previewText: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 2px 4px ${colors.shadow}`,
    elevation: 2,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  settingLabelContainer: {
    flex: 1,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: 8,
  },
  benefitsSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 4px 8px ${colors.shadow}`,
    elevation: 3,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 4,
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
