import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  styled,
  ScrollView,
  AnimatePresence,
  H3,
} from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../../stores/tastingStore';
import { 
  SensoryOnboarding
} from '../../components/sensory';
import CompactSensoryEvaluation from '../../components/sensory/CompactSensoryEvaluation';
import { checkShouldShowOnboarding } from '../../components/sensory/SensoryOnboarding';
import { SelectedSensoryExpression } from '../../types/sensory';

// Styled Components
const Container = styled(YStack, {
  flex: 1,
  backgroundColor: '$background',
})

const HeaderBar = styled(XStack, {
  height: 44,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  backgroundColor: '$background',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
})

const BackButton = styled(Text, {
  fontSize: 24,
  color: '$primary',
  fontFamily: '$body',
  pressStyle: { opacity: 0.7 },
})

const HeaderTitle = styled(Text, {
  fontSize: 17,
  fontWeight: '600',
  color: '$color',
  fontFamily: '$heading',
})

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

const GuideSection = styled(YStack, {
  paddingHorizontal: '$lg',
  paddingVertical: '$sm',
  backgroundColor: '$cupBlueLight',
  borderBottomWidth: 0.5,
  borderBottomColor: '$gray5',
})

const GuideText = styled(Text, {
  fontSize: 15,
  color: '$primary',
  textAlign: 'center',
  fontWeight: '500',
})

const GuideSubText = styled(Text, {
  fontSize: 13,
  color: '$gray11',
  textAlign: 'center',
  marginTop: 4,
})

const ContentContainer = styled(YStack, {
  flex: 1,
  paddingHorizontal: '$lg',
  paddingBottom: '$xl',
})

const SelectedPreviewContainer = styled(Card, {
  backgroundColor: '$gray2',
  padding: '$md',
  marginVertical: '$md',
  borderRadius: '$3',
  minHeight: 100,
  maxHeight: 200,
  justifyContent: 'center',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 2,
})

const SelectedPreviewContent = styled(XStack, {
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: '$md',
})

const CategoryGroup = styled(XStack, {
  alignItems: 'center',
  paddingRight: '$lg',
  borderRightWidth: 1,
  borderRightColor: '$borderColor',
  marginBottom: '$sm',
  
  variants: {
    isLast: {
      true: {
        borderRightWidth: 0,
        paddingRight: 0,
      },
    },
  } as const,
})

const CategoryLabel = styled(Text, {
  fontSize: 12,
  fontWeight: '600',
  color: '$gray11',
  marginRight: '$sm',
})

const CategoryExpressions = styled(Text, {
  fontSize: 15,
  color: '$color',
  fontWeight: '500',
})

const PreviewPlaceholder = styled(Text, {
  fontSize: 15,
  color: '$gray10',
  textAlign: 'center',
  fontStyle: 'italic',
})

const BottomContainer = styled(XStack, {
  padding: '$lg',
  backgroundColor: '$background',
  borderTopWidth: 0.5,
  borderTopColor: '$borderColor',
})

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

const SensoryScreenTamagui = () => {
  const navigation = useNavigation();
  const { selectedSensoryExpressions, setSelectedSensoryExpressions, currentTasting } = useTastingStore();
  
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if onboarding should be shown (only for cafe mode)
  useEffect(() => {
    if (currentTasting.mode === 'home_cafe' || currentTasting.mode === 'lab') {
      setShowOnboarding(false);
      return;
    }
    
    checkShouldShowOnboarding().then(shouldShow => {
      setShowOnboarding(shouldShow);
    });
  }, [currentTasting.mode]);

  const handleComplete = useCallback(async () => {
    navigation.navigate('PersonalComment' as never);
  }, [navigation]);

  // Convert EnhancedSensoryEvaluation format to TastingStore format
  const handleExpressionChange = useCallback((expressions: Array<{
    categoryId: string;
    expression: {
      id: string;
      korean: string;
      english: string;
      emoji: string;
      intensity?: number;
    };
  }>) => {
    const converted: SelectedSensoryExpression[] = expressions.map(item => ({
      categoryId: item.categoryId,
      expressionId: item.expression.id,
      korean: item.expression.korean,
      english: item.expression.english,
      emoji: item.expression.emoji,
      intensity: 3, // Default intensity since we removed user selection
      selected: true,
    }));
    setSelectedSensoryExpressions(converted);
  }, [setSelectedSensoryExpressions]);

  // Group expressions by category for display
  const groupedExpressions = (selectedSensoryExpressions || []).reduce((acc, expr) => {
    const category = expr.categoryId;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(expr.korean);
    return acc;
  }, {} as Record<string, string[]>);

  const categoryNames: Record<string, string> = {
    acidity: '산미',
    sweetness: '단맛',
    bitterness: '쓴맛',
    body: '바디',
    aftertaste: '애프터',
    balance: '밸런스'
  };

  const categoryOrder = ['acidity', 'sweetness', 'bitterness', 'body', 'aftertaste', 'balance'];
  const filteredCategories = categoryOrder.filter(cat => groupedExpressions[cat]);

  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1}>
          {/* Navigation Bar */}
          <HeaderBar>
            <BackButton onPress={() => navigation.goBack()}>←</BackButton>
            <HeaderTitle>감각 평가</HeaderTitle>
            <SkipButton onPress={() => navigation.navigate('PersonalComment' as never)}>
              건너뛰기
            </SkipButton>
          </HeaderBar>
          
          {/* Progress Bar */}
          <ProgressBar>
            <ProgressFill width="67%" animation="lazy" />
          </ProgressBar>

          {/* Guide Message */}
          <GuideSection animation="quick">
            <GuideText>맛의 언어로 표현해보세요</GuideText>
            <GuideSubText>이 커피에서 느껴지는 감각을 선택해주세요</GuideSubText>
          </GuideSection>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            bounces={true}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <ContentContainer>
              {/* Selected Sensory Preview */}
              <SelectedPreviewContainer
                animation="lazy"
                enterStyle={{ opacity: 0, scale: 0.95 }}
              >
                {filteredCategories.length > 0 ? (
                  <SelectedPreviewContent>
                    {filteredCategories.map((category, index) => {
                      const categoryName = categoryNames[category];
                      const expressions = groupedExpressions[category].join(', ');
                      const isLast = index === filteredCategories.length - 1;
                      
                      return (
                        <CategoryGroup key={category} isLast={isLast}>
                          <CategoryLabel>{categoryName}</CategoryLabel>
                          <CategoryExpressions>{expressions}</CategoryExpressions>
                        </CategoryGroup>
                      );
                    })}
                  </SelectedPreviewContent>
                ) : (
                  <PreviewPlaceholder animation="lazy">—</PreviewPlaceholder>
                )}
              </SelectedPreviewContainer>
              
              {/* Sensory Evaluation Component */}
              <YStack animation="quick">
                <CompactSensoryEvaluation
                  selectedExpressions={(selectedSensoryExpressions || []).map(item => ({
                    categoryId: item.categoryId,
                    expression: {
                      id: item.expressionId,
                      korean: item.korean,
                      english: item.english,
                      emoji: item.emoji || '',
                      intensity: item.intensity || 2,
                      beginner: true,
                    } as any,
                  }))}
                  onExpressionChange={handleExpressionChange}
                  beginnerMode={true}
                />
              </YStack>
            </ContentContainer>
          </ScrollView>

          {/* Bottom Button */}
          <BottomContainer>
            <NextButton
              flex={1}
              onPress={handleComplete}
              animation="quick"
            >
              <NextButtonText>평가 완료</NextButtonText>
            </NextButton>
          </BottomContainer>
        </YStack>

        {/* Onboarding Modal */}
        <SensoryOnboarding
          visible={showOnboarding}
          onComplete={() => setShowOnboarding(false)}
        />
      </SafeAreaView>
    </Container>
  );
};

export default SensoryScreenTamagui;