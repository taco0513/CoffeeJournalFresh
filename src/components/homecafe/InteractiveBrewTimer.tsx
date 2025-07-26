import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Vibration,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { HIGColors, HIGConstants } from '../../styles/common';
import { BrewingStep } from '../../services/HomeCafeEnhancedService';

interface InteractiveBrewTimerProps {
  steps: BrewingStep[];
  totalBrewTime: number;
  onTimerComplete?: (lapTimes: number[]) => void;
  onStepComplete?: (stepIndex: number, actualTime: number) => void;
  recipe?: unknown;
  onComplete?: (actualBrewTime: number) => void;
  showModal?: boolean;
  onClose?: () => void;
}

const { width } = Dimensions.get('window');

export const InteractiveBrewTimer: React.FC<InteractiveBrewTimerProps> = ({
  steps,
  totalBrewTime,
  onTimerComplete,
  onStepComplete,
}) => {
  const { t } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [lapTimes, setLapTimes] = useState<number[]>([]);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = steps[currentStepIndex];
  const progress = totalBrewTime > 0 ? currentTime / totalBrewTime : 0;
  const stepProgress = currentStep ? 
    Math.max(0, Math.min(1, (currentTime - currentStep.time) / 30)) : 0; // 30 seconds per step assumption

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          
          // Check if we should advance to next step
          if (currentStepIndex < steps.length - 1) {
            const nextStep = steps[currentStepIndex + 1];
            if (nextStep && newTime >= nextStep.time) {
              setCurrentStepIndex(currentStepIndex + 1);
              // Vibrate to alert user of next step
              Vibration.vibrate([100, 50, 100]);
          }
        }
          
          // Check if timer is complete
          if (newTime >= totalBrewTime) {
            handleTimerComplete();
        }
          
          return newTime;
      });
    }, 1000);
  } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
    }
  }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
    }
  };
}, [isRunning, currentStepIndex, totalBrewTime]);

  const handleStart = () => {
    setIsRunning(true);
};

  const handlePause = () => {
    setIsRunning(false);
};

  const handleReset = () => {
    setIsRunning(false);
    setCurrentTime(0);
    setCurrentStepIndex(0);
    setLapTimes([]);
    setCompletedSteps([]);
};

  const handleStepComplete = () => {
    const newCompletedSteps = [...completedSteps];
    newCompletedSteps[currentStepIndex] = true;
    setCompletedSteps(newCompletedSteps);
    
    const newLapTimes = [...lapTimes, currentTime];
    setLapTimes(newLapTimes);
    
    onStepComplete?.(currentStepIndex, currentTime);
    
    // Move to next step if available
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
  }
};

  const handleTimerComplete = () => {
    setIsRunning(false);
    Vibration.vibrate([200, 100, 200, 100, 200]);
    onTimerComplete?.(lapTimes);
    
    Alert.alert(
      '추출 완료! ',
      `총 추출 시간: ${formatTime(currentTime)}`,
      [{ text: '확인', style: 'default' }]
    );
};

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

  const getStepStatusColor = (index: number): string => {
    if (completedSteps[index]) return HIGColors.systemGreen;
    if (index === currentStepIndex) return HIGColors.systemBlue;
    if (index < currentStepIndex) return HIGColors.systemOrange;
    return HIGColors.systemGray3;
};

  const getNextStepPreview = (): BrewingStep | null => {
    if (currentStepIndex < steps.length - 1) {
      return steps[currentStepIndex + 1];
  }
    return null;
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>인터랙티브 추출 타이머</Text>
      
      {/* Main Timer Display */}
      <View style={styles.timerContainer}>
        <View style={[styles.progressRing, { borderColor: HIGColors.systemBlue }]}>
          <View style={styles.progressFill} />
          <View style={styles.timerDisplay}>
            <Text style={styles.timerText}>{formatTime(currentTime)}</Text>
            <Text style={styles.totalTimeText}>/ {formatTime(totalBrewTime)}</Text>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, progress * 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      </View>

      {/* Current Step Display */}
      {currentStep && (
        <View style={styles.currentStepContainer}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumberBadge}>
              <Text style={styles.stepNumberText}>단계 {currentStep.stepNumber}</Text>
            </View>
            <Text style={styles.stepTime}>
              {formatTime(currentStep.time)}
            </Text>
          </View>
          
          <Text style={styles.stepDescription}>{currentStep.korean}</Text>
          
          {currentStep.waterAmount && (
            <View style={styles.waterAmountContainer}>
              <Text style={styles.waterAmountText}>
                 {currentStep.waterAmount}g 붓기
              </Text>
            </View>
          )}
          
          {currentStep.pourPattern && (
            <View style={styles.techniqueContainer}>
              <Text style={styles.techniqueText}>
                기법: {currentStep.pourPattern}
              </Text>
            </View>
          )}
          
          {/* Step Progress Bar */}
          <View style={styles.stepProgressContainer}>
            <View style={styles.stepProgressBar}>
              <View 
                style={[
                  styles.stepProgressFill,
                  { width: `${Math.min(100, stepProgress * 100)}%` }
                ]} 
              />
            </View>
            <TouchableOpacity
              style={[
                styles.stepCompleteButton,
                completedSteps[currentStepIndex] && styles.stepCompleteButtonDone
              ]}
              onPress={handleStepComplete}
              disabled={completedSteps[currentStepIndex]}
            >
              <Text style={[
                styles.stepCompleteButtonText,
                completedSteps[currentStepIndex] && styles.stepCompleteButtonTextDone
              ]}>
                {completedSteps[currentStepIndex] ? '완료 ✓' : '단계 완료'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Next Step Preview */}
      {getNextStepPreview() && (
        <View style={styles.nextStepContainer}>
          <Text style={styles.nextStepTitle}>다음 단계</Text>
          <Text style={styles.nextStepDescription}>
            {formatTime(getNextStepPreview()!.time)} - {getNextStepPreview()!.korean}
          </Text>
        </View>
      )}

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {!isRunning ? (
          <TouchableOpacity
            style={[styles.controlButton, styles.startButton]}
            onPress={handleStart}
          >
            <Text style={[styles.controlButtonText, styles.startButtonText]}>
              {currentTime > 0 ? '계속' : '시작'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.controlButton, styles.pauseButton]}
            onPress={handlePause}
          >
            <Text style={[styles.controlButtonText, styles.pauseButtonText]}>
              일시정지
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.controlButton, styles.resetButton]}
          onPress={handleReset}
        >
          <Text style={[styles.controlButtonText, styles.resetButtonText]}>
            리셋
          </Text>
        </TouchableOpacity>
      </View>

      {/* Steps Overview */}
      <View style={styles.stepsOverview}>
        <Text style={styles.stepsOverviewTitle}>진행 상황</Text>
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepIndicator}>
              <View style={[
                styles.stepDot,
                { backgroundColor: getStepStatusColor(index) }
              ]}>
                <Text style={styles.stepDotText}>{step.stepNumber}</Text>
              </View>
              {index < steps.length - 1 && (
                <View style={[
                  styles.stepConnector,
                  { backgroundColor: index < currentStepIndex ? HIGColors.systemBlue : HIGColors.systemGray4 }
                ]} />
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Lap Times */}
      {lapTimes.length > 0 && (
        <View style={styles.lapTimesContainer}>
          <Text style={styles.lapTimesTitle}>단계별 기록</Text>
          {lapTimes.map((lapTime, index) => (
            <View key={index} style={styles.lapTimeItem}>
              <Text style={styles.lapTimeStep}>단계 {index + 1}</Text>
              <Text style={styles.lapTimeValue}>{formatTime(lapTime)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusLarge,
    padding: HIGConstants.SPACING_LG,
    margin: HIGConstants.SPACING_MD,
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
},
  title: {
    fontSize: HIGConstants.FONT_SIZE_H2,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_LG,
},
  
  // Timer Display
  timerContainer: {
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_LG,
},
  progressRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: HIGConstants.SPACING_MD,
},
  progressFill: {
    position: 'absolute',
    width: 134,
    height: 134,
    borderRadius: 67,
    backgroundColor: HIGColors.systemBlue + '20',
},
  timerDisplay: {
    alignItems: 'center',
},
  timerText: {
    fontSize: 32,
    fontWeight: '700',
    color: HIGColors.label,
    fontFamily: 'System',
},
  totalTimeText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
},
  progressBarContainer: {
    alignItems: 'center',
    width: '100%',
},
  progressBarBackground: {
    width: 200,
    height: 6,
    backgroundColor: HIGColors.systemGray5,
    borderRadius: 3,
    overflow: 'hidden',
},
  progressBarFill: {
    height: '100%',
    backgroundColor: HIGColors.systemBlue,
    borderRadius: 3,
},
  progressText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    marginTop: 4,
},
  
  // Current Step
  currentStepContainer: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_MD,
},
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
},
  stepNumberBadge: {
    backgroundColor: HIGColors.systemBlue,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
    borderRadius: HIGConstants.cornerRadiusSmall,
},
  stepNumberText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.white,
    fontWeight: '600',
},
  stepTime: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
},
  stepDescription: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
    lineHeight: 22,
},
  waterAmountContainer: {
    backgroundColor: HIGColors.systemBlue + '20',
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
    borderRadius: HIGConstants.cornerRadiusSmall,
    alignSelf: 'flex-start',
    marginBottom: HIGConstants.SPACING_XS,
},
  waterAmountText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.systemBlue,
    fontWeight: '600',
},
  techniqueContainer: {
    marginBottom: HIGConstants.SPACING_SM,
},
  techniqueText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    fontStyle: 'italic',
},
  stepProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
},
  stepProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: HIGColors.systemGray4,
    borderRadius: 2,
    marginRight: HIGConstants.SPACING_MD,
    overflow: 'hidden',
},
  stepProgressFill: {
    height: '100%',
    backgroundColor: HIGColors.systemGreen,
    borderRadius: 2,
},
  stepCompleteButton: {
    backgroundColor: HIGColors.systemGreen,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.cornerRadiusSmall,
},
  stepCompleteButtonDone: {
    backgroundColor: HIGColors.systemGray4,
},
  stepCompleteButtonText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.white,
    fontWeight: '600',
},
  stepCompleteButtonTextDone: {
    color: HIGColors.secondaryLabel,
},
  
  // Next Step Preview
  nextStepContainer: {
    backgroundColor: HIGColors.systemOrange + '20',
    borderRadius: HIGConstants.cornerRadiusSmall,
    padding: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_MD,
},
  nextStepTitle: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.systemOrange,
    fontWeight: '600',
    marginBottom: 2,
},
  nextStepDescription: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.label,
},
  
  // Controls
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: HIGConstants.SPACING_LG,
},
  controlButton: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.cornerRadiusMedium,
    marginHorizontal: HIGConstants.SPACING_SM,
    minWidth: 80,
    alignItems: 'center',
},
  startButton: {
    backgroundColor: HIGColors.systemGreen,
},
  pauseButton: {
    backgroundColor: HIGColors.systemOrange,
},
  resetButton: {
    backgroundColor: HIGColors.systemGray4,
},
  controlButtonText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
},
  startButtonText: {
    color: HIGColors.white,
},
  pauseButtonText: {
    color: HIGColors.white,
},
  resetButtonText: {
    color: HIGColors.label,
},
  
  // Steps Overview
  stepsOverview: {
    marginBottom: HIGConstants.SPACING_MD,
},
  stepsOverviewTitle: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
},
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
},
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
},
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
},
  stepDotText: {
    fontSize: HIGConstants.FONT_SIZE_FOOTNOTE,
    color: HIGColors.white,
    fontWeight: '600',
},
  stepConnector: {
    width: 20,
    height: 2,
    marginHorizontal: 2,
},
  
  // Lap Times
  lapTimesContainer: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    padding: HIGConstants.SPACING_SM,
},
  lapTimesTitle: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
},
  lapTimeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
},
  lapTimeStep: {
    fontSize: HIGConstants.FONT_SIZE_FOOTNOTE,
    color: HIGColors.secondaryLabel,
},
  lapTimeValue: {
    fontSize: HIGConstants.FONT_SIZE_FOOTNOTE,
    color: HIGColors.label,
    fontFamily: 'System',
},
});

export default InteractiveBrewTimer;