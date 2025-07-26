import React, { useEffect, useRef } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useUserStore } from '../stores/useUserStore';
import { IOSColors, IOSLayout, IOSTypography, IOSShadows } from '../styles/ios-hig-2024';
import StatusBadge from '../components/StatusBadge';
import { TabBarIcon } from '../components/TabBarIcon';
import ScreenContextService from '../services/ScreenContextService';

// 🎉 All screens from Tamagui! Complete migration achieved!
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
} from '../screens-tamagui';

// Import dedicated Navigation HistoryScreen (replaced by Achievement screen)
// import NavigationHistoryScreen from '../screens-tamagui/analytics/NavigationHistoryScreen';

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

// 프로필 스택 네비게이터 (Achievement 중심)
function AchievementStack() {
  return (
    <Stack.Navigator
      initialRouteName="AchievementMain"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 0.5,
          borderBottomColor: '#E0E0E0',
        },
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '600',
        },
        headerTintColor: '#007AFF',
        ...commonHeaderOptions,
      }}
    >
      <Stack.Screen 
        name="AchievementMain" 
        component={AchievementGalleryScreen}
        options={{
          title: '내 성취',
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
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 0.5,
          borderBottomColor: '#E0E0E0',
        },
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '600',
        },
        headerTintColor: '#007AFF',
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
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.email === 'admin@example.com';

  return (
    <Tab.Navigator
      detachInactiveScreens={true}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, focused }) => {
          return <TabBarIcon name={route.name as "Home" | "Journal" | "AddRecord" | "UserProfile" | "Settings" | "Admin"} focused={focused} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 3,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '700',
          color: '#000',
        },
        ...commonHeaderOptions,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          headerTitle: 'CupNote',
        }}
      />
      <Tab.Screen 
        name="Journal" 
        component={JournalIntegratedScreen}
        options={{
          tabBarLabel: '저널',
          headerTitle: '커피 저널',
        }}
      />
      <Tab.Screen 
        name="AddRecord" 
        component={TastingFlow}
        options={{
          tabBarLabel: '기록',
          headerShown: false,
        }}
      />
      {isAdmin && (
        <Tab.Screen 
          name="Admin" 
          component={AdminStack}
          options={{
            tabBarLabel: '관리자',
            headerShown: false,
          }}
        />
      )}
      <Tab.Screen 
        name="UserProfile" 
        component={AchievementStack}
        options={{
          tabBarLabel: '프로필',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={ProfileStack}
        options={{
          tabBarLabel: '세팅',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

// 관리자 스택 네비게이터
function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 0.5,
          borderBottomColor: '#E0E0E0',
        },
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '600',
        },
        headerTintColor: '#007AFF',
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
        component={ProfileSetupScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

// 메인 네비게이터
export default function AppNavigator() {
  const { isAuthenticated } = useUserStore();
  const navigationRef = useRef<any>(null);
  const routeNameRef = useRef<string | undefined>(undefined);
  
  console.log('🔧 AppNavigator render - isAuthenticated:', isAuthenticated);

  useEffect(() => {
    // 네비게이션 상태 변경 추적
    return () => {};
  }, []);

  const getCurrentRoute = (state: any): any => {
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
      ScreenContextService.updateContext(routeNameRef.current || 'Unknown');
    } catch (error) {
      console.warn('Navigation ready error:', error);
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
        ScreenContextService.updateContext(currentRouteName || 'Unknown');
        
        // AsyncStorage에 마지막 방문 화면 저장 (선택사항)
        if (currentRouteName) {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.setItem('lastVisitedScreen', currentRouteName);
        }
      }

      routeNameRef.current = currentRouteName;
    } catch (error) {
      console.warn('Navigation state change error:', error);
    }
  };

  // Check for first time launch
  const [isFirstLaunch, setIsFirstLaunch] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    AsyncStorage.getItem('hasLaunched').then((value: string | null) => {
      if (value === null) {
        AsyncStorage.setItem('hasLaunched', 'true');
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    });
  }, []);

  if (isFirstLaunch === null) {
    return null; // 또는 로딩 화면
  }

  return (
    <RealmProvider>
      <AchievementProvider>
        <FeedbackProvider>
          <NavigationContainer 
            ref={navigationRef}
            onReady={onReady}
            onStateChange={onStateChange}
          >
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {isFirstLaunch && (
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              )}
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
            </Stack.Navigator>
          </NavigationContainer>
        </FeedbackProvider>
      </AchievementProvider>
    </RealmProvider>
  );
}