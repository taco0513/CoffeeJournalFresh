import { NavigationProp } from '@react-navigation/native';
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
  H4,
  Paragraph,
  Spinner,
  Separator,
  styled,
  useTheme,
  getTokens,
} from 'tamagui';
import { Alert, Dimensions, DeviceEventEmitter } from 'react-native';
import RealmService from '../../services/realm/RealmService';
import { useUserStore } from '../../stores/useUserStore';
import { useDevStore } from '../../stores/useDevStore';
import { ITastingRecord } from '../../services/realm/schemas';
import { useCoffeeNotifications } from '../../hooks/useCoffeeNotifications';
import { CoffeeDiscoveryAlert } from '../../components/CoffeeDiscoveryAlert';
import { InsightCard } from '../../components-tamagui';
import { InsightSeparator } from '../../components-tamagui/shared/InsightStyles';
import { Logger } from '../../services/LoggingService';
import useScreenPerformance from '../../hooks/useScreenPerformance';
import { DummyDataService } from '../../services/DummyDataService';
import { useTastingStore } from '../../stores/tastingStore';
import { DummyDataInput } from '../../components/dev/DummyDataInput';

const { width: screenWidth } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: NavigationProp<any>;
  hideNavBar?: boolean;
}

// Styled components for better performance
const NavigationBar = styled(XStack, {
  name: 'NavigationBar',
  height: '$navBarHeight',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  backgroundColor: '$background',
  borderBottomWidth: '$borderWidthThin',
  borderBottomColor: '$borderColor',
});

const StatCard = styled(YStack, {
  name: 'StatCard',
  flex: 1,
  backgroundColor: 'transparent',
  padding: '$sm',
  paddingVertical: '$md',
  alignItems: 'center',
  minHeight: '$statCardSmall',
  
  // WCAG 2.4.7 Focus Visible - Enhanced accessibility
  focusStyle: {
    borderWidth: 3,
    borderColor: '$focusRing',
    shadowColor: '$focusRing',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    outlineColor: '$focusRing',
    outlineWidth: 2,
    outlineOffset: 2,
},
});

const InsightSection = styled(YStack, {
  name: 'InsightSection',
  marginBottom: '$sm',
  marginTop: '$xl',
});



const SkeletonBox = styled(YStack, {
  name: 'SkeletonBox',
  backgroundColor: '$gray5',
  borderRadius: '$2',
  opacity: 0.7,
});

export default function HomeScreen({ navigation, hideNavBar = true }: HomeScreenProps) {
  
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
  
  // Prevent modal from showing immediately on load
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    // Delay to prevent immediate modal show
    const timer = setTimeout(() => setIsReady(true), 1000);
    return () => clearTimeout(timer);
}, []);
  
  // Debug modal state
  Logger.debug('HomeScreen: Modal state', { 
    showApprovalAlert, 
    isReady, 
    willShowModal: isReady && showApprovalAlert 
});
  
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
    <XStack
      backgroundColor="transparent"
      padding="$lg"
      marginBottom="$md"
      flexDirection="row"
    >
      <SkeletonBox width={32} height={32} borderRadius={16} marginRight="$lg" />
      <YStack flex={1}>
        <SkeletonBox width="80%" height={16} marginBottom="$xs" />
        <SkeletonBox width="60%" height={14} />
      </YStack>
    </XStack>
  );

  // Initialize Realm on component mount
  useEffect(() => {
    Logger.debug('HomeScreen: useEffect for initialization', 'screen', { component: 'HomeScreen' });
    const initializeAndLoad = async () => {
      try {
        Logger.debug('HomeScreen: Checking Realm initialization status', 'screen', { component: 'HomeScreen' });
        if (!realmService.isInitialized) {
          Logger.debug('HomeScreen: Initializing Realm...', 'screen', { component: 'HomeScreen' });
          // Add timeout to prevent hanging
          const initPromise = realmService.initialize();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Realm initialization timeout')), 5000)
          );
          
          await Promise.race([initPromise, timeoutPromise]);
          Logger.debug('HomeScreen: Realm initialized successfully', 'screen', { component: 'HomeScreen' });
      }
        loadDashboardData();
    } catch (error) {
        Logger.error('Failed to initialize Realm:', 'screen', { component: 'HomeScreen', error: error });
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

  // Listen for refresh data events (e.g., when mock data is created/deleted)
  useEffect(() => {
    const refreshListener = DeviceEventEmitter.addListener('refreshData', () => {
      Logger.debug('Received refreshData event', 'screen', { component: 'HomeScreen' });
      if (realmService.isInitialized) {
        loadDashboardData();
      }
    });
    
    return () => refreshListener.remove();
  }, []);

  // 화면이 포커스될 때마다 데이터 새로고침
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (realmService.isInitialized) {
        loadDashboardData();
    }
  });

    return () => {
      unsubscribe();
  };
}, [navigation]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if Realm is initialized - don't try to initialize here
      if (!realmService.isInitialized) {
        Logger.warn('Realm not initialized yet, skipping data load', 'screen', { component: 'HomeScreen' });
        setIsLoading(false);
        return;
    }
      
      const realm = realmService.getRealm();
      
      // Load data normally - no more developer mode restriction
      const allTastings = realm.objects<ITastingRecord>('TastingRecord').filtered('isDeleted = false').sorted('createdAt', true);
      
      // 개발자 모드 + 데이터 없음 + 첫 실행 시 자동으로 더미데이터 생성
      if (isDeveloperMode && allTastings.length === 0) {
        await createInitialDummyData();
        // 데이터 생성 후 다시 로드
        const updatedTastings = realm.objects<ITastingRecord>('TastingRecord').filtered('isDeleted = false').sorted('createdAt', true);
        await calculateStatsAndInsights(updatedTastings);
        return;
      }
      
      await calculateStatsAndInsights(allTastings);
  } catch (error) {
      Logger.error('Error loading dashboard data:', 'screen', { component: 'HomeScreen', error: error });
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
  } finally {
      setIsLoading(false);
  }
};

  const getThisWeekTastings = (tastings: unknown) => {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    return tastings.filtered('createdAt >= $0', weekStart).length;
};

  const getNewCoffeesThisMonth = (tastings: unknown) => {
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
            icon: '',
            title: '산미에 대한 선호도가 15% 증가했어요.',
            value: '더 밝은 로스팅의 커피를 시도해보세요!',
        },
          {
            icon: '',
            title: '플로럴 향미 식별 정확도가 87%에 달했어요.',
            value: '전문가 수준에 근접합니다!',
        },
          {
            icon: '',
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
          icon: '',
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
          icon: avgScore >= 85 ? '' : avgScore >= 70 ? '' : '',
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
          icon: '',
          title: `새로운 로스터리 ${uniqueRoasteries.size}곳을 발견했어요.`,
          value: '다양성이 취향 발달에 도움이 됩니다.',
      });
    }

      // 최소 3개의 인사이트를 보장
      while (insights.length < 3) {
        if (!insights.find(i => i.title.includes('향미'))) {
          insights.push({
            icon: '',
            title: '더 많은 기록으로 향미 패턴을 분석해보세요.',
            value: '5개 이상 기록하면 개인화된 인사이트를 제공합니다.',
        });
      } else if (!insights.find(i => i.title.includes('점수'))) {
          insights.push({
            icon: '',
            title: '꾸준한 기록으로 실력을 향상시켜보세요.',
            value: '정기적인 테이스팅이 전문성을 높입니다.',
        });
      } else {
          insights.push({
            icon: '',
            title: '커피 여행을 계속해보세요!',
            value: '새로운 경험이 기다리고 있습니다.',
        });
      }
    }

  } catch (error) {
      Logger.error('Error generating insights:', 'screen', { component: 'HomeScreen', error: error });
      // 에러 시 기본 인사이트 반환
      return [
        {
          icon: '',
          title: '산미에 대한 선호도가 15% 증가했어요.',
          value: '더 밝은 로스팅의 커피를 시도해보세요!',
      },
        {
          icon: '',
          title: '플로럴 향미 식별 정확도가 87%에 달했어요.',
          value: '전문가 수준에 근접합니다!',
      },
        {
          icon: '',
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

  // 개발자 모드 첫 실행 시 더미데이터 자동 생성
  const createInitialDummyData = async () => {
    try {
      Logger.debug('Creating initial dummy data for developer mode', 'screen', { component: 'HomeScreen' });
      
      const store = useTastingStore.getState();
      const realm = realmService.getRealm();
      
      // 5개의 더미 테이스팅 기록 생성
      for (let i = 0; i < 5; i++) {
        // 새로운 테이스팅 세션 시작
        store.startNewTasting();
        
        // 모드 설정 (카페/홈카페 랜덤)
        const mode = Math.random() > 0.5 ? 'cafe' : 'home_cafe';
        store.updateField('mode', mode);
        
        // 더미데이터 생성
        await DummyDataService.generateCompleteTastingRecord();
        
        // 날짜를 랜덤하게 설정 (최근 2주 내)
        const randomDaysAgo = Math.floor(Math.random() * 14);
        const createdDate = new Date();
        createdDate.setDate(createdDate.getDate() - randomDaysAgo);
        store.updateField('createdAt', createdDate);
        
        // 저장
        const record = store.createTastingRecord();
        realm.write(() => {
          realm.create('TastingRecord', record);
        });
        
        Logger.debug(`Created dummy tasting record ${i + 1}/5`, 'screen', { 
          component: 'HomeScreen',
          coffeeName: record.coffeeName,
          roastery: record.roastery,
          mode: record.mode
        });
      }
      
      // 데이터 새로고침 이벤트 발생
      DeviceEventEmitter.emit('refreshData');
      
      Logger.debug('Initial dummy data creation completed', 'screen', { component: 'HomeScreen' });
    } catch (error) {
      Logger.error('Error creating initial dummy data:', 'screen', { component: 'HomeScreen', error: error });
    }
  };

  // 통계 및 인사이트 계산 함수
  const calculateStatsAndInsights = async (allTastings: any) => {
    Logger.debug('HomeScreen data load:', 'screen', { 
      component: 'HomeScreen',
      totalRecords: allTastings.length,
      recentRecords: Array.from(allTastings).slice(0, 3).map((r: ITastingRecord) => ({
        id: r.id,
        coffeeName: r.coffeeName,
        roastery: r.roastery,
        createdAt: r.createdAt
      }))
    });
    
    // 통계 계산
    const total = allTastings.length;
    const thisWeek = getThisWeekTastings(allTastings);
    const avgScore = total > 0 ? allTastings.reduce((sum: number, t: ITastingRecord) => sum + (t.matchScoreTotal || 0), 0) / total : 0;
    const bestScore = total > 0 ? Math.max(...allTastings.map((t: ITastingRecord) => t.matchScoreTotal || 0)) : 0;
    
    // 이번 달 새로운 커피 수 계산
    const newCoffees = getNewCoffeesThisMonth(allTastings);
    
    // 총 로스터리 수 계산
    const uniqueRoasteries = new Set();
    allTastings.forEach((tasting: ITastingRecord) => {
      if (tasting.roastery) {
        uniqueRoasteries.add(tasting.roastery);
      }
    });
    
    // 총 카페 수 계산
    const uniqueCafes = new Set();
    allTastings.forEach((tasting: ITastingRecord) => {
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
  };


  // Responsive dimensions
  const isSmallScreen = screenWidth < 375;
  const isLargeScreen = screenWidth > 414;
  
  // Memoized responsive styles
  const responsiveStyles = useMemo(() => ({
    statCardHeight: isSmallScreen ? '$cardMinHeightSm' : isLargeScreen ? '$cardMinHeightLg' : '$cardMinHeightMd',
    statValueSize: isSmallScreen ? '$5' : isLargeScreen ? '$6' : '$5', // 20px ~ 24px
    statLabelSize: isSmallScreen ? '$3' : isLargeScreen ? '$3' : '$3', // 16px (balanced readability for main stat labels)
}), [isSmallScreen, isLargeScreen]);

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Coffee Approval Alert */}
      <CoffeeDiscoveryAlert
        visible={isReady && showApprovalAlert}
        type="approved"
        coffeeName={approvalData?.coffee_name}
        roasteryName={approvalData?.roastery}
        badgeLevel={discoveryStats.level}
        onClose={dismissApprovalAlert}
      />
      
      {/* Navigation Bar */}
      {!hideNavBar && (
        <NavigationBar>
          <XStack alignItems="center" gap="$xs">
            <H2 fontWeight="700" color="$color">CupNote</H2>
            <YStack
              backgroundColor="$cupBlue"
              paddingHorizontal="$xs"
              paddingVertical="$xxs"
              borderRadius="$2"
              height="$badgeSmall"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="$2" fontWeight="700" color="white" letterSpacing="$wide">
                BETA
              </Text>
            </YStack>
          </XStack>
        </NavigationBar>
      )}

      <ScrollView 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
      >
        {/* Main Content */}
        <YStack flex={1} paddingHorizontal="$lg">
          {/* Welcome Section */}
          <YStack paddingTop="$xxl" paddingBottom="$xxl" alignItems="center">
            <H3 fontWeight="600" color="$color" textAlign="center">
              안녕하세요, {currentUser?.username || 'User'}님!
            </H3>
          </YStack>

          {/* Skeleton loading state */}
            {isLoading && (
              <YStack opacity={1}>
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
                <YStack
                  backgroundColor="transparent"
                  padding="$xl"
                  marginBottom="$lg"
                  alignItems="center"
                >
                  <SkeletonBox width="70%" height={18} marginBottom="$xs" opacity={0.3} />
                  <SkeletonBox width="50%" height={14} opacity={0.2} />
                </YStack>
              </YStack>
            )}

          {/* Error state */}
          {error && !isLoading && (
            <YStack
              backgroundColor="$red2"
              padding="$lg"
              marginVertical="$lg"
              alignItems="center"
              borderRadius="$4"
            >
              <Text fontSize="$iconLarge" marginBottom="$md">⚠️</Text>
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
            </YStack>
          )}

          {/* Main content when loaded */}
            {!isLoading && !error && (
              <YStack opacity={1}>

                {/* Admin button */}
                {isAdmin && (
                  <YStack
                    backgroundColor="$orange2"
                    padding="$md"
                    marginBottom="$sm"
                    alignItems="center"
                    borderRadius="$3"
                    pressStyle={{ scale: 0.98 }}
                    onPress={() => navigation.navigate('AdminDashboard' as never)}
                  >
                    <Text fontWeight="700" color="$color" letterSpacing="$normal">
                      관리자 대시보드
                    </Text>
                  </YStack>
                )}


                {/* Stats Overview - 3 cards */}
                <XStack justifyContent="space-between" marginBottom="$md">
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
                  
                  {/* Vertical Separator */}
                  <YStack 
                    width={1} 
                    backgroundColor="$gray5" 
                    marginVertical="$sm"
                  />
                  
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
                  
                  {/* Vertical Separator */}
                  <YStack 
                    width={1} 
                    backgroundColor="$gray5" 
                    marginVertical="$sm"
                  />
                  
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
                    <XStack alignItems="center" justifyContent="center" marginBottom="$sm">
                      <H4 fontWeight="600" color="$color">이번 주 인사이트</H4>
                    </XStack>
                    {insights.map((insight, index) => (
                      <React.Fragment key={`insight-${index}-${insight.title.slice(0, 10)}`}>
                        <InsightCard 
                          {...insight} 
                          isLast={index === insights.length - 1}
                        />
                        {index < insights.length - 1 && (
                          <InsightSeparator />
                        )}
                      </React.Fragment>
                    ))}
                  </InsightSection>
                )}

              </YStack>
            )}
        </YStack>
      </ScrollView>
      
      {/* Status & Developer Tools */}
      <DummyDataInput />
    </YStack>
  );
}