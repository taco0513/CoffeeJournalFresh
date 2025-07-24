/**
 * CupNote Design System - Design Tokens
 * 
 * 모든 디자인 결정의 기준이 되는 토큰들
 * 일관성과 확장성을 위한 중앙 집중식 관리
 */

// ===== COLOR TOKENS =====
export const Colors = {
  // Primary Brand Colors
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB', 
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main brand color
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Semantic Colors
  semantic: {
    success: '#4CAF50',
    warning: '#FF9800', 
    error: '#F44336',
    info: '#2196F3',
    coffee: '#6F4E37', // Coffee brown for coffee-specific elements
  },

  // Neutral Grays (iOS HIG based)
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE', 
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // iOS System Colors
  system: {
    blue: '#007AFF',
    green: '#34C759',
    orange: '#FF9500',
    red: '#FF3B30',
    purple: '#AF52DE',
    yellow: '#FFCC00',
  },

  // Contextual Colors
  text: {
    primary: '#000000',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    disabled: '#D1D5DB',
  },

  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB', 
    strong: '#9CA3AF',
  },
} as const;

// ===== SPACING TOKENS =====
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

// ===== TYPOGRAPHY TOKENS =====
export const Typography = {
  fontFamily: {
    system: 'System', // iOS system font
    mono: 'Menlo',
  },

  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
    '6xl': 40,
  },

  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
} as const;

// ===== LAYOUT TOKENS =====
export const Layout = {
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  shadow: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },

  opacity: {
    disabled: 0.4,
    pressed: 0.8,
    overlay: 0.5,
  },
} as const;

// ===== COMPONENT TOKENS =====
export const Component = {
  button: {
    height: {
      sm: 32,
      md: 40,
      lg: 48,
      xl: 56,
    },
    padding: {
      sm: { horizontal: Spacing.md, vertical: Spacing.xs },
      md: { horizontal: Spacing.lg, vertical: Spacing.sm },
      lg: { horizontal: Spacing.xl, vertical: Spacing.md },
      xl: { horizontal: Spacing['2xl'], vertical: Spacing.lg },
    },
  },

  card: {
    padding: {
      sm: Spacing.md,
      md: Spacing.lg,
      lg: Spacing.xl,
    },
    radius: Layout.radius.md,
    shadow: Layout.shadow.sm,
  },

  input: {
    height: {
      sm: 32,
      md: 40,
      lg: 48,
    },
    padding: {
      horizontal: Spacing.md,
      vertical: Spacing.sm,
    },
    radius: Layout.radius.sm,
  },

  header: {
    height: 44, // iOS standard
    padding: Spacing.lg,
    borderWidth: 0.5,
  },
} as const;

// ===== ANIMATION TOKENS =====
export const Animation = {
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
  },
  
  easing: {
    easeOut: 'ease-out',
    easeIn: 'ease-in',
    easeInOut: 'ease-in-out',
  },
} as const;

// ===== TYPE EXPORTS =====
export type ColorToken = keyof typeof Colors;
export type SpacingToken = keyof typeof Spacing;
export type TypographyToken = keyof typeof Typography;