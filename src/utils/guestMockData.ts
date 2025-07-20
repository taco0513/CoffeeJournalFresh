import { ITastingRecord } from '@/services/realm/schemas';

export const generateGuestMockData = (): ITastingRecord[] => {
  const baseDate = new Date();
  
  return [
    {
      id: 'guest-mock-1',
      userId: 'guest',
      cafeName: 'Blue Bottle Coffee 성수',
      roastery: 'Blue Bottle Coffee',
      coffeeName: 'Three Africas',
      origin: 'Ethiopia, Uganda, Kenya',
      variety: 'Blend',
      process: 'Various',
      altitude: '1,500-2,200m',
      temperature: 'hot',
      roasterNotes: JSON.stringify({
        notes: ['Blueberry', 'Chocolate', 'Wine'],
        description: '세 가지 아프리카 커피의 조화로운 블렌드'
      }),
      matchScoreTotal: 85,
      matchScoreFlavorNotes: 40,
      matchScoreSensoryAttributes: 45,
      flavorNotes: [
        { level: 1, value: 'Fruit', koreanValue: '과일' },
        { level: 2, value: 'Berry', koreanValue: '베리류' },
        { level: 3, value: 'Blueberry', koreanValue: '블루베리' },
        { level: 1, value: 'Chocolate', koreanValue: '초콜릿' },
      ],
      sensoryAttributes: {
        body: 4,
        acidity: 4,
        sweetness: 3,
        finish: 4,
        mouthfeel: ['Clean', 'Juicy']
      },
      notes: '균형 잡힌 맛과 풍부한 과일향이 인상적입니다.',
      isDeleted: false,
      createdAt: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000), // 1일 전
      updatedAt: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000),
      syncStatus: 'synced',
      realmId: 'guest-realm-1',
    },
    {
      id: 'guest-mock-2',
      userId: 'guest',
      cafeName: '프릳츠 커피 도산',
      roastery: 'Fritz Coffee Company',
      coffeeName: 'Colombia Geisha',
      origin: 'Colombia',
      variety: 'Geisha',
      process: 'Washed',
      altitude: '1,800m',
      temperature: 'hot',
      roasterNotes: JSON.stringify({
        notes: ['Jasmine', 'Peach', 'Honey'],
        description: '화려한 플로럴 향과 복숭아 같은 달콤함'
      }),
      matchScoreTotal: 92,
      matchScoreFlavorNotes: 45,
      matchScoreSensoryAttributes: 47,
      flavorNotes: [
        { level: 1, value: 'Floral', koreanValue: '꽃' },
        { level: 2, value: 'Jasmine', koreanValue: '자스민' },
        { level: 1, value: 'Fruit', koreanValue: '과일' },
        { level: 2, value: 'Stone Fruit', koreanValue: '핵과류' },
        { level: 3, value: 'Peach', koreanValue: '복숭아' },
      ],
      sensoryAttributes: {
        body: 3,
        acidity: 5,
        sweetness: 5,
        finish: 5,
        mouthfeel: ['Silky', 'Clean']
      },
      notes: '게이샤 특유의 화려함이 잘 표현된 커피입니다.',
      isDeleted: false,
      createdAt: new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000), // 3일 전
      updatedAt: new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000),
      syncStatus: 'synced',
      realmId: 'guest-realm-2',
    },
    {
      id: 'guest-mock-3',
      userId: 'guest',
      cafeName: '센터커피 연남',
      roastery: 'Center Coffee',
      coffeeName: 'Ethiopia Guji Natural',
      origin: 'Ethiopia',
      variety: 'Heirloom',
      process: 'Natural',
      altitude: '2,000-2,200m',
      temperature: 'ice',
      roasterNotes: JSON.stringify({
        notes: ['Strawberry', 'Tropical Fruit', 'Wine'],
        description: '딸기잼과 열대과일의 풍성한 향미'
      }),
      matchScoreTotal: 88,
      matchScoreFlavorNotes: 42,
      matchScoreSensoryAttributes: 46,
      flavorNotes: [
        { level: 1, value: 'Fruit', koreanValue: '과일' },
        { level: 2, value: 'Berry', koreanValue: '베리류' },
        { level: 3, value: 'Strawberry', koreanValue: '딸기' },
        { level: 2, value: 'Tropical', koreanValue: '열대과일' },
      ],
      sensoryAttributes: {
        body: 4,
        acidity: 3,
        sweetness: 5,
        finish: 4,
        mouthfeel: ['Juicy', 'Creamy']
      },
      notes: '아이스로 마셔도 풍미가 풍부하고 달콤합니다.',
      isDeleted: false,
      createdAt: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000), // 5일 전
      updatedAt: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000),
      syncStatus: 'synced',
      realmId: 'guest-realm-3',
    },
    {
      id: 'guest-mock-4',
      userId: 'guest',
      cafeName: '모모스 커피',
      roastery: 'Momos Coffee',
      coffeeName: 'Kenya AA Nyeri',
      origin: 'Kenya',
      variety: 'SL28, SL34',
      process: 'Washed',
      altitude: '1,700-1,800m',
      temperature: 'hot',
      roasterNotes: JSON.stringify({
        notes: ['Black Currant', 'Tomato', 'Brown Sugar'],
        description: '케냐 특유의 블랙커런트와 토마토 산미'
      }),
      matchScoreTotal: 90,
      matchScoreFlavorNotes: 43,
      matchScoreSensoryAttributes: 47,
      flavorNotes: [
        { level: 1, value: 'Fruit', koreanValue: '과일' },
        { level: 2, value: 'Berry', koreanValue: '베리류' },
        { level: 3, value: 'Black Currant', koreanValue: '블랙커런트' },
        { level: 1, value: 'Savory', koreanValue: '세이보리' },
        { level: 2, value: 'Tomato', koreanValue: '토마토' },
      ],
      sensoryAttributes: {
        body: 5,
        acidity: 5,
        sweetness: 3,
        finish: 5,
        mouthfeel: ['Clean', 'Juicy']
      },
      notes: '강렬한 산미와 복합적인 맛이 매력적입니다.',
      isDeleted: false,
      createdAt: new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7일 전
      updatedAt: new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000),
      syncStatus: 'synced',
      realmId: 'guest-realm-4',
    },
    {
      id: 'guest-mock-5',
      userId: 'guest',
      cafeName: '테라로사 커피',
      roastery: 'Terarosa Coffee',
      coffeeName: 'Guatemala Finca El Injerto',
      origin: 'Guatemala',
      variety: 'Bourbon',
      process: 'Washed',
      altitude: '1,500-2,000m',
      temperature: 'hot',
      roasterNotes: JSON.stringify({
        notes: ['Orange', 'Chocolate', 'Caramel'],
        description: '오렌지의 산미와 초콜릿의 달콤함'
      }),
      matchScoreTotal: 87,
      matchScoreFlavorNotes: 41,
      matchScoreSensoryAttributes: 46,
      flavorNotes: [
        { level: 1, value: 'Fruit', koreanValue: '과일' },
        { level: 2, value: 'Citrus', koreanValue: '시트러스' },
        { level: 3, value: 'Orange', koreanValue: '오렌지' },
        { level: 1, value: 'Chocolate', koreanValue: '초콜릿' },
        { level: 1, value: 'Sugar', koreanValue: '당류' },
        { level: 2, value: 'Caramel', koreanValue: '캐러멜' },
      ],
      sensoryAttributes: {
        body: 4,
        acidity: 4,
        sweetness: 4,
        finish: 4,
        mouthfeel: ['Clean', 'Creamy']
      },
      notes: '균형잡힌 맛과 부드러운 마우스필이 좋습니다.',
      isDeleted: false,
      createdAt: new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000), // 10일 전
      updatedAt: new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000),
      syncStatus: 'synced',
      realmId: 'guest-realm-5',
    },
  ];
};

// 게스트 모드 통계 생성
export const generateGuestStats = () => {
  const mockData = generateGuestMockData();
  const avgScore = mockData.reduce((sum, t) => sum + t.matchScoreTotal, 0) / mockData.length;
  const bestScore = Math.max(...mockData.map(t => t.matchScoreTotal));
  
  return {
    totalTastings: mockData.length,
    thisWeekTastings: 3, // 최근 7일 내 기록
    avgScore: Math.round(avgScore),
    bestScore: bestScore,
  };
};