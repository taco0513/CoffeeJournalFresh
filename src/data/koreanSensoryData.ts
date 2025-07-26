/**
 * Korean Coffee Sensory Expressions Data
 * Enhanced sensory evaluation system for Korean coffee beginners
 * 
 * Data structure combines traditional sensory attributes with
 * culturally appropriate Korean expressions and beginner-friendly UI
 */

export interface SensoryExpression {
  id: string;
  korean: string;
  english: string;
  intensity: 1 | 2 | 3; // 1: Mild, 2: Medium, 3: Strong
  emoji: string;
  beginner: boolean; // true if suitable for beginners
  description?: string;
}

export interface SensoryCategory {
  id: string;
  nameKo: string;
  nameEn: string;
  emoji: string;
  color: string;
  description: string;
  expressions: SensoryExpression[];
  scaleLabels: {
    low: { ko: string; en: string };
    high: { ko: string; en: string };
};
}

export const koreanSensoryData: Record<string, SensoryCategory> = {
  acidity: {
    id: 'acidity',
    nameKo: '산미',
    nameEn: 'Acidity',
    emoji: '',
    color: '#FFA726',
    description: '커피의 밝고 상쾌한 신맛 정도',
    scaleLabels: {
      low: { ko: '부드러운', en: 'Mild' },
      high: { ko: '생동감 있는', en: 'Vibrant' }
  },
    expressions: [
      {
        id: 'fresh',
        korean: '싱그러운',
        english: 'Fresh',
        intensity: 1,
        emoji: '',
        beginner: true,
        description: '상쾌하고 깨끗한 느낌'
    },
      {
        id: 'lively',
        korean: '발랄한',
        english: 'Lively',
        intensity: 2,
        emoji: '',
        beginner: true,
        description: '생기 넘치고 활기찬 느낌'
    },
      {
        id: 'tangy',
        korean: '톡 쏘는',
        english: 'Tangy',
        intensity: 3,
        emoji: '',
        beginner: true,
        description: '혀끝을 자극하는 강한 신맛'
    },
      {
        id: 'refreshing',
        korean: '청량한',
        english: 'Refreshing',
        intensity: 1,
        emoji: '',
        beginner: true,
        description: '시원하고 상쾌한 느낌'
    },
      {
        id: 'juicy',
        korean: '쥬시한',
        english: 'Juicy',
        intensity: 2,
        emoji: '',
        beginner: true,
        description: '과즙이 풍부한 듯한 느낌'
    },
      {
        id: 'zesty',
        korean: '상큼한',
        english: 'Zesty',
        intensity: 2,
        emoji: '',
        beginner: true,
        description: '활기차고 상큼한 느낌'
    },
      {
        id: 'fruity',
        korean: '과즙 같은',
        english: 'Fruit-like',
        intensity: 2,
        emoji: '',
        beginner: false,
        description: '과일 주스와 같은 풍부한 산미'
    },
      {
        id: 'vibrant',
        korean: '생동감 있는',
        english: 'Vibrant',
        intensity: 3,
        emoji: '',
        beginner: false,
        description: '강렬하고 살아있는 듯한 산미'
    },
      {
        id: 'bursting',
        korean: '터질 듯한 과일 맛',
        english: 'Bursting with fruit',
        intensity: 3,
        emoji: '',
        beginner: false,
        description: '과일이 입안에서 터지는 듯한 강한 산미'
    }
    ]
},

  sweetness: {
    id: 'sweetness',
    nameKo: '단맛',
    nameEn: 'Sweetness',
    emoji: '',
    color: '#FFC107',
    description: '커피에서 느껴지는 단맛의 정도와 특성',
    scaleLabels: {
      low: { ko: '은은한', en: 'Subtle' },
      high: { ko: '농밀한', en: 'Rich' }
  },
    expressions: [
      {
        id: 'rich',
        korean: '농밀한',
        english: 'Rich',
        intensity: 3,
        emoji: '',
        beginner: true,
        description: '진하고 깊은 단맛'
    },
      {
        id: 'sweet',
        korean: '달콤한',
        english: 'Sweet',
        intensity: 2,
        emoji: '',
        beginner: true,
        description: '부드럽고 달콤한 맛'
    },
      {
        id: 'honey',
        korean: '꿀 같은',
        english: 'Honey-like',
        intensity: 2,
        emoji: '',
        beginner: true,
        description: '꿀처럼 자연스럽고 부드러운 단맛'
    },
      {
        id: 'syrup',
        korean: '시럽 같은',
        english: 'Syrup-like',
        intensity: 3,
        emoji: '',
        beginner: false,
        description: '시럽처럼 끈적하고 진한 단맛'
    },
      {
        id: 'candy',
        korean: '사탕 같은',
        english: 'Candy-like',
        intensity: 2,
        emoji: '',
        beginner: true,
        description: '사탕처럼 달콤한 맛'
    },
      {
        id: 'concentrated',
        korean: '농축된',
        english: 'Concentrated',
        intensity: 3,
        emoji: '',
        beginner: false,
        description: '집중되고 응축된 단맛'
    },
      {
        id: 'heavy',
        korean: '묵직한',
        english: 'Heavy',
        intensity: 3,
        emoji: '',
        beginner: false,
        description: '무게감 있는 깊은 단맛'
    }
    ]
},

  bitterness: {
    id: 'bitterness',
    nameKo: '쓴맛',
    nameEn: 'Bitterness',
    emoji: '',
    color: '#795548',
    description: '커피 특유의 쓴맛과 그 특성',
    scaleLabels: {
      low: { ko: '부드러운', en: 'Mild' },
      high: { ko: '강렬한', en: 'Intense' }
  },
    expressions: [
      {
        id: 'smoky',
        korean: '스모키한',
        english: 'Smoky',
        intensity: 3,
        emoji: '',
        beginner: true,
        description: '연기 향이 나는 쓴맛'
    },
      {
        id: 'cocoa',
        korean: '카카오 같은',
        english: 'Cocoa-like',
        intensity: 2,
        emoji: '',
        beginner: true,
        description: '코코아처럼 부드러운 쓴맛'
    },
      {
        id: 'herbal',
        korean: '허브 느낌의',
        english: 'Herbal',
        intensity: 2,
        emoji: '',
        beginner: false,
        description: '허브 같은 자연스러운 쓴맛'
    },
      {
        id: 'medicinal',
        korean: '약초 같은',
        english: 'Medicinal herbs',
        intensity: 2,
        emoji: '',
        beginner: false,
        description: '약초처럼 건강한 쓴맛'
    },
      {
        id: 'bitter',
        korean: '씁쓸한',
        english: 'Bitter',
        intensity: 3,
        emoji: '',
        beginner: true,
        description: '전형적인 쓴맛'
    },
      {
        id: 'toasty',
        korean: '토스티한',
        english: 'Toasty',
        intensity: 2,
        emoji: '',
        beginner: true,
        description: '구운 빵처럼 고소한 쓴맛'
    }
    ]
},

  body: {
    id: 'body',
    nameKo: '바디',
    nameEn: 'Body',
    emoji: '',
    color: '#8D6E63',
    description: '입안에서 느껴지는 커피의 무게감과 질감',
    scaleLabels: {
      low: { ko: '가벼운', en: 'Light' },
      high: { ko: '풍부한', en: 'Full' }
  },
    expressions: [
      {
        id: 'creamy',
        korean: '크리미한',
        english: 'Creamy',
        intensity: 3,
        emoji: '',
        beginner: true,
        description: '크림처럼 부드럽고 진한 질감'
    },
      {
        id: 'velvety',
        korean: '벨벳 같은',
        english: 'Velvety',
        intensity: 3,
        emoji: '',
        beginner: false,
        description: '벨벳처럼 매끄럽고 부드러운 질감'
    },
      {
        id: 'heavy',
        korean: '묵직한',
        english: 'Heavy',
        intensity: 3,
        emoji: '',
        beginner: true,
        description: '무게감 있고 진한 바디감'
    },
      {
        id: 'full',
        korean: '무거운',
        english: 'Full',
        intensity: 3,
        emoji: '',
        beginner: true,
        description: '가득 찬 듯한 풍부한 바디감'
    },
      {
        id: 'silky',
        korean: '실키한',
        english: 'Silky',
        intensity: 2,
        emoji: '',
        beginner: false,
        description: '실크처럼 매끄러운 질감'
    },
      {
        id: 'oily',
        korean: '오일리한',
        english: 'Oily',
        intensity: 2,
        emoji: '',
        beginner: false,
        description: '기름진 듯한 질감'
    },
      {
        id: 'juicy',
        korean: '쥬시한',
        english: 'Juicy',
        intensity: 2,
        emoji: '',
        beginner: true,
        description: '과즙이 풍부한 듯한 바디감'
    },
      {
        id: 'fullMouth',
        korean: '입안 가득한',
        english: 'Mouth-filling',
        intensity: 3,
        emoji: '',
        beginner: true,
        description: '입안을 가득 채우는 풍부한 바디감'
    },
      {
        id: 'moist',
        korean: '촉촉한',
        english: 'Moist',
        intensity: 1,
        emoji: '',
        beginner: true,
        description: '촉촉하고 부드러운 질감'
    },
      {
        id: 'watery',
        korean: '물기 있는',
        english: 'Watery',
        intensity: 1,
        emoji: '',
        beginner: true,
        description: '가볍고 물처럼 맑은 질감'
    }
    ]
},

  aftertaste: {
    id: 'aftertaste',
    nameKo: '애프터',
    nameEn: 'Aftertaste',
    emoji: '',
    color: '#9C27B0',
    description: '커피를 삼킨 후 남는 여운과 지속성',
    scaleLabels: {
      low: { ko: '깔끔한', en: 'Clean' },
      high: { ko: '오래 남는', en: 'Lingering' }
  },
    expressions: [
      {
        id: 'clean',
        korean: '깔끔한',
        english: 'Clean',
        intensity: 1,
        emoji: '',
        beginner: true,
        description: '깔끔하고 뒷맛이 좋은'
    },
      {
        id: 'lingering',
        korean: '길게 남는',
        english: 'Lingering',
        intensity: 3,
        emoji: '',
        beginner: true,
        description: '오랫동안 지속되는 여운'
    },
      {
        id: 'fresh',
        korean: '산뜻한',
        english: 'Fresh',
        intensity: 1,
        emoji: '',
        beginner: true,
        description: '산뜻하고 상쾌한 뒷맛'
    },
      {
        id: 'hovering',
        korean: '입안 맴도는',
        english: 'Hovering',
        intensity: 2,
        emoji: '',
        beginner: false,
        description: '입안에서 맴도는 듯한 여운'
    },
      {
        id: 'clear',
        korean: '깨끗한',
        english: 'Clear',
        intensity: 1,
        emoji: '',
        beginner: true,
        description: '깨끗하고 명료한 뒷맛'
    },
      {
        id: 'sweetAfter',
        korean: '달콤한 여운',
        english: 'Sweet finish',
        intensity: 2,
        emoji: '',
        beginner: true,
        description: '달콤하게 마무리되는 여운'
    },
      {
        id: 'gentle',
        korean: '잔잔한',
        english: 'Gentle',
        intensity: 1,
        emoji: '',
        beginner: true,
        description: '잔잔하고 부드러운 여운'
    },
      {
        id: 'refreshing',
        korean: '상쾌한',
        english: 'Refreshing',
        intensity: 1,
        emoji: '',
        beginner: true,
        description: '상쾌하고 시원한 뒷맛'
    }
    ]
},

  balance: {
    id: 'balance',
    nameKo: '밸런스',
    nameEn: 'Balance',
    emoji: '',
    color: '#607D8B',
    description: '커피 맛의 조화와 균형감',
    scaleLabels: {
      low: { ko: '불균형', en: 'Unbalanced' },
      high: { ko: '완벽한 조화', en: 'Perfect harmony' }
  },
    expressions: [
      {
        id: 'harmonious',
        korean: '조화로운',
        english: 'Harmonious',
        intensity: 3,
        emoji: '',
        beginner: true,
        description: '모든 맛이 잘 어우러진'
    },
      {
        id: 'smooth',
        korean: '부드러운',
        english: 'Smooth',
        intensity: 2,
        emoji: '',
        beginner: true,
        description: '거슬리지 않고 부드러운'
    },
      {
        id: 'natural',
        korean: '자연스러운',
        english: 'Natural',
        intensity: 2,
        emoji: '',
        beginner: true,
        description: '인위적이지 않은 자연스러운 맛'
    },
      {
        id: 'wellRounded',
        korean: '원만한',
        english: 'Well-rounded',
        intensity: 3,
        emoji: '',
        beginner: false,
        description: '모난 곳 없이 둥글게 완성된 맛'
    },
      {
        id: 'balanced',
        korean: '균형 잡힌',
        english: 'Balanced',
        intensity: 3,
        emoji: '',
        beginner: true,
        description: '완벽하게 균형 잡힌 맛'
    },
      {
        id: 'connected',
        korean: '부드럽게 연결된',
        english: 'Smoothly connected',
        intensity: 2,
        emoji: '',
        beginner: false,
        description: '각 맛 요소가 부드럽게 이어지는'
    }
    ]
}
};

// Helper functions for UI components
export const getSensoryExpressionsByCategory = (categoryId: string, beginnerMode: boolean = true) => {
  const category = koreanSensoryData[categoryId];
  if (!category) return [];
  
  if (beginnerMode) {
    return category.expressions.filter(expr => expr.beginner);
}
  return category.expressions;
};

export const getSensoryCategories = () => {
  return Object.values(koreanSensoryData);
};

export const getCategoryById = (categoryId: string) => {
  return koreanSensoryData[categoryId];
};

// Star rating conversion helpers
export const intensityToStars = (intensity: 1 | 2 | 3): number => {
  return intensity + 2; // 1->3, 2->4, 3->5 stars
};

export const starsToIntensity = (stars: number): 1 | 2 | 3 => {
  if (stars <= 3) return 1;
  if (stars <= 4) return 2;
  return 3;
};