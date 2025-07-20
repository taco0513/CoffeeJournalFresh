import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { HIGConstants, HIGColors } from '../styles/common';
import { useDevStore } from '../stores/useDevStore';
import { useUserStore } from '../stores/useUserStore';
import { useFeedbackStore } from '../stores/useFeedbackStore';
import RealmService from '../services/realm/RealmService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenshotService } from '../services/ScreenshotService';

// Category Icons
const CategoryIcons = {
  user: '👤',
  debug: '🐛',
  test: '🧪',
  feature: '⚡',
  beta: '🚀',
  login: '🔑',
  data: '💾',
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DeveloperScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const { currentUser, setTestUser, setGuestMode } = useUserStore();
  const { showFeedback, enableShakeToFeedback, toggleShakeToFeedback, isBetaUser, setBetaStatus } = useFeedbackStore();
  const {
    isDeveloperMode,
    showDebugInfo,
    enableNetworkLogs,
    enableRealmLogs,
    showPerformanceMetrics,
    enableMockData,
    forceGuestMode,
    skipAnimations,
    bypassLogin,
    enableExperimentalFeatures,
    enableBetaFeatures,
    toggleDeveloperMode,
    setDebugInfo,
    setNetworkLogs,
    setRealmLogs,
    setPerformanceMetrics,
    setMockData,
    setForceGuestMode,
    setSkipAnimations,
    setBypassLogin,
    setExperimentalFeatures,
    setBetaFeatures,
    resetAllSettings,
  } = useDevStore();

  const handleClearStorage = () => {
    Alert.alert(
      '저장소 삭제',
      '모든 앱 데이터(설정, 캐시 등)를 삭제하시겠습니까?\n앱이 재시작됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('완료', '저장소가 삭제되었습니다. 앱을 재시작해주세요.');
            } catch (error) {
              Alert.alert('오류', '저장소 삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleClearRealmData = () => {
    Alert.alert(
      'Realm 데이터 삭제',
      '모든 테이스팅 기록을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const realmService = RealmService.getInstance();
              if (realmService.isInitialized) {
                const realm = realmService.getRealm();
                realm.write(() => {
                  realm.deleteAll();
                });
                Alert.alert('완료', 'Realm 데이터가 삭제되었습니다.');
              }
            } catch (error) {
              Alert.alert('오류', 'Realm 데이터 삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  // Screenshot functions
  const handleViewScreenshots = async () => {
    const screenshots = await ScreenshotService.getSavedScreenshots();
    Alert.alert(
      '저장된 스크린샷',
      screenshots.length > 0 
        ? `${screenshots.length}개의 스크린샷이 있습니다.\n\n최근 파일:\n${screenshots.slice(0, 3).map(path => path.split('/').pop()).join('\n')}`
        : '저장된 스크린샷이 없습니다.',
      [{ text: '확인' }]
    );
  };

  const handleClearScreenshots = () => {
    Alert.alert(
      '스크린샷 삭제',
      '모든 저장된 스크린샷을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            const success = await ScreenshotService.clearAllScreenshots();
            Alert.alert(
              success ? '완료' : '오류',
              success ? '모든 스크린샷이 삭제되었습니다.' : '스크린샷 삭제 중 오류가 발생했습니다.'
            );
          }
        }
      ]
    );
  };

  const handleScreenshotGuide = () => {
    Alert.alert(
      '스크린샷 가이드',
      '앱 스크린들을 이미지로 저장하는 방법:\n\n1. iOS 시뮬레이터 사용:\n   Device > Screenshot 메뉴\n\n2. 실제 기기:\n   홈+전원 버튼 동시 누름\n\n3. 자동 스크린샷 (개발 중):\n   각 화면에 스크린샷 기능 추가 예정\n\n저장된 스크린샷은 사진 앱에서 확인할 수 있습니다.',
      [{ text: '확인' }]
    );
  };

  const handleAddSimpleTest = () => {
    Alert.alert(
      '간단한 테스트',
      '1개의 간단한 테이스팅 데이터를 추가하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '추가',
          onPress: async () => {
            try {
              const realmService = RealmService.getInstance();
              
              if (!realmService.isInitialized) {
                await realmService.initialize();
              }
              
              const simpleData = {
                coffeeInfo: {
                  cafeName: 'Test Cafe',
                  roastery: 'Test Roaster',
                  coffeeName: 'Test Coffee',
                  origin: 'Test Origin',
                  variety: 'Test Variety',
                  process: 'Washed',
                  altitude: '1000m',
                  temperature: 'hot' as const
                },
                roasterNotes: 'Simple test notes',
                selectedFlavors: [
                  { level: 1, value: 'Fruity', koreanValue: '과일향' }
                ],
                sensoryAttributes: {
                  body: 3,
                  acidity: 3,
                  sweetness: 3,
                  finish: 3,
                  mouthfeel: 'Clean'
                },
                matchScore: { total: 85, flavorScore: 40, sensoryScore: 45 }
              };
              
              console.log('🧪 Saving simple test data...');
              const savedRecord = await realmService.saveTasting(simpleData);
              console.log('✅ Simple test saved with ID:', savedRecord.id);
              
              const allRecords = realmService.getTastingRecords({ isDeleted: false });
              console.log('🔍 Total records after simple test:', allRecords.length);
              
              Alert.alert('완료', `간단한 테스트 데이터가 저장되었습니다.\n\nID: ${savedRecord.id}\n전체 기록: ${allRecords.length}개`);
            } catch (error) {
              console.error('❌ Simple test failed:', error);
              Alert.alert('오류', `테스트 데이터 저장 실패: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  const handleAddQuickTest = () => {
    Alert.alert(
      '빠른 테스트',
      '5개의 간단한 테이스팅 데이터를 추가하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '추가',
          onPress: async () => {
            try {
              const realmService = RealmService.getInstance();
              
              if (!realmService.isInitialized) {
                await realmService.initialize();
              }
              
              const quickTestData = [
                {
                  coffeeInfo: {
                    cafeName: 'Blue Bottle Coffee 삼청점',
                    roastery: 'Blue Bottle Coffee',
                    coffeeName: 'Three Africas',
                    origin: 'Ethiopia',
                    variety: 'Heirloom',
                    process: 'Washed',
                    altitude: '1800m',
                    temperature: 'hot' as const
                  },
                  roasterNotes: 'Bright and clean with floral notes',
                  selectedFlavors: [
                    { level: 1, value: 'Fruity', koreanValue: '과일향' },
                    { level: 2, value: 'Citrus Fruit', koreanValue: '감귤류' }
                  ],
                  sensoryAttributes: {
                    body: 3,
                    acidity: 4,
                    sweetness: 3,
                    finish: 4,
                    mouthfeel: 'Clean'
                  },
                  matchScore: { total: 89, flavorScore: 43, sensoryScore: 46 }
                },
                {
                  coffeeInfo: {
                    cafeName: 'Fritz Coffee 성수점',
                    roastery: 'Fritz Coffee',
                    coffeeName: 'Colombia Geisha',
                    origin: 'Colombia',
                    variety: 'Geisha',
                    process: 'Honey',
                    altitude: '1600m',
                    temperature: 'hot' as const
                  },
                  roasterNotes: 'Complex tropical fruit notes',
                  selectedFlavors: [
                    { level: 1, value: 'Fruity', koreanValue: '과일향' },
                    { level: 2, value: 'Other Fruit', koreanValue: '기타 과일' }
                  ],
                  sensoryAttributes: {
                    body: 4,
                    acidity: 5,
                    sweetness: 4,
                    finish: 5,
                    mouthfeel: 'Juicy'
                  },
                  matchScore: { total: 92, flavorScore: 47, sensoryScore: 45 }
                },
                {
                  coffeeInfo: {
                    cafeName: 'Anthracite 한남점',
                    roastery: 'Anthracite',
                    coffeeName: 'Brazil Santos',
                    origin: 'Brazil',
                    variety: 'Catuai',
                    process: 'Natural',
                    altitude: '1200m',
                    temperature: 'ice' as const
                  },
                  roasterNotes: 'Rich chocolate and nuts',
                  selectedFlavors: [
                    { level: 1, value: 'Chocolate', koreanValue: '초콜릿' },
                    { level: 2, value: 'Dark Chocolate', koreanValue: '다크 초콜릿' }
                  ],
                  sensoryAttributes: {
                    body: 5,
                    acidity: 2,
                    sweetness: 4,
                    finish: 3,
                    mouthfeel: 'Creamy'
                  },
                  matchScore: { total: 85, flavorScore: 40, sensoryScore: 45 }
                },
                {
                  coffeeInfo: {
                    cafeName: 'Terarosa 강남점',
                    roastery: 'Terarosa',
                    coffeeName: 'Guatemala Antigua',
                    origin: 'Guatemala',
                    variety: 'Bourbon',
                    process: 'Washed',
                    altitude: '1500m',
                    temperature: 'hot' as const
                  },
                  roasterNotes: 'Balanced chocolate and spice',
                  selectedFlavors: [
                    { level: 1, value: 'Chocolate', koreanValue: '초콜릿' },
                    { level: 1, value: 'Spices', koreanValue: '향신료' }
                  ],
                  sensoryAttributes: {
                    body: 4,
                    acidity: 3,
                    sweetness: 4,
                    finish: 4,
                    mouthfeel: 'Silky'
                  },
                  matchScore: { total: 86, flavorScore: 41, sensoryScore: 45 }
                },
                {
                  coffeeInfo: {
                    cafeName: 'Starbucks 강남점',
                    roastery: 'Starbucks',
                    coffeeName: 'Pike Place',
                    origin: 'Latin America',
                    variety: 'Various',
                    process: 'Washed',
                    altitude: '1200m',
                    temperature: 'hot' as const
                  },
                  roasterNotes: 'Smooth and balanced',
                  selectedFlavors: [
                    { level: 1, value: 'Chocolate', koreanValue: '초콜릿' },
                    { level: 1, value: 'Nutty/Cocoa', koreanValue: '견과류/코코아' }
                  ],
                  sensoryAttributes: {
                    body: 3,
                    acidity: 2,
                    sweetness: 3,
                    finish: 3,
                    mouthfeel: 'Smooth'
                  },
                  matchScore: { total: 78, flavorScore: 38, sensoryScore: 40 }
                }
              ];
              
              console.log('⚡ Saving quick test data...');
              let savedCount = 0;
              
              for (const testItem of quickTestData) {
                try {
                  await realmService.saveTasting(testItem);
                  savedCount++;
                  console.log(`✅ Saved ${savedCount}/${quickTestData.length}`);
                } catch (error) {
                  console.error(`❌ Failed to save item ${savedCount + 1}:`, error);
                }
              }
              
              const allRecords = realmService.getTastingRecords({ isDeleted: false });
              console.log('🔍 Total records after quick test:', allRecords.length);
              
              Alert.alert('완료', `빠른 테스트 데이터 ${savedCount}개가 저장되었습니다.\n\n전체 기록: ${allRecords.length}개\n\nJournal 탭에서 확인해보세요!`);
            } catch (error) {
              console.error('❌ Quick test failed:', error);
              Alert.alert('오류', `테스트 데이터 저장 실패: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  const handleAddTestData = () => {
    Alert.alert(
      '테스트 데이터 추가',
      '샘플 테이스팅 데이터를 추가하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '추가',
          onPress: async () => {
            try {
              const realmService = RealmService.getInstance();
              
              // Realm이 초기화되지 않았으면 초기화
              if (!realmService.isInitialized) {
                console.log('🔧 Initializing Realm...');
                await realmService.initialize();
                console.log('✅ Realm initialized');
              } else {
                console.log('✅ Realm already initialized');
              }
              
              const testTastings = [
                {
                  coffeeInfo: {
                    cafeName: 'Blue Bottle Coffee 삼청점',
                    roastery: 'Blue Bottle Coffee',
                    coffeeName: 'Three Africas',
                    origin: 'Ethiopia / Yirgacheffe',
                    variety: 'Heirloom',
                    process: 'Washed',
                    altitude: '1,800-2,000m',
                    temperature: 'hot' as const
                  },
                  roasterNotes: 'Bright and clean with floral notes, hints of lemon and bergamot.',
                  selectedFlavors: [
                    { level: 1, value: 'Fruity', koreanValue: '과일향' },
                    { level: 2, value: 'Citrus Fruit', koreanValue: '감귤류' },
                    { level: 3, value: 'Lemon', koreanValue: '레몬' }
                  ],
                  sensoryAttributes: {
                    body: 3,
                    acidity: 4,
                    sweetness: 3,
                    finish: 4,
                    mouthfeel: 'Clean'
                  },
                  matchScore: { total: 89, flavorScore: 43, sensoryScore: 46 }
                },
                {
                  coffeeInfo: {
                    cafeName: 'Fritz Coffee Company 성수점',
                    roastery: 'Fritz Coffee Company',
                    coffeeName: 'Colombia Geisha',
                    origin: 'Colombia / Huila',
                    variety: 'Geisha',
                    process: 'Honey',
                    altitude: '1,600-1,800m',
                    temperature: 'hot' as const
                  },
                  roasterNotes: 'Complex and elegant with tropical fruit notes and wine-like acidity.',
                  selectedFlavors: [
                    { level: 1, value: 'Fruity', koreanValue: '과일향' },
                    { level: 2, value: 'Other Fruit', koreanValue: '기타 과일' },
                    { level: 3, value: 'Mango', koreanValue: '망고' }
                  ],
                  sensoryAttributes: {
                    body: 4,
                    acidity: 5,
                    sweetness: 4,
                    finish: 5,
                    mouthfeel: 'Juicy'
                  },
                  matchScore: { total: 92, flavorScore: 47, sensoryScore: 45 }
                },
                {
                  coffeeInfo: {
                    cafeName: 'Anthracite Coffee 한남점',
                    roastery: 'Anthracite Coffee',
                    coffeeName: 'Single Origin Blend',
                    origin: 'Brazil / Santos',
                    variety: 'Catuai',
                    process: 'Natural',
                    altitude: '1,200-1,400m',
                    temperature: 'ice' as const
                  },
                  roasterNotes: 'Rich chocolate notes with nutty undertones and caramel sweetness.',
                  selectedFlavors: [
                    { level: 1, value: 'Chocolate', koreanValue: '초콜릿' },
                    { level: 2, value: 'Dark Chocolate', koreanValue: '다크 초콜릿' },
                    { level: 1, value: 'Nutty/Cocoa', koreanValue: '견과류/코코아' },
                    { level: 2, value: 'Hazelnut', koreanValue: '헤이즐넛' },
                    { level: 1, value: 'Sweet', koreanValue: '단맛' },
                    { level: 2, value: 'Caramel', koreanValue: '카라멜' }
                  ],
                  sensoryAttributes: {
                    body: 5,
                    acidity: 2,
                    sweetness: 4,
                    finish: 3,
                    mouthfeel: 'Creamy' as const
                  },
                  matchScore: { total: 85, flavorScore: 40, sensoryScore: 45 },
                  personalComment: 'Anthracite 한남점에서 마신 브라질 내추럴 프로세싱 커피. 아이스로 마셨는데도 초콜릿과 견과류 향이 진하게 느껴진다. 바디감이 좋고 크리미한 텍스쳐가 인상적이다.',
                  brewingMethod: 'Cold Brew',
                  grindSize: 'Coarse',
                  waterTemp: 'Cold',
                  brewTime: '12시간'
                },
                {
                  coffeeInfo: {
                    cafeName: 'Cafe Onion 성수점',
                    roastery: 'Onion Coffee',
                    coffeeName: 'Kenya AA',
                    origin: 'Kenya / Nyeri',
                    variety: 'SL28, SL34',
                    process: 'Washed',
                    altitude: '1,500-1,700m',
                    temperature: 'hot' as const
                  },
                  roasterNotes: 'Bold and bright with blackcurrant notes and wine-like complexity.',
                  selectedFlavors: [
                    { level: 1, value: 'Fruity', koreanValue: '과일향' },
                    { level: 2, value: 'Berry', koreanValue: '베리' },
                    { level: 3, value: 'Blackcurrant', koreanValue: '블랙커런트' },
                    { level: 1, value: 'Sour/Fermented', koreanValue: '신맛/발효' },
                    { level: 2, value: 'Wine', koreanValue: '와인' }
                  ],
                  sensoryAttributes: {
                    body: 4,
                    acidity: 5,
                    sweetness: 2,
                    finish: 4,
                    mouthfeel: 'Clean' as const
                  },
                  matchScore: { total: 87, flavorScore: 44, sensoryScore: 43 },
                  personalComment: '카페 어니언에서 마신 케냐 커피. 블랙커런트향이 정말 강하고 와인같은 복잡한 맛이 인상적이다. 산미가 강해서 호불호가 갈릴 수 있지만 개성이 뚜렷한 커피다.',
                  brewingMethod: 'Chemex',
                  grindSize: 'Medium-Coarse',
                  waterTemp: '94°C',
                  brewTime: '5분'
                },
                {
                  coffeeInfo: {
                    cafeName: 'Terarosa Coffee 강남점',
                    roastery: 'Terarosa Coffee',
                    coffeeName: 'Guatemala Antigua',
                    origin: 'Guatemala / Antigua',
                    variety: 'Bourbon, Typica',
                    process: 'Washed',
                    altitude: '1,500-1,900m',
                    temperature: 'hot' as const
                  },
                  roasterNotes: 'Full-bodied with chocolate and spice notes, smooth and balanced.',
                  selectedFlavors: [
                    { level: 1, value: 'Chocolate', koreanValue: '초콜릿' },
                    { level: 2, value: 'Milk Chocolate', koreanValue: '밀크 초콜릿' },
                    { level: 1, value: 'Spices', koreanValue: '향신료' },
                    { level: 2, value: 'Cinnamon', koreanValue: '계피' },
                    { level: 1, value: 'Nutty/Cocoa', koreanValue: '견과류/코코아' },
                    { level: 2, value: 'Almond', koreanValue: '아몬드' }
                  ],
                  sensoryAttributes: {
                    body: 4,
                    acidity: 3,
                    sweetness: 4,
                    finish: 4,
                    mouthfeel: 'Silky' as const
                  },
                  matchScore: { total: 86, flavorScore: 41, sensoryScore: 45 },
                  personalComment: '테라로사 강남점에서 마신 과테말라 안티구아. 초콜릿과 계피향이 조화롭고 바디감이 좋다. 밸런스가 잘 잡혀 있어서 매일 마셔도 질리지 않을 것 같다.',
                  brewingMethod: 'French Press',
                  grindSize: 'Coarse',
                  waterTemp: '95°C',
                  brewTime: '4분'
                },
                {
                  coffeeInfo: {
                    cafeName: 'Starbucks 강남R점',
                    roastery: 'Starbucks',
                    coffeeName: 'Pike Place Roast',
                    origin: 'Latin America',
                    variety: 'Various',
                    process: 'Washed',
                    altitude: '1,200-1,500m',
                    temperature: 'hot' as const
                  },
                  roasterNotes: 'Smooth and balanced with notes of chocolate and toasted nuts.',
                  selectedFlavors: [
                    { level: 1, value: 'Chocolate', koreanValue: '초콜릿' },
                    { level: 2, value: 'Cocoa', koreanValue: '코코아' },
                    { level: 1, value: 'Nutty/Cocoa', koreanValue: '견과류/코코아' },
                    { level: 2, value: 'Nutty', koreanValue: '견과류' },
                    { level: 3, value: 'Peanuts', koreanValue: '땅콩' },
                    { level: 1, value: 'Roasted', koreanValue: '로스팅향' },
                    { level: 2, value: 'Cereal', koreanValue: '시리얼' }
                  ],
                  sensoryAttributes: {
                    body: 3,
                    acidity: 2,
                    sweetness: 3,
                    finish: 3,
                    mouthfeel: 'Smooth' as const
                  },
                  matchScore: { total: 78, flavorScore: 38, sensoryScore: 40 },
                  personalComment: '스타벅스 파이크 플레이스 로스트. 평범하지만 안정적인 맛이다. 초콜릿과 견과류 향이 있지만 특별함은 없다. 그래도 언제 어디서나 마실 수 있다는 장점이 있다.',
                  brewingMethod: 'Drip',
                  grindSize: 'Medium',
                  waterTemp: '90°C',
                  brewTime: '6분'
                },
                {
                  coffeeInfo: {
                    cafeName: 'Paul Bassett 청담점',
                    roastery: 'Paul Bassett',
                    coffeeName: 'Ethiopia Sidamo',
                    origin: 'Ethiopia / Sidamo',
                    variety: 'Heirloom',
                    process: 'Natural',
                    altitude: '1,600-2,000m',
                    temperature: 'ice' as const
                  },
                  roasterNotes: 'Fruity and sweet with blueberry and wine-like characteristics.',
                  selectedFlavors: [
                    { level: 1, value: 'Fruity', koreanValue: '과일향' },
                    { level: 2, value: 'Berry', koreanValue: '베리' },
                    { level: 3, value: 'Blueberry', koreanValue: '블루베리' },
                    { level: 1, value: 'Sweet', koreanValue: '단맛' },
                    { level: 2, value: 'Vanillin', koreanValue: '바닐린' },
                    { level: 1, value: 'Sour/Fermented', koreanValue: '신맛/발효' },
                    { level: 2, value: 'Winey', koreanValue: '와인향' }
                  ],
                  sensoryAttributes: {
                    body: 3,
                    acidity: 4,
                    sweetness: 5,
                    finish: 4,
                    mouthfeel: 'Juicy' as const
                  },
                  matchScore: { total: 90, flavorScore: 45, sensoryScore: 45 },
                  personalComment: '폴바셋 청담점에서 마신 에티오피아 시다모 아이스커피. 블루베리향이 진짜 블루베리 먹는 것처럼 달콤하고 과일향이 풍부하다. 아이스로 마셔도 향이 살아있어서 놀랐다.',
                  brewingMethod: 'Pour Over (Iced)',
                  grindSize: 'Medium-Fine',
                  waterTemp: '92°C',
                  brewTime: '3분'
                },
                {
                  coffeeInfo: {
                    cafeName: 'Coffee Lab R 성수점',
                    roastery: 'Coffee Lab R',
                    coffeeName: 'Honduras COE #3',
                    origin: 'Honduras / Marcala',
                    variety: 'Pacas',
                    process: 'Honey',
                    altitude: '1,400-1,600m',
                    temperature: 'hot' as const
                  },
                  roasterNotes: 'Stone fruit sweetness with brown sugar and orange notes.',
                  selectedFlavors: [
                    { level: 1, value: 'Fruity', koreanValue: '과일향' },
                    { level: 2, value: 'Other Fruit', koreanValue: '기타 과일' },
                    { level: 3, value: 'Peach', koreanValue: '복숭아' },
                    { level: 1, value: 'Sweet', koreanValue: '단맛' },
                    { level: 2, value: 'Brown Sugar', koreanValue: '흑설탕' },
                    { level: 1, value: 'Fruity', koreanValue: '과일향' },
                    { level: 2, value: 'Citrus Fruit', koreanValue: '감귤류' },
                    { level: 3, value: 'Orange', koreanValue: '오렌지' }
                  ],
                  sensoryAttributes: {
                    body: 4,
                    acidity: 3,
                    sweetness: 5,
                    finish: 4,
                    mouthfeel: 'Syrupy' as const
                  },
                  matchScore: { total: 88, flavorScore: 44, sensoryScore: 44 },
                  personalComment: '커피랩R 성수점의 온두라스 COE 커피. 복숭아와 오렌지 향이 정말 과일주스 같다. 허니 프로세싱의 특성이 잘 드러나는 커피로 단맛이 자연스럽고 깔끔하다.',
                  brewingMethod: 'Aeropress',
                  grindSize: 'Fine',
                  waterTemp: '88°C',
                  brewTime: '2분 30초'
                },
                {
                  coffeeInfo: {
                    cafeName: 'Hollys Coffee 역삼점',
                    roastery: 'Hollys Coffee',
                    coffeeName: 'Costa Rica Tarrazú',
                    origin: 'Costa Rica / Tarrazú',
                    variety: 'Caturra, Catuai',
                    process: 'Washed',
                    altitude: '1,200-1,600m',
                    temperature: 'hot' as const
                  },
                  roasterNotes: 'Clean and bright with citrus acidity and milk chocolate finish.',
                  selectedFlavors: [
                    { level: 1, value: 'Fruity', koreanValue: '과일향' },
                    { level: 2, value: 'Citrus Fruit', koreanValue: '감귤류' },
                    { level: 3, value: 'Grapefruit', koreanValue: '자몽' },
                    { level: 1, value: 'Chocolate', koreanValue: '초콜릿' },
                    { level: 2, value: 'Milk Chocolate', koreanValue: '밀크 초콜릿' },
                    { level: 1, value: 'Green/Vegetative', koreanValue: '풀/채소향' },
                    { level: 2, value: 'Fresh', koreanValue: '신선한향' }
                  ],
                  sensoryAttributes: {
                    body: 3,
                    acidity: 4,
                    sweetness: 3,
                    finish: 3,
                    mouthfeel: 'Clean' as const
                  },
                  matchScore: { total: 82, flavorScore: 40, sensoryScore: 42 },
                  personalComment: '할리스 역삼점에서 마신 코스타리카 타라주. 자몽같은 시트러스 산미가 상쾌하고 깔끔하다. 밀크 초콜릿 뒷맛이 균형을 잡아주어 마시기 편한 커피다.',
                  brewingMethod: 'Pour Over',
                  grindSize: 'Medium',
                  waterTemp: '91°C',
                  brewTime: '4분 30초'
                },
                {
                  coffeeInfo: {
                    cafeName: 'Twosome Place 삼성점',
                    roastery: 'Twosome Place',
                    coffeeName: 'Jamaica Blue Mountain',
                    origin: 'Jamaica / Blue Mountain',
                    variety: 'Typica',
                    process: 'Washed',
                    altitude: '900-1,500m',
                    temperature: 'hot' as const
                  },
                  roasterNotes: 'Mild and sweet with subtle floral notes and clean finish.',
                  selectedFlavors: [
                    { level: 1, value: 'Floral', koreanValue: '꽃향기' },
                    { level: 2, value: 'Black Tea', koreanValue: '홍차' },
                    { level: 1, value: 'Sweet', koreanValue: '단맛' },
                    { level: 2, value: 'Overall Sweet', koreanValue: '전반적 단맛' },
                    { level: 1, value: 'Nutty/Cocoa', koreanValue: '견과류/코코아' },
                    { level: 2, value: 'Nutty', koreanValue: '견과류' },
                    { level: 3, value: 'Almond', koreanValue: '아몬드' }
                  ],
                  sensoryAttributes: {
                    body: 2,
                    acidity: 3,
                    sweetness: 4,
                    finish: 4,
                    mouthfeel: 'Delicate' as const
                  },
                  matchScore: { total: 84, flavorScore: 42, sensoryScore: 42 },
                  personalComment: '투썸플레이스의 자메이카 블루마운틴. 마일드하고 우아한 맛이다. 꽃향기와 견과류향이 은은하게 느껴지고 뒷맛이 깔끔하다. 비싸지만 그만한 가치가 있는 커피.',
                  brewingMethod: 'Siphon',
                  grindSize: 'Medium',
                  waterTemp: '92°C',
                  brewTime: '8분'
                },
                {
                  coffeeInfo: {
                    cafeName: 'Ediya Coffee 선릉점',
                    roastery: 'Ediya Coffee',
                    coffeeName: 'Colombia Supremo',
                    origin: 'Colombia / Nariño',
                    variety: 'Castillo',
                    process: 'Washed',
                    altitude: '1,500-2,000m',
                    temperature: 'ice' as const
                  },
                  roasterNotes: 'Balanced with caramel sweetness and mild fruit notes.',
                  selectedFlavors: [
                    { level: 1, value: 'Sweet', koreanValue: '단맛' },
                    { level: 2, value: 'Caramel', koreanValue: '카라멜' },
                    { level: 1, value: 'Fruity', koreanValue: '과일향' },
                    { level: 2, value: 'Dried Fruit', koreanValue: '건과일' },
                    { level: 3, value: 'Raisin', koreanValue: '건포도' },
                    { level: 1, value: 'Roasted', koreanValue: '로스팅향' },
                    { level: 2, value: 'Tobacco', koreanValue: '담배' }
                  ],
                  sensoryAttributes: {
                    body: 3,
                    acidity: 3,
                    sweetness: 4,
                    finish: 3,
                    mouthfeel: 'Smooth' as const
                  },
                  matchScore: { total: 80, flavorScore: 39, sensoryScore: 41 },
                  personalComment: '이디야 선릉점의 콜롬비아 수프리모 아이스. 카라멜 단맛과 건포도향이 특징적이다. 아이스로 마셔도 풍미가 살아있고 가격 대비 괜찮은 퀄리티다.',
                  brewingMethod: 'Cold Drip',
                  grindSize: 'Medium-Coarse',
                  waterTemp: 'Cold',
                  brewTime: '8시간'
                },
                {
                  coffeeInfo: {
                    cafeName: 'A Twosome Place 강남점',
                    roastery: 'A Twosome Place',
                    coffeeName: 'Panama Geisha',
                    origin: 'Panama / Boquete',
                    variety: 'Geisha',
                    process: 'Natural',
                    altitude: '1,500-1,700m',
                    temperature: 'hot' as const
                  },
                  roasterNotes: 'Exotic and complex with tropical fruit, jasmine, and bergamot notes.',
                  selectedFlavors: [
                    { level: 1, value: 'Fruity', koreanValue: '과일향' },
                    { level: 2, value: 'Other Fruit', koreanValue: '기타 과일' },
                    { level: 3, value: 'Passion Fruit', koreanValue: '패션프루트' },
                    { level: 1, value: 'Floral', koreanValue: '꽃향기' },
                    { level: 2, value: 'Jasmine', koreanValue: '자스민' },
                    { level: 1, value: 'Fruity', koreanValue: '과일향' },
                    { level: 2, value: 'Citrus Fruit', koreanValue: '감귤류' },
                    { level: 3, value: 'Bergamot', koreanValue: '베르가못' }
                  ],
                  sensoryAttributes: {
                    body: 3,
                    acidity: 5,
                    sweetness: 5,
                    finish: 5,
                    mouthfeel: 'Tea-like' as const
                  },
                  matchScore: { total: 94, flavorScore: 48, sensoryScore: 46 },
                  personalComment: 'A투썸의 파나마 게이샤는 정말 놀라운 커피였다. 패션프루트와 자스민향이 엄청나게 화려하고 베르가못향까지 느껴진다. 마치 향수를 마시는 것 같은 경험이었다.',
                  brewingMethod: 'V60',
                  grindSize: 'Medium-Fine',
                  waterTemp: '89°C',
                  brewTime: '3분'
                },
                {
                  coffeeInfo: {
                    cafeName: 'Mega Coffee 강남역점',
                    roastery: 'Mega Coffee',
                    coffeeName: 'Vietnam Robusta Blend',
                    origin: 'Vietnam / Dak Lak',
                    variety: 'Robusta',
                    process: 'Natural',
                    altitude: '500-800m',
                    temperature: 'ice' as const
                  },
                  roasterNotes: 'Strong and bold with earthy and nutty characteristics.',
                  selectedFlavors: [
                    { level: 1, value: 'Other', koreanValue: '기타' },
                    { level: 2, value: 'Chemical', koreanValue: '화학적향' },
                    { level: 3, value: 'Rubber', koreanValue: '고무' },
                    { level: 1, value: 'Roasted', koreanValue: '로스팅향' },
                    { level: 2, value: 'Burnt', koreanValue: '탄향' },
                    { level: 1, value: 'Nutty/Cocoa', koreanValue: '견과류/코코아' },
                    { level: 2, value: 'Nutty', koreanValue: '견과류' }
                  ],
                  sensoryAttributes: {
                    body: 5,
                    acidity: 1,
                    sweetness: 2,
                    finish: 2,
                    mouthfeel: 'Heavy' as const
                  },
                  matchScore: { total: 72, flavorScore: 35, sensoryScore: 37 },
                  personalComment: '메가커피의 베트남 로부스타 블렌드. 진하고 쓴맛이 강하다. 고무냄새와 탄맛이 느껴져서 개인적으로는 별로였다. 하지만 가격이 저렴해서 그런가보다.',
                  brewingMethod: 'Espresso (Iced)',
                  grindSize: 'Fine',
                  waterTemp: '93°C',
                  brewTime: '25초'
                },
                {
                  coffeeInfo: {
                    cafeName: 'Mammoth Coffee 이태원점',
                    roastery: 'Mammoth Coffee',
                    coffeeName: 'Rwanda Bourbon',
                    origin: 'Rwanda / Nyamasheke',
                    variety: 'Red Bourbon',
                    process: 'Washed',
                    altitude: '1,700-2,000m',
                    temperature: 'hot' as const
                  },
                  roasterNotes: 'Bright and sweet with red fruit, brown sugar, and tea-like finish.',
                  selectedFlavors: [
                    { level: 1, value: 'Fruity', koreanValue: '과일향' },
                    { level: 2, value: 'Berry', koreanValue: '베리' },
                    { level: 3, value: 'Strawberry', koreanValue: '딸기' },
                    { level: 1, value: 'Sweet', koreanValue: '단맛' },
                    { level: 2, value: 'Brown Sugar', koreanValue: '흑설탕' },
                    { level: 1, value: 'Floral', koreanValue: '꽃향기' },
                    { level: 2, value: 'Black Tea', koreanValue: '홍차' },
                    { level: 1, value: 'Spices', koreanValue: '향신료' },
                    { level: 2, value: 'Clove', koreanValue: '정향' }
                  ],
                  sensoryAttributes: {
                    body: 3,
                    acidity: 4,
                    sweetness: 4,
                    finish: 4,
                    mouthfeel: 'Silky' as const
                  },
                  matchScore: { total: 91, flavorScore: 46, sensoryScore: 45 },
                  personalComment: '매머드커피 이태원점의 르완다 부르봉. 딸기향이 정말 진하고 흑설탕의 단맛이 좋다. 홍차같은 깔끔한 뒷맛도 마음에 든다. 아프리카 커피의 매력을 잘 보여주는 커피다.',
                  brewingMethod: 'Kalita Wave',
                  grindSize: 'Medium',
                  waterTemp: '93°C',
                  brewTime: '5분 30초'
                }
              ];

              // Save test data 
              console.log('🧪 Saving test data - total items:', testTastings.length);
              for (let i = 0; i < testTastings.length; i++) {
                const testTasting = testTastings[i];
                console.log(`🧪 Saving item ${i + 1}:`, testTasting.coffeeInfo.coffeeName);
                try {
                  const savedRecord = await realmService.saveTasting(testTasting);
                  console.log(`✅ Saved item ${i + 1} with ID:`, savedRecord.id);
                } catch (error) {
                  console.error(`❌ Failed to save item ${i + 1}:`, error);
                }
              }
              
              // Verify data was saved
              const allRecords = realmService.getTastingRecords({ isDeleted: false });
              console.log('🔍 Total records in database after saving:', allRecords.length);
              
              const uniqueRoasters = [...new Set(testTastings.map(t => t.coffeeInfo.roastery))];
              const uniqueCafes = [...new Set(testTastings.map(t => t.coffeeInfo.cafeName))];
              
              Alert.alert('완료', `${testTastings.length}개의 테스트 데이터가 추가되었습니다.\n\n📍 카페: ${uniqueCafes.length}곳\n☕ 로스터리: ${uniqueRoasters.length}곳\n🎯 커피: ${testTastings.length}종\n\n포함된 로스터리:\n${uniqueRoasters.slice(0, 3).join(', ')}${uniqueRoasters.length > 3 ? ` 외 ${uniqueRoasters.length - 3}곳` : ''}\n\n참고: 새로운 커피 발견 알림이 표시될 수 있습니다.`);
            } catch (error) {
              console.error('테스트 데이터 추가 오류:', error);
              const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
              Alert.alert('오류', `테스트 데이터 추가 중 오류가 발생했습니다:\n${errorMessage}`);
            }
          },
        },
      ]
    );
  };

  const SettingRow = ({ 
    title, 
    description, 
    value, 
    onValueChange, 
    icon,
  }: {
    title: string;
    description?: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    icon?: string;
  }) => (
    <View style={styles.settingRow}>
      {icon && (
        <Text style={styles.settingIcon}>{icon}</Text>
      )}
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: HIGColors.gray3, true: HIGColors.blue }}
        thumbColor={value ? HIGColors.white : HIGColors.gray}
      />
    </View>
  );

  const ActionButton = ({ title, onPress, style, textStyle, icon }: {
    title: string;
    onPress: () => void;
    style?: any;
    textStyle?: any;
    icon?: string;
  }) => (
    <TouchableOpacity 
      style={[styles.actionButton, style]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.actionButtonContent}>
        {icon && <Text style={styles.actionButtonIcon}>{icon}</Text>}
        <Text style={[styles.actionButtonText, textStyle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  // Section Header Component
  const SectionHeader = ({ 
    title, 
    icon, 
    count,
  }: {
    title: string;
    icon: string;
    count?: number;
  }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <Text style={styles.sectionIcon}>{icon}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
        {count !== undefined && count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (!isDeveloperMode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.navigationBar}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>‹ 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.navigationTitle}>개발자 모드</Text>
          <View style={{ width: 30 }} />
        </View>

        <View style={styles.disabledContainer}>
          <Text style={styles.disabledIcon}>🚫</Text>
          <Text style={styles.disabledTitle}>개발자 모드가 비활성화됨</Text>
          <Text style={styles.disabledDescription}>
            개발자 모드를 활성화하려면 아래 버튼을 눌러주세요.{'\n'}
            이 모드는 디버깅과 테스트를 위한 고급 설정을 제공합니다.
          </Text>
          <TouchableOpacity
            style={styles.enableButton}
            onPress={toggleDeveloperMode}
          >
            <Text style={styles.enableButtonText}>개발자 모드 활성화</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigationBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹ 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.navigationTitle}>개발자 모드</Text>
        <TouchableOpacity onPress={toggleDeveloperMode}>
          <Text style={styles.disableButtonText}>비활성화</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Warning */}
        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            개발자 모드가 활성화되었습니다.{'\n'}
            이 설정들은 앱의 동작에 영향을 줄 수 있습니다.
          </Text>
        </View>

        {/* User Info */}
        <View style={styles.section}>
          <SectionHeader
            title="사용자 정보"
            icon={CategoryIcons.user}
          />
          <View style={styles.card}>
            <View style={styles.userInfoCard}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {currentUser?.username?.charAt(0).toUpperCase() || 'G'}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {currentUser?.username || 'Guest User'}
                </Text>
                <Text style={styles.userEmail}>
                  {currentUser?.email || 'guest@coffejournal.app'}
                </Text>
                <View style={styles.userBadges}>
                  <View style={[styles.userBadge, { backgroundColor: currentUser?.username === 'Guest' ? '#FFC107' : '#4CAF50' }]}>
                    <Text style={styles.userBadgeText}>
                      {currentUser?.username === 'Guest' ? '게스트' : '로그인'}
                    </Text>
                  </View>
                  {currentUser?.email === 'hello@zimojin.com' && (
                    <View style={[styles.userBadge, { backgroundColor: '#6B46C1' }]}>
                      <Text style={styles.userBadgeText}>관리자</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Debug Settings */}
        <View style={styles.section}>
          <SectionHeader
            title="디버그 설정"
            icon={CategoryIcons.debug}
            count={[showDebugInfo, enableNetworkLogs, enableRealmLogs, showPerformanceMetrics].filter(Boolean).length}
          />
          <View style={styles.card}>
            <SettingRow
              icon="📊"
              title="디버그 정보 표시"
              description="화면에 디버그 정보 오버레이 표시"
              value={showDebugInfo}
              onValueChange={setDebugInfo}
            />
            <SettingRow
              icon="🌐"
              title="네트워크 로그"
              description="네트워크 요청/응답 로그 출력"
              value={enableNetworkLogs}
              onValueChange={setNetworkLogs}
            />
            <SettingRow
              icon="💾"
              title="Realm 로그"
              description="데이터베이스 작업 로그 출력"
              value={enableRealmLogs}
              onValueChange={setRealmLogs}
            />
            <SettingRow
              icon="⚡"
              title="성능 메트릭"
              description="렌더링 성능 정보 표시"
              value={showPerformanceMetrics}
              onValueChange={setPerformanceMetrics}
            />
          </View>
        </View>

        {/* Test Settings */}
        <View style={styles.section}>
          <SectionHeader
            title="테스트 설정"
            icon={CategoryIcons.test}
            count={[enableMockData, forceGuestMode, skipAnimations, bypassLogin].filter(Boolean).length}
          />
          <View style={styles.card}>
            <SettingRow
              icon="🎭"
              title="Mock 데이터 강제 사용"
              description="실제 데이터 대신 Mock 데이터 사용"
              value={enableMockData}
              onValueChange={setMockData}
            />
            <SettingRow
              icon="👻"
              title="게스트 모드 강제"
              description="로그인 상태에서도 게스트 모드로 표시"
              value={forceGuestMode}
              onValueChange={setForceGuestMode}
            />
            <SettingRow
              icon="🏃"
              title="애니메이션 건너뛰기"
              description="모든 애니메이션 비활성화"
              value={skipAnimations}
              onValueChange={setSkipAnimations}
            />
            <SettingRow
              icon="🚪"
              title="로그인 바이패스"
              description="로그인 화면을 건너뛰고 바로 앱 진입"
              value={bypassLogin}
              onValueChange={setBypassLogin}
            />
          </View>
        </View>

        {/* Feature Flags */}
        <View style={styles.section}>
          <SectionHeader
            title="기능 플래그"
            icon={CategoryIcons.feature}
            count={[enableExperimentalFeatures, enableBetaFeatures].filter(Boolean).length}
          />
          <View style={styles.card}>
            <SettingRow
              icon="🔬"
              title="실험적 기능"
              description="개발 중인 실험적 기능 활성화"
              value={enableExperimentalFeatures}
              onValueChange={setExperimentalFeatures}
            />
            <SettingRow
              icon="🎯"
              title="베타 기능"
              description="베타 테스트 중인 기능 활성화"
              value={enableBetaFeatures}
              onValueChange={setBetaFeatures}
            />
          </View>
        </View>

        {/* Beta Feedback Settings */}
        <View style={styles.section}>
          <SectionHeader
            title="베타 피드백"
            icon={CategoryIcons.beta}
            count={[enableShakeToFeedback, isBetaUser].filter(Boolean).length}
          />
          <View style={styles.card}>
            <SettingRow
              icon="📳"
              title="흔들어서 피드백 보내기"
              description="기기를 흔들어 피드백 모달 열기"
              value={enableShakeToFeedback}
              onValueChange={toggleShakeToFeedback}
            />
            <SettingRow
              icon="🧑‍🚀"
              title="베타 테스터 모드"
              description="베타 테스터 전용 기능 활성화"
              value={isBetaUser}
              onValueChange={setBetaStatus}
            />
            <ActionButton
              icon="💬"
              title="피드백 모달 열기"
              onPress={showFeedback}
            />
          </View>
        </View>

        {/* Quick Login */}
        <View style={styles.section}>
          <SectionHeader
            title="빠른 로그인"
            icon={CategoryIcons.login}
          />
          <View style={styles.card}>
            <ActionButton
              icon="🧑‍💻"
              title="테스트 사용자로 로그인"
              onPress={() => {
                setTestUser();
                Alert.alert('완료', '테스트 사용자로 로그인했습니다.');
              }}
              style={styles.successButton}
              textStyle={styles.successButtonText}
            />
            <ActionButton
              icon="👤"
              title="게스트 모드로 전환"
              onPress={() => {
                setGuestMode();
                Alert.alert('완료', '게스트 모드로 전환했습니다.');
              }}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <SectionHeader
            title="개발자 액션"
            icon={CategoryIcons.data}
          />
          <View style={styles.card}>
            <View style={styles.actionGroup}>
              <Text style={styles.actionGroupTitle}>데이터 생성</Text>
              <ActionButton
                icon="☕"
                title="테스트 데이터 추가 (14개)"
                onPress={handleAddTestData}
                style={styles.dataButton}
              />
              <ActionButton
                icon="🧪"
                title="간단한 테스트 (1개)"
                onPress={handleAddSimpleTest}
                style={styles.dataButton}
              />
              <ActionButton
                icon="⚡"
                title="빠른 테스트 (5개)"
                onPress={handleAddQuickTest}
                style={styles.dataButton}
              />
              <ActionButton
                icon="🧪"
                title="데이터 테스트 화면"
                onPress={() => navigation.navigate('DataTest')}
                style={styles.actionButton}
              />
            </View>
            
            <View style={styles.actionGroup}>
              <Text style={styles.actionGroupTitle}>스크린샷 도구</Text>
              <ActionButton
                icon="📸"
                title="스크린샷 가이드"
                onPress={handleScreenshotGuide}
                style={styles.actionButton}
              />
              <ActionButton
                icon="🖼️"
                title="저장된 스크린샷 보기"
                onPress={handleViewScreenshots}
                style={styles.actionButton}
              />
              <ActionButton
                icon="🗑️"
                title="스크린샷 모두 삭제"
                onPress={handleClearScreenshots}
                style={styles.warningButton}
              />
            </View>
            
            <View style={[styles.actionGroup, styles.dangerZone]}>
              <Text style={[styles.actionGroupTitle, styles.dangerTitle]}>위험 구역</Text>
              <ActionButton
                icon="🗑️"
                title="Realm 데이터 삭제"
                onPress={handleClearRealmData}
                style={styles.dangerButton}
                textStyle={styles.dangerButtonText}
              />
              <ActionButton
                icon="💣"
                title="전체 저장소 삭제"
                onPress={handleClearStorage}
                style={styles.dangerButton}
                textStyle={styles.dangerButtonText}
              />
              <ActionButton
                icon="🔄"
                title="모든 설정 초기화"
                onPress={resetAllSettings}
                style={styles.warningButton}
                textStyle={styles.warningButtonText}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navigationBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  backButton: {
    paddingVertical: HIGConstants.SPACING_SM,
  },
  backButtonText: {
    fontSize: 17,
    color: HIGColors.blue,
    fontWeight: '400',
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  disableButtonText: {
    fontSize: 15,
    color: HIGColors.red,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_XL,
  },
  disabledIcon: {
    fontSize: 64,
    marginBottom: HIGConstants.SPACING_LG,
  },
  disabledTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
    textAlign: 'center',
  },
  disabledDescription: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: HIGConstants.SPACING_XL,
  },
  enableButton: {
    backgroundColor: HIGColors.blue,
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.BORDER_RADIUS,
  },
  enableButtonText: {
    color: HIGColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  warningCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    margin: HIGConstants.SPACING_LG,
    borderWidth: 1,
    borderColor: HIGColors.orange,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: HIGConstants.SPACING_SM,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: HIGColors.label,
    lineHeight: 20,
  },
  section: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: HIGConstants.SPACING_SM,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  badge: {
    backgroundColor: HIGColors.blue,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: HIGConstants.SPACING_SM,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: HIGColors.white,
  },
  card: {
    backgroundColor: '#F8F9FA',
    marginHorizontal: HIGConstants.SPACING_LG,
    borderRadius: HIGConstants.BORDER_RADIUS,
    borderWidth: 1,
    borderColor: HIGColors.gray4,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: HIGConstants.SPACING_MD,
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
    minHeight: 60,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: HIGConstants.SPACING_SM,
  },
  settingInfo: {
    flex: 1,
    marginRight: HIGConstants.SPACING_SM,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: HIGColors.label,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
    lineHeight: 16,
  },
  actionButton: {
    backgroundColor: HIGColors.blue,
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.BORDER_RADIUS,
    margin: HIGConstants.SPACING_SM,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: HIGConstants.SPACING_XS,
  },
  actionButtonText: {
    color: HIGColors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: HIGColors.red,
  },
  dangerButtonText: {
    color: HIGColors.white,
  },
  warningButton: {
    backgroundColor: HIGColors.orange,
  },
  warningButtonText: {
    color: HIGColors.white,
  },
  successButton: {
    backgroundColor: HIGColors.green,
  },
  successButtonText: {
    color: HIGColors.white,
  },
  dataButton: {
    backgroundColor: HIGColors.green,
  },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: HIGConstants.SPACING_MD,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: HIGColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: HIGConstants.SPACING_MD,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: HIGColors.white,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  userBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  userBadge: {
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: 4,
    borderRadius: HIGConstants.BORDER_RADIUS_SM,
    marginRight: HIGConstants.SPACING_XS,
  },
  userBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: HIGColors.white,
  },
  actionGroup: {
    padding: HIGConstants.SPACING_MD,
  },
  actionGroupTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
    textTransform: 'uppercase',
  },
  dangerZone: {
    backgroundColor: '#FFF3E0',
    borderRadius: HIGConstants.BORDER_RADIUS,
    marginTop: HIGConstants.SPACING_SM,
  },
  dangerTitle: {
    color: HIGColors.red,
  },
});

export default DeveloperScreen;