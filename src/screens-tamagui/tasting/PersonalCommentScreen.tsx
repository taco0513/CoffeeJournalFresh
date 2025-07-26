import React, { useState, useRef, useEffect } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IOSLayout, IOSSpacing } from '../../styles/ios-hig-2024';
import {
  YStack,
  XStack,
  Text,
  Button,
  TextArea,
  styled,
  ScrollView,
  H3,
  Card,
} from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../../stores/tastingStore';
import { flavorWheelKorean } from '../../data/flavorWheelKorean';
import { FloatingButton } from '../../components-tamagui/buttons/FloatingButton';

// Styled Components
const Container = styled(YStack, {
  flex: 1,
  backgroundColor: '$background',
})

// HeaderBar, BackButton, HeaderTitle 제거됨 - 네비게이션 헤더 사용

const SkipButton = styled(Text, {
  fontSize: 15,
  color: '$primary',
  fontFamily: '$body',
  pressStyle: { opacity: 0.7 },
})

const ProgressBar = styled(XStack, {
  height: 3,
  backgroundColor: '$gray5',
  width: '100%',
})

const ProgressFill = styled(XStack, {
  height: '100%',
  backgroundColor: '$primary',
})

const ContentContainer = styled(YStack, {
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
  gap: '$xl',
})

const Section = styled(YStack, {
  gap: '$md',
})

const SectionTitle = styled(H3, {
  fontSize: 20,
  fontWeight: '600',
  color: '$color',
  marginBottom: '$xs',
})

const SectionDescription = styled(Text, {
  fontSize: 15,
  color: '$gray11',
  lineHeight: 20,
})

const InputContainer = styled(Card, {
  backgroundColor: '$gray2',
  borderRadius: '$3',
  borderWidth: 1,
  borderColor: '$borderColor',
  padding: '$md',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 2,
})

const StyledTextArea = styled(TextArea, {
  fontSize: '$4', // 18px
  color: '$color',
  lineHeight: 22,
  minHeight: 88,
  maxHeight: 88,
  backgroundColor: 'transparent',
  borderWidth: 0,
  focusStyle: {
    borderWidth: 0,
},
})

const CharacterCount = styled(Text, {
  fontSize: 13,
  color: '$gray10',
  textAlign: 'right',
  marginTop: '$xs',
})

const SelectionsTitle = styled(Text, {
  fontSize: 16,
  fontWeight: '600',
  color: '$color',
  marginBottom: '$md',
})

const SelectionRow = styled(XStack, {
  alignItems: 'flex-start',
  marginBottom: '$md',
  gap: '$md',
})

const SelectionLabel = styled(Text, {
  fontSize: 14,
  fontWeight: '600',
  color: '$gray11',
  width: 50,
  marginTop: 4,
})

const SelectionTags = styled(XStack, {
  flex: 1,
  flexWrap: 'wrap',
  gap: '$xs',
})

const SelectionTag = styled(Button, {
  backgroundColor: '$cupBlueLight',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '$cupBlue',
  height: 'auto',
  minHeight: 28,
  
  pressStyle: {
    scale: 0.95,
    backgroundColor: '$primary',
},
  
  variants: {
    selected: {
      true: {
        backgroundColor: '$primary',
        borderColor: '$primary',
    },
  },
} as const,
})

const SelectionText = styled(Text, {
  fontSize: 14,
  color: '$color',
  fontWeight: '500',
  
  variants: {
    selected: {
      true: {
        color: 'white',
        fontWeight: '600',
    },
  },
} as const,
})

// BottomContainer는 SafeArea를 고려해서 동적으로 처리

const NextButton = styled(Button, {
  height: 48,
  backgroundColor: '$primary',
  borderRadius: '$3',
  
  pressStyle: {
    backgroundColor: '$primaryHover',
    scale: 0.98,
},
})

const NextButtonText = styled(Text, {
  fontSize: 16,
  fontWeight: '600',
  color: 'white',
})

const PersonalCommentScreenTamagui = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { currentTasting, updateField, saveTasting } = useTastingStore();
  
  // Deduplicate any existing personalComment content on load
  const deduplicateText = (text: string): string => {
    if (!text) return text;
    const words = text.split(' ').filter(word => word.trim() !== '');
    const uniqueWords = [...new Set(words)];
    return uniqueWords.join(' ');
};

  const [personalComment, setPersonalComment] = useState(
    deduplicateText(currentTasting.personalComment || '')
  );
  const textInputRef = useRef<unknown>(null);

  // Auto-focus on the input field when screen loads
  useEffect(() => {
    const timer = setTimeout(() => {
      textInputRef.current?.focus();
  }, 500);
    return () => clearTimeout(timer);
}, []);

  const handleNext = async () => {
    updateField('personalComment', personalComment.trim());
    
    try {
      navigation.navigate('RoasterNotes' as never);
  } catch (error) {
      navigation.navigate('RoasterNotes' as never);
  }
};

  const handleSkip = () => {
    updateField('personalComment', '');
    navigation.navigate('RoasterNotes' as never);
};

  // Get user selections summary
  const getUserSelections = () => {
    const selections = {
      flavors: [] as string[],
      sensory: [] as string[],
      sensoryByCategory: {} as Record<string, string[]>,
      ratings: {} as Record<string, number>,
      mouthfeel: ''
  };
    
    // Flavor selections (convert to Korean)
    if (currentTasting.selectedFlavors && currentTasting.selectedFlavors.length > 0) {
      const { translations } = flavorWheelKorean;
      
      currentTasting.selectedFlavors.forEach((flavorPath: unknown) => {
        if (flavorPath.level3) {
          selections.flavors.push(flavorPath.level3);
      } else if (flavorPath.level2) {
          const koreanName2 = translations[flavorPath.level2 as keyof typeof translations] || flavorPath.level2;
          selections.flavors.push(koreanName2);
      } else if (flavorPath.level1) {
          const koreanName1 = flavorWheelKorean.level1[flavorPath.level1 as keyof typeof flavorWheelKorean.level1] || flavorPath.level1;
          selections.flavors.push(koreanName1);
      }
    });
  }
    
    // Sensory expressions (grouped by category)
    const { selectedSensoryExpressions } = useTastingStore.getState();
    if (selectedSensoryExpressions && selectedSensoryExpressions.length > 0) {
      const categoryNames: Record<string, string> = {
        acidity: '산미',
        sweetness: '단맛',
        bitterness: '쓴맛',
        body: '바디',
        aftertaste: '애프터',
        balance: '밸런스'
    };
      
      const addedExpressions = new Set<string>();
      
      selectedSensoryExpressions.forEach(expr => {
        if (expr.selected) {
          const uniqueKey = `${expr.korean}_${expr.categoryId}`;
          
          if (!addedExpressions.has(uniqueKey)) {
            selections.sensory.push(expr.korean);
            addedExpressions.add(uniqueKey);
          
            const categoryKorean = categoryNames[expr.categoryId] || expr.categoryId;
            if (!selections.sensoryByCategory[categoryKorean]) {
              selections.sensoryByCategory[categoryKorean] = [];
          }
            selections.sensoryByCategory[categoryKorean].push(expr.korean);
        }
      }
    });
  }
    
    // Basic evaluation scores
    selections.ratings = {
      '바디감': currentTasting.body,
      '산미': currentTasting.acidity,
      '단맛': currentTasting.sweetness,
      '쓴맛': currentTasting.bitterness,
      '여운': currentTasting.finish,
      '밸런스': currentTasting.balance
  };
    
    // Mouthfeel
    selections.mouthfeel = currentTasting.mouthfeel || '';
    
    return selections;
};
  
  const userSelections = getUserSelections();

  // Add text to comment function
  const addTextToComment = (text: string) => {
    const currentText = personalComment.trim();
    
    // Prevent adding duplicate text
    if (currentText.includes(text)) {
      return;
  }
    
    if (currentText) {
      if (currentText.endsWith('.')) {
        setPersonalComment(currentText + ' ' + text);
    } else {
        setPersonalComment(currentText + ' ' + text);
    }
  } else {
      setPersonalComment(text);
  }
};

  const hasSelections = userSelections.flavors.length > 0 || 
    Object.keys(userSelections.sensoryByCategory).length > 0 ||
    Object.values(userSelections.ratings).some(score => score >= 4) ||
    userSelections.mouthfeel;

  return (
    <Container>
      <YStack flex={1}>

          {/* Progress Bar */}
          <ProgressBar>
            <ProgressFill width="83%" animation="lazy" />
          </ProgressBar>

          <KeyboardAvoidingView 
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView 
              showsVerticalScrollIndicator={false}
              bounces={true}
              contentContainerStyle={{ 
                flexGrow: 1,
                paddingBottom: 120 // Extra padding to clear floating button
              }}
            >
              <ContentContainer>
                <Section>
                  <SectionTitle>나만의 노트</SectionTitle>
                  <SectionDescription>
                    맛, 향, 전반적인 느낌을 자유롭게 표현해보세요
                  </SectionDescription>
                  
                  <InputContainer animation="quick">
                    <StyledTextArea
                      ref={textInputRef}
                      value={personalComment}
                      onChangeText={setPersonalComment}
                      placeholder="예: 풍부한 과일향과 초콜릿의 조화가 인상적이었고, 뒷맛까지 깔끔하게 이어지는 균형 잡힌 커피"
                      placeholderTextColor="$gray10"
                      maxLength={200}
                      numberOfLines={4}
                    />
                    <CharacterCount>
                      {personalComment.length}/200
                    </CharacterCount>
                  </InputContainer>
                </Section>

                {/* User Selections Summary */}
                {hasSelections && (
                  <Section animation="lazy">
                    <SelectionsTitle>오늘 선택한 표현들</SelectionsTitle>
                    
                    {/* Flavors */}
                    {userSelections.flavors.length > 0 && (
                      <SelectionRow>
                        <SelectionLabel>향미</SelectionLabel>
                        <SelectionTags>
                          {userSelections.flavors.map((flavor, index) => {
                            const isAlreadyInComment = personalComment.includes(flavor);
                            return (
                              <SelectionTag
                                key={index}
                                selected={isAlreadyInComment}
                                onPress={() => addTextToComment(flavor)}
                                disabled={isAlreadyInComment}
                                animation="quick"
                              >
                                <SelectionText selected={isAlreadyInComment}>
                                  {flavor}
                                </SelectionText>
                              </SelectionTag>
                            );
                        })}
                        </SelectionTags>
                      </SelectionRow>
                    )}
                    
                    {/* Sensory expressions by category */}
                    {Object.entries(userSelections.sensoryByCategory).map(([category, expressions]) => (
                      <SelectionRow key={category}>
                        <SelectionLabel>{category}</SelectionLabel>
                        <SelectionTags>
                          {expressions.map((expr, index) => {
                            const isAlreadyInComment = personalComment.includes(expr);
                            return (
                              <SelectionTag
                                key={index}
                                selected={isAlreadyInComment}
                                onPress={() => addTextToComment(expr)}
                                disabled={isAlreadyInComment}
                                animation="quick"
                              >
                                <SelectionText selected={isAlreadyInComment}>
                                  {expr}
                                </SelectionText>
                              </SelectionTag>
                            );
                        })}
                        </SelectionTags>
                      </SelectionRow>
                    ))}
                    
                    {/* Main evaluations (4+ points only) - Cafe mode only */}
                    {currentTasting.mode === 'cafe' && (
                      <SelectionRow>
                        <SelectionLabel>평가</SelectionLabel>
                        <SelectionTags>
                          {Object.entries(userSelections.ratings)
                            .filter(([_, score]) => score >= 4)
                            .map(([name, score], index) => {
                              const ratingText = `${name} ${score}/5`;
                              const isAlreadyInComment = personalComment.includes(ratingText);
                              return (
                                <SelectionTag
                                  key={index}
                                  selected={isAlreadyInComment}
                                  onPress={() => addTextToComment(ratingText)}
                                  disabled={isAlreadyInComment}
                                  animation="quick"
                                >
                                  <SelectionText selected={isAlreadyInComment}>
                                    {ratingText}
                                  </SelectionText>
                                </SelectionTag>
                              );
                          })}
                        </SelectionTags>
                      </SelectionRow>
                    )}
                    
                    {/* Mouthfeel - Cafe mode only */}
                    {currentTasting.mode === 'cafe' && userSelections.mouthfeel && (
                      <SelectionRow>
                        <SelectionLabel>질감</SelectionLabel>
                        <SelectionTags>
                          <SelectionTag
                            selected={personalComment.includes(userSelections.mouthfeel)}
                            onPress={() => addTextToComment(userSelections.mouthfeel)}
                            disabled={personalComment.includes(userSelections.mouthfeel)}
                            animation="quick"
                          >
                            <SelectionText selected={personalComment.includes(userSelections.mouthfeel)}>
                              {userSelections.mouthfeel}
                            </SelectionText>
                          </SelectionTag>
                        </SelectionTags>
                      </SelectionRow>
                    )}
                  </Section>
                )}
              </ContentContainer>
            </ScrollView>

            {/* Floating Bottom Button */}
            <FloatingButton
              title="완료"
              onPress={handleNext}
            />
          </KeyboardAvoidingView>
        </YStack>
    </Container>
  );
};

export default PersonalCommentScreenTamagui;