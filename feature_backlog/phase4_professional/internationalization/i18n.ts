import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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
      
      // Home Screen
      coffeeJournal: 'CupNote',
      hello: 'Hello, {{name}}!',
      howAboutCoffee: 'How about a nice cup of coffee today?',
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
      
      // Tasting
      tastingResults: 'Tasting Results',
      saveTasting: 'Save Tasting',
      tastingSaved: 'Tasting saved successfully!',
      
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
      
      // Home Screen
      coffeeJournal: '커피 저널',
      hello: '안녕하세요, {{name}}님!',
      howAboutCoffee: '오늘도 좋은 커피 한 잔 어떠세요?',
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
      
      // Tasting
      tastingResults: '테이스팅 결과',
      saveTasting: '테이스팅 저장',
      tastingSaved: '테이스팅이 성공적으로 저장되었습니다!',
      
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
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ko', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already does escaping
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;