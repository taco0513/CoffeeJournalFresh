import React from 'react';
import { View, Text, Platform, TouchableOpacity } from 'react-native';
import { IOSColors, IOSLayout } from '../styles/ios-hig-2024';

// Simple text-based icons for lightweight MVP
const iconMap = {
  // Navigation screen names (exact match with route names)
  Home: '🏠',
  Journal: '📝',
  AddRecord: '➕',
  History: '📋',
  Profile: '👤',
  Admin: '⚙️',
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
    <View style={{ 
      alignItems: 'center', 
      justifyContent: 'center',
      width: 30,
      height: 30,
    }}>
      <Text style={{ 
        fontSize: focused ? 26 : 24, 
        color: color,
        textAlign: 'center',
      }}>
        {iconName}
      </Text>
    </View>
  );
};

// Tab Bar 아이콘 가이드라인
// 1. iOS 11 이후: Tab Bar는 filled 스타일 권장
// 2. Navigation Bar/Toolbar: outlined 스타일 (stroke width 1-1.5pt)
// 3. 크기: 24-28pt (Medium-Large)
// 4. 터치 영역: 최소 44x44pt 보장