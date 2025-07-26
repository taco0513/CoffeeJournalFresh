import React, { useEffect, useRef } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { Text, View, useTheme } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../stores/useUserStore';
import StatusBadge from '../components/StatusBadge';
// TabBarIcon import removed - not using icons
import ScreenContextService from '../services/ScreenContextService';

// All screens from Tamagui! Complete migration achieved!
import {
  // Core App Screens
  HomeScreen,
  ModeSelectionScreen,
  OnboardingScreen,
  
  // Tasting Flow
  CoffeeInfoScreen,
  SensoryScreen,
  PersonalCommentScreen,
  ResultScreen,
  HomeCafeScreen,
  UnifiedFlavorScreen,
  RoasterNotesScreen,
  ExperimentalDataScreen,
  SensoryEvaluationScreen,
  
  // Enhanced Features
  EnhancedHomeCafeScreen,
  LabModeScreen,
  OptimizedUnifiedFlavorScreen,
  
  // Journal & Profile
  JournalIntegratedScreen,
  ProfileScreen,
  TastingDetailScreen,
  PersonalTasteDashboard,
  
  // Analytics & Media
  StatsScreen,
  PhotoGalleryScreen,
  PhotoViewerScreen,
  SearchScreen,
  MarketIntelligenceScreen,
  
  // Achievements
  AchievementGalleryScreen,
  
  // Development & Admin
  DeveloperScreen,
  DataTestScreen,
  PerformanceDashboardScreen,
  ProfileSetupScreen,
  PerformanceTestingScreen,
} from '../screens-tamagui';

// Import dedicated Navigation HistoryScreen
import NavigationHistoryScreen from '../screens-tamagui/analytics/NavigationHistoryScreen';

// Admin screens (not yet migrated to Tamagui)
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminCoffeeEditScreen } from '../screens/admin/AdminCoffeeEditScreen';
import AdminFeedbackScreen from '../screens/admin/AdminFeedbackScreen';

// Testing screens
import I18nValidationScreen from '../components/testing/I18nValidationScreen';
import MarketConfigurationTester from '../components/testing/MarketConfigurationTester';
import BetaTestingScreen from '../screens/BetaTestingScreen';
import CrossMarketTestingScreen from '../components/testing/CrossMarketTestingScreen';

// Legal screen (not yet migrated)
import LegalScreen from '../screens/LegalScreen';

// Auth screens (not yet migrated)
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// Context providers
import { FeedbackProvider } from '../components/feedback';
import { AchievementProvider } from '../contexts/AchievementContext';
import { RealmProvider } from '../contexts/RealmContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Logger } from '../services/LoggingService';
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 공통 헤더 옵션
const commonHeaderOptions = {
  headerRight: () => <StatusBadge />,
  headerRightContainerStyle: {
    paddingRight: 16,
},
};

// 테이스팅 플로우 스택 네비게이터
function TastingFlow() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'card',
    }}
    >
      <Stack.Screen 
        name="ModeSelection" 
        component={ModeSelectionScreen} 
        options={{title: 'Mode Selection'}}
      />
      <Stack.Screen 
        name="CoffeeInfo" 
        component={CoffeeInfoScreen} 
        options={{title: 'Coffee Info'}}
      />
      <Stack.Screen 
        name="HomeCafe" 
        component={HomeCafeScreen} 
        options={{title: 'Home Cafe'}}
      />
      <Stack.Screen 
        name="RoasterNotes" 
        component={RoasterNotesScreen} 
        options={{title: 'Roaster Notes'}}
      />
      <Stack.Screen 
        name="UnifiedFlavor" 
        component={UnifiedFlavorScreen} 
        options={{title: 'Select Flavors'}}
      />
      <Stack.Screen 
        name="Sensory" 
        component={SensoryScreen} 
        options={{title: 'Sensory Evaluation'}}
      />
      <Stack.Screen 
        name="ExperimentalData" 
        component={ExperimentalDataScreen} 
        options={{title: 'Experimental Data'}}
      />
      <Stack.Screen 
        name="SensoryEvaluation" 
        component={SensoryEvaluationScreen} 
        options={{title: 'Sensory Evaluation'}}
      />
      <Stack.Screen 
        name="PersonalComment" 
        component={PersonalCommentScreen} 
        options={{title: 'Personal Comment'}}
      />
      <Stack.Screen 
        name="Result" 
        component={ResultScreen} 
        options={{title: 'Tasting Results'}}
      />
    </Stack.Navigator>
  );
}

// 히스토리 스택 네비게이터
function HistoryStack() {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      initialRouteName="Profile"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.background.val,
          borderBottomWidth: 0.5,
          borderBottomColor: theme.borderColor.val,
      },
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '600',
          color: theme.color.val,
      },
        headerTintColor: theme.blue10.val,
        ...commonHeaderOptions,
    }}
    >
      <Stack.Screen 
        name="Profile" 
        component={NavigationHistoryScreen}
        options={{
          title: '내 프로필',
      }}
      />
      <Stack.Screen 
        name="TastingDetail" 
        component={TastingDetailScreen}
        options={{
          title: '상세 기록',
      }}
      />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          title: '검색',
      }}
      />
      <Stack.Screen 
        name="PhotoViewer" 
        component={PhotoViewerScreen}
        options={{
          title: '사진 보기',
          headerShown: false,
      }}
      />
    </Stack.Navigator>
  );
}

// 프로필 스택 네비게이터
function ProfileStack() {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.background.val,
          borderBottomWidth: 0.5,
          borderBottomColor: theme.borderColor.val,
      },
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '600',
          color: theme.color.val,
      },
        headerTintColor: theme.blue10.val,
        ...commonHeaderOptions,
    }}
    >
      <Stack.Screen 
        name="SettingsMain" 
        component={ProfileScreen}
        options={{
          title: '세팅',
      }}
      />
      <Stack.Screen 
        name="Developer" 
        component={DeveloperScreen}
        options={{
          title: '개발자 옵션',
      }}
      />
      <Stack.Screen 
        name="DataTest" 
        component={DataTestScreen}
        options={{
          title: '데이터 테스트',
      }}
      />
      <Stack.Screen 
        name="I18nValidation" 
        component={I18nValidationScreen}
        options={{
          title: 'i18n 검증',
      }}
      />
      <Stack.Screen 
        name="MarketConfigurationTester" 
        component={MarketConfigurationTester}
        options={{
          title: '마켓 설정 테스터',
      }}
      />
      <Stack.Screen 
        name="BetaTesting" 
        component={BetaTestingScreen}
        options={{
          title: '베타 테스팅',
      }}
      />
      <Stack.Screen 
        name="CrossMarketTesting" 
        component={CrossMarketTestingScreen}
        options={{
          title: '크로스 마켓 테스팅',
      }}
      />
      <Stack.Screen 
        name="PhotoGallery" 
        component={PhotoGalleryScreen}
        options={{
          title: '사진 갤러리',
      }}
      />
      <Stack.Screen 
        name="Stats" 
        component={StatsScreen}
        options={{
          title: '통계',
      }}
      />
      <Stack.Screen 
        name="PersonalTaste" 
        component={PersonalTasteDashboard}
        options={{
          title: '내 취향 분석',
      }}
      />
      <Stack.Screen 
        name="AchievementGallery" 
        component={AchievementGalleryScreen}
        options={{
          title: '성취',
      }}
      />
      <Stack.Screen 
        name="PerformanceDashboard" 
        component={PerformanceDashboardScreen}
        options={{
          title: '성능 대시보드',
      }}
      />
      <Stack.Screen 
        name="PerformanceTesting" 
        component={PerformanceTestingScreen}
        options={{
          title: '성능 테스트',
      }}
      />
      <Stack.Screen 
        name="MarketIntelligence" 
        component={MarketIntelligenceScreen}
        options={{
          title: '시장 인텔리전스',
      }}
      />
      <Stack.Screen 
        name="Legal" 
        component={LegalScreen}
        options={{
          title: '법적 고지',
      }}
      />
    </Stack.Navigator>
  );
}

// 메인 탭 네비게이터
function MainTabs() {
  const user = useUserStore((state) => state.user);
  const isAdmin = user?.email === 'hello@zimojin.com' || user?.isModerator === true;
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <Tab.Navigator
      detachInactiveScreens={true}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.background.val,
          borderBottomWidth: 0.5,
          borderBottomColor: theme.borderColor.val,
      },
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '600',
          color: theme.color.val,
      },
        tabBarActiveTintColor: theme.blue10.val,
        tabBarInactiveTintColor: theme.gray8.val,
        tabBarStyle: {
          backgroundColor: theme.background.val,
          borderTopWidth: 1,
          borderTopColor: theme.borderColor.val,
          paddingBottom: 35,
          height: 95,
          marginBottom: 10,
      },
        ...commonHeaderOptions,
    }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          headerTitle: 'CupNote',
          // Icon removed
      }}
      />
      <Tab.Screen 
        name="Journal" 
        component={JournalIntegratedScreen}
        options={{
          tabBarLabel: '저널',
          headerTitle: 'CupNote',
          // Icon removed
      }}
      />
      <Tab.Screen 
        name="AddRecord" 
        component={TastingFlow}
        options={{
          tabBarLabel: '기록하기',
          headerShown: false,
          // Icon removed
      }}
      />
      {isAdmin && (
        <Tab.Screen 
          name="Admin" 
          component={AdminStack}
          options={{
            tabBarLabel: '관리자',
            headerShown: false,
            // Icon removed
        }}
        />
      )}
      <Tab.Screen 
        name="UserProfile" 
        component={HistoryStack}
        options={{
          tabBarLabel: '프로필',
          headerShown: false,
          // Icon removed
      }}
      />
      <Tab.Screen 
        name="Settings" 
        component={ProfileStack}
        options={{
          tabBarLabel: '세팅',
          headerShown: false,
          // Icon removed
      }}
      />
    </Tab.Navigator>
  );
}

// 관리자 스택 네비게이터
function AdminStack() {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.background.val,
          borderBottomWidth: 0.5,
          borderBottomColor: theme.borderColor.val,
      },
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '600',
          color: theme.color.val,
      },
        headerTintColor: theme.blue10.val,
        ...commonHeaderOptions,
    }}
    >
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen}
        options={{
          title: '관리자 대시보드',
      }}
      />
      <Stack.Screen 
        name="AdminCoffeeEdit" 
        component={AdminCoffeeEditScreen}
        options={{
          title: '커피 편집',
      }}
      />
      <Stack.Screen 
        name="AdminFeedback" 
        component={AdminFeedbackScreen}
        options={{
          title: '피드백 관리',
      }}
      />
    </Stack.Navigator>
  );
}

// 인증 스택 네비게이터
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
    }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen 
        name="ProfileSetup" 
        component={(props: Record<string, unknown>) => (
          <ProfileSetupScreen 
            {...props}
            onComplete={() => {
              // Navigate to main app after profile setup is complete
              props.navigation.replace('Main');
          }} 
          />
        )} 
      />
    </Stack.Navigator>
  );
}

// 메인 네비게이터
export default function AppNavigator() {
  const { isAuthenticated, user, currentUser, loadStoredUser } = useUserStore();
  const isInitialized = true; // For now, assume it's initialized
  const navigationRef = useRef<unknown>(null);
  const routeNameRef = useRef<string | undefined>(undefined);
  const [navigationReady, setNavigationReady] = React.useState(false);
  
  // Load stored user on app start
  useEffect(() => {
    if (loadStoredUser) {
      loadStoredUser();
  }
}, [loadStoredUser]);
  

  useEffect(() => {
    // Ensure navigation is fully ready
    const timer = setTimeout(() => {
      setNavigationReady(true);
  }, 500);
    
    return () => clearTimeout(timer);
}, []);

  const getCurrentRoute = (state: Record<string, unknown>): unknown => {
    if (!state) return null;
    const route = state.routes?.[state.index];
    if (route?.state) {
      return getCurrentRoute(route.state);
  }
    return route;
};

  const onReady = () => {
    try {
      const state = navigationRef.current?.getRootState();
      const currentRoute = getCurrentRoute(state);
      routeNameRef.current = currentRoute?.name;
  } catch (error) {
      Logger.warn('Navigation ready error:', 'general', { component: 'AppNavigator', error: error });
  }
};

  const onStateChange = async () => {
    try {
      const previousRouteName = routeNameRef.current;
      const state = navigationRef.current?.getRootState();
      const currentRoute = getCurrentRoute(state);
      const currentRouteName = currentRoute?.name;

    if (previousRouteName !== currentRouteName) {
      // 화면 전환 추적
      // ScreenContextService.setCurrentScreen(currentRouteName || ''); // Disabled for now
      
      // AsyncStorage에 마지막 방문 화면 저장 (선택사항)
      if (currentRouteName) {
        await AsyncStorage.setItem('lastVisitedScreen', currentRouteName);
    }
  }

      routeNameRef.current = currentRouteName;
  } catch (error) {
      Logger.warn('Navigation state change error:', 'general', { component: 'AppNavigator', error: error });
  }
};

  // Check for first time launch
  const [isFirstLaunch, setIsFirstLaunch] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    AsyncStorage.getItem('hasLaunched').then((value: string | null) => {
      if (value === null) {
        AsyncStorage.setItem('hasLaunched', 'true');
        setIsFirstLaunch(true);
    } else {
        setIsFirstLaunch(false);
    }
  });
}, []);

  Logger.debug('AppNavigator state:', 'general', { component: 'AppNavigator', data: { isInitialized, isAuthenticated, isFirstLaunch } });
  
  if (!isInitialized || isFirstLaunch === null) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Text fontSize="$5" color="$color">Loading CupNote...</Text>
      </View>
    );
}

  return (
    <RealmProvider>
      <AchievementProvider>
        <FeedbackProvider>
          <NavigationContainer 
            ref={navigationRef}
            onReady={() => {
              onReady();
              setNavigationReady(true);
          }}
            onStateChange={onStateChange}
          >
            <Stack.Navigator 
              screenOptions={{ 
                headerShown: false,
                gestureEnabled: navigationReady,
                animation: navigationReady ? 'default' : 'none',
            }}
            >
              {isFirstLaunch ? (
                <>
                  <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                  {!isAuthenticated && (
                    <Stack.Screen name="Auth" component={AuthStack} />
                  )}
                </>
              ) : (
                <>
                  {isAuthenticated ? (
                    <>
                      <Stack.Screen name="Main" component={MainTabs} />
                      <Stack.Screen name="TastingFlow" component={TastingFlow} />
                      <Stack.Screen 
                        name="EnhancedHomeCafe" 
                        component={EnhancedHomeCafeScreen}
                        options={{ title: '홈카페 프로' }}
                      />
                      <Stack.Screen 
                        name="LabMode" 
                        component={LabModeScreen}
                        options={{ title: '랩 모드' }}
                      />
                    </>
                  ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                  )}
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </FeedbackProvider>
      </AchievementProvider>
    </RealmProvider>
  );
}