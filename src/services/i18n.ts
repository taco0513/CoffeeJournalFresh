import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { performanceMonitor } from './PerformanceMonitor';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      home: 'Home',
      journal: 'Journal',
      stats: 'Stats',
      profile: 'Profile',
      
      // Common
      save: 'Save',
      cancel: 'Cancel',
      next: 'Next',
      back: 'Back',
      search: 'Search',
      skip: 'Skip',
      complete: 'Complete',
      
      // Home Screen
      coffeeJournal: 'CupNote',
      hello: 'Hello, {{name}}!',
      howAboutCoffee: 'Discover your unique coffee taste profile',
      totalTastings: 'Total Tastings',
      thisWeek: 'This Week',
      avgScore: 'Avg Score',
      bestScore: 'Best Score',
      startNewTasting: '☕ Start New Tasting',
      recentRecords: 'Recent Records',
      seeAll: 'See All',
      noTastingsYet: 'Start your first tasting!',
      noTastingsSubtext: 'Press the button above to evaluate a new coffee',
      
      // Coffee Info
      coffeeInfo: 'Coffee Info',
      coffeeName: 'Coffee Name',
      roastery: 'Roastery',
      origin: 'Origin',
      brewMethod: 'Brew Method',
      required: 'Required',
      temperature: 'Temperature',
      roastLevel: 'Roast Level',
      variety: 'Variety',
      process: 'Process',
      altitude: 'Altitude',
      roasterNotes: 'Roaster Notes',
      
      // Mode Selection
      selectMode: 'Select Mode',
      cafeMode: 'Cafe Mode',
      cafeModeDesc: 'For coffee shop visits',
      homeCafeMode: 'Home Cafe Mode',
      homeCafeModeDesc: 'For home brewing',
      labMode: 'Lab Mode',
      labModeDesc: 'For detailed analysis',
      
      // Tasting
      tastingResults: 'Tasting Results',
      saveTasting: 'Save Tasting',
      tastingSaved: 'Tasting saved successfully!',
      tastingComplete: 'Tasting Complete!',
      matchScore: 'Match Score',
      sensoryEvaluation: 'Sensory Evaluation',
      flavorNotes: 'Flavor Notes',
      personalNotes: 'Personal Notes',
      
      // Sensory
      body: 'Body',
      acidity: 'Acidity',
      sweetness: 'Sweetness',
      finish: 'Finish',
      bitterness: 'Bitterness',
      balance: 'Balance',
      mouthfeel: 'Mouthfeel',
      
      // History
      tastingHistory: 'Tasting History',
      
      // Stats
      statistics: 'Statistics',
      exportData: 'Export Data',
      
      // Profile
      settings: 'Settings',
      language: 'Language',
      
      // Errors
      fillRequiredFields: 'Please fill in all required fields',
      error: 'Error',
      success: 'Success',
      
      // Beta
      betaMarket: 'US Beta Market',
      betaWelcome: 'Welcome to CupNote US Beta!',
      betaFeedback: 'Share your feedback to help us improve',
    },
  },
  ko: {
    translation: {
      // Navigation
      home: '홈',
      journal: '기록',
      stats: '통계',
      profile: '프로필',
      
      // Common
      save: '저장',
      cancel: '취소',
      next: '다음',
      back: '뒤로',
      search: '검색',
      skip: '건너뛰기',
      complete: '완료',
      
      // Home Screen
      coffeeJournal: '컵노트',
      hello: '안녕하세요, {{name}}님!',
      howAboutCoffee: '나만의 커피 취향을 발견하는 가장 쉬운 방법',
      totalTastings: '총 테이스팅',
      thisWeek: '이번 주',
      avgScore: '평균 점수',
      bestScore: '최고 점수',
      startNewTasting: '☕ 새 테이스팅 시작',
      recentRecords: '최근 기록',
      seeAll: '전체 보기',
      noTastingsYet: '첫 테이스팅을 시작해보세요!',
      noTastingsSubtext: '위의 버튼을 눌러 새로운 커피를 평가해보세요',
      
      // Coffee Info
      coffeeInfo: '커피 정보',
      coffeeName: '커피 이름',
      roastery: '로스터리',
      origin: '원산지',
      brewMethod: '추출 방법',
      required: '필수',
      temperature: '온도',
      roastLevel: '로스팅 정도',
      variety: '품종',
      process: '가공법',
      altitude: '고도',
      roasterNotes: '로스터 노트',
      
      // Mode Selection
      selectMode: '모드 선택',
      cafeMode: '카페 모드',
      cafeModeDesc: '카페 방문 시',
      homeCafeMode: '홈카페 모드',
      homeCafeModeDesc: '집에서 내릴 때',
      labMode: '랩 모드',
      labModeDesc: '상세 분석용',
      
      // Tasting
      tastingResults: '테이스팅 결과',
      saveTasting: '테이스팅 저장',
      tastingSaved: '테이스팅이 성공적으로 저장되었습니다!',
      tastingComplete: '테이스팅 완료!',
      matchScore: '일치도',
      sensoryEvaluation: '감각 평가',
      flavorNotes: '향미 노트',
      personalNotes: '개인 노트',
      
      // Sensory
      body: '바디감',
      acidity: '산미',
      sweetness: '단맛',
      finish: '여운',
      bitterness: '쓴맛',
      balance: '균형감',
      mouthfeel: '입안 느낌',
      
      // History
      tastingHistory: '테이스팅 기록',
      
      // Stats
      statistics: '통계',
      exportData: '데이터 내보내기',
      
      // Profile
      settings: '설정',
      language: '언어',
      
      // Errors
      fillRequiredFields: '모든 필수 항목을 입력해주세요',
      error: '오류',
      success: '성공',
      
      // Beta
      betaMarket: '한국 시장',
      betaWelcome: '컵노트에 오신 것을 환영합니다!',
      betaFeedback: '피드백을 공유해서 저희가 개선할 수 있도록 도와주세요',
    },
  },
};

const LANGUAGE_STORAGE_KEY = '@app_language';
const DEFAULT_LANGUAGE = 'ko';

/**
 * Get device language with Korean market priority
 */
const getDeviceLanguage = (): 'ko' | 'en' => {
  try {
    const locales = RNLocalize.getLocales();
    if (locales.length > 0) {
      const deviceLanguage = locales[0].languageCode;
      // Korean market gets Korean by default, others get English
      return deviceLanguage === 'ko' ? 'ko' : 'en';
    }
  } catch (error) {
    console.warn('Failed to get device language:', error);
  }
  return DEFAULT_LANGUAGE;
};

/**
 * Determine if this is Korean market based on device locale
 */
export const isKoreanMarket = (): boolean => {
  try {
    const locales = RNLocalize.getLocales();
    if (locales.length > 0) {
      const countryCode = locales[0].countryCode;
      const languageCode = locales[0].languageCode;
      // Korean market: Korea + Korean language
      return countryCode === 'KR' || languageCode === 'ko';
    }
  } catch (error) {
    console.warn('Failed to detect market:', error);
  }
  return true; // Default to Korean market
};

/**
 * Initialize i18n system
 */
const initializeI18n = async (): Promise<void> => {
  const timingId = performanceMonitor.startTiming('i18n_initialization');
  
  try {
    // Try to load saved language
    let savedLanguage: string | null = null;
    try {
      savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to load saved language:', error);
    }
    
    // Determine initial language
    const initialLanguage = savedLanguage || getDeviceLanguage();
    
    await i18n
      .use(initReactI18next)
      .init({
        resources,
        lng: initialLanguage,
        fallbackLng: 'en',
        debug: __DEV__,
        
        interpolation: {
          escapeValue: false,
        },
        
        react: {
          useSuspense: false,
        },
      });
    
    performanceMonitor.endTiming(timingId, 'i18n_initialization_success', {
      language: initialLanguage,
      isKoreanMarket: isKoreanMarket(),
      hasStoredLanguage: !!savedLanguage,
    });
  } catch (error) {
    performanceMonitor.endTiming(timingId, 'i18n_initialization_error');
    performanceMonitor.reportError(error as Error, 'i18n_initialization', 'high');
    throw error;
  }
};

/**
 * Change language and persist to storage
 */
export const changeLanguage = async (language: 'ko' | 'en'): Promise<void> => {
  const timingId = performanceMonitor.startTiming('language_change');
  
  try {
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    
    performanceMonitor.endTiming(timingId, 'language_change_success', {
      newLanguage: language,
      previousLanguage: i18n.language,
    });
  } catch (error) {
    performanceMonitor.endTiming(timingId, 'language_change_error');
    performanceMonitor.reportError(error as Error, 'language_change', 'medium');
    throw error;
  }
};

/**
 * Get current language
 */
export const getCurrentLanguage = (): 'ko' | 'en' => {
  return (i18n.language || DEFAULT_LANGUAGE) as 'ko' | 'en';
};

/**
 * Check if current language is Korean
 */
export const isKorean = (): boolean => {
  return getCurrentLanguage() === 'ko';
};

/**
 * Get market-specific configuration
 */
export const getMarketConfig = () => {
  const isKorean = isKoreanMarket();
  
  return {
    isKorean,
    language: isKorean ? 'ko' : 'en',
    currency: isKorean ? 'KRW' : 'USD',
    dateFormat: isKorean ? 'YYYY.MM.DD' : 'MM/DD/YYYY',
    marketName: isKorean ? 'Korean Market' : 'US Beta Market',
    flagEmoji: isKorean ? '🇰🇷' : '🇺🇸',
    supportedRoasters: isKorean 
      ? ['Coffee Libre', 'Anthracite', 'Terarosa', 'Momos Coffee']
      : ['Blue Bottle', 'Stumptown', 'Counter Culture', 'Intelligentsia'],
  };
};

/**
 * Get beta testing configuration
 */
export const getBetaConfig = () => {
  const isKorean = isKoreanMarket();
  
  return {
    isBeta: !isKorean, // US market is beta
    betaVersion: '1.0.0-beta',
    feedbackEnabled: true,
    analyticsEnabled: true,
    debugMode: __DEV__,
    maxBetaUsers: isKorean ? 1000 : 500, // Korean: 1000, US: 500
    features: {
      homeCafeMode: true,
      labMode: isKorean, // Lab mode only for Korean market initially
      marketIntelligence: true,
      achievements: true,
      socialFeatures: false, // Disabled for beta
    },
  };
};

// Initialize i18n system
initializeI18n().catch(error => {
  console.error('Failed to initialize i18n:', error);
});

export default i18n;