import { useEffect, useState, useCallback } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { 
  // PersonalTasteAnalysisService, // Moved to feature_backlog
  // FlavorLearningEngine, // Moved to feature_backlog
  AchievementSystem,
} from '../services/personalTaste';
import { AchievementType } from '../types/achievements';
import {
  TastePattern,
  GrowthMetrics,
  Achievement,
  DailyInsight,
  LearningPath,
  CoffeeRecommendation,
  PersonalInsights,
  MasteryLevel,
} from '../types/personalTaste';
import RealmService from '../services/realm/RealmService';
import { Logger } from '../services/LoggingService';
import {
  getMockTastePattern,
  getMockGrowthMetrics,
  getMockRecommendations,
  getMockPersonalInsights,
  getMockDailyInsight,
  getMockLearningPath,
} from '../utils/mockPersonalTasteData';

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
      // const analysisService = new PersonalTasteAnalysisService(realm); // Moved to feature_backlog
      // const learningEngine = new FlavorLearningEngine(realm); // Moved to feature_backlog
      const achievementSystem = new AchievementSystem(realm);

      return {
        // analysisService, // Moved to feature_backlog
        // learningEngine, // Moved to feature_backlog
        achievementSystem,
    };
  } catch (error) {
      Logger.error('Error initializing personal taste services:', 'hook', { component: 'usePersonalTaste', error: error });
      return null;
  }
});

  const loadPersonalTasteData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);


      // 실제 분석 수행
      if (!services) {
        // 서비스가 없으면 mock 데이터 사용
        setTastePattern(getMockTastePattern());
        setGrowthMetrics(getMockGrowthMetrics());
        setRecommendations(getMockRecommendations());
        setInsights(getMockPersonalInsights());
        setLoading(false);
        return;
    }

      // 실제 분석 수행 - Moved to feature_backlog
      // const [pattern, growth, recs, personalInsights] = await Promise.all([
      //   services.analysisService.analyzePersonalTastePattern(userId),
      //   services.analysisService.trackTasteGrowth(userId),
      //   services.analysisService.generatePersonalRecommendations(userId),
      //   services.analysisService.getPersonalInsights(userId),
      // ]);

      // setTastePattern(pattern);
      // setGrowthMetrics(growth);
      // setRecommendations(recs);
      // setInsights(personalInsights);
      
      // Use mock data for MVP
      setTastePattern(getMockTastePattern());
      setGrowthMetrics(getMockGrowthMetrics());
      setRecommendations(getMockRecommendations());
      setInsights(getMockPersonalInsights());
  } catch (err) {
      Logger.error('Error loading personal taste data:', 'hook', { component: 'usePersonalTaste', error: err });
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

// Hook for AI Coach features - Moved to Future Roadmap
// export const useLiteAICoach = () => {
//   const { services } = usePersonalTaste();
//   const { currentUser } = useUserStore();
//   const userId = currentUser?.id || '';

//   const [dailyInsight, setDailyInsight] = useState<DailyInsight | null>(null);
//   const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
//   const [loading, setLoading] = useState(true);

//   const loadCoachData = useCallback(async () => {
//     try {
//       setLoading(true);
      
//       if (services?.coachService) {
//         const [insight, path] = await Promise.all([
//           services.coachService.getDailyInsight(userId),
//           services.coachService.generateLearningPath(userId),
//         ]);

//         setDailyInsight(insight);
//         setLearningPath(path);
//     } else {
//         // Use mock data when services are not available
//         setDailyInsight(getMockDailyInsight());
//         setLearningPath(getMockLearningPath());
//     }
//   } catch (error) {
//       console.error('Error loading coach data:', error);
//       // Fall back to mock data on error
//       setDailyInsight(getMockDailyInsight());
//       setLearningPath(getMockLearningPath());
//   } finally {
//       setLoading(false);
//   }
// }, [userId, services]);

//   useEffect(() => {
//     loadCoachData();
// }, [loadCoachData]);

//   return {
//     dailyInsight,
//     learningPath,
//     loading,
//     coachService: services?.coachService,
//     refresh: loadCoachData,
// };
// };

// Hook for achievements
export const useAchievements = () => {
  const { services } = usePersonalTaste();
  const { currentUser } = useUserStore();
  const userId = currentUser?.id || '';

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const loadAchievements = useCallback(async () => {
    try {
      setLoading(true);
      
      
      if (!userId || !services) {
        setLoading(false);
        return;
    }
      
      const [userAchievements, achievementStats] = await Promise.all([
        services.achievementSystem.getUserAchievements(userId),
        services.achievementSystem.getAchievementStats(userId),
      ]);

      setAchievements(userAchievements);
      setStats(achievementStats);
  } catch (error) {
      Logger.error('Error loading achievements:', 'hook', { component: 'usePersonalTaste', error: error });
  } finally {
      setLoading(false);
  }
}, [userId, services]);

  useEffect(() => {
    loadAchievements();
}, [loadAchievements]);

  const checkForNewAchievements = useCallback(
    async (action: unknown) => {
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
        Logger.error('Error checking achievements:', 'hook', { component: 'usePersonalTaste', error: error });
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
  const { currentUser } = useUserStore();
  const userId = currentUser?.id || '';

  const [flavorMastery, setFlavorMastery] = useState<Map<string, MasteryLevel>>(new Map());
  const [loading, setLoading] = useState(true);

  const loadFlavorMastery = useCallback(async () => {
    try {
      setLoading(true);
      
      
      if (!userId || !services) {
        setLoading(false);
        return;
    }
      
      // const mastery = await services.learningEngine.getUserFlavorMasterySummary(userId); // Moved to feature_backlog
      const mastery = new Map(); // Return empty map for MVP
      setFlavorMastery(mastery);
  } catch (error) {
      Logger.error('Error loading flavor mastery:', 'hook', { component: 'usePersonalTaste', error: error });
  } finally {
      setLoading(false);
  }
}, [userId, services]);

  useEffect(() => {
    loadFlavorMastery();
}, [loadFlavorMastery]);

  const updateFlavorProgress = useCallback(
    async (flavorIdentification: unknown) => {
      if (!userId || !services) return;

      try {
        // await services.learningEngine.updateFlavorProgress(userId, flavorIdentification); // Moved to feature_backlog
        Logger.debug('Flavor progress update skipped - feature moved to backlog', 'hook', { component: 'usePersonalTaste' });
        // Refresh mastery data
        await loadFlavorMastery();
    } catch (error) {
        Logger.error('Error updating flavor progress:', 'hook', { component: 'usePersonalTaste', error: error });
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