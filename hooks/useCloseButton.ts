
// hooks/useCloseButton.ts
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
        >
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);
}
