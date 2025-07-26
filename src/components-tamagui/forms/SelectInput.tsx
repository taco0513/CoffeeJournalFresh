import React, { useState } from 'react';
import {
  YStack,
  XStack,
  Text,
  Button,
  styled,
  AnimatePresence,
  Card,
  ScrollView,
  GetProps,
} from 'tamagui';

// Type definitions
interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  icon?: string;
}

interface SelectInputProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  maxHeight?: number;
  containerStyle?: unknown;
  buttonStyle?: unknown;
}

export type { SelectInputProps, SelectOption };

// Styled Components
const Container = styled(YStack, {
  name: 'SelectContainer',
  position: 'relative',
})

const SelectButton = styled(Button, {
  name: 'SelectButton',
  justifyContent: 'space-between',
  alignItems: 'center',
  minHeight: 44,
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$3',
  paddingHorizontal: '$md',
  paddingVertical: '$sm',
  backgroundColor: '$background',
  
  focusStyle: {
    borderColor: '$cupBlue',
    borderWidth: 2,
    shadowColor: '$cupBlue',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
},
  
  pressStyle: {
    backgroundColor: '$gray2',
    scale: 0.98,
},
  
  disabledStyle: {
    opacity: 0.5,
    backgroundColor: '$gray3',
},
  
  variants: {
    isOpen: {
      true: {
        borderColor: '$cupBlue',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
  },
} as const,
})

const ButtonContent = styled(XStack, {
  name: 'SelectButtonContent',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'space-between',
})

const ButtonText = styled(Text, {
  name: 'SelectButtonText',
  fontSize: '$3', // 16px
  flex: 1,
  textAlign: 'left',
  
  variants: {
    isPlaceholder: {
      true: {
        color: '$gray10',
    },
      false: {
        color: '$color',
    },
  },
} as const,
})

const ChevronIcon = styled(Text, {
  name: 'SelectChevron',
  fontSize: '$3',
  color: '$gray9',
  marginLeft: '$sm',
  
  variants: {
    isOpen: {
      true: {
        transform: [{ rotate: '180deg' }],
    },
  },
} as const,
})

const OptionsContainer = styled(Card, {
  name: 'SelectOptions',
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$cupBlue',
  borderTopWidth: 0,
  borderBottomLeftRadius: '$3',
  borderBottomRightRadius: '$3',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 8,
  zIndex: 1000,
  overflow: 'hidden',
  animation: 'quick',
})

const OptionItem = styled(XStack, {
  name: 'SelectOption',
  paddingHorizontal: '$md',
  paddingVertical: '$sm',
  minHeight: 44,
  alignItems: 'center',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
  backgroundColor: '$background',
  
  pressStyle: {
    backgroundColor: '$gray3',
    scale: 0.98,
},
  
  hoverStyle: {
    backgroundColor: '$gray2',
},
  
  variants: {
    selected: {
      true: {
        backgroundColor: '$cupBlueLight',
        borderLeftWidth: 3,
        borderLeftColor: '$cupBlue',
    },
  },
    disabled: {
      true: {
        opacity: 0.5,
        pressStyle: {
          backgroundColor: '$background',
          scale: 1,
      },
    },
  },
    isLast: {
      true: {
        borderBottomWidth: 0,
    },
  },
} as const,
})

const OptionIcon = styled(Text, {
  name: 'SelectOptionIcon',
  fontSize: '$3',
  marginRight: '$sm',
})

const OptionText = styled(Text, {
  name: 'SelectOptionText',
  fontSize: '$3',
  color: '$color',
  flex: 1,
  
  variants: {
    selected: {
      true: {
        fontWeight: '500',
        color: '$cupBlue',
    },
  },
    disabled: {
      true: {
        color: '$gray10',
    },
  },
} as const,
})

const CheckIcon = styled(Text, {
  name: 'SelectCheck',
  fontSize: '$3',
  color: '$cupBlue',
  fontWeight: 'bold',
})

// Main Component
export const SelectInput: React.FC<SelectInputProps> = ({
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  label,
  disabled = false,
  maxHeight = 200,
  containerStyle,
  buttonStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;
  const isPlaceholder = !selectedOption;
  
  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
};
  
  const handleSelect = (optionValue: string) => {
    const option = options.find(opt => opt.value === optionValue);
    if (option && !option.disabled) {
      onValueChange(optionValue);
      setIsOpen(false);
  }
};
  
  // Close dropdown when clicking outside (handled by AnimatePresence)
  const handleBackdropPress = () => {
    setIsOpen(false);
};
  
  return (
    <Container style={containerStyle}>
      <SelectButton
        unstyled
        isOpen={isOpen}
        onPress={handleToggle}
        disabled={disabled}
        style={buttonStyle}
      >
        <ButtonContent>
          <ButtonText isPlaceholder={isPlaceholder} numberOfLines={1}>
            {selectedOption?.icon && (
              <Text marginRight="$sm">{selectedOption.icon}</Text>
            )}
            {displayText}
          </ButtonText>
          <ChevronIcon isOpen={isOpen}>▼</ChevronIcon>
        </ButtonContent>
      </SelectButton>
      
      <AnimatePresence>
        {isOpen && (
          <OptionsContainer
            style={{ maxHeight }}
            enterStyle={{
              opacity: 0,
              scale: 0.95,
              y: -10,
          }}
            exitStyle={{
              opacity: 0,
              scale: 0.95,
              y: -10,
          }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {options.map((option, index) => {
                const isSelected = option.value === value;
                const isLast = index === options.length - 1;
                
                return (
                  <OptionItem
                    key={option.value}
                    selected={isSelected}
                    disabled={option.disabled}
                    isLast={isLast}
                    onPress={option.disabled ? undefined : () => handleSelect(option.value)}
                  >
                    {option.icon && (
                      <OptionIcon>{option.icon}</OptionIcon>
                    )}
                    <OptionText 
                      selected={isSelected}
                      disabled={option.disabled}
                      numberOfLines={1}
                    >
                      {option.label}
                    </OptionText>
                    {isSelected && <CheckIcon>✓</CheckIcon>}
                  </OptionItem>
                );
            })}
            </ScrollView>
          </OptionsContainer>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default SelectInput;
