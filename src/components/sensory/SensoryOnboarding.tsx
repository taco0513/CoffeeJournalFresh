import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HIGConstants, HIGColors } from '../../styles/common';

const { width, height } = Dimensions.get('window');

interface SensoryOnboardingProps {
  visible: boolean;
  onComplete: () => void;
}

const SensoryOnboarding: React.FC<SensoryOnboardingProps> = ({
  visible,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const onboardingSteps = [
    {
      title: '☕ 커피 감각평가',
      subtitle: '더 친숙한 표현으로 커피를 평가해보세요',
      description: '전문가들이 사용하는 한국어 감각평가 표현을 쉽게 사용할 수 있도록 준비했어요.',
      highlight: '',
    },
    {
      title: '💡 다중 선택이 가능해요',
      subtitle: '한 카테고리에서 여러 표현을 선택하세요',
      description: '실제 커피에서는 여러 종류의 산미나 단맛을 동시에 느낄 수 있어요. 자연스러운 일이니까 부담없이 선택하세요!',
      highlight: '예: 싱그러운 + 발랄한 산미',
    },
    {
      title: '🎯 카테고리별 최대 3개까지',
      subtitle: '각 영역에서 느껴지는 특징을 골라주세요',
      description: '산미, 단맛, 쓴맛, 바디, 애프터, 밸런스 각 카테고리에서 최대 3개까지 선택할 수 있어요.',
      highlight: '',
    },
    {
      title: '☕ 정답은 없어요',
      subtitle: '당신이 느끼는 그대로가 정답입니다',
      description: '커피 감각평가에는 정답이 없어요. 편안하게 자신의 감각을 믿고 선택해보세요.',
      highlight: '시작해볼까요?',
    },
  ];

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  const handleNext = async () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await markOnboardingCompleted();
      onComplete();
    }
  };

  const handleSkip = async () => {
    await markOnboardingCompleted();
    onComplete();
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <View style={styles.content}>
            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
            <Text style={styles.description}>{currentStepData.description}</Text>
            
            {currentStepData.highlight && (
              <View style={styles.highlightContainer}>
                <Text style={styles.highlight}>{currentStepData.highlight}</Text>
              </View>
            )}

            <View style={styles.progressContainer}>
              {onboardingSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index === currentStep && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>건너뛰기</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentStep === onboardingSteps.length - 1 ? '시작하기' : '다음'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: HIGConstants.BORDER_RADIUS * 2,
    width: Math.min(width - 32, 400),
    maxHeight: height - 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  content: {
    padding: HIGConstants.SPACING_XL,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.systemBlue,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_MD,
  },
  description: {
    fontSize: 15,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: HIGConstants.SPACING_LG,
  },
  highlightContainer: {
    backgroundColor: HIGColors.systemBlue + '15',
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.cornerRadiusMedium,
    marginBottom: HIGConstants.SPACING_LG,
  },
  highlight: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.systemBlue,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: HIGConstants.SPACING_LG,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: HIGColors.systemGray4,
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: HIGColors.systemBlue,
    width: 12,
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingBottom: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_MD,
    borderTopWidth: 1,
    borderTopColor: HIGColors.systemGray5,
  },
  skipButton: {
    flex: 1,
    paddingVertical: HIGConstants.SPACING_MD,
    alignItems: 'center',
    marginRight: HIGConstants.SPACING_SM,
  },
  skipButtonText: {
    fontSize: 16,
    color: HIGColors.systemGray1,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    backgroundColor: HIGColors.systemBlue,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.cornerRadiusMedium,
    alignItems: 'center',
    marginLeft: HIGConstants.SPACING_SM,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

// Helper function to check if onboarding should be shown
export const checkShouldShowOnboarding = async (): Promise<boolean> => {
  try {
    const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenKoreanSensoryOnboarding');
    return hasSeenOnboarding !== 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return true;
  }
};

// Helper function to mark onboarding as completed
export const markOnboardingCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem('hasSeenKoreanSensoryOnboarding', 'true');
  } catch (error) {
    console.error('Error marking onboarding as completed:', error);
  }
};

export default SensoryOnboarding;