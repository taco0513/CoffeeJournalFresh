import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  ModeSelectionScreen,
  CoffeeInfoScreen,
  HomeCafeScreen,
  RoasterNotesScreen,
  UnifiedFlavorScreen,
  SensoryScreen,
  ExperimentalDataScreen,
  SensoryEvaluationScreen,
  PersonalCommentScreen,
  ResultScreen,
} from '../screens-tamagui';

const Stack = createStackNavigator();

/**
 * Shared TastingFlow navigation stack component
 * Extracted to avoid duplication between AppNavigator.tsx and AppNavigator-tamagui.tsx
 */
export function TastingFlow() {
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