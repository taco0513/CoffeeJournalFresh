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
    
    // CupNote brand colors (from your existing design)
    cupBlue: '#2196F3',
    cupBlueLight: '#E3F2FD',
    cupBlueDark: '#1976D2',
    
    // Semantic colors for coffee app
    acidity: '#FF9800',
    sweetness: '#E91E63',
    body: '#9C27B0',
    aftertaste: '#3F51B5',
    balance: '#00BCD4',
    
    // Status colors
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
  },
  space: {
    ...tokens.space,
    // Using your existing spacing system
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
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
}

// Create animations
const animations = createAnimations({
  bouncy: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  lazy: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
  quick: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
})

// Create fonts
const headingFont = createInterFont({
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 40,
    10: 48,
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
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
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
  
  // Brand colors
  primary: cupNoteTokens.color.cupBlue,
  primaryHover: cupNoteTokens.color.cupBlueDark,
  
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
  
  // Brand colors in dark mode
  primary: cupNoteTokens.color.cupBlue,
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

// Export types for TypeScript
export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}