import React from 'react';
import { styled, Text, H1, H2, H3, Paragraph, GetProps } from 'tamagui';

// Styled Typography Components using Tamagui's built-in components
const StyledH1 = styled(H1, {
  name: 'Heading1',
  fontSize: '$8', // 36px
  fontWeight: '700',
  lineHeight: 42,
  color: '$color',
  marginBottom: '$sm',
});

const StyledH2 = styled(H2, {
  name: 'Heading2',
  fontSize: '$7', // 32px
  fontWeight: '700',
  lineHeight: 38,
  color: '$color',
  marginBottom: '$sm',
});

const StyledH3 = styled(H3, {
  name: 'Heading3',
  fontSize: '$6', // 28px
  fontWeight: '600',
  lineHeight: 34,
  color: '$color',
  marginBottom: '$sm',
});

const StyledBodyText = styled(Text, {
  name: 'BodyText',
  fontSize: '$3', // 18px
  fontWeight: '400',
  lineHeight: 24,
  color: '$color',
});

const StyledCaption = styled(Text, {
  name: 'Caption',
  fontSize: '$1', // 14px
  fontWeight: '400',
  lineHeight: 20,
  color: '$gray11',
});

// Type definitions
export type TypographyProps = GetProps<typeof Text> & {
  color?: string;
  children: React.ReactNode;
};

/**
 * Typography Components for consistent text styling with Tamagui
 * 
 * Usage examples:
 * 
 * <Heading1>Main Title</Heading1>
 * <Heading1 color="$green9">Green Title</Heading1>
 * <Heading1 marginBottom="$lg">Custom Margin Title</Heading1>
 * 
 * <Heading2>Section Header</Heading2>
 * <Heading3>Subsection Header</Heading3>
 * 
 * <BodyText>Regular paragraph text goes here...</BodyText>
 * <BodyText color="$gray11">Secondary text</BodyText>
 * 
 * <Caption>Small helper text</Caption>
 * <Caption color="$gray10">Disabled caption</Caption>
 */

export const Heading1: React.FC<TypographyProps> = ({ 
  color,
  children, 
  ...props 
}) => {
  return (
    <StyledH1 
      color={color || '$color'}
      {...props}
    >
      {children}
    </StyledH1>
  );
};

export const Heading2: React.FC<TypographyProps> = ({ 
  color,
  children, 
  ...props 
}) => {
  return (
    <StyledH2 
      color={color || '$color'}
      {...props}
    >
      {children}
    </StyledH2>
  );
};

export const Heading3: React.FC<TypographyProps> = ({ 
  color,
  children, 
  ...props 
}) => {
  return (
    <StyledH3 
      color={color || '$color'}
      {...props}
    >
      {children}
    </StyledH3>
  );
};

export const BodyText: React.FC<TypographyProps> = ({ 
  color,
  children, 
  ...props 
}) => {
  return (
    <StyledBodyText 
      color={color || '$color'}
      {...props}
    >
      {children}
    </StyledBodyText>
  );
};

export const Caption: React.FC<TypographyProps> = ({ 
  color,
  children, 
  ...props 
}) => {
  return (
    <StyledCaption 
      color={color || '$gray11'}
      {...props}
    >
      {children}
    </StyledCaption>
  );
};