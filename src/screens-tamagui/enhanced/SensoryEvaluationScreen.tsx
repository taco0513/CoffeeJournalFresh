import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  Button,
  YStack,
  XStack,
  Card,
  Separator,
  H1,
  H2,
  H3,
  Paragraph,
  SizableText,
  styled,
  useTheme,
  AnimatePresence,
  GetProps,
} from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../../stores/tastingStore';
import { SensoryOnboarding } from '../../components/sensory';
import CompactSensoryEvaluation from '../../components/sensory/CompactSensoryEvaluation';
import { checkShouldShowOnboarding } from '../../components/sensory/SensoryOnboarding';
import { SelectedSensoryExpression } from '../../types/sensory';

// Styled Components
const Container = styled(View, {
  name: 'SensoryEvaluationContainer',
  flex: 1,
  backgroundColor: '$backgroundSoft',
});

const NavigationBar = styled(XStack, {
  name: 'SensoryEvaluationNavigation',
  height: 44,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  backgroundColor: '$background',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
});

const BackButton = styled(Button, {
  name: 'BackButton',
  backgroundColor: 'transparent',
  borderWidth: 0,
  paddingHorizontal: '$sm',
  pressStyle: {
    opacity: 0.7,
    scale: 0.95,
  },
});

const NavigationTitle = styled(H3, {
  name: 'NavigationTitle',
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
});

const SkipButton = styled(Button, {
  name: 'SkipButton',
  backgroundColor: 'transparent',
  borderWidth: 0,
  paddingHorizontal: '$sm',
  pressStyle: {
    opacity: 0.7,
    scale: 0.95,
  },
});

const SkipText = styled(Text, {
  name: 'SkipText',
  fontSize: '$4',
  color: '$cupBlue',
});

const ProgressContainer = styled(View, {
  name: 'ProgressContainer',
  height: 3,
  backgroundColor: '$gray4',
  overflow: 'hidden',
});

const ProgressFill = styled(View, {
  name: 'ProgressFill',
  height: '100%',
  width: '71%',
  backgroundColor: '$cupBlue',
  animation: 'lazy',
});

const GuideSection = styled(YStack, {
  name: 'GuideSection',
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
  backgroundColor: '$background',
});

const GuideTitle = styled(SizableText, {
  name: 'GuideTitle',
  size: '$5',
  fontWeight: '600',
  color: '$color',
  textAlign: 'center',
  marginBottom: '$sm',
});

const GuideSubtitle = styled(SizableText, {
  name: 'GuideSubtitle',
  size: '$4',
  color: '$gray11',
  textAlign: 'center',
});

const PreviewSection = styled(YStack, {
  name: 'PreviewSection',
  maxHeight: 180,
  paddingBottom: '$md',
});

const PreviewCard = styled(Card, {
  name: 'PreviewCard',
  backgroundColor: '$background',
  marginHorizontal: '$lg',
  marginTop: '$md',
  padding: '$lg',
  borderRadius: '$4',
  flex: 1,
  borderWidth: 1,
  borderColor: '$borderColor',
  minHeight: 120,
  maxHeight: 180,
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  pressStyle: {
    scale: 0.98,
  },
});

const PreviewScrollView = styled(ScrollView, {
  name: 'PreviewScrollView',
  flex: 1,
  showsVerticalScrollIndicator: true,
});

const CategorySection = styled(YStack, {
  name: 'CategorySection',
  marginBottom: '$md',
  paddingBottom: '$md',
  variants: {
    isLast: {
      false: {
        borderBottomWidth: 1,
        borderBottomColor: '$gray4',
      },
    },
  } as const,
});

const CategoryTitle = styled(SizableText, {
  name: 'CategoryTitle',
  size: '$5',
  fontWeight: '700',
  color: '$gray11',
  marginBottom: '$md',
});

const CategoryExpressions = styled(SizableText, {
  name: 'CategoryExpressions',
  size: '$5',
  color: '$color',
  lineHeight: '$6',
  fontWeight: '500',
});

const CompactCategoryRow = styled(XStack, {
  name: 'CompactCategoryRow',
  marginBottom: '$md',
  alignItems: 'flex-start',
});

const CompactCategoryLabel = styled(SizableText, {
  name: 'CompactCategoryLabel',
  size: '$4',
  fontWeight: '600',
  color: '$gray11',
  marginRight: '$md',
  minWidth: 50,
});

const CompactCategoryText = styled(SizableText, {
  name: 'CompactCategoryText',
  size: '$4',
  color: '$color',
  lineHeight: '$5',
  flex: 1,
});

const SelectionCount = styled(SizableText, {
  name: 'SelectionCount',
  size: '$3',
  color: '$cupBlue',
  fontWeight: '600',
  textAlign: 'right',
});

const EmptyStateContainer = styled(YStack, {
  name: 'EmptyStateContainer',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

const EmptyStateText = styled(SizableText, {
  name: 'EmptyStateText',
  size: '$5',
  color: '$gray10',
  fontStyle: 'italic',
  textAlign: 'center',
});

const SensorySection = styled(YStack, {
  name: 'SensorySection',
  flex: 1,
  minHeight: 350,
  backgroundColor: '$background',
  borderTopWidth: 1,
  borderTopColor: '$gray4',
  paddingTop: '$md',
  paddingHorizontal: '$md',
});

const BottomContainer = styled(YStack, {
  name: 'BottomContainer',
  padding: '$lg',
  backgroundColor: '$background',
  borderTopWidth: 0.5,
  borderTopColor: '$borderColor',
});

const NextButton = styled(Button, {
  name: 'NextButton',
  backgroundColor: '$cupBlue',
  color: 'white',
  borderRadius: '$3',
  paddingVertical: '$md',
  fontSize: '$4',
  fontWeight: '600',
  animation: 'bouncy',
  pressStyle: {
    backgroundColor: '$cupBlueDark',
    scale: 0.98,
  },
});

const OnboardingOverlay = styled(View, {
  name: 'OnboardingOverlay',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1000,
});

export type SensoryEvaluationScreenProps = GetProps<typeof Container>;

const SensoryEvaluationScreen: React.FC<SensoryEvaluationScreenProps> = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { selectedSensoryExpressions, setSelectedSensoryExpressions, currentTasting } = useTastingStore();
  
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if onboarding should be shown
  useEffect(() => {
    // 홈카페 모드일 때는 온보딩을 표시하지 않음
    if (currentTasting.mode === 'home_cafe' || currentTasting.mode === 'lab') {
      setShowOnboarding(false);
      return;
    }
    
    checkShouldShowOnboarding().then(shouldShow => {
      setShowOnboarding(shouldShow);
    });
  }, [currentTasting.mode]);

  const handleComplete = useCallback(async () => {
    // Navigate to personal comment screen
    navigation.navigate('PersonalComment' as never);
  }, [navigation]);

  // Convert CompactSensoryEvaluation format to TastingStore format
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
      intensity: 3, // Default intensity
      selected: true,
    }));
    
    setSelectedSensoryExpressions(converted);
  }, [setSelectedSensoryExpressions]);

  // Group expressions by category
  const groupedExpressions = selectedSensoryExpressions.reduce((acc, expr) => {
    const category = expr.categoryId;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(expr.korean);
    return acc;
  }, {} as Record<string, string[]>);

  // Category display names and order
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

  const renderPreviewContent = () => {
    if (selectedSensoryExpressions.length === 0) {
      return (
        <EmptyStateContainer>
          <EmptyStateText>
            선택한 표현이 여기에 나타납니다
          </EmptyStateText>
        </EmptyStateContainer>
      );
    }

    // Compact format for many selections
    if (selectedSensoryExpressions.length > 9) {
      return (
        <YStack paddingVertical="$md">
          {filteredCategories.map((cat) => (
            <CompactCategoryRow key={cat}>
              <CompactCategoryLabel>
                {categoryNames[cat]}:
              </CompactCategoryLabel>
              <CompactCategoryText>
                {groupedExpressions[cat].join(', ')}
              </CompactCategoryText>
            </CompactCategoryRow>
          ))}
          <SelectionCount>
            총 {selectedSensoryExpressions.length}개 선택
          </SelectionCount>
        </YStack>
      );
    }

    // Normal format for fewer selections
    return filteredCategories.map((category, index) => {
      const categoryName = categoryNames[category];
      const expressions = groupedExpressions[category].join(', ');
      const isLast = index === filteredCategories.length - 1;
      
      return (
        <CategorySection key={category} isLast={isLast}>
          <CategoryTitle>{categoryName}</CategoryTitle>
          <CategoryExpressions>{expressions}</CategoryExpressions>
        </CategorySection>
      );
    });
  };

  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Navigation Bar */}
        <NavigationBar style={{ paddingTop: insets.top + 8, height: 44 + insets.top + 8 }}>
          <BackButton unstyled onPress={() => navigation.goBack()}>
            <Text color="$cupBlue" fontSize="$6">←</Text>
          </BackButton>
          <NavigationTitle>감각 평가</NavigationTitle>
          <SkipButton unstyled onPress={() => navigation.navigate('PersonalComment' as never)}>
            <SkipText>건너뛰기</SkipText>
          </SkipButton>
        </NavigationBar>
        
        {/* Progress Bar */}
        <ProgressContainer>
          <ProgressFill 
            animation="lazy"
            animateOnly={['width']}
          />
        </ProgressContainer>

        {/* Guide Message */}
        <GuideSection>
          <GuideTitle>맛의 언어로 표현해보세요</GuideTitle>
          <GuideSubtitle>이 커피에서 느껴지는 감각을 선택해주세요</GuideSubtitle>
        </GuideSection>

        {/* Preview Section - Takes remaining space */}
        <PreviewSection>
          <PreviewCard
            animation="lazy"
            animateOnly={['opacity', 'transform']}
          >
            <PreviewScrollView contentContainerStyle={{ paddingVertical: '$md', flexGrow: 1 }}>
              <AnimatePresence>
                <View
                  animation="lazy"
                  enterStyle={{
                    opacity: 0,
                    y: 10,
                  }}
                  animateOnly={['opacity', 'transform']}
                >
                  {renderPreviewContent()}
                </View>
              </AnimatePresence>
            </PreviewScrollView>
          </PreviewCard>
        </PreviewSection>

        {/* Fixed Sensory Evaluation Section */}
        <SensorySection>
          <CompactSensoryEvaluation 
            selectedExpressions={(selectedSensoryExpressions || []).map(item => ({
              categoryId: item.categoryId,
              expression: {
                id: item.expressionId,
                korean: item.korean,
                english: item.english,
                emoji: item.emoji || '',
                intensity: (item.intensity || 2) as 1 | 2 | 3,
                beginner: true,
              },
            }))}
            onExpressionChange={handleExpressionChange}
            beginnerMode={true}
          />
        </SensorySection>

        {/* Bottom Button */}
        <BottomContainer>
          <NextButton 
            onPress={handleComplete}
            animation="bouncy"
            animateOnly={['backgroundColor', 'transform']}
          >
            다음 단계
          </NextButton>
        </BottomContainer>

        {/* Onboarding Overlay */}
        {showOnboarding && (
          <OnboardingOverlay>
            <AnimatePresence>
              <View
                animation="bouncy"
                enterStyle={{
                  opacity: 0,
                  scale: 0.9,
                }}
                exitStyle={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animateOnly={['opacity', 'transform']}
              >
                <SensoryOnboarding 
                  visible={showOnboarding}
                  onComplete={() => setShowOnboarding(false)}
                />
              </View>
            </AnimatePresence>
          </OnboardingOverlay>
        )}
      </SafeAreaView>
    </Container>
  );
};

export default SensoryEvaluationScreen;