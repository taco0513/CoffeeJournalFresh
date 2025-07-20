import { useEffect, useState, useCallback } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { 
  PersonalTasteAnalysisService,
  FlavorLearningEngine,
  AchievementSystem,
  LiteAICoachService,
} from '../services/personalTaste';
import { AchievementType } from '../services/AchievementSystem';
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
    try {
      setLoading(true);
      setError(null);

      // 게스트 모드인 경우 바로 더미 데이터 표시
      const isGuestMode = !currentUser || currentUser.username === 'Guest' || !userId;
      
      if (isGuestMode) {
        // 게스트 모드: 바로 mock 데이터 설정하고 로딩 끝
        setTastePattern(getMockTastePattern());
        setGrowthMetrics(getMockGrowthMetrics());
        setRecommendations(getMockRecommendations());
        setInsights(getMockPersonalInsights());
        setLoading(false);
        return;
      }

      // 일반 사용자 모드: 실제 분석 수행
      if (!services) {
        // 서비스가 없으면 mock 데이터 사용
        setTastePattern(getMockTastePattern());
        setGrowthMetrics(getMockGrowthMetrics());
        setRecommendations(getMockRecommendations());
        setInsights(getMockPersonalInsights());
        setLoading(false);
        return;
      }

      // 실제 분석 수행
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
  }, [userId, services, currentUser]);

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
    try {
      setLoading(true);
      
      // 게스트 모드인 경우 바로 더미 데이터 표시
      const isGuestMode = !currentUser || currentUser.username === 'Guest' || !userId;
      
      if (isGuestMode) {
        setDailyInsight(getMockDailyInsight());
        setLearningPath(getMockLearningPath());
        setLoading(false);
        return;
      }
      
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
  }, [userId, services, currentUser]);

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
  const { currentUser } = useUserStore();
  const userId = currentUser?.id || '';

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAchievements = useCallback(async () => {
    try {
      setLoading(true);
      
      // 게스트 모드인 경우 바로 더미 데이터 표시
      const isGuestMode = !currentUser || currentUser.username === 'Guest' || !userId;
      
      if (isGuestMode) {
        // Mock achievements for guest mode
        const mockAchievements: Achievement[] = [
          {
            id: 'first_taste',
            type: 'milestone',
            title: '첫 테이스팅',
            description: '첫 번째 커피 테이스팅 완료',
            icon: '☕',
            rarity: 'common',
            category: AchievementType.FIRST_STEPS,
            requirements: { type: 'tasting_count', value: 1 },
            rewards: { type: 'points', value: 10 },
            progress: 1,
            unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            isNew: false,
          },
          {
            id: 'flavor_explorer',
            type: 'exploration',
            title: '맛 탐험가',
            description: '10가지 다른 플레이버 발견',
            icon: '🔍',
            rarity: 'rare',
            category: AchievementType.FLAVOR_EXPLORER,
            requirements: { type: 'flavor_count', value: 10 },
            rewards: { type: 'points', value: 25 },
            progress: 1,
            unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            isNew: false,
          },
        ];
        
        const mockStats = {
          totalAchievements: 2,
          totalPoints: 35,
          completionRate: 0.15,
          recentUnlocks: 1,
        };
        
        setAchievements(mockAchievements);
        setStats(mockStats);
        setLoading(false);
        return;
      }
      
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
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, services, currentUser]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const checkForNewAchievements = useCallback(
    async (action: any) => {
      // 게스트 모드인 경우 빈 배열 반환
      const isGuestMode = !currentUser || currentUser.username === 'Guest' || !userId;
      if (isGuestMode) return [];
      
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
    [userId, services, loadAchievements, currentUser]
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
      
      // 게스트 모드인 경우 바로 더미 데이터 표시
      const isGuestMode = !currentUser || currentUser.username === 'Guest' || !userId;
      
      if (isGuestMode) {
        // Mock flavor mastery data for guest mode
        const mockMasteryMap = new Map<string, MasteryLevel>([
          ['chocolate', {
            category: 'chocolate',
            level: 'expert',
            score: 85,
            totalExposures: 120,
            successfulIdentifications: 102,
            accuracyRate: 0.85,
            confidenceLevel: 4,
            lastPracticed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            progressToNext: 0.7,
            nextMilestone: 'Master - 15 more correct identifications',
          }],
          ['fruity', {
            category: 'fruity',
            level: 'proficient',
            score: 65,
            totalExposures: 80,
            successfulIdentifications: 52,
            accuracyRate: 0.65,
            confidenceLevel: 3,
            lastPracticed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            progressToNext: 0.3,
            nextMilestone: 'Expert - Practice with African coffees',
          }],
          ['floral', {
            category: 'floral',
            level: 'apprentice',
            score: 40,
            totalExposures: 30,
            successfulIdentifications: 12,
            accuracyRate: 0.4,
            confidenceLevel: 2,
            lastPracticed: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            progressToNext: 0.6,
            nextMilestone: 'Proficient - Try more light roasts',
          }],
        ]);
        
        setFlavorMastery(mockMasteryMap);
        setLoading(false);
        return;
      }
      
      if (!userId || !services) {
        setLoading(false);
        return;
      }
      
      const mastery = await services.learningEngine.getUserFlavorMasterySummary(userId);
      setFlavorMastery(mastery);
    } catch (error) {
      console.error('Error loading flavor mastery:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, services, currentUser]);

  useEffect(() => {
    loadFlavorMastery();
  }, [loadFlavorMastery]);

  const updateFlavorProgress = useCallback(
    async (flavorIdentification: any) => {
      // 게스트 모드인 경우 아무것도 하지 않음
      const isGuestMode = !currentUser || currentUser.username === 'Guest' || !userId;
      if (isGuestMode) return;
      
      if (!userId || !services) return;

      try {
        await services.learningEngine.updateFlavorProgress(userId, flavorIdentification);
        // Refresh mastery data
        await loadFlavorMastery();
      } catch (error) {
        console.error('Error updating flavor progress:', error);
      }
    },
    [userId, services, loadFlavorMastery, currentUser]
  );

  return {
    flavorMastery,
    loading,
    updateFlavorProgress,
    refresh: loadFlavorMastery,
  };
};