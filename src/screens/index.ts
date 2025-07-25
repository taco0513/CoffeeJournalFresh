// Original React Native Screens - Legacy Export
// ⚠️ IMPORTANT: Core screens have been migrated to Tamagui
// Use screens from ../screens-tamagui/ for all main app flows

// Re-export Tamagui screens for backward compatibility
export { 
  HomeScreen,
  ModeSelectionScreen,
  CoffeeInfoScreen,
  SensoryScreen,
  PersonalCommentScreen,
  ResultScreen,
  HomeCafeScreen,
  JournalIntegratedScreen,
  ProfileScreen,
} from '../screens-tamagui';

// Screens without Tamagui versions yet
export { default as RoasterNotesScreen } from './RoasterNotesScreen';
export { default as ExperimentalDataScreen } from './ExperimentalDataScreen';
export { default as SensoryEvaluationScreen } from './SensoryEvaluationScreen';
export { default as SearchScreen } from './SearchScreen';
export { default as TastingDetailScreen } from './TastingDetailScreen';
export { default as DataTestScreen } from './DataTestScreen';
export { default as OnboardingScreen } from './OnboardingScreen';
export { default as DeveloperScreen } from './DeveloperScreen';
export { default as MarketIntelligenceScreen } from './MarketIntelligenceScreen';
export { default as AchievementGalleryScreen } from './AchievementGalleryScreen';
export { default as HistoryScreen } from './HistoryScreen';
export { default as StatsScreen } from './StatsScreen';
export { default as LabModeScreen } from './LabModeScreen';
export { default as EnhancedHomeCafeScreen } from './EnhancedHomeCafeScreen';
export { default as PersonalTasteDashboard } from './PersonalTasteDashboard';
export { default as PhotoGalleryScreen } from './PhotoGalleryScreen';
export { default as PhotoViewerScreen } from './PhotoViewerScreen';
export { default as ProfileSetupScreen } from './ProfileSetupScreen';

// Admin screens
export { AdminDashboardScreen } from './admin/AdminDashboardScreen';
export { AdminCoffeeEditScreen } from './admin/AdminCoffeeEditScreen';
export { default as AdminFeedbackScreen } from './admin/AdminFeedbackScreen';

// Auth screens
export { default as SignInScreen } from './auth/SignInScreen';
export { default as SignUpScreen } from './auth/SignUpScreen';

// Flavor screens
export { default as UnifiedFlavorScreen } from './flavor/UnifiedFlavorScreen';
export { default as UnifiedFlavorScreenDebug } from './flavor/UnifiedFlavorScreenDebug';