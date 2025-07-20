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
import { useFeedbackStore } from '../stores/useFeedbackStore';
import RealmService from '../services/realm/RealmService';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const DeveloperScreen = () => {
  const navigation = useNavigation();
  
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
                await realmService.initialize();
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
                    { level: 3, value: 'Lemon', koreanValue: '레몬' },
                    { level: 2, value: 'Floral', koreanValue: '꽃향기' },
                    { level: 3, value: 'Jasmine', koreanValue: '자스민' }
                  ],
                  sensoryAttributes: {
                    body: 3,
                    acidity: 4,
                    sweetness: 3,
                    finish: 4,
                    mouthfeel: 'Clean' as const
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
                    { level: 3, value: 'Mango', koreanValue: '망고' },
                    { level: 1, value: 'Sweet', koreanValue: '단맛' },
                    { level: 2, value: 'Honey', koreanValue: '꿀' }
                  ],
                  sensoryAttributes: {
                    body: 4,
                    acidity: 5,
                    sweetness: 4,
                    finish: 5,
                    mouthfeel: 'Juicy' as const
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
                  matchScore: { total: 86, flavorScore: 41, sensoryScore: 45 }
                }
              ];

              for (const testTasting of testTastings) {
                await realmService.saveTasting(testTasting);
              }
              Alert.alert('완료', `${testTastings.length}개의 테스트 데이터가 추가되었습니다.`);
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
                title="테스트 데이터 추가 (5개)"
                onPress={handleAddTestData}
                style={styles.dataButton}
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