import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AchievementSystem } from '../services/AchievementSystem';
import { Achievement, ProgressData, UserAction } from '../types/achievements';
import { useUserStore } from '../stores/useUserStore';
import { useRealm } from '../contexts/RealmContext';

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
        console.error('Failed to initialize achievements:', err);
        setError(err instanceof Error ? err.message : 'Failed to load achievements');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAchievements();
  }, [currentUser?.id, isRealmReady]);

  // Refresh achievements data
  const refreshAchievements = useCallback(async () => {
    if (!currentUser?.id || !achievementSystem) return;

    try {
      setError(null);
      
      // Load user achievements
      const userAchievements = await achievementSystem.getUserAchievements(currentUser.id);
      
      // Remove duplicates by ID to prevent React key duplication errors
      console.log('🔍 Raw achievements count:', userAchievements.length);
      const duplicateIds = userAchievements.map(a => a.id).filter((id, index, arr) => arr.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        console.warn('⚠️ Duplicate achievement IDs found:', duplicateIds);
      }
      
      const uniqueAchievements = userAchievements.reduce((acc: Achievement[], current: Achievement) => {
        const existingAchievement = acc.find(item => item.id === current.id);
        if (!existingAchievement) {
          acc.push(current);
        } else {
          console.log('🔄 Replacing duplicate achievement:', current.id, current.title);
          // Keep the more recent/updated version (with unlockedAt if available)
          if (current.unlockedAt && !existingAchievement.unlockedAt) {
            const index = acc.findIndex(item => item.id === current.id);
            acc[index] = current;
          }
        }
        return acc;
      }, []);
      
      console.log('✅ Unique achievements count:', uniqueAchievements.length);
      
      // Calculate stats using unique achievements
      const totalAchievements = uniqueAchievements.length;
      const unlockedAchievements = uniqueAchievements.filter(a => a.unlockedAt).length;
      const totalPoints = uniqueAchievements
        .filter((a: Achievement) => a.unlockedAt && a.rewards.type === 'points')
        .reduce((sum: number, a: Achievement) => sum + (a.rewards.value as number), 0);
      const completionPercentage = totalAchievements > 0 
        ? Math.round((unlockedAchievements / totalAchievements) * 100)
        : 0;

      // Batch update to prevent intermediate render states
      React.startTransition(() => {
        setAchievements(uniqueAchievements);
        setStats({
          totalAchievements,
          unlockedAchievements,
          totalPoints,
          completionPercentage,
        });
      });
    } catch (err) {
      console.error('Failed to refresh achievements:', err);
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
      console.error('Failed to check achievements:', err);
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
      console.error(`Failed to get progress for ${achievementType}:`, err);
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