// =============================================
// Personal Taste Discovery Types
// =============================================

// Re-export types from services - Moved to feature_backlog
// export type {
//   TastePattern,
//   FlavorPreference,
//   TasteProfileType,
//   GrowthMetrics,
//   CoffeeRecommendation,
//   PersonalInsights,
// } from '@/services/PersonalTasteAnalysisService';

// export type {
//   FlavorIdentification,
//   FlavorQuiz,
//   FlavorQuestion,
//   FlavorOption,
//   MasteryLevel,
//   LearningRecommendation,
// } from '@/services/FlavorLearningEngine';

// MVP placeholder types
export interface TastePattern {
  userId?: string;
  dominantCategories: string[];
  preferredIntensity: number;
  balancePreference: string;
  uniqueDescriptors: string[];
  dominantFlavors: Array<{
    category: string;
    preference: number;
    frequency: number;
    consistency: number;
  }>;
  tasteProfile: string;
  growthTrend?: {
    vocabularyGrowth: number;
    accuracyImprovement: number;
    flavorDiversityIndex: number;
    consistencyScore: number;
    weeklyProgress: number;
  };
  recommendations?: string[];
  lastUpdated?: Date;
}

export interface FlavorPreference {
  category: string;
  subcategory: string;
  frequency: number;
  confidence: number;
}

export type TasteProfileType = 'explorer' | 'traditionalist' | 'balanced' | 'adventurous';

export interface GrowthMetrics {
  totalTastings: number;
  uniqueFlavors: number;
  vocabularySize: number;
  vocabularyGrowth: number;
  weeklyProgress: number;
  monthlyGrowth: number;
  currentStreak: number;
  accuracyImprovement: number;
  flavorDiversityIndex: number;
  consistencyScore: number;
  milestones: GrowthMilestone[];
}

export interface CoffeeRecommendation {
  roastery: string;
  coffeeName: string;
  origin: string;
  process: string;
  predictedMatch: number;
  reason: string;
  similarityScore: number;
}

export interface PersonalInsights {
  strengths: string[];
  areasToExplore: string[];
  recentDiscoveries: string[];
  tastingTips: string[];
}

export interface MasteryLevel {
  level: number;
  progress: number;
  nextLevelThreshold: number;
  achievements: string[];
  category?: string;
  score?: number;
  totalExposures?: number;
  accuracyRate?: number;
  nextMilestone?: string;
  progressToNext?: number;
}

export interface FlavorIdentification {
  category: string;
  subcategory?: string;
  specificFlavor?: string;
  confidence: number;
  identified: boolean;
}

export type {
  Achievement,
  AchievementRequirement,
  AchievementReward,
  UserAction,
  ProgressData,
  AchievementNotification,
} from '@/services/AchievementSystem';

export { AchievementType } from '@/services/AchievementSystem';

// Coach types - Moved to Future Roadmap
// export type {
//   CoachFeedback,
//   CoachInsight,
//   DailyInsight,
//   LearningPath,
// } from '@/services/LiteAICoachService';

// Placeholder types for future roadmap features
export interface DailyInsight {
  id: string;
  title: string;
  message: string;
  actionText?: string;
  date: string;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  steps: string[];
  currentStep: number;
  estimatedDuration: string;
}

// Additional missing types
export interface GrowthMilestone {
  id: string;
  week: number;
  title: string;
  description: string;
  isCompleted: boolean;
  points: number;
  unlockedAt?: Date;
}

export interface TastingData {
  id: string;
  coffeeInfo: CoffeeInfo;
  flavorNotes: string[];
  sensoryScores: {
    body: number;
    acidity: number;
    sweetness: number;
    finish: number;
  };
  rating: number;
  notes?: string;
  createdAt: Date;
  isDeleted?: boolean;
}

export interface CoffeeInfo {
  cafeName?: string;
  roastery: string;
  coffeeName: string;
  origin?: string;
  region?: string;
  variety?: string;
  process?: string;
  altitude?: string;
  roasterNotes?: string;
}

// Additional types for UI components
export interface PersonalDashboardData {
  tastePattern: TastePattern | null;
  growthMetrics: GrowthMetrics | null;
  recentAchievements: any[]; // Achievement[];
  weeklyProgress: WeeklyProgressData;
  recommendations: CoffeeRecommendation[];
}

export interface WeeklyProgressData {
  tastingsCompleted: number;
  tastingsGoal: number;
  newFlavorsDiscovered: number;
  vocabularyExpanded: number;
  accuracyImprovement: number;
  currentStreak: number;
}

export interface FlavorWheelData {
  name: string;
  children?: FlavorWheelData[];
  value?: number;
  color?: string;
  userMastery?: number; // 0-1 scale
}

export interface TastingEnhancement {
  predictedMatch: number; // 0-100
  suggestedFlavors: string[];
  difficultyLevel: number; // 1-5
  learningOpportunities: string[];
  potentialAchievements: string[];
}

export interface QuizResult {
  quizId: string;
  score: number;
  accuracy: number;
  timeSpent: number; // seconds
  correctAnswers: number;
  totalQuestions: number;
  earnedPoints: number;
  unlockedAchievements: any[]; // Achievement[];
}

export interface DailyChallengeData {
  id: string;
  title: string;
  description: string;
  type: 'tasting' | 'quiz' | 'exploration';
  requirements: {
    action: string;
    target: number;
  };
  reward: {
    points: number;
    achievement?: string;
  };
  progress: number; // 0-1
  expiresAt: Date;
}

export interface PersonalStatsData {
  totalTastings: number;
  uniqueCoffees: number;
  uniqueRoasters: number;
  favoriteRoaster: string;
  favoriteFlavor: string;
  averageMatchScore: number;
  vocabularySize: number;
  quizAccuracy: number;
  currentLevel: number;
  nextLevelProgress: number;
}

export interface FlavorComparison {
  userFlavors: string[];
  roasterFlavors: string[];
  matchedFlavors: string[];
  uniqueToUser: string[];
  uniqueToRoaster: string[];
  matchPercentage: number;
  feedback: string;
}

// Enums for UI state management
export enum PersonalTasteViewMode {
  DASHBOARD = 'dashboard',
  PROFILE = 'profile',
  PROGRESS = 'progress',
  ACHIEVEMENTS = 'achievements',
  RECOMMENDATIONS = 'recommendations',
}

export enum QuizDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum LearningFocusArea {
  FRUITY = 'fruity',
  FLORAL = 'floral',
  SWEET = 'sweet',
  NUTTY = 'nutty',
  SPICES = 'spices',
  ROASTED = 'roasted',
  OTHER = 'other',
}

// Constants
export const VOCABULARY_LEVELS = {
  1: { name: 'Beginner', minWords: 0, color: '#8B4513' },
  2: { name: 'Novice', minWords: 10, color: '#A0522D' },
  3: { name: 'Apprentice', minWords: 25, color: '#CD853F' },
  4: { name: 'Intermediate', minWords: 50, color: '#DEB887' },
  5: { name: 'Advanced', minWords: 75, color: '#F4A460' },
  6: { name: 'Expert', minWords: 100, color: '#FFD700' },
  7: { name: 'Master', minWords: 150, color: '#FFA500' },
  8: { name: 'Virtuoso', minWords: 200, color: '#FF8C00' },
  9: { name: 'Connoisseur', minWords: 300, color: '#FF6347' },
  10: { name: 'Legend', minWords: 500, color: '#DC143C' },
} as const;

export const ACHIEVEMENT_RARITY_COLORS = {
  common: '#8B7355',
  rare: '#4682B4',
  epic: '#9370DB',
  legendary: '#FFD700',
} as const;

export const TASTE_PROFILE_DESCRIPTIONS: Record<string, string> = {
  'Fruity Explorer': 'You have a refined palate for fruit-forward coffees',
  'Chocolate Lover': 'You appreciate rich, chocolatey notes in your coffee',
  'Floral Enthusiast': 'You enjoy delicate floral aromatics',
  'Nutty Adventurer': 'You love nutty and earthy flavors',
  'Balanced Seeker': 'You prefer well-balanced, harmonious coffees',
  'Bold Pioneer': 'You enjoy intense, bold coffee flavors',
  'Sweet Tooth': 'You gravitate towards naturally sweet coffees',
  'Acid Lover': 'You appreciate bright, vibrant acidity',
  'Complex Connoisseur': 'You seek out complex, layered flavor profiles',
  'explorer': 'You have a refined palate for fruit-forward coffees',
  'traditionalist': 'You appreciate rich, chocolatey notes in your coffee',
  'balanced': 'You prefer well-balanced, harmonious coffees',
  'adventurous': 'You enjoy intense, bold coffee flavors',
};