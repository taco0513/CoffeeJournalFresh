// CupNote Tamagui Screens - Centralized Export
// Complete migration: All 31 screens with Tamagui components

import { withErrorBoundary } from '../utils/withErrorBoundary';

// Import raw screens
import HomeScreenRaw from './core/HomeScreen';
import ModeSelectionScreenRaw from './core/ModeSelectionScreen';
import TastingDetailScreenRaw from './journal/TastingDetailScreen';
import AchievementGalleryScreenRaw from './achievements/AchievementGalleryScreen';
import OnboardingScreenRaw from './core/OnboardingScreen';
import DeveloperScreenRaw from './dev/DeveloperScreen';
import PersonalTasteDashboardRaw from './analytics/PersonalTasteDashboard';

// =============================================
// Core App Screens (Phase 1 & 2) - With Error Boundaries
// =============================================
export const HomeScreen = withErrorBoundary(HomeScreenRaw, 'HomeScreen');
export const ModeSelectionScreen = withErrorBoundary(ModeSelectionScreenRaw, 'ModeSelectionScreen');

// =============================================
// Phase 3.1 - High Priority Core Screens - With Error Boundaries
// =============================================
export const TastingDetailScreen = withErrorBoundary(TastingDetailScreenRaw, 'TastingDetailScreen');
export const AchievementGalleryScreen = withErrorBoundary(AchievementGalleryScreenRaw, 'AchievementGalleryScreen');
export const OnboardingScreen = withErrorBoundary(OnboardingScreenRaw, 'OnboardingScreen');
export const DeveloperScreen = withErrorBoundary(DeveloperScreenRaw, 'DeveloperScreen');
export const PersonalTasteDashboard = withErrorBoundary(PersonalTasteDashboardRaw, 'PersonalTasteDashboard');

// Import raw tasting flow screens
import CoffeeInfoScreenRaw from './tasting/CoffeeInfoScreen';
import SensoryScreenRaw from './tasting/SensoryScreen';
import PersonalCommentScreenRaw from './tasting/PersonalCommentScreen';
import ResultScreenRaw from './tasting/ResultScreen';
import HomeCafeScreenRaw from './tasting/HomeCafeScreen';
import UnifiedFlavorScreenRaw from './tasting/flavor/UnifiedFlavorScreen';

// =============================================
// Tasting Flow Screens (Phase 1 & 2) - With Error Boundaries
// =============================================
export const CoffeeInfoScreen = withErrorBoundary(CoffeeInfoScreenRaw, 'CoffeeInfoScreen');
export const SensoryScreen = withErrorBoundary(SensoryScreenRaw, 'SensoryScreen');
export const PersonalCommentScreen = withErrorBoundary(PersonalCommentScreenRaw, 'PersonalCommentScreen');
export const ResultScreen = withErrorBoundary(ResultScreenRaw, 'ResultScreen');
export const HomeCafeScreen = withErrorBoundary(HomeCafeScreenRaw, 'HomeCafeScreen');

// Flavor Selection
export const UnifiedFlavorScreen = withErrorBoundary(UnifiedFlavorScreenRaw, 'UnifiedFlavorScreen');

// =============================================
// Phase 3.2 - Enhanced Features
// =============================================
export { default as EnhancedHomeCafeScreen } from './enhanced/EnhancedHomeCafeScreen';
export { default as LabModeScreen } from './enhanced/LabModeScreen';
export { default as OptimizedUnifiedFlavorScreen } from './enhanced/OptimizedUnifiedFlavorScreen';
export { default as ExperimentalDataScreen } from './enhanced/ExperimentalDataScreen';
export { default as SensoryEvaluationScreen } from './enhanced/SensoryEvaluationScreen';
export { default as RoasterNotesScreen } from './enhanced/RoasterNotesScreen';

// Import raw analytics screens  
import StatsScreenRaw from './analytics/StatsScreen';
import HistoryScreenRaw from './analytics/HistoryScreen';
import PhotoGalleryScreenRaw from './analytics/PhotoGalleryScreen';
import PhotoViewerScreenRaw from './analytics/PhotoViewerScreen';
import SearchScreenRaw from './analytics/SearchScreen';
import MarketIntelligenceScreenRaw from './analytics/MarketIntelligenceScreen';
import FlavorCategoryDetailScreenRaw from './analytics/FlavorCategoryDetailScreen';

// =============================================
// Phase 3.3 - Analytics & Media - With Error Boundaries
// =============================================
export const StatsScreen = withErrorBoundary(StatsScreenRaw, 'StatsScreen');
export const HistoryScreen = withErrorBoundary(HistoryScreenRaw, 'HistoryScreen');
export const PhotoGalleryScreen = withErrorBoundary(PhotoGalleryScreenRaw, 'PhotoGalleryScreen');
export const PhotoViewerScreen = withErrorBoundary(PhotoViewerScreenRaw, 'PhotoViewerScreen');
export const SearchScreen = withErrorBoundary(SearchScreenRaw, 'SearchScreen');
export const MarketIntelligenceScreen = withErrorBoundary(MarketIntelligenceScreenRaw, 'MarketIntelligenceScreen');
export const FlavorCategoryDetailScreen = withErrorBoundary(FlavorCategoryDetailScreenRaw, 'FlavorCategoryDetailScreen');

// =============================================
// Phase 3.4 - Utilities & Admin
// =============================================
export { default as PerformanceDashboardScreen } from './utilities/PerformanceDashboardScreen';
export { default as DataTestScreen } from './utilities/DataTestScreen';
export { default as ProfileSetupScreen } from './utilities/ProfileSetupScreen';

// Import raw journal and profile screens
import JournalIntegratedScreenRaw from './journal/JournalIntegratedScreen';
import ProfileScreenRaw from './profile/ProfileScreen';

// =============================================
// Journal & Profile (Phase 1 & 2) - With Error Boundaries
// =============================================
export const JournalIntegratedScreen = withErrorBoundary(JournalIntegratedScreenRaw, 'JournalIntegratedScreen');
export const ProfileScreen = withErrorBoundary(ProfileScreenRaw, 'ProfileScreen');

// =============================================
// Development Tools
// =============================================
export { default as TamaguiComparisonScreen } from './dev/TamaguiComparisonScreen';
export { default as PerformanceTestingScreen } from './dev/PerformanceTestingScreen';

// =============================================
// Type Exports for Navigation
// =============================================
export type ScreenProps = {
  navigation: unknown;
  route: unknown;
};

// Total: 31 screens migrated to Tamagui
// - 11 from Phase 1 & 2
// - 20 from Phase 3 (3.1, 3.2, 3.3, 3.4)