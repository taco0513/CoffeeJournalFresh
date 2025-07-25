// CupNote Tamagui Screens - Centralized Export
// Organized, performance-optimized screen components

// Core App Screens
export { default as HomeScreen } from './core/HomeScreen';
export { default as ModeSelectionScreen } from './core/ModeSelectionScreen';

// Tasting Flow Screens
export { default as CoffeeInfoScreen } from './tasting/CoffeeInfoScreen';
export { default as SensoryScreen } from './tasting/SensoryScreen';
export { default as PersonalCommentScreen } from './tasting/PersonalCommentScreen';
export { default as ResultScreen } from './tasting/ResultScreen';
export { default as HomeCafeScreen } from './tasting/HomeCafeScreen';

// Flavor Selection
export { default as UnifiedFlavorScreen } from './tasting/flavor/UnifiedFlavorScreen';

// Journal & Statistics
export { default as JournalIntegratedScreen } from './journal/JournalIntegratedScreen';

// Profile & Settings
export { default as ProfileScreen } from './profile/ProfileScreen';

// Type exports for navigation
export type ScreenProps = {
  navigation: any;
  route: any;
};