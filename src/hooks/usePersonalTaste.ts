import { useEffect, useState, useCallback } from 'react';
import { useUserStore } from '@/stores/useUserStore';
import { 
  PersonalTasteAnalysisService,
  FlavorLearningEngine,
  AchievementSystem,
  LiteAICoachService,
} from '@/services/personalTaste';
import {
  TastePattern,
  GrowthMetrics,
  Achievement,
  DailyInsight,
  LearningPath,
  CoffeeRecommendation,
  PersonalInsights,
  MasteryLevel,
} from '@/types/personalTaste';
import RealmService from '@/services/realm/RealmService';
import {
  getMockTastePattern,
  getMockGrowthMetrics,
  getMockRecommendations,
  getMockPersonalInsights,
  getMockDailyInsight,
  getMockLearningPath,
} from '@/utils/mockPersonalTasteData';

// Hook for overall personal taste data
export const usePersonalTaste = () => {
  const { currentUser } = useUserStore();
  const userId = currentUser?.id || '';
  const realmService = RealmService.getInstance();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [tastePattern, setTastePattern] = useState<TastePattern | null>(null);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<CoffeeRecommendation[]>([]);
  const [insights, setInsights] = useState<PersonalInsights | null>(null);

  // Initialize services
  const [services] = useState(() => {
    try {
      if (!realmService.isInitialized) {
        return null;
      }
      const realm = realmService.getRealm();
      const analysisService = new PersonalTasteAnalysisService(realm);
      const learningEngine = new FlavorLearningEngine(realm);
      const achievementSystem = new AchievementSystem(realm);
      const coachService = new LiteAICoachService(
        analysisService,
        learningEngine,
        achievementSystem
      );

      return {
        analysisService,
        learningEngine,
        achievementSystem,
        coachService,
      };
    } catch (error) {
      console.error('Error initializing personal taste services:', error);
      return null;
    }
  });

  const loadPersonalTasteData = useCallback(async () => {
    if (!userId || !services) return;

    try {
      setLoading(true);
      setError(null);

      if (services) {
        const [pattern, growth, recs, personalInsights] = await Promise.all([
          services.analysisService.analyzePersonalTastePattern(userId),
          services.analysisService.trackTasteGrowth(userId),
          services.analysisService.generatePersonalRecommendations(userId),
          services.analysisService.getPersonalInsights(userId),
        ]);

        setTastePattern(pattern);
        setGrowthMetrics(growth);
        setRecommendations(recs);
        setInsights(personalInsights);
      } else {
        // Use mock data when services are not available
        setTastePattern(getMockTastePattern());
        setGrowthMetrics(getMockGrowthMetrics());
        setRecommendations(getMockRecommendations());
        setInsights(getMockPersonalInsights());
      }
    } catch (err) {
      console.error('Error loading personal taste data:', err);
      // Fall back to mock data on error
      setTastePattern(getMockTastePattern());
      setGrowthMetrics(getMockGrowthMetrics());
      setRecommendations(getMockRecommendations());
      setInsights(getMockPersonalInsights());
      setError('Using demo data - database not available');
    } finally {
      setLoading(false);
    }
  }, [userId, services]);

  useEffect(() => {
    loadPersonalTasteData();
  }, [loadPersonalTasteData]);

  const refresh = useCallback(() => {
    return loadPersonalTasteData();
  }, [loadPersonalTasteData]);

  return {
    loading,
    error,
    tastePattern,
    growthMetrics,
    recommendations,
    insights,
    services,
    refresh,
  };
};

// Hook for AI Coach features
export const useLiteAICoach = () => {
  const { services } = usePersonalTaste();
  const { currentUser } = useUserStore();
  const userId = currentUser?.id || '';

  const [dailyInsight, setDailyInsight] = useState<DailyInsight | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCoachData = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      if (services?.coachService) {
        const [insight, path] = await Promise.all([
          services.coachService.getDailyInsight(userId),
          services.coachService.generateLearningPath(userId),
        ]);

        setDailyInsight(insight);
        setLearningPath(path);
      } else {
        // Use mock data when services are not available
        setDailyInsight(getMockDailyInsight());
        setLearningPath(getMockLearningPath());
      }
    } catch (error) {
      console.error('Error loading coach data:', error);
      // Fall back to mock data on error
      setDailyInsight(getMockDailyInsight());
      setLearningPath(getMockLearningPath());
    } finally {
      setLoading(false);
    }
  }, [userId, services]);

  useEffect(() => {
    loadCoachData();
  }, [loadCoachData]);

  return {
    dailyInsight,
    learningPath,
    loading,
    coachService: services?.coachService,
    refresh: loadCoachData,
  };
};

// Hook for achievements
export const useAchievements = () => {
  const { services } = usePersonalTaste();
  const { user } = useUserStore();
  const userId = user?.id || '';

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAchievements = useCallback(async () => {
    if (!userId || !services) return;

    try {
      setLoading(true);
      
      const [userAchievements, achievementStats] = await Promise.all([
        services.achievementSystem.getUserAchievements(userId),
        services.achievementSystem.getAchievementStats(userId),
      ]);

      setAchievements(userAchievements);
      setStats(achievementStats);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, services]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const checkForNewAchievements = useCallback(
    async (action: any) => {
      if (!userId || !services) return [];

      try {
        const newAchievements = await services.achievementSystem.checkAndUpdateAchievements(
          userId,
          action
        );
        
        if (newAchievements.length > 0) {
          // Refresh achievements list
          await loadAchievements();
        }
        
        return newAchievements;
      } catch (error) {
        console.error('Error checking achievements:', error);
        return [];
      }
    },
    [userId, services, loadAchievements]
  );

  return {
    achievements,
    stats,
    loading,
    checkForNewAchievements,
    refresh: loadAchievements,
  };
};

// Hook for flavor mastery
export const useFlavorMastery = () => {
  const { services } = usePersonalTaste();
  const { user } = useUserStore();
  const userId = user?.id || '';

  const [flavorMastery, setFlavorMastery] = useState<Map<string, MasteryLevel>>(new Map());
  const [loading, setLoading] = useState(true);

  const loadFlavorMastery = useCallback(async () => {
    if (!userId || !services) return;

    try {
      setLoading(true);
      
      const mastery = await services.learningEngine.getUserFlavorMasterySummary(userId);
      setFlavorMastery(mastery);
    } catch (error) {
      console.error('Error loading flavor mastery:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, services]);

  useEffect(() => {
    loadFlavorMastery();
  }, [loadFlavorMastery]);

  const updateFlavorProgress = useCallback(
    async (flavorIdentification: any) => {
      if (!userId || !services) return;

      try {
        await services.learningEngine.updateFlavorProgress(userId, flavorIdentification);
        // Refresh mastery data
        await loadFlavorMastery();
      } catch (error) {
        console.error('Error updating flavor progress:', error);
      }
    },
    [userId, services, loadFlavorMastery]
  );

  return {
    flavorMastery,
    loading,
    updateFlavorProgress,
    refresh: loadFlavorMastery,
  };
};