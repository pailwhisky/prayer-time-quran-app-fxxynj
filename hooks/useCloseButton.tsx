
import React from 'react';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

/**
 * Custom hook to add a consistent "X" close button to sub-pages
 * This button navigates back to the parent stack or tab root
 */
export function useCloseButton() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginRight: 12, padding: 4 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Close"
          accessibilityRole="button"
        >
          <IconSymbol name="xmark" size={24} color={colors.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);
}
