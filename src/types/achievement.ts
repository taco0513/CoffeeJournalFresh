/**
 * Achievement system type definitions
 */

export interface UserAction {
  type: string;
  data?: Record<string, unknown>;
  timestamp?: Date;
  userId?: string;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  points: number;
  category: AchievementCategory;
  criteria: AchievementCriteria;
  rewards: AchievementReward;
  icon?: string;
}

export type AchievementCategory = 
  | 'tasting'
  | 'exploration'
  | 'knowledge'
  | 'social'
  | 'consistency'
  | 'special';

export interface AchievementCriteria {
  type: CriteriaType;
  target: number;
  timeframe?: TimeFrame;
  condition?: CriteriaCondition;
}

export type CriteriaType = 
  | 'count'
  | 'streak'
  | 'variety'
  | 'milestone'
  | 'challenge'
  | 'collection';

export interface TimeFrame {
  unit: 'day' | 'week' | 'month' | 'year';
  value: number;
}

export interface CriteriaCondition {
  field: string;
  operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: string | number | boolean | (string | number)[];
}

export interface AchievementReward {
  type: RewardType;
  value: string | number;
  metadata?: Record<string, unknown>;
}

export type RewardType = 
  | 'points'
  | 'badge'
  | 'title'
  | 'feature_unlock'
  | 'discount'
  | 'special';

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress: number;
  completed: boolean;
  notified: boolean;
  metadata?: Record<string, unknown>;
}

export interface AchievementProgress {
  achievementId: string;
  current: number;
  target: number;
  percentage: number;
  completed: boolean;
  lastUpdated: Date;
}

export interface AchievementNotification {
  id: string;
  userId: string;
  achievementId: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface AchievementStats {
  totalPoints: number;
  totalAchievements: number;
  completedAchievements: number;
  categoryBreakdown: Record<AchievementCategory, number>;
  recentAchievements: UserAchievement[];
  nextAchievements: AchievementDefinition[];
}