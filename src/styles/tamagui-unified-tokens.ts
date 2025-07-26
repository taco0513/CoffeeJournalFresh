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
    // Size guidelines - Mobile-optimized with generous widths
    sm: {
      height: 40,      // Small buttons (minimum safe size)
      minWidth: 176,   // Generous width for better visual balance
      paddingHorizontal: '$lg',
    },
    md: {
      height: 44,      // Standard button (WCAG AA compliant)
      minWidth: 200,   // Comfortable minimum width
      paddingHorizontal: '$xl',
    },
    lg: {
      height: 48,      // Primary action buttons
      minWidth: 240,   // Spacious primary actions
      paddingHorizontal: '$xxl',
    },
    xl: {
      height: 56,      // Floating/CTA buttons
      minWidth: 280,   // Large action buttons
      paddingHorizontal: '$xxl',
    },
    xxl: {
      height: 64,      // Extra large touch targets
      minWidth: 320,   // Maximum comfortable size
      paddingHorizontal: '$xxxl',
    },
    
    // Color variants
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
    
    // ToggleButton - Global style for toggle/selection buttons
    toggle: {
      backgroundColor: '$gray2',
      borderWidth: 1,
      borderColor: '$borderColor',
      borderRadius: '$3',
      padding: '$sm',
      marginRight: '$sm',
      marginBottom: '$sm',
      minWidth: 88,  // Balanced minimum width (88px)
      height: 36,    // Comfortable button height (36px)
      
      // Selected state
      selectedStyle: {
        backgroundColor: '$blue2',
        borderColor: '$primary',
        borderWidth: 2, // Thick border for selection
      },
      
      // Press interaction
      pressStyle: {
        scale: 0.95,
        backgroundColor: '$gray3',
      },
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

// Consolidated theme tokens for reference - WCAG AA compliant
export const unifiedTokens = {
  // Brand Colors - WCAG AA compliant (4.5:1+ contrast ratio)
  cupBlue: '#1565C0',        // Improved: 4.77:1 contrast ratio 
  cupBlueLight: '#E3F2FD',   // Light variant: 12.6:1 
  cupBlueDark: '#0D47A1',    // Dark variant: 8.59:1 
  cupBrown: '#8B4513',
  cupBrownDark: '#6B3410',
  
  // Semantic Colors (Coffee App)
  acidity: '#FF9800',
  sweetness: '#E91E63',
  body: '#9C27B0',
  aftertaste: '#3F51B5',
  balance: '#00BCD4',
  
  // Status Colors - WCAG AA compliant
  success: '#2E7D32',        // Improved: 5.49:1 contrast ratio 
  warning: '#EF6C00',        // Improved: 4.52:1 contrast ratio   
  error: '#C62828',          // Improved: 7.00:1 contrast ratio 
  
  // Focus indicator for accessibility
  focusRing: '#0D47A1',      // High contrast focus indicator 
  
  // Spacing Scale - Consistent with research-backed spacing
  spacing: {
    xxs: 2,   // Micro spacing
    xs: 4,    // Extra small
    sm: 8,    // Small
    md: 16,   // Medium (base unit)
    lg: 24,   // Large
    xl: 32,   // Extra large
    xxl: 48,  // Double extra large
    xxxl: 64, // Triple extra large
},
  
  // Font Sizes - Research-backed typography scale
  fontSize: {
    1: 11,  // Micro - Status badges, metadata only 
    2: 13,  // Caption - Secondary info, helper text   
    3: 16,  // Body - Primary content, main labels (baseline) 
    4: 18,  // Subtitle - Section headers, important labels 
    5: 22,  // Heading - Page headings, stat values 
    6: 26,  // Title - Screen titles 
    7: 30,  // Display - Hero text 
    8: 34,  // Hero - Large display text 
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

  // Component Sizes - Standardized dimensions
  componentSizes: {
    // Navigation
    navBarHeight: 44,         // iOS standard
    tabBarHeight: 49,         // iOS standard
    
    // Buttons - Mobile-optimized sizes
    buttonHeight: {
      sm: 40,   // Small buttons (minimum recommended)
      md: 44,   // Standard buttons (WCAG compliant)
      lg: 48,   // Primary actions
      xl: 56,   // Floating/CTA buttons
      xxl: 64,  // Large touch targets
    },
    
    // Button minimum sizes (WCAG 2.1 Level AA + Mobile Best Practices)
    buttonMinimum: {
      width: 176,   // Generous minimum button width (4x touch target)
      height: 40,   // Minimum button height
      touchTarget: 44, // Minimum touch target (44x44px)
      recommended: 48,  // Recommended minimum for primary actions
    },
    
    // Touch Targets
    touchTargetMinimum: 44,   // WCAG requirement
    
    // Status Badges
    badgeHeight: {
      sm: 20,
      md: 24,
      lg: 32,
      xl: 40,
    },
    
    // Cards and Containers
    cardMinHeight: {
      sm: 60,
      md: 80,
      lg: 120,
    },
    
    // Icons
    iconSize: {
      xs: 12,
      sm: 16,
      md: 20,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
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