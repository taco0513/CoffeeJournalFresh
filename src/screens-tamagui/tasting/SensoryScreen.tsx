import React, { useState, useCallback, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IOSLayout, IOSSpacing } from '../../styles/ios-hig-2024';
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  styled,
  ScrollView,
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

// HeaderBar, BackButton, HeaderTitle, SkipButton 제거됨 - 네비게이션 헤더 사용

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
  fontSize: 14,
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
  fontSize: 14,
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

const SensoryScreenTamagui = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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
      <YStack flex={1}>
          
          {/* Progress Bar */}
          <ProgressBar>
            <ProgressFill width="67%" />
          </ProgressBar>

          {/* Guide Message */}
          <GuideSection>
            <GuideText>맛의 언어로 표현해보세요</GuideText>
            <GuideSubText>이 커피에서 느껴지는 감각을 선택해주세요</GuideSubText>
          </GuideSection>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            bounces={true}
            contentContainerStyle={{ 
              flexGrow: 1,
              paddingBottom: 24 // Reasonable padding for bottom button
            }}
          >
            <ContentContainer>
              {/* Selected Sensory Preview */}
              <SelectedPreviewContainer>
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
                  <PreviewPlaceholder>—</PreviewPlaceholder>
                )}
              </SelectedPreviewContainer>
              
              {/* Sensory Evaluation Component */}
              <YStack>
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
                  },
                }))}
                  onExpressionChange={handleExpressionChange}
                  beginnerMode={true}
                />
              </YStack>
            </ContentContainer>
          </ScrollView>

          {/* Bottom Button */}
          <XStack
            padding="$lg"
            paddingBottom={Math.max(insets.bottom, IOSLayout.safeAreaBottom) + IOSSpacing.md}
            backgroundColor="$background"
            borderTopWidth={0.5}
            borderTopColor="$borderColor"
          >
            <NextButton
              flex={1}
              onPress={handleComplete}
            >
              <NextButtonText>평가 완료</NextButtonText>
            </NextButton>
          </XStack>
        </YStack>

      {/* Onboarding Modal */}
      <SensoryOnboarding
        visible={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </Container>
  );
};

export default SensoryScreenTamagui;