import React from 'react';
import { YStack, styled } from 'tamagui';
import Svg, { Circle } from 'react-native-svg';

// Styled container
const ProgressContainer = styled(YStack, {
  name: 'ProgressContainer',
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
});

const ChildrenContainer = styled(YStack, {
  name: 'ChildrenContainer',
  position: 'absolute',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
});

// Type definitions
export interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}

// Main component
export const CircularProgress: React.FC<CircularProgressProps> = ({
  size,
  strokeWidth,
  progress,
  color,
  backgroundColor = '$gray6',
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <ProgressContainer width={size} height={size}>
      <Svg 
        width={size} 
        height={size} 
        style={{ position: 'absolute' }}
      >
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <ChildrenContainer>
        {children}
      </ChildrenContainer>
    </ProgressContainer>
  );
};

export default CircularProgress;