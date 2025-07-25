import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { HIGColors } from '../../styles/common';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  duration?: number;
  showPercentage?: boolean;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = HIGColors.systemBlue,
  backgroundColor = HIGColors.systemGray6,
  duration = 1000,
  showPercentage = true,
  children,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const circleRef = useRef<any>(null);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const center = size / 2;
  
  useEffect(() => {
    // Animate the progress
    Animated.timing(animatedValue, {
      toValue: progress,
      duration,
      useNativeDriver: false,
    }).start();
    
    // Update the stroke dash offset
    animatedValue.addListener(({ value }) => {
      const strokeDashoffset = circumference - (circumference * value) / 100;
      if (circleRef.current) {
        circleRef.current.setNativeProps({
          strokeDashoffset,
        });
      }
    });
    
    return () => {
      animatedValue.removeAllListeners();
    };
  }, [progress, circumference, animatedValue, duration]);
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <AnimatedCircle
          ref={circleRef}
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      
      {/* Center content */}
      <View style={styles.centerContent}>
        {children || (showPercentage && (
          <Text style={[styles.percentageText, { color }]}>
            {Math.round(progress)}%
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 24,
    fontWeight: '700',
  },
});