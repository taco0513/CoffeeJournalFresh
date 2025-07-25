// =============================================
// Achievement Types and Interfaces
// =============================================

export enum AchievementType {
  // Basic progression
  FIRST_STEPS = 'first_steps',
  CONSISTENCY = 'consistency',
  
  // Flavor exploration
  FLAVOR_EXPLORER = 'flavor_explorer',
  TASTE_ACCURACY = 'taste_accuracy',
  VOCABULARY = 'vocabulary',
  
  // Personal growth
  LEVEL_UP = 'level_up',
  MASTERY = 'mastery',
  PERSONAL_BEST = 'personal_best',
  
  // Coffee discovery
  COFFEE_EXPLORER = 'coffee_explorer',
  
  // Special achievements
  SEASONAL = 'seasonal',
  HIDDEN = 'hidden',
  COLLECTOR = 'collector',
}

export interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: AchievementType;
  requirements: AchievementRequirement;
  rewards: AchievementReward;
  progress: number; // 0-1
  unlockedAt?: Date;
  isNew?: boolean; // For UI notification
}

export interface AchievementRequirement {
  type: string;
  value: number;
  additionalConditions?: Record<string, any>;
}

export interface AchievementReward {
  type: 'points' | 'badge' | 'title' | 'unlock';
  value: string | number;
  additionalRewards?: AchievementReward[];
}

export interface UserAction {
  type: 'tasting' | 'quiz' | 'learning' | 'social' | 'milestone';
  data: Record<string, any>;
  timestamp: Date;
}

export interface ProgressData {
  currentValue: number;
  targetValue: number;
  percentage: number;
  estimatedTimeToComplete?: number; // days
  lastUpdated: Date;
}

export interface AchievementNotification {
  achievement: Achievement;
  celebrationType: 'subtle' | 'normal' | 'epic';
  message: string;
  points?: number;
}

export type AchievementDefinition = Omit<Achievement, 'id' | 'progress' | 'unlockedAt'>;