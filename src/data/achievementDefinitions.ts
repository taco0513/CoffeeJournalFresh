import { AchievementType, AchievementDefinition } from '../types/achievements';

// =============================================
// Achievement Definitions
// =============================================

export const ACHIEVEMENT_DEFINITIONS: Record<string, AchievementDefinition> = {
  // First Steps
  first_tasting: {
    type: 'first_tasting',
    title: '첫 한 모금',
    description: '첫 번째 커피 테이스팅을 완료하세요',
    icon: '',
    rarity: 'common',
    category: AchievementType.FIRST_STEPS,
    requirements: { type: 'tasting_count', value: 1 },
    rewards: { type: 'points', value: 10 },
},
  first_week: {
    type: 'first_week',
    title: '첫 주간 탐험가',
    description: '일주일 내 3가지 이상 다른 커피 시도',
    icon: '',
    rarity: 'common',
    category: AchievementType.FIRST_STEPS,
    requirements: { type: 'weekly_variety', value: 3 },
    rewards: { type: 'points', value: 50 },
},
  first_flavor_match: {
    type: 'first_flavor_match',
    title: '첫 향미 매치',
    description: '로스터 노트와 일치하는 향미를 찾으세요',
    icon: '',
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
    icon: '',
    rarity: 'common',
    category: AchievementType.FLAVOR_EXPLORER,
    requirements: { type: 'unique_flavors', value: 10 },
    rewards: { type: 'badge', value: 'flavor_explorer_bronze' },
},
  flavor_explorer_silver: {
    type: 'flavor_explorer_silver',
    title: '향미 탐험가 실버',
    description: '25가지 서로 다른 향미를 발견하세요',
    icon: '',
    rarity: 'rare',
    category: AchievementType.FLAVOR_EXPLORER,
    requirements: { type: 'unique_flavors', value: 25 },
    rewards: { type: 'badge', value: 'flavor_explorer_silver' },
},
  flavor_explorer_gold: {
    type: 'flavor_explorer_gold',
    title: '향미 탐험가 골드',
    description: '50가지 서로 다른 향미를 발견하세요',
    icon: '',
    rarity: 'epic',
    category: AchievementType.FLAVOR_EXPLORER,
    requirements: { type: 'unique_flavors', value: 50 },
    rewards: { type: 'badge', value: 'flavor_explorer_gold' },
},
  flavor_category_master: {
    type: 'flavor_category_master',
    title: '카테고리 마스터',
    description: '한 향미 카테고리의 모든 하위 향미를 발견하세요',
    icon: '',
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
    icon: '',
    rarity: 'common',
    category: AchievementType.TASTE_ACCURACY,
    requirements: { type: 'quiz_accuracy', value: 0.7 },
    rewards: { type: 'title', value: 'Taste Novice' },
},
  taste_expert: {
    type: 'taste_expert',
    title: '미각 전문가',
    description: '향미 퀴즈에서 85% 이상 정확도 달성',
    icon: '',
    rarity: 'rare',
    category: AchievementType.TASTE_ACCURACY,
    requirements: { type: 'quiz_accuracy', value: 0.85 },
    rewards: { type: 'title', value: 'Taste Expert' },
},
  taste_master: {
    type: 'taste_master',
    title: '미각 마스터',
    description: '향미 퀴즈에서 95% 이상 정확도 달성',
    icon: '',
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
    icon: '',
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
    icon: '',
    rarity: 'rare',
    category: AchievementType.CONSISTENCY,
    requirements: { type: 'monthly_quality', value: 10 },
    rewards: { type: 'points', value: 200 },
},
  hundred_tastings: {
    type: 'hundred_tastings',
    title: '백 잔의 커피',
    description: '총 100잔의 커피를 테이스팅하세요',
    icon: '',
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
    icon: '',
    rarity: 'common',
    category: AchievementType.VOCABULARY,
    requirements: { type: 'unique_words', value: 50 },
    rewards: { type: 'points', value: 75 },
},
  vocabulary_virtuoso: {
    type: 'vocabulary_virtuoso',
    title: '어휘 거장',
    description: '100개의 다른 향미 단어 사용',
    icon: '',
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
    icon: '',
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
    icon: '',
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
    icon: '',
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
    icon: '',
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
    icon: '',
    rarity: 'rare',
    category: AchievementType.COFFEE_EXPLORER,
    requirements: { type: 'coffee_discovery', value: 1 },
    rewards: { type: 'title', value: 'Coffee Discoverer' },
},
  coffee_discoverer_5: {
    type: 'coffee_discoverer_5',
    title: '커피 탐험가 Lv.2',
    description: '새로운 커피 5개를 등록했습니다',
    icon: '',
    rarity: 'epic',
    category: AchievementType.COFFEE_EXPLORER,
    requirements: { type: 'coffee_discovery', value: 5 },
    rewards: { type: 'title', value: 'Coffee Explorer' },
},
  coffee_discoverer_10: {
    type: 'coffee_discoverer_10',
    title: '커피 탐험가 Lv.3',
    description: '새로운 커피 10개를 등록했습니다',
    icon: '',
    rarity: 'legendary',
    category: AchievementType.COFFEE_EXPLORER,
    requirements: { type: 'coffee_discovery', value: 10 },
    rewards: { type: 'title', value: 'Coffee Pioneer' },
},

  // Home Cafe Achievements
  home_cafe_starter: {
    type: 'home_cafe_starter',
    title: '홈카페 입문자',
    description: '첫 홈카페 기록을 완성하세요',
    icon: '',
    rarity: 'common',
    category: AchievementType.FIRST_STEPS,
    requirements: { 
      type: 'home_cafe_tasting', 
      value: 1 
  },
    rewards: { type: 'points', value: 20 },
},
  home_barista: {
    type: 'home_barista',
    title: '꾸준한 바리스타',
    description: '홈카페로 7일 연속 기록하기',
    icon: '',
    rarity: 'rare',
    category: AchievementType.CONSISTENCY,
    requirements: { 
      type: 'home_cafe_streak', 
      value: 7 
  },
    rewards: { type: 'badge', value: 'home_barista' },
},
  recipe_experimenter: {
    type: 'recipe_experimenter',
    title: '실험가',
    description: '같은 원두로 5번 다른 레시피 시도',
    icon: '',
    rarity: 'rare',
    category: AchievementType.HIDDEN,
    requirements: { 
      type: 'recipe_variations', 
      value: 5 
  },
    rewards: { type: 'title', value: 'Recipe Experimenter' },
},
  brewing_method_explorer: {
    type: 'brewing_method_explorer',
    title: '학습자',
    description: '3가지 이상 추출 방법 사용하기',
    icon: '',
    rarity: 'common',
    category: AchievementType.FLAVOR_EXPLORER,
    requirements: { 
      type: 'brewing_methods', 
      value: 3 
  },
    rewards: { type: 'points', value: 50 },
},
  perfect_brew: {
    type: 'perfect_brew',
    title: '정확한 손맛',
    description: '동일 레시피로 3회 연속 90% 이상 점수',
    icon: '',
    rarity: 'epic',
    category: AchievementType.TASTE_ACCURACY,
    requirements: { 
      type: 'consistent_recipe', 
      value: 3,
      additionalConditions: { minScore: 90 }
  },
    rewards: { type: 'title', value: 'Perfect Brewer' },
},
  home_cafe_master: {
    type: 'home_cafe_master',
    title: '홈카페 마스터',
    description: '모든 홈카페 기본 뱃지 획득',
    icon: '',
    rarity: 'legendary',
    category: AchievementType.HIDDEN,
    requirements: { 
      type: 'home_cafe_badges', 
      value: 5 
  },
    rewards: { 
      type: 'title', 
      value: 'Home Cafe Master',
      additionalRewards: [{ type: 'points', value: 500 }]
  },
},
};