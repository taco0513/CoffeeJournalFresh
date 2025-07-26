import React from 'react';
import { Button, Text, ButtonProps } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface FloatingButtonProps extends Omit<ButtonProps, 'children'> {
  title: string;
  isValid?: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  title,
  isValid = true,
  onPress,
  disabled = false,
  ...buttonProps
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Button
      position="absolute"
      bottom={Math.max(insets.bottom - 12, -4)}
      left="$lg"
      right="$lg"
      backgroundColor={isValid && !disabled ? '$cupBlue' : '$gray8'}
      borderRadius="$3"
      height={56}
      onPress={onPress}
      disabled={disabled || !isValid}
      pressStyle={{ scale: 0.98 }}
      alignItems="center"
      justifyContent="center"
      shadowColor="$shadowColor"
      shadowOpacity={0.15}
      shadowRadius={8}
      shadowOffset={{ width: 0, height: 4 }}
      elevation={4}
      {...buttonProps}
    >
      <Text
        color="white"
        fontSize="$4"
        fontWeight="600"
        textAlign="center"
      >
        {title}
      </Text>
    </Button>
  );
};

export default FloatingButton;