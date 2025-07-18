import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

// 화면 import
import HomeScreen from '../screens/HomeScreen';
import CoffeeInfoScreen from '../screens/CoffeeInfoScreen';
import HistoryScreen from '../screens/HistoryScreen';
import StatsScreen from '../screens/StatsScreen';
import RoasterNotesScreen from '../screens/RoasterNotesScreen';
import FlavorLevel1Screen from '../screens/flavor/FlavorLevel1Screen';
import FlavorLevel2Screen from '../screens/flavor/FlavorLevel2Screen';
import FlavorLevel3Screen from '../screens/flavor/FlavorLevel3Screen';
import FlavorLevel4Screen from '../screens/flavor/FlavorLevel4Screen';
import SensoryScreen from '../screens/SensoryScreen';
import ResultScreen from '../screens/ResultScreen';
import OCRScanScreen from '../screens/OCRScanScreen';
import OCRResultScreen from '../screens/OCRResultScreen';
import SearchScreen from '../screens/SearchScreen';
import TastingDetailScreen from '../screens/TastingDetailScreen';
import ExportScreen from '../screens/ExportScreen';
import DataTestScreen from '../screens/DataTestScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PhotoGalleryScreen from '../screens/PhotoGalleryScreen';
import PhotoViewerScreen from '../screens/PhotoViewerScreen';
import CommunityFeedScreen from '../screens/CommunityFeedScreen';
import CommunityReviewScreen from '../screens/CommunityReviewScreen';
import ShareReviewScreen from '../screens/ShareReviewScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 테이스팅 플로우 스택 네비게이터
function TastingFlow() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#8B4513',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
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
      <Stack.Screen 
        name="FlavorLevel4" 
        component={FlavorLevel4Screen} 
        options={{title: 'Select Details'}}
      />
      <Stack.Screen 
        name="Sensory" 
        component={SensoryScreen} 
        options={{title: 'Sensory Evaluation'}}
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
        headerStyle: {
          backgroundColor: '#8B4513',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
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
      <Stack.Screen 
        name="ShareReview" 
        component={ShareReviewScreen} 
        options={{title: 'Share Review'}}
      />
    </Stack.Navigator>
  );
}

// 통계 스택 네비게이터
function StatsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#8B4513',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="StatsMain" 
        component={StatsScreen} 
        options={{title: 'Statistics'}}
      />
      <Stack.Screen 
        name="Export" 
        component={ExportScreen} 
        options={{title: 'Export Data'}}
      />
    </Stack.Navigator>
  );
}

// 커뮤니티 스택 네비게이터
function CommunityStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#8B4513',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
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
        headerStyle: {
          backgroundColor: '#8B4513',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{title: 'Profile'}}
      />
      <Stack.Screen 
        name="DataTest" 
        component={DataTestScreen} 
        options={{title: 'Data Test'}}
      />
      <Stack.Screen 
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
      />
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
        tabBarActiveTintColor: '#8B4513',
        tabBarInactiveTintColor: '#8E8E93',
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
      <Tab.Screen 
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
      />
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

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          headerShown: false,
          presentation: 'modal',
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs} 
        />
        <Stack.Screen 
          name="TastingFlow" 
          component={TastingFlow} 
          options={{
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;