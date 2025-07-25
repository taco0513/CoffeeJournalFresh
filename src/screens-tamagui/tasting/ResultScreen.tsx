import React, { useState, useEffect } from 'react';
import {
  YStack,
  XStack,
  Text,
  ScrollView,
  Button,
  Card,
  Progress,
  H1,
  H2,
  H3,
  Paragraph,
  AnimatePresence,
  styled,
  useTheme,
  Spinner,
} from 'tamagui';
import { useTastingStore } from '../../stores/tastingStore';
import { useToastStore } from '../../stores/toastStore';
import { flavorWheelKorean } from '../../data/flavorWheelKorean';
import { NavigationButton } from '../../components/common';
import RealmService from '../../services/realm/RealmService';
import tastingService from '../../services/supabase/tastingService';
import { ErrorHandler, NetworkUtils } from '../../utils/errorHandler';
import { useAchievementNotification } from '../../contexts/AchievementContext';
import { performanceMonitor } from '../../services/PerformanceMonitor';
import { useUserStore } from '../../stores/useUserStore';
import { EnhancedSensoryVisualization } from '../../components/results/EnhancedSensoryVisualization';
import { FlavorNotesVisualization } from '../../components/results/FlavorNotesVisualization';
import { ProgressRing } from '../../components/charts/ProgressRing';

const ENABLE_SYNC = true;

// Styled components
const Container = styled(YStack, {
  name: 'Container',
  flex: 1,
  backgroundColor: '$backgroundHover',
});

const NavigationBar = styled(XStack, {
  name: 'NavigationBar',
  height: 44,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  backgroundColor: '$background',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
});

const HeaderSection = styled(YStack, {
  name: 'HeaderSection',
  alignItems: 'center',
  padding: '$xl',
  backgroundColor: '$background',
  marginBottom: '$sm',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    y: -20,
  },
});

const Section = styled(Card, {
  name: 'Section',
  backgroundColor: '$background',
  padding: '$lg',
  marginVertical: '$xs',
  marginHorizontal: '$lg',
  borderRadius: '$4',
  elevate: true,
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    scale: 0.95,
  },
});

const SectionHeader = styled(XStack, {
  name: 'SectionHeader',
  alignItems: 'center',
  marginBottom: 8,
});

const BottomContainer = styled(YStack, {
  name: 'BottomContainer',
  padding: '$lg',
  backgroundColor: '$background',
  borderTopWidth: 0.5,
  borderTopColor: '$borderColor',
  elevate: true,
});

const ActionButton = styled(Button, {
  name: 'ActionButton',
  flex: 1,
  minHeight: 44,
  borderRadius: '$3',
  animation: 'quick',
  pressStyle: {
    scale: 0.98,
  },
});

const ComparisonItem = styled(YStack, {
  name: 'ComparisonItem',
  flex: 1,
  alignItems: 'center',
  padding: 15,
  backgroundColor: '$backgroundHover',
  borderRadius: '$2',
  marginHorizontal: 5,
});

const FlavorTag = styled(XStack, {
  name: 'FlavorTag',
  backgroundColor: '$backgroundHover',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 16,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '$borderColor',
});

const getEncouragementMessage = (score: number): string => {
  if (score < 50) {
    return "사람마다 느끼는 맛이 달라요. 당신의 표현도 정답이에요!";
  } else if (score < 75) {
    return "좋은 시도예요! 점점 더 섬세하게 느끼고 계시네요!";
  } else if (score < 90) {
    return "훌륭해요! 🎉 감각이 정말 좋으세요!";
  } else {
    return "로스터와 비슷하게 느끼셨네요! 감각이 정말 좋으세요!";
  }
};

export default function ResultScreen({ navigation }: any) {
  const theme = useTheme();
  const { currentTasting, matchScoreTotal, reset, saveTasting, checkAchievements, selectedSensoryExpressions } = useTastingStore();
  const { showSuccessToast, showErrorToast } = useToastStore();
  const { showMultipleAchievements } = useAchievementNotification();
  const { currentUser } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);
  const [comparison, setComparison] = useState<any>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [chartMode, setChartMode] = useState<'radar' | 'bar'>('radar');

  // Auto-save effect
  useEffect(() => {
    const autoSave = async () => {
      if (!isSaved && currentTasting) {
        const saveTimingId = performanceMonitor.startTiming('tasting_save');
        try {
          await saveTasting();
          
          try {
            const tastingData = {
              ...currentTasting,
              id: `tasting_${Date.now()}`,
              matchScore: matchScoreTotal || 0,
            };
            
            if (ENABLE_SYNC) {
              await tastingService.saveTasting(tastingData);
            }
          } catch (supabaseError: any) {
            if (NetworkUtils.isNetworkError(supabaseError)) {
              showErrorToast('오프라인 모드', '네트워크 연결이 없어 로컬에만 저장되었습니다.');
            }
          }
          
          if (currentUser?.id) {
            try {
              const newAchievements = await checkAchievements(currentUser.id);
              if (newAchievements.length > 0) {
                showMultipleAchievements(newAchievements as any);
              }
            } catch (error) {
              console.warn('Failed to check achievements:', error);
            }
          }
          
          showSuccessToast('저장 완료', '테이스팅이 자동으로 저장되었습니다');
          setIsSaved(true);
          
          await performanceMonitor.endTiming(saveTimingId, 'tasting_save_success', {
            mode: currentTasting.mode,
            hasAchievements: currentUser?.id ? true : false,
            syncEnabled: ENABLE_SYNC
          });
        } catch (error: any) {
          await performanceMonitor.endTiming(saveTimingId, 'tasting_save_error', {
            mode: currentTasting.mode,
            error: error.message
          });
          ErrorHandler.handle(error, '테이스팅 자동 저장');
        }
      }
    };
    
    autoSave();
  }, [isSaved, currentTasting, saveTasting, matchScoreTotal, checkAchievements, currentUser, showSuccessToast, showErrorToast, showMultipleAchievements]);

  // Load comparison data
  useEffect(() => {
    const loadComparisonData = async () => {
      if (!currentTasting?.coffeeName || !currentTasting?.roastery) {
        return;
      }

      setIsLoadingComparison(true);
      const comparisonTimingId = performanceMonitor.startTiming('comparison_load');
      
      try {
        if (ENABLE_SYNC) {
          try {
            const supabaseComparison = await tastingService.getCoffeeComparison(
              currentTasting.coffeeName,
              currentTasting.roastery
            );
            
            if (supabaseComparison) {
              setComparison(supabaseComparison);
            } else {
              const realmService = RealmService.getInstance();
              const comparisonData = realmService.getSameCoffeeComparison(
                currentTasting.coffeeName,
                currentTasting.roastery
              );
              setComparison(comparisonData);
            }
          } catch (error) {
            try {
              const realmService = RealmService.getInstance();
              const comparisonData = realmService.getSameCoffeeComparison(
                currentTasting.coffeeName,
                currentTasting.roastery
              );
              setComparison(comparisonData);
            } catch (realmError) {
            }
          }
        } else {
          const realmService = RealmService.getInstance();
          const comparisonData = realmService.getSameCoffeeComparison(
            currentTasting.coffeeName,
            currentTasting.roastery
          );
          setComparison(comparisonData);
        }
      } catch (error) {
        setComparison(null);
        await performanceMonitor.endTiming(comparisonTimingId, 'comparison_load_error', {
          coffee: currentTasting.coffeeName,
          roastery: currentTasting.roastery,
          error: (error as Error).message
        });
      } finally {
        setIsLoadingComparison(false);
        await performanceMonitor.endTiming(comparisonTimingId, 'comparison_load_complete', {
          coffee: currentTasting.coffeeName,
          roastery: currentTasting.roastery,
          syncEnabled: ENABLE_SYNC
        });
      }
    };

    loadComparisonData();
  }, [currentTasting?.coffeeName, currentTasting?.roastery, currentTasting?.origin]);

  const handleNewTasting = () => {
    reset();
    navigation.reset({
      index: 0,
      routes: [{
        name: 'TastingFlow',
        state: {
          routes: [{ name: 'CoffeeInfo' }],
          index: 0,
        },
      }],
    });
  };

  const handleGoHome = () => {
    reset();
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  if (!currentTasting) {
    return (
      <Container alignItems="center" justifyContent="center">
        <Spinner size="large" color="$cupBlue" />
        <H3 marginTop="$lg" color="$color">데이터 로드 중...</H3>
      </Container>
    );
  }

  const getKoreanName = (englishName: string): string => {
    return (flavorWheelKorean.translations as any)[englishName] || englishName;
  };

  const selectedFlavorNotes = currentTasting.selectedFlavors || [];
  const flavorList = selectedFlavorNotes.map((path: any) => {
    const parts = [];
    if (path.level1) parts.push(getKoreanName(path.level1));
    if (path.level2) parts.push(getKoreanName(path.level2));
    if (path.level3) parts.push(path.level3);
    if (path.level4) parts.push(path.level4);
    return parts.join(' > ');
  });

  return (
    <Container>
      {/* Navigation Bar */}
      <NavigationBar>
        <Button unstyled onPress={handleGoHome} pressStyle={{ opacity: 0.7 }}>
          <Text fontSize="$6" color="$cupBlue">←</Text>
        </Button>
        <Text fontSize="$4" fontWeight="600" color="$color">결과</Text>
        <YStack width={24} />
      </NavigationBar>
      
      {/* Progress Bar - Full */}
      <Progress value={100} backgroundColor="$gray4" height={3}>
        <Progress.Indicator backgroundColor="$cupBlue" animation="lazy" />
      </Progress>

      <ScrollView flex={1} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <AnimatePresence>
          <HeaderSection>
            <H1 fontSize="$8" fontWeight="700" color="$color" marginBottom="$md">
              테이스팅 완료!
            </H1>
            
            {/* Enhanced Match Score with Progress Ring */}
            <YStack alignItems="center" marginBottom="$md">
              <ProgressRing
                progress={matchScoreTotal || 0}
                size={120}
                strokeWidth={10}
                color={theme.cupBlue?.val || '#007AFF'}
                showPercentage={true}
                duration={1500}
              />
              <Text fontSize="$2" color="$gray11" marginTop="$sm" textAlign="center">
                로스터 노트와의 일치도
              </Text>
            </YStack>
            
            <Paragraph 
              fontSize="$4" 
              color="$gray11" 
              textAlign="center"
              paddingHorizontal="$lg"
              lineHeight={24}
            >
              {getEncouragementMessage(matchScoreTotal || 0)}
            </Paragraph>
          </HeaderSection>

          {/* Coffee Info Section */}
          <Section>
            <SectionHeader>
              <H3 fontSize="$5" fontWeight="600" color="$color">커피 정보</H3>
            </SectionHeader>
            {currentTasting.mode === 'cafe' ? (
              <Text fontSize="$3" color="$color" marginBottom="$sm">
                카페: {currentTasting.cafeName || '-'}
              </Text>
            ) : (
              <Text fontSize="$3" color="$color" marginBottom="$sm">
                추출 방식: 🏠 홈카페
              </Text>
            )}
            <Text fontSize="$3" color="$color" marginBottom="$sm">
              로스터리: {currentTasting.roastery || '-'}
            </Text>
            <Text fontSize="$3" color="$color">
              커피: {currentTasting.coffeeName || '-'}
            </Text>
          </Section>

          {/* HomeCafe Info Section */}
          {currentTasting.mode === 'home_cafe' && currentTasting.homeCafeData && (
            <Section>
              <SectionHeader>
                <H3 fontSize="$5" fontWeight="600" color="$color">🏠 홈카페 정보</H3>
              </SectionHeader>
              <Text fontSize="$3" color="$color" marginBottom="$sm">
                추출 도구: {currentTasting.homeCafeData.equipment.dripper === 'V60' ? 'V60' :
                           currentTasting.homeCafeData.equipment.dripper === 'Chemex' ? '케멕스' :
                           currentTasting.homeCafeData.equipment.dripper === 'KalitaWave' ? '칼리타 웨이브' :
                           currentTasting.homeCafeData.equipment.dripper === 'Origami' ? '오리가미' :
                           currentTasting.homeCafeData.equipment.dripper === 'FellowStagg' ? '펠로우 스태그' :
                           currentTasting.homeCafeData.equipment.dripper}
              </Text>
              {currentTasting.homeCafeData.equipment.grinder?.brand && (
                <Text fontSize="$3" color="$color" marginBottom="$sm">
                  그라인더: {currentTasting.homeCafeData.equipment.grinder.brand}
                  {currentTasting.homeCafeData.equipment.grinder.setting && 
                    ` (${currentTasting.homeCafeData.equipment.grinder.setting})`}
                </Text>
              )}
              <Text fontSize="$3" color="$color" marginBottom="$sm">
                레시피: {currentTasting.homeCafeData.recipe.doseIn}g : {currentTasting.homeCafeData.recipe.waterAmount}g 
                ({currentTasting.homeCafeData.recipe.ratio || '1:16'})
              </Text>
              {currentTasting.homeCafeData.recipe.waterTemp > 0 && (
                <Text fontSize="$3" color="$color" marginBottom="$sm">
                  물온도: {currentTasting.homeCafeData.recipe.waterTemp}°C
                </Text>
              )}
              {currentTasting.homeCafeData.recipe.totalBrewTime > 0 && (
                <Text fontSize="$3" color="$color" marginBottom="$sm">
                  추출시간: {Math.floor(currentTasting.homeCafeData.recipe.totalBrewTime / 60)}분 {currentTasting.homeCafeData.recipe.totalBrewTime % 60}초
                </Text>
              )}
              {currentTasting.homeCafeData.notes?.tasteResult && (
                <Text fontSize="$3" color="$color">
                  실험 결과: {currentTasting.homeCafeData.notes.tasteResult}
                </Text>
              )}
            </Section>
          )}

          {/* Roaster Notes */}
          <Section>
            <SectionHeader>
              <H3 fontSize="$5" fontWeight="600" color="$color">로스터 노트</H3>
            </SectionHeader>
            <Text fontSize="$3" color="$color">
              {currentTasting.roasterNotes || '로스터 노트가 없습니다'}
            </Text>
          </Section>

          {/* Personal Notes */}
          {currentTasting.personalComment && (
            <Section>
              <SectionHeader>
                <H3 fontSize="$5" fontWeight="600" color="$color">내 노트</H3>
              </SectionHeader>
              <Text fontSize="$3" color="$color">
                {currentTasting.personalComment}
              </Text>
            </Section>
          )}

          {/* Enhanced Flavor Visualization */}
          {(selectedFlavorNotes.length > 0 || (selectedSensoryExpressions && selectedSensoryExpressions.length > 0)) && (
            <Section>
              <FlavorNotesVisualization
                flavorPaths={selectedFlavorNotes}
                selectedExpressions={selectedSensoryExpressions || []}
                title="향미 프로필"
                showHierarchy={true}
              />
            </Section>
          )}

          {/* Enhanced Sensory Evaluation Visualization */}
          <Section>
            {/* Chart Mode Toggle */}
            <SectionHeader>
              <H3 fontSize="$5" fontWeight="600" color="$color">감각 평가</H3>
              <XStack gap="$xs">
                <Button
                  size="$2"
                  variant={chartMode === 'radar' ? 'outlined' : 'ghost'}
                  backgroundColor={chartMode === 'radar' ? '$cupBlue' : 'transparent'}
                  borderColor={chartMode === 'radar' ? '$cupBlue' : '$gray8'}
                  onPress={() => setChartMode('radar')}
                  paddingHorizontal="$sm"
                >
                  <Text 
                    fontSize="$2" 
                    color={chartMode === 'radar' ? 'white' : '$gray11'}
                    fontWeight="500"
                  >
                    레이더
                  </Text>
                </Button>
                <Button
                  size="$2"
                  variant={chartMode === 'bar' ? 'outlined' : 'ghost'}
                  backgroundColor={chartMode === 'bar' ? '$cupBlue' : 'transparent'}
                  borderColor={chartMode === 'bar' ? '$cupBlue' : '$gray8'}
                  onPress={() => setChartMode('bar')}
                  paddingHorizontal="$sm"
                >
                  <Text 
                    fontSize="$2" 
                    color={chartMode === 'bar' ? 'white' : '$gray11'}
                    fontWeight="500"
                  >
                    막대
                  </Text>
                </Button>
              </XStack>
            </SectionHeader>
            
            <EnhancedSensoryVisualization
              data={{
                body: currentTasting.body || 3,
                acidity: currentTasting.acidity || 3,
                sweetness: currentTasting.sweetness || 3,
                finish: currentTasting.finish || 3,
                bitterness: currentTasting.bitterness || 3,
                balance: currentTasting.balance || 3,
                mouthfeel: currentTasting.mouthfeel || 'Clean',
              }}
              comparison={comparison?.sensoryAverages ? {
                body: comparison.sensoryAverages.body,
                acidity: comparison.sensoryAverages.acidity,
                sweetness: comparison.sensoryAverages.sweetness,
                finish: comparison.sensoryAverages.finish,
                bitterness: comparison.sensoryAverages.bitterness || 3,
                balance: comparison.sensoryAverages.balance || 3,
                mouthfeel: 'Average',
              } : undefined}
              mode={chartMode}
              title=""
              showComparison={comparison?.sensoryAverages ? true : false}
            />
          </Section>

          {/* Community Insights Section */}
          <Section>
            <SectionHeader>
              <H3 fontSize="$5" fontWeight="600" color="$color">커뮤니티 인사이트</H3>
            </SectionHeader>
            
            {isLoadingComparison ? (
              <YStack alignItems="center" paddingVertical="$lg">
                <Spinner size="small" color="$gray10" />
                <Paragraph fontSize="$3" color="$gray10" marginTop="$sm">
                  데이터 로딩 중...
                </Paragraph>
              </YStack>
            ) : comparison && comparison.totalTastings > 1 ? (
              <YStack>
                <XStack justifyContent="space-between" marginBottom="$lg">
                  <ComparisonItem>
                    <Text fontSize="$2" color="$gray11" marginBottom="$sm">커뮤니티 평균</Text>
                    <Text fontSize="$5" fontWeight="bold" color="$color">
                      {comparison.averageScore}%
                    </Text>
                  </ComparisonItem>
                  <ComparisonItem>
                    <Text fontSize="$2" color="$gray11" marginBottom="$sm">총 {comparison.totalTastings}명</Text>
                    <Text fontSize="$3" color="$gray11">참여</Text>
                  </ComparisonItem>
                </XStack>

                {comparison.popularFlavors && comparison.popularFlavors.length > 0 && (
                  <YStack>
                    <Text fontSize="$3" fontWeight="600" marginBottom="$sm" color="$color">
                      인기 맛 노트
                    </Text>
                    <XStack flexWrap="wrap" gap="$sm">
                      {comparison.popularFlavors.slice(0, 6).map((flavor: any, index: number) => (
                        <FlavorTag key={index}>
                          <Text fontSize="$2" color="$color" marginRight={6}>
                            {flavor.value}
                          </Text>
                          <Text fontSize="$2" color="$gray11" fontWeight="500">
                            {flavor.percentage}%
                          </Text>
                        </FlavorTag>
                      ))}
                    </XStack>
                  </YStack>
                )}
              </YStack>
            ) : (
              <YStack 
                padding="$lg" 
                alignItems="center" 
                backgroundColor="$backgroundHover" 
                borderRadius="$2"
                marginTop="$sm"
              >
                <Text fontSize="$3" color="$gray11" textAlign="center">
                  {comparison && comparison.totalTastings === 1 
                    ? '🎉 이 커피의 첫 번째 테이스터입니다!'
                    : comparison === null
                    ? '🔍 아직 다른 사람의 기록이 없습니다'
                    : '📊 비교 데이터를 불러올 수 없습니다'}
                </Text>
                {(comparison === null || (comparison && comparison.totalTastings === 0)) && (
                  <Text fontSize="$2" color="$gray10" textAlign="center" marginTop="$sm" lineHeight={18}>
                    다른 사람들이 이 커피를 테이스팅하면{'\n'}비교 데이터가 표시됩니다
                  </Text>
                )}
              </YStack>
            )}
          </Section>
        </AnimatePresence>
      </ScrollView>

      {/* Bottom Buttons */}
      <BottomContainer>
        <XStack gap="$sm" width="100%">
          <ActionButton
            backgroundColor="$cupBlue"
            onPress={handleNewTasting}
            flex={1}
          >
            <Text color="white" fontSize="$3" fontWeight="600">
              New Tasting
            </Text>
          </ActionButton>
          <ActionButton
            backgroundColor="$background"
            borderWidth={1}
            borderColor="$cupBlue"
            onPress={handleGoHome}
            flex={1}
          >
            <Text color="$cupBlue" fontSize="$3" fontWeight="600">
              Home
            </Text>
          </ActionButton>
        </XStack>
      </BottomContainer>
    </Container>
  );
}