import { DummyDataService } from './DummyDataService';

import { Logger } from './LoggingService';
/**
 * AutoSelectService - Provides auto-selection functions for UI components
 * Used by FloatingDummyDataButton to automatically select options in dropdowns,
 * radio buttons, checkboxes, and other form elements
 */
export class AutoSelectService {
  
  // Auto-select dropdown/picker options
  static async selectDropdownOption(elementId: string, options: string[], preferredIndex?: number): Promise<string> {
    const selected = await DummyDataService.autoSelectDropdown(options, preferredIndex);
    Logger.debug(`🎯 Auto-selected dropdown ${elementId}:`, 'service', { component: 'AutoSelectService', data: selected });
    return selected;
}

  // Auto-select radio button options
  static async selectRadioOption(groupName: string, options: string[], preferred?: string): Promise<string> {
    const selected = await DummyDataService.autoSelectRadioButton(options, preferred);
    Logger.debug(`🎯 Auto-selected radio ${groupName}:`, 'service', { component: 'AutoSelectService', data: selected });
    return selected;
}

  // Auto-select multiple checkbox options
  static async selectCheckboxOptions(groupName: string, options: string[], min = 1, max?: number): Promise<string[]> {
    const selected = await DummyDataService.autoSelectCheckboxes(options, min, max);
    Logger.debug(`🎯 Auto-selected checkboxes ${groupName}:`, 'service', { component: 'AutoSelectService', data: selected });
    return selected;
}

  // Auto-set slider value
  static async setSliderValue(sliderId: string, min: number, max: number, preferred?: number): Promise<number> {
    const value = await DummyDataService.autoFillSlider(min, max, preferred);
    Logger.debug(`🎯 Auto-set slider ${sliderId}:`, 'service', { component: 'AutoSelectService', data: value });
    return value;
}

  // Screen-specific auto-selection functions
  
  // CoffeeInfo Screen auto-selections
  static async autoCoffeeInfoSelections() {
    const selections = {
      roastLevel: await this.selectDropdownOption('roastLevel', ['Light', 'Medium Light', 'Medium', 'Medium Dark', 'Dark']),
      temperature: await this.selectRadioOption('temperature', ['hot', 'cold'], 'hot'),
      processingMethod: await this.selectDropdownOption('process', ['Washed', 'Natural', 'Honey', 'Anaerobic']),
  };
    
    Logger.debug('☕ Auto-filled CoffeeInfo selections:', 'service', { component: 'AutoSelectService', data: selections });
    return selections;
}

  // HomeCafe Screen auto-selections  
  static async autoHomeCafeSelections() {
    const selections = {
      brewingMethod: await this.selectDropdownOption('brewingMethod', ['V60', 'Chemex', 'Aeropress', 'French Press', 'Origami']),
      grinder: await this.selectDropdownOption('grinder', ['1Zpresso K-Plus', 'Comandante C40', 'Baratza Encore', 'Fellow Ode']),
      filter: await this.selectDropdownOption('filter', ['하리오 표백', '카페크 애비드', '칼리타 웨이브', '하리오 미표백']),
      waterTemp: await this.setSliderValue('waterTemp', 85, 95, 92),
      grindSetting: await this.setSliderValue('grindSetting', 15, 30, 20),
  };
    
    Logger.debug('🏠 Auto-filled HomeCafe selections:', 'service', { component: 'AutoSelectService', data: selections });
    return selections;
}

  // Sensory Screen auto-selections
  static async autoSensorySelections() {
    const selections = {
      acidity: await this.setSliderValue('acidity', 1, 5, 3),
      sweetness: await this.setSliderValue('sweetness', 1, 5, 4),
      body: await this.setSliderValue('body', 1, 5, 3),
      finish: await this.setSliderValue('finish', 1, 5, 4),
      balance: await this.setSliderValue('balance', 1, 5, 4),
      mouthfeel: await this.selectRadioOption('mouthfeel', ['Clean', 'Creamy', 'Juicy', 'Silky'], 'Creamy'),
  };
    
    Logger.debug('👅 Auto-filled Sensory selections:', 'service', { component: 'AutoSelectService', data: selections });
    return selections;
}

  // Korean Sensory Expressions auto-selections
  static async autoKoreanSensorySelections() {
    const categories = ['acidity', 'sweetness', 'bitterness', 'body', 'aftertaste', 'balance'];
    const selections: { [key: string]: string[] } = {};
    
    // Select 2-3 expressions from different categories
    const selectedCategories = categories.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    for (const category of selectedCategories) {
      const expressions = {
        acidity: ['싱그러운', '발랄한', '톡 쏘는', '상큼한', '청량한'],
        sweetness: ['달콤한', '꿀 같은', '부드러운', '농밀한', '캐러멜 같은'],
        bitterness: ['고소한', '스모키한', '묵직한', '카카오 같은', '허브 느낌의'],
        body: ['크리미한', '벨벳 같은', '가벼운', '묵직한', '실키한'],
        aftertaste: ['깔끔한', '길게 남는', '산뜻한', '여운이 긴', '마무리가 좋은'],
        balance: ['조화로운', '균형잡힌', '자연스러운', '완성도 높은', '안정적인'],
    };
      
      selections[category] = await this.selectCheckboxOptions(
        `korean_${category}`, 
        expressions[category as keyof typeof expressions] || [],
        1, 
        3
      );
  }
    
    Logger.debug('🇰🇷 Auto-selected Korean expressions:', 'service', { component: 'AutoSelectService', data: selections });
    return selections;
}

  // Search Screen auto-selections
  static async autoSearchSelections() {
    const selections = {
      roastery: await this.selectDropdownOption('roastery_filter', ['전체', '테라로사', '앤트러사이트', '프릳츠', '커피리브레']),
      origin: await this.selectCheckboxOptions('origin_filter', ['에티오피아', '콜롬비아', '브라질', '케냐', '과테말라'], 0, 3),
      roastLevel: await this.selectCheckboxOptions('roast_filter', ['Light', 'Medium Light', 'Medium', 'Medium Dark'], 0, 2),
      scoreRange: await this.selectRadioOption('score_range', ['전체', '4.0 이상', '3.5-4.0', '3.0-3.5'], '4.0 이상'),
      dateRange: await this.selectRadioOption('date_range', ['전체 기간', '최근 1주일', '최근 1개월', '최근 3개월'], '최근 1개월'),
  };
    
    Logger.debug('🔍 Auto-filled Search selections:', 'service', { component: 'AutoSelectService', data: selections });
    return selections;
}

  // Profile Setup auto-selections
  static async autoProfileSelections() {
    const selections = {
      brewingExperience: await this.selectRadioOption('experience', ['초보자', '중급자', '상급자', '전문가'], '중급자'),
      preferredRoastLevel: await this.selectCheckboxOptions('preferred_roast', ['Light', 'Medium Light', 'Medium', 'Medium Dark'], 1, 2),
      preferredOrigins: await this.selectCheckboxOptions('preferred_origins', ['에티오피아', '콜롬비아', '브라질', '케냐'], 1, 3),
      dailyConsumption: await this.selectRadioOption('consumption', ['1잔', '2-3잔', '4-5잔', '6잔 이상'], '2-3잔'),
      notifications: await this.selectCheckboxOptions('notifications', ['새 커피 알림', '성취 알림', '주간 리포트', '추천 알림'], 0, 3),
  };
    
    Logger.debug('👤 Auto-filled Profile selections:', 'service', { component: 'AutoSelectService', data: selections });
    return selections;
}

  // Admin screens auto-selections
  static async autoAdminSelections() {
    const selections = {
      feedbackPriority: await this.selectRadioOption('priority', ['높음', '중간', '낮음'], '중간'),
      feedbackStatus: await this.selectDropdownOption('status', ['검토중', '진행중', '완료', '보류']),
      feedbackType: await this.selectDropdownOption('type', ['UI/UX 개선', '기능 요청', '버그 신고', '성능 이슈', '기타']),
      assignee: await this.selectDropdownOption('assignee', ['개발팀', '디자인팀', '운영팀', '미할당']),
  };
    
    Logger.debug('⚙️ Auto-filled Admin selections:', 'service', { component: 'AutoSelectService', data: selections });
    return selections;
}

  // Developer settings auto-selections
  static async autoDeveloperSelections() {
    const selections = {
      mockDataEnabled: await this.selectRadioOption('mock_data', ['true', 'false'], 'true'),
      debugMode: await this.selectRadioOption('debug_mode', ['true', 'false'], 'true'),
      performanceMonitoring: await this.selectRadioOption('perf_monitoring', ['true', 'false'], 'false'),
      crashReporting: await this.selectRadioOption('crash_reporting', ['true', 'false'], 'true'),
      logLevel: await this.selectDropdownOption('log_level', ['debug', 'info', 'warn', 'error'], 1), // info
  };
    
    Logger.debug('🛠️ Auto-filled Developer selections:', 'service', { component: 'AutoSelectService', data: selections });
    return selections;
}

  // History screen auto-selections
  static async autoHistorySelections() {
    const selections = {
      searchTerm: await DummyDataService.fillHistorySearch(),
      sortBy: await this.selectDropdownOption('sort_history', ['최신순', '평점순', '날짜순', '이름순'], 0),
      filterBy: await this.selectRadioOption('filter_history', ['전체', '최근 1주일', '최근 1개월', '즐겨찾기'], '전체'),
  };
    
    Logger.debug('🕒 Auto-filled History selections:', 'service', { component: 'AutoSelectService', data: selections });
    return selections;
}

  // Onboarding auto-selections
  static async autoOnboardingSelections() {
    const selections = {
      progression: await DummyDataService.progressOnboarding(),
      skipToEnd: Math.random() > 0.7, // 30% chance to skip to end
  };
    
    Logger.debug('👋 Auto-filled Onboarding selections:', 'service', { component: 'AutoSelectService', data: selections });
    return selections;
}

  // Achievement gallery auto-selections
  static async autoAchievementSelections() {
    const selections = {
      sampleAchievements: await DummyDataService.generateSampleAchievements(),
      filterUnlocked: await this.selectRadioOption('achievement_filter', ['전체', '잠금해제', '미완료'], '전체'),
      sortBy: await this.selectDropdownOption('achievement_sort', ['진행률순', '이름순', '잠금해제순'], 0),
  };
    
    Logger.debug('🏆 Auto-filled Achievement selections:', 'service', { component: 'AutoSelectService', data: selections });
    return selections;
}

  // Statistics screen auto-selections
  static async autoStatsSelections() {
    const selections = {
      sampleStats: await DummyDataService.generateSampleStats(),
      timeRange: await this.selectRadioOption('stats_time', ['전체', '최근 1개월', '최근 3개월', '최근 1년'], '최근 1개월'),
      chartType: await this.selectDropdownOption('chart_type', ['막대그래프', '선그래프', '원그래프'], 0),
  };
    
    Logger.debug('📊 Auto-filled Stats selections:', 'service', { component: 'AutoSelectService', data: selections });
    return selections;
}

  // Universal auto-selection for any screen
  static async autoSelectForScreen(screenName: string) {
    try {
      switch (screenName) {
        case 'CoffeeInfo':
          return await this.autoCoffeeInfoSelections();
        case 'HomeCafe':
          return await this.autoHomeCafeSelections();
        case 'Sensory':
        case 'ExperimentalData':
          return await this.autoSensorySelections();
        case 'SensoryEvaluation':
          return await this.autoKoreanSensorySelections();
        case 'Search':
          return await this.autoSearchSelections();
        case 'ProfileSetup':
          return await this.autoProfileSelections();
        case 'AdminFeedback':
        case 'AdminCoffeeEdit':
          return await this.autoAdminSelections();
        case 'Developer':
          return await this.autoDeveloperSelections();
        case 'History':
          return await this.autoHistorySelections();
        case 'Onboarding':
          return await this.autoOnboardingSelections();
        case 'AchievementGallery':
          return await this.autoAchievementSelections();
        case 'Stats':
          return await this.autoStatsSelections();
        default:
          Logger.debug(`ℹ️ No specific auto-selections available for ${screenName}`, 'service', { component: 'AutoSelectService' });
          return null;
    }
  } catch (error) {
      Logger.error(`❌ Error auto-selecting for ${screenName}:`, 'service', { component: 'AutoSelectService', error: error });
      return null;
  }
}
}