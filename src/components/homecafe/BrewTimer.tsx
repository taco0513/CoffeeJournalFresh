import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { HIGConstants } from '../../styles/common';
import { HIGColors } from '../../constants/HIG';

interface LapTime {
  id: string;
  name: string;
  time: number;
  timestamp: Date;
}

interface BrewTimerProps {
  bloomTime?: number;
  totalBrewTime?: number;
  onTimerComplete?: (lapTimes: LapTime[]) => void;
}

export const BrewTimer: React.FC<BrewTimerProps> = ({
  bloomTime = 30,
  totalBrewTime = 180,
  onTimerComplete,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [lapTimes, setLapTimes] = useState<LapTime[]>([]);
  const [phase, setPhase] = useState<'ready' | 'bloom' | 'pour' | 'finished'>('ready');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000);
        setElapsedTime(elapsed);
        
        // Update phase based on elapsed time
        if (elapsed <= bloomTime) {
          setPhase('bloom');
        } else if (elapsed <= totalBrewTime) {
          setPhase('pour');
        } else {
          setPhase('finished');
          stopTimer();
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, bloomTime, totalBrewTime]);

  const startTimer = () => {
    startTimeRef.current = Date.now() - (elapsedTime * 1000);
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (phase === 'finished' && onTimerComplete) {
      onTimerComplete(lapTimes);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setLapTimes([]);
    setPhase('ready');
  };

  const addLapTime = () => {
    const lapNumber = lapTimes.length + 1;
    let lapName = '';
    
    if (phase === 'bloom') {
      lapName = '1차 추출(뜸)';
    } else if (phase === 'pour') {
      lapName = `${lapNumber}차 추출`;
    } else {
      lapName = `추가 ${lapNumber}`;
    }

    const newLap: LapTime = {
      id: `lap-${Date.now()}`,
      name: lapName,
      time: elapsedTime,
      timestamp: new Date(),
    };

    setLapTimes(prev => [...prev, newLap]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'bloom':
        return HIGColors.systemOrange;
      case 'pour':
        return HIGColors.systemBlue;
      case 'finished':
        return HIGColors.systemGreen;
      default:
        return HIGColors.systemGray4;
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'ready':
        return '준비';
      case 'bloom':
        return '뜸 단계';
      case 'pour':
        return '추출 중';
      case 'finished':
        return '완료';
      default:
        return '';
    }
  };

  const getProgressPercentage = () => {
    if (totalBrewTime === 0) return 0;
    return Math.min((elapsedTime / totalBrewTime) * 100, 100);
  };

  const getBloomProgress = () => {
    if (bloomTime === 0 || phase !== 'bloom') return 0;
    return Math.min((elapsedTime / bloomTime) * 100, 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>⏱️</Text>
        <Text style={styles.headerTitle}>추출타임</Text>
      </View>

      {/* Main Timer Display */}
      <View style={[styles.timerDisplay, { borderColor: getPhaseColor() }]}>
        <Text style={[styles.phaseText, { color: getPhaseColor() }]}>
          {getPhaseText()}
        </Text>
        
        <Text style={styles.timeText}>
          {formatTime(elapsedTime)}
        </Text>
        
        <Text style={styles.targetTime}>
          / {formatTime(totalBrewTime)}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${getProgressPercentage()}%`,
                  backgroundColor: getPhaseColor()
                }
              ]} 
            />
          </View>
          
          {/* Bloom Phase Indicator */}
          {phase === 'bloom' && (
            <View style={styles.bloomContainer}>
              <Text style={styles.bloomText}>뜸: {bloomTime}초</Text>
              <View style={styles.bloomProgress}>
                <View 
                  style={[
                    styles.bloomFill,
                    { width: `${getBloomProgress()}%` }
                  ]} 
                />
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Timer Controls */}
      <View style={styles.controlsContainer}>
        {!isRunning ? (
          <TouchableOpacity 
            style={[styles.controlButton, styles.startButton]}
            onPress={startTimer}
          >
            <Text style={styles.startButtonText}>
              {elapsedTime === 0 ? '시작' : '재개'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.controlButton, styles.stopButton]}
            onPress={stopTimer}
          >
            <Text style={styles.stopButtonText}>정지</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.controlButton, styles.lapButton]}
          onPress={addLapTime}
          disabled={!isRunning}
        >
          <Text style={[
            styles.lapButtonText,
            !isRunning && styles.disabledText
          ]}>
            구간기록
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, styles.resetButton]}
          onPress={resetTimer}
        >
          <Text style={styles.resetButtonText}>리셋</Text>
        </TouchableOpacity>
      </View>

      {/* Lap Times */}
      {lapTimes.length > 0 && (
        <View style={styles.lapTimesContainer}>
          <Text style={styles.lapTimesTitle}>구간 기록</Text>
          <ScrollView style={styles.lapTimesList} showsVerticalScrollIndicator={false}>
            {lapTimes.map((lap, index) => (
              <View key={lap.id} style={styles.lapTimeRow}>
                <Text style={styles.lapTimeName}>{lap.name}</Text>
                <Text style={styles.lapTimeValue}>{formatTime(lap.time)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: HIGConstants.SPACING_XL,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  headerIcon: {
    fontSize: 20,
    marginRight: HIGConstants.SPACING_SM,
  },
  headerTitle: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
  },
  timerDisplay: {
    backgroundColor: HIGColors.systemBackground,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_LG,
    marginHorizontal: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_MD,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  phaseText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    marginBottom: HIGConstants.SPACING_SM,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '700',
    color: HIGColors.label,
    fontFamily: 'menlo',
  },
  targetTime: {
    fontSize: HIGConstants.FONT_SIZE_TITLE,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_MD,
  },
  progressContainer: {
    width: '100%',
  },
  progressBackground: {
    height: 6,
    backgroundColor: HIGColors.systemGray5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  bloomContainer: {
    marginTop: HIGConstants.SPACING_SM,
    alignItems: 'center',
  },
  bloomText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.systemOrange,
    fontWeight: '600',
    marginBottom: 4,
  },
  bloomProgress: {
    width: '60%',
    height: 4,
    backgroundColor: HIGColors.systemGray5,
    borderRadius: 2,
    overflow: 'hidden',
  },
  bloomFill: {
    height: '100%',
    backgroundColor: HIGColors.systemOrange,
    borderRadius: 2,
  },
  controlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: HIGConstants.SPACING_LG,
    gap: HIGConstants.SPACING_SM,
  },
  controlButton: {
    flex: 1,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.cornerRadiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  startButton: {
    backgroundColor: HIGColors.systemGreen,
  },
  startButtonText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.white,
  },
  stopButton: {
    backgroundColor: HIGColors.systemRed,
  },
  stopButtonText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.white,
  },
  lapButton: {
    backgroundColor: HIGColors.systemBlue,
  },
  lapButtonText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.white,
  },
  resetButton: {
    backgroundColor: HIGColors.systemGray5,
  },
  resetButtonText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
  },
  disabledText: {
    opacity: 0.5,
  },
  lapTimesContainer: {
    marginTop: HIGConstants.SPACING_LG,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  lapTimesTitle: {
    fontSize: HIGConstants.FONT_SIZE_TITLE,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  lapTimesList: {
    maxHeight: 120,
  },
  lapTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_SM,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.separator,
  },
  lapTimeName: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
  },
  lapTimeValue: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.systemBlue,
    fontFamily: 'menlo',
  },
});