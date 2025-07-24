/**
 * CupNote Design System - Button Component
 * 
 * 통일된 버튼 컴포넌트로 일관성 있는 인터랙션 제공
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Typography, Layout, Component } from '../tokens';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'coffee';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onPress,
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={Layout.opacity.pressed}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? Colors.text.inverse : Colors.primary[500]} 
        />
      ) : (
        <Text style={textStyleCombined}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base styles
  base: {
    borderRadius: Layout.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Layout.shadow.sm,
  },

  // Size variants
  size_sm: {
    height: Component.button.height.sm,
    paddingHorizontal: Component.button.padding.sm.horizontal,
    paddingVertical: Component.button.padding.sm.vertical,
  },
  size_md: {
    height: Component.button.height.md,
    paddingHorizontal: Component.button.padding.md.horizontal,
    paddingVertical: Component.button.padding.md.vertical,
  },
  size_lg: {
    height: Component.button.height.lg,
    paddingHorizontal: Component.button.padding.lg.horizontal,
    paddingVertical: Component.button.padding.lg.vertical,
  },
  size_xl: {
    height: Component.button.height.xl,
    paddingHorizontal: Component.button.padding.xl.horizontal,
    paddingVertical: Component.button.padding.xl.vertical,
  },

  // Variant styles
  variant_primary: {
    backgroundColor: Colors.primary[500],
    borderWidth: 0,
  },
  variant_secondary: {
    backgroundColor: Colors.gray[100],
    borderWidth: 0,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
  variant_ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  variant_coffee: {
    backgroundColor: Colors.semantic.coffee,
    borderWidth: 0,
  },

  // Text styles
  text: {
    fontFamily: Typography.fontFamily.system,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  
  text_sm: {
    fontSize: Typography.fontSize.sm,
  },
  text_md: {
    fontSize: Typography.fontSize.base,
  },
  text_lg: {
    fontSize: Typography.fontSize.lg,
  },
  text_xl: {
    fontSize: Typography.fontSize.xl,
  },

  // Text variant styles
  text_primary: {
    color: Colors.text.inverse,
  },
  text_secondary: {
    color: Colors.text.primary,
  },
  text_outline: {
    color: Colors.primary[500],
  },
  text_ghost: {
    color: Colors.primary[500],
  },
  text_coffee: {
    color: Colors.text.inverse,
  },

  // State styles
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: Layout.opacity.disabled,
  },
  textDisabled: {
    color: Colors.text.disabled,
  },
});