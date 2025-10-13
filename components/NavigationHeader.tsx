
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

interface NavigationHeaderProps {
  title?: string;
  showBack?: boolean;
  showClose?: boolean;
  onBackPress?: () => void;
  onClosePress?: () => void;
  rightComponent?: React.ReactNode;
}

export default function NavigationHeader({
  title,
  showBack = false,
  showClose = true,
  onBackPress,
  onClosePress,
  rightComponent,
}: NavigationHeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const handleClosePress = () => {
    if (onClosePress) {
      onClosePress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.button}
            activeOpacity={0.7}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centerSection}>
        {title && <Text style={styles.title}>{title}</Text>}
      </View>

      <View style={styles.rightSection}>
        {rightComponent}
        {showClose && (
          <TouchableOpacity
            onPress={handleClosePress}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <IconSymbol name="xmark" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    padding: 8,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0 2px 4px ${colors.shadow}`,
    elevation: 2,
  },
  closeButton: {
    padding: 8,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0 2px 4px ${colors.shadow}`,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
});
