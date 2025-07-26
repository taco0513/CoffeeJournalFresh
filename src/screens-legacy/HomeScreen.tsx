import { NavigationProp } from '@react-navigation/native';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
// import { useTranslation } from 'react-i18next'; // Removed - using static Korean strings
import { HIGConstants, HIGColors, commonButtonStyles, commonTextStyles } from '../styles/common';
import { IOSColors, IOSLayout, IOSTypography, IOSSpacing, IOSShadows } from '../styles/ios-hig-2024';
import RealmService from '../services/realm/RealmService';
import { useUserStore } from '../stores/useUserStore';
import { useDevStore } from '../stores/useDevStore';
import { ITastingRecord } from '../services/realm/schemas';
import { useCoffeeNotifications } from '../hooks/useCoffeeNotifications';
import { CoffeeDiscoveryAlert } from '../components/CoffeeDiscoveryAlert';
import { InsightCard } from '../components/stats/InsightCard';

import { Logger } from '../services/LoggingService';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: NavigationProp<any>;
}

export default function HomeScreen({navigation}: HomeScreenProps) {
  // const { t } = useTranslation(); // Removed - using static Korean strings
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

  // Skeleton loading component
  const SkeletonCard = () => (
    <View style={[styles.statCard, styles.skeletonCard]}>
      <View style={styles.skeletonValue} />
      <View style={styles.skeletonLabel} />
    </View>
  );

  const SkeletonInsight = () => (
    <View style={[styles.insightCard, styles.skeletonCard]}>
      <View style={styles.skeletonIcon} />
      <View style={styles.skeletonInsightContent}>
        <View style={styles.skeletonInsightTitle} />
        <View style={styles.skeletonInsightSubtitle} />
      </View>
    </View>
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
        Logger.error('Failed to initialize Realm:', 'general', { component: 'HomeScreen', error: error });
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
        Logger.warn('Realm not initialized yet, skipping data load', 'general', { component: 'HomeScreen' });
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
      Logger.error('Error loading dashboard data:', 'general', { component: 'HomeScreen', error: error });
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
      Logger.error('Error generating insights:', 'general', { component: 'HomeScreen', error: error });
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

  // Responsive dimensions
  const isSmallScreen = screenWidth < 375;
  const isLargeScreen = screenWidth > 414;
  
  // Memoized responsive styles using typography system
  const responsiveStyles = useMemo(() => ({
    statCardHeight: isSmallScreen ? 65 : isLargeScreen ? 85 : 75,
    statValueSize: isSmallScreen ? 20 : isLargeScreen ? 24 : 20, // Research-backed stat values
    statLabelSize: isSmallScreen ? 16 : isLargeScreen ? 16 : 16,  // 16px - balanced readability for main stat labels
}), [isSmallScreen, isLargeScreen]);



  return (
    <SafeAreaView style={styles.container}>
      {/* Coffee Approval Alert */}
      <CoffeeDiscoveryAlert
        visible={showApprovalAlert}
        type="approved"
        coffeeName={approvalData?.coffee_name}
        roasteryName={approvalData?.roastery}
        badgeLevel={discoveryStats.level}
        onClose={dismissApprovalAlert}
      />
      {/* 네비게이션 바 영역 */}
      <View style={styles.navigationBar}>
        <View style={styles.titleContainer}>
          <Text style={styles.navigationTitle}>CupNote</Text>
          <View style={styles.betaBadge}>
            <Text style={styles.betaText}>BETA</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 메인 컨텐츠 */}
        <View style={styles.content}>
          {/* 환영 메시지 */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>안녕하세요, {currentUser?.username || 'User'}님!</Text>
          </View>

          {/* Skeleton loading 상태 */}
          {isLoading && (
            <>
              {/* 통계 카드 스켈레톤 */}
              <View style={styles.statsOverview}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </View>
              
              {/* 인사이트 스켈레톤 */}
              <View style={styles.insightsSection}>
                <View style={styles.insightHeader}>
                  <View style={styles.skeletonIcon} />
                  <View style={styles.skeletonInsightHeader} />
                </View>
                <SkeletonInsight />
                <SkeletonInsight />
                <SkeletonInsight />
              </View>

              {/* 액션 버튼 스켈레톤 */}
              <View style={[styles.primaryActionCard, styles.skeletonCard]}>
                <View style={styles.skeletonButtonTitle} />
                <View style={styles.skeletonButtonSubtitle} />
              </View>
            </>
          )}

          {/* 에러 상태 */}
          {error && !isLoading && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={loadDashboardData}
                accessible={true}
                accessibilityLabel="다시 시도"
                accessibilityHint="탭하여 데이터를 다시 불러옵니다"
                accessibilityRole="button"
              >
                <Text style={styles.retryButtonText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 메인 콘텐츠는 로딩/에러가 없을 때만 표시 */}
          {!isLoading && !error && (
            <>


          {/* 관리자 버튼 */}
          {isAdmin && (
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => navigation.navigate('AdminDashboard' as never)}
              accessible={true}
              accessibilityLabel="관리자 대시보드"
              accessibilityHint="탭하여 관리자 기능에 접근합니다"
              accessibilityRole="button"
            >
              <Text style={styles.adminButtonText}>관리자 대시보드</Text>
            </TouchableOpacity>
          )}

          {/* 통계 요약 카드 - 3개 카드 */}
          <View style={styles.statsOverview}>
            <TouchableOpacity 
              style={[styles.statCard, { minHeight: responsiveStyles.statCardHeight }]} 
              onPress={handleQuickStats}
              accessible={true}
              accessibilityLabel={`나의 커피 기록 ${stats.totalTastings || 0}개`}
              accessibilityHint="탭하여 상세 통계를 확인합니다"
              accessibilityRole="button"
            >
              <Text style={[styles.statValue, { fontSize: responsiveStyles.statValueSize }]}>{stats.totalTastings || 0}</Text>
              <Text style={[styles.statLabel, { fontSize: responsiveStyles.statLabelSize }]}>나의 커피 기록</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.statCard, { minHeight: responsiveStyles.statCardHeight }]} 
              onPress={handleQuickStats}
              accessible={true}
              accessibilityLabel={`발견한 로스터리 ${stats.totalRoasteries || 0}곳`}
              accessibilityHint="탭하여 상세 통계를 확인합니다"
              accessibilityRole="button"
            >
              <Text style={[styles.statValue, { fontSize: responsiveStyles.statValueSize }]}>{stats.totalRoasteries || 0}</Text>
              <Text style={[styles.statLabel, { fontSize: responsiveStyles.statLabelSize }]}>발견한 로스터리</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.statCard, { minHeight: responsiveStyles.statCardHeight }]} 
              onPress={handleQuickStats}
              accessible={true}
              accessibilityLabel={`방문한 카페 ${stats.totalCafes || 0}곳`}
              accessibilityHint="탭하여 상세 통계를 확인합니다"
              accessibilityRole="button"
            >
              <Text style={[styles.statValue, { fontSize: responsiveStyles.statValueSize }]}>{stats.totalCafes || 0}</Text>
              <Text style={[styles.statLabel, { fontSize: responsiveStyles.statLabelSize }]}>방문한 카페</Text>
            </TouchableOpacity>
          </View>

          {/* 이번 주 인사이트 섹션 */}
          {insights.length > 0 && (
            <View style={styles.insightsSection}>
              <View style={styles.insightHeader}>
                <Text style={styles.insightIcon}>💡</Text>
                <Text style={styles.insightTitle}>이번 주 인사이트</Text>
              </View>
              {insights.map((insight, index) => (
                <InsightCard key={index} {...insight} />
              ))}
            </View>
          )}


            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
},
  navigationBar: {
    height: 44, // iOS standard - could be tokenized
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5, // Standard border width
    borderBottomColor: HIGColors.gray4,
},
  scrollView: {
    flex: 1,
},
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: IOSSpacing.xs,
},
  navigationTitle: {
    ...IOSTypography.headline,
    color: IOSColors.label,
},
  betaBadge: {
    backgroundColor: IOSColors.systemBlue,
    paddingHorizontal: IOSSpacing.xs,
    paddingVertical: IOSSpacing.xxxs,
    borderRadius: IOSLayout.cornerRadiusSmall,
},
  betaText: {
    ...IOSTypography.caption2,
    fontWeight: '700' as const,
    color: IOSColors.systemBackground,
    letterSpacing: 0.5,
},
  languageSwitch: {
    // 언어 스위치 스타일은 컴포넌트 내부에서 관리
},
  content: {
    flex: 1,
    paddingHorizontal: IOSSpacing.screenPadding,
},
  welcomeSection: {
    paddingTop: IOSSpacing.xxxl,
    paddingBottom: IOSSpacing.xxxl,
    alignItems: 'center',
},
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: IOSSpacing.md,
    paddingHorizontal: 0,
    gap: IOSSpacing.sm,
},
  statCard: {
    flex: 1,
    backgroundColor: IOSColors.secondarySystemGroupedBackground,
    borderRadius: IOSLayout.cornerRadiusMedium,
    padding: IOSSpacing.sm,
    paddingVertical: IOSSpacing.md,
    alignItems: 'center',
    ...IOSShadows.small,
    minHeight: 75,
},
  statValue: {
    ...IOSTypography.title2,
    color: IOSColors.systemBlue,
    marginBottom: IOSSpacing.xxs,
},
  statLabel: {
    ...IOSTypography.caption1,
    color: IOSColors.label,
    textAlign: 'center',
},
  welcomeTitle: {
    ...IOSTypography.title1,
    color: IOSColors.label,
},
  insightsSection: {
    marginBottom: IOSSpacing.sm,
    marginTop: IOSSpacing.sm,
},
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: IOSSpacing.sm,
},
  insightIcon: {
    fontSize: IOSLayout.iconSizeMedium,
    marginRight: IOSSpacing.sm,
},
  insightTitle: {
    ...IOSTypography.headline,
    color: IOSColors.label,
},
  
  // Coffee Discovery Styles
  discoverySection: {
    backgroundColor: IOSColors.systemPurple + '10',
    borderRadius: IOSLayout.cornerRadiusMedium,
    padding: IOSSpacing.md,
    marginBottom: IOSSpacing.lg,
    borderWidth: IOSLayout.borderWidthThin,
    borderColor: IOSColors.systemPurple,
},
  discoverySectionTitle: {
    ...IOSTypography.headline,
    color: IOSColors.label,
    marginBottom: IOSSpacing.sm,
},
  discoveryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
},
  discoveryStatItem: {
    alignItems: 'center',
},
  discoveryStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.blue,
},
  discoveryStatLabel: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
    marginTop: HIGConstants.SPACING_XS,
},
  
  // Primary Action Card
  primaryActionCard: {
    backgroundColor: IOSColors.systemBackground,
    borderRadius: IOSLayout.cornerRadiusLarge,
    padding: IOSSpacing.lg,
    marginBottom: IOSSpacing.md,
    ...IOSShadows.medium,
},
  
  // Admin Button
  adminButton: {
    backgroundColor: IOSColors.systemOrange + '10',
    borderRadius: IOSLayout.cornerRadiusMedium,
    padding: IOSSpacing.md,
    marginBottom: IOSSpacing.sm,
    alignItems: 'center',
    borderWidth: IOSLayout.borderWidthThin,
    borderColor: IOSColors.systemOrange,
    ...IOSShadows.small,
},
  adminButtonText: {
    ...IOSTypography.body,
    fontWeight: '700' as const,
    color: IOSColors.label,
    letterSpacing: 0.2,
},
  
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: IOSSpacing.xxxl * 2,
},
  loadingText: {
    ...IOSTypography.body,
    color: IOSColors.secondaryLabel,
    marginTop: IOSSpacing.md,
},
  errorContainer: {
    backgroundColor: IOSColors.systemRed + '10',
    borderRadius: IOSLayout.cornerRadiusLarge,
    padding: IOSSpacing.lg,
    marginVertical: IOSSpacing.lg,
    alignItems: 'center',
    borderWidth: IOSLayout.borderWidthThin,
    borderColor: IOSColors.systemRed + '20',
},
  errorIcon: {
    fontSize: 48,
    marginBottom: IOSSpacing.md,
},
  errorText: {
    ...IOSTypography.body,
    color: IOSColors.systemRed,
    textAlign: 'center',
    marginBottom: IOSSpacing.lg,
},
  retryButton: {
    backgroundColor: IOSColors.systemRed,
    paddingHorizontal: IOSSpacing.lg,
    paddingVertical: IOSSpacing.md,
    borderRadius: IOSLayout.cornerRadiusMedium,
},
  retryButtonText: {
    ...IOSTypography.subheadline,
    fontWeight: '600' as const,
    color: IOSColors.systemBackground,
},

  // Skeleton Loading Styles
  skeletonCard: {
    backgroundColor: IOSColors.systemGray6,
    borderColor: IOSColors.systemGray5,
},
  skeletonValue: {
    width: '50%',
    height: 20,
    backgroundColor: IOSColors.systemGray5,
    borderRadius: IOSLayout.cornerRadiusSmall,
    marginBottom: IOSSpacing.xxs,
},
  skeletonLabel: {
    width: '70%',
    height: 12,
    backgroundColor: IOSColors.systemGray5,
    borderRadius: IOSLayout.cornerRadiusSmall,
},
  insightCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF8F0',
    borderRadius: HIGConstants.BORDER_RADIUS_LARGE,
    padding: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_MD,
    borderWidth: 1,
    borderColor: '#FFE5CC',
},
  skeletonIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#E9ECEF',
    borderRadius: 16,
    marginRight: HIGConstants.SPACING_LG,
},
  skeletonInsightContent: {
    flex: 1,
},
  skeletonInsightTitle: {
    width: '80%',
    height: 16,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    marginBottom: HIGConstants.SPACING_XS,
},
  skeletonInsightSubtitle: {
    width: '60%',
    height: 14,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
},
  skeletonInsightHeader: {
    width: '60%',
    height: 18,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
},
  skeletonButtonTitle: {
    width: '70%',
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: HIGConstants.SPACING_XS,
},
  skeletonButtonSubtitle: {
    width: '50%',
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
},
});