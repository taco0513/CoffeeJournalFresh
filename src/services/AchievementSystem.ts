import Realm from 'realm';
import { generateUUID } from '@/utils/uuid';
import { supabase } from './supabase/client';

// =============================================
// Types and Interfaces
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

// =============================================
// Achievement Definitions
// =============================================

const ACHIEVEMENT_DEFINITIONS: Record<string, Omit<Achievement, 'id' | 'progress' | 'unlockedAt'>> = {
  // First Steps
  first_tasting: {
    type: 'first_tasting',
    title: '첫 한 모금',
    description: '첫 번째 커피 테이스팅을 완료하세요',
    icon: '☕',
    rarity: 'common',
    category: AchievementType.FIRST_STEPS,
    requirements: { type: 'tasting_count', value: 1 },
    rewards: { type: 'points', value: 10 },
  },
  first_week: {
    type: 'first_week',
    title: '첫 주간 탐험가',
    description: '일주일 내 3가지 이상 다른 커피 시도',
    icon: '📅',
    rarity: 'common',
    category: AchievementType.FIRST_STEPS,
    requirements: { type: 'weekly_variety', value: 3 },
    rewards: { type: 'points', value: 50 },
  },
  first_flavor_match: {
    type: 'first_flavor_match',
    title: '첫 향미 매치',
    description: '로스터 노트와 일치하는 향미를 찾으세요',
    icon: '🎯',
    rarity: 'common',
    category: AchievementType.FIRST_STEPS,
    requirements: { type: 'flavor_match', value: 1 },
    rewards: { type: 'points', value: 15 },
  },

  // Flavor Explorer Series
  flavor_explorer_bronze: {
    type: 'flavor_explorer_bronze',
    title: '향미 탐험가 브론즈',
    description: '10가지 서로 다른 향미를 발견하세요',
    icon: '🗺️',
    rarity: 'common',
    category: AchievementType.FLAVOR_EXPLORER,
    requirements: { type: 'unique_flavors', value: 10 },
    rewards: { type: 'badge', value: 'flavor_explorer_bronze' },
  },
  flavor_explorer_silver: {
    type: 'flavor_explorer_silver',
    title: '향미 탐험가 실버',
    description: '25가지 서로 다른 향미를 발견하세요',
    icon: '🗺️',
    rarity: 'rare',
    category: AchievementType.FLAVOR_EXPLORER,
    requirements: { type: 'unique_flavors', value: 25 },
    rewards: { type: 'badge', value: 'flavor_explorer_silver' },
  },
  flavor_explorer_gold: {
    type: 'flavor_explorer_gold',
    title: '향미 탐험가 골드',
    description: '50가지 서로 다른 향미를 발견하세요',
    icon: '🗺️',
    rarity: 'epic',
    category: AchievementType.FLAVOR_EXPLORER,
    requirements: { type: 'unique_flavors', value: 50 },
    rewards: { type: 'badge', value: 'flavor_explorer_gold' },
  },
  flavor_category_master: {
    type: 'flavor_category_master',
    title: '카테고리 마스터',
    description: '한 향미 카테고리의 모든 하위 향미를 발견하세요',
    icon: '🏆',
    rarity: 'epic',
    category: AchievementType.FLAVOR_EXPLORER,
    requirements: { type: 'category_completion', value: 1 },
    rewards: { type: 'title', value: 'Category Master' },
  },

  // Taste Accuracy Series
  taste_novice: {
    type: 'taste_novice',
    title: '미각 초보자',
    description: '향미 퀴즈에서 70% 이상 정확도 달성',
    icon: '🎯',
    rarity: 'common',
    category: AchievementType.TASTE_ACCURACY,
    requirements: { type: 'quiz_accuracy', value: 0.7 },
    rewards: { type: 'title', value: 'Taste Novice' },
  },
  taste_expert: {
    type: 'taste_expert',
    title: '미각 전문가',
    description: '향미 퀴즈에서 85% 이상 정확도 달성',
    icon: '🎯',
    rarity: 'rare',
    category: AchievementType.TASTE_ACCURACY,
    requirements: { type: 'quiz_accuracy', value: 0.85 },
    rewards: { type: 'title', value: 'Taste Expert' },
  },
  taste_master: {
    type: 'taste_master',
    title: '미각 마스터',
    description: '향미 퀴즈에서 95% 이상 정확도 달성',
    icon: '🎯',
    rarity: 'epic',
    category: AchievementType.TASTE_ACCURACY,
    requirements: { type: 'quiz_accuracy', value: 0.95 },
    rewards: { type: 'title', value: 'Taste Master' },
  },

  // Consistency Series
  week_warrior: {
    type: 'week_warrior',
    title: '주간 전사',
    description: '한 달 동안 매주 5회 이상 테이스팅',
    icon: '💪',
    rarity: 'common',
    category: AchievementType.CONSISTENCY,
    requirements: { 
      type: 'weekly_tastings', 
      value: 5,
      additionalConditions: { weeks: 4 }
    },
    rewards: { type: 'points', value: 100 },
  },
  month_master: {
    type: 'month_master',
    title: '월간 큐레이터',
    description: '한 달에 10가지 이상 고품질 커피 기록',
    icon: '🏆',
    rarity: 'rare',
    category: AchievementType.CONSISTENCY,
    requirements: { type: 'monthly_quality', value: 10 },
    rewards: { type: 'points', value: 200 },
  },
  hundred_tastings: {
    type: 'hundred_tastings',
    title: '백 잔의 커피',
    description: '총 100잔의 커피를 테이스팅하세요',
    icon: '💯',
    rarity: 'rare',
    category: AchievementType.CONSISTENCY,
    requirements: { type: 'total_tastings', value: 100 },
    rewards: { type: 'badge', value: 'centurion' },
  },

  // Vocabulary Series
  word_collector: {
    type: 'word_collector',
    title: '단어 수집가',
    description: '50개의 다른 향미 단어 사용',
    icon: '📚',
    rarity: 'common',
    category: AchievementType.VOCABULARY,
    requirements: { type: 'unique_words', value: 50 },
    rewards: { type: 'points', value: 75 },
  },
  vocabulary_virtuoso: {
    type: 'vocabulary_virtuoso',
    title: '어휘 거장',
    description: '100개의 다른 향미 단어 사용',
    icon: '📚',
    rarity: 'epic',
    category: AchievementType.VOCABULARY,
    requirements: { type: 'unique_words', value: 100 },
    rewards: { type: 'title', value: 'Vocabulary Virtuoso' },
  },

  // Hidden Achievements
  early_bird: {
    type: 'early_bird',
    title: '얼리버드',
    description: '오전 7시 이전에 커피 테이스팅',
    icon: '🌅',
    rarity: 'rare',
    category: AchievementType.HIDDEN,
    requirements: { 
      type: 'tasting_time', 
      value: 7,
      additionalConditions: { before: true }
    },
    rewards: { type: 'points', value: 50 },
  },
  night_owl: {
    type: 'night_owl',
    title: '올빼미',
    description: '오후 10시 이후에 커피 테이스팅',
    icon: '🦉',
    rarity: 'rare',
    category: AchievementType.HIDDEN,
    requirements: { 
      type: 'tasting_time', 
      value: 22,
      additionalConditions: { after: true }
    },
    rewards: { type: 'points', value: 50 },
  },
  perfect_match: {
    type: 'perfect_match',
    title: '완벽한 매치',
    description: '로스터 노트와 100% 일치',
    icon: '💯',
    rarity: 'legendary',
    category: AchievementType.HIDDEN,
    requirements: { type: 'match_score', value: 100 },
    rewards: { 
      type: 'title', 
      value: 'Perfect Matcher',
      additionalRewards: [{ type: 'points', value: 1000 }]
    },
  },
  weekend_warrior: {
    type: 'weekend_warrior',
    title: '주말 커피 애호가',
    description: '주말에 만 마신 특별한 커피 10가지',
    icon: '🎉',
    rarity: 'rare',
    category: AchievementType.HIDDEN,
    requirements: { 
      type: 'weekend_specials', 
      value: 10 
    },
    rewards: { type: 'badge', value: 'weekend_warrior' },
  },
  
  // Coffee Discovery Achievements
  coffee_discoverer_1: {
    type: 'coffee_discoverer_1',
    title: '커피 탐험가 Lv.1',
    description: '새로운 커피를 처음으로 등록했습니다',
    icon: '🏆',
    rarity: 'rare',
    category: AchievementType.COFFEE_EXPLORER,
    requirements: { type: 'coffee_discovery', value: 1 },
    rewards: { type: 'title', value: 'Coffee Discoverer' },
  },
  coffee_discoverer_5: {
    type: 'coffee_discoverer_5',
    title: '커피 탐험가 Lv.2',
    description: '새로운 커피 5개를 등록했습니다',
    icon: '🏆',
    rarity: 'epic',
    category: AchievementType.COFFEE_EXPLORER,
    requirements: { type: 'coffee_discovery', value: 5 },
    rewards: { type: 'title', value: 'Coffee Explorer' },
  },
  coffee_discoverer_10: {
    type: 'coffee_discoverer_10',
    title: '커피 탐험가 Lv.3',
    description: '새로운 커피 10개를 등록했습니다',
    icon: '🏆',
    rarity: 'legendary',
    category: AchievementType.COFFEE_EXPLORER,
    requirements: { type: 'coffee_discovery', value: 10 },
    rewards: { type: 'title', value: 'Coffee Pioneer' },
  },
};

// =============================================
// Achievement System Service
// =============================================

export class AchievementSystem {
  private realm: Realm | null = null;
  private userAchievements: Map<string, Achievement> = new Map();
  private achievementProgress: Map<string, number> = new Map();
  private userCoffeeDiscoveries: Map<string, number> = new Map();

  constructor(realm?: Realm) {
    if (realm) {
      this.realm = realm;
    }
  }

  setRealm(realm: Realm) {
    this.realm = realm;
  }

  /**
   * Initialize achievement definitions in the database
   */
  async initializeAchievements(): Promise<void> {
    if (!this.realm) throw new Error('Realm not initialized');

    try {
      this.realm.write(() => {
        Object.entries(ACHIEVEMENT_DEFINITIONS).forEach(([type, definition]) => {
          const existing = this.realm!
            .objects('AchievementDefinition')
            .filtered('achievementType = $0', type)[0];

          if (!existing) {
            this.realm!.create('AchievementDefinition', {
              id: generateUUID(),
              achievementType: type,
              title: definition.title,
              description: definition.description,
              icon: definition.icon,
              rarity: definition.rarity,
              category: definition.category,
              requirements: JSON.stringify(definition.requirements),
              rewards: JSON.stringify(definition.rewards),
              isActive: true,
              createdAt: new Date(),
            });
          }
        });
      });
    } catch (error) {
      console.error('Error initializing achievements:', error);
      throw error;
    }
  }

  /**
   * Check and update achievements based on user action
   */
  async checkAndUpdateAchievements(
    userId: string,
    action: UserAction
  ): Promise<Achievement[]> {
    if (!this.realm) throw new Error('Realm not initialized');

    try {
      const unlockedAchievements: Achievement[] = [];
      
      // Load user's current achievements
      await this.loadUserAchievements(userId);

      // Check each achievement definition
      for (const [type, definition] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
        // Skip if already unlocked
        if (this.userAchievements.has(type)) continue;

        // Check if achievement conditions are met
        const progress = await this.checkAchievementProgress(
          userId,
          definition,
          action
        );

        if (progress >= 1.0) {
          // Achievement unlocked!
          const achievement = await this.unlockAchievement(userId, type, definition);
          unlockedAchievements.push(achievement);
        } else if (progress > 0) {
          // Update progress
          this.achievementProgress.set(type, progress);
          await this.updateAchievementProgress(userId, type, progress);
        }
      }

      // Check for combo achievements
      const comboAchievements = await this.checkComboAchievements(userId, unlockedAchievements);
      unlockedAchievements.push(...comboAchievements);

      return unlockedAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  }

  /**
   * Calculate progress for a specific achievement
   */
  async calculateProgress(
    userId: string,
    achievementType: string
  ): Promise<ProgressData> {
    if (!this.realm) throw new Error('Realm not initialized');

    try {
      const definition = ACHIEVEMENT_DEFINITIONS[achievementType];
      if (!definition) throw new Error(`Unknown achievement type: ${achievementType}`);

      const requirement = definition.requirements;
      let currentValue = 0;
      let targetValue = requirement.value;

      switch (requirement.type) {
        case 'tasting_count':
          currentValue = await this.getTastingCount(userId);
          break;
        
        case 'weekly_variety':
          currentValue = await this.getWeeklyVariety(userId);
          break;
          
        case 'monthly_quality':
          currentValue = await this.getMonthlyQualityCount(userId);
          break;
          
        case 'weekend_specials':
          currentValue = await this.getWeekendSpecialsCount(userId);
          break;
        
        case 'unique_flavors':
          currentValue = await this.getUniqueFlavorsCount(userId);
          break;
        
        case 'quiz_accuracy':
          currentValue = await this.getQuizAccuracy(userId);
          targetValue = requirement.value * 100; // Convert to percentage
          break;
        
        case 'weekly_tastings':
          currentValue = await this.getWeeklyTastingAverage(userId, requirement.additionalConditions?.weeks || 4);
          break;
        
        case 'unique_words':
          currentValue = await this.getUniqueWordsCount(userId);
          break;
        
        case 'total_tastings':
          currentValue = await this.getTotalTastings(userId);
          break;
        
        case 'match_score':
          currentValue = await this.getBestMatchScore(userId);
          break;
          
        case 'coffee_discovery':
          // Count user's coffee discoveries
          // This would query from coffee_catalog table where first_added_by = userId
          // For now, we'll use the action data
          currentValue = this.userCoffeeDiscoveries.get(userId) || 0;
          if (action.type === 'coffee_discovery') {
            currentValue++;
            this.userCoffeeDiscoveries.set(userId, currentValue);
          }
          break;
      }

      const percentage = Math.min(currentValue / targetValue, 1);
      const estimatedDays = this.estimateTimeToComplete(
        requirement.type,
        currentValue,
        targetValue,
        userId
      );

      return {
        currentValue,
        targetValue,
        percentage,
        estimatedTimeToComplete: estimatedDays,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error calculating progress:', error);
      throw error;
    }
  }

  /**
   * Get all achievements for a user
   */
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    if (!this.realm) throw new Error('Realm not initialized');

    try {
      await this.loadUserAchievements(userId);
      
      const achievements: Achievement[] = [];
      
      // Get unlocked achievements
      this.userAchievements.forEach(achievement => {
        achievements.push(achievement);
      });

      // Get in-progress achievements
      for (const [type, definition] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
        if (!this.userAchievements.has(type)) {
          const progress = this.achievementProgress.get(type) || 0;
          
          achievements.push({
            id: generateUUID(),
            type,
            title: definition.title,
            description: definition.description,
            icon: definition.icon,
            rarity: definition.rarity,
            category: definition.category,
            requirements: definition.requirements,
            rewards: definition.rewards,
            progress,
          });
        }
      }

      // Sort by category and progress
      return achievements.sort((a, b) => {
        if (a.unlockedAt && !b.unlockedAt) return -1;
        if (!a.unlockedAt && b.unlockedAt) return 1;
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return b.progress - a.progress;
      });
    } catch (error) {
      console.error('Error getting user achievements:', error);
      throw error;
    }
  }

  /**
   * Track coffee discovery achievement
   */
  async trackCoffeeDiscovery(): Promise<Achievement[]> {
    const userId = await this.getCurrentUserId();
    if (!userId) return [];

    return this.checkAndUpdateAchievements(userId, {
      type: 'coffee_discovery',
      timestamp: new Date(),
      data: { discovered: true },
    });
  }

  /**
   * Get current user ID from auth state
   */
  private async getCurrentUserId(): Promise<string | null> {
    // This would typically get from your auth state management
    // For now, we'll use a placeholder
    return 'current-user-id';
  }

  /**
   * Get achievement statistics for a user
   */
  async getAchievementStats(userId: string): Promise<{
    totalUnlocked: number;
    totalAvailable: number;
    completionRate: number;
    totalPoints: number;
    rarityBreakdown: Record<string, number>;
    categoryBreakdown: Record<string, number>;
  }> {
    if (!this.realm) throw new Error('Realm not initialized');

    try {
      await this.loadUserAchievements(userId);

      const totalAvailable = Object.keys(ACHIEVEMENT_DEFINITIONS).length;
      const totalUnlocked = this.userAchievements.size;
      const completionRate = totalUnlocked / totalAvailable;

      let totalPoints = 0;
      const rarityBreakdown: Record<string, number> = {
        common: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
      };
      const categoryBreakdown: Record<string, number> = {};

      this.userAchievements.forEach(achievement => {
        // Count points
        if (achievement.rewards.type === 'points') {
          totalPoints += achievement.rewards.value as number;
        }
        if (achievement.rewards.additionalRewards) {
          achievement.rewards.additionalRewards.forEach(reward => {
            if (reward.type === 'points') {
              totalPoints += reward.value as number;
            }
          });
        }

        // Count by rarity
        rarityBreakdown[achievement.rarity]++;

        // Count by category
        const category = achievement.category;
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
      });

      return {
        totalUnlocked,
        totalAvailable,
        completionRate,
        totalPoints,
        rarityBreakdown,
        categoryBreakdown,
      };
    } catch (error) {
      console.error('Error getting achievement stats:', error);
      throw error;
    }
  }

  // =============================================
  // Private Helper Methods
  // =============================================

  private async loadUserAchievements(userId: string): Promise<void> {
    if (!this.realm) return;

    this.userAchievements.clear();
    this.achievementProgress.clear();

    const userAchievements = this.realm
      .objects('UserAchievement')
      .filtered('userId = $0', userId);

    userAchievements.forEach((ua: any) => {
      const definition = ACHIEVEMENT_DEFINITIONS[ua.achievementType];
      if (definition) {
        this.userAchievements.set(ua.achievementType, {
          id: ua.id,
          type: ua.achievementType,
          title: definition.title,
          description: definition.description,
          icon: definition.icon,
          rarity: definition.rarity,
          category: definition.category,
          requirements: definition.requirements,
          rewards: definition.rewards,
          progress: ua.progress,
          unlockedAt: ua.unlockedAt,
        });
      }

      if (ua.progress < 1) {
        this.achievementProgress.set(ua.achievementType, ua.progress);
      }
    });
  }

  private async checkAchievementProgress(
    userId: string,
    definition: Omit<Achievement, 'id' | 'progress' | 'unlockedAt'>,
    action: UserAction
  ): Promise<number> {
    const requirement = definition.requirements;
    
    // Quick check if this action is relevant to the achievement
    if (!this.isActionRelevant(requirement.type, action.type)) {
      return this.achievementProgress.get(definition.type) || 0;
    }

    const progressData = await this.calculateProgress(userId, definition.type);
    return progressData.percentage;
  }

  private isActionRelevant(requirementType: string, actionType: string): boolean {
    const relevanceMap: Record<string, string[]> = {
      tasting_count: ['tasting'],
      weekly_variety: ['tasting'],
      monthly_quality: ['tasting'],
      weekend_specials: ['tasting'],
      unique_flavors: ['tasting'],
      quiz_accuracy: ['quiz'],
      weekly_tastings: ['tasting'],
      unique_words: ['tasting'],
      total_tastings: ['tasting'],
      match_score: ['tasting'],
      flavor_match: ['tasting'],
      category_completion: ['tasting'],
      tasting_time: ['tasting'],
    };

    return relevanceMap[requirementType]?.includes(actionType) || false;
  }

  private async unlockAchievement(
    userId: string,
    type: string,
    definition: Omit<Achievement, 'id' | 'progress' | 'unlockedAt'>
  ): Promise<Achievement> {
    if (!this.realm) throw new Error('Realm not initialized');

    const achievement: Achievement = {
      id: generateUUID(),
      type,
      ...definition,
      progress: 1,
      unlockedAt: new Date(),
      isNew: true,
    };

    this.realm.write(() => {
      this.realm!.create('UserAchievement', {
        id: achievement.id,
        userId,
        achievementType: type,
        achievementLevel: 1,
        achievementData: JSON.stringify({
          unlockedAt: achievement.unlockedAt,
          actionType: 'unlock',
        }),
        unlockedAt: achievement.unlockedAt,
        progress: 1,
        isSynced: false,
      });
    });

    this.userAchievements.set(type, achievement);
    
    // Award points if applicable
    if (definition.rewards.type === 'points') {
      await this.awardPoints(userId, definition.rewards.value as number);
    }

    return achievement;
  }

  private async updateAchievementProgress(
    userId: string,
    type: string,
    progress: number
  ): Promise<void> {
    if (!this.realm) return;

    this.realm.write(() => {
      let userAchievement = this.realm!
        .objects('UserAchievement')
        .filtered('userId = $0 AND achievementType = $1', userId, type)[0];

      if (!userAchievement) {
        userAchievement = this.realm!.create('UserAchievement', {
          id: generateUUID(),
          userId,
          achievementType: type,
          achievementLevel: 1,
          achievementData: JSON.stringify({
            startedAt: new Date(),
          }),
          progress,
          isSynced: false,
        });
      } else {
        userAchievement.progress = progress;
        userAchievement.isSynced = false;
      }
    });
  }

  private async checkComboAchievements(
    userId: string,
    newAchievements: Achievement[]
  ): Promise<Achievement[]> {
    const comboAchievements: Achievement[] = [];

    // Check for category completions
    const categoryGroups: Record<string, string[]> = {
      flavor_explorer_complete: ['flavor_explorer_bronze', 'flavor_explorer_silver', 'flavor_explorer_gold'],
      taste_master_complete: ['taste_novice', 'taste_expert', 'taste_master'],
    };

    for (const [comboType, requiredTypes] of Object.entries(categoryGroups)) {
      const hasAll = requiredTypes.every(type => 
        this.userAchievements.has(type) || 
        newAchievements.some(a => a.type === type)
      );

      if (hasAll && !this.userAchievements.has(comboType)) {
        // Create combo achievement (would be defined in ACHIEVEMENT_DEFINITIONS in production)
        // For now, we'll skip this
      }
    }

    return comboAchievements;
  }

  // =============================================
  // Data Fetching Methods
  // =============================================

  private async getTastingCount(userId: string): Promise<number> {
    if (!this.realm) return 0;
    
    return this.realm
      .objects('TastingRecord')
      .filtered('userId = $0', userId)
      .length;
  }

  private async getWeeklyVariety(userId: string): Promise<number> {
    if (!this.realm) return 0;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const records = this.realm
      .objects('TastingRecord')
      .filtered('userId = $0 AND createdAt >= $1', userId, weekStart);

    const uniqueCoffees = new Set();
    Array.from(records).forEach((record: any) => {
      uniqueCoffees.add(`${record.roastery}-${record.coffeeName}`);
    });

    return uniqueCoffees.size;
  }

  private async getMonthlyQualityCount(userId: string): Promise<number> {
    if (!this.realm) return 0;

    const monthStart = new Date();
    monthStart.setDate(monthStart.getDate() - 30);
    
    const records = this.realm
      .objects('TastingRecord')
      .filtered('userId = $0 AND createdAt >= $1 AND matchScoreTotal >= 80', userId, monthStart);

    return records.length;
  }

  private async getWeekendSpecialsCount(userId: string): Promise<number> {
    if (!this.realm) return 0;

    const records = this.realm
      .objects('TastingRecord')
      .filtered('userId = $0', userId);

    let weekendSpecials = 0;
    Array.from(records).forEach((record: any) => {
      const recordDate = new Date(record.createdAt);
      const dayOfWeek = recordDate.getDay();
      
      // Weekend (Saturday = 6, Sunday = 0)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendSpecials++;
      }
    });

    return weekendSpecials;
  }

  private async getUniqueFlavorsCount(userId: string): Promise<number> {
    if (!this.realm) return 0;

    const flavors = new Set<string>();
    const records = this.realm
      .objects('TastingRecord')
      .filtered('userId = $0', userId);

    records.forEach((record: any) => {
      const flavorNotes = record.flavorNotes || [];
      flavorNotes.forEach((note: any) => {
        if (note.level1) flavors.add(note.level1);
        if (note.level2) flavors.add(`${note.level1}-${note.level2}`);
        if (note.level3) flavors.add(`${note.level1}-${note.level2}-${note.level3}`);
      });
    });

    return flavors.size;
  }

  private async getQuizAccuracy(userId: string): Promise<number> {
    if (!this.realm) return 0;

    // Get quiz results from learning progress
    const learningProgress = this.realm
      .objects('FlavorLearningProgress')
      .filtered('userId = $0', userId);

    if (learningProgress.length === 0) return 0;

    let totalExposures = 0;
    let totalCorrect = 0;

    learningProgress.forEach((progress: any) => {
      totalExposures += progress.exposureCount;
      totalCorrect += progress.identificationCount;
    });

    return totalExposures > 0 ? (totalCorrect / totalExposures) : 0;
  }

  private async getWeeklyTastingAverage(userId: string, weeks: number): Promise<number> {
    if (!this.realm) return 0;

    const weeksAgo = new Date();
    weeksAgo.setDate(weeksAgo.getDate() - (weeks * 7));

    const records = this.realm
      .objects('TastingRecord')
      .filtered('userId = $0 AND createdAt >= $1', userId, weeksAgo);

    // Group by week
    const weeklyTastings: Map<number, number> = new Map();
    
    records.forEach((record: any) => {
      const weekNumber = Math.floor(
        (new Date().getTime() - record.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      weeklyTastings.set(weekNumber, (weeklyTastings.get(weekNumber) || 0) + 1);
    });

    // Check if all weeks meet the requirement
    let qualifyingWeeks = 0;
    for (let i = 0; i < weeks; i++) {
      if ((weeklyTastings.get(i) || 0) >= 5) {
        qualifyingWeeks++;
      }
    }

    return qualifyingWeeks;
  }

  private async getUniqueWordsCount(userId: string): Promise<number> {
    if (!this.realm) return 0;

    const uniqueWords = new Set<string>();
    const records = this.realm
      .objects('TastingRecord')
      .filtered('userId = $0', userId);

    records.forEach((record: any) => {
      if (record.vocabularyUsed) {
        record.vocabularyUsed.forEach((word: string) => {
          uniqueWords.add(word.toLowerCase());
        });
      }
    });

    return uniqueWords.size;
  }

  private async getTotalTastings(userId: string): Promise<number> {
    if (!this.realm) return 0;

    const profile = this.realm
      .objects('UserTasteProfile')
      .filtered('userId = $0', userId)[0];

    return profile?.totalTastings || 0;
  }

  private async getBestMatchScore(userId: string): Promise<number> {
    if (!this.realm) return 0;

    const records = this.realm
      .objects('TastingRecord')
      .filtered('userId = $0 AND matchScore != null', userId)
      .sorted('matchScore', true);

    return records.length > 0 ? records[0].matchScore : 0;
  }

  private estimateTimeToComplete(
    requirementType: string,
    current: number,
    target: number,
    userId: string
  ): number {
    const remaining = target - current;
    if (remaining <= 0) return 0;

    // Rough estimates based on requirement type
    const estimatesPerDay: Record<string, number> = {
      tasting_count: 2,
      consecutive_days: 1,
      unique_flavors: 3,
      quiz_accuracy: 0.02, // 2% improvement per day
      weekly_tastings: 0.25, // Quarter week per day
      unique_words: 5,
      total_tastings: 2,
      match_score: 0.5, // Half point per day
    };

    const perDay = estimatesPerDay[requirementType] || 1;
    return Math.ceil(remaining / perDay);
  }

  private async awardPoints(userId: string, points: number): Promise<void> {
    // In a real implementation, this would update a user points table
    // For now, we'll just log it
    console.log(`Awarded ${points} points to user ${userId}`);
  }

  /**
   * Generate achievement notification
   */
  generateNotification(achievement: Achievement): AchievementNotification {
    const celebrationTypes: Record<string, AchievementNotification['celebrationType']> = {
      common: 'subtle',
      rare: 'normal',
      epic: 'epic',
      legendary: 'epic',
    };

    const messages: Record<string, string> = {
      first_tasting: '커피 여정의 첫 걸음을 내디뎠습니다!',
      flavor_explorer_bronze: '향미 탐험가로서의 여정이 시작되었습니다!',
      taste_master: '당신은 진정한 미각의 달인입니다!',
      perfect_match: '완벽합니다! 로스터와 같은 향미를 느끼셨네요!',
    };

    return {
      achievement,
      celebrationType: celebrationTypes[achievement.rarity],
      message: messages[achievement.type] || `${achievement.title} 달성!`,
      points: achievement.rewards.type === 'points' ? achievement.rewards.value as number : undefined,
    };
  }

  /**
   * Sync achievements with Supabase
   */
  async syncWithSupabase(userId: string): Promise<void> {
    if (!this.realm) throw new Error('Realm not initialized');

    try {
      const unsyncedAchievements = this.realm
        .objects('UserAchievement')
        .filtered('userId = $0 AND isSynced = false', userId);

      for (const achievement of unsyncedAchievements) {
        const { error } = await supabase
          .from('user_achievements')
          .upsert({
            id: achievement.id,
            user_id: achievement.userId,
            achievement_type: achievement.achievementType,
            achievement_level: achievement.achievementLevel,
            achievement_data: JSON.parse(achievement.achievementData || '{}'),
            unlocked_at: achievement.unlockedAt,
            progress: achievement.progress,
          });

        if (!error) {
          this.realm.write(() => {
            achievement.isSynced = true;
          });
        }
      }
    } catch (error) {
      console.error('Error syncing achievements:', error);
      throw error;
    }
  }
}