/**
 * CupNote Design System - Input Component
 * 
 * 통일된 입력 필드 컴포넌트 시스템
 * TextInput, 선택 버튼, 슬라이더 등의 일관된 스타일링
 */

import React from 'react';
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Component, Spacing, Layout } from '../tokens';

// 기본 TextInput 컴포넌트
export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  error,
  disabled = false,
  variant = 'outlined',
  size = 'md',
  style,
  ...textInputProps
}) => {
  const containerStyle = [
    styles.container,
    style,
  ];

  const inputStyle = [
    styles.input,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    disabled && styles.disabled,
    error && styles.error,
  ];

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <TextInput
        style={inputStyle}
        placeholder={placeholder}
        placeholderTextColor={Colors.text.tertiary}
        editable={!disabled}
        {...textInputProps}
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

// 선택 버튼 컴포넌트 (카페 모드에서 온도, 로스팅 레벨 등)
export interface SelectButtonProps {
  title: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const SelectButton: React.FC<SelectButtonProps> = ({
  title,
  selected,
  onPress,
  disabled = false,
  variant = 'default',
  size = 'md',
  style,
}) => {
  const buttonStyle = [
    styles.selectButton,
    styles[`selectButton_${variant}`],
    styles[`selectButton_${size}`],
    selected && styles[`selectButtonSelected_${variant}`],
    disabled && styles.selectButtonDisabled,
    style,
  ];

  const textStyle = [
    styles.selectButtonText,
    styles[`selectButtonText_${size}`],
    selected && styles[`selectButtonTextSelected_${variant}`],
    disabled && styles.selectButtonTextDisabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

// 수치 입력 컴포넌트 (원두량, 물량 등)
export interface NumberInputProps extends Omit<InputProps, 'keyboardType' | 'value'> {
  value: number | string;
  onChangeValue: (value: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChangeValue,
  unit,
  min,
  max,
  step = 1,
  ...inputProps
}) => {
  const handleChangeText = (text: string) => {
    const numValue = parseFloat(text) || 0;
    
    if (min !== undefined && numValue < min) return;
    if (max !== undefined && numValue > max) return;
    
    onChangeValue(numValue);
  };

  return (
    <View style={styles.numberInputContainer}>
      <Input
        {...inputProps}
        value={value.toString()}
        onChangeText={handleChangeText}
        keyboardType="numeric"
        style={StyleSheet.flatten([styles.numberInput, inputProps.style])}
      />
      {unit && (
        <Text style={styles.unitLabel}>{unit}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // 기본 Input 스타일
  container: {
    marginBottom: Spacing.sm,
  },
  
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: 6,
  },
  
  input: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    borderRadius: Component.input.radius,
  },
  
  // Input variants
  variant_default: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    paddingHorizontal: Component.input.padding.horizontal,
    paddingVertical: Component.input.padding.vertical,
  },
  
  variant_outlined: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    paddingHorizontal: Component.input.padding.horizontal,
    paddingVertical: Component.input.padding.vertical,
  },
  
  variant_filled: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 0,
    paddingHorizontal: Component.input.padding.horizontal,
    paddingVertical: Component.input.padding.vertical,
  },
  
  // Input sizes
  size_sm: {
    fontSize: Typography.fontSize.sm,
    minHeight: 36,
  },
  
  size_md: {
    fontSize: Typography.fontSize.base,
    minHeight: 44,
  },
  
  size_lg: {
    fontSize: Typography.fontSize.lg,
    minHeight: 52,
  },
  
  // Input states
  disabled: {
    backgroundColor: Colors.background.secondary,
    color: Colors.text.disabled,
    borderColor: Colors.border.light,
  },
  
  error: {
    borderColor: Colors.semantic.error,
  },
  
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.semantic.error,
    marginTop: 4,
  },
  
  // SelectButton 스타일
  selectButton: {
    borderRadius: Layout.radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  selectButton_default: {
    backgroundColor: Colors.background.primary,
    borderColor: Colors.border.medium,
  },
  
  selectButton_primary: {
    backgroundColor: Colors.background.primary,
    borderColor: Colors.primary[300],
  },
  
  selectButton_secondary: {
    backgroundColor: Colors.gray[50],
    borderColor: Colors.gray[200],
  },
  
  // SelectButton selected states
  selectButtonSelected_default: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  
  selectButtonSelected_primary: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  
  selectButtonSelected_secondary: {
    backgroundColor: Colors.gray[100],
    borderColor: Colors.gray[400],
  },
  
  // SelectButton sizes
  selectButton_sm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  
  selectButton_md: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  
  selectButton_lg: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  
  selectButtonDisabled: {
    backgroundColor: Colors.background.disabled,
    borderColor: Colors.border.disabled,
  },
  
  // SelectButton text styles
  selectButtonText: {
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  
  selectButtonText_sm: {
    fontSize: Typography.fontSize.sm,
  },
  
  selectButtonText_md: {
    fontSize: Typography.fontSize.base,
  },
  
  selectButtonText_lg: {
    fontSize: Typography.fontSize.lg,
  },
  
  selectButtonTextSelected_default: {
    color: Colors.primary[700],
  },
  
  selectButtonTextSelected_primary: {
    color: Colors.text.inverse,
  },
  
  selectButtonTextSelected_secondary: {
    color: Colors.text.primary,
  },
  
  selectButtonTextDisabled: {
    color: Colors.text.disabled,
  },
  
  // NumberInput 스타일
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  numberInput: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  
  unitLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
});