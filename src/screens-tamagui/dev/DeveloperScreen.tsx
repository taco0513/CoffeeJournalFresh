import React from 'react';
import { SafeAreaView, Alert, DeviceEventEmitter, View} from 'react-native';
import { ScrollView, XStack, Card, Text } from 'tamagui';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useDevStore } from '../../stores/useDevStore';
import { useUserStore } from '../../stores/useUserStore';
import { useFeedbackStore } from '../../stores/useFeedbackStore';
import RealmService from '../../services/realm/RealmService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DummyDataCardService } from '../../services/DummyDataCardService';
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
import { Logger } from '../../services/LoggingService';
// MockDataConfigSection 제거됨 - DummyDataCardService 사용

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface DeveloperScreenProps {
  hideNavBar?: boolean;
}

const DeveloperScreen: React.FC<DeveloperScreenProps> = ({ hideNavBar = true }) => {
  const navigation = useNavigation<NavigationProp>();
  
  const { user: currentUser, setTestUser } = useUserStore();
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

  // Simplified State
  const [dataCount, setDataCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [userRole, setUserRole] = React.useState('');
  const [canAccessMockData, setCanAccessMockData] = React.useState(false);
  // selectedScenario 제거됨 - DummyDataCardService는 시나리오 불필요
  const [showPerformanceInfo, setShowPerformanceInfo] = React.useState(false);
  const [enableVerboseLogging, setEnableVerboseLogging] = React.useState(false);
  const [showDeveloperToasts, setShowDeveloperToasts] = React.useState(false);

  // 단순한 데이터 개수 확인
  const checkDataCount = async () => {
    try {
      const count = await DummyDataCardService.getDataCount();
      setDataCount(count);
      return count;
    } catch (error) {
      Logger.error('Error checking data count:', 'screen', { component: 'DeveloperScreen', error });
      setDataCount(0);
      return 0;
    }
  };

  // Simple initialization
  React.useEffect(() => {
    const init = async () => {
      try {
        const accessControl = AccessControlService.getInstance();
        await accessControl.initialize();
        const role = accessControl.getCurrentUserRole();
        setUserRole(role);
        setCanAccessMockData(role === 'developer' || role === 'admin');
        await checkDataCount();
      } catch (error) {
        Logger.error('Error initializing:', 'screen', { component: 'DeveloperScreen', error });
      }
    };
    init();
  }, []);

  // 단순한 mock data 생성 함수
  const createMockData = async () => {
    if (!canAccessMockData) {
      Alert.alert('권한 없음', '베타 사용자는 목 데이터에 접근할 수 없습니다.');
      return;
    }

    setIsLoading(true);
    try {
      Logger.debug('Creating simple mock records...', 'screen', { component: 'DeveloperScreen' });
      const successCount = await DummyDataCardService.createSimpleRecords();
      
      if (successCount > 0) {
        await checkDataCount();
        Alert.alert('완료', `${successCount}개의 테스트 데이터가 생성되었습니다.`);
        DeviceEventEmitter.emit('refreshData');
      } else {
        Alert.alert('오류', '테스트 데이터 생성에 실패했습니다.');
      }
    } catch (error) {
      Logger.error('Error creating mock data:', 'screen', { component: 'DeveloperScreen', error });
      Alert.alert('오류', '테스트 데이터 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Simple clear data function
  const clearAllData = async () => {
    if (!canAccessMockData) {
      Alert.alert('권한 없음', '베타 사용자는 목 데이터에 접근할 수 없습니다.');
      return;
    }

    const currentCount = await checkDataCount();
    if (currentCount === 0) {
      Alert.alert('정보', '삭제할 데이터가 없습니다.');
      return;
    }

    Alert.alert(
      '데이터 삭제',
      `현재 ${currentCount}개의 테스트 기록을 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const success = await DummyDataCardService.clearAllData();
              if (success) {
                await checkDataCount();
                Alert.alert('완료', '모든 데이터가 삭제되었습니다.');
                DeviceEventEmitter.emit('refreshData');
              } else {
                Alert.alert('오류', '데이터 삭제에 실패했습니다.');
              }
            } catch (error) {
              Logger.error('Error clearing data:', 'screen', { component: 'DeveloperScreen', error });
              Alert.alert('오류', '데이터 삭제 중 오류가 발생했습니다.');
            } finally {
              setIsLoading(false);
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
              Logger.error('Error resetting app:', 'screen', { component: 'DeveloperScreen', error: error });
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
          {!hideNavBar && (
            <NavigationBar>
              <BackButton onPress={goBack}>← 뒤로</BackButton>
              <NavigationTitle>개발자 모드</NavigationTitle>
              <View />
            </NavigationBar>
          )}

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
        {!hideNavBar && (
          <NavigationBar>
            <BackButton onPress={goBack}>← 뒤로</BackButton>
            <NavigationTitle>개발자 모드</NavigationTitle>
            <View />
          </NavigationBar>
        )}

        {/* Developer Warning */}
        <WarningCard>
          <XStack alignItems="center">
            <WarningIcon></WarningIcon>
            <WarningText>
              개발자 전용 도구입니다. 프로덕션 환경에서는 비활성화하세요.
            </WarningText>
          </XStack>
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

          {/* Simple Data Status Card */}
          <Card
            backgroundColor="$blue2"
            borderColor="$blue5"
            padding="$lg"
            marginBottom="$md"
            borderRadius="$4"
          >
            <Text fontSize="$4" fontWeight="700" color="$blue11" marginBottom="$md">
               데이터 상태
            </Text>
            <Text fontSize="$3" color="$blue11" marginBottom="$sm">
              현재 기록 수: {dataCount}개
            </Text>
            {isLoading && (
              <Text fontSize="$2" color="$blue9">
                처리 중...
              </Text>
            )}
          </Card>

          {/* Simple Actions */}
          <Card
            backgroundColor="$green2"
            borderColor="$green5"
            padding="$lg"
            marginBottom="$md"
            borderRadius="$4"
          >
            <Text fontSize="$4" fontWeight="700" color="$green11" marginBottom="$md">
              🛠️ 테스트 데이터 관리
            </Text>
            
            <XStack gap="$md" marginBottom="$md">
              <Text 
                fontSize="$3" 
                color="$green11" 
                backgroundColor="$green4"
                paddingVertical="$sm"
                paddingHorizontal="$md"
                borderRadius="$2"
                textAlign="center"
                onPress={createMockData}
                disabled={isLoading}
              >
                 3개 생성
              </Text>
              
              <Text 
                fontSize="$3" 
                color="$red11" 
                backgroundColor="$red4"
                paddingVertical="$sm"
                paddingHorizontal="$md"
                borderRadius="$2"
                textAlign="center"
                onPress={clearAllData}
                disabled={isLoading}
              >
                🗑️ 전체 삭제
              </Text>
            </XStack>
            
            <Text 
              fontSize="$3" 
              color="$blue11" 
              backgroundColor="$blue4"
              paddingVertical="$sm"
              paddingHorizontal="$md"
              borderRadius="$2"
              textAlign="center"
              onPress={checkDataCount}
              disabled={isLoading}
            >
               새로고침
            </Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </Container>
  );
};

export default DeveloperScreen;