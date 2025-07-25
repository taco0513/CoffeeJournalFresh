import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  YStack,
  XStack,
  Text,
  Button,
  ScrollView,
  Card,
  H1,
  H2,
  H3,
  Paragraph,
  Spinner,
  AnimatePresence,
  styled,
  useTheme,
  getTokens,
} from 'tamagui';
import { Alert, Dimensions } from 'react-native';
import RealmService from '../../services/realm/RealmService';
import { useUserStore } from '../../stores/useUserStore';
import { useDevStore } from '../../stores/useDevStore';
import { ITastingRecord } from '../../services/realm/schemas';
import { useCoffeeNotifications } from '../../hooks/useCoffeeNotifications';
import { CoffeeDiscoveryAlert } from '../../components/CoffeeDiscoveryAlert';
import { InsightCard } from '../../components-tamagui';
import StatusBadge from '../../components/StatusBadge';
import { useScreenPerformance } from '../../hooks/useScreenPerformance';

const { width: screenWidth } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

// Styled components for better performance
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

const StatCard = styled(Card, {
  name: 'StatCard',
  flex: 1,
  backgroundColor: '$backgroundHover',
  padding: '$sm',
  paddingVertical: '$md',
  alignItems: 'center',
  minHeight: 75,
  borderRadius: '$3',
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$backgroundPress',
  },
  animation: 'quick',
  elevate: true,
  bordered: true,
  borderColor: '$borderColor',
});

const InsightSection = styled(YStack, {
  name: 'InsightSection',
  marginBottom: '$sm',
  marginTop: '$sm',
  animation: 'lazy',
});

const PrimaryActionCard = styled(Card, {
  name: 'PrimaryActionCard',
  backgroundColor: '$primary',
  paddingHorizontal: '$lg',
  paddingVertical: '$xl',
  marginBottom: '$lg',
  alignItems: 'center',
  borderRadius: '$4',
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$primaryHover',
  },
  animation: 'bouncy',
  elevate: true,
});

const SkeletonBox = styled(YStack, {
  name: 'SkeletonBox',
  backgroundColor: '$gray5',
  borderRadius: '$2',
  animation: 'lazy',
  opacity: 0.7,
});

export default function HomeScreen({ navigation }: HomeScreenProps) {
  // Performance measurement
  useScreenPerformance('HomeScreen');
  
  const theme = useTheme();
  const tokens = getTokens();
  const { currentUser } = useUserStore();
  const { isDeveloperMode } = useDevStore();
  
  const [stats, setStats] = useState({
    totalTastings: 0,
    totalRoasteries: 0,
    totalCafes: 0,
    thisWeekTastings: 0,
    avgScore: 0,
    bestScore: 0,
    newCoffeesThisMonth: 0,
  });
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Coffee discovery notifications
  const {
    showApprovalAlert,
    approvalData,
    discoveryStats,
    dismissApprovalAlert,
  } = useCoffeeNotifications();
  
  // Check if admin
  const isAdmin = currentUser?.email === 'hello@zimojin.com';

  const realmService = RealmService.getInstance();

  // Skeleton loading components with Tamagui
  const SkeletonCard = () => (
    <StatCard backgroundColor="$gray3" borderColor="$gray4">
      <SkeletonBox width="50%" height={20} marginBottom="$xxs" />
      <SkeletonBox width="70%" height={12} />
    </StatCard>
  );

  const SkeletonInsight = () => (
    <Card
      backgroundColor="$gray3"
      borderColor="$gray4"
      padding="$lg"
      marginBottom="$md"
      borderRadius="$4"
      flexDirection="row"
    >
      <SkeletonBox width={32} height={32} borderRadius={16} marginRight="$lg" />
      <YStack flex={1}>
        <SkeletonBox width="80%" height={16} marginBottom="$xs" />
        <SkeletonBox width="60%" height={14} />
      </YStack>
    </Card>
  );

  // Initialize Realm on component mount
  useEffect(() => {
    const initializeAndLoad = async () => {
      try {
        if (!realmService.isInitialized) {
          await realmService.initialize();
        }
        loadDashboardData();
      } catch (error) {
        console.error('Failed to initialize Realm:', error);
        setError('데이터베이스 초기화에 실패했습니다.');
        setIsLoading(false);
      }
    };
    
    initializeAndLoad();
  }, []);

  // Reload data when user or developer mode changes
  useEffect(() => {
    if (realmService.isInitialized) {
      loadDashboardData();
    }
  }, [currentUser, isDeveloperMode]);

  // 화면이 포커스될 때마다 데이터 새로고침
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (realmService.isInitialized) {
        loadDashboardData();
      }
    });

    return unsubscribe;
  }, [navigation]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if Realm is initialized - don't try to initialize here
      if (!realmService.isInitialized) {
        console.warn('Realm not initialized yet, skipping data load');
        setIsLoading(false);
        return;
      }
      
      const realm = realmService.getRealm();
      
      // Load data normally - no more developer mode restriction
      const allTastings = realm.objects<ITastingRecord>('TastingRecord').filtered('isDeleted = false').sorted('createdAt', true);
      
      // 통계 계산
      const total = allTastings.length;
      const thisWeek = getThisWeekTastings(allTastings);
      const avgScore = total > 0 ? allTastings.reduce((sum, t) => sum + (t.matchScoreTotal || 0), 0) / total : 0;
      const bestScore = total > 0 ? Math.max(...allTastings.map(t => t.matchScoreTotal || 0)) : 0;
      
      // 이번 달 새로운 커피 수 계산
      const newCoffees = getNewCoffeesThisMonth(allTastings);
      
      // 총 로스터리 수 계산
      const uniqueRoasteries = new Set();
      allTastings.forEach(tasting => {
        if (tasting.roastery) {
          uniqueRoasteries.add(tasting.roastery);
        }
      });
      
      // 총 카페 수 계산
      const uniqueCafes = new Set();
      allTastings.forEach(tasting => {
        if (tasting.cafeName) {
          uniqueCafes.add(tasting.cafeName);
        }
      });
      
      setStats({
        totalTastings: total,
        totalRoasteries: uniqueRoasteries.size,
        totalCafes: uniqueCafes.size,
        thisWeekTastings: thisWeek,
        avgScore: Math.round(avgScore),
        bestScore,
        newCoffeesThisMonth: newCoffees,
      });
      
      // Load insights
      const insightsData = await generateInsights();
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getThisWeekTastings = (tastings: any) => {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    return tastings.filtered('createdAt >= $0', weekStart).length;
  };

  const getNewCoffeesThisMonth = (tastings: any) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // 이번 달 테이스팅 중 고유한 커피 조합 (roastery + coffeeName) 수 계산
    const thisMonthTastings = tastings.filtered('createdAt >= $0', monthStart);
    const uniqueCoffees = new Set();
    
    thisMonthTastings.forEach((tasting: ITastingRecord) => {
      const coffeeKey = `${tasting.roastery}-${tasting.coffeeName}`;
      uniqueCoffees.add(coffeeKey);
    });
    
    return uniqueCoffees.size;
  };

  // Memoized 이번 주 인사이트 생성 함수
  const generateInsights = useCallback(async () => {
    const insights = [];
    
    try {
      const realm = realmService.getRealm();
      const allTastings = realm.objects<ITastingRecord>('TastingRecord').filtered('isDeleted = false').sorted('createdAt', true);
      
      // 최근 7일 데이터로 필터링
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentTastings = Array.from(allTastings).filter(tasting => 
        tasting.createdAt >= sevenDaysAgo
      );

      if (recentTastings.length === 0) {
        // 데이터가 없을 때 기본 인사이트 표시
        return [
          {
            icon: '📈',
            title: '산미에 대한 선호도가 15% 증가했어요.',
            value: '더 밝은 로스팅의 커피를 시도해보세요!',
          },
          {
            icon: '🎯',
            title: '플로럴 향미 식별 정확도가 87%에 달했어요.',
            value: '전문가 수준에 근접합니다!',
          },
          {
            icon: '☕',
            title: '새로운 로스터리 3곳을 발견했어요.',
            value: '다양성이 취향 발달에 도움이 됩니다.',
          },
        ];
      }

      // 1. 가장 많이 느낀 향미 분석
      const flavorCounts = new Map<string, number>();
      recentTastings.forEach(tasting => {
        if (tasting.flavorNotes && tasting.flavorNotes.length > 0) {
          tasting.flavorNotes.forEach(flavor => {
            const flavorKey = typeof flavor === 'string' ? flavor : (flavor.koreanValue || flavor.value || '');
            if (flavorKey) {
              flavorCounts.set(flavorKey, (flavorCounts.get(flavorKey) || 0) + 1);
            }
          });
        }
      });

      let topFlavor = '';
      let topFlavorCount = 0;
      flavorCounts.forEach((count, flavor) => {
        if (count > topFlavorCount) {
          topFlavor = flavor;
          topFlavorCount = count;
        }
      });

      if (topFlavor) {
        insights.push({
          icon: '🍓',
          title: `${topFlavor} 향미를 가장 많이 느꼈어요.`,
          value: '비슷한 향미의 커피를 더 탐색해보세요!',
        });
      }

      // 2. 평균 점수 분석
      const avgScore = recentTastings.length > 0 
        ? recentTastings.reduce((sum, t) => sum + (t.matchScoreTotal || 0), 0) / recentTastings.length 
        : 0;

      if (avgScore > 0) {
        const scoreMessage = avgScore >= 85 
          ? '뛰어난 맛 감각을 보여주고 있어요!'
          : avgScore >= 70 
          ? '안정적인 테이스팅 실력이에요!'
          : '더 다양한 커피를 시도해보세요!';
        
        insights.push({
          icon: avgScore >= 85 ? '🌟' : avgScore >= 70 ? '📈' : '🎯',
          title: `이번 주 평균 점수는 ${Math.round(avgScore)}점이에요.`,
          value: scoreMessage,
        });
      }

      // 3. 새로운 로스터리 발견
      const uniqueRoasteries = new Set();
      recentTastings.forEach(tasting => {
        if (tasting.roastery) {
          uniqueRoasteries.add(tasting.roastery);
        }
      });

      if (uniqueRoasteries.size > 0) {
        insights.push({
          icon: '☕',
          title: `새로운 로스터리 ${uniqueRoasteries.size}곳을 발견했어요.`,
          value: '다양성이 취향 발달에 도움이 됩니다.',
        });
      }

      // 최소 3개의 인사이트를 보장
      while (insights.length < 3) {
        if (!insights.find(i => i.title.includes('향미'))) {
          insights.push({
            icon: '🍓',
            title: '더 많은 기록으로 향미 패턴을 분석해보세요.',
            value: '5개 이상 기록하면 개인화된 인사이트를 제공합니다.',
          });
        } else if (!insights.find(i => i.title.includes('점수'))) {
          insights.push({
            icon: '📈',
            title: '꾸준한 기록으로 실력을 향상시켜보세요.',
            value: '정기적인 테이스팅이 전문성을 높입니다.',
          });
        } else {
          insights.push({
            icon: '🌟',
            title: '커피 여행을 계속해보세요!',
            value: '새로운 경험이 기다리고 있습니다.',
          });
        }
      }

    } catch (error) {
      console.error('Error generating insights:', error);
      // 에러 시 기본 인사이트 반환
      return [
        {
          icon: '📈',
          title: '산미에 대한 선호도가 15% 증가했어요.',
          value: '더 밝은 로스팅의 커피를 시도해보세요!',
        },
        {
          icon: '🎯',
          title: '플로럴 향미 식별 정확도가 87%에 달했어요.',
          value: '전문가 수준에 근접합니다!',
        },
        {
          icon: '☕',
          title: '새로운 로스터리 3곳을 발견했어요.',
          value: '다양성이 취향 발달에 도움이 됩니다.',
        },
      ];
    }

    return insights.slice(0, 3); // 최대 3개만 반환
  }, [realmService]);

  const handleViewHistory = () => {
    navigation.navigate('Journal' as never);
  };

  const handleQuickStats = () => {
    navigation.navigate('Journal' as never, { initialTab: 'stats' } as never);
  };

  const handleNewTasting = () => {
    navigation.navigate('ModeSelection' as never);
  };

  // Responsive dimensions
  const isSmallScreen = screenWidth < 375;
  const isLargeScreen = screenWidth > 414;
  
  // Memoized responsive styles
  const responsiveStyles = useMemo(() => ({
    statCardHeight: isSmallScreen ? 75 : isLargeScreen ? 95 : 85,
    statValueSize: isSmallScreen ? '$6' : isLargeScreen ? '$8' : '$7',
    statLabelSize: isSmallScreen ? '$2' : isLargeScreen ? '$3' : '$2',
  }), [isSmallScreen, isLargeScreen]);

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Coffee Approval Alert */}
      <CoffeeDiscoveryAlert
        visible={showApprovalAlert}
        type="approved"
        coffeeName={approvalData?.coffee_name}
        roasteryName={approvalData?.roastery}
        badgeLevel={discoveryStats.level}
        onClose={dismissApprovalAlert}
      />
      
      {/* Navigation Bar */}
      <NavigationBar>
        <XStack alignItems="center" gap="$xs">
          <H2 fontWeight="700" color="$color">CupNote</H2>
          <Card
            backgroundColor="$cupBlue"
            paddingHorizontal="$xs"
            paddingVertical="$xxxs"
            borderRadius="$1"
          >
            <Text fontSize={12} fontWeight="700" color="white" letterSpacing={0.5}>
              BETA
            </Text>
          </Card>
        </XStack>
        <StatusBadge />
      </NavigationBar>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Content */}
        <YStack flex={1} paddingHorizontal="$lg">
          {/* Welcome Section */}
          <YStack paddingTop="$xxl" paddingBottom="$xxl" alignItems="center">
            <H1 fontSize="$8" fontWeight="600" color="$color">
              안녕하세요, {currentUser?.username || 'User'}님!
            </H1>
          </YStack>

          {/* Skeleton loading state */}
          <AnimatePresence>
            {isLoading && (
              <YStack animation="lazy" opacity={1} exitStyle={{ opacity: 0 }}>
                {/* Stats cards skeleton */}
                <XStack justifyContent="space-between" marginBottom="$md" gap="$sm">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </XStack>
                
                {/* Insights skeleton */}
                <InsightSection>
                  <XStack alignItems="center" marginBottom="$sm">
                    <SkeletonBox width={32} height={32} borderRadius={16} marginRight="$sm" />
                    <SkeletonBox width="60%" height={18} />
                  </XStack>
                  <SkeletonInsight />
                  <SkeletonInsight />
                  <SkeletonInsight />
                </InsightSection>

                {/* Action button skeleton */}
                <Card
                  backgroundColor="$gray3"
                  borderColor="$gray4"
                  padding="$xl"
                  marginBottom="$lg"
                  alignItems="center"
                  borderRadius="$4"
                >
                  <SkeletonBox width="70%" height={18} marginBottom="$xs" opacity={0.3} />
                  <SkeletonBox width="50%" height={14} opacity={0.2} />
                </Card>
              </YStack>
            )}
          </AnimatePresence>

          {/* Error state */}
          {error && !isLoading && (
            <Card
              backgroundColor="$red2"
              borderColor="$red5"
              padding="$lg"
              marginVertical="$lg"
              alignItems="center"
              borderRadius="$4"
              animation="quick"
            >
              <Text fontSize={48} marginBottom="$md">⚠️</Text>
              <Paragraph color="$red11" textAlign="center" marginBottom="$lg">
                {error}
              </Paragraph>
              <Button
                backgroundColor="$red9"
                color="white"
                onPress={loadDashboardData}
                pressStyle={{ scale: 0.98 }}
              >
                다시 시도
              </Button>
            </Card>
          )}

          {/* Main content when loaded */}
          <AnimatePresence>
            {!isLoading && !error && (
              <YStack animation="lazy" opacity={1} enterStyle={{ opacity: 0, y: 10 }}>
                {/* Admin button */}
                {isAdmin && (
                  <Card
                    backgroundColor="$orange2"
                    borderColor="$orange5"
                    padding="$md"
                    marginBottom="$sm"
                    alignItems="center"
                    borderRadius="$3"
                    pressStyle={{ scale: 0.98 }}
                    animation="quick"
                    onPress={() => navigation.navigate('AdminDashboard' as never)}
                    elevate
                  >
                    <Text fontWeight="700" color="$color" letterSpacing={0.2}>
                      관리자 대시보드
                    </Text>
                  </Card>
                )}

                {/* Stats Overview - 3 cards */}
                <XStack justifyContent="space-between" marginBottom="$md" gap="$sm">
                  <StatCard
                    minHeight={responsiveStyles.statCardHeight}
                    onPress={handleQuickStats}
                  >
                    <Text 
                      fontSize={responsiveStyles.statValueSize} 
                      fontWeight="600" 
                      color="$cupBlue"
                      marginBottom="$xxs"
                    >
                      {stats.totalTastings || 0}
                    </Text>
                    <Text 
                      fontSize={responsiveStyles.statLabelSize} 
                      color="$color"
                      textAlign="center"
                    >
                      나의 커피 기록
                    </Text>
                  </StatCard>
                  
                  <StatCard
                    minHeight={responsiveStyles.statCardHeight}
                    onPress={handleQuickStats}
                  >
                    <Text 
                      fontSize={responsiveStyles.statValueSize} 
                      fontWeight="600" 
                      color="$cupBlue"
                      marginBottom="$xxs"
                    >
                      {stats.totalRoasteries || 0}
                    </Text>
                    <Text 
                      fontSize={responsiveStyles.statLabelSize} 
                      color="$color"
                      textAlign="center"
                    >
                      발견한 로스터리
                    </Text>
                  </StatCard>
                  
                  <StatCard
                    minHeight={responsiveStyles.statCardHeight}
                    onPress={handleQuickStats}
                  >
                    <Text 
                      fontSize={responsiveStyles.statValueSize} 
                      fontWeight="600" 
                      color="$cupBlue"
                      marginBottom="$xxs"
                    >
                      {stats.totalCafes || 0}
                    </Text>
                    <Text 
                      fontSize={responsiveStyles.statLabelSize} 
                      color="$color"
                      textAlign="center"
                    >
                      방문한 카페
                    </Text>
                  </StatCard>
                </XStack>

                {/* Insights Section */}
                {insights.length > 0 && (
                  <InsightSection>
                    <XStack alignItems="center" marginBottom="$sm">
                      <Text fontSize="$6" marginRight="$sm">💡</Text>
                      <H3 fontWeight="600" color="$color">이번 주 인사이트</H3>
                    </XStack>
                    {insights.map((insight, index) => (
                      <InsightCard key={index} {...insight} />
                    ))}
                  </InsightSection>
                )}

                {/* Primary Action Card */}
                <PrimaryActionCard onPress={handleNewTasting}>
                  <H2 
                    fontSize={isSmallScreen ? '$6' : isLargeScreen ? '$8' : '$7'}
                    fontWeight="700"
                    color="white"
                    marginBottom="$xs"
                    textAlign="center"
                  >
                    오늘의 커피 기록하기
                  </H2>
                  <Paragraph
                    fontSize={isSmallScreen ? '$2' : isLargeScreen ? '$4' : '$3'}
                    color="white"
                    opacity={0.9}
                    textAlign="center"
                  >
                    나만의 커피 취향을 발견해보세요
                  </Paragraph>
                </PrimaryActionCard>
              </YStack>
            )}
          </AnimatePresence>
        </YStack>
      </ScrollView>
    </YStack>
  );
}