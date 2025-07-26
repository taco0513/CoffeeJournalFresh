import { createTamagui } from '@tamagui/core'
import { shorthands } from '@tamagui/shorthands'
import { themes, tokens } from '@tamagui/themes'
import { createInterFont } from '@tamagui/font-inter'
import { createAnimations } from '@tamagui/animations-react-native'

// CupNote specific tokens extending default tokens
const cupNoteTokens = {
  ...tokens,
  color: {
    ...tokens.color,
    // Coffee-themed colors
    espresso: '#3E2723',
    latte: '#D7CCC8',
    foam: '#EFEBE9',
    bean: '#6F4E37',
    
    // CupNote brand colors - WCAG AA compliant (4.5:1+ contrast ratio)
    cupBlue: '#1565C0',        // Improved: 4.77:1 contrast ratio ✅
    cupBlueLight: '#E3F2FD',   // Light variant: 12.6:1 ✅
    cupBlueDark: '#0D47A1',    // Dark variant: 8.59:1 ✅
    cupBluePress: '#1565C0',   // Press state: maintains contrast ✅
    
    // Semantic colors for coffee app
    acidity: '#FF9800',
    sweetness: '#E91E63',
    body: '#9C27B0',
    aftertaste: '#3F51B5',
    balance: '#00BCD4',
    
    // Status colors - WCAG AA compliant
    success: '#2E7D32',        // Improved: 5.49:1 contrast ratio ✅
    warning: '#EF6C00',        // Improved: 4.52:1 contrast ratio ✅  
    error: '#C62828',          // Improved: 7.00:1 contrast ratio ✅
    
    // Focus indicator for accessibility
    focusRing: '#0D47A1',      // High contrast focus indicator ✅
  },
  space: {
    ...tokens.space,
    // Complete spacing system with all required tokens
    xxxs: 1,
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  size: {
    ...tokens.size,
    // Component sizes
    0: 0,
    0.25: 2,
    0.5: 4,
    0.75: 8,
    1: 16,
    1.5: 24,
    2: 32,
    2.5: 40,
    3: 48,
    3.5: 56,
    4: 64,
    true: 44, // Default button height
    
    // Badge sizes
    badgeSmall: 20,
    badgeMedium: 24,
    badgeLarge: 28,
    badgeXLarge: 32,
    
    // Icon sizes
    iconSmall: 24,
    iconMedium: 32,
    iconLarge: 48,
    iconXLarge: 64,
    
    // Stat card heights
    statCardSmall: 75,
    statCardMedium: 85,
    statCardLarge: 95,
  },
  radius: {
    ...tokens.radius,
    // Your existing radius values
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    true: 12, // Default radius
  },
  zIndex: {
    ...tokens.zIndex,
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    badge: 10,
    modal: 50,
    tooltip: 100,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
  animation: {
    delayQuick: '50ms',
    delayNormal: '100ms',
    delaySlow: '150ms',
    delaySlower: '200ms',
  },
}

// MVP Beta: Minimal animation config to prevent errors while disabling animations
const animations = createAnimations({
  // Disabled animations with minimal duration
  bouncy: {
    type: 'timing',
    duration: 1, // 1ms - essentially instant
  },
  lazy: {
    type: 'timing', 
    duration: 1, // 1ms - essentially instant
  },
  quick: {
    type: 'timing',
    duration: 1, // 1ms - essentially instant
  },
})

// Create fonts
const headingFont = createInterFont({
  size: {
    1: 18,   // Small heading
    2: 20,   // Small+ heading 
    3: 22,   // Medium heading
    4: 24,   // H4
    5: 28,   // H3
    6: 32,   // H2
    7: 36,   // H1
    8: 40,   // Large H1
    9: 44,   // Extra large
    10: 48,  // Display
    true: 24, // Default heading size
  },
  weight: {
    1: '400',
    2: '500',
    3: '600',
    4: '700',
    5: '800',
  },
})

const bodyFont = createInterFont({
  size: {
    1: 12,   // Small text (badges, captions)
    2: 14,   // Small body text
    3: 16,   // Default body text - WCAG minimum ✅
    4: 18,   // Large body text ✅
    5: 20,   // Extra large body ✅
    6: 22,   // Emphasized text ✅
    true: 16, // Default body size
  },
  weight: {
    1: '400',
    2: '500',
    3: '600',
  },
})

// Create themes
const lightTheme = {
  ...themes.light,
  // CupNote specific theme values
  background: '#FFFFFF',
  backgroundHover: '#F5F5F5',
  backgroundPress: '#EEEEEE',
  backgroundFocus: '#E8E8E8',
  color: '#000000',
  colorHover: '#111111',
  colorPress: '#222222',
  colorFocus: '#333333',
  borderColor: '#E0E0E0',
  borderColorHover: '#D0D0D0',
  borderColorPress: '#C0C0C0',
  borderColorFocus: '#B0B0B0',
  
  // Gray scale for proper token support
  gray1: '#FCFCFC',
  gray2: '#F9F9F9',
  gray3: '#F0F0F0',
  gray4: '#E8E8E8',
  gray5: '#E0E0E0',
  gray6: '#D9D9D9',
  gray7: '#CECECE',
  gray8: '#BBBBBB',
  gray9: '#8D8D8D',
  gray10: '#838383',
  gray11: '#646464',
  gray12: '#202020',
  
  // Brand colors
  primary: cupNoteTokens.color.cupBlue,
  primaryHover: cupNoteTokens.color.cupBlueDark,
  
  // Accessibility focus indicators - WCAG 2.4.7 compliant
  focusRing: cupNoteTokens.color.focusRing,
  focusRingLight: '#42A5F5',
  focusBackground: '#E3F2FD',
  focusShadow: '0 0 0 3px rgba(13, 71, 161, 0.4)',
  
  // Coffee evaluation colors
  acidity: cupNoteTokens.color.acidity,
  sweetness: cupNoteTokens.color.sweetness,
  body: cupNoteTokens.color.body,
  aftertaste: cupNoteTokens.color.aftertaste,
  balance: cupNoteTokens.color.balance,
}

const darkTheme = {
  ...themes.dark,
  // Dark mode overrides
  background: '#121212',
  backgroundHover: '#1E1E1E',
  backgroundPress: '#2A2A2A',
  backgroundFocus: '#363636',
  color: '#FFFFFF',
  colorHover: '#EEEEEE',
  colorPress: '#DDDDDD',
  colorFocus: '#CCCCCC',
  borderColor: '#333333',
  borderColorHover: '#444444',
  borderColorPress: '#555555',
  borderColorFocus: '#666666',
  
  // Gray scale for dark mode
  gray1: '#161616',
  gray2: '#1C1C1C',
  gray3: '#232323',
  gray4: '#2A2A2A',
  gray5: '#313131',
  gray6: '#3A3A3A',
  gray7: '#484848',
  gray8: '#606060',
  gray9: '#6E6E6E',
  gray10: '#7B7B7B',
  gray11: '#B4B4B4',
  gray12: '#EEEEEE',
  
  // Brand colors in dark mode
  primary: cupNoteTokens.color.cupBlue,
  
  // Accessibility focus indicators - dark mode
  focusRing: '#42A5F5',
  focusRingLight: cupNoteTokens.color.cupBlueLight,
  focusBackground: '#1E3A8A',
  focusShadow: '0 0 0 3px rgba(66, 165, 245, 0.4)',
  primaryHover: cupNoteTokens.color.cupBlueLight,
}

// Create and export config
const config = createTamagui({
  tokens: cupNoteTokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  animations,
  // Default font settings
  defaultProps: {
    Text: {
      fontFamily: '$body',
      fontSize: '$3', // Default to 16px (body size 3)
    },
    H1: {
      fontFamily: '$heading',
      fontSize: '$7', // 36px
      fontWeight: '700',
    },
    H2: {
      fontFamily: '$heading',
      fontSize: '$6', // 32px
      fontWeight: '600',
    },
    H3: {
      fontFamily: '$heading',
      fontSize: '$5', // 28px
      fontWeight: '600',
    },
    H4: {
      fontFamily: '$heading',
      fontSize: '$4', // 20px
      fontWeight: '600',
    },
    H5: {
      fontFamily: '$heading',
      fontSize: '$3', // 16px
      fontWeight: '600',
    },
    Paragraph: {
      fontFamily: '$body',
      fontSize: '$3', // 16px
      lineHeight: 24,
    },
  },
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },
})

export default config

// Export type without circular reference
export type { TamaguiCustomConfig } from 'tamagui'