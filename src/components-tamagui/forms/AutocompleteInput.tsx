import React, { useState, useEffect, useRef } from 'react';
import {
  YStack,
  XStack,
  Input,
  Text,
  Label,
  styled,
  ScrollView,
  AnimatePresence,
  Card,
  useTheme,
  GetProps,
} from 'tamagui';
import { Platform } from 'react-native';

// Type definitions
interface AutocompleteInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (item: string) => void;
  onBlur?: () => void;
  suggestions: string[];
  placeholder: string;
  label?: string;
  maxSuggestions?: number;
  disabled?: boolean;
  showAddNew?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: unknown;
  containerStyle?: unknown;
}

export type AutocompleteInputVariant = 'default' | 'error' | 'success';
export type { AutocompleteInputProps };

// Styled Components
const Container = styled(YStack, {
  name: 'AutocompleteInput',
  position: 'relative',
})

const StyledLabel = styled(Label, {
  name: 'AutocompleteLabel',
  fontSize: '$2', // 14px
  fontWeight: '600',
  color: '$color',
  marginBottom: '$xs',
})

const StyledInput = styled(Input, {
  name: 'AutocompleteInputField',
  minHeight: 44,
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$3',
  paddingHorizontal: '$md',
  paddingVertical: '$sm',
  fontSize: '$3', // 16px
  color: '$color',
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
  
  disabledStyle: {
    opacity: 0.5,
    backgroundColor: '$gray3',
    color: '$gray10',
},
  
  variants: {
    variant: {
      default: {
        borderColor: '$borderColor',
    },
      error: {
        borderColor: '$red8',
        backgroundColor: '$red1',
    },
      success: {
        borderColor: '$green8',
        backgroundColor: '$green1',
    },
  },
} as const,
})

const SuggestionsContainer = styled(Card, {
  name: 'SuggestionsContainer',
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  marginTop: 4,
  maxHeight: 200,
  backgroundColor: '$background',
  borderRadius: '$3',
  borderWidth: 1,
  borderColor: '$borderColor',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 8,
  zIndex: 1000,
  overflow: 'hidden',
  animation: 'quick',
})

const SuggestionItem = styled(XStack, {
  name: 'SuggestionItem',
  paddingHorizontal: '$md',
  paddingVertical: '$sm',
  minHeight: 44,
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
  alignItems: 'center',
  justifyContent: 'space-between',
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
    },
  },
    isAddNew: {
      true: {
        backgroundColor: '$gray2',
        borderLeftWidth: 3,
        borderLeftColor: '$cupBlue',
    },
  },
    isLast: {
      true: {
        borderBottomWidth: 0,
    },
  },
} as const,
})

const SuggestionText = styled(Text, {
  name: 'SuggestionText',
  fontSize: '$3', // 16px
  color: '$color',
  flex: 1,
  
  variants: {
    isAddNew: {
      true: {
        color: '$cupBlue',
        fontWeight: '500',
    },
  },
    selected: {
      true: {
        fontWeight: '500',
    },
  },
} as const,
})

const AddIcon = styled(Text, {
  name: 'AddIcon',
  fontSize: '$3',
  color: '$cupBlue',
  marginLeft: '$sm',
})

// Main Component
export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChangeText,
  onSelect,
  onBlur,
  suggestions,
  placeholder,
  label,
  maxSuggestions = 10,
  disabled = false,
  showAddNew = true,
  style,
  inputStyle,
  containerStyle,
}) => {
  const theme = useTheme();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<unknown>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync internal value with prop value
  useEffect(() => {
    setInternalValue(value);
}, [value]);

  // Show/hide suggestions based on focus and input
  useEffect(() => {
    const shouldShow = inputFocused && 
                      internalValue.length > 0 &&
                      !disabled;
    
    setShowSuggestions(shouldShow);
    
    // Reset selected index when suggestions change
    if (shouldShow) {
      setSelectedIndex(-1);
  }
}, [inputFocused, internalValue, disabled]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
    }
  };
}, []);

  const handleChangeText = (text: string) => {
    // Update internal value immediately for smooth typing
    setInternalValue(text);
    
    // Clear previous debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
  }
    
    // Debounce the actual update to parent
    debounceTimer.current = setTimeout(() => {
      onChangeText(text);
  }, 200); // 200ms delay for smooth typing
};

  const handleSelect = (item: string) => {
    const selectedValue = item.startsWith('+ "') 
      ? internalValue // Use the typed value for new items
      : item;
    
    setInternalValue(selectedValue);
    onSelect(selectedValue);
    setShowSuggestions(false);
    setInputFocused(false);
    setSelectedIndex(-1);
    
    // Clear any pending debounce
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
  }
    
    inputRef.current?.blur();
};

  const handleFocus = () => {
    if (disabled) return;
    setInputFocused(true);
};

  const handleBlur = () => {
    // Clear any pending debounce and update immediately
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      onChangeText(internalValue);
  }
    
    // Delay hiding suggestions to allow for touch events
    setTimeout(() => {
      setInputFocused(false);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      
      onBlur?.();
  }, 150);
};

  // Filter and prepare suggestions
  const filteredSuggestions = suggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(internalValue.toLowerCase())
    )
    .slice(0, maxSuggestions);

  // Add "new item" suggestion if enabled and appropriate
  const suggestionsToShow = showAddNew && 
    internalValue.trim() && 
    !filteredSuggestions.some(s => s.toLowerCase() === internalValue.toLowerCase()) &&
    filteredSuggestions.length < maxSuggestions
    ? [...filteredSuggestions, `+ "${internalValue.trim()}" 새로 등록`]
    : filteredSuggestions;

  return (
    <Container style={containerStyle}>
      {label && <StyledLabel>{label}</StyledLabel>}
      
      <StyledInput
        ref={inputRef}
        value={internalValue}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor="$gray10"
        disabled={disabled}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        returnKeyType="done"
        blurOnSubmit
        style={[style, inputStyle]}
      />

      <AnimatePresence>
        {showSuggestions && suggestionsToShow.length > 0 && (
          <SuggestionsContainer
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
              contentContainerStyle={{ flexGrow: 1 }}
            >
              {suggestionsToShow.map((suggestion, index) => {
                const isAddNew = suggestion.startsWith('+ "');
                const isLast = index === suggestionsToShow.length - 1;
                
                return (
                  <SuggestionItem
                    key={`${suggestion}-${index}`}
                    selected={index === selectedIndex}
                    isAddNew={isAddNew}
                    isLast={isLast}
                    onPress={() => handleSelect(suggestion)}
                  >
                    <SuggestionText 
                      isAddNew={isAddNew}
                      selected={index === selectedIndex}
                      numberOfLines={1}
                    >
                      {suggestion}
                    </SuggestionText>
                    {isAddNew && <AddIcon>+</AddIcon>}
                  </SuggestionItem>
                );
            })}
            </ScrollView>
          </SuggestionsContainer>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default AutocompleteInput;
