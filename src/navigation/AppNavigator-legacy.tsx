import React, { useEffect, useRef } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useUserStore } from '../stores/useUserStore';
import { HIGColors } from '../styles/common';
import { IOSColors, IOSLayout, IOSTypography, IOSShadows } from '../styles/ios-hig-2024';
import StatusBadge from '../components/StatusBadge';
import { TabBarIcon } from '../components/TabBarIcon';
import ScreenContextService from '../services/ScreenContextService';

// 화면 import - Tamagui optimized versions from organized structure
import {
  HomeScreen,
  ModeSelectionScreen,
  CoffeeInfoScreen,
  SensoryScreen as SensoryScreenTamagui,
  PersonalCommentScreen as PersonalCommentScreenTamagui,
  ResultScreen as ResultScreenTamagui,
  HomeCafeScreen as HomeCafeScreenTamagui,
  UnifiedFlavorScreen,
  JournalIntegratedScreen as JournalIntegratedScreenTamagui,
  ProfileScreen as ProfileScreenTamagui,
} from '../screens-tamagui';

// Original screens (fallback for screens without Tamagui versions)
import RoasterNotesScreen from '../screens/RoasterNotesScreen';
import ExperimentalDataScreen from '../screens/ExperimentalDataScreen';
import SensoryEvaluationScreen from '../screens/SensoryEvaluationScreen';
import SearchScreen from '../screens/SearchScreen';
import TastingDetailScreen from '../screens/TastingDetailScreen';
import DataTestScreen from '../screens/DataTestScreen';

// Admin and other screens
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminCoffeeEditScreen } from '../screens/admin/AdminCoffeeEditScreen';
import DeveloperScreen from '../screens/DeveloperScreen';
import AdminFeedbackScreen from '../screens/admin/AdminFeedbackScreen';
import AchievementGalleryScreen from '../screens/AchievementGalleryScreen';

// Testing screens
import I18nValidationScreen from '../components/testing/I18nValidationScreen';
import MarketConfigurationTester from '../components/testing/MarketConfigurationTester';
import BetaTestingScreen from '../screens/BetaTestingScreen';
import CrossMarketTestingScreen from '../components/testing/CrossMarketTestingScreen';

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
        component={HomeCafeScreenTamagui} 
        options={{title: 'Home Cafe'}}
      />
      <Stack.Screen 
        name="RoasterNotes" 
        component={RoasterNotesScreen} 
        options={{title: 'Roaster Notes'}}
      />
      {/* New unified flavor selection */}
      <Stack.Screen 
        name="UnifiedFlavor" 
        component={UnifiedFlavorScreen} 
        options={{title: 'Select Flavors'}}
      />
      <Stack.Screen 
        name="Sensory" 
        component={SensoryScreenTamagui} 
        options={{title: 'Sensory Evaluation'}}
      />
      {/* Home Cafe Mode: Separate screens for experimental data and sensory evaluation */}
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
        component={PersonalCommentScreenTamagui} 
        options={{title: 'Personal Comment'}}
      />
      <Stack.Screen 
        name="Result" 
        component={ResultScreenTamagui} 
        options={{title: 'Tasting Results'}}
      />
      {/* OCR Screens moved to feature_backlog */}
      {/* <Stack.Screen 
        name="OCRScan" 
        component={OCRScanScreen} 
        options={{title: 'Scan Coffee Label'}}
      />
      <Stack.Screen 
        name="OCRResult" 
        component={OCRResultScreen} 
        options={{title: 'OCR Results'}}
      /> */}
    </Stack.Navigator>
  );
}

// 히스토리 스택 네비게이터
function HistoryStack() {
  return (
    <Stack.Navigator
      initialRouteName="HistoryMain"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: HIGColors.label,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
        ...commonHeaderOptions,
      }}
    >
      <Stack.Screen 
        name="HistoryMain" 
        component={JournalIntegratedScreenTamagui} 
        options={{headerShown: false}}
      />
      <Stack.Screen 
        name="TastingDetail" 
        component={TastingDetailScreen} 
        options={{title: 'Tasting Details'}}
      />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{title: 'Search'}}
      />
      {/* Feature Backlog - Community Share */}
      {/* <Stack.Screen 
        name="ShareReview" 
        component={ShareReviewScreen} 
        options={{title: 'Share Review'}}
      /> */}
    </Stack.Navigator>
  );
}

// StatsStack 제거 - Stats 탭에서 직접 StatsScreen 사용


// 프로필 스택 네비게이터
function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Disable stack headers to use custom headers
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: HIGColors.label,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
        ...commonHeaderOptions,
        presentation: 'card',
        animationTypeForReplace: 'push',
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
            overlayStyle: {
              opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
                extrapolate: 'clamp',
              }),
            },
          };
        },
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 300,
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 300,
            },
          },
        },
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreenTamagui} 
        options={{title: 'Profile'}}
      />
      <Stack.Screen 
        name="AchievementGallery" 
        component={AchievementGalleryScreen} 
        options={{title: 'Achievements'}}
      />
      <Stack.Screen 
        name="DataTest" 
        component={DataTestScreen} 
        options={{title: 'Data Test'}}
      />
      {/* Cross-Market Testing Screens */}
      <Stack.Screen 
        name="CrossMarketTesting" 
        component={CrossMarketTestingScreen} 
        options={{title: 'Cross-Market Testing'}}
      />
      <Stack.Screen 
        name="I18nValidation" 
        component={I18nValidationScreen} 
        options={{title: 'I18n Validation'}}
      />
      <Stack.Screen 
        name="MarketConfigurationTester" 
        component={MarketConfigurationTester} 
        options={{title: 'Market Configuration Tester'}}
      />
      <Stack.Screen 
        name="BetaTestingScreen" 
        component={BetaTestingScreen} 
        options={{title: 'Beta Testing Dashboard'}}
      />
      {/* Feature Backlog - Photo features */}
      {/* <Stack.Screen 
        name="PhotoGallery" 
        component={PhotoGalleryScreen} 
        options={{title: 'Photo Gallery'}}
      />
      <Stack.Screen 
        name="PhotoViewer" 
        component={PhotoViewerScreen} 
        options={{
          title: 'Photo Viewer',
          headerShown: false,
        }}
      /> */}
    </Stack.Navigator>
  );
}

// 메인 탭 네비게이터 래퍼
function MainTabsWrapper({ navigation: parentNavigation }: { navigation: any }) {
  return <MainTabs parentNavigation={parentNavigation} />;
}

// 메인 탭 네비게이터
function MainTabs({ parentNavigation }: { parentNavigation: any }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: IOSColors.systemBackground,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: IOSLayout.borderWidthThin,
          borderBottomColor: IOSColors.separator,
        },
        headerTintColor: IOSColors.label,
        headerTitleStyle: IOSTypography.headline,
        ...commonHeaderOptions,
        tabBarStyle: {
          backgroundColor: IOSColors.systemBackground,
          borderTopColor: IOSColors.separator,
          borderTopWidth: IOSLayout.borderWidthThin,
          height: IOSLayout.tabBarHeight + 34,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          ...IOSTypography.caption2,
          fontSize: 10,
        },
        tabBarActiveTintColor: IOSColors.systemBrown,
        tabBarInactiveTintColor: IOSColors.secondaryLabel,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          headerShown: false, // HomeScreen has its own navigation
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Journal" 
        component={HistoryStack} 
        options={{
          headerShown: false, // HistoryStack has its own navigation
          tabBarLabel: 'Journal',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="journal" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="AddCoffee" 
        component={View} // Placeholder component
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused, color }) => (
            <View style={{
              position: 'absolute',
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: IOSColors.systemBlue,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}>
                <Text style={{ fontSize: 32, color: '#FFF', fontWeight: '300' as const }}>+</Text>
              </View>
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            parentNavigation.navigate('TastingFlow', { screen: 'ModeSelection' });
          },
        }}
      />
      <Tab.Screen 
        name="Achievements" 
        component={AchievementGalleryScreen} 
        options={{
          headerShown: false,
          tabBarLabel: '업적',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="achievements" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack} 
        options={{
          headerShown: false, // ProfileStack has its own navigation
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="profile" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}


function AppNavigator() {
  // Skip authentication entirely - go directly to main app
  const { loadStoredUser } = useUserStore();
  const navigationRef = useRef<any>(null);
  
  useEffect(() => {
    // Initialize app without authentication check
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Load any stored user data if available
      await loadStoredUser();
      
      // Set navigation reference for ScreenContextService
      if (navigationRef.current) {
        ScreenContextService.setNavigationRef(navigationRef.current);
      }
    } catch (error) {
      // Continue without stored data
    }
  };

  return (
    <RealmProvider>
      <AchievementProvider>
        <FeedbackProvider>
          <NavigationContainer 
            ref={navigationRef}
            onReady={() => {
              // Set navigation reference when ready
              ScreenContextService.setNavigationRef(navigationRef.current);
            }}
          >
          <Stack.Navigator 
            initialRouteName="MainTabs"
            screenOptions={{
              headerShown: false,
              presentation: 'card',
            }}
          >
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabsWrapper} 
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="TastingFlow" 
              component={TastingFlow} 
              options={{
                presentation: 'card',
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="AdminDashboard" 
              component={AdminDashboardScreen}
              options={{
                headerShown: true,
                headerTitle: '관리자 대시보드',
              }}
            />
            <Stack.Screen 
              name="AdminCoffeeEdit" 
              component={AdminCoffeeEditScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="AdminFeedback" 
              component={AdminFeedbackScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="DeveloperScreen" 
              component={DeveloperScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="TastingDetail" 
              component={TastingDetailScreen}
              options={{
                headerShown: true,
                title: 'Tasting Details',
                headerStyle: {
                  backgroundColor: '#FFFFFF',
                },
                headerTintColor: HIGColors.label,
                headerTitleStyle: {
                  fontWeight: '600',
                  fontSize: 17,
                },
                ...commonHeaderOptions,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </FeedbackProvider>
    </AchievementProvider>
  </RealmProvider>
  );
}

export default AppNavigator;