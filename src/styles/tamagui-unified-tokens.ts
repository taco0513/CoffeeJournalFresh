/**
 * Unified Tamagui Design Tokens
 * 
 * This file consolidates all design tokens from the migration,
 * mapping legacy HIGColors to Tamagui tokens for consistency.
 */

// Color Token Mapping (HIGColors → Tamagui)
export const colorMapping = {
  // Primary Brand Colors
  'HIGColors.blue': '$cupBlue',
  'HIGColors.systemBlue': '$cupBlue',
  '#007AFF': '$cupBlue',
  
  // System Colors
  'HIGColors.systemGreen': '$green9',
  'HIGColors.green': '$green9',
  '#34C759': '$green9',
  '#2E7D32': '$green9',
  
  'HIGColors.systemRed': '$red9',
  'HIGColors.red': '$red9',
  '#FF3B30': '$red9',
  
  'HIGColors.systemOrange': '$orange9',
  'HIGColors.orange': '$orange9',
  '#FF9500': '$orange9',
  
  'HIGColors.systemYellow': '$yellow9',
  'HIGColors.yellow': '$yellow9',
  '#FFCC00': '$yellow9',
  
  'HIGColors.systemPurple': '$purple9',
  'HIGColors.purple': '$purple9',
  '#AF52DE': '$purple9',
  
  'HIGColors.systemBrown': '$cupBrown',
  'HIGColors.brown': '$cupBrown',
  '#8B4513': '$cupBrown',
  '#A2845E': '$cupBrown',
  
  // Gray Scale
  'HIGColors.gray': '$gray11',
  'HIGColors.systemGray': '$gray11',
  '#8E8E93': '$gray11',
  
  'HIGColors.gray2': '$gray10',
  '#AEAEB2': '$gray10',
  
  'HIGColors.gray3': '$gray9',
  'HIGColors.systemGray3': '$gray9',
  '#C7C7CC': '$gray9',
  
  'HIGColors.gray4': '$gray8',
  'HIGColors.systemGray4': '$gray8',
  '#D1D1D6': '$gray8',
  
  'HIGColors.gray5': '$gray7',
  'HIGColors.systemGray5': '$gray7',
  '#E5E5EA': '$gray7',
  
  'HIGColors.gray6': '$gray6',
  'HIGColors.systemGray6': '$gray6',
  '#F2F2F7': '$gray6',
  
  // Semantic Colors
  'HIGColors.label': '$color',
  'HIGColors.secondaryLabel': '$gray11',
  'HIGColors.tertiaryLabel': '$gray10',
  'HIGColors.quaternaryLabel': '$gray9',
  
  'HIGColors.systemBackground': '$background',
  'HIGColors.secondarySystemBackground': '$backgroundStrong',
  'HIGColors.tertiarySystemBackground': '$backgroundSoft',
  '#F8F9FA': '$backgroundStrong',
  
  'HIGColors.separator': '$borderColor',
  
  // Common Hex Colors
  '#FFFFFF': '$background',
  '#000000': '$color',
  '#E0E0E0': '$borderColor',
  
  // Coffee-specific colors (already in Tamagui config)
  'acidity': '$orange9',
  'sweetness': '$pink9',
  'body': '$purple9',
  'aftertaste': '$blue9',
  'balance': '$cyan9',
} as const;

// Spacing Token Mapping (HIGConstants → Tamagui)
export const spacingMapping = {
  'HIGConstants.SPACING_XS': '$xs',  // 4
  'HIGConstants.SPACING_SM': '$sm',  // 8
  'HIGConstants.SPACING_MD': '$md',  // 12 → 16
  'HIGConstants.SPACING_LG': '$lg',  // 16 → 24
  'HIGConstants.SPACING_XL': '$xl',  // 20 → 32
  
  'HIGConstants.HORIZONTAL_PADDING': '$lg',
  'HIGConstants.VERTICAL_PADDING': '$md',
} as const;

// Font Size Token Mapping
export const fontSizeMapping = {
  'HIGConstants.FONT_SIZE_H1': '$7',      // 28 → 32
  'HIGConstants.FONT_SIZE_H2': '$6',      // 24 → 28
  'HIGConstants.FONT_SIZE_H3': '$5',      // 20 → 24
  'HIGConstants.FONT_SIZE_TITLE': '$4',   // 17 → 20
  'HIGConstants.FONT_SIZE_BODY': '$3',    // 16
  'HIGConstants.FONT_SIZE_CAPTION': '$2', // 13 → 16
  'HIGConstants.FONT_SIZE_FOOTNOTE': '$1',// 12 → 14
  
  'HIGConstants.FONT_SIZE_LARGE': '$4',   // 18 → 20
  'HIGConstants.FONT_SIZE_MEDIUM': '$3',  // 16
  'HIGConstants.FONT_SIZE_SMALL': '$2',   // 14 → 16
} as const;

// Border Radius Token Mapping
export const radiusMapping = {
  'HIGConstants.BORDER_RADIUS': '$2',         // 8
  'HIGConstants.BORDER_RADIUS_LARGE': '$3',   // 12
  'HIGConstants.BORDER_RADIUS_LG': '$4',      // 16
  'HIGConstants.BORDER_RADIUS_SM': '$1',      // 4
  'HIGConstants.cornerRadiusSmall': '$1',     // 4
  'HIGConstants.cornerRadiusMedium': '$3',    // 12
  'HIGConstants.cornerRadiusLarge': '$4',     // 16
} as const;

// Common Style Patterns to Replace
export const stylePatterns = {
  // Shadow styles
  shadowIOS: {
    old: `
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    `,
    new: `
    shadowColor: '$shadowColor',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    `,
  },
  
  // Button styles
  primaryButton: {
    old: `
    backgroundColor: HIGColors.blue,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    `,
    new: `
    backgroundColor: '$cupBlue',
    borderRadius: '$2',
    padding: '$md',
    `,
  },
  
  // Text styles
  titleText: {
    old: `
    fontSize: HIGConstants.FONT_SIZE_TITLE,
    fontWeight: '600',
    color: HIGColors.label,
    `,
    new: `
    fontSize: '$4',
    fontWeight: '600',
    color: '$color',
    `,
  },
} as const;

// Component-specific token usage guidelines
export const componentGuidelines = {
  Container: {
    backgroundColor: '$background',
    padding: '$lg',
    flex: 1,
  },
  
  Card: {
    backgroundColor: '$backgroundStrong',
    borderRadius: '$3',
    padding: '$md',
    borderWidth: 1,
    borderColor: '$borderColor',
  },
  
  Button: {
    primary: {
      backgroundColor: '$cupBlue',
      pressStyle: { backgroundColor: '$cupBlueDark' },
    },
    danger: {
      backgroundColor: '$red9',
      pressStyle: { backgroundColor: '$red10' },
    },
    success: {
      backgroundColor: '$green9',
      pressStyle: { backgroundColor: '$green10' },
    },
  },
  
  Text: {
    title: {
      fontSize: '$5',
      fontWeight: '600',
      color: '$color',
    },
    body: {
      fontSize: '$3',
      color: '$color',
    },
    caption: {
      fontSize: '$2',
      color: '$gray11',
    },
  },
  
  Input: {
    borderWidth: 1,
    borderColor: '$borderColor',
    borderRadius: '$2',
    padding: '$md',
    fontSize: '$3',
    focusStyle: {
      borderColor: '$cupBlue',
      backgroundColor: '$backgroundFocus',
    },
  },
} as const;

// Animation presets (already in Tamagui config)
export const animationPresets = {
  // Quick: For immediate feedback (buttons, toggles)
  quick: 'quick',
  
  // Lazy: For content that appears (cards, sections)
  lazy: 'lazy',
  
  // Bouncy: For playful interactions (achievements, celebrations)
  bouncy: 'bouncy',
} as const;

// Consolidated theme tokens for reference
export const unifiedTokens = {
  // Brand Colors
  cupBlue: '#2196F3',
  cupBlueLight: '#E3F2FD',
  cupBlueDark: '#1976D2',
  cupBrown: '#8B4513',
  cupBrownDark: '#6B3410',
  
  // Semantic Colors (Coffee App)
  acidity: '#FF9800',
  sweetness: '#E91E63',
  body: '#9C27B0',
  aftertaste: '#3F51B5',
  balance: '#00BCD4',
  
  // Status Colors
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  
  // Spacing Scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Font Sizes
  fontSize: {
    1: 14,  // Small
    2: 16,  // Caption
    3: 18,  // Body
    4: 20,  // Title
    5: 24,  // H3
    6: 28,  // H2
    7: 32,  // H1
    8: 36,  // Large H1
  },
  
  // Border Radius
  radius: {
    1: 4,   // Small
    2: 8,   // Default
    3: 12,  // Medium
    4: 16,  // Large
    5: 20,  // Extra Large
    6: 24,  // Pill
  },
} as const;

// Migration helper function
export function migrateStyleValue(value: string): string {
  // Check color mappings
  for (const [oldValue, newValue] of Object.entries(colorMapping)) {
    if (value === oldValue) {
      return newValue;
    }
  }
  
  // Check spacing mappings
  for (const [oldValue, newValue] of Object.entries(spacingMapping)) {
    if (value === oldValue) {
      return newValue;
    }
  }
  
  // Check font size mappings
  for (const [oldValue, newValue] of Object.entries(fontSizeMapping)) {
    if (value === oldValue) {
      return newValue;
    }
  }
  
  // Check radius mappings
  for (const [oldValue, newValue] of Object.entries(radiusMapping)) {
    if (value === oldValue) {
      return newValue;
    }
  }
  
  return value;
}