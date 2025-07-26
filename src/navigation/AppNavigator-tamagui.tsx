import React, { useEffect, useRef } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../stores/useUserStore';
import { IOSColors, IOSLayout, IOSTypography, IOSShadows } from '../styles/ios-hig-2024';
// StatusBadge removed - status now shown in DummyDataInput floating button
// TabBarIcon import removed - not used
import ScreenContextService from '../services/ScreenContextService';
import LanguageSwitch from '../components/LanguageSwitch';

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
  FlavorCategoryDetailScreen,
  
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

import { Logger } from '../services/LoggingService';
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 공통 헤더 옵션 - StatusBadge 제거
const commonHeaderOptions = {
  // headerRight removed - status now shown in DummyDataInput floating button
};

// 테이스팅 플로우 스택 네비게이터
function TastingFlow() {
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
        presentation: 'card',
        ...commonHeaderOptions,
    }}
    >
      <Stack.Screen 
        name="ModeSelection" 
        component={ModeSelectionScreen} 
        options={{
          title: '모드 선택',
          headerRight: () => (
            <View style={{ marginRight: 16 }}>
              <LanguageSwitch compact />
            </View>
          ),
        }}
      />
      <Stack.Screen 
        name="CoffeeInfo" 
        component={CoffeeInfoScreen} 
        options={({navigation}) => ({
          title: '커피 정보',
          headerRight: () => (
            <Text 
              style={{
                fontSize: 15,
                color: '#007AFF',
                marginRight: 16,
              }}
              onPress={() => navigation.navigate('UnifiedFlavor' as never)}
            >
              건너뛰기
            </Text>
          ),
        })}
      />
      <Stack.Screen 
        name="HomeCafe" 
        component={HomeCafeScreen} 
        options={{title: '홈카페'}}
      />
      <Stack.Screen 
        name="LabMode" 
        component={LabModeScreen} 
        options={{title: '랩 모드'}}
      />
      <Stack.Screen 
        name="RoasterNotes" 
        component={RoasterNotesScreen} 
        options={{title: '로스터 노트'}}
      />
      <Stack.Screen 
        name="UnifiedFlavor" 
        component={UnifiedFlavorScreen} 
        options={{title: '향미 선택'}}
      />
      <Stack.Screen 
        name="Sensory" 
        component={SensoryScreen} 
        options={({navigation}) => ({
          title: '감각 평가',
          headerRight: () => (
            <Text 
              style={{
                fontSize: 15,
                color: '#007AFF',
                marginRight: 16,
              }}
              onPress={() => navigation.navigate('PersonalComment' as never)}
            >
              건너뛰기
            </Text>
          ),
        })}
      />
      <Stack.Screen 
        name="ExperimentalData" 
        component={ExperimentalDataScreen} 
        options={{title: '실험 데이터'}}
      />
      <Stack.Screen 
        name="SensoryEvaluation" 
        component={SensoryEvaluationScreen} 
        options={{title: '감각 평가'}}
      />
      <Stack.Screen 
        name="PersonalComment" 
        component={PersonalCommentScreen} 
        options={({navigation}) => ({
          title: '개인 평가',
          headerRight: () => (
            <Text 
              style={{
                fontSize: 15,
                color: '#007AFF',
                marginRight: 16,
              }}
              onPress={() => navigation.navigate('Result' as never)}
            >
              건너뛰기
            </Text>
          ),
        })}
      />
      <Stack.Screen 
        name="Result" 
        component={ResultScreen} 
        options={{title: '결과'}}
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
        name="FlavorCategoryDetail" 
        component={FlavorCategoryDetailScreen}
        options={{
          title: '향미 상세',
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
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      detachInactiveScreens={true}
      screenOptions={({ route }) => ({
        tabBarShowIcon: true,
        tabBarIcon: ({ focused, color }) => (
          <View style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: focused ? '#007AFF' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
          }}>
            <Text style={{
              fontSize: 13,
              fontWeight: '600',
              color: focused ? 'white' : '#8E8E93',
            }}>
              {route.name === 'Home' ? '홈' : 
               route.name === 'Journal' ? '저널' : 
               route.name === 'AddRecord' ? '기록' : 
               route.name === 'Admin' ? '관리' :
               route.name === 'UserProfile' ? '프로필' : 
               route.name === 'Settings' ? '세팅' : ''}
            </Text>
          </View>
        ),
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          height: 60 + Math.max(insets.bottom, 0),
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
          fontSize: 0, // Hide text labels since text is now inside the icon
          height: 0,
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
          tabBarLabel: '',
          headerTitle: 'CupNote',
      }}
      />
      <Tab.Screen 
        name="Journal" 
        component={JournalIntegratedScreen}
        options={{
          tabBarLabel: '',
          headerTitle: 'CupNote',
      }}
      />
      <Tab.Screen 
        name="AddRecord" 
        component={TastingFlow}
        options={{
          tabBarLabel: '',
          headerShown: false,
      }}
      />
      {isAdmin && (
        <Tab.Screen 
          name="Admin" 
          component={AdminStack}
          options={{
            tabBarLabel: '',
            headerShown: false,
        }}
        />
      )}
      <Tab.Screen 
        name="UserProfile" 
        component={AchievementStack}
        options={{
          tabBarLabel: '',
          headerShown: false,
      }}
      />
      <Tab.Screen 
        name="Settings" 
        component={ProfileStack}
        options={{
          tabBarLabel: '',
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
  const navigationRef = useRef<unknown>(null);
  const routeNameRef = useRef<string | undefined>(undefined);
  
  Logger.debug('AppNavigator render - isAuthenticated:', 'general', { component: 'AppNavigator-tamagui', data: isAuthenticated });

  useEffect(() => {
    // 네비게이션 상태 변경 추적
    return () => {};
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
      ScreenContextService.updateContext(routeNameRef.current || 'Unknown');
  } catch (error) {
      Logger.warn('Navigation ready error:', 'general', { component: 'AppNavigator-tamagui', error: error });
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
      Logger.warn('Navigation state change error:', 'general', { component: 'AppNavigator-tamagui', error: error });
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