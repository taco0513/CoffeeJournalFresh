// Apple Human Interface Guidelines inspired design constants

export const HIGColors = {
  // Primary colors
  systemBlue: '#007AFF',
  systemGreen: '#34C759',
  systemRed: '#FF3B30',
  systemOrange: '#FF9500',
  systemYellow: '#FFCC00',
  systemPink: '#FF2D55',
  systemPurple: '#AF52DE',
  systemTeal: '#5AC8FA',
  systemIndigo: '#5856D6',
  systemBrown: '#A2845E', // Coffee-themed brown color
  
  // Monochrome
  label: '#000000',
  secondaryLabel: '#3C3C43',
  tertiaryLabel: '#48484A',
  quaternaryLabel: '#636366',
  
  // Fill colors
  systemFill: 'rgba(120, 120, 128, 0.2)',
  secondarySystemFill: 'rgba(120, 120, 128, 0.16)',
  tertiarySystemFill: 'rgba(118, 118, 128, 0.12)',
  quaternarySystemFill: 'rgba(116, 116, 128, 0.08)',
  
  // Background colors
  systemBackground: '#FFFFFF',
  secondarySystemBackground: '#F2F2F7',
  tertiarySystemBackground: '#FFFFFF',
  
  // Grouped background colors
  systemGroupedBackground: '#F2F2F7',
  secondarySystemGroupedBackground: '#FFFFFF',
  tertiarySystemGroupedBackground: '#F2F2F7',
  
  // Separator colors
  separator: 'rgba(60, 60, 67, 0.29)',
  opaqueSeparator: '#C6C6C8',
  
  // Link color
  link: '#007AFF',
  
  // Additional colors for compatibility
  white: '#FFFFFF',
  black: '#000000',
  accent: '#007AFF',
  systemGray4: '#D1D1D6',
  systemGray5: '#E5E5EA',
  systemGray6: '#F2F2F7',
};

export const HIGConstants = {
  // Layout margins
  layoutMargin: 16,
  
  // Corner radius
  cornerRadiusSmall: 8,
  cornerRadiusMedium: 12,
  cornerRadiusLarge: 16,
  RADIUS_MD: 12,
  RADIUS_LG: 16,
  BORDER_RADIUS_LG: 16,
  
  // Button heights
  buttonHeightRegular: 44,
  buttonHeightSmall: 32,
  buttonHeightLarge: 56,
  
  // Spacing
  SPACING_XS: 4,
  SPACING_SM: 8,
  SPACING_MD: 12,
  SPACING_LG: 16,
  SPACING_XL: 20,
  
  // Font sizes
  fontSizeCaption2: 11,
  fontSizeCaption1: 12,
  fontSizeFootnote: 13,
  fontSizeSubheadline: 15,
  fontSizeBody: 17,
  fontSizeHeadline: 17,
  fontSizeTitle3: 20,
  fontSizeTitle2: 22,
  fontSizeTitle1: 28,
  fontSizeLargeTitle: 34,
  
  // Line heights
  lineHeightCaption2: 13,
  lineHeightCaption1: 16,
  lineHeightFootnote: 18,
  lineHeightSubheadline: 20,
  lineHeightBody: 22,
  lineHeightHeadline: 22,
  lineHeightTitle3: 25,
  lineHeightTitle2: 28,
  lineHeightTitle1: 34,
  lineHeightLargeTitle: 41,
  
  // Font weights
  fontWeightRegular: '400' as const,
  fontWeightMedium: '500' as const,
  fontWeightSemibold: '600' as const,
  fontWeightBold: '700' as const,
  
  // Animation durations
  animationDurationFast: 200,
  animationDurationMedium: 300,
  animationDurationSlow: 500,
};