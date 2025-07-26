import Realm from 'realm';
import { UserAction, AchievementDefinition, AchievementReward, UserAchievement, AchievementProgress, AchievementStats } from '../types/achievement';
import { generateUUID } from '../utils/uuid';
import { supabase } from './supabase/client';
import { Logger } from './LoggingService';
import { 
  Achievement, 
  ProgressData, 
  AchievementNotification, 
  AchievementType 
} from '../types/achievements';
import { ACHIEVEMENT_DEFINITIONS } from '../data/achievementDefinitions';

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
        Object.entries(ACHIEVEMENT_DEFINITIONS).forEach(([type, definition], index) => {
          const existing = this.realm!
            .objects('AchievementDefinition')
            .filtered('achievementType = $0', type)[0];

          if (!existing) {
            const uniqueId = `achievement-def-${type}-${index}-${Date.now()}`;
            this.realm!.create('AchievementDefinition', {
              id: uniqueId,
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
      Logger.error('Error initializing achievements', 'achievement', { error: error as Error });
      throw error;
  }
}

  /**
   * Track user action and check for achievements
   */
  async trackUserAction(action: UserAction, userId: string): Promise<AchievementNotification[]> {
    if (!this.realm) throw new Error('Realm not initialized');

    const notifications: AchievementNotification[] = [];
    
    try {
      // Get user achievements from database
      const userAchievements = this.realm
        .objects('UserAchievement')
        .filtered('userId = $0', userId);

      // Check each achievement definition
      for (const [type, definition] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
        const userAchievement = userAchievements.filtered('achievementType = $0', type)[0];
        
        if (!userAchievement || userAchievement.isUnlocked) {
          continue; // Skip if not exists or already unlocked
      }

        const progress = this.calculateProgressInternal(definition, action, userId);
        
        if (progress.percentage >= 1.0) {
          // Achievement unlocked!
          const achievement = await this.unlockAchievement(type, userId);
          if (achievement) {
            notifications.push({
              achievement,
              celebrationType: this.getCelebrationType(definition.rarity),
              message: `축하합니다! "${achievement.title}" 업적을 달성했습니다!`,
              points: typeof definition.rewards.value === 'number' ? definition.rewards.value : undefined,
          });
        }
      } else {
          // Update progress
          await this.updateAchievementProgress(type, userId, progress.percentage);
      }
    }

      return notifications;
  } catch (error) {
      Logger.error('Error tracking user action', 'achievement', { error: error as Error, data: { action: String(action), userId } });
      return [];
  }
}

  /**
   * Calculate progress for a specific achievement (internal method)
   */
  private calculateProgressInternal(definition: AchievementDefinition, action: UserAction, userId: string): ProgressData {
    const req = definition.requirements;
    let currentValue = 0;
    const targetValue = req.value;

    // Get relevant data based on requirement type
    switch (req.type) {
      case 'tasting_count':
        currentValue = this.getTastingCount(userId);
        break;
      case 'weekly_variety':
        currentValue = this.getWeeklyVariety(userId);
        break;
      case 'unique_flavors':
        currentValue = this.getUniqueFlavorCount(userId);
        break;
      case 'home_cafe_tasting':
        currentValue = this.getHomeCafeTastingCount(userId);
        break;
      case 'coffee_discovery':
        currentValue = this.getCoffeeDiscoveryCount(userId);
        break;
      // Add more cases as needed
      default:
        currentValue = 0;
  }

    const percentage = Math.min(currentValue / targetValue, 1.0);
    
    return {
      currentValue,
      targetValue,
      percentage,
      lastUpdated: new Date(),
  };
}

  /**
   * Unlock achievement for user
   */
  private async unlockAchievement(achievementType: string, userId: string): Promise<Achievement | null> {
    if (!this.realm) return null;

    try {
      const definition = ACHIEVEMENT_DEFINITIONS[achievementType];
      if (!definition) return null;

      let userAchievement: UserAchievement;
      
      this.realm.write(() => {
        userAchievement = this.realm!.create('UserAchievement', {
          id: generateUUID(),
          userId,
          achievementType,
          progress: 1.0,
          isUnlocked: true,
          unlockedAt: new Date(),
          isNew: true,
          createdAt: new Date(),
          updatedAt: new Date(),
      }, Realm.UpdateMode.Modified);
    });

      // Award points/rewards
      await this.awardRewards(definition.rewards, userId);

      // Sync to Supabase
      await this.syncAchievementToSupabase(userAchievement);

      return {
        id: userAchievement.id,
        type: achievementType,
        title: definition.title,
        description: definition.description,
        icon: definition.icon,
        rarity: definition.rarity,
        category: definition.category,
        requirements: definition.requirements,
        rewards: definition.rewards,
        progress: 1.0,
        unlockedAt: userAchievement.unlockedAt,
        isNew: true,
    };
  } catch (error) {
      Logger.error('Error unlocking achievement', 'achievement', { error: error as Error, data: { achievementType, userId } });
      return null;
  }
}

  /**
   * Award rewards to user
   */
  private async awardRewards(rewards: AchievementReward, userId: string): Promise<void> {
    try {
      if (rewards.type === 'points' && typeof rewards.value === 'number') {
        await this.awardPoints(userId, rewards.value);
    }
      
      if (rewards.additionalRewards) {
        for (const additionalReward of rewards.additionalRewards) {
          await this.awardRewards(additionalReward, userId);
      }
    }
  } catch (error) {
      Logger.error('Error awarding rewards', 'achievement', { error: error as Error, data: { rewards, userId } });
  }
}

  /**
   * Award points to user
   */
  private async awardPoints(userId: string, points: number): Promise<void> {
    if (!this.realm) return;

    try {
      this.realm.write(() => {
        const userProfile = this.realm!
          .objects('UserProfile')
          .filtered('userId = $0', userId)[0];
        
        if (userProfile) {
          (userProfile as unknown).totalPoints = ((userProfile as unknown).totalPoints || 0) + points;
          (userProfile as unknown).updatedAt = new Date();
      }
    });
  } catch (error) {
      Logger.error('Error awarding points', 'achievement', { error: error as Error, data: { userId, points } });
  }
}

  /**
   * Get celebration type based on rarity
   */
  private getCelebrationType(rarity: string): 'subtle' | 'normal' | 'epic' {
    switch (rarity) {
      case 'legendary':
      case 'epic':
        return 'epic';
      case 'rare':
        return 'normal';
      default:
        return 'subtle';
  }
}

  /**
   * Update achievement progress
   */
  private async updateAchievementProgress(achievementType: string, userId: string, progress: number): Promise<void> {
    if (!this.realm) return;

    try {
      this.realm.write(() => {
        const existing = this.realm!
          .objects('UserAchievement')
          .filtered('userId = $0 AND achievementType = $1', userId, achievementType)[0];

        if (existing) {
          (existing as unknown).progress = progress;
          (existing as unknown).updatedAt = new Date();
      } else {
          this.realm!.create('UserAchievement', {
            id: generateUUID(),
            userId,
            achievementType,
            progress,
            isUnlocked: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
      }
    });
  } catch (error) {
      Logger.error('Error updating achievement progress', 'achievement', { error: error as Error, data: { achievementType, userId, progress } });
  }
}

  /**
   * Sync achievement to Supabase
   */
  private async syncAchievementToSupabase(achievement: unknown): Promise<void> {
    try {
      await supabase
        .from('user_achievements')
        .upsert({
          id: achievement.id,
          user_id: achievement.userId,
          achievement_type: achievement.achievementType,
          progress: achievement.progress,
          is_unlocked: achievement.isUnlocked,
          unlocked_at: achievement.unlockedAt?.toISOString(),
          created_at: achievement.createdAt.toISOString(),
          updated_at: achievement.updatedAt.toISOString(),
      });
  } catch (error) {
      Logger.error('Error syncing achievement to Supabase', 'achievement', { error: error as Error, data: { achievement } });
  }
}

  // Helper methods for data retrieval
  private getTastingCount(userId: string): number {
    if (!this.realm) return 0;
    return this.realm.objects('TastingRecord').filtered('userId = $0', userId).length;
}

  private getWeeklyVariety(userId: string): number {
    if (!this.realm) return 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const records = this.realm
      .objects('TastingRecord')
      .filtered('userId = $0 AND createdAt >= $1', userId, oneWeekAgo);
    
    const uniqueCoffees = new Set();
    for (const record of records) {
      const coffeeKey = `${(record as unknown).roaster}-${(record as unknown).coffeeName}`;
      uniqueCoffees.add(coffeeKey);
  }
    
    return uniqueCoffees.size;
}

  private getUniqueFlavorCount(userId: string): number {
    if (!this.realm) return 0;
    const records = this.realm.objects('TastingRecord').filtered('userId = $0', userId);
    
    const uniqueFlavors = new Set();
    for (const record of records) {
      if ((record as unknown).flavorProfile) {
        try {
          const flavors = JSON.parse((record as unknown).flavorProfile);
          flavors.forEach((flavor: unknown) => uniqueFlavors.add(flavor.name || flavor));
      } catch (error) {
          // Ignore parsing errors
      }
    }
  }
    
    return uniqueFlavors.size;
}

  private getHomeCafeTastingCount(userId: string): number {
    if (!this.realm) return 0;
    return this.realm
      .objects('TastingRecord')
      .filtered('userId = $0 AND mode = $1', userId, 'home_cafe').length;
}

  private getCoffeeDiscoveryCount(userId: string): number {
    // This would need to be implemented based on your coffee discovery logic
    return this.userCoffeeDiscoveries.get(userId) || 0;
}

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    if (!this.realm) return [];

    try {
      const userAchievements = this.realm
        .objects('UserAchievement')
        .filtered('userId = $0', userId);

      const achievements: Achievement[] = [];
      const seenAchievementTypes = new Set<string>();
      const timestamp = Date.now();
      
      Logger.debug(`Processing ${userAchievements.length} achievements for user ${userId}`, 'service', { component: 'AchievementSystem' });
      
      // First pass: collect unique achievement types to prevent duplicates at source
      const achievementTypeMap = new Map<string, any>();
      
      for (let index = 0; index < userAchievements.length; index++) {
        const userAchievement = userAchievements[index];
        const achievementType = (userAchievement as unknown).achievementType;
        const achievementId = (userAchievement as unknown).id;
        
        // Skip if basic validation fails
        if (!achievementType || !achievementId) {
          Logger.warn('Skipping achievement with missing type or ID:', 'service', { component: 'AchievementSystem', data: { achievementType, achievementId } });
          continue;
      }
        
        // Keep only the latest/most complete version of each achievement type
        if (!achievementTypeMap.has(achievementType)) {
          achievementTypeMap.set(achievementType, userAchievement);
      } else {
          const existing = achievementTypeMap.get(achievementType);
          // Prefer the one with unlockedAt date (completed achievements)
          if ((userAchievement as unknown).unlockedAt && !(existing as unknown).unlockedAt) {
            achievementTypeMap.set(achievementType, userAchievement);
        }
      }
    }
      
      Logger.debug(`Deduplicated to ${achievementTypeMap.size} unique achievement types`, 'service', { component: 'AchievementSystem' });
      
      // Second pass: create achievement objects from deduplicated map
      let processedIndex = 0;
      for (const [achievementType, userAchievement] of achievementTypeMap.entries()) {
        const definition = ACHIEVEMENT_DEFINITIONS[achievementType];
        
        // Skip if definition doesn't exist
        if (!definition) {
          Logger.warn('No definition found for achievement type:', 'service', { component: 'AchievementSystem', data: achievementType });
          continue;
      }
        
        // Generate guaranteed unique ID using processed index
        const uniqueId = `ach-${userId.slice(-4)}-${achievementType}-${processedIndex}-${timestamp}-${Math.random().toString(36).substr(2, 6)}`;
        
        // Create achievement object with guaranteed unique ID
        const achievement = {
          id: uniqueId,
          type: achievementType,
          title: definition.title,
          description: definition.description,
          icon: definition.icon,
          rarity: definition.rarity,
          category: definition.category,
          requirements: definition.requirements,
          rewards: definition.rewards,
          progress: (userAchievement as unknown).progress || 0,
          unlockedAt: (userAchievement as unknown).unlockedAt || undefined,
          isNew: (userAchievement as unknown).isNew || false,
      };
        
        achievements.push(achievement);
        processedIndex++;
        
        Logger.debug(`Created achievement: ${uniqueId} (${achievementType})`, 'service', { component: 'AchievementSystem' });
    }
      
      Logger.debug('Final result: ' + achievements.length + ' achievements created', 'service', { component: 'AchievementSystem' });
      return achievements;
  } catch (error) {
      Logger.error('Error in getUserAchievements:', 'service', { component: 'AchievementSystem', error: error });
      Logger.error('Error getting user achievements', 'achievement', { error: error as Error, userId });
      return [];
  }
}

  /**
   * Mark achievement as seen (remove isNew flag)
   */
  async markAchievementAsSeen(achievementId: string): Promise<void> {
    if (!this.realm) return;

    try {
      this.realm.write(() => {
        const achievement = this.realm!
          .objects('UserAchievement')
          .filtered('id = $0', achievementId)[0];
        
        if (achievement) {
          (achievement as unknown).isNew = false;
          (achievement as unknown).updatedAt = new Date();
      }
    });
  } catch (error) {
      Logger.error('Error marking achievement as seen', 'achievement', { error: error as Error, data: { achievementId } });
  }
}

  /**
   * Check and update achievements (wrapper for trackUserAction)
   */
  async checkAndUpdateAchievements(userId: string, action: UserAction): Promise<Achievement[]> {
    const notifications = await this.trackUserAction(action, userId);
    return notifications.map(n => n.achievement);
}

  /**
   * Calculate progress for a specific achievement type
   */
  async calculateProgress(userId: string, achievementType: string): Promise<ProgressData | null> {
    const definition = ACHIEVEMENT_DEFINITIONS[achievementType];
    if (!definition) return null;

    // Create a dummy action for progress calculation
    const dummyAction: UserAction = {
      type: 'tasting',
      data: {},
      timestamp: new Date(),
  };

    return this.calculateProgressInternal(definition, dummyAction, userId);
}

  /**
   * Get achievement statistics for user
   */
  async getAchievementStats(userId: string): Promise<{
    totalPoints: number;
    unlockedCount: number;
    totalCount: number;
    completionPercentage: number;
}> {
    if (!this.realm) {
      return {
        totalPoints: 0,
        unlockedCount: 0,
        totalCount: 0,
        completionPercentage: 0,
    };
  }

    try {
      const userAchievements = await this.getUserAchievements(userId);
      const unlockedAchievements = userAchievements.filter(a => a.unlockedAt);
      
      const totalPoints = unlockedAchievements
        .filter(a => a.rewards.type === 'points')
        .reduce((sum, a) => sum + (a.rewards.value as number), 0);

      const totalCount = Object.keys(ACHIEVEMENT_DEFINITIONS).length;
      const unlockedCount = unlockedAchievements.length;
      const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

      return {
        totalPoints,
        unlockedCount,
        totalCount,
        completionPercentage,
    };
  } catch (error) {
      Logger.error('Error getting achievement stats', 'achievement', { error: error as Error, userId });
      return {
        totalPoints: 0,
        unlockedCount: 0,
        totalCount: 0,
        completionPercentage: 0,
    };
  }
}

  /**
   * Track coffee discovery for achievements
   */
  async trackCoffeeDiscovery(userId: string, coffeeData: unknown): Promise<void> {
    try {
      const action: UserAction = {
        type: 'milestone',
        data: {
          type: 'coffee_discovery',
          coffeeName: coffeeData.coffeeName,
          roaster: coffeeData.roaster,
      },
        timestamp: new Date(),
    };

      await this.trackUserAction(action, userId);
      
      // Update coffee discovery count
      const currentCount = this.userCoffeeDiscoveries.get(userId) || 0;
      this.userCoffeeDiscoveries.set(userId, currentCount + 1);
  } catch (error) {
      Logger.error('Error tracking coffee discovery', 'achievement', { error: error as Error, data: { userId, coffeeData } });
  }
}
}

// Export singleton instance
export const achievementSystem = new AchievementSystem();