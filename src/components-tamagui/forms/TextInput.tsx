import React, { forwardRef } from 'react';
import {
  Input,
  Label,
  YStack,
  Text,
  styled,
  GetProps,
} from 'tamagui';

// Type definitions
export type TextInputVariant = 'default' | 'error' | 'success' | 'warning';
export type TextInputSize = 'small' | 'medium' | 'large';

interface TextInputProps extends GetProps<typeof StyledInput> {
  label?: string;
  errorMessage?: string;
  helperText?: string;
  variant?: TextInputVariant;
  size?: TextInputSize;
  required?: boolean;
  containerStyle?: any;
  labelStyle?: any;
}

export type { TextInputProps };

// Size configurations - WCAG minimum 44px touch target
const sizeConfig = {
  small: {
    minHeight: 44, // WCAG minimum touch target
    fontSize: '$2', // 16px - WCAG minimum
    paddingHorizontal: '$sm',
    paddingVertical: '$xs',
  },
  medium: {
    minHeight: 44, // WCAG minimum touch target
    fontSize: '$3', // 16px
    paddingHorizontal: '$md',
    paddingVertical: '$sm',
  },
  large: {
    minHeight: 52,
    fontSize: '$4', // 18px
    paddingHorizontal: '$lg',
    paddingVertical: '$md',
  },
};

// Styled Components
const Container = styled(YStack, {
  name: 'TextInputContainer',
})

const StyledLabel = styled(Label, {
  name: 'TextInputLabel',
  fontSize: '$3', // 16px - WCAG minimum
  fontWeight: '600',
  color: '$color',
  marginBottom: '$xs',
  
  variants: {
    required: {
      true: {
        // Add required indicator via pseudo element (not directly supported, handled in component)
      },
    },
    variant: {
      error: {
        color: '$red9',
      },
      warning: {
        color: '$orange9',
      },
    },
  } as const,
})

const StyledInput = styled(Input, {
  name: 'TextInput',
  borderWidth: 1,
  borderRadius: '$3',
  backgroundColor: '$background',
  color: '$color',
  fontSize: '$3',
  
  // WCAG 2.4.7 Focus Visible - Enhanced accessibility
  focusStyle: {
    borderWidth: 3,
    borderColor: '$focusRing',
    shadowColor: '$focusRing',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
    outlineColor: '$focusRing',
    outlineWidth: 2,
    outlineOffset: 2,
  },
  
  disabledStyle: {
    opacity: 0.5,
    backgroundColor: '$gray3',
    color: '$gray10',
  },
  
  variants: {
    variant: {
      default: {
        borderColor: '$borderColor',
        focusStyle: {
          borderColor: '$cupBlue',
        },
      },
      error: {
        borderColor: '$red8',
        backgroundColor: '$red1',
        focusStyle: {
          borderColor: '$red9',
        },
      },
      success: {
        borderColor: '$green8',
        backgroundColor: '$green1',
        focusStyle: {
          borderColor: '$green9',
        },
      },
      warning: {
        borderColor: '$orange8',
        backgroundColor: '$orange1',
        focusStyle: {
          borderColor: '$orange9',
        },
      },
    },
    size: {
      small: sizeConfig.small,
      medium: sizeConfig.medium,
      large: sizeConfig.large,
    },
  } as const,
  
  defaultVariants: {
    variant: 'default',
    size: 'medium',
  },
})

const HelperText = styled(Text, {
  name: 'TextInputHelper',
  fontSize: '$2', // 16px - WCAG minimum
  marginTop: '$xs',
  
  variants: {
    variant: {
      default: {
        color: '$gray11',
      },
      error: {
        color: '$red9',
      },
      success: {
        color: '$green9',
      },
      warning: {
        color: '$orange9',
      },
    },
  } as const,
})

const RequiredIndicator = styled(Text, {
  name: 'RequiredIndicator',
  color: '$red9',
  fontSize: '$2',
  marginLeft: 2,
})

// Main Component
export const TextInput = forwardRef<any, TextInputProps>((
  {
    label,
    errorMessage,
    helperText,
    variant = 'default',
    size = 'medium',
    required = false,
    containerStyle,
    labelStyle,
    ...inputProps
  },
  ref
) => {
  // Determine final variant based on error state
  const finalVariant = errorMessage ? 'error' : variant;
  const finalHelperText = errorMessage || helperText;

  return (
    <Container style={containerStyle}>
      {label && (
        <StyledLabel 
          variant={finalVariant}
          required={required}
          style={labelStyle}
        >
          {label}
          {required && <RequiredIndicator>*</RequiredIndicator>}
        </StyledLabel>
      )}
      
      <StyledInput
        ref={ref}
        variant={finalVariant}
        size={size}
        placeholderTextColor="$gray10"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        {...inputProps}
      />
      
      {finalHelperText && (
        <HelperText variant={finalVariant}>
          {finalHelperText}
        </HelperText>
      )}
    </Container>
  );
});

TextInput.displayName = 'TextInput';

export default TextInput;
