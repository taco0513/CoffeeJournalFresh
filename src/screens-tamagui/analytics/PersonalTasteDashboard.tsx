import React, { useState, useRef} from 'react';
import { SafeAreaView, RefreshControl, Dimensions } from 'react-native';
import { ScrollView } from 'tamagui';
import {
  View,
  Text,
  Button,
  YStack,
  XStack,
  Card,
  Separator,
  Spinner,
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
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { 
  usePersonalTaste, 
  useAchievements, 
  useFlavorMastery
} from '../../hooks/usePersonalTaste';
import { TasteProfileCard } from '../../components/personalTaste/TasteProfileCard';
import { FlavorRadarChart } from '../../components/personalTaste/FlavorRadarChart';
import { GrowthTimeline } from '../../components/personalTaste/GrowthTimeline';
import { FlavorMasteryMap } from '../../components/personalTaste/FlavorMasteryMap';
import { PersonalStatsGrid } from '../../components/personalTaste/PersonalStatsGrid';
import { Logger } from '../../services/LoggingService';
import { PersonalTasteViewMode} from '../../types/personalTaste';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Styled Components
const Container = styled(View, {
  name: 'PersonalTasteDashboardContainer',
  flex: 1,
  backgroundColor: '$background',
});

const NavigationBar = styled(XStack, {
  name: 'PersonalTasteNavigation',
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

const NavigationTitle = styled(H1, {
  name: 'NavigationTitle',
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
});

const TabContainer = styled(XStack, {
  name: 'TabContainer',
  backgroundColor: '$background',
  paddingHorizontal: '$lg',
  paddingVertical: '$sm',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
});

const Tab = styled(Button, {
  name: 'Tab',
  flex: 1,
  backgroundColor: 'transparent',
  borderWidth: 0,
  paddingVertical: '$md',
  borderRadius: '$3',
  variants: {
    active: {
      true: {
        backgroundColor: '$cupBlue',
    },
      false: {
        backgroundColor: '$gray2',
    },
  },
} as const,
  pressStyle: {
    scale: 0.98,
},
  animation: 'quick',
});

const TabText = styled(Text, {
  name: 'TabText',
  fontSize: '$4',
  fontWeight: '500',
  textAlign: 'center',
  variants: {
    active: {
      true: {
        color: 'white',
        fontWeight: '600',
    },
      false: {
        color: '$color',
    },
  },
} as const,
});

const LoadingContainer = styled(YStack, {
  name: 'LoadingContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$lg',
});

const LoadingText = styled(Text, {
  name: 'LoadingText',
  fontSize: '$4',
  color: '$gray11',
});

const EmptyStateContainer = styled(YStack, {
  name: 'EmptyStateContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: '$xl',
  gap: '$lg',
});

const EmptyStateIcon = styled(Text, {
  name: 'EmptyStateIcon',
  fontSize: 64,
});

const EmptyStateTitle = styled(H2, {
  name: 'EmptyStateTitle',
  fontSize: '$6',
  fontWeight: '700',
  color: '$color',
  textAlign: 'center',
});

const EmptyStateText = styled(Paragraph, {
  name: 'EmptyStateText',
  fontSize: '$4',
  color: '$gray11',
  textAlign: 'center',
  lineHeight: '$6',
});

const EmptyStateButton = styled(Button, {
  name: 'EmptyStateButton',
  backgroundColor: '$cupBlue',
  color: 'white',
  borderRadius: '$4',
  paddingHorizontal: '$xl',
  paddingVertical: '$md',
  fontSize: '$4',
  fontWeight: '600',
  pressStyle: {
    backgroundColor: '$cupBlueDark',
    scale: 0.95,
},
});

const Content = styled(YStack, {
  name: 'Content',
  flex: 1,
  gap: '$lg',
  paddingHorizontal: '$lg',
  paddingVertical: '$lg',
});

const SectionCard = styled(Card, {
  name: 'SectionCard',
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderWidth: 0.5,
  borderRadius: '$4',
  padding: '$lg',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    y: 30,
    scale: 0.95,
},
  pressStyle: {
    scale: 0.98,
},
});

const SectionTitle = styled(H2, {
  name: 'SectionTitle',
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
  marginBottom: '$md',
});

const InsightsSection = styled(SectionCard, {
  name: 'InsightsSection',
});

const InsightsList = styled(YStack, {
  name: 'InsightsList',
  gap: '$sm',
});

const InsightItem = styled(XStack, {
  name: 'InsightItem',
  alignItems: 'center',
  gap: '$md',
  paddingVertical: '$sm',
});

const InsightIcon = styled(Text, {
  name: 'InsightIcon',
  fontSize: 20,
});

const InsightText = styled(Text, {
  name: 'InsightText',
  fontSize: '$4',
  color: '$color',
  flex: 1,
  lineHeight: '$5',
});

const QuickActions = styled(SectionCard, {
  name: 'QuickActions',
});

const ActionGrid = styled(XStack, {
  name: 'ActionGrid',
  flexWrap: 'wrap',
  gap: '$md',
});

const ActionButton = styled(Button, {
  name: 'ActionButton',
  flex: 1,
  minWidth: '45%',
  backgroundColor: '$gray4',
  borderColor: '$borderColor',
  borderWidth: 0.5,
  borderRadius: '$3',
  paddingVertical: '$lg',
  animation: 'bouncy',
  pressStyle: {
    scale: 0.95,
    backgroundColor: '$gray5',
},
});

const ActionButtonContent = styled(YStack, {
  name: 'ActionButtonContent',
  alignItems: 'center',
  gap: '$sm',
});

const ActionButtonIcon = styled(Text, {
  name: 'ActionButtonIcon',
  fontSize: 24,
});

const ActionButtonText = styled(Text, {
  name: 'ActionButtonText',
  fontSize: '$3',
  fontWeight: '500',
  color: '$color',
  textAlign: 'center',
});

const ChartContainer = styled(SectionCard, {
  name: 'ChartContainer',
  minHeight: 300,
});

const StatsContainer = styled(SectionCard, {
  name: 'StatsContainer',
});

const ProgressIndicator = styled(XStack, {
  name: 'ProgressIndicator',
  alignItems: 'center',
  gap: '$md',
  marginVertical: '$md',
});

const ProgressBar = styled(View, {
  name: 'ProgressBar',
  flex: 1,
  height: 8,
  backgroundColor: '$gray4',
  borderRadius: 4,
});

const ProgressFill = styled(View, {
  name: 'ProgressFill',
  height: '100%',
  backgroundColor: '$cupBlue',
  borderRadius: 4,
  animation: 'lazy',
});

const ProgressText = styled(Text, {
  name: 'ProgressText',
  fontSize: '$3',
  fontWeight: '600',
  color: '$cupBlue',
  minWidth: 40,
  textAlign: 'right',
});

export type PersonalTasteDashboardProps = GetProps<typeof Container>;

const PersonalTasteDashboard: React.FC<PersonalTasteDashboardProps> = () => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [viewMode, setViewMode] = useState<PersonalTasteViewMode>(
    PersonalTasteViewMode.DASHBOARD
  );
  const [refreshing, setRefreshing] = useState(false);

  // Hooks for data
  const { 
    tastePattern, 
    growthMetrics, 
    recommendations,
    insights,
    loading: tasteLoading,
    refresh: refreshTaste 
} = usePersonalTaste();
  
  const { 
    achievements, 
    stats: achievementStats,
    loading: achievementsLoading 
} = useAchievements();
  
  const { 
    flavorMastery,
    loading: masteryLoading 
} = useFlavorMastery();

  const loading = tasteLoading || achievementsLoading || masteryLoading;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshTaste();
    setRefreshing(false);
};

  const handleViewModeChange = (mode: PersonalTasteViewMode) => {
    setViewMode(mode);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
};

  const handleFlavorCategorySelect = (category: string) => {
    navigation.navigate('FlavorCategoryDetail', { category });
};

  const handleViewAchievements = () => {
    navigation.navigate('AchievementGallery');
};

  const handleViewRecommendations = () => {
    // Navigate to search screen with recommended filters
    navigation.navigate('Search', { 
      filterByTaste: true,
      message: '당신의 취향에 맞는 커피를 찾아보세요' 
  });
};

  const renderViewModeTab = (mode: PersonalTasteViewMode, label: string) => (
    <Tab
      key={mode}
      active={viewMode === mode}
      onPress={() => handleViewModeChange(mode)}
      unstyled
    >
      <TabText active={viewMode === mode}>{label}</TabText>
    </Tab>
  );

  const renderProgressIndicator = (label: string, value: number, max: number = 100) => (
    <YStack gap="$sm">
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$3" color="$gray11">{label}</Text>
        <Text fontSize="$3" fontWeight="600" color="$color">{value}/{max}</Text>
      </XStack>
      <ProgressIndicator>
        <ProgressBar>
          <ProgressFill width={`${(value / max) * 100}%`} />
        </ProgressBar>
        <ProgressText>{Math.round((value / max) * 100)}%</ProgressText>
      </ProgressIndicator>
    </YStack>
  );

  if (loading && !refreshing) {
    return (
      <Container>
        <SafeAreaView style={{ flex: 1 }}>
          <NavigationBar>
            <BackButton unstyled onPress={() => navigation.goBack()}>
              <Text color="$cupBlue" fontSize="$6">←</Text>
            </BackButton>
            <NavigationTitle>나의 커피 여정</NavigationTitle>
            <View width={30} />
          </NavigationBar>
          
          <LoadingContainer>
            <Spinner size="large" color="$cupBlue" />
            <LoadingText>분석 중...</LoadingText>
          </LoadingContainer>
        </SafeAreaView>
      </Container>
    );
}

  if (!tastePattern) {
    return (
      <Container>
        <SafeAreaView style={{ flex: 1 }}>
          <NavigationBar>
            <BackButton unstyled onPress={() => navigation.goBack()}>
              <Text color="$cupBlue" fontSize="$6">←</Text>
            </BackButton>
            <NavigationTitle>나의 커피 여정</NavigationTitle>
            <View width={30} />
          </NavigationBar>
          
          <EmptyStateContainer>
            <EmptyStateIcon></EmptyStateIcon>
            <EmptyStateTitle>아직 데이터가 없어요</EmptyStateTitle>
            <EmptyStateText>
              몇 번의 테이스팅 후에 개인 취향 분석을 볼 수 있어요
            </EmptyStateText>
            <EmptyStateButton onPress={() => navigation.navigate('Home')}>
              첫 테이스팅 시작하기
            </EmptyStateButton>
          </EmptyStateContainer>
        </SafeAreaView>
      </Container>
    );
}

  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Navigation Bar */}
        <NavigationBar>
          <BackButton unstyled onPress={() => navigation.goBack()}>
            <Text color="$cupBlue" fontSize="$6">←</Text>
          </BackButton>
          <NavigationTitle>나의 커피 여정</NavigationTitle>
          <View width={30} />
        </NavigationBar>

        {/* View Mode Tabs */}
        <TabContainer>
          {renderViewModeTab(PersonalTasteViewMode.DASHBOARD, '대시보드')}
          {renderViewModeTab(PersonalTasteViewMode.PROFILE, '취향 프로필')}
          {renderViewModeTab(PersonalTasteViewMode.PROGRESS, '성장 기록')}
        </TabContainer>

        <ScrollView
          ref={scrollViewRef}
          flex={1}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        >
          <Content>
            <AnimatePresence key={viewMode}>
              {viewMode === PersonalTasteViewMode.DASHBOARD && (
                <>
                  {/* Taste Profile Card */}
                  <SectionCard
                    animation="lazy"
                    animateOnly={['opacity', 'transform']}
                  >
                    <SectionTitle>취향 프로필</SectionTitle>
                    <TasteProfileCard
                      level={growthMetrics?.vocabularyGrowth || 1}
                      progress={{
                        currentValue: growthMetrics?.weeklyProgress || 0,
                        targetValue: 100,
                        percentage: (growthMetrics?.weeklyProgress || 0) / 100,
                        lastUpdated: new Date(),
                    }}
                      tasteType={tastePattern.tasteProfile}
                      onLevelTap={() => handleViewModeChange(PersonalTasteViewMode.PROGRESS)}
                    />
                  </SectionCard>

                  {/* Quick Insights */}
                  {insights && (
                    <InsightsSection
                      animation="lazy"
                      animateOnly={['opacity', 'transform']}
                    >
                      <SectionTitle>데이터 인사이트</SectionTitle>
                      <InsightsList>
                        {insights.strengths.map((strength: string, index: number) => (
                          <InsightItem key={`strength-${index}`}>
                            <InsightIcon>💪</InsightIcon>
                            <InsightText>{strength}</InsightText>
                          </InsightItem>
                        ))}
                        {insights.areasToExplore.slice(0, 2).map((area: string, index: number) => (
                          <InsightItem key={`area-${index}`}>
                            <InsightIcon></InsightIcon>
                            <InsightText>{area}</InsightText>
                          </InsightItem>
                        ))}
                      </InsightsList>
                    </InsightsSection>
                  )}

                  {/* Quick Actions */}
                  <QuickActions
                    animation="lazy"
                    animateOnly={['opacity', 'transform']}
                  >
                    <SectionTitle>빠른 액션</SectionTitle>
                    <ActionGrid>
                      <ActionButton
                        onPress={handleViewAchievements}
                        unstyled
                      >
                        <ActionButtonContent>
                          <ActionButtonIcon>🏆</ActionButtonIcon>
                          <ActionButtonText>업적 보기</ActionButtonText>
                        </ActionButtonContent>
                      </ActionButton>
                      
                      <ActionButton
                        onPress={() => handleViewModeChange(PersonalTasteViewMode.PROFILE)}
                        unstyled
                      >
                        <ActionButtonContent>
                          <ActionButtonIcon></ActionButtonIcon>
                          <ActionButtonText>취향 분석</ActionButtonText>
                        </ActionButtonContent>
                      </ActionButton>
                      
                      <ActionButton
                        onPress={handleViewRecommendations}
                        unstyled
                      >
                        <ActionButtonContent>
                          <ActionButtonIcon></ActionButtonIcon>
                          <ActionButtonText>추천 커피</ActionButtonText>
                        </ActionButtonContent>
                      </ActionButton>
                      
                      <ActionButton
                        onPress={() => navigation.navigate('Home')}
                        unstyled
                      >
                        <ActionButtonContent>
                          <ActionButtonIcon>➕</ActionButtonIcon>
                          <ActionButtonText>새 테이스팅</ActionButtonText>
                        </ActionButtonContent>
                      </ActionButton>
                    </ActionGrid>
                  </QuickActions>

                  {/* Stats Overview */}
                  <StatsContainer
                    animation="lazy"
                    animateOnly={['opacity', 'transform']}
                  >
                    <SectionTitle>통계 요약</SectionTitle>
                    <PersonalStatsGrid stats={achievementStats} />
                  </StatsContainer>
                </>
              )}

              {viewMode === PersonalTasteViewMode.PROFILE && (
                <>
                  {/* Flavor Radar Chart */}
                  <ChartContainer
                    animation="lazy"
                    animateOnly={['opacity', 'transform']}
                  >
                    <SectionTitle>향미 레이더</SectionTitle>
                    <FlavorRadarChart preferences={{
                      fruity: 0,
                      floral: 0,
                      sweet: 0,
                      nutty: 0,
                      chocolate: 0,
                      spices: 0
                  }} />
                  </ChartContainer>

                  {/* Flavor Mastery Map */}
                  <ChartContainer
                    animation="lazy"
                    animateOnly={['opacity', 'transform']}
                  >
                    <SectionTitle>향미 숙련도</SectionTitle>
                    <FlavorMasteryMap 
                      categories={[]}
                      masteryLevels={[]}
                      onCategorySelect={handleFlavorCategorySelect}
                    />
                  </ChartContainer>

                  {/* Taste Pattern Analysis */}
                  <SectionCard
                    animation="lazy"
                    animateOnly={['opacity', 'transform']}
                  >
                    <SectionTitle>취향 패턴 분석</SectionTitle>
                    <YStack gap="$md">
                      <Text fontSize="$4" color="$color">
                        당신의 커피 취향: <Text fontWeight="600">{tastePattern.tasteProfile}</Text>
                      </Text>
                      
                      {renderProgressIndicator(
                        '산미 선호도',
                        tastePattern?.preferredIntensity || 0
                      )}
                      
                      {renderProgressIndicator(
                        '단맛 선호도',
                        tastePattern?.preferredIntensity || 0
                      )}
                      
                      {renderProgressIndicator(
                        '바디감 선호도',
                        tastePattern?.preferredIntensity || 0
                      )}
                      
                      {renderProgressIndicator(
                        '여운 선호도',
                        tastePattern?.preferredIntensity || 0
                      )}
                    </YStack>
                  </SectionCard>
                </>
              )}

              {viewMode === PersonalTasteViewMode.PROGRESS && (
                <>
                  {/* Growth Timeline */}
                  <ChartContainer
                    animation="lazy"
                    animateOnly={['opacity', 'transform']}
                  >
                    <SectionTitle>성장 타임라인</SectionTitle>
                    <GrowthTimeline milestones={[]} currentWeek={1} />
                  </ChartContainer>

                  {/* Achievement Progress */}
                  <SectionCard
                    animation="lazy"
                    animateOnly={['opacity', 'transform']}
                  >
                    <SectionTitle>업적 진행도</SectionTitle>
                    <YStack gap="$md">
                      {renderProgressIndicator(
                        '총 업적',
                        achievementStats?.unlockedAchievements || 0,
                        achievementStats?.totalAchievements || 100
                      )}
                      
                      {renderProgressIndicator(
                        '포인트',
                        achievementStats?.totalPoints || 0,
                        1000
                      )}
                      
                      {renderProgressIndicator(
                        '어휘력 성장',
                        growthMetrics?.vocabularyGrowth || 0,
                        50
                      )}
                      
                      {renderProgressIndicator(
                        '일관성',
                        growthMetrics?.consistencyScore || 0
                      )}
                    </YStack>
                  </SectionCard>

                  {/* Weekly Progress */}
                  <SectionCard
                    animation="lazy"
                    animateOnly={['opacity', 'transform']}
                  >
                    <SectionTitle>주간 진행도</SectionTitle>
                    <YStack gap="$md">
                      <Text fontSize="$4" color="$gray11">
                        이번 주 목표: 새로운 커피 5잔 시도하기
                      </Text>
                      
                      {renderProgressIndicator(
                        '이번 주 테이스팅',
                        growthMetrics?.weeklyProgress || 0,
                        5
                      )}
                      
                      <XStack justifyContent="space-between" marginTop="$sm">
                        <Text fontSize="$3" color="$gray11">목표까지</Text>
                        <Text fontSize="$3" fontWeight="600" color="$cupBlue">
                          {Math.max(0, 5 - (growthMetrics?.weeklyProgress || 0))}잔 남음
                        </Text>
                      </XStack>
                    </YStack>
                  </SectionCard>
                </>
              )}
            </AnimatePresence>

            <View height="$xxxl" />
          </Content>
        </ScrollView>
      </SafeAreaView>
    </Container>
  );
};

export default PersonalTasteDashboard;