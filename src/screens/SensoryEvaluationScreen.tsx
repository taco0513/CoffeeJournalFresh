import React, { useState, useCallback, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
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
  SizableText
} from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTastingStore } from '../stores/tastingStore';
import { SensoryOnboarding } from '../components/sensory';
import CompactSensoryEvaluation from '../components/sensory/CompactSensoryEvaluation';
import { checkShouldShowOnboarding } from '../components/sensory/SensoryOnboarding';
import { SelectedSensoryExpression } from '../types/sensory';

const SensoryEvaluationScreen = () => {
  const navigation = useNavigation();
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

  return (
    <View flex={1} backgroundColor="$backgroundSoft">
      {/* Navigation Bar */}
      <XStack 
        height={44}
        paddingHorizontal="$6" 
        alignItems="center" 
        justifyContent="space-between"
        backgroundColor="$background"
        borderBottomWidth={0.5}
        borderBottomColor="$borderColor"
      >
        <Button 
          size="$3" 
          variant="outlined" 
          backgroundColor="transparent" 
          borderWidth={0}
          onPress={() => navigation.goBack()}
        >
          <Text color="$blue10" fontSize="$6">←</Text>
        </Button>
        <H3 color="$color">감각 평가</H3>
        <Button 
          size="$3" 
          variant="outlined" 
          backgroundColor="transparent" 
          borderWidth={0}
          onPress={() => navigation.navigate('PersonalComment' as never)}
        >
          <Text color="$blue10" fontSize="$4">건너뛰기</Text>
        </Button>
      </XStack>
      
      {/* Progress Bar */}
      <View height={3} backgroundColor="$gray5" overflow="hidden">
        <View height="100%" width="71%" backgroundColor="$blue10" />
      </View>

      {/* Guide Message */}
      <YStack 
        paddingHorizontal="$6" 
        paddingVertical="$4" 
        backgroundColor="$background"
      >
        <SizableText size="$5" fontWeight="600" color="$color" textAlign="center" marginBottom="$2">
          맛의 언어로 표현해보세요
        </SizableText>
        <SizableText size="$4" color="$colorPress" textAlign="center">
          이 커피에서 느껴지는 감각을 선택해주세요
        </SizableText>
      </YStack>

      {/* Top Section: Preview Box - Takes remaining space */}
      <YStack flex={1} paddingBottom="$3">
        {/* Selected Sensory Preview - Expanded */}
        <Card 
          backgroundColor="$background" 
          marginHorizontal="$6" 
          marginTop="$3" 
          padding="$6" 
          borderRadius="$4" 
          flex={1}
          borderWidth={1} 
          borderColor="$borderColor" 
          elevate
          animation="bouncy"
          minHeight={160}
        >
          {selectedSensoryExpressions.length > 0 ? (
            <ScrollView 
              flex={1}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingVertical: '$3', flexGrow: 1 }}
            >
              {(() => {
                const groupedExpressions = selectedSensoryExpressions.reduce((acc, expr) => {
                  const category = expr.categoryId;
                  if (!acc[category]) {
                    acc[category] = [];
                  }
                  acc[category].push(expr.korean);
                  return acc;
                }, {} as Record<string, string[]>);
                
                // Format the display with category names
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
                
                // Show more compact format when many selections
                if (selectedSensoryExpressions.length > 9) {
                  return (
                    <YStack paddingVertical="$3">
                      {filteredCategories.map((cat) => (
                        <XStack key={cat} marginBottom="$3" alignItems="flex-start">
                          <SizableText 
                            size="$4" 
                            fontWeight="600" 
                            color="$colorPress" 
                            marginRight="$3" 
                            minWidth={50}
                          >
                            {categoryNames[cat]}:
                          </SizableText>
                          <SizableText 
                            size="$4" 
                            color="$color" 
                            lineHeight="$5" 
                            flex={1}
                          >
                            {groupedExpressions[cat].join(', ')}
                          </SizableText>
                        </XStack>
                      ))}
                      <SizableText 
                        size="$3" 
                        color="$blue10" 
                        fontWeight="600" 
                        textAlign="right"
                      >
                        총 {selectedSensoryExpressions.length}개 선택
                      </SizableText>
                    </YStack>
                  );
                }
                
                // Normal format for fewer selections
                return filteredCategories.map((category, index) => {
                  const categoryName = categoryNames[category];
                  const expressions = groupedExpressions[category].join(', ');
                  const isLast = index === filteredCategories.length - 1;
                  
                  return (
                    <YStack 
                      key={category} 
                      marginBottom={isLast ? 0 : "$4"}
                      paddingBottom={isLast ? 0 : "$4"}
                      borderBottomWidth={isLast ? 0 : 1}
                      borderBottomColor="$gray6"
                    >
                      <SizableText size="$5" fontWeight="700" color="$colorPress" marginBottom="$3">
                        {categoryName}
                      </SizableText>
                      <SizableText size="$5" color="$color" lineHeight="$6" fontWeight="500">
                        {expressions}
                      </SizableText>
                    </YStack>
                  );
                });
              })()}
            </ScrollView>
          ) : (
            <YStack flex={1} justifyContent="center" alignItems="center">
              <SizableText size="$5" color="$gray10" fontStyle="italic" textAlign="center">
                선택한 표현이 여기에 나타납니다
              </SizableText>
            </YStack>
          )}
        </Card>

        {/* Show onboarding if needed */}
        {showOnboarding && (
          <SensoryOnboarding 
            visible={showOnboarding}
            onComplete={() => setShowOnboarding(false)}
          />
        )}
      </YStack>

      {/* Bottom Section: Fixed Sensory Evaluation */}
      <YStack 
        height={280} 
        backgroundColor="$background" 
        borderTopWidth={1} 
        borderTopColor="$gray5" 
        paddingTop="$3"
      >
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
      </YStack>

      {/* Bottom Button */}
      <YStack 
        padding="$6" 
        backgroundColor="$background" 
        borderTopWidth={0.5} 
        borderTopColor="$borderColor"
      >
        <Button 
          size="$5" 
          theme="blue" 
          onPress={handleComplete}
          animation="bouncy"
        >
          다음 단계
        </Button>
      </YStack>
    </View>
  );
};

// Styles migrated to Tamagui - no StyleSheet needed

export default SensoryEvaluationScreen;