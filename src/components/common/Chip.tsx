import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { HIGConstants, HIGColors } from '../../styles/common';

// Chip Design System
export const ChipConstants = {
  // Sizes
  SMALL: {
    height: 32,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 13,
    borderRadius: 16, // height / 2 for perfect pill
  },
  MEDIUM: {
    height: 36,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    borderRadius: 18, // height / 2 for perfect pill
  },
  LARGE: {
    height: 40,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    borderRadius: 20, // height / 2 for perfect pill
  },
} as const;

export type ChipSize = keyof typeof ChipConstants;
export type ChipVariant = 'default' | 'selected' | 'outline' | 'subtle';

export interface ChipProps {
  title: string;
  size?: ChipSize;
  variant?: ChipVariant;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  activeOpacity?: number;
}

export const Chip: React.FC<ChipProps> = ({
  title,
  size = 'MEDIUM',
  variant = 'default',
  onPress,
  disabled = false,
  style,
  textStyle,
  activeOpacity = 0.7,
}) => {
  const sizeConfig = ChipConstants[size];
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'selected':
        return {
          container: styles.selectedContainer,
          text: styles.selectedText,
        };
      case 'outline':
        return {
          container: styles.outlineContainer,
          text: styles.outlineText,
        };
      case 'subtle':
        return {
          container: styles.subtleContainer,
          text: styles.subtleText,
        };
      default:
        return {
          container: styles.defaultContainer,
          text: styles.defaultText,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const containerStyle = [
    styles.chip,
    {
      height: sizeConfig.height,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      paddingVertical: sizeConfig.paddingVertical,
      borderRadius: sizeConfig.borderRadius,
    },
    variantStyles.container,
    disabled && styles.disabledContainer,
    style,
  ];

  const textStyleFinal = [
    styles.text,
    {
      fontSize: sizeConfig.fontSize,
    },
    variantStyles.text,
    disabled && styles.disabledText,
    textStyle,
  ];

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        activeOpacity={activeOpacity}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <Text style={textStyleFinal} numberOfLines={1}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={containerStyle} disabled>
      <Text style={textStyleFinal} numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  
  // Base text style
  text: {
    fontWeight: '500',
    textAlign: 'center',
  },

  // Variant styles
  defaultContainer: {
    backgroundColor: HIGColors.systemGray6,
  },
  defaultText: {
    color: HIGColors.label,
  },

  selectedContainer: {
    backgroundColor: HIGColors.systemBlue,
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: HIGColors.systemBlue,
  },
  outlineText: {
    color: HIGColors.systemBlue,
    fontWeight: '600',
  },

  subtleContainer: {
    backgroundColor: '#E3F2FD',
  },
  subtleText: {
    color: HIGColors.systemBlue,
    fontWeight: '500',
  },

  // Disabled state
  disabledContainer: {
    backgroundColor: HIGColors.systemGray5,
    opacity: 0.6,
  },
  disabledText: {
    color: HIGColors.tertiaryLabel,
  },
});