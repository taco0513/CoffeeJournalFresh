// Original color palette
const ColorsOriginal = {
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#666666',
  TEXT_DISABLED: '#757575',
  TEXT_TERTIARY: '#888888',
  
  PLACEHOLDER: '#666666',
  
  TAB_INACTIVE: '#666666',
  
  GRADIENT_BROWN: '#6c4e31',
  
  BACKGROUND_GRAY: '#f5f5f5',
  TAG_BACKGROUND: '#F0F0F0',
  SUCCESS_GREEN: '#2E7D32',
  ERROR_RED: '#C62828',
  INFO_BLUE: '#1565C0',
  WARNING_ORANGE: '#F57C00',
  SHADOW_BLACK: '#000',
  
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  PRIMARY: '#8B4513',  // Original brown
  FLAVOR_TAG_BG: '#E3F2FD',
  
  primary: {
    main: '#8B4513',
  },
  background: {
    primary: '#f8f9fa',
    white: '#FFFFFF',
  },
  text: {
    primary: '#000000',
    secondary: '#666666',
    tertiary: '#888888',
  },
  border: {
    light: '#E0E0E0',
  },
  semantic: {
    error: '#C62828',
    success: '#2E7D32',
  },
} as const;


// Export color palette
export const Colors = ColorsOriginal;