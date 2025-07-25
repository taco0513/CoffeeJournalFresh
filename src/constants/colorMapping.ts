/**
 * HIGColors to Tamagui Token Mapping
 * 
 * This file provides a complete mapping from HIGColors to Tamagui tokens.
 * Use this for systematic replacement across the codebase.
 */

// Direct color mappings from HIGColors to Tamagui tokens
export const colorMapping = {
  // === SYSTEM COLORS ===
  'HIGColors.blue': '$cupBlue', // '#007AFF' -> '$cupBlue'
  'HIGColors.systemBlue': '$cupBlue',
  'HIGColors.green': '$green9', // '#2E7D32' -> '$green9'
  'HIGColors.systemGreen': '$green9', // '#34C759' -> '$green9'
  'HIGColors.red': '$red9', // '#FF3B30' -> '$red9'
  'HIGColors.systemRed': '$red9',
  'HIGColors.orange': '$orange9', // '#FF9500' -> '$orange9'
  'HIGColors.systemOrange': '$orange9',
  'HIGColors.yellow': '$yellow9', // '#FFCC00' -> '$yellow9'
  'HIGColors.systemYellow': '$yellow9',
  'HIGColors.purple': '$purple9', // '#AF52DE' -> '$purple9'
  'HIGColors.systemPurple': '$purple9',
  'HIGColors.pink': '$pink9', // '#FF2D92' -> '$pink9'
  
  // === GRAY SCALE ===
  'HIGColors.gray': '$gray9', // '#8E8E93' -> '$gray9'
  'HIGColors.systemGray': '$gray9',
  'HIGColors.gray2': '$gray8', // '#AEAEB2' -> '$gray8'
  'HIGColors.gray3': '$gray7', // '#C7C7CC' -> '$gray7'
  'HIGColors.systemGray3': '$gray7',
  'HIGColors.gray4': '$gray6', // '#D1D1D6' -> '$gray6'
  'HIGColors.systemGray4': '$gray6',
  'HIGColors.gray5': '$gray5', // '#E5E5EA' -> '$gray5'
  'HIGColors.systemGray5': '$gray5',
  'HIGColors.gray6': '$gray4', // '#F2F2F7' -> '$gray4'
  'HIGColors.systemGray6': '$gray4',
  
  // === BASIC COLORS ===
  'HIGColors.white': '$background', // '#FFFFFF' -> '$background'
  'HIGColors.black': '$color', // '#000000' -> '$color'
  'HIGColors.accent': '$cupBlue',
  'HIGColors.brown': '$brown9',
  'HIGColors.systemBrown': '$brown9', // Coffee-themed
  
  // === SEMANTIC COLORS ===
  'HIGColors.primary': '$cupBlue',
  'HIGColors.success': '$success', // Custom token for coffee app
  'HIGColors.warning': '$warning', // Custom token
  'HIGColors.info': '$cupBlue',
  'HIGColors.placeholderText': '$gray10',
  'HIGColors.disabled': '$gray10',
  
  // === LABEL COLORS ===
  'HIGColors.label': '$color', // Primary text color
  'HIGColors.secondaryLabel': '$gray11', // Secondary text
  'HIGColors.tertiaryLabel': '$gray10', // Tertiary text
  'HIGColors.quaternaryLabel': '$gray9', // Quaternary text
  
  // === BACKGROUND COLORS ===
  'HIGColors.systemBackground': '$background',
  'HIGColors.secondarySystemBackground': '$backgroundHover', // Cards, secondary areas
  'HIGColors.tertiarySystemBackground': '$background',
  
  // === OVERLAY ===
  'HIGColors.overlay': 'rgba(0, 0, 0, 0.4)', // Keep as-is for overlays
} as const;

// Reverse mapping for development/debugging
export const reverseColorMapping = Object.fromEntries(
  Object.entries(colorMapping).map(([key, value]) => [value, key])
);

// Color categories for systematic replacement
export const colorCategories = {
  system: [
    'HIGColors.blue',
    'HIGColors.systemBlue',
    'HIGColors.green', 
    'HIGColors.systemGreen',
    'HIGColors.red',
    'HIGColors.systemRed',
    'HIGColors.orange',
    'HIGColors.systemOrange',
    'HIGColors.yellow',
    'HIGColors.systemYellow',
    'HIGColors.purple',
    'HIGColors.systemPurple',
    'HIGColors.pink',
  ],
  
  grayscale: [
    'HIGColors.gray',
    'HIGColors.systemGray',
    'HIGColors.gray2',
    'HIGColors.gray3',
    'HIGColors.systemGray3',
    'HIGColors.gray4',
    'HIGColors.systemGray4',
    'HIGColors.gray5',
    'HIGColors.systemGray5',
    'HIGColors.gray6',
    'HIGColors.systemGray6',
  ],
  
  semantic: [
    'HIGColors.primary',
    'HIGColors.success',
    'HIGColors.warning',
    'HIGColors.info',
    'HIGColors.placeholderText',
    'HIGColors.disabled',
  ],
  
  text: [
    'HIGColors.label',
    'HIGColors.secondaryLabel', 
    'HIGColors.tertiaryLabel',
    'HIGColors.quaternaryLabel',
  ],
  
  background: [
    'HIGColors.systemBackground',
    'HIGColors.secondarySystemBackground',
    'HIGColors.tertiarySystemBackground',
  ],
  
  basic: [
    'HIGColors.white',
    'HIGColors.black',
    'HIGColors.accent',
    'HIGColors.brown',
    'HIGColors.systemBrown',
  ],
} as const;

// Utility function to get Tamagui token for HIGColor
export const getTamaguiToken = (higColor: string): string => {
  return colorMapping[higColor as keyof typeof colorMapping] || higColor;
};

// Validation function to check if color needs mapping
export const needsMapping = (colorValue: string): boolean => {
  return colorValue.startsWith('HIGColors.');
};

// Helper to replace HIGColors in style objects
export const replaceHIGColorsInObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(replaceHIGColorsInObject);
  }
  
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && needsMapping(value)) {
      result[key] = getTamaguiToken(value);
    } else if (typeof value === 'object') {
      result[key] = replaceHIGColorsInObject(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
};

// Migration statistics
export const migrationStats = {
  totalMappings: Object.keys(colorMapping).length,
  categories: Object.keys(colorCategories).length,
  systemColors: colorCategories.system.length,
  grayscaleColors: colorCategories.grayscale.length,
  semanticColors: colorCategories.semantic.length,
};

export default colorMapping;
