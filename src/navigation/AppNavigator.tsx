import React, { useEffect, useState, useRef } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator } from 'react-native';
import AuthService from '../services/supabase/auth';
import { useUserStore } from '../stores/useUserStore';
import { HIGColors } from '../styles/common';
import StatusBadge from '../components/StatusBadge';
import ScreenContextService from '../services/ScreenContextService';

// 화면 import
import HomeScreen from '../screens/HomeScreen';
import CoffeeInfoScreen from '../screens/CoffeeInfoScreen';
import HistoryScreen from '../screens/HistoryScreen';
import StatsScreen from '../screens/StatsScreen';
import JournalIntegratedScreen from '../screens/JournalIntegratedScreen';
import RoasterNotesScreen from '../screens/RoasterNotesScreen';
import FlavorLevel1Screen from '../screens/flavor/FlavorLevel1Screen';
import FlavorLevel2Screen from '../screens/flavor/FlavorLevel2Screen';
import FlavorLevel3Screen from '../screens/flavor/FlavorLevel3Screen';
import UnifiedFlavorScreen from '../screens/flavor/UnifiedFlavorScreen';
import SensoryScreen from '../screens/SensoryScreen';
import PersonalCommentScreen from '../screens/PersonalCommentScreen';
import ResultScreen from '../screens/ResultScreen';
import OCRScanScreen from '../screens/OCRScanScreen';
import OCRResultScreen from '../screens/OCRResultScreen';
import SearchScreen from '../screens/SearchScreen';
import TastingDetailScreen from '../screens/TastingDetailScreen';
import DataTestScreen from '../screens/DataTestScreen';
import ProfileScreen from '../screens/ProfileScreen';
// Feature Backlog - Photo features
// import PhotoGalleryScreen from '../screens/PhotoGalleryScreen';
// import PhotoViewerScreen from '../screens/PhotoViewerScreen';
import CommunityFeedScreen from '../screens/CommunityFeedScreen';
import CommunityReviewScreen from '../screens/CommunityReviewScreen';
import ShareReviewScreen from '../screens/ShareReviewScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminCoffeeEditScreen } from '../screens/admin/AdminCoffeeEditScreen';
import DeveloperScreen from '../screens/DeveloperScreen';
import AdminFeedbackScreen from '../screens/admin/AdminFeedbackScreen';
import { FeedbackProvider } from '../components/feedback';
import OnboardingScreen from '../screens/OnboardingScreen';
import { AchievementGalleryScreen } from '../screens/AchievementGalleryScreen';
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
        name="CoffeeInfo" 
        component={CoffeeInfoScreen} 
        options={{title: 'Coffee Info'}}
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
      {/* Legacy flavor screens - to be removed */}
      <Stack.Screen 
        name="FlavorLevel1" 
        component={FlavorLevel1Screen} 
        options={{title: 'Select Category'}}
      />
      <Stack.Screen 
        name="FlavorLevel2" 
        component={FlavorLevel2Screen} 
        options={{title: 'Select Subcategory'}}
      />
      <Stack.Screen 
        name="FlavorLevel3" 
        component={FlavorLevel3Screen} 
        options={{title: 'Select Flavor'}}
      />
      <Stack.Screen 
        name="Sensory" 
        component={SensoryScreen} 
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
      <Stack.Screen 
        name="OCRScan" 
        component={OCRScanScreen} 
        options={{title: 'Scan Coffee Label'}}
      />
      <Stack.Screen 
        name="OCRResult" 
        component={OCRResultScreen} 
        options={{title: 'OCR Results'}}
      />
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
        component={JournalIntegratedScreen} 
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

// 커뮤니티 스택 네비게이터 (Feature Backlog)
function CommunityStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: HIGColors.label,
        headerTitleStyle: {
          fontWeight: 'bold',
          color: HIGColors.label,
        },
        ...commonHeaderOptions,
      }}
    >
      <Stack.Screen 
        name="CommunityFeed" 
        component={CommunityFeedScreen} 
        options={{title: 'Community'}}
      />
      <Stack.Screen 
        name="CommunityReview" 
        component={CommunityReviewScreen} 
        options={{title: 'Review Details'}}
      />
      <Stack.Screen 
        name="ShareReview" 
        component={ShareReviewScreen} 
        options={{title: 'Share Review'}}
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
        component={ProfileScreen} 
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

// 메인 탭 네비게이터
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0.5,
          borderBottomColor: '#E0E0E0',
        },
        headerTintColor: HIGColors.label,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
        ...commonHeaderOptions,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E0E0E0',
          borderTopWidth: 0.5,
          height: 88,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarActiveTintColor: HIGColors.blue,
        tabBarInactiveTintColor: HIGColors.gray2,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 24, color }}>🏠</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Journal" 
        component={HistoryStack} 
        options={{
          headerShown: false, // HistoryStack has its own navigation
          tabBarLabel: 'Journal',
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 24, color }}>📖</Text>
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Always navigate to HistoryMain when tab is pressed
            navigation.navigate('Journal', { screen: 'HistoryMain' });
          },
        })}
      />
      {/* Feature Backlog - Community Tab */}
      {/* <Tab.Screen 
        name="Community" 
        component={CommunityStack} 
        options={{
          tabBarLabel: 'Community',
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 24, color }}>👥</Text>
            </View>
          ),
        }}
      /> */}
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack} 
        options={{
          headerShown: false, // ProfileStack has its own navigation
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 24, color }}>👤</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Auth Stack Navigator
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
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
              component={MainTabs} 
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