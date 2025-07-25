/**
 * CupNote Design System - Picker Component
 * 
 * 스크롤 가능한 선택 컴포넌트 (드리퍼, 비율 등)
 * 가로 스크롤 휠과 세그먼트 선택기 제공
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Component, Spacing, Layout } from '../tokens';

// 가로 스크롤 휠 컴포넌트 (비율 선택용)
export interface WheelPickerProps {
  items: Array<{ label: string; value: any }>;
  selectedValue: any;
  onValueChange: (value: any) => void;
  style?: ViewStyle;
}

export const WheelPicker: React.FC<WheelPickerProps> = ({
  items,
  selectedValue,
  onValueChange,
  style,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.wheelContainer}
      style={[styles.wheelScroll, style]}
    >
      {items.map((item, index) => {
        const isSelected = item.value === selectedValue;
        
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.wheelItem,
              isSelected && styles.wheelItemSelected,
            ]}
            onPress={() => onValueChange(item.value)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.wheelItemText,
              isSelected && styles.wheelItemTextSelected,
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

// 세그먼트 선택기 (드리퍼, 필터 선택용)
export interface SegmentedPickerProps {
  items: Array<{ label: string; value: any }>;
  selectedValue: any;
  onValueChange: (value: any) => void;
  columns?: number;
  style?: ViewStyle;
}

export const SegmentedPicker: React.FC<SegmentedPickerProps> = ({
  items,
  selectedValue,
  onValueChange,
  columns = 2,
  style,
}) => {
  return (
    <View style={[styles.segmentedContainer, style]}>
      {items.map((item, index) => {
        const isSelected = item.value === selectedValue;
        const itemStyle = [
          styles.segmentedItem,
          isSelected && styles.segmentedItemSelected,
          { flex: 1 / columns },
        ];
        
        return (
          <TouchableOpacity
            key={index}
            style={itemStyle}
            onPress={() => onValueChange(item.value)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.segmentedItemText,
              isSelected && styles.segmentedItemTextSelected,
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// 단일 선택 버튼 그룹 (빠른 레시피용)
export interface ButtonGroupProps {
  buttons: Array<{ 
    label: string; 
    value: any; 
    variant?: 'default' | 'custom' | 'preset';
  }>;
  selectedValue: any;
  onValueChange: (value: any) => void;
  direction?: 'horizontal' | 'vertical';
  style?: ViewStyle;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  buttons,
  selectedValue,
  onValueChange,
  direction = 'horizontal',
  style,
}) => {
  const containerStyle = [
    styles.buttonGroup,
    direction === 'vertical' && styles.buttonGroupVertical,
    style,
  ];

  return (
    <View style={containerStyle}>
      {buttons.map((button, index) => {
        const isSelected = button.value === selectedValue;
        const variant = button.variant || 'default';
        
        const buttonStyle = [
          styles.groupButton,
          styles[`groupButton_${variant}`],
          isSelected && styles[`groupButtonSelected_${variant}`],
        ];
        
        const textStyle = [
          styles.groupButtonText,
          styles[`groupButtonText_${variant}`],
          isSelected && styles[`groupButtonTextSelected_${variant}`],
        ];
        
        return (
          <TouchableOpacity
            key={index}
            style={buttonStyle}
            onPress={() => onValueChange(button.value)}
            activeOpacity={0.7}
          >
            <Text style={textStyle}>{button.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  // WheelPicker 스타일
  wheelScroll: {
    flexGrow: 0,
  },
  
  wheelContainer: {
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  
  wheelItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: 4,
    backgroundColor: Colors.background.secondary,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    minWidth: 60,
    alignItems: 'center',
  },
  
  wheelItemSelected: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  
  wheelItemText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  
  wheelItemTextSelected: {
    color: Colors.text.inverse,
  },
  
  // SegmentedPicker 스타일
  segmentedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  
  segmentedItem: {
    marginHorizontal: 4,
    marginVertical: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: Layout.radius.md,
    alignItems: 'center',
  },
  
  segmentedItemSelected: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  
  segmentedItemText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  
  segmentedItemTextSelected: {
    color: Colors.primary[700],
  },
  
  // ButtonGroup 스타일
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  
  buttonGroupVertical: {
    flexDirection: 'column',
  },
  
  groupButton: {
    marginHorizontal: 4,
    marginVertical: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    alignItems: 'center',
    flex: 1,
  },
  
  // ButtonGroup variants
  groupButton_default: {
    backgroundColor: Colors.background.primary,
    borderColor: Colors.border.medium,
  },
  
  groupButton_preset: {
    backgroundColor: Colors.gray[50],
    borderColor: Colors.gray[200],
  },
  
  groupButton_custom: {
    backgroundColor: Colors.background.primary,
    borderColor: Colors.primary[300],
    borderStyle: 'dashed',
  },
  
  // ButtonGroup selected states
  groupButtonSelected_default: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  
  groupButtonSelected_preset: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  
  groupButtonSelected_custom: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
    borderStyle: 'solid',
  },
  
  // ButtonGroup text styles
  groupButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  
  groupButtonText_default: {
    color: Colors.text.primary,
  },
  
  groupButtonText_preset: {
    color: Colors.text.primary,
  },
  
  groupButtonText_custom: {
    color: Colors.primary[600],
  },
  
  // ButtonGroup selected text
  groupButtonTextSelected_default: {
    color: Colors.primary[700],
  },
  
  groupButtonTextSelected_preset: {
    color: Colors.text.inverse,
  },
  
  groupButtonTextSelected_custom: {
    color: Colors.primary[700],
  },
});