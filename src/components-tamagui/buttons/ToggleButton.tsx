import React from 'react';
import { Button, Text, ButtonProps } from 'tamagui';

export interface ToggleButtonProps extends Omit<ButtonProps, 'children'> {
  children: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

/**
 * Global ToggleButton Component
 * 
 * Consistent toggle/selection button with standardized dimensions:
 * - Width: minWidth 88px (balanced size)
 * - Height: 36px (comfortable touch)
 * - Follows Material Design + CupNote design principles
 */
export const ToggleButton: React.FC<ToggleButtonProps> = ({
  children,
  selected = false,
  onPress,
  disabled = false,
  ...buttonProps
}) => {
  return (
    <Button
      backgroundColor={selected ? '$blue2' : '$gray2'}
      borderWidth={selected ? 2 : 1}
      borderColor={selected ? '$primary' : '$borderColor'}
      borderRadius="$3"
      padding="$sm"
      marginRight="$sm"
      marginBottom="$sm"
      minWidth={88}  // Global standard: 88px minimum width
      height={36}    // Global standard: 36px height
      onPress={onPress}
      disabled={disabled}
      pressStyle={{ 
        scale: 0.95,
        backgroundColor: selected ? '$blue3' : '$gray3'
      }}
      {...buttonProps}
    >
      <Text 
        fontSize="$3" // 16px
        fontWeight={selected ? '600' : '400'}
        color={selected ? '$blue11' : '$color'}
      >
        {children}
      </Text>
    </Button>
  );
};

export default ToggleButton;