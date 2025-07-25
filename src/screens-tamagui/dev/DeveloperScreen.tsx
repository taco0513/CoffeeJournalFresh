import React from 'react';
import { SafeAreaView, Alert, DeviceEventEmitter } from 'react-native';
import { ScrollView } from 'tamagui';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useDevStore } from '../../stores/useDevStore';
import { useUserStore } from '../../stores/useUserStore';
import { useFeedbackStore } from '../../stores/useFeedbackStore';
import RealmService from '../../services/realm/RealmService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MockDataService, MockDataScenario } from '../../services/MockDataService';
import { AccessControlService } from '../../services/AccessControlService';
import { useFirecrawlDemo } from '../../services/FirecrawlDemo';

// Components
import {
  Container,
  NavigationBar,
  BackButton,
  NavigationTitle,
  WarningCard,
  WarningIcon,
  WarningText,
  DisabledContainer,
  DisabledIcon,
  DisabledTitle,
  DisabledDescription,
  EnableButton,
} from '../../components-tamagui/dev/DeveloperScreenStyles';
import { UserInfoSection } from '../../components-tamagui/dev/UserInfoSection';
import { DeveloperSettingSections } from '../../components-tamagui/dev/DeveloperSettingSections';
import { MockDataConfigSection } from '../../components-tamagui/dev/MockDataConfigSection';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const DeveloperScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const { user: currentUser } = useUserStore();
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

  // State
  const [mockDataCount, setMockDataCount] = React.useState(0);
  const [userRole, setUserRole] = React.useState('');
  const [canAccessMockData, setCanAccessMockData] = React.useState(false);
  const [selectedScenario, setSelectedScenario] = React.useState<MockDataScenario>(MockDataScenario.INTERMEDIATE);
  const [showPerformanceInfo, setShowPerformanceInfo] = React.useState(false);
  const [enableVerboseLogging, setEnableVerboseLogging] = React.useState(false);
  const [showDeveloperToasts, setShowDeveloperToasts] = React.useState(false);

  // Load data count
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

  // Initialize access control
  React.useEffect(() => {
    const initializeAccessControl = async () => {
      try {
        const accessControl = AccessControlService.getInstance();
        await accessControl.initialize();
        
        const role = accessControl.getCurrentUserRole();
        setUserRole(role);
        // Access control doesn't expose permissions directly, check role instead
        setCanAccessMockData(role === 'developer' || role === 'admin');
      } catch (error) {
        console.error('Error initializing access control:', error);
      }
    };

    initializeAccessControl();
    loadDataCount();
  }, [isDeveloperMode, currentUser?.id]);

  // Mock data toggle
  const toggleMockData = async () => {
    if (!canAccessMockData) {
      Alert.alert('권한 없음', '베타 사용자는 목 데이터에 접근할 수 없습니다.');
      return;
    }

    const currentCount = await loadDataCount();
    
    if (currentCount > 0) {
      // Clear existing data
      Alert.alert(
        '데이터 초기화',
        `현재 ${currentCount}개의 기록이 있습니다. 목 데이터를 생성하기 전에 기존 데이터를 삭제하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '삭제 후 생성',
            style: 'destructive',
            onPress: async () => {
              await clearData();
              await createMockData();
            },
          },
        ]
      );
    } else {
      await createMockData();
    }
  };

  const createMockData = async () => {
    try {
      await MockDataService.createMockData({ scenario: selectedScenario, count: 5 });
      
      await loadDataCount();
      Alert.alert('완료', '목 데이터가 생성되었습니다.');
      
      // Emit refresh event
      DeviceEventEmitter.emit('refreshData');
    } catch (error) {
      console.error('Error creating mock data:', error);
      Alert.alert('오류', '목 데이터 생성 중 오류가 발생했습니다.');
    }
  };

  // Data management actions
  const clearData = async () => {
    Alert.alert(
      '데이터 삭제',
      '모든 테이스팅 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
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
              await realmService.clearAllTastings();
              await loadDataCount();
              Alert.alert('완료', '모든 데이터가 삭제되었습니다.');
              DeviceEventEmitter.emit('refreshData');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('오류', '데이터 삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const exportLogs = async () => {
    Alert.alert('정보', '로그 내보내기 기능은 아직 구현되지 않았습니다.');
  };

  const resetApp = async () => {
    Alert.alert(
      '앱 리셋',
      '앱을 완전히 초기화하시겠습니까? 모든 설정과 데이터가 삭제됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '리셋',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              resetAllSettings();
              Alert.alert('완료', '앱이 초기화되었습니다. 다시 시작해주세요.');
            } catch (error) {
              console.error('Error resetting app:', error);
              Alert.alert('오류', '앱 리셋 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  // Navigation actions
  const navigateToMarketTester = () => {
    navigation.navigate('MarketConfigurationTester');
  };

  const navigateToPerformanceDashboard = () => {
    navigation.navigate('PerformanceDashboard');
  };

  const navigateToI18nValidation = () => {
    navigation.navigate('I18nValidation');
  };

  const navigateToTesting = () => {
    navigation.navigate('Testing');
  };

  const navigateToFirecrawlDemo = () => {
    runAllDemos();
  };

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        })
      );
    }
  };

  // Check if developer mode is enabled
  if (!isDeveloperMode) {
    return (
      <Container>
        <SafeAreaView style={{ flex: 1 }}>
          <NavigationBar>
            <BackButton onPress={goBack}>← 뒤로</BackButton>
            <NavigationTitle>개발자 모드</NavigationTitle>
            <div />
          </NavigationBar>

          <DisabledContainer>
            <DisabledIcon>🚫</DisabledIcon>
            <DisabledTitle>개발자 모드가 비활성화됨</DisabledTitle>
            <DisabledDescription>
              개발자 도구에 액세스하려면 개발자 모드를 활성화해야 합니다.
              설정에서 개발자 모드를 켜거나 아래 버튼을 눌러 활성화하세요.
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
          <BackButton onPress={goBack}>← 뒤로</BackButton>
          <NavigationTitle>개발자 모드</NavigationTitle>
          <div />
        </NavigationBar>

        {/* Developer Warning */}
        <WarningCard>
          <WarningIcon>⚠️</WarningIcon>
          <WarningText>
            개발자 전용 도구입니다. 프로덕션 환경에서는 비활성화하세요.
          </WarningText>
        </WarningCard>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* User Info */}
          <UserInfoSection
            userName={currentUser?.displayName || currentUser?.username || currentUser?.email?.split('@')[0] || '개발자'}
            userEmail={currentUser?.email || 'dev@cupnote.app'}
            isDeveloper={isDeveloperMode}
            isBetaUser={isBetaUser}
            isAdmin={userRole === 'admin'}
          />

          {/* Developer Settings */}
          <DeveloperSettingSections
            // Debug settings
            enableDebugMode={showDebugInfo}
            setDebugMode={setDebugInfo}
            showPerformanceInfo={showPerformanceInfo}
            setPerformanceInfo={setShowPerformanceInfo}
            enableVerboseLogging={enableVerboseLogging}
            setVerboseLogging={setEnableVerboseLogging}
            
            // Feature toggles
            mockDataEnabled={mockDataCount > 0}
            toggleMockData={toggleMockData}
            showDeveloperToasts={showDeveloperToasts}
            setDeveloperToasts={setShowDeveloperToasts}
            
            // Authentication & User
            bypassLogin={bypassLogin}
            setBypassLogin={setBypassLogin}
            enableShakeToFeedback={enableShakeToFeedback}
            toggleShakeToFeedback={toggleShakeToFeedback}
            isBetaUser={isBetaUser}
            setBetaStatus={setBetaStatus}
            
            // Actions
            setTestUser={setTestUser}
            showFeedback={showFeedback}
            clearData={clearData}
            exportLogs={exportLogs}
            resetApp={resetApp}
            
            // Navigation
            onNavigateToMarketTester={navigateToMarketTester}
            onNavigateToPerformanceDashboard={navigateToPerformanceDashboard}
            onNavigateToI18nValidation={navigateToI18nValidation}
            onNavigateToTesting={navigateToTesting}
            onNavigateToFirecrawlDemo={navigateToFirecrawlDemo}
          />

          {/* Mock Data Config */}
          <MockDataConfigSection
            selectedScenario={selectedScenario}
            onScenarioChange={setSelectedScenario}
            mockDataEnabled={mockDataCount > 0}
          />
        </ScrollView>
      </SafeAreaView>
    </Container>
  );
};

export default DeveloperScreen;