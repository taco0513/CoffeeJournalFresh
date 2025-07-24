import {
  TastePattern,
  GrowthMetrics,
  CoffeeRecommendation,
  PersonalInsights,
  MasteryLevel,
  PersonalStatsData,
  ProgressData,
  TasteProfileType,
  FlavorPreference,
} from '../types/personalTaste';

// Coach types defined locally for mock data
interface DailyInsight {
  fact: string;
  personalizedMessage: string;
  suggestedAction: string;
  relatedAchievement?: string;
}

interface LearningPath {
  currentFocus: string;
  nextMilestone: string;
  estimatedTime: string;
  exercises: any[];
}

export const getMockTastePattern = (): TastePattern => ({
  userId: 'mock-user',
  dominantFlavors: [
    { category: 'chocolate', preference: 0.9, frequency: 15, consistency: 0.8 },
    { category: 'caramel', preference: 0.7, frequency: 12, consistency: 0.75 },
    { category: 'nutty', preference: 0.6, frequency: 8, consistency: 0.7 },
    { category: 'fruity', preference: 0.4, frequency: 5, consistency: 0.6 },
    { category: 'floral', preference: 0.3, frequency: 3, consistency: 0.5 },
    { category: 'sweet', preference: 0.8, frequency: 10, consistency: 0.8 },
  ],
  tasteProfile: 'Chocolate Lover',
  growthTrend: {
    vocabularyGrowth: 2.5,
    accuracyImprovement: 0.25,
    flavorDiversityIndex: 0.7,
    consistencyScore: 0.85,
    weeklyProgress: 0.8,
  },
  recommendations: [
    '더 진한 초콜릿 향의 커피를 시도해보세요',
    '브라질 원두로 달콤함을 경험해보세요',
    '미디엄 로스트로 균형잡힌 맛을 찾아보세요',
  ],
  lastUpdated: new Date(),
});

export const getMockGrowthMetrics = (): GrowthMetrics => ({
  vocabularyGrowth: 2.5,
  accuracyImprovement: 0.25,
  flavorDiversityIndex: 0.7,
  consistencyScore: 0.85,
  weeklyProgress: 0.8,
});

export const getMockRecommendations = (): CoffeeRecommendation[] => [
  {
    coffeeName: 'Ethiopia Yirgacheffe',
    roastery: 'Blue Bottle Coffee',
    origin: 'Ethiopia',
    process: 'Washed',
    predictedMatch: 92,
    reason: 'Based on your love for fruity and floral notes',
    similarityScore: 0.92,
  },
  {
    coffeeName: 'Colombia Geisha',
    roastery: 'Stumptown Coffee',
    origin: 'Colombia',
    process: 'Natural',
    predictedMatch: 87,
    reason: 'Perfect balance of sweetness and acidity',
    similarityScore: 0.87,
  },
];

export const getMockPersonalInsights = (): PersonalInsights => ({
  strengths: [
    '초콜릿 향 식별에 뛰어남',
    '단맛 감지 능력이 우수함',
    '일관된 평가 기준을 가지고 있음',
  ],
  areasToExplore: [
    '플로럴 향을 더 탐험해보세요',
    '스파이시한 향신료 계열 커피 시도',
    '아프리카 원두로 과일향 경험',
  ],
  recentDiscoveries: [
    '이번 주에 카라멜 향을 새롭게 발견했습니다',
    '에티오피아 커피의 블루베리 향을 식별했습니다',
    '로스팅 정도에 따른 맛 변화를 인지했습니다',
  ],
  tastingTips: [
    '커피를 한 번 더 식혀서 마셔보세요',
    '첫 모금 후 30초 기다렸다가 다시 시도해보세요',
    '향을 맡을 때 깊게 숨을 들이마셔보세요',
  ],
});

export const getMockDailyInsight = (): DailyInsight => ({
  fact: '초콜릿 향은 로스팅 과정에서 메일라드 반응으로 생성됩니다',
  personalizedMessage: '당신은 초콜릿 향 식별에 뛰어나시네요! 이 능력을 더욱 발전시켜보세요.',
  suggestedAction: '오늘은 브라질 원두로 초콜릿 향의 미묘한 차이를 경험해보세요',
  relatedAchievement: 'chocolate_master',
});

export const getMockLearningPath = (): LearningPath => ({
  currentFocus: '초콜릿 향미 마스터하기',
  nextMilestone: '플로럴 향미 탐험가',
  estimatedTime: '2주',
  exercises: [
    {
      type: 'tasting',
      title: '브라질 원두 비교 테이스팅',
      description: '서로 다른 브라질 농장의 초콜릿 향 차이 식별하기',
      targetFlavor: 'chocolate',
      difficulty: 3,
    },
    {
      type: 'quiz',
      title: '초콜릿 향미 퀴즈',
      description: '다양한 초콜릿 향미를 구분하는 능력 테스트',
      difficulty: 2,
    },
    {
      type: 'exploration',
      title: '새로운 로스터 탐험',
      description: '초콜릿 향으로 유명한 새로운 로스터 커피 시도',
      difficulty: 1,
    },
  ],
});

export const getMockMasteryLevels = (): MasteryLevel[] => [
  {
    category: 'chocolate',
    level: 4,
    progress: 85,
    nextLevelThreshold: 100,
    achievements: ['초콜릿 마스터', '전문가 수준'],
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
    level: 3,
    progress: 65,
    nextLevelThreshold: 80,
    achievements: ['과일향 발견자'],
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
    level: 2,
    progress: 40,
    nextLevelThreshold: 60,
    achievements: ['꽃향기 탐지기'],
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

export const getMockTasteProfileType = (): TasteProfileType => 'traditionalist';