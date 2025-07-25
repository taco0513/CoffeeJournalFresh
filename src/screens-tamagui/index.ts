// CupNote Tamagui Screens - Centralized Export
// Complete migration: All 31 screens with Tamagui components

// =============================================
// Core App Screens (Phase 1 & 2)
// =============================================
export { default as HomeScreen } from './core/HomeScreen';
export { default as ModeSelectionScreen } from './core/ModeSelectionScreen';

// =============================================
// Phase 3.1 - High Priority Core Screens
// =============================================
export { default as TastingDetailScreen } from './core/TastingDetailScreen';
export { default as AchievementGalleryScreen } from './core/AchievementGalleryScreen';
export { default as OnboardingScreen } from './core/OnboardingScreen';
export { default as DeveloperScreen } from './core/DeveloperScreen';
export { default as PersonalTasteDashboard } from './core/PersonalTasteDashboard';

// =============================================
// Tasting Flow Screens (Phase 1 & 2)
// =============================================
export { default as CoffeeInfoScreen } from './tasting/CoffeeInfoScreen';
export { default as SensoryScreen } from './tasting/SensoryScreen';
export { default as PersonalCommentScreen } from './tasting/PersonalCommentScreen';
export { default as ResultScreen } from './tasting/ResultScreen';
export { default as HomeCafeScreen } from './tasting/HomeCafeScreen';

// Flavor Selection
export { default as UnifiedFlavorScreen } from './tasting/flavor/UnifiedFlavorScreen';

// =============================================
// Phase 3.2 - Enhanced Features
// =============================================
export { default as EnhancedHomeCafeScreen } from './enhanced/EnhancedHomeCafeScreen';
export { default as LabModeScreen } from './enhanced/LabModeScreen';
export { default as OptimizedUnifiedFlavorScreen } from './enhanced/OptimizedUnifiedFlavorScreen';
export { default as ExperimentalDataScreen } from './enhanced/ExperimentalDataScreen';
export { default as SensoryEvaluationScreen } from './enhanced/SensoryEvaluationScreen';
export { default as RoasterNotesScreen } from './enhanced/RoasterNotesScreen';

// =============================================
// Phase 3.3 - Analytics & Media
// =============================================
export { default as StatsScreen } from './analytics/StatsScreen';
export { default as HistoryScreen } from './analytics/HistoryScreen';
export { default as PhotoGalleryScreen } from './analytics/PhotoGalleryScreen';
export { default as PhotoViewerScreen } from './analytics/PhotoViewerScreen';
export { default as SearchScreen } from './analytics/SearchScreen';
export { default as MarketIntelligenceScreen } from './analytics/MarketIntelligenceScreen';

// =============================================
// Phase 3.4 - Utilities & Admin
// =============================================
export { default as PerformanceDashboardScreen } from './utilities/PerformanceDashboardScreen';
export { default as DataTestScreen } from './utilities/DataTestScreen';
export { default as ProfileSetupScreen } from './utilities/ProfileSetupScreen';

// =============================================
// Journal & Profile (Phase 1 & 2)
// =============================================
export { default as JournalIntegratedScreen } from './journal/JournalIntegratedScreen';
export { default as ProfileScreen } from './profile/ProfileScreen';

// =============================================
// Development Tools
// =============================================
export { default as TamaguiComparisonScreen } from './dev/TamaguiComparisonScreen';

// =============================================
// Type Exports for Navigation
// =============================================
export type ScreenProps = {
  navigation: any;
  route: any;
};

// Total: 31 screens migrated to Tamagui
// - 11 from Phase 1 & 2
// - 20 from Phase 3 (3.1, 3.2, 3.3, 3.4)