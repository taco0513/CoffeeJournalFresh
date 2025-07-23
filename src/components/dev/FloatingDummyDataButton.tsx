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
import { AutoSelectService } from '../../services/AutoSelectService';

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
  
  // Get appropriate icon based on current screen
  const getScreenIcon = () => {
    const currentScreen = route.name;
    switch (currentScreen) {
      case 'Search': return '🔍';
      case 'AdminCoffeeEdit':
      case 'AdminFeedback': return '⚙️';
      case 'ProfileSetup': return '👤';
      case 'HomeCafe': return '🏠';
      case 'UnifiedFlavor': return '👃';
      case 'Sensory':
      case 'SensoryEvaluation': return '👅';
      case 'PersonalComment': return '📝';
      case 'ModeSelection': return '🎯';
      case 'Developer': return '🛠️';
      case 'SignUp':
      case 'SignIn': return '🔐';
      case 'History': return '🕒';
      case 'Onboarding': return '👋';
      case 'AchievementGallery': return '🏆';
      case 'Stats': return '📊';
      default: return '🎲';
    }
  };

  const handlePress = async () => {
    // Generate both dummy data AND auto-selections for current screen
    await generateDummyDataForCurrentScreen();
    await generateAutoSelectionsForCurrentScreen();
  };
  
  const generateAutoSelectionsForCurrentScreen = async () => {
    const currentScreen = route.name;
    
    try {
      // Use AutoSelectService for enhanced auto-selection functionality
      const selections = await AutoSelectService.autoSelectForScreen(currentScreen);
      
      if (selections) {
        console.log(`🎯 Auto-selections completed for ${currentScreen}:`, selections);
      }
      
    } catch (error) {
      console.error('❌ Error generating auto-selections:', error);
    }
  };

  const generateDummyDataForCurrentScreen = async () => {
    const currentScreen = route.name;
    
    try {
      switch (currentScreen) {
        // TastingFlow Screens (Enhanced)
        case 'CoffeeInfo':
          await DummyDataService.fillCoffeeInfo();
          break;
          
        case 'HomeCafe':
          await DummyDataService.fillEnhancedHomeCafeData(); // Use enhanced version
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
        
        // New High Priority Screens
        case 'Search':
          await DummyDataService.fillSearchFilters();
          break;
          
        case 'AdminCoffeeEdit':
          await DummyDataService.fillAdminEditForm();
          break;
          
        case 'AdminFeedback':
          await DummyDataService.generateFeedbackData();
          break;
          
        case 'ProfileSetup':
          await DummyDataService.fillProfileData();
          break;
          
        case 'ModeSelection':
          await DummyDataService.autoSelectMode();
          break;
          
        // Developer and Admin Screens
        case 'Developer':
          await DummyDataService.fillDeveloperSettings();
          break;
          
        case 'DataTest':
          await DummyDataService.generateCompleteTastingRecord();
          break;
          
        // Authentication Screens
        case 'SignUp':
        case 'SignIn':
          console.log('Auto-filling authentication form for testing');
          // Note: Actual implementation would depend on auth form structure
          break;
          
        // Additional Screens
        case 'History':
          await DummyDataService.fillHistorySearch();
          break;
          
        case 'Onboarding':
          await DummyDataService.progressOnboarding();
          break;
          
        case 'AchievementGallery':
          await DummyDataService.generateSampleAchievements();
          break;
          
        case 'Stats':
          await DummyDataService.generateSampleStats();
          break;
          
        // Special Cases - Complete Tasting Flow
        case 'Home':
        case 'JournalIntegrated':
          // Generate sample tasting records for better testing
          await DummyDataService.generateCompleteTastingRecord();
          console.log('Generated complete tasting record for better home/journal testing');
          break;
          
        default:
          // Try to detect screen type and provide contextual dummy data
          if (currentScreen.toLowerCase().includes('admin')) {
            await DummyDataService.generateFeedbackData();
            console.log('Generated admin data for screen:', currentScreen);
          } else if (currentScreen.toLowerCase().includes('profile')) {
            await DummyDataService.fillProfileData();
            console.log('Generated profile data for screen:', currentScreen);
          } else if (currentScreen.toLowerCase().includes('search')) {
            await DummyDataService.fillSearchFilters();
            console.log('Generated search data for screen:', currentScreen);
          } else {
            console.log('No specific dummy data available for screen:', currentScreen);
            console.log('Available screen support:', [
              'CoffeeInfo', 'HomeCafe', 'UnifiedFlavor', 'Sensory', 'SensoryEvaluation',
              'PersonalComment', 'RoasterNotes', 'Search', 'AdminCoffeeEdit', 'AdminFeedback',
              'ProfileSetup', 'ModeSelection', 'Developer', 'DataTest', 'SignUp', 'SignIn',
              'History', 'Onboarding', 'AchievementGallery', 'Stats'
            ]);
          }
          break;
      }
      
      // Visual feedback for successful data generation
      console.log(`✅ Generated dummy data for ${currentScreen} screen`);
      
    } catch (error) {
      console.error('❌ Error generating dummy data for', currentScreen, ':', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>{getScreenIcon()}</Text>
      </TouchableOpacity>
      
      {/* Enhanced Dev Badge with Screen Info */}
      <View style={styles.devBadge}>
        <Text style={styles.devBadgeText}>AUTO</Text>
      </View>
      
      {/* Screen Name Tooltip */}
      <View style={styles.screenTooltip}>
        <Text style={styles.screenTooltipText}>{route.name}</Text>
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
    fontSize: 24,
  },
  devBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: HIGColors.systemOrange,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  devBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  screenTooltip: {
    position: 'absolute',
    bottom: BUTTON_SIZE + 8,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: 120,
  },
  screenTooltipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
});