import React from 'react';
import { Platform } from 'react-native';
import { View, Text, styled } from 'tamagui';

// Styled Components
const IconContainer = styled(View, {
  name: 'IconContainer',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: 0,
  backgroundColor: 'transparent',
  scale: 1.0,
  animation: 'quick',
  variants: {
    focused: {
      true: {
        borderRadius: 8,
        backgroundColor: '$blue3',
        scale: 1.05,
      },
    },
  } as const,
});

const IconText = styled(Text, {
  name: 'IconText',
  fontSize: 18,
  textAlign: 'center',
  fontWeight: '400',
  animation: 'quick',
  variants: {
    focused: {
      true: {
        fontSize: 20,
        fontWeight: '600',
      },
    },
  } as const,
});

// Simple text-based icons for lightweight MVP
const iconMap = {
  // Navigation screen names (exact match with route names)
  Home: '🏠',
  Journal: '📝',
  AddRecord: '➕',
  UserProfile: '🏆',
  Settings: '⚙️',
  Admin: '👤',
  History: '📋',
  Profile: '👤',
  // Legacy support for lowercase route names
  home: '🏠',
  journal: '📝',
  addCoffee: '➕',
  achievements: '🏆',
  profile: '👤',
};

interface TabBarIconProps {
  name: keyof typeof iconMap;
  focused: boolean;
  color: string;
  onPress?: () => void;
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({ name, focused, color, onPress }) => {
  // iOS에서는 filled/outlined 스타일 구분
  const iconName = iconMap[name];
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };
  
  return (
    <IconContainer focused={focused}>
      <IconText focused={focused} color={color}>
        {iconName}
      </IconText>
    </IconContainer>
  );
};

// Tab Bar 아이콘 가이드라인
// 1. iOS 11 이후: Tab Bar는 filled 스타일 권장
// 2. Navigation Bar/Toolbar: outlined 스타일 (stroke width 1-1.5pt)
// 3. 크기: 24-28pt (Medium-Large)
// 4. 터치 영역: 최소 44x44pt 보장