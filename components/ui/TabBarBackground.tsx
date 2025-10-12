
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';

export default function TabBarBackground() {
  const colorScheme = useColorScheme();
  
  return (
    <BlurView
      intensity={80}
      tint={colorScheme === 'dark' ? 'dark' : 'light'}
      style={StyleSheet.absoluteFill}
    />
  );
}
