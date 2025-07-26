import React from 'react';
import { Platform } from 'react-native';
import { View, Text, styled } from 'tamagui';

// Styled Components
const IconContainer = styled(View, {
  name: 'IconContainer',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: 20, // Circular design
  backgroundColor: 'transparent',
  scale: 1.0,
  animation: 'quick',
  variants: {
    focused: {
      true: {
        backgroundColor: '$cupBlue',
        scale: 1.0,
    },
  },
} as const,
});

const IconText = styled(Text, {
  name: 'IconText',
  fontSize: 14,
  textAlign: 'center',
  fontWeight: '500',
  color: '$gray11',
  animation: 'quick',
  variants: {
    focused: {
      true: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
  },
} as const,
});

// Simple text labels instead of icons
const iconMap = {
  // Navigation screen names (exact match with route names)
  Home: '홈',
  Journal: '기록',
  AddRecord: '+',
  UserProfile: '프로필',
  Settings: '설정',
  Admin: '관리',
  History: '기록',
  Profile: '프로필',
  // Legacy support for lowercase route names
  home: '홈',
  journal: '기록',
  addCoffee: '+',
  achievements: '성과',
  profile: '프로필',
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