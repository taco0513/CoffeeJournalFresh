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

// Re-export additional Tamagui screens
export { 
  RoasterNotesScreen,
  SearchScreen,
  TastingDetailScreen,
  DataTestScreen,
  OnboardingScreen,
  DeveloperScreen,
  MarketIntelligenceScreen,
  AchievementGalleryScreen,
  HistoryScreen,
  StatsScreen,
  LabModeScreen,
  PersonalTasteDashboard,
  PhotoGalleryScreen,
  PhotoViewerScreen,
  ProfileSetupScreen,
} from '../screens-tamagui';

// Enhanced screens from Tamagui
export { ExperimentalDataScreen } from '../screens-tamagui/enhanced/ExperimentalDataScreen';
export { default as SensoryEvaluationScreen } from '../screens-tamagui/enhanced/SensoryEvaluationScreen';
export { EnhancedHomeCafeScreen } from '../screens-tamagui/enhanced/EnhancedHomeCafeScreen';

// Admin screens
export { AdminDashboardScreen } from './admin/AdminDashboardScreen';
export { AdminCoffeeEditScreen } from './admin/AdminCoffeeEditScreen';
export { default as AdminFeedbackScreen } from './admin/AdminFeedbackScreen';

// Auth screens
export { default as SignInScreen } from './auth/SignInScreen';
export { default as SignUpScreen } from './auth/SignUpScreen';

// Re-export flavor screens from Tamagui
export { UnifiedFlavorScreen } from '../screens-tamagui';