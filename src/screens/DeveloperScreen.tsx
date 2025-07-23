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
  DeviceEventEmitter,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { HIGConstants, HIGColors } from '../styles/common';
import { useDevStore } from '../stores/useDevStore';
import { useUserStore } from '../stores/useUserStore';
import { useFeedbackStore } from '../stores/useFeedbackStore';
import RealmService from '../services/realm/RealmService';
import { TastingData } from '../services/realm/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Category Icons - Removed for MVP Beta clean design
const CategoryIcons = {
  user: '',
  debug: '',
  test: '',
  feature: '',
  beta: '',
  login: '',
  data: '',
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const DeveloperScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const { currentUser, setTestUser } = useUserStore();
  const { showFeedback, enableShakeToFeedback, toggleShakeToFeedback, isBetaUser, setBetaStatus } = useFeedbackStore();
  const {
    isDeveloperMode,
    showDebugInfo,
    skipAnimations,
    bypassLogin,
    toggleDeveloperMode,
    setDebugInfo,
    setSkipAnimations,
    setBypassLogin,
    resetAllSettings,
  } = useDevStore();

  // Developer mode controls access to all developer features

  // Track current data count
  const [mockDataCount, setMockDataCount] = React.useState(0);
  // Simple function to load current data count
  const loadDataCount = async () => {
    try {
      const realmService = RealmService.getInstance();
      if (!realmService.isInitialized) {
        await realmService.initialize();
      }
      const tastings = await realmService.getTastingRecords({ isDeleted: false });
      const count = Array.from(tastings).length;
      setMockDataCount(count);
      return count;
    } catch (error) {
      console.error('Error loading data count:', error);
      return 0;
    }
  };

  // Load initial data count on mount
  React.useEffect(() => {
    loadDataCount();
  }, []);

  // Refresh data count when screen focuses
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDataCount();
    });
    
    return unsubscribe;
  }, [navigation]);

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
              
              // Ensure realm is initialized
              if (!realmService.isInitialized) {
                try {
                  console.log('🔄 Initializing Realm for clear operation...');
                  await realmService.initialize();
                  console.log('✅ Realm initialized for clear operation');
                } catch (initError: any) {
                  if (initError.message?.includes('already opened')) {
                    console.log('✅ Realm already opened for clear operation');
                  } else {
                    console.error('❌ Realm initialization failed for clear:', initError);
                    Alert.alert('오류', 'Realm 초기화에 실패했습니다.');
                    return;
                  }
                }
              }
              
              if (realmService.isInitialized) {
                try {
                  const realm = realmService.getRealm();
                  
                  // 트랜잭션 내에서 안전하게 삭제
                  realm.write(() => {
                    // TastingRecord만 삭제 (다른 스키마에 영향 없도록)
                    const tastings = realm.objects('TastingRecord');
                    realm.delete(tastings);
                  });
                  
                  // Update count
                  await loadDataCount();
                  
                  console.log('✅ Mock data reset completed successfully');
                  Alert.alert('완료', 'Mock 데이터가 삭제되었습니다.');
                } catch (deleteError) {
                  console.error('❌ Error during realm delete transaction:', deleteError);
                  Alert.alert('오류', '데이터 삭제 중 오류가 발생했습니다.');
                }
              } else {
                Alert.alert('오류', 'Realm이 초기화되지 않았습니다.');
              }
            } catch (error) {
              console.error('Clear Realm data error:', error);
              Alert.alert('오류', 'Realm 데이터 삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };



  const handleMockDataToggle = async (enable: boolean) => {
    if (!isDeveloperMode) {
      return;
    }
    
    try {
      const realmService = RealmService.getInstance();
      if (!realmService.isInitialized) {
        await realmService.initialize();
      }
      
      if (enable) {
        // Create mock data

        const mockData = [
          {
            cafeName: 'Blue Bottle Oakland',
            roastery: 'Blue Bottle',
            coffeeName: 'Three Africas',
            origin: 'Ethiopia',
            variety: 'Heirloom',
            altitude: '2000m',
            process: 'Natural',
            temperature: 'hot' as const,
            roasterNotes: 'Bright and fruity with floral notes',
            matchScoreTotal: 85,
            matchScoreFlavor: 42,
            matchScoreSensory: 43,
            flavorNotes: [
              { level: 1, value: 'Fruity', koreanValue: '과일향' },
              { level: 2, value: 'Berry', koreanValue: '베리류' },
              { level: 3, value: 'Blueberry', koreanValue: '블루베리' }
            ],
            sensoryAttribute: {
              body: 3,
              acidity: 4,
              sweetness: 3,
              finish: 4,
              mouthfeel: 'Clean'
            },
            isSynced: false,
            isDeleted: false
          },
          {
            cafeName: 'Fritz Coffee Company',
            roastery: 'Fritz',
            coffeeName: 'Colombia Geisha',
            origin: 'Colombia',
            variety: 'Geisha',
            altitude: '1850m',
            process: 'Washed',
            temperature: 'hot' as const,
            roasterNotes: 'Floral and tea-like with jasmine notes',
            matchScoreTotal: 92,
            matchScoreFlavor: 46,
            matchScoreSensory: 46,
            flavorNotes: [
              { level: 1, value: 'Floral', koreanValue: '꽃향' },
              { level: 2, value: 'White Floral', koreanValue: '흰 꽃' },
              { level: 3, value: 'Jasmine', koreanValue: '자스민' }
            ],
            sensoryAttribute: {
              body: 4,
              acidity: 5,
              sweetness: 4,
              finish: 5,
              mouthfeel: 'Juicy'
            },
            isSynced: false,
            isDeleted: false
          },
          {
            cafeName: 'Anthracite Coffee',
            roastery: 'Anthracite',
            coffeeName: 'Brazil Santos',
            origin: 'Brazil',
            variety: 'Bourbon',
            altitude: '1200m',
            process: 'Pulped Natural',
            temperature: 'cold' as const,
            roasterNotes: 'Chocolatey and nutty with smooth body',
            matchScoreTotal: 80,
            matchScoreFlavor: 40,
            matchScoreSensory: 40,
            flavorNotes: [
              { level: 1, value: 'Chocolate', koreanValue: '초콜릿' },
              { level: 2, value: 'Dark Chocolate', koreanValue: '다크 초콜릿' },
              { level: 3, value: 'Bittersweet Chocolate', koreanValue: '쌉쌀한 초콜릿' }
            ],
            sensoryAttribute: {
              body: 5,
              acidity: 2,
              sweetness: 4,
              finish: 3,
              mouthfeel: 'Creamy'
            },
            isSynced: false,
            isDeleted: false
          },
          {
            cafeName: 'Terarosa Coffee',
            roastery: 'Terarosa',
            coffeeName: 'Guatemala Huehuetenango',
            origin: 'Guatemala',
            variety: 'Caturra',
            altitude: '1900m',
            process: 'Washed',
            temperature: 'hot' as const,
            roasterNotes: 'Balanced with chocolate and citrus notes',
            matchScoreTotal: 86,
            matchScoreFlavor: 43,
            matchScoreSensory: 43,
            flavorNotes: [
              { level: 1, value: 'Fruity', koreanValue: '과일향' },
              { level: 2, value: 'Citrus', koreanValue: '시트러스' },
              { level: 3, value: 'Orange', koreanValue: '오렌지' }
            ],
            sensoryAttribute: {
              body: 4,
              acidity: 3,
              sweetness: 4,
              finish: 4,
              mouthfeel: 'Silky'
            },
            isSynced: false,
            isDeleted: false
          },
          {
            cafeName: 'The Coffee Bean & Tea Leaf',
            roastery: 'Coffee Bean',
            coffeeName: 'House Blend',
            origin: 'Central America',
            variety: 'Arabica Blend',
            altitude: '1400m',
            process: 'Mixed',
            temperature: 'hot' as const,
            roasterNotes: 'Classic coffee with nutty undertones',
            matchScoreTotal: 75,
            matchScoreFlavor: 37,
            matchScoreSensory: 38,
            flavorNotes: [
              { level: 1, value: 'Nutty/Cocoa', koreanValue: '견과류' },
              { level: 2, value: 'Nutty', koreanValue: '견과' },
              { level: 3, value: 'Hazelnut', koreanValue: '헤이즐넛' }
            ],
            sensoryAttribute: {
              body: 3,
              acidity: 2,
              sweetness: 3,
              finish: 3,
              mouthfeel: 'Smooth'
            },
            isSynced: false,
            isDeleted: false
          }
        ];

        // Save all mock data
        console.log('🎯 Starting mock data creation...');
        let successCount = 0;
        
        for (const [index, data] of mockData.entries()) {
          try {
            console.log(`🔄 Creating tasting ${index + 1}/${mockData.length}: ${data.coffeeName}`);
            
            const tastingData: TastingData = {
              coffeeInfo: {
                cafeName: data.cafeName,
                roastery: data.roastery,
                coffeeName: data.coffeeName,
                origin: data.origin,
                variety: data.variety,
                altitude: data.altitude,
                process: data.process,
                temperature: data.temperature,
              },
              roasterNotes: data.roasterNotes,
              selectedFlavors: data.flavorNotes,
              sensoryAttributes: data.sensoryAttribute,
              matchScore: {
                total: data.matchScoreTotal,
                flavorScore: data.matchScoreFlavor,
                sensoryScore: data.matchScoreSensory,
              }
            };
            
            console.log('📋 Tasting data structure:', JSON.stringify(tastingData, null, 2));
            
            const result = await realmService.saveTasting(tastingData);
            
            if (result && result.id) {
              successCount++;
              console.log(`✅ Successfully created: ${data.coffeeName} (ID: ${result.id})`);
            } else {
              console.log(`⚠️ No result returned for: ${data.coffeeName}`);
            }
          } catch (error) {
            console.error(`❌ Failed to create ${data.coffeeName}:`, error);
          }
        }
        
        console.log(`📊 Mock data creation completed: ${successCount}/${mockData.length} successful`);
        
        // Verify data was created
        const verifyTastings = await realmService.getTastingRecords({ isDeleted: false });
        console.log(`🔍 Verification: ${Array.from(verifyTastings).length} total records after creation`);
        
        // Update UI
        await loadDataCount();
        
        // Emit refresh event for all screens listening
        DeviceEventEmitter.emit('mockDataCreated');
        
        Alert.alert(
          '완료', 
          '5개의 테스트 데이터가 추가되었습니다. Journal로 이동하시겠습니까?',
          [
            {
              text: '나중에',
              style: 'cancel'
            },
            {
              text: 'Journal로 이동',
              onPress: () => {
                // Force navigation to Journal tab and refresh
                navigation.dispatch(
                  CommonActions.navigate({
                    name: 'MainTabs',
                    params: {
                      screen: 'Journal',
                      params: {
                        screen: 'HistoryMain'
                      }
                    }
                  })
                );
              }
            }
          ]
        );
        
      } else {
        // Delete all data
        const realm = realmService.getRealm();
        realm.write(() => {
          const tastings = realm.objects('TastingRecord');
          realm.delete(tastings);
        });
        
        // Update UI
        await loadDataCount();
        Alert.alert('완료', '모든 데이터가 삭제되었습니다.');
      }
    } catch (error) {
      console.error('Mock data toggle error:', error);
      Alert.alert('오류', '작업 중 오류가 발생했습니다.');
      // Reset display to match actual state
      await loadDataCount();
    }
  };


  const SettingRow = ({ 
    title, 
    description, 
    value, 
    onValueChange, 
    icon,
    isLast = false,
  }: {
    title: string;
    description?: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    icon?: string;
    isLast?: boolean;
  }) => (
    <View style={[styles.settingRow, isLast && styles.settingRowLast]}>
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
        <View style={{ width: 60 }} />
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
                  {currentUser?.username || 'User'}
                </Text>
                <Text style={styles.userEmail}>
                  {currentUser?.email || 'user@coffejournal.app'}
                </Text>
                <View style={styles.userBadges}>
                  <View style={[styles.userBadge, { backgroundColor: currentUser ? '#4CAF50' : '#FFC107' }]}>
                    <Text style={styles.userBadgeText}>
                      {currentUser ? '로그인' : '미로그인'}
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
count={[showDebugInfo].filter(Boolean).length}
          />
          <View style={styles.card}>
            <SettingRow
              title="디버그 정보 표시"
              description="화면에 디버그 정보 오버레이 표시"
              value={showDebugInfo}
              onValueChange={setDebugInfo}
              isLast={true}
            />
          </View>
        </View>

        {/* Test Settings */}
        <View style={styles.section}>
          <SectionHeader
            title="테스트 설정"
            icon={CategoryIcons.test}
            count={[
              skipAnimations, 
              bypassLogin
            ].filter(Boolean).length}
          />
          <View style={styles.card}>
            {/* Mock data toggle - only in developer mode */}
            {isDeveloperMode ? (
              <SettingRow
                title="Mock 데이터"
                description={`현재 ${mockDataCount}개의 테스트 데이터`}
                value={mockDataCount > 0}
                onValueChange={handleMockDataToggle}
              />
            ) : (
              <View style={styles.restrictedFeature}>
                <Text style={styles.restrictedTitle}>Mock 데이터</Text>
                <Text style={styles.restrictedDescription}>
                  개발자 모드를 활성화하세요
                </Text>
              </View>
            )}
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
              isLast={true}
            />
          </View>
        </View>

        {/* Feature Flags */}
        <View style={styles.section}>
          <SectionHeader
            title="기능 플래그"
            icon={CategoryIcons.feature}
count={0}
          />
          <View style={styles.card}>
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
              title="흔들어서 피드백 보내기"
              description="기기를 흔들어 피드백 모달 열기"
              value={enableShakeToFeedback}
              onValueChange={toggleShakeToFeedback}
            />
            <SettingRow
              title="베타 테스터 모드"
              description="베타 테스터 전용 기능 활성화"
              value={isBetaUser}
              onValueChange={setBetaStatus}
              isLast={true}
            />
            <ActionButton
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
              title="테스트 사용자로 로그인"
              onPress={() => {
                setTestUser();
                Alert.alert('완료', '테스트 사용자로 로그인했습니다.');
              }}
              style={styles.successButton}
              textStyle={styles.successButtonText}
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
              <Text style={styles.actionGroupTitle}>데이터 관리</Text>
              <ActionButton
                title="데이터 관리 화면"
                onPress={() => navigation.navigate('DataTest')}
                style={styles.actionButton}
              />
              <ActionButton
                title="Mock 데이터 리셋"
                onPress={handleClearRealmData}
                style={styles.warningButton}
                textStyle={styles.warningButtonText}
                icon="🔄"
              />
            </View>
            
            
            <View style={[styles.actionGroup, styles.dangerZone]}>
              <Text style={[styles.actionGroupTitle, styles.dangerTitle]}>위험 구역</Text>
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
        </View>

        {/* Developer Mode Settings */}
        <View style={styles.section}>
          <SectionHeader
            title="개발자 모드 설정"
            icon="🔧"
            count={[isDeveloperMode].filter(Boolean).length}
          />
          <View style={styles.card}>
            <SettingRow
              title="개발자 모드"
              description="개발자 모드를 비활성화하면 이 화면에서 나갑니다"
              value={isDeveloperMode}
              onValueChange={(value) => {
                if (!value) {
                  Alert.alert(
                    '개발자 모드 비활성화',
                    '개발자 모드를 비활성화하시겠습니까?',
                    [
                      { text: '취소', style: 'cancel' },
                      { 
                        text: '비활성화', 
                        style: 'destructive',
                        onPress: () => {
                          toggleDeveloperMode();
                          navigation.goBack();
                        }
                      }
                    ]
                  );
                }
              }}
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
  settingRowLast: {
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
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
  restrictedFeature: {
    padding: HIGConstants.SPACING_MD,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.BORDER_RADIUS_SM,
    marginVertical: HIGConstants.SPACING_XS,
    opacity: 0.6,
  },
  restrictedTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: HIGColors.secondaryLabel,
    marginBottom: 2,
  },
  restrictedDescription: {
    fontSize: 14,
    color: HIGColors.tertiaryLabel,
  },
});

export default DeveloperScreen;