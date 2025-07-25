import React from 'react';
import { SafeAreaView, Switch, Alert, DeviceEventEmitter } from 'react-native';
import {
  View,
  Text,
  ScrollView,
  Button,
  YStack,
  XStack,
  Card,
  Separator,
  H1,
  H2,
  H3,
  Paragraph,
  SizableText,
  styled,
  useTheme,
  AnimatePresence,
  GetProps,
} from 'tamagui';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useDevStore } from '../../stores/useDevStore';
import { useUserStore } from '../../stores/useUserStore';
import { useFeedbackStore } from '../../stores/useFeedbackStore';
import RealmService from '../../services/realm/RealmService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MockDataService, MockDataScenario } from '../../services/MockDataService';
import AccessControlService from '../../services/AccessControlService';
import { useFirecrawlDemo } from '../../services/FirecrawlDemo';

// Category Icons - Minimal icons for clean design
const CategoryIcons = {
  user: '👤',
  debug: '🔍',
  test: '⚙️',
  feature: '✨',
  beta: 'β',
  login: '🔑',
  data: '📊',
  firecrawl: '🔥',
} as const;

type NavigationProp = StackNavigationProp<RootStackParamList>;

// Styled Components
const Container = styled(View, {
  name: 'DeveloperContainer',
  flex: 1,
  backgroundColor: '$background',
});

const NavigationBar = styled(XStack, {
  name: 'DeveloperNavigation',
  height: 44,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  backgroundColor: '$background',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
});

const BackButton = styled(Button, {
  name: 'BackButton',
  backgroundColor: 'transparent',
  borderWidth: 0,
  paddingHorizontal: '$sm',
  pressStyle: {
    opacity: 0.7,
    scale: 0.95,
  },
});

const NavigationTitle = styled(H1, {
  name: 'NavigationTitle',
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
});

const WarningCard = styled(Card, {
  name: 'WarningCard',
  margin: '$lg',
  padding: '$lg',
  backgroundColor: '$orange2',
  borderColor: '$orange8',
  borderWidth: 1,
  borderRadius: '$4',
  animation: 'bouncy',
  enterStyle: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
});

const WarningIcon = styled(Text, {
  name: 'WarningIcon',
  fontSize: 24,
  textAlign: 'center',
  marginBottom: '$sm',
});

const WarningText = styled(Paragraph, {
  name: 'WarningText',
  fontSize: '$4',
  color: '$orange11',
  textAlign: 'center',
  lineHeight: '$6',
});

const Section = styled(YStack, {
  name: 'Section',
  marginHorizontal: '$lg',
  marginBottom: '$lg',
});

const SectionHeader = styled(XStack, {
  name: 'SectionHeader',
  alignItems: 'center',
  marginBottom: '$md',
  gap: '$sm',
});

const SectionIcon = styled(Text, {
  name: 'SectionIcon',
  fontSize: 20,
});

const SectionTitle = styled(H2, {
  name: 'SectionTitle',
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
  flex: 1,
});

const Badge = styled(XStack, {
  name: 'Badge',
  backgroundColor: '$cupBlue',
  paddingHorizontal: '$xs',
  paddingVertical: 2,
  borderRadius: '$round',
  minWidth: 20,
  alignItems: 'center',
  justifyContent: 'center',
});

const BadgeText = styled(Text, {
  name: 'BadgeText',
  fontSize: 12,
  fontWeight: '600',
  color: 'white',
});

const SettingCard = styled(Card, {
  name: 'SettingCard',
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderWidth: 0.5,
  borderRadius: '$4',
  padding: '$md',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    y: 20,
  },
});

const SettingRow = styled(XStack, {
  name: 'SettingRow',
  alignItems: 'center',
  minHeight: 60,
  paddingVertical: '$sm',
  variants: {
    isLast: {
      false: {
        borderBottomWidth: 0.5,
        borderBottomColor: '$borderColor',
      },
    },
  } as const,
});

const SettingIcon = styled(Text, {
  name: 'SettingIcon',
  fontSize: 20,
  marginRight: '$md',
});

const SettingInfo = styled(YStack, {
  name: 'SettingInfo',
  flex: 1,
  gap: '$xs',
});

const SettingTitle = styled(Text, {
  name: 'SettingTitle',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
});

const SettingDescription = styled(Text, {
  name: 'SettingDescription',
  fontSize: '$3',
  color: '$gray11',
  lineHeight: '$4',
});

const ActionButton = styled(Button, {
  name: 'ActionButton',
  backgroundColor: '$gray4',
  borderColor: '$borderColor',
  borderWidth: 0.5,
  borderRadius: '$3',
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
  marginVertical: '$xs',
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$gray5',
  },
  variants: {
    variant: {
      success: {
        backgroundColor: '$green9',
        borderColor: '$green9',
      },
      warning: {
        backgroundColor: '$orange9',
        borderColor: '$orange9',
      },
      danger: {
        backgroundColor: '$red9',
        borderColor: '$red9',
      },
    },
  } as const,
});

const ActionButtonContent = styled(XStack, {
  name: 'ActionButtonContent',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$sm',
});

const ActionButtonIcon = styled(Text, {
  name: 'ActionButtonIcon',
  fontSize: 16,
});

const ActionButtonText = styled(Text, {
  name: 'ActionButtonText',
  fontSize: '$4',
  fontWeight: '500',
  color: '$color',
  variants: {
    variant: {
      success: {
        color: 'white',
      },
      warning: {
        color: 'white',
      },
      danger: {
        color: 'white',
      },
    },
  } as const,
});

const UserInfoCard = styled(XStack, {
  name: 'UserInfoCard',
  alignItems: 'center',
  gap: '$md',
});

const UserAvatar = styled(View, {
  name: 'UserAvatar',
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: '$cupBlue',
  alignItems: 'center',
  justifyContent: 'center',
});

const UserAvatarText = styled(Text, {
  name: 'UserAvatarText',
  fontSize: '$5',
  fontWeight: '600',
  color: 'white',
});

const UserDetails = styled(YStack, {
  name: 'UserDetails',
  flex: 1,
  gap: '$xs',
});

const UserName = styled(Text, {
  name: 'UserName',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
});

const UserEmail = styled(Text, {
  name: 'UserEmail',
  fontSize: '$3',
  color: '$gray11',
});

const UserBadges = styled(XStack, {
  name: 'UserBadges',
  gap: '$xs',
  marginTop: '$xs',
});

const UserBadge = styled(View, {
  name: 'UserBadge',
  paddingHorizontal: '$sm',
  paddingVertical: '$xs',
  borderRadius: '$3',
  variants: {
    type: {
      login: {
        backgroundColor: '$green9',
      },
      guest: {
        backgroundColor: '$orange9',
      },
      admin: {
        backgroundColor: '$purple9',
      },
    },
  } as const,
});

const UserBadgeText = styled(Text, {
  name: 'UserBadgeText',
  fontSize: 12,
  fontWeight: '500',
  color: 'white',
});

const DisabledContainer = styled(YStack, {
  name: 'DisabledContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: '$xl',
  gap: '$lg',
});

const DisabledIcon = styled(Text, {
  name: 'DisabledIcon',
  fontSize: 64,
});

const DisabledTitle = styled(H2, {
  name: 'DisabledTitle',
  fontSize: '$6',
  fontWeight: '700',
  color: '$color',
  textAlign: 'center',
});

const DisabledDescription = styled(Paragraph, {
  name: 'DisabledDescription',
  fontSize: '$4',
  color: '$gray11',
  textAlign: 'center',
  lineHeight: '$6',
});

const EnableButton = styled(Button, {
  name: 'EnableButton',
  backgroundColor: '$cupBlue',
  color: 'white',
  borderRadius: '$4',
  paddingHorizontal: '$xl',
  paddingVertical: '$md',
  fontSize: '$4',
  fontWeight: '600',
  pressStyle: {
    backgroundColor: '$cupBlueDark',
    scale: 0.95,
  },
});

const MockDataConfig = styled(YStack, {
  name: 'MockDataConfig',
  backgroundColor: '$gray2',
  padding: '$md',
  borderRadius: '$3',
  marginTop: '$sm',
  gap: '$md',
});

const ConfigTitle = styled(Text, {
  name: 'ConfigTitle',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
});

const ConfigRow = styled(YStack, {
  name: 'ConfigRow',
  gap: '$sm',
});

const ConfigLabel = styled(Text, {
  name: 'ConfigLabel',
  fontSize: '$3',
  fontWeight: '500',
  color: '$gray11',
});

const ScenarioButtons = styled(XStack, {
  name: 'ScenarioButtons',
  flexWrap: 'wrap',
  gap: '$xs',
});

const ScenarioButton = styled(Button, {
  name: 'ScenarioButton',
  size: '$2',
  backgroundColor: '$gray4',
  borderColor: '$borderColor',
  borderWidth: 0.5,
  variants: {
    selected: {
      true: {
        backgroundColor: '$cupBlue',
        borderColor: '$cupBlue',
      },
    },
  } as const,
  pressStyle: {
    scale: 0.95,
  },
});

const ScenarioButtonText = styled(Text, {
  name: 'ScenarioButtonText',
  fontSize: '$2',
  color: '$color',
  variants: {
    selected: {
      true: {
        color: 'white',
        fontWeight: '600',
      },
    },
  } as const,
});

export type DeveloperScreenProps = GetProps<typeof Container>;

const DeveloperScreen: React.FC<DeveloperScreenProps> = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  
  const { currentUser, setTestUser } = useUserStore();
  const { showFeedback, enableShakeToFeedback, toggleShakeToFeedback, isBetaUser, setBetaStatus } = useFeedbackStore();
  const { runAllDemos } = useFirecrawlDemo();
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

  // Track current data count
  const [mockDataCount, setMockDataCount] = React.useState(0);
  
  // Access control
  const [userRole, setUserRole] = React.useState('');
  const [canAccessMockData, setCanAccessMockData] = React.useState(false);
  
  // Mock data scenarios
  const [selectedScenario, setSelectedScenario] = React.useState<MockDataScenario>(MockDataScenario.INTERMEDIATE);
  const [mockDataCount_input, setMockDataCount_input] = React.useState(5);

  // Load current data count
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

  // Initialize access control and load data count
  React.useEffect(() => {
    const initializeScreen = async () => {
      try {
        const accessControl = AccessControlService;
        await accessControl.initialize();
        
        const profile = accessControl.getCurrentUserProfile();
        if (profile) {
          setUserRole(accessControl.getUserDisplayName());
          setCanAccessMockData(accessControl.hasPermission('canAccessMockData'));
        }
        
        await loadDataCount();
      } catch (error) {
        console.error('Failed to initialize developer screen:', error);
      }
    };
    
    initializeScreen();
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
              
              if (!realmService.isInitialized) {
                await realmService.initialize();
              }
              
              if (realmService.isInitialized) {
                const realm = realmService.getRealm();
                realm.write(() => {
                  const tastings = realm.objects('TastingRecord');
                  realm.delete(tastings);
                });
                
                await loadDataCount();
                Alert.alert('완료', 'Mock 데이터가 삭제되었습니다.');
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
    if (!canAccessMockData) {
      Alert.alert('권한 없음', '개발자 권한이 필요합니다.');
      return;
    }
    
    try {
      if (enable) {
        const successCount = await MockDataService.createMockData({
          scenario: selectedScenario,
          count: mockDataCount_input,
          includeHomeCafe: true,
          includePhotos: false
        });
        
        await loadDataCount();
        DeviceEventEmitter.emit('mockDataCreated');
        
        const scenarioNames = {
          [MockDataScenario.BEGINNER]: '초보자용',
          [MockDataScenario.INTERMEDIATE]: '중급자용', 
          [MockDataScenario.EXPERT]: '전문가용',
          [MockDataScenario.HOME_CAFE_FOCUSED]: 'HomeCafe 중심',
          [MockDataScenario.STATISTICS_TEST]: '통계 테스트용'
        };
        
        Alert.alert(
          '완료',
          `${scenarioNames[selectedScenario]} ${successCount}개의 테스트 데이터가 추가되었습니다. Journal로 이동하시겠습니까?`,
          [
            { text: '나중에', style: 'cancel' },
            {
              text: 'Journal로 이동',
              onPress: () => {
                navigation.dispatch(
                  CommonActions.navigate({
                    name: 'MainTabs',
                    params: {
                      screen: 'Journal',
                      params: { screen: 'HistoryMain' }
                    }
                  })
                );
              }
            }
          ]
        );
      } else {
        await MockDataService.clearMockData();
        await loadDataCount();
        Alert.alert('완료', '모든 Mock 데이터가 삭제되었습니다.');
      }
    } catch (error) {
      console.error('Mock data toggle error:', error);
      Alert.alert('오류', '작업 중 오류가 발생했습니다.');
      await loadDataCount();
    }
  };

  // Render components
  const renderSectionHeader = ({ title, icon, count }: { title: string; icon: string; count?: number }) => (
    <SectionHeader>
      <SectionIcon>{icon}</SectionIcon>
      <SectionTitle>{title}</SectionTitle>
      {count !== undefined && count > 0 && (
        <Badge>
          <BadgeText>{count}</BadgeText>
        </Badge>
      )}
    </SectionHeader>
  );

  const renderSettingRow = ({ 
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
    <SettingRow isLast={isLast}>
      {icon && <SettingIcon>{icon}</SettingIcon>}
      <SettingInfo>
        <SettingTitle>{title}</SettingTitle>
        {description && <SettingDescription>{description}</SettingDescription>}
      </SettingInfo>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '$gray6', true: '$cupBlue' }}
        thumbColor={value ? '$background' : '$gray10'}
      />
    </SettingRow>
  );

  const renderActionButton = ({ title, onPress, variant, icon }: {
    title: string;
    onPress: () => void;
    variant?: 'success' | 'warning' | 'danger';
    icon?: string;
  }) => (
    <ActionButton variant={variant} onPress={onPress} unstyled>
      <ActionButtonContent>
        {icon && <ActionButtonIcon>{icon}</ActionButtonIcon>}
        <ActionButtonText variant={variant}>{title}</ActionButtonText>
      </ActionButtonContent>
    </ActionButton>
  );

  if (!isDeveloperMode) {
    return (
      <Container>
        <SafeAreaView style={{ flex: 1 }}>
          <NavigationBar>
            <BackButton unstyled onPress={() => navigation.goBack()}>
              <Text color="$cupBlue" fontSize="$5" fontWeight="600">‹ 뒤로</Text>
            </BackButton>
            <NavigationTitle>개발자 모드</NavigationTitle>
            <View width={30} />
          </NavigationBar>

          <DisabledContainer>
            <DisabledIcon>🚫</DisabledIcon>
            <DisabledTitle>개발자 모드가 비활성화됨</DisabledTitle>
            <DisabledDescription>
              개발자 모드를 활성화하려면 아래 버튼을 눌러주세요.{'\n'}
              이 모드는 디버깅과 테스트를 위한 고급 설정을 제공합니다.
            </DisabledDescription>
            <EnableButton onPress={toggleDeveloperMode}>
              개발자 모드 활성화
            </EnableButton>
          </DisabledContainer>
        </SafeAreaView>
      </Container>
    );
  }

  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationBar>
          <BackButton unstyled onPress={() => navigation.goBack()}>
            <Text color="$cupBlue" fontSize="$5" fontWeight="600">‹ 뒤로</Text>
          </BackButton>
          <NavigationTitle>개발자 모드</NavigationTitle>
          <View width={60} />
        </NavigationBar>

        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <AnimatePresence>
            {/* Warning */}
            <WarningCard>
              <WarningIcon>⚠️</WarningIcon>
              <WarningText>
                개발자 모드가 활성화되었습니다.{'\n'}
                이 설정들은 앱의 동작에 영향을 줄 수 있습니다.
              </WarningText>
            </WarningCard>

            {/* User Info */}
            <Section>
              {renderSectionHeader({ title: '사용자 정보', icon: CategoryIcons.user })}
              <SettingCard>
                <UserInfoCard>
                  <UserAvatar>
                    <UserAvatarText>
                      {currentUser?.username?.charAt(0).toUpperCase() || 'G'}
                    </UserAvatarText>
                  </UserAvatar>
                  <UserDetails>
                    <UserName>{currentUser?.username || 'User'}</UserName>
                    <UserEmail>{currentUser?.email || 'user@coffejournal.app'}</UserEmail>
                    <UserBadges>
                      <UserBadge type={currentUser ? 'login' : 'guest'}>
                        <UserBadgeText>{currentUser ? '로그인' : '미로그인'}</UserBadgeText>
                      </UserBadge>
                      {currentUser?.email === 'hello@zimojin.com' && (
                        <UserBadge type="admin">
                          <UserBadgeText>관리자</UserBadgeText>
                        </UserBadge>
                      )}
                    </UserBadges>
                  </UserDetails>
                </UserInfoCard>
              </SettingCard>
            </Section>

            {/* Debug Settings */}
            <Section>
              {renderSectionHeader({ 
                title: '디버그 설정', 
                icon: CategoryIcons.debug,
                count: [showDebugInfo].filter(Boolean).length
              })}
              <SettingCard>
                {renderSettingRow({
                  title: '디버그 정보 표시',
                  description: '화면에 디버그 정보 오버레이 표시',
                  value: showDebugInfo,
                  onValueChange: setDebugInfo,
                  isLast: true,
                })}
              </SettingCard>
            </Section>

            {/* Test Settings */}
            <Section>
              {renderSectionHeader({ 
                title: '테스트 설정', 
                icon: CategoryIcons.test,
                count: [skipAnimations, bypassLogin].filter(Boolean).length
              })}
              <SettingCard>
                {canAccessMockData ? (
                  <>
                    {renderSettingRow({
                      title: 'Mock 데이터',
                      description: `현재 ${mockDataCount}개의 테스트 데이터 (${userRole})`,
                      value: mockDataCount > 0,
                      onValueChange: handleMockDataToggle,
                    })}
                    
                    <MockDataConfig>
                      <ConfigTitle>Mock Data 설정</ConfigTitle>
                      
                      <ConfigRow>
                        <ConfigLabel>시나리오:</ConfigLabel>
                        <ScenarioButtons>
                          {Object.values(MockDataScenario).map((scenario) => {
                            const scenarioNames = {
                              [MockDataScenario.BEGINNER]: '초보자',
                              [MockDataScenario.INTERMEDIATE]: '중급자', 
                              [MockDataScenario.EXPERT]: '전문가',
                              [MockDataScenario.HOME_CAFE_FOCUSED]: 'HomeCafe',
                              [MockDataScenario.STATISTICS_TEST]: '통계용'
                            };
                            
                            return (
                              <ScenarioButton
                                key={scenario}
                                selected={selectedScenario === scenario}
                                onPress={() => setSelectedScenario(scenario)}
                                unstyled
                              >
                                <ScenarioButtonText selected={selectedScenario === scenario}>
                                  {scenarioNames[scenario]}
                                </ScenarioButtonText>
                              </ScenarioButton>
                            );
                          })}
                        </ScenarioButtons>
                      </ConfigRow>
                      
                      <ConfigRow>
                        <ConfigLabel>개수:</ConfigLabel>
                        <ScenarioButtons>
                          {[5, 10, 20, 50].map((count) => (
                            <ScenarioButton
                              key={count}
                              selected={mockDataCount_input === count}
                              onPress={() => setMockDataCount_input(count)}
                              unstyled
                            >
                              <ScenarioButtonText selected={mockDataCount_input === count}>
                                {count}
                              </ScenarioButtonText>
                            </ScenarioButton>
                          ))}
                        </ScenarioButtons>
                      </ConfigRow>
                    </MockDataConfig>
                  </>
                ) : (
                  <YStack padding="$lg" alignItems="center">
                    <Text fontSize="$4" fontWeight="600" color="$color">Mock 데이터</Text>
                    <Text fontSize="$3" color="$gray11" textAlign="center">
                      개발자 권한이 필요합니다 ({userRole})
                    </Text>
                  </YStack>
                )}
                
                {renderSettingRow({
                  title: '애니메이션 건너뛰기',
                  description: '모든 애니메이션 비활성화',
                  value: skipAnimations,
                  onValueChange: setSkipAnimations,
                })}
                
                {renderSettingRow({
                  title: '로그인 바이패스',
                  description: '로그인 화면을 건너뛰고 바로 앱 진입',
                  value: bypassLogin,
                  onValueChange: setBypassLogin,
                  isLast: true,
                })}
              </SettingCard>
            </Section>

            {/* Beta Feedback Settings */}
            <Section>
              {renderSectionHeader({ 
                title: '베타 피드백', 
                icon: CategoryIcons.beta,
                count: [enableShakeToFeedback, isBetaUser].filter(Boolean).length
              })}
              <SettingCard>
                {renderSettingRow({
                  title: '흔들어서 피드백 보내기',
                  description: '기기를 흔들어 피드백 모달 열기',
                  value: enableShakeToFeedback,
                  onValueChange: toggleShakeToFeedback,
                })}
                
                {renderSettingRow({
                  title: '베타 테스터 모드',
                  description: '베타 테스터 전용 기능 활성화',
                  value: isBetaUser,
                  onValueChange: setBetaStatus,
                  isLast: true,
                })}
                
                {renderActionButton({
                  title: '피드백 모달 열기',
                  onPress: showFeedback,
                })}
              </SettingCard>
            </Section>

            {/* Quick Login */}
            <Section>
              {renderSectionHeader({ title: '빠른 로그인', icon: CategoryIcons.login })}
              <SettingCard>
                {renderActionButton({
                  title: '테스트 사용자로 로그인',
                  onPress: () => {
                    setTestUser();
                    Alert.alert('완료', '테스트 사용자로 로그인했습니다.');
                  },
                  variant: 'success',
                })}
              </SettingCard>
            </Section>

            {/* Developer Actions */}
            <Section>
              {renderSectionHeader({ title: '개발자 액션', icon: CategoryIcons.data })}
              <SettingCard>
                <YStack gap="$sm">
                  <Text fontSize="$4" fontWeight="600" color="$color">데이터 관리</Text>
                  
                  {renderActionButton({
                    title: 'Tamagui Design System 비교',
                    onPress: () => navigation.navigate('TamaguiComparison' as any),
                    icon: '🎨',
                  })}
                  
                  {renderActionButton({
                    title: 'Mock 데이터 리셋',
                    onPress: handleClearRealmData,
                    variant: 'warning',
                    icon: '🔄',
                  })}
                  
                  <Separator marginVertical="$md" />
                  
                  <Text fontSize="$4" fontWeight="600" color="$red9">위험 구역</Text>
                  
                  {renderActionButton({
                    title: 'Realm 데이터 삭제',
                    onPress: handleClearRealmData,
                    variant: 'danger',
                  })}
                  
                  {renderActionButton({
                    title: '전체 저장소 삭제',
                    onPress: handleClearStorage,
                    variant: 'danger',
                  })}
                  
                  {renderActionButton({
                    title: '모든 설정 초기화',
                    onPress: resetAllSettings,
                    variant: 'warning',
                  })}
                </YStack>
              </SettingCard>
            </Section>

            {/* Developer Mode Settings */}
            <Section>
              {renderSectionHeader({ 
                title: '개발자 모드 설정', 
                icon: '🔧',
                count: [isDeveloperMode].filter(Boolean).length
              })}
              <SettingCard>
                {renderSettingRow({
                  title: '개발자 모드',
                  description: '개발자 모드를 비활성화하면 이 화면에서 나갑니다',
                  value: isDeveloperMode,
                  onValueChange: (value) => {
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
                  },
                  isLast: true,
                })}
              </SettingCard>
            </Section>

            <View height="$xxxl" />
          </AnimatePresence>
        </ScrollView>
      </SafeAreaView>
    </Container>
  );
};

export default DeveloperScreen;