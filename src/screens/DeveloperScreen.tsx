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
import { HIGConstants, HIGColors } from '../styles/common';
import { useDevStore } from '../stores/useDevStore';
import { useUserStore } from '../stores/useUserStore';
import RealmService from '../services/realm/RealmService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DeveloperScreen = () => {
  const navigation = useNavigation();
  const { currentUser, setTestUser, setGuestMode } = useUserStore();
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
                    temperature: 'hot'
                  },
                  roasterNotes: 'Bright and clean with floral notes, hints of lemon and bergamot.',
                  flavorNotes: [
                    { level: 1, value: 'Fruity', koreanValue: '과일향' },
                    { level: 2, value: 'Citrus Fruit', koreanValue: '감귤류' },
                    { level: 3, value: 'Lemon', koreanValue: '레몬' },
                    { level: 2, value: 'Floral', koreanValue: '꽃향기' },
                    { level: 3, value: 'Jasmine', koreanValue: '자스민' }
                  ],
                  sensoryAttributes: {
                    body: 3,
                    acidity: 4,
                    sweetness: 3,
                    finish: 4,
                    mouthfeel: ['Clean']
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
                    temperature: 'hot'
                  },
                  roasterNotes: 'Complex and elegant with tropical fruit notes and wine-like acidity.',
                  flavorNotes: [
                    { level: 1, value: 'Fruity', koreanValue: '과일향' },
                    { level: 2, value: 'Other Fruit', koreanValue: '기타 과일' },
                    { level: 3, value: 'Mango', koreanValue: '망고' },
                    { level: 1, value: 'Sweet', koreanValue: '단맛' },
                    { level: 2, value: 'Honey', koreanValue: '꿀' }
                  ],
                  sensoryAttributes: {
                    body: 4,
                    acidity: 5,
                    sweetness: 4,
                    finish: 5,
                    mouthfeel: ['Juicy']
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
                    temperature: 'ice'
                  },
                  roasterNotes: 'Rich chocolate notes with nutty undertones and caramel sweetness.',
                  flavorNotes: [
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
                    mouthfeel: ['Creamy']
                  },
                  matchScore: { total: 85, flavorScore: 40, sensoryScore: 45 }
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
                    temperature: 'hot'
                  },
                  roasterNotes: 'Bold and bright with blackcurrant notes and wine-like complexity.',
                  flavorNotes: [
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
                    mouthfeel: ['Clean']
                  },
                  matchScore: { total: 87, flavorScore: 44, sensoryScore: 43 }
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
                    temperature: 'hot'
                  },
                  roasterNotes: 'Full-bodied with chocolate and spice notes, smooth and balanced.',
                  flavorNotes: [
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
                    mouthfeel: ['Silky']
                  },
                  matchScore: { total: 86, flavorScore: 41, sensoryScore: 45 }
                }
              ];

              for (const testTasting of testTastings) {
                await realmService.saveTasting(testTasting);
              }
              Alert.alert('완료', `${testTastings.length}개의 테스트 데이터가 추가되었습니다.`);
            } catch (error) {
              Alert.alert('오류', '테스트 데이터 추가 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleAddMoreTestData = () => {
    Alert.alert(
      '대량 테스트 데이터 추가',
      '10개의 다양한 샘플 테이스팅 데이터를 추가하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '추가',
          onPress: async () => {
            try {
              const realmService = RealmService.getInstance();
              const moreTastings = [
                {
                  coffeeInfo: {
                    cafeName: 'Paul Bassett 강남점',
                    roastery: 'Paul Bassett',
                    coffeeName: 'Ethiopia Sidamo',
                    origin: 'Ethiopia / Sidamo',
                    variety: 'Heirloom',
                    process: 'Natural',
                    altitude: '1,900-2,200m',
                    temperature: 'hot'
                  },
                  roasterNotes: 'Wine-like with berry notes, full body and complex finish.',
                  flavorNotes: [
                    { level: 1, value: 'Fruity', koreanValue: '과일향' },
                    { level: 2, value: 'Berry', koreanValue: '베리' },
                    { level: 3, value: 'Blueberry', koreanValue: '블루베리' },
                    { level: 1, value: 'Sour/Fermented', koreanValue: '신맛/발효' }
                  ],
                  sensoryAttributes: {
                    body: 5,
                    acidity: 3,
                    sweetness: 4,
                    finish: 4,
                    mouthfeel: ['Juicy']
                  },
                  matchScore: { total: 91, flavorScore: 46, sensoryScore: 45 }
                },
                {
                  coffeeInfo: {
                    cafeName: 'Coffee Libre 홍대점',
                    roastery: 'Coffee Libre',
                    coffeeName: 'Panama Geisha',
                    origin: 'Panama / Boquete',
                    variety: 'Geisha',
                    process: 'Washed',
                    altitude: '1,600-1,900m',
                    temperature: 'hot'
                  },
                  roasterNotes: 'Floral, tea-like, with jasmine and bergamot notes.',
                  flavorNotes: [
                    { level: 1, value: 'Floral', koreanValue: '꽃향기' },
                    { level: 2, value: 'Jasmine', koreanValue: '자스민' },
                    { level: 1, value: 'Fruity', koreanValue: '과일향' },
                    { level: 2, value: 'Citrus Fruit', koreanValue: '감귤류' }
                  ],
                  sensoryAttributes: {
                    body: 2,
                    acidity: 5,
                    sweetness: 3,
                    finish: 5,
                    mouthfeel: ['Clean']
                  },
                  matchScore: { total: 94, flavorScore: 48, sensoryScore: 46 }
                },
                {
                  coffeeInfo: {
                    cafeName: 'Starbucks Reserve 롯데타워점',
                    roastery: 'Starbucks Reserve',
                    coffeeName: 'Jamaica Blue Mountain',
                    origin: 'Jamaica / Blue Mountain',
                    variety: 'Typica',
                    process: 'Washed',
                    altitude: '1,000-1,700m',
                    temperature: 'hot'
                  },
                  roasterNotes: 'Mild, well-balanced, with subtle chocolate and nutty notes.',
                  flavorNotes: [
                    { level: 1, value: 'Chocolate', koreanValue: '초콜릿' },
                    { level: 2, value: 'Milk Chocolate', koreanValue: '밀크 초콜릿' },
                    { level: 1, value: 'Nutty/Cocoa', koreanValue: '견과류/코코아' },
                    { level: 2, value: 'Walnut', koreanValue: '호두' }
                  ],
                  sensoryAttributes: {
                    body: 3,
                    acidity: 3,
                    sweetness: 3,
                    finish: 3,
                    mouthfeel: ['Silky']
                  },
                  matchScore: { total: 83, flavorScore: 39, sensoryScore: 44 }
                },
                {
                  coffeeInfo: {
                    cafeName: 'Twosome Place 강남점',
                    roastery: 'Twosome Coffee',
                    coffeeName: 'House Blend',
                    origin: 'Brazil / Cerrado',
                    variety: 'Bourbon',
                    process: 'Natural',
                    altitude: '1,000-1,200m',
                    temperature: 'ice'
                  },
                  roasterNotes: 'Rich and balanced with chocolate and caramel sweetness.',
                  flavorNotes: [
                    { level: 1, value: 'Sweet', koreanValue: '단맛' },
                    { level: 2, value: 'Caramel', koreanValue: '카라멜' },
                    { level: 1, value: 'Chocolate', koreanValue: '초콜릿' },
                    { level: 2, value: 'Milk Chocolate', koreanValue: '밀크 초콜릿' }
                  ],
                  sensoryAttributes: {
                    body: 4,
                    acidity: 2,
                    sweetness: 4,
                    finish: 3,
                    mouthfeel: ['Creamy']
                  },
                  matchScore: { total: 78, flavorScore: 36, sensoryScore: 42 }
                },
                {
                  coffeeInfo: {
                    cafeName: 'Hollys Coffee 압구정점',
                    roastery: 'Hollys Coffee',
                    coffeeName: 'Yemen Mocha',
                    origin: 'Yemen / Mocha',
                    variety: 'Typica, Bourbon',
                    process: 'Natural',
                    altitude: '1,200-1,800m',
                    temperature: 'hot'
                  },
                  roasterNotes: 'Wine-like, fruity with chocolate undertones and earthy finish.',
                  flavorNotes: [
                    { level: 1, value: 'Chocolate', koreanValue: '초콜릿' },
                    { level: 2, value: 'Dark Chocolate', koreanValue: '다크 초콜릿' },
                    { level: 1, value: 'Fruity', koreanValue: '과일향' },
                    { level: 2, value: 'Wine', koreanValue: '와인' }
                  ],
                  sensoryAttributes: {
                    body: 5,
                    acidity: 3,
                    sweetness: 3,
                    finish: 4,
                    mouthfeel: ['Creamy']
                  },
                  matchScore: { total: 88, flavorScore: 43, sensoryScore: 45 }
                },
                {
                  coffeeInfo: {
                    cafeName: 'Coffee Bean 이태원점',
                    roastery: 'Coffee Bean & Tea Leaf',
                    coffeeName: 'Costa Rica Tarrazú',
                    origin: 'Costa Rica / Tarrazú',
                    variety: 'Caturra',
                    process: 'Honey',
                    altitude: '1,200-1,700m',
                    temperature: 'hot'
                  },
                  roasterNotes: 'Bright acidity with citrus notes and honey sweetness.',
                  flavorNotes: [
                    { level: 1, value: 'Fruity', koreanValue: '과일향' },
                    { level: 2, value: 'Citrus Fruit', koreanValue: '감귤류' },
                    { level: 3, value: 'Orange', koreanValue: '오렌지' },
                    { level: 1, value: 'Sweet', koreanValue: '단맛' },
                    { level: 2, value: 'Honey', koreanValue: '꿀' }
                  ],
                  sensoryAttributes: {
                    body: 3,
                    acidity: 4,
                    sweetness: 4,
                    finish: 3,
                    mouthfeel: ['Clean']
                  },
                  matchScore: { total: 84, flavorScore: 41, sensoryScore: 43 }
                },
                {
                  coffeeInfo: {
                    cafeName: 'Ediya Coffee 신촌점',
                    roastery: 'Ediya Coffee',
                    coffeeName: 'House Special',
                    origin: 'Colombia / Nariño',
                    variety: 'Castillo',
                    process: 'Washed',
                    altitude: '1,500-2,000m',
                    temperature: 'ice'
                  },
                  roasterNotes: 'Balanced cup with nutty and caramel notes.',
                  flavorNotes: [
                    { level: 1, value: 'Nutty/Cocoa', koreanValue: '견과류/코코아' },
                    { level: 2, value: 'Peanut', koreanValue: '땅콩' },
                    { level: 1, value: 'Sweet', koreanValue: '단맛' },
                    { level: 2, value: 'Brown Sugar', koreanValue: '흑설탕' }
                  ],
                  sensoryAttributes: {
                    body: 3,
                    acidity: 3,
                    sweetness: 3,
                    finish: 3,
                    mouthfeel: ['Silky']
                  },
                  matchScore: { total: 76, flavorScore: 35, sensoryScore: 41 }
                },
                {
                  coffeeInfo: {
                    cafeName: 'Mega Coffee 건대점',
                    roastery: 'Mega Coffee',
                    coffeeName: 'Americano Blend',
                    origin: 'Mixed Origins',
                    variety: 'Blend',
                    process: 'Mixed',
                    altitude: 'Various',
                    temperature: 'ice'
                  },
                  roasterNotes: 'Simple and clean blend for everyday drinking.',
                  flavorNotes: [
                    { level: 1, value: 'Roasted', koreanValue: '로스팅' },
                    { level: 2, value: 'Burnt', koreanValue: '탄맛' },
                    { level: 1, value: 'Bitter', koreanValue: '쓴맛' }
                  ],
                  sensoryAttributes: {
                    body: 2,
                    acidity: 2,
                    sweetness: 2,
                    finish: 2,
                    mouthfeel: ['Clean']
                  },
                  matchScore: { total: 65, flavorScore: 28, sensoryScore: 37 }
                },
                {
                  coffeeInfo: {
                    cafeName: 'Tom N Toms 명동점',
                    roastery: 'Tom N Toms Coffee',
                    coffeeName: 'Original Blend',
                    origin: 'Vietnam / Dalat',
                    variety: 'Robusta, Arabica',
                    process: 'Natural',
                    altitude: '800-1,500m',
                    temperature: 'hot'
                  },
                  roasterNotes: 'Strong and bold with earthy and nutty notes.',
                  flavorNotes: [
                    { level: 1, value: 'Nutty/Cocoa', koreanValue: '견과류/코코아' },
                    { level: 2, value: 'Cashew', koreanValue: '캐슈너트' },
                    { level: 1, value: 'Other', koreanValue: '기타' },
                    { level: 2, value: 'Earthy', koreanValue: '흙내음' }
                  ],
                  sensoryAttributes: {
                    body: 4,
                    acidity: 2,
                    sweetness: 2,
                    finish: 3,
                    mouthfeel: ['Creamy']
                  },
                  matchScore: { total: 73, flavorScore: 33, sensoryScore: 40 }
                },
                {
                  coffeeInfo: {
                    cafeName: 'A Twosome Place 잠실점',
                    roastery: 'Twosome Coffee',
                    coffeeName: 'Rwanda Single Origin',
                    origin: 'Rwanda / Huye',
                    variety: 'Red Bourbon',
                    process: 'Washed',
                    altitude: '1,700-2,000m',
                    temperature: 'hot'
                  },
                  roasterNotes: 'Bright and clean with floral and tea-like characteristics.',
                  flavorNotes: [
                    { level: 1, value: 'Floral', koreanValue: '꽃향기' },
                    { level: 2, value: 'Rose', koreanValue: '장미' },
                    { level: 1, value: 'Other', koreanValue: '기타' },
                    { level: 2, value: 'Tea-like', koreanValue: '차향' }
                  ],
                  sensoryAttributes: {
                    body: 2,
                    acidity: 4,
                    sweetness: 3,
                    finish: 4,
                    mouthfeel: ['Clean']
                  },
                  matchScore: { total: 82, flavorScore: 39, sensoryScore: 43 }
                }
              ];

              for (const testTasting of moreTastings) {
                await realmService.saveTasting(testTasting);
              }
              Alert.alert('완료', `${moreTastings.length}개의 추가 테스트 데이터가 추가되었습니다.`);
            } catch (error) {
              Alert.alert('오류', '테스트 데이터 추가 중 오류가 발생했습니다.');
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
    type = 'switch' 
  }: {
    title: string;
    description?: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    type?: 'switch' | 'button';
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: HIGColors.gray3, true: HIGColors.blue }}
          thumbColor={value ? HIGColors.white : HIGColors.gray}
        />
      )}
    </View>
  );

  const ActionButton = ({ title, onPress, style, textStyle }: {
    title: string;
    onPress: () => void;
    style?: any;
    textStyle?: any;
  }) => (
    <TouchableOpacity style={[styles.actionButton, style]} onPress={onPress}>
      <Text style={[styles.actionButtonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
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
          <Text style={styles.sectionTitle}>사용자 정보</Text>
          <View style={styles.card}>
            <Text style={styles.infoText}>
              사용자: {currentUser?.username || 'Guest'}{'\n'}
              이메일: {currentUser?.email || 'N/A'}{'\n'}
              모드: {currentUser?.username === 'Guest' ? '게스트' : '로그인'}
            </Text>
          </View>
        </View>

        {/* Debug Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>디버그 설정</Text>
          <View style={styles.card}>
            <SettingRow
              title="디버그 정보 표시"
              description="화면에 디버그 정보 오버레이 표시"
              value={showDebugInfo}
              onValueChange={setDebugInfo}
            />
            <SettingRow
              title="네트워크 로그"
              description="네트워크 요청/응답 로그 출력"
              value={enableNetworkLogs}
              onValueChange={setNetworkLogs}
            />
            <SettingRow
              title="Realm 로그"
              description="데이터베이스 작업 로그 출력"
              value={enableRealmLogs}
              onValueChange={setRealmLogs}
            />
            <SettingRow
              title="성능 메트릭"
              description="렌더링 성능 정보 표시"
              value={showPerformanceMetrics}
              onValueChange={setPerformanceMetrics}
            />
          </View>
        </View>

        {/* Test Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>테스트 설정</Text>
          <View style={styles.card}>
            <SettingRow
              title="Mock 데이터 강제 사용"
              description="실제 데이터 대신 Mock 데이터 사용"
              value={enableMockData}
              onValueChange={setMockData}
            />
            <SettingRow
              title="게스트 모드 강제"
              description="로그인 상태에서도 게스트 모드로 표시"
              value={forceGuestMode}
              onValueChange={setForceGuestMode}
            />
            <SettingRow
              title="애니메이션 건너뛰기"
              description="모든 애니메이션 비활성화"
              value={skipAnimations}
              onValueChange={setSkipAnimations}
            />
            <SettingRow
              title="로그인 바이패스"
              description="로그인 화면을 건너뛰고 바로 앱 진입"
              value={bypassLogin}
              onValueChange={setBypassLogin}
            />
          </View>
        </View>

        {/* Feature Flags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기능 플래그</Text>
          <View style={styles.card}>
            <SettingRow
              title="실험적 기능"
              description="개발 중인 실험적 기능 활성화"
              value={enableExperimentalFeatures}
              onValueChange={setExperimentalFeatures}
            />
            <SettingRow
              title="베타 기능"
              description="베타 테스트 중인 기능 활성화"
              value={enableBetaFeatures}
              onValueChange={setBetaFeatures}
            />
          </View>
        </View>

        {/* Quick Login */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>빠른 로그인</Text>
          <View style={styles.card}>
            <ActionButton
              title="테스트 사용자로 로그인"
              onPress={() => {
                setTestUser();
                Alert.alert('완료', '테스트 사용자로 로그인했습니다.');
              }}
              style={styles.successButton}
              textStyle={styles.successButtonText}
            />
            <ActionButton
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
          <Text style={styles.sectionTitle}>개발자 액션</Text>
          <View style={styles.card}>
            <ActionButton
              title="테스트 데이터 추가 (5개)"
              onPress={handleAddTestData}
            />
            <ActionButton
              title="대량 테스트 데이터 추가 (10개)"
              onPress={handleAddMoreTestData}
            />
            <ActionButton
              title="Realm 데이터 삭제"
              onPress={handleClearRealmData}
              style={styles.dangerButton}
              textStyle={styles.dangerButtonText}
            />
            <ActionButton
              title="전체 저장소 삭제"
              onPress={handleClearStorage}
              style={styles.dangerButton}
              textStyle={styles.dangerButtonText}
            />
            <ActionButton
              title="모든 설정 초기화"
              onPress={resetAllSettings}
              style={styles.warningButton}
              textStyle={styles.warningButtonText}
            />
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  card: {
    backgroundColor: '#F8F9FA',
    marginHorizontal: HIGConstants.SPACING_LG,
    borderRadius: HIGConstants.BORDER_RADIUS,
    borderWidth: 1,
    borderColor: HIGColors.gray4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: HIGConstants.SPACING_MD,
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
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
  infoText: {
    fontSize: 14,
    color: HIGColors.label,
    padding: HIGConstants.SPACING_MD,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: HIGColors.blue,
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.BORDER_RADIUS,
    margin: HIGConstants.SPACING_SM,
    alignItems: 'center',
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
});

export default DeveloperScreen;