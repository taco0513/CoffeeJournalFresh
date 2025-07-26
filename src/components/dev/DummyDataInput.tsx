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
import { useFeedbackStore } from '../../stores/useFeedbackStore';
import { useTastingStore } from '../../stores/tastingStore';
import { DummyDataService } from '../../services/DummyDataService';
import { Logger } from '../../services/LoggingService';
import { AutoSelectService} from '../../services/AutoSelectService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 56;
const SAFE_AREA = 20;

interface DummyDataInputProps {
  visible?: boolean;
}

/**
 * DummyDataInput - 화면별 맞춤형 더미 데이터 입력 도우미
 * 40개 이상의 화면 지원, 복잡한 데이터 구조 생성
 * 실제 사용자 플로우 시뮬레이션
 */
export const DummyDataInput: React.FC<DummyDataInputProps> = ({ 
  visible = true 
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { isDeveloperMode } = useDevStore();
  const { isBetaUser } = useFeedbackStore();
  const { updateField } = useTastingStore();
  
  // Show for developers OR beta users
  if ((!isDeveloperMode && !isBetaUser) || !visible) return null;
  
  // Get status badge text based on user type
  const getStatusText = () => {
    if (isDeveloperMode) {
      return 'DEV';
    } else if (isBetaUser) {
      return 'β';
    }
    return 'D';
  };

  // Get button color based on user type  
  const getButtonColor = () => {
    if (isDeveloperMode) {
      return '#2563eb'; // 파란색 (개발자)
    } else if (isBetaUser) {
      return '#f59e0b'; // 주황색 (베타 사용자)
    }
    return '#6b7280'; // 회색 (기본)
  };

  const getBorderColor = () => {
    if (isDeveloperMode) {
      return '#1e40af'; // 어두운 파란색
    } else if (isBetaUser) {
      return '#d97706'; // 어두운 주황색
    }
    return '#4b5563'; // 어두운 회색
  };

  const handlePress = async () => {
    // 개발자와 베타 사용자에 따라 다른 기능 실행
    if (isDeveloperMode) {
      // 개발자: 더미데이터 + 자동선택
      await generateDummyDataForCurrentScreen();
      await generateAutoSelectionsForCurrentScreen();
    } else if (isBetaUser) {
      // 베타 사용자: 자동선택만 (contextual autofill)
      await generateAutoSelectionsForCurrentScreen();
    }
  };
  
  const generateAutoSelectionsForCurrentScreen = async () => {
    const currentScreen = route.name;
    
    try {
      // Use AutoSelectService for enhanced auto-selection functionality
      const selections = await AutoSelectService.autoSelectForScreen(currentScreen);
      
      if (selections) {
        // Apply the selections to the form fields using the tasting store
        Object.entries(selections).forEach(([fieldName, value]) => {
          if (value !== undefined && value !== null) {
            updateField(fieldName as any, value);
          }
        });

        Logger.debug(` Auto-selections completed for ${currentScreen}:`, 'component', { 
          component: 'DummyDataInput', 
          data: selections 
        });
      }
    } catch (error) {
      Logger.error('Error generating auto-selections:', 'component', { 
        component: 'DummyDataInput', 
        error: error 
      });
    }
  };

  const generateDummyDataForCurrentScreen = async () => {
    const currentScreen = route.name;
    
    try {
      // 통합된 메서드 사용
      await DummyDataService.generateDummyDataForScreen(currentScreen);
      Logger.debug(`Dummy data generated for ${currentScreen}`, 'component', { 
        component: 'DummyDataInput' 
      });
    } catch (error) {
      Logger.error(`Error generating dummy data for ${currentScreen}:`, 'component', { 
        component: 'DummyDataInput', 
        error 
      });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: getButtonColor(),
            borderColor: getBorderColor(),
          }
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{getStatusText()}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100, // Position above tab bar
    right: SAFE_AREA,
    zIndex: 999,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    // backgroundColor and borderColor set dynamically
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '900',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
});