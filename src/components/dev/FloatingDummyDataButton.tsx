import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HIGColors } from '../../styles/common';
import { useDevStore } from '../../stores/useDevStore';
import { DummyDataService } from '../../services/DummyDataService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 56;
const SAFE_AREA = 20;

interface FloatingDummyDataButtonProps {
  visible?: boolean;
}

export const FloatingDummyDataButton: React.FC<FloatingDummyDataButtonProps> = ({ 
  visible = true 
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { isDeveloperMode } = useDevStore();
  
  // Only show for developers
  if (!isDeveloperMode || !visible) return null;

  const handlePress = async () => {
    // Generate dummy data immediately without expanding
    await generateDummyDataForCurrentScreen();
  };

  const generateDummyDataForCurrentScreen = async () => {
    const currentScreen = route.name;
    
    try {
      switch (currentScreen) {
        case 'CoffeeInfo':
          await DummyDataService.fillCoffeeInfo();
          break;
          
        case 'HomeCafe':
          await DummyDataService.fillHomeCafeData();
          break;
          
        case 'UnifiedFlavor':
          await DummyDataService.selectRandomFlavors();
          break;
          
        case 'Sensory':
        case 'ExperimentalData':
          await DummyDataService.fillSensoryData();
          break;
          
        case 'SensoryEvaluation':
          await DummyDataService.selectKoreanExpressions();
          break;
          
        case 'PersonalComment':
          await DummyDataService.fillPersonalComment();
          break;
          
        case 'RoasterNotes':
          await DummyDataService.fillRoasterNotes();
          break;
          
        default:
          // For screens without specific dummy data
          console.log('No dummy data available for screen:', currentScreen);
          break;
      }
    } catch (error) {
      console.error('Error generating dummy data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>🎲</Text>
      </TouchableOpacity>
      
      {/* Dev Badge */}
      <View style={styles.devBadge}>
        <Text style={styles.devBadgeText}>DEV</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 190, // Above beta feedback button
    right: SAFE_AREA,
    zIndex: 9998,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: HIGColors.systemPurple,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 28,
  },
  devBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: HIGColors.systemGreen,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  devBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
});