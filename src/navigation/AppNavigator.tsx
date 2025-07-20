import React, { useEffect, useState } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator } from 'react-native';
import AuthService from '../services/supabase/auth';
import { useUserStore } from '../stores/useUserStore';
import { HIGColors } from '../styles/common';

// 화면 import
import HomeScreen from '../screens/HomeScreenEnhanced';
import CoffeeInfoScreen from '../screens/CoffeeInfoScreen';
import HistoryScreen from '../screens/HistoryScreen';
import StatsScreen from '../screens/StatsScreen';
import PersonalTasteDashboard from '../screens/PersonalTasteDashboard';
import RoasterNotesScreen from '../screens/RoasterNotesScreen';
import FlavorLevel1Screen from '../screens/flavor/FlavorLevel1Screen';
import FlavorLevel2Screen from '../screens/flavor/FlavorLevel2Screen';
import FlavorLevel3Screen from '../screens/flavor/FlavorLevel3Screen';
// import FlavorLevel4Screen from '../screens/flavor/FlavorLevel4Screen'; // Feature Backlog
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
import { PersonalTasteQuizScreen } from '../screens/PersonalTasteQuizScreen';
import { PersonalTasteQuizResultsScreen } from '../screens/PersonalTasteQuizResultsScreen';
import AdminFeedbackScreen from '../screens/admin/AdminFeedbackScreen';
import { FeedbackProvider } from '../components/feedback';
import OnboardingScreen from '../screens/OnboardingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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
      {/* Feature Backlog - Level 4 (Detailed Descriptors) */}
      {/* <Stack.Screen 
        name="FlavorLevel4" 
        component={FlavorLevel4Screen} 
        options={{title: 'Select Details'}}
      /> */}
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
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="HistoryMain" 
        component={HistoryScreen} 
        options={{title: 'Journal'}}
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

// 통계 스택 네비게이터
function StatsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="StatsMain" 
        component={StatsScreen} 
        options={{title: 'Statistics'}}
      />
    </Stack.Navigator>
  );
}

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
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{title: 'Profile'}}
      />
      <Stack.Screen 
        name="PersonalTasteDashboard" 
        component={PersonalTasteDashboard} 
        options={{title: 'Personal Taste Journey'}}
      />
      <Stack.Screen 
        name="PersonalTasteQuiz" 
        component={PersonalTasteQuizScreen} 
        options={{title: 'Flavor Quiz'}}
      />
      <Stack.Screen 
        name="PersonalTasteQuizResults" 
        component={PersonalTasteQuizResultsScreen} 
        options={{title: 'Quiz Results'}}
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
        headerShown: false,
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
          tabBarLabel: 'Journal',
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 24, color }}>📖</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Stats" 
        component={StatsStack} 
        options={{
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 24, color }}>📊</Text>
            </View>
          ),
        }}
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
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true); // Default to true to skip by default
  const { loadStoredUser, currentUser } = useUserStore();
  
  // 초기 화면 결정 로직
  const getInitialRouteName = () => {
    if (!hasSeenOnboarding) return 'Onboarding';
    if (isAuthenticated || currentUser?.username === 'Guest') return 'MainTabs';
    return 'Auth';
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // currentUser 변경 시 인증 상태 재확인
  useEffect(() => {
    if (currentUser?.username === 'Guest') {
      setIsLoading(false);
    }
  }, [currentUser]);

  const checkAuthStatus = async () => {
    try {
      // Check if user has seen onboarding
      const onboardingStatus = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(onboardingStatus === 'true');
      
      const user = await AuthService.restoreSession();
      if (user) {
        // User is authenticated, load stored user profile
        await loadStoredUser();
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      // console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: HIGColors.systemBackground }}>
        <ActivityIndicator size="large" color={HIGColors.blue} />
      </View>
    );
  }

  return (
    <FeedbackProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName={getInitialRouteName()}
          screenOptions={{
            headerShown: false,
            presentation: 'card',
          }}
        >
          <Stack.Screen 
            name="Onboarding" 
            component={OnboardingScreen} 
          />
          <Stack.Screen 
            name="Auth" 
            component={AuthStack} 
          />
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabs} 
          />
          <Stack.Screen 
            name="TastingFlow" 
            component={TastingFlow} 
            options={{
              presentation: 'card',
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
        </Stack.Navigator>
      </NavigationContainer>
    </FeedbackProvider>
  );
}

export default AppNavigator;