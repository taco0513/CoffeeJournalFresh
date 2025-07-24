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
} from 'tamagui';
import { Platform } from 'react-native';

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
  style?: any;
  inputStyle?: any;
  containerStyle?: any;
}

// Styled Components
const Container = styled(YStack, {
  position: 'relative',
})

const StyledLabel = styled(Label, {
  fontSize: 13,
  fontWeight: '600',
  color: '$color',
  marginBottom: '$xs',
})

const StyledInput = styled(Input, {
  minHeight: 40,
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$3',
  paddingHorizontal: '$sm',
  paddingVertical: '$xs',
  fontSize: 16,
  color: '$color',
  backgroundColor: '$background',
  
  focusStyle: {
    borderColor: '$primary',
    borderWidth: 2,
  },
  
  disabledStyle: {
    opacity: 0.5,
    backgroundColor: '$gray3',
  },
})

const SuggestionsContainer = styled(Card, {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  marginTop: 4,
  maxHeight: 200,
  backgroundColor: '$background',
  borderRadius: '$3',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 8,
  zIndex: 1000,
  overflow: 'hidden',
})

const SuggestionItem = styled(XStack, {
  paddingHorizontal: '$md',
  paddingVertical: '$sm',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
  alignItems: 'center',
  
  pressStyle: {
    backgroundColor: '$gray3',
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
      },
    },
  } as const,
})

const SuggestionText = styled(Text, {
  fontSize: 16,
  color: '$color',
  flex: 1,
  
  variants: {
    isAddNew: {
      true: {
        color: '$primary',
        fontWeight: '500',
      },
    },
  } as const,
})

const AutocompleteInputTamagui: React.FC<AutocompleteInputProps> = ({
  value,
  onChangeText,
  onSelect,
  onBlur,
  suggestions,
  placeholder,
  label,
  maxSuggestions = 10,
  disabled = false,
  style,
  inputStyle,
  containerStyle,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<any>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChangeText = (text: string) => {
    setInternalValue(text);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      onChangeText(text);
    }, 150);
    
    if (text.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (item: string) => {
    setInternalValue(item);
    onSelect(item);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    setInputFocused(true);
    if (internalValue.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setInputFocused(false);
    setTimeout(() => {
      setShowSuggestions(false);
      onBlur?.();
    }, 200);
  };

  const filteredSuggestions = suggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(internalValue.toLowerCase())
    )
    .slice(0, maxSuggestions);

  // Add "new item" suggestion if there's input and no exact match
  const suggestionsToShow = internalValue && 
    !filteredSuggestions.includes(internalValue) &&
    filteredSuggestions.length < maxSuggestions
    ? [...filteredSuggestions, `+ "${internalValue}" 새 커피 등록`]
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
        style={inputStyle}
      />

      <AnimatePresence>
        {showSuggestions && suggestionsToShow.length > 0 && (
          <SuggestionsContainer
            animation="quick"
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
              {suggestionsToShow.map((suggestion, index) => {
                const isAddNew = suggestion.startsWith('+ "');
                return (
                  <SuggestionItem
                    key={suggestion}
                    selected={index === selectedIndex}
                    isAddNew={isAddNew}
                    onPress={() => handleSelect(suggestion)}
                  >
                    <SuggestionText isAddNew={isAddNew}>
                      {suggestion}
                    </SuggestionText>
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

export default AutocompleteInputTamagui;
export { AutocompleteInputTamagui };