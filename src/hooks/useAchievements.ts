import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AchievementSystem } from '../services/AchievementSystem';
import { Achievement, ProgressData, UserAction } from '../types/achievements';
import { useUserStore } from '../stores/useUserStore';
import { useRealm } from '../contexts/RealmContext';

import { Logger } from '../services/LoggingService';
interface AchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  totalPoints: number;
  completionPercentage: number;
}

interface UseAchievementsReturn {
  achievements: Achievement[];
  stats: AchievementStats;
  isLoading: boolean;
  error: string | null;
  refreshAchievements: () => Promise<void>;
  checkAchievements: (action: UserAction) => Promise<Achievement[]>;
  getProgress: (achievementType: string) => Promise<ProgressData | null>;
  getNextAchievement: () => Achievement | null;
}

export const useAchievements = (): UseAchievementsReturn => {
  const { currentUser } = useUserStore();
  const { isReady: isRealmReady, realmService } = useRealm();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats>({
    totalAchievements: 0,
    unlockedAchievements: 0,
    totalPoints: 0,
    completionPercentage: 0,
});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [achievementSystem, setAchievementSystem] = useState<AchievementSystem | null>(null);

  // Initialize achievement system
  useEffect(() => {
    const initializeAchievements = async () => {
      if (!currentUser?.id || !isRealmReady) {
        setIsLoading(false);
        return;
    }

      try {
        setIsLoading(true);
        setError(null);
        
        // Check if RealmService is properly initialized
        if (!realmService.isInitialized) {
          setError('Database not initialized');
          setIsLoading(false);
          return;
      }
        
        const system = new AchievementSystem(realmService.getRealm());
        setAchievementSystem(system);
        
        await system.initializeAchievements();
        await refreshAchievements();
    } catch (err) {
        Logger.error('Failed to initialize achievements:', 'hook', { component: 'useAchievements', error: err });
        setError(err instanceof Error ? err.message : 'Failed to load achievements');
    } finally {
        setIsLoading(false);
    }
  };

    initializeAchievements();
}, [currentUser?.id, isRealmReady]);

  // Refresh achievements data
  const refreshAchievements = useCallback(async () => {
    if (!currentUser?.id || !achievementSystem) {
      Logger.debug('🚫 Skipping refresh - missing user or system', 'hook', { component: 'useAchievements' });
      return;
  }

    try {
      setError(null);
      Logger.debug(' Starting achievements refresh for user:', 'hook', { component: 'useAchievements', data: currentUser.id });
      
      // Load user achievements with improved error handling
      const userAchievements = await achievementSystem.getUserAchievements(currentUser.id);
      Logger.debug('📦 Received achievements from system:', 'hook', { component: 'useAchievements', data: userAchievements.length });
      
      // Validate achievements data structure
      const validAchievements = userAchievements.filter((achievement) => {
        const isValid = achievement && 
                       achievement.id && 
                       achievement.type && 
                       achievement.title && 
                       typeof achievement.id === 'string';
        
        if (!isValid) {
          Logger.warn(' Invalid achievement filtered out:', 'hook', { component: 'useAchievements', data: achievement });
      }
        return isValid;
    });
      
      Logger.debug('Valid achievements after filtering:', 'hook', { component: 'useAchievements', data: validAchievements.length });
      
      // Additional safety check: ensure all IDs are truly unique
      const idSet = new Set<string>();
      const finalAchievements = validAchievements.filter((achievement) => {
        if (idSet.has(achievement.id)) {
          Logger.warn(' Duplicate ID detected and filtered:', 'hook', { component: 'useAchievements', data: achievement.id });
          return false;
      }
        idSet.add(achievement.id);
        return true;
    });
      
      Logger.debug(' Final achievements count:', 'hook', { component: 'useAchievements', data: finalAchievements.length });
      
      // Calculate stats using final achievements - create new unique objects to prevent React key conflicts
      const safeAchievements = finalAchievements.map((achievement, index) => ({
        ...achievement,
        // Ensure completely unique ID for stats calculation
        uniqueStatsId: `stats-${achievement.id}-${index}-${Date.now()}`
    }));
      
      const totalAchievements = safeAchievements.length;
      const unlockedAchievements = safeAchievements.filter(a => a.unlockedAt).length;
      const totalPoints = safeAchievements
        .filter((a: unknown) => a.unlockedAt && a.rewards && a.rewards.type === 'points')
        .reduce((sum: number, a: unknown) => {
          const points = typeof a.rewards.value === 'number' ? a.rewards.value : 0;
          return sum + points;
      }, 0);
      const completionPercentage = totalAchievements > 0 
        ? Math.round((unlockedAchievements / totalAchievements) * 100)
        : 0;

      const statsData = {
        totalAchievements,
        unlockedAchievements,
        totalPoints,
        completionPercentage,
    };

      Logger.debug('Calculated stats:', 'hook', { component: 'useAchievements', data: statsData });

      // Use React.startTransition for non-urgent updates with micro delay to prevent key conflicts
      React.startTransition(() => {
        Logger.debug(' Updating state with achievements:', 'hook', { component: 'useAchievements', data: finalAchievements.length });
        
        // Add micro delay to prevent React from getting confused during rapid updates
        setTimeout(() => {
          // Use finalAchievements for state (already has unique IDs)
          setAchievements(finalAchievements);
          setStats(statsData);
      }, 0);
    });
      
      Logger.debug('Achievements refresh completed successfully', 'hook', { component: 'useAchievements' });
  } catch (err) {
      Logger.error('Failed to refresh achievements:', 'hook', { component: 'useAchievements', error: err });
      setError(err instanceof Error ? err.message : 'Failed to refresh achievements');
  }
}, [currentUser?.id, achievementSystem]);

  // Check for new achievements
  const checkAchievements = useCallback(async (action: UserAction): Promise<Achievement[]> => {
    if (!currentUser?.id || !achievementSystem) return [];

    try {
      setError(null);
      
      const newAchievements = await achievementSystem.checkAndUpdateAchievements(
        currentUser.id,
        action
      );
      
      if (newAchievements.length > 0) {
        // Refresh achievements list to include the new ones
        await refreshAchievements();
    }
      
      return newAchievements;
  } catch (err) {
      Logger.error('Failed to check achievements:', 'hook', { component: 'useAchievements', error: err });
      setError(err instanceof Error ? err.message : 'Failed to check achievements');
      return [];
  }
}, [currentUser?.id, achievementSystem, refreshAchievements]);

  // Get progress for specific achievement
  const getProgress = useCallback(async (achievementType: string): Promise<ProgressData | null> => {
    if (!currentUser?.id || !achievementSystem) return null;

    try {
      const progress = await achievementSystem.calculateProgress(currentUser.id, achievementType);
      return progress;
  } catch (err) {
      Logger.error('Failed to get progress for ${achievementType}:', 'hook', { component: 'useAchievements', error: err });
      return null;
  }
}, [currentUser?.id, achievementSystem]);

  // Get next achievement to work towards
  const getNextAchievement = useCallback((): Achievement | null => {
    const lockedAchievements = achievements.filter(a => !a.unlockedAt);
    
    if (lockedAchievements.length === 0) return null;
    
    // Sort by progress (highest first) and then by rarity (common first)
    const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
    
    return lockedAchievements.sort((a: Achievement, b: Achievement) => {
      const progressDiff = (b.progress || 0) - (a.progress || 0);
      if (progressDiff !== 0) return progressDiff;
      
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  })[0];
}, [achievements]);

  return {
    achievements,
    stats,
    isLoading,
    error,
    refreshAchievements,
    checkAchievements,
    getProgress,
    getNextAchievement,
};
};