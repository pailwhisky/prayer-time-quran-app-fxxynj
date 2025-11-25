
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  background: '#F5F5DC',      // Soft Beige
  text: '#004643',            // Deep Teal
  textSecondary: '#006B5F',   // Quran Green (more visible)
  primary: '#004643',         // Deep Teal
  secondary: '#D4A373',       // Light Brown
  accent: '#D4A373',          // Light Brown
  gold: '#C9A961',            // Islamic Gold
  darkGold: '#B8935A',        // Darker Gold
  card: '#FFFFFF',            // White
  highlight: '#E07A5F',       // Burnt Orange
  shadow: 'rgba(0, 70, 67, 0.1)',
  border: 'rgba(0, 70, 67, 0.2)',
  quranGreen: '#006B5F',      // Quran Green for better visibility
  ornamental: '#8B7355',      // Ornamental Brown
  lightGold: '#F4E4C1',       // Light Gold Background
  
  // Super Ultra Gold Theme
  superUltraGold: '#FFD700',        // Bright Gold
  superUltraGoldDark: '#DAA520',    // Goldenrod
  superUltraGoldLight: '#FFF8DC',   // Cornsilk
  superUltraGoldShine: '#FFED4E',   // Shining Gold
  superUltraGoldDeep: '#B8860B',    // Dark Goldenrod
  superUltraGoldAccent: '#FFA500',  // Orange Gold
  superUltraGoldPale: '#FFFACD',    // Lemon Chiffon
  superUltraGoldRich: '#CFB53B',    // Old Gold
  superUltraGoldBronze: '#CD7F32',  // Bronze
  superUltraGoldRose: '#B76E79',    // Rose Gold
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    backgroundColor: colors.secondary,
    alignSelf: 'center',
    width: '100%',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 10
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    boxShadow: `0px 4px 8px ${colors.shadow}`,
    elevation: 3,
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: colors.primary,
  },
  // Islamic ornamental styles
  ornamentalBorder: {
    borderWidth: 2,
    borderColor: colors.gold,
    borderStyle: 'solid',
  },
  islamicPattern: {
    backgroundColor: colors.lightGold,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  arabicText: {
    fontWeight: '600',
    letterSpacing: 1,
  },
  // Super Ultra Gold Styles
  superUltraCard: {
    backgroundColor: colors.superUltraGoldPale,
    borderColor: colors.superUltraGold,
    borderWidth: 3,
    borderRadius: 16,
    padding: 20,
    boxShadow: `0px 8px 24px ${colors.superUltraGold}60`,
    elevation: 8,
  },
  superUltraGradient: {
    background: `linear-gradient(135deg, ${colors.superUltraGoldLight} 0%, ${colors.superUltraGold} 50%, ${colors.superUltraGoldDark} 100%)`,
  },
  superUltraText: {
    color: colors.superUltraGoldDeep,
    fontWeight: 'bold',
    textShadow: `0px 1px 2px ${colors.superUltraGold}40`,
  },
  superUltraShine: {
    boxShadow: `0px 0px 20px ${colors.superUltraGoldShine}80, 0px 0px 40px ${colors.superUltraGold}40`,
  },
});
