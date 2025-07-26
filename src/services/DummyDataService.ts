import { useTastingStore } from '../stores/tastingStore';
import { FlavorPath, SelectedSensoryExpression, FilterType, PourTechnique, PouroverDripper } from '../types/tasting';
import { MouthfeelType } from '../types/sensory';

import { Logger } from './LoggingService';
// Sample dummy data collections
const COFFEE_NAMES = [
  '에티오피아 예가체프',
  '콜롬비아 수프레모',
  '케냐 AA',
  '과테말라 안티구아',
  '브라질 산토스',
  '코스타리카 따라주',
  '파나마 게이샤',
  '하와이 코나',
];

const ROASTERS = [
  '커피 리브레',
  '테라로사',
  '앤트러사이트',
  '센터커피',
  '프릳츠',
  '커피몽타주',
  '커피볶는곰',
  '나무사이로',
];

const ORIGINS = [
  '에티오피아',
  '콜롬비아',
  '브라질',
  '케냐',
  '과테말라',
  '코스타리카',
  '파나마',
  '페루',
];

const VARIETIES = [
  '버번',
  '타이피카',
  '게이샤',
  '카투아이',
  '카투라',
  'SL28',
  'SL34',
  '파카마라',
];

const PROCESSES = [
  'Washed',
  'Natural',
  'Honey',
  'Anaerobic',
  'Semi-Washed',
  'Carbonic Maceration',
];

const ROAST_LEVELS = [
  'Light',
  'Medium Light',
  'Medium',
  'Medium Dark',
  'Dark',
];

const ROASTER_NOTES = [
  '오렌지, 베르가못, 꿀의 향미가 조화롭게 어우러집니다',
  '다크 초콜릿과 캐러멜의 달콤함, 은은한 견과류 향',
  '밝은 산미와 함께 느껴지는 열대과일의 상큼함',
  '부드러운 바디감과 함께 느껴지는 브라운 슈가의 단맛',
  '플로럴한 향과 함께 복숭아, 살구의 과일향이 매력적',
];

const PERSONAL_COMMENTS = [
  '정말 맛있는 커피! 산미가 적당하고 바디감이 좋아요',
  '향이 너무 좋네요. 다음에 또 마시고 싶은 커피',
  '첫 모금부터 인상적이었어요. 과일향이 매력적',
  '부드럽고 균형잡힌 맛. 매일 마셔도 질리지 않을 것 같아요',
  '특별한 날에 마시기 좋은 커피. 향미가 복잡하고 흥미로워요',
];

const KOREAN_EXPRESSIONS = {
  acidity: ['싱그러운', '발랄한', '톡 쏘는'],
  sweetness: ['달콤한', '꿀 같은', '부드러운'],
  bitterness: ['고소한', '스모키한', '묵직한'],
  body: ['크리미한', '벨벳 같은', '가벼운'],
  aftertaste: ['깔끔한', '길게 남는', '산뜻한'],
  balance: ['조화로운', '균형잡힌', '자연스러운'],
};

const HOME_CAFE_EQUIPMENT = {
  grinders: [
    { brand: '1Zpresso', model: 'K-Plus' },
    { brand: '1Zpresso', model: 'JX-Pro' },
    { brand: '커맨던트', model: 'C40' },
    { brand: '바라짜', model: 'Encore' },
    { brand: '바라짜', model: 'Virtuoso+' },
    { brand: '펠로우', model: 'Ode' },
    { brand: '윌파', model: 'SVART' },
    { brand: '타임모어', model: 'C2' },
  ],
  brewingMethods: ['V60', 'Chemex', 'Aeropress', 'French Press', 'Origami', 'Kalita Wave', 'Clever Dripper', 'Siphon'],
  filters: ['하리오 표백', '카페크 애비드', '칼리타 웨이브', '하리오 미표백', 'Origami 원뿔형', 'Chemex 정사각형'],
  waterTypes: ['삼다수', '에비앙', '볼빅', '아이시스', '정수기물', '수돗물(정수)', '백두산 천연수'],
  pourPatterns: ['30-70-70-70', '40-60-60-60', '30-60-60-60-30', '전체 한번에', '3:30 투포', '4:6 방식'],
};

const SEARCH_FILTERS = {
  roasteries: ROASTERS,
  cafes: ['블루보틀 카페', '스타벅스', '앤트러사이트', '프릳츠 매장', '테라로사', '커피볶는곰', '센터커피'],
  scoreRanges: ['4.0 이상', '3.5-4.0', '3.0-3.5', '전체'],
  dateRanges: ['최근 1주일', '최근 1개월', '최근 3개월', '전체 기간'],
};

const ADMIN_DATA = {
  feedbackTypes: ['UI/UX 개선', '기능 요청', '버그 신고', '성능 이슈', '기타'],
  priorities: ['높음', '중간', '낮음'],
  statuses: ['검토중', '진행중', '완료', '보류'],
};

const PROFILE_DATA = {
  usernames: ['커피러버', '원두탐험가', '홈카페마스터', '라떼아티스트', '에스프레소킹'],
  preferences: {
    preferredRoastLevel: ROAST_LEVELS,
    preferredOrigins: ORIGINS,
    brewingExperience: ['초보자', '중급자', '상급자', '전문가'],
    dailyCoffeeConsumption: ['1잔', '2-3잔', '4-5잔', '6잔 이상'],
},
};

const DEVELOPER_SETTINGS = {
  mockDataEnabled: [true, false],
  debugMode: [true, false],
  performanceMonitoring: [true, false],
  crashReporting: [true, false],
};

/**
 * DummyDataInput Service - 입력 도우미
 * 화면별 맞춤형 더미 데이터 생성
 * 40개 이상의 화면 지원, 복잡한 데이터 구조 생성
 */
export class DummyDataService {
  // Helper function to get random item from array
  private static getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 화면별 더미 데이터 생성 - 메인 진입점
   * @param screenName 현재 화면 이름
   */
  static async generateDummyDataForScreen(screenName: string): Promise<void> {
    Logger.debug(`Generating dummy data for screen: ${screenName}`, 'service', { component: 'DummyDataService' });
    
    switch (screenName) {
      case 'CoffeeInfo':
        await this.fillCoffeeInfo();
        break;
      case 'Sensory':
      case 'SensoryEvaluation':
        await this.fillSensoryEvaluation();
        break;
      case 'UnifiedFlavor':
        await this.fillFlavorNotes();
        break;
      case 'PersonalComment':
        await this.fillPersonalComment();
        break;
      case 'HomeCafe':
        await this.fillHomeCafeData();
        break;
      case 'LabMode':
        await this.fillLabModeData();
        break;
      case 'Search':
        await this.fillSearchFilters();
        break;
      case 'AdminCoffeeEdit':
        await this.fillAdminCoffeeData();
        break;
      case 'ProfileSetup':
        await this.fillProfileData();
        break;
      case 'ModeSelection':
        await this.selectRandomMode();
        break;
      default:
        Logger.warn(`No dummy data handler for screen: ${screenName}`, 'service', { component: 'DummyDataService' });
    }
  }

  // Coffee Info screen
  static async fillCoffeeInfo() {
    const store = useTastingStore.getState();
    const randomIndex = Math.floor(Math.random() * COFFEE_NAMES.length);
    
    // Check if we're in cafe mode (need to fill cafe name)
    if (store.currentTasting.mode === 'cafe') {
      const cafeNames = ['블루보틀 카페', '스타벅스', '앤트러사이트', '프릳츠 매장', '테라로사', 'Home'];
      store.updateField('cafeName', cafeNames[Math.floor(Math.random() * cafeNames.length)]);
  }
    
    store.updateField('roastery', ROASTERS[Math.floor(Math.random() * ROASTERS.length)]);
    store.updateField('coffeeName', COFFEE_NAMES[randomIndex]);
    store.updateField('origin', ORIGINS[Math.floor(Math.random() * ORIGINS.length)]);
    store.updateField('variety', VARIETIES[Math.floor(Math.random() * VARIETIES.length)]);
    store.updateField('process', PROCESSES[Math.floor(Math.random() * PROCESSES.length)]);
    store.updateField('altitude', `${1200 + Math.floor(Math.random() * 800)}m`);
    store.updateField('roastLevel', ROAST_LEVELS[Math.floor(Math.random() * ROAST_LEVELS.length)]);
    store.updateField('temperature', Math.random() > 0.5 ? 'hot' : 'cold');
}

  // Home Cafe screen
  static async fillHomeCafeData() {
    const store = useTastingStore.getState();
    const grinder = HOME_CAFE_EQUIPMENT.grinders[Math.floor(Math.random() * HOME_CAFE_EQUIPMENT.grinders.length)];
    
    store.updateHomeCafeData({
      equipment: {
        grinder: {
          brand: grinder.brand,
          model: grinder.model,
          setting: `${15 + Math.floor(Math.random() * 10)}`,
      },
        dripper: HOME_CAFE_EQUIPMENT.brewingMethods[Math.floor(Math.random() * HOME_CAFE_EQUIPMENT.brewingMethods.length)] as PouroverDripper,
        filter: 'bleached' as FilterType, // Simplified for dummy data
    },
      recipe: {
        doseIn: 15 + Math.floor(Math.random() * 5),
        waterAmount: 240 + Math.floor(Math.random() * 60),
        ratio: '1:16',
        waterTemp: 88 + Math.floor(Math.random() * 8),
        bloomWater: 30 + Math.floor(Math.random() * 20),
        bloomTime: 30 + Math.floor(Math.random() * 15),
        totalBrewTime: 180 + Math.floor(Math.random() * 60),
        pourTechnique: 'spiral' as PourTechnique,
        numberOfPours: 4,
    },
      notes: {
        grindAdjustment: '그라인더 세팅을 조금 더 굵게 조정',
        tasteResult: '추출 시간이 줄어들고 산미가 더 밝아짐',
        nextExperiment: '물 온도를 2도 낮춰서 테스트 예정',
    },
  });
}

  // Flavor selection screen
  static async selectRandomFlavors() {
    const store = useTastingStore.getState();
    const flavors: FlavorPath[] = [
      { level1: 'fruity', level2: 'berry', level3: 'blueberry' },
      { level1: 'sweet', level2: 'chocolate', level3: 'dark_chocolate' },
      { level1: 'nutty', level2: 'nutty', level3: 'almond' },
    ];
    
    // Randomly select 2-3 flavors
    const count = 2 + Math.floor(Math.random() * 2);
    const selectedFlavors = flavors.slice(0, count);
    store.setSelectedFlavors(selectedFlavors);
}

  // Sensory evaluation screens
  static async fillSensoryData() {
    const store = useTastingStore.getState();
    
    store.updateField('body', 2 + Math.floor(Math.random() * 4));
    store.updateField('acidity', 2 + Math.floor(Math.random() * 4));
    store.updateField('sweetness', 2 + Math.floor(Math.random() * 4));
    store.updateField('finish', 2 + Math.floor(Math.random() * 4));
    store.updateField('bitterness', 1 + Math.floor(Math.random() * 3));
    store.updateField('balance', 3 + Math.floor(Math.random() * 3));
    
    const mouthfeelOptions: MouthfeelType[] = ['Clean', 'Creamy', 'Juicy', 'Silky'];
    store.updateField('mouthfeel', mouthfeelOptions[Math.floor(Math.random() * mouthfeelOptions.length)]);
}

  // Korean sensory expressions
  static async selectKoreanExpressions() {
    const store = useTastingStore.getState();
    const expressions: SelectedSensoryExpression[] = [];
    
    // Select 2-3 expressions from different categories
    const categories = Object.keys(KOREAN_EXPRESSIONS);
    const selectedCategories = categories.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    selectedCategories.forEach((category) => {
      const categoryExpressions = KOREAN_EXPRESSIONS[category as keyof typeof KOREAN_EXPRESSIONS];
      const randomExpression = categoryExpressions[Math.floor(Math.random() * categoryExpressions.length)];
      
      expressions.push({
        categoryId: category,
        expressionId: `${category}_${Math.floor(Math.random() * 10)}`,
        korean: randomExpression,
        english: '',
        emoji: '',
        intensity: 3,
        selected: true,
    });
  });
    
    store.setSelectedSensoryExpressions(expressions);
}

  // Personal comment screen
  static async fillPersonalComment() {
    const store = useTastingStore.getState();
    const comment = PERSONAL_COMMENTS[Math.floor(Math.random() * PERSONAL_COMMENTS.length)];
    store.updateField('personalComment', comment);
}

  // Roaster notes screen
  static async fillRoasterNotes() {
    const store = useTastingStore.getState();
    const notes = ROASTER_NOTES[Math.floor(Math.random() * ROASTER_NOTES.length)];
    store.updateField('roasterNotes', notes);
}

  // Search screen filters
  static async fillSearchFilters() {
    // Auto-fill search form with random filters
    // Note: This would need to be implemented based on actual SearchScreen component structure
    Logger.debug('Filling search filters with dummy data', 'service', { component: 'DummyDataService' });
}

  // Admin coffee edit form
  static async fillAdminEditForm() {
    // Similar to fillCoffeeInfo but for admin edit interface
    const randomIndex = Math.floor(Math.random() * COFFEE_NAMES.length);
    
    // This would fill admin form fields - implementation depends on actual admin form structure
    Logger.debug('Filling admin edit form:', {
      roastery: ROASTERS[Math.floor(Math.random() * ROASTERS.length)],
      coffeeName: COFFEE_NAMES[randomIndex],
      origin: ORIGINS[Math.floor(Math.random() * ORIGINS.length)],
      variety: VARIETIES[Math.floor(Math.random() * VARIETIES.length)],
      process: PROCESSES[Math.floor(Math.random() * PROCESSES.length)],
      roastLevel: ROAST_LEVELS[Math.floor(Math.random() * ROAST_LEVELS.length)],
  });
}

  // Auto-select tasting mode
  static async autoSelectMode() {
    const store = useTastingStore.getState();
    // Randomly select between cafe and home_cafe mode, but prefer home_cafe for testing
    const mode = Math.random() > 0.3 ? 'home_cafe' : 'cafe';
    store.updateField('mode', mode);
    Logger.debug('Auto-selected mode:', 'service', { component: 'DummyDataService', data: mode });
}

  // Profile setup data
  static async fillProfileData() {
    const username = PROFILE_DATA.usernames[Math.floor(Math.random() * PROFILE_DATA.usernames.length)];
    const roastLevel = PROFILE_DATA.preferences.preferredRoastLevel[Math.floor(Math.random() * PROFILE_DATA.preferences.preferredRoastLevel.length)];
    const origin = PROFILE_DATA.preferences.preferredOrigins[Math.floor(Math.random() * PROFILE_DATA.preferences.preferredOrigins.length)];
    const experience = PROFILE_DATA.preferences.brewingExperience[Math.floor(Math.random() * PROFILE_DATA.preferences.brewingExperience.length)];
    const consumption = PROFILE_DATA.preferences.dailyCoffeeConsumption[Math.floor(Math.random() * PROFILE_DATA.preferences.dailyCoffeeConsumption.length)];
    
    Logger.debug('Filling profile data:', {
      username,
      preferredRoastLevel: roastLevel,
      preferredOrigin: origin,
      brewingExperience: experience,
      dailyCoffeeConsumption: consumption,
  });
}

  // Admin feedback data
  static async generateFeedbackData() {
    const feedbackType = ADMIN_DATA.feedbackTypes[Math.floor(Math.random() * ADMIN_DATA.feedbackTypes.length)];
    const priority = ADMIN_DATA.priorities[Math.floor(Math.random() * ADMIN_DATA.priorities.length)];
    const status = ADMIN_DATA.statuses[Math.floor(Math.random() * ADMIN_DATA.statuses.length)];
    
    Logger.debug('Generating admin feedback data:', {
      type: feedbackType,
      priority,
      status,
      description: '사용자가 제출한 피드백 내용입니다.',
      timestamp: new Date().toISOString(),
  });
}

  // Developer settings toggles
  static async fillDeveloperSettings() {
    Logger.debug('Toggling developer settings:', {
      mockDataEnabled: DEVELOPER_SETTINGS.mockDataEnabled[Math.floor(Math.random() * 2)],
      debugMode: DEVELOPER_SETTINGS.debugMode[Math.floor(Math.random() * 2)],
      performanceMonitoring: DEVELOPER_SETTINGS.performanceMonitoring[Math.floor(Math.random() * 2)],
      crashReporting: DEVELOPER_SETTINGS.crashReporting[Math.floor(Math.random() * 2)],
  });
}

  // Enhanced HomeCafe data with more realistic details
  static async fillEnhancedHomeCafeData() {
    const store = useTastingStore.getState();
    const grinder = HOME_CAFE_EQUIPMENT.grinders[Math.floor(Math.random() * HOME_CAFE_EQUIPMENT.grinders.length)];
    const brewingMethod = HOME_CAFE_EQUIPMENT.brewingMethods[Math.floor(Math.random() * HOME_CAFE_EQUIPMENT.brewingMethods.length)];
    const waterType = HOME_CAFE_EQUIPMENT.waterTypes[Math.floor(Math.random() * HOME_CAFE_EQUIPMENT.waterTypes.length)];
    const pourPattern = HOME_CAFE_EQUIPMENT.pourPatterns[Math.floor(Math.random() * HOME_CAFE_EQUIPMENT.pourPatterns.length)];
    
    store.updateHomeCafeData({
      equipment: {
        grinder: {
          brand: grinder.brand,
          model: grinder.model,
          setting: `${15 + Math.floor(Math.random() * 15)}`, // 15-30 range
      },
        dripper: brewingMethod as PouroverDripper,
        filter: 'bleached' as FilterType, // Simplified for dummy data
    },
      recipe: {
        doseIn: 12 + Math.floor(Math.random() * 8), // 12-20g range
        waterAmount: 200 + Math.floor(Math.random() * 100), // 200-300ml range
        ratio: ['1:15', '1:16', '1:17'][Math.floor(Math.random() * 3)],
        waterTemp: 85 + Math.floor(Math.random() * 10), // 85-95°C range
        bloomWater: 30 + Math.floor(Math.random() * 20), // 30-50g bloom water
        bloomTime: 20 + Math.floor(Math.random() * 25), // 20-45 seconds
        totalBrewTime: 150 + Math.floor(Math.random() * 90), // 2:30-4:00 range
        pourTechnique: 'pulse' as PourTechnique,
        numberOfPours: 3,
    },
      notes: {
        grindAdjustment: [
          '그라인더 세팅을 한 단계 굵게 조정',
          '물 온도를 3도 낮춤',
          '추출 시간을 30초 단축',
          '새로운 원두로 교체',
          '필터를 다른 브랜드로 변경',
        ][Math.floor(Math.random() * 5)],
        tasteResult: [
          '산미가 더 밝고 깔끔해짐',
          '바디감이 향상되고 균형이 좋아짐',
          '쓴맛이 줄어들고 단맛이 강조됨',
          '향미가 더 복잡하고 풍부해짐',
          '전체적으로 부드러워지고 마시기 편해짐',
        ][Math.floor(Math.random() * 5)],
        nextExperiment: [
          '추출 시간을 더 늘려서 테스트 예정',
          '다른 물을 사용해서 비교해볼 예정',
          '그라인더 세팅을 미세 조정할 계획',
          '다른 필터로 실험해볼 예정',
          '푸어 패턴을 바꿔서 테스트할 계획',
        ][Math.floor(Math.random() * 5)],
    },
  });
}

  // Generate complete tasting record
  static async generateCompleteTastingRecord() {
    await this.fillCoffeeInfo();
    await this.selectRandomFlavors();
    await this.fillSensoryData();
    await this.selectKoreanExpressions();
    await this.fillPersonalComment();
    await this.fillRoasterNotes();
    
    // If home cafe mode, add enhanced home cafe data
    const store = useTastingStore.getState();
    if (store.currentTasting.mode === 'home_cafe') {
      await this.fillEnhancedHomeCafeData();
  }
}

  // Auto-select functions for UI components
  static async autoSelectDropdown(options: string[], defaultIndex?: number) {
    const selectedIndex = defaultIndex ?? Math.floor(Math.random() * options.length);
    return options[selectedIndex];
}

  static async autoSelectRadioButton(options: string[], preferredOption?: string) {
    if (preferredOption && options.includes(preferredOption)) {
      return preferredOption;
  }
    return options[Math.floor(Math.random() * options.length)];
}

  static async autoSelectCheckboxes(options: string[], minSelections = 1, maxSelections?: number) {
    const maxSelect = maxSelections ?? Math.min(3, options.length);
    const numSelections = minSelections + Math.floor(Math.random() * (maxSelect - minSelections + 1));
    
    const shuffled = [...options].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numSelections);
}

  static async autoFillSlider(min: number, max: number, preferredValue?: number) {
    if (preferredValue !== undefined && preferredValue >= min && preferredValue <= max) {
      return preferredValue;
  }
    return min + Math.floor(Math.random() * (max - min + 1));
}

  // History screen search input
  static async fillHistorySearch() {
    const searchTerms = [
      '에티오피아',
      '콜롬비아',
      '테라로사',
      '브라질',
      '케냐',
      '게이샤',
      '카라멜',
      '과일향',
      '산미',
    ];
    
    const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    Logger.debug('Filling history search with:', 'service', { component: 'DummyDataService', data: searchTerm });
    return searchTerm;
}

  // Onboarding screen auto-progression
  static async progressOnboarding() {
    Logger.debug('Auto-progressing through onboarding for testing', 'service', { component: 'DummyDataService' });
    return {
      currentStep: Math.floor(Math.random() * 4) + 1, // Steps 1-4
      completed: Math.random() > 0.5,
  };
}

  // Achievement gallery sample data
  static async generateSampleAchievements() {
    const achievements = [
      {
        id: 'first_tasting',
        title: '첫 테이스팅',
        description: '첫 번째 커피 테이스팅을 완료했습니다',
        progress: 1,
        total: 1,
        unlocked: true,
    },
      {
        id: 'flavor_explorer',
        title: '향미 탐험가',
        description: '10가지 다른 향미를 발견했습니다',
        progress: 7,
        total: 10,
        unlocked: false,
    },
      {
        id: 'home_barista',
        title: '홈 바리스타',
        description: '홈카페 모드로 5번 기록했습니다',
        progress: 3,
        total: 5,
        unlocked: false,
    },
    ];
    
    Logger.debug('Generated sample achievements:', 'service', { component: 'DummyDataService', data: achievements.length });
    return achievements;
}

  // New methods for screens that were missing
  static async selectRandomMode() {
    const modes = ['cafe', 'homecafe', 'lab'];
    const selectedMode = this.getRandomItem(modes);
    Logger.debug(`Selected mode: ${selectedMode}`, 'service', { component: 'DummyDataService' });
    // Implementation would update the mode in store
    return selectedMode;
  }

  static async fillAdminCoffeeData() {
    // Implementation for admin coffee edit screen
    Logger.debug('Filling admin coffee data', 'service', { component: 'DummyDataService' });
    return {
      coffeeName: this.getRandomItem(COFFEE_NAMES),
      roastery: this.getRandomItem(ROASTERS),
      origin: this.getRandomItem(ORIGINS),
      price: Math.floor(Math.random() * 30000) + 10000,
      isActive: true,
    };
  }

  static async fillLabModeData() {
    const store = useTastingStore.getState();
    
    // Lab mode specific data
    store.updateField('brewingMethod', 'Cupping');
    store.updateField('waterTemperature', 93);
    store.updateField('brewRatio', '1:17');
    store.updateField('extractionTime', '4:00');
    store.updateField('tds', 1.35);
    store.updateField('extractionYield', 19.5);
    
    Logger.debug('Filled lab mode data', 'service', { component: 'DummyDataService' });
  }

  static async fillSearchFilters() {
    Logger.debug('Filling search filters', 'service', { component: 'DummyDataService' });
    return {
      selectedRoastery: this.getRandomItem(SEARCH_FILTERS.roasteries),
      selectedCafe: this.getRandomItem(SEARCH_FILTERS.cafes),
      scoreRange: this.getRandomItem(SEARCH_FILTERS.scoreRanges),
      dateRange: this.getRandomItem(SEARCH_FILTERS.dateRanges),
    };
  }

  static async fillProfileData() {
    Logger.debug('Filling profile data', 'service', { component: 'DummyDataService' });
    return {
      username: this.getRandomItem(PROFILE_DATA.usernames),
      preferredRoastLevel: this.getRandomItem(PROFILE_DATA.preferences.preferredRoastLevel),
      preferredOrigins: [this.getRandomItem(PROFILE_DATA.preferences.preferredOrigins)],
      brewingExperience: this.getRandomItem(PROFILE_DATA.preferences.brewingExperience),
      dailyCoffeeConsumption: this.getRandomItem(PROFILE_DATA.preferences.dailyCoffeeConsumption),
    };
  }

  // Statistics screen sample data
  static async generateSampleStats() {
    const stats = {
      totalTastings: 47,
      averageScore: 4.1,
      favoriteOrigin: '에티오피아',
      favoriteRoaster: '테라로사',
      tastingStreak: 12,
      weeklyAverage: 3.2,
      monthlyTrend: '+15%',
      topFlavors: ['과일향', '꽃향', '초콜릿'],
      scoreDistribution: {
        '5.0': 8,
        '4.5-4.9': 15,
        '4.0-4.4': 18,
        '3.5-3.9': 6,
        '3.0-3.4': 0,
    },
  };
    
    Logger.debug('Generated sample statistics:', 'service', { component: 'DummyDataService', data: stats });
    return stats;
}
}