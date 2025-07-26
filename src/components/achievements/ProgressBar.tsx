import React from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { HIGColors, HIGConstants } from '../../styles/common';

interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
  backgroundColor?: string;
  height?: number;
  animated?: boolean;
  cornerRadius?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = HIGColors.systemBlue,
  backgroundColor = HIGColors.systemGray5,
  height = 8,
  animated = true,
  cornerRadius = 4,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const clampedProgress = Math.max(0, Math.min(1, progress));

  React.useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: clampedProgress,
        duration: 800,
        useNativeDriver: false,
    }).start();
  } else {
      animatedValue.setValue(clampedProgress);
  }
}, [clampedProgress, animated, animatedValue]);

  const progressWidth = animated 
    ? animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
        extrapolate: 'clamp',
    })
    : `${clampedProgress * 100}%`;

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor, 
          height, 
          borderRadius: cornerRadius 
      }
      ]}
    >
      <Animated.View
        style={[
          styles.progressFill,
          {
            backgroundColor: color,
            width: progressWidth as unknown,
            borderRadius: cornerRadius,
        },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
},
  progressFill: {
    height: '100%',
},
});