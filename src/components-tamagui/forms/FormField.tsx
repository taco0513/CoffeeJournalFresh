import React from 'react';
import {
  YStack,
  XStack,
  Text,
  Label,
  styled,
  GetProps,
} from 'tamagui';

// Type definitions
interface FormFieldProps {
  label?: string;
  required?: boolean;
  errorMessage?: string;
  helperText?: string;
  children: React.ReactNode;
  horizontal?: boolean;
  labelWidth?: number | string;
  containerStyle?: unknown;
  labelStyle?: unknown;
}

export type { FormFieldProps };

// Styled Components
const Container = styled(YStack, {
  name: 'FormFieldContainer',
  marginBottom: '$md',
  
  variants: {
    horizontal: {
      true: {
        // Will be converted to XStack in component
    },
  },
} as const,
})

const HorizontalContainer = styled(XStack, {
  name: 'FormFieldHorizontal',
  alignItems: 'flex-start',
  marginBottom: '$md',
})

const LabelContainer = styled(YStack, {
  name: 'FormFieldLabelContainer',
  
  variants: {
    horizontal: {
      true: {
        justifyContent: 'center',
        paddingTop: '$sm',
    },
  },
} as const,
})

const StyledLabel = styled(Label, {
  name: 'FormFieldLabel',
  fontSize: '$2', // 14px
  fontWeight: '600',
  color: '$color',
  marginBottom: '$xs',
  
  variants: {
    horizontal: {
      true: {
        marginBottom: 0,
        marginRight: '$md',
    },
  },
    hasError: {
      true: {
        color: '$red9',
    },
  },
} as const,
})

const RequiredIndicator = styled(Text, {
  name: 'FormFieldRequired',
  color: '$red9',
  fontSize: '$2',
  marginLeft: 2,
})

const FieldContainer = styled(YStack, {
  name: 'FormFieldInputContainer',
  flex: 1,
})

const HelperText = styled(Text, {
  name: 'FormFieldHelper',
  fontSize: '$1', // 12px
  marginTop: '$xs',
  lineHeight: 16,
  
  variants: {
    type: {
      error: {
        color: '$red9',
    },
      helper: {
        color: '$gray11',
    },
  },
} as const,
})

// Main Component
export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  errorMessage,
  helperText,
  children,
  horizontal = false,
  labelWidth,
  containerStyle,
  labelStyle,
}) => {
  const hasError = Boolean(errorMessage);
  const finalHelperText = errorMessage || helperText;
  
  const LabelComponent = label && (
    <LabelContainer horizontal={horizontal} style={{ width: horizontal ? labelWidth : undefined }}>
      <StyledLabel 
        horizontal={horizontal}
        hasError={hasError}
        style={labelStyle}
      >
        {label}
        {required && <RequiredIndicator>*</RequiredIndicator>}
      </StyledLabel>
    </LabelContainer>
  );
  
  const FieldContent = (
    <FieldContainer>
      {children}
      {finalHelperText && (
        <HelperText type={hasError ? 'error' : 'helper'}>
          {finalHelperText}
        </HelperText>
      )}
    </FieldContainer>
  );
  
  if (horizontal) {
    return (
      <HorizontalContainer style={containerStyle}>
        {LabelComponent}
        {FieldContent}
      </HorizontalContainer>
    );
}
  
  return (
    <Container style={containerStyle}>
      {LabelComponent}
      {FieldContent}
    </Container>
  );
};

export default FormField;
