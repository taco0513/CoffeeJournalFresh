import React from 'react';
import { Button, ButtonProps, styled, GetProps } from 'tamagui';

// Define variant types
export type NavigationButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';

// Create styled button with variants
const StyledButton = styled(Button, {
  name: 'NavigationButton',
  
  // Base styles
  minHeight: 44, // MIN_TOUCH_TARGET
  paddingHorizontal: '$xl',
  paddingVertical: '$md',
  borderRadius: '$4',
  marginVertical: '$sm',
  pressStyle: {
    scale: 0.98,
    opacity: 0.8,
},
  
  // WCAG 2.4.7 Focus Visible - Enhanced accessibility
  focusStyle: {
    borderWidth: 3,
    borderColor: '$focusRing',
    shadowColor: '$focusRing',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    outlineColor: '$focusRing',
    outlineWidth: 2,
    outlineOffset: 2,
},
  
  variants: {
    variant: {
      primary: {
        backgroundColor: '$cupBlue',
        borderWidth: 0,
        color: 'white',
        fontWeight: '600',
        fontSize: '$3',
        hoverStyle: {
          backgroundColor: '$cupBlueDark',
      },
    },
      secondary: {
        backgroundColor: '$gray4',
        borderWidth: 0,
        color: '$color',
        fontWeight: '600',
        fontSize: '$3',
        hoverStyle: {
          backgroundColor: '$gray5',
      },
    },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$cupBlue',
        color: '$cupBlue',
        fontWeight: '600',
        fontSize: '$3',
        hoverStyle: {
          backgroundColor: '$cupBlue',
          color: 'white',
      },
    },
      text: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        paddingHorizontal: '$md',
        color: '$cupBlue',
        fontWeight: '600',
        fontSize: '$3',
        hoverStyle: {
          backgroundColor: 'transparent',
          opacity: 0.7,
      },
    },
  },
    
    fullWidth: {
      true: {
        width: '100%',
        alignSelf: 'stretch',
    },
      false: {
        alignSelf: 'flex-start',
    },
  },
    
    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
  },
} as const,
  
  defaultVariants: {
    variant: 'primary',
    fullWidth: true,
},
});

// Export the component props type
export type NavigationButtonProps = GetProps<typeof StyledButton> & {
  title: string;
  onPress: () => void;
  variant?: NavigationButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
};

// Main component
const NavigationButton: React.FC<NavigationButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  fullWidth = true,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      fullWidth={fullWidth}
      disabled={disabled}
      onPress={onPress}
      animation="quick"
      {...props}
    >
      {title}
    </StyledButton>
  );
};

export default NavigationButton;