import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

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

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
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
          name="Home" 
          component={HomeScreen} 
          options={{title: 'Coffee Tasting Journal'}}
        />
        <Stack.Screen 
          name="CoffeeInfo" 
          component={CoffeeInfoScreen} 
          options={{title: 'Coffee Info'}}
        />
        <Stack.Screen 
          name="History" 
          component={HistoryScreen} 
          options={{title: 'History'}}
        />
        <Stack.Screen 
          name="Stats" 
          component={StatsScreen} 
          options={{title: 'Statistics'}}
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
        <Stack.Screen 
          name="Search" 
          component={SearchScreen} 
          options={{title: 'Search'}}
        />
        <Stack.Screen 
          name="TastingDetail" 
          component={TastingDetailScreen} 
          options={{title: 'Tasting Details'}}
        />
        <Stack.Screen 
          name="Export" 
          component={ExportScreen} 
          options={{title: 'Export Data'}}
        />
        <Stack.Screen 
          name="DataTest" 
          component={DataTestScreen} 
          options={{title: 'Data Test'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;