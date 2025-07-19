import {
  TastePattern,
  GrowthMetrics,
  CoffeeRecommendation,
  PersonalInsights,
  DailyInsight,
  LearningPath,
  MasteryLevel,
  PersonalStatsData,
  ProgressData,
  TasteProfileType,
} from '@/types/personalTaste';

export const getMockTastePattern = (): TastePattern => ({
  userId: 'mock-user',
  dominantFlavors: ['chocolate', 'caramel', 'nutty'],
  preferredIntensity: 0.7,
  sweetnessTolerance: 0.6,
  acidityPreference: 0.5,
  bodyPreference: 0.8,
  roastPreference: 'medium',
  originPreferences: ['Colombia', 'Ethiopia', 'Brazil'],
  processingPreferences: ['washed', 'natural'],
  consistency: 0.85,
  adventurousness: 0.6,
  lastUpdated: new Date(),
});

export const getMockGrowthMetrics = (): GrowthMetrics => ({
  totalTastings: 42,
  uniqueCoffees: 28,
  flavorVocabularySize: 35,
  accuracyImprovement: 0.25,
  consistencyScore: 0.85,
  explorationScore: 0.7,
  weeklyGrowthRate: 0.15,
  milestones: [
    {
      type: 'first_10_tastings',
      achieved: true,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'flavor_expert',
      achieved: true,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ],
});

export const getMockRecommendations = (): CoffeeRecommendation[] => [
  {
    id: '1',
    coffeeName: 'Ethiopia Yirgacheffe',
    roasterName: 'Blue Bottle Coffee',
    matchScore: 0.92,
    flavorNotes: ['blueberry', 'lemon', 'floral'],
    reason: 'Based on your love for fruity and floral notes',
    roastLevel: 'light',
    origin: 'Ethiopia',
    processing: 'washed',
  },
  {
    id: '2',
    coffeeName: 'Colombia Geisha',
    roasterName: 'Stumptown Coffee',
    matchScore: 0.87,
    flavorNotes: ['jasmine', 'peach', 'honey'],
    reason: 'Perfect balance of sweetness and acidity',
    roastLevel: 'medium-light',
    origin: 'Colombia',
    processing: 'natural',
  },
];

export const getMockPersonalInsights = (): PersonalInsights => ({
  tasteTrends: [
    {
      trend: 'increasing_chocolate_preference',
      description: 'Your appreciation for chocolate notes has grown 30% this month',
      significance: 0.8,
    },
    {
      trend: 'consistent_acidity',
      description: 'You consistently prefer medium acidity levels',
      significance: 0.9,
    },
  ],
  flavorJourney: {
    startingPoint: ['sweet', 'nutty'],
    currentPosition: ['chocolate', 'caramel', 'fruity'],
    trajectory: 'expanding',
    nextMilestone: 'Explore more floral notes',
  },
  strengthsAndGaps: {
    strengths: ['chocolate identification', 'sweetness detection'],
    gaps: ['floral notes', 'spice identification'],
    recommendations: ['Try more African coffees', 'Focus on aroma training'],
  },
});

export const getMockDailyInsight = (): DailyInsight => ({
  id: 'daily-1',
  type: 'flavor_tip',
  title: '오늘의 커피 팁',
  message: '초콜릿 향을 더 잘 느끼려면 커피를 한 모금 머금고 혀 전체로 맛을 느껴보세요.',
  action: {
    text: '테이스팅 시작',
    target: 'new_tasting',
  },
  priority: 'medium',
  createdAt: new Date(),
});

export const getMockLearningPath = (): LearningPath => ({
  currentLevel: 3,
  nextMilestone: 'Flavor Expert',
  progressToNext: 0.65,
  suggestedActivities: [
    {
      type: 'blind_tasting',
      title: 'Blind Tasting Challenge',
      description: 'Test your flavor identification skills',
      estimatedTime: 15,
      difficulty: 'medium',
    },
    {
      type: 'origin_comparison',
      title: 'Compare Origins',
      description: 'Taste coffees from different regions',
      estimatedTime: 30,
      difficulty: 'easy',
    },
  ],
  recentProgress: [
    {
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      achievement: 'Identified 5 flavors correctly',
      points: 50,
    },
  ],
});

export const getMockMasteryLevels = (): MasteryLevel[] => [
  {
    category: 'chocolate',
    level: 'expert',
    score: 85,
    totalExposures: 120,
    correctIdentifications: 102,
    accuracyRate: 0.85,
    lastImprovement: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    progressToNext: 0.7,
    nextMilestone: 'Master - 15 more correct identifications',
  },
  {
    category: 'fruity',
    level: 'proficient',
    score: 65,
    totalExposures: 80,
    correctIdentifications: 52,
    accuracyRate: 0.65,
    lastImprovement: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    progressToNext: 0.3,
    nextMilestone: 'Expert - Practice with African coffees',
  },
  {
    category: 'floral',
    level: 'apprentice',
    score: 40,
    totalExposures: 30,
    correctIdentifications: 12,
    accuracyRate: 0.4,
    lastImprovement: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    progressToNext: 0.6,
    nextMilestone: 'Proficient - Try more light roasts',
  },
];

export const getMockPersonalStats = (): PersonalStatsData => ({
  totalTastings: 42,
  uniqueCoffees: 28,
  favoriteFlavor: 'Chocolate',
  vocabularySize: 35,
  quizAccuracy: 78,
  currentLevel: 3,
  nextLevelProgress: 65,
  averageMatchScore: 82,
  favoriteRoaster: 'Blue Bottle Coffee',
  uniqueRoasters: 12,
});

export const getMockProgressData = (): ProgressData => ({
  currentValue: 42,
  targetValue: 50,
  percentage: 0.84,
  estimatedTimeToComplete: 7,
  lastUpdated: new Date(),
});

export const getMockTasteProfileType = (): TasteProfileType => 'Chocolate Lover';