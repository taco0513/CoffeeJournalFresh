import React from 'react';
import { styled, Stack, Text, GetProps } from 'tamagui';

// Define size configurations
const ChipSizeConfig = {
  small: {
    height: 32,
    paddingHorizontal: '$3',
    fontSize: '$1', // 14px
    borderRadius: 16,
  },
  medium: {
    height: 36,
    paddingHorizontal: '$4',
    fontSize: '$2', // 16px
    borderRadius: 18,
  },
  large: {
    height: 40,
    paddingHorizontal: '$5',
    fontSize: '$3', // 18px
    borderRadius: 20,
  },
} as const;

// Styled chip container
const ChipContainer = styled(Stack, {
  name: 'ChipContainer',
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 0,
  animation: 'quick',
  cursor: 'pointer',
  
  pressStyle: {
    scale: 0.96,
    opacity: 0.8,
  },
  
  variants: {
    size: {
      small: ChipSizeConfig.small,
      medium: ChipSizeConfig.medium,
      large: ChipSizeConfig.large,
    },
    
    variant: {
      default: {
        backgroundColor: '$gray6',
      },
      selected: {
        backgroundColor: '$cupBlue',
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$cupBlue',
      },
      subtle: {
        backgroundColor: '$blue2',
      },
    },
    
    disabled: {
      true: {
        opacity: 0.6,
        cursor: 'not-allowed',
      },
    },
    
    clickable: {
      false: {
        cursor: 'default',
        pressStyle: {
          scale: 1,
          opacity: 1,
        },
      },
    },
  } as const,
  
  defaultVariants: {
    size: 'medium',
    variant: 'default',
  },
});

// Styled text component
const ChipText = styled(Text, {
  name: 'ChipText',
  fontWeight: '500',
  textAlign: 'center',
  numberOfLines: 1,
  
  variants: {
    size: {
      small: {
        fontSize: '$1',
      },
      medium: {
        fontSize: '$2',
      },
      large: {
        fontSize: '$3',
      },
    },
    
    variant: {
      default: {
        color: '$color',
      },
      selected: {
        color: 'white',
        fontWeight: '600',
      },
      outline: {
        color: '$cupBlue',
        fontWeight: '600',
      },
      subtle: {
        color: '$cupBlue',
        fontWeight: '500',
      },
    },
    
    disabled: {
      true: {
        color: '$gray10',
      },
    },
  } as const,
  
  defaultVariants: {
    size: 'medium',
    variant: 'default',
  },
});

// Export types
export type ChipSize = 'small' | 'medium' | 'large';
export type ChipVariant = 'default' | 'selected' | 'outline' | 'subtle';

export interface ChipProps {
  title: string;
  size?: ChipSize;
  variant?: ChipVariant;
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
  textStyle?: any;
}

// Main component
export const Chip: React.FC<ChipProps> = ({
  title,
  size = 'medium',
  variant = 'default',
  onPress,
  disabled = false,
  style,
  textStyle,
}) => {
  const isClickable = !!onPress && !disabled;
  
  return (
    <ChipContainer
      size={size}
      variant={variant}
      disabled={disabled}
      clickable={isClickable}
      onPress={isClickable ? onPress : undefined}
      accessible
      accessibilityRole="button"
      accessibilityLabel={title}
      style={style}
    >
      <ChipText
        size={size}
        variant={variant}
        disabled={disabled}
        style={textStyle}
      >
        {title}
      </ChipText>
    </ChipContainer>
  );
};

export default Chip;