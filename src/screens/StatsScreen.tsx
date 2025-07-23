import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TastingService } from '../services/realm/TastingService';
import { ITastingRecord } from '../services/realm/schemas';
import { HIGConstants, HIGColors } from '../styles/common';
// import {
//   LineChart,
// } from 'react-native-chart-kit';
import { useUserStore } from '../stores/useUserStore';
import { InsightCard } from '../components/stats/InsightCard';
import RealmService from '../services/realm/RealmService';

const screenWidth = Dimensions.get('window').width;

interface Statistics {
  totalTastings: number;
  averageScore: number;
  firstTastingDays: number;
  cafeCount?: number;
  homeCafeCount?: number;
}

interface TopRoaster {
  name: string;
  count: number;
  avgScore: number;
}

interface TopCoffee {
  name: string;
  roastery: string;
  count: number;
}

interface TopCafe {
  name: string;
  count: number;
}

interface TastingTrend {
  date: string;
  count: number;
  avgScore: number;
}

interface StatsScreenProps {
  hideNavBar?: boolean;
}

const StatsScreen = ({ hideNavBar = false }: StatsScreenProps) => {
  const navigation = useNavigation();
  const { currentUser } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [topRoasters, setTopRoasters] = useState<TopRoaster[]>([]);
  const [topCoffees, setTopCoffees] = useState<TopCoffee[]>([]);
  const [topCafes, setTopCafes] = useState<TopCafe[]>([]);
  const [tastingTrend, setTastingTrend] = useState<TastingTrend[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  

  useEffect(() => {
    loadStatistics();
    loadInsights();
  }, []);

  // 30일 인사이트 로드 함수
  const loadInsights = async () => {
    const insightsData = await generateInsights();
    setInsights(insightsData);
  };

  // 30일 인사이트 생성 함수
  const generateInsights = async () => {
    const insights = [];
    
    // 데이터가 없을 때 더미 데이터 표시
    if (!stats || stats.totalTastings === 0) {
      return [
        {
          icon: '🌍',
          title: '많이 마신 원산지',
          value: '에티오피아',
          detail: '예시) 15회',
          trend: 'up' as const,
        },
        {
          icon: '🍓',
          title: '많이 느낀 향미',
          value: '과일향',
          detail: '예시) 12회',
        },
        {
          icon: '☕',
          title: '총 테이스팅',
          value: '45잔',
          detail: '예시) 지난 30일간',
        },
      ];
    }
    
    // Load insights normally
    
    // 실제 데이터 분석
    const tastingService = TastingService.getInstance();
    const allTastings = await tastingService.getTastingRecords({ 
      isDeleted: false,
      limit: 1000
    });
    
    // 최근 30일 데이터로 필터링
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentTastings = Array.from(allTastings).filter(tasting => 
      tasting.createdAt >= thirtyDaysAgo
    );

    // 1. 많이 마신 원산지
    const originCounts = new Map<string, number>();
    recentTastings.forEach(tasting => {
      if (tasting.origin) {
        originCounts.set(tasting.origin, (originCounts.get(tasting.origin) || 0) + 1);
      }
    });

    let topOrigin = '';
    let topOriginCount = 0;
    originCounts.forEach((count, origin) => {
      if (count > topOriginCount) {
        topOrigin = origin;
        topOriginCount = count;
      }
    });

    if (topOrigin) {
      insights.push({
        icon: '🌍',
        title: '많이 마신 원산지',
        value: topOrigin,
        detail: `${topOriginCount}회`,
        trend: topOriginCount > 10 ? 'up' : 'stable',
      });
    }

    // 2. 많이 느낀 향미
    const flavorCounts = new Map<string, number>();
    recentTastings.forEach(tasting => {
      tasting.flavorNotes.forEach(flavor => {
        // Handle both string and object flavor formats
        const flavorKey = typeof flavor === 'string' ? flavor : (flavor.koreanValue || flavor.value || '');
        if (flavorKey) {
          flavorCounts.set(flavorKey, (flavorCounts.get(flavorKey) || 0) + 1);
        }
      });
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
        title: '많이 느낀 향미',
        value: topFlavor,
        detail: `${topFlavorCount}회`,
      });
    }

    // 3. 총 테이스팅 (30일간)
    const totalIn30Days = recentTastings.length;
    insights.push({
      icon: '☕',
      title: '총 테이스팅',
      value: `${totalIn30Days}잔`,
      detail: '지난 30일간',
    });

    // 최소 3개의 인사이트를 보장
    while (insights.length < 3) {
      if (!insights.find(i => i.title === '많이 마신 원산지')) {
        insights.push({
          icon: '🌍',
          title: '많이 마신 원산지',
          value: '더 많은 기록이 필요해요',
          detail: '원산지 정보 입력 필요',
        });
      } else if (!insights.find(i => i.title === '많이 느낀 향미')) {
        insights.push({
          icon: '🍓',
          title: '많이 느낀 향미',
          value: '더 많은 기록이 필요해요',
          detail: '5개 이상 기록 후 확인 가능',
        });
      } else if (!insights.find(i => i.title === '총 테이스팅')) {
        insights.push({
          icon: '☕',
          title: '총 테이스팅',
          value: '0잔',
          detail: '지난 30일간',
        });
      }
    }

    return insights;
  };

  const loadTastingTrends = async (): Promise<TastingTrend[]> => {
    try {
      // Load trends normally
      
      const tastingService = TastingService.getInstance();
      const tastings = await tastingService.getTastingRecords({ 
        isDeleted: false,
        limit: 1000
      });
      
      // Group by month for the last 6 months
      const monthData = new Map<string, { count: number; totalScore: number }>();
      const now = new Date();
      
      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        monthData.set(key, { count: 0, totalScore: 0 });
      }
      
      // Count tastings by month
      tastings.forEach((tasting: ITastingRecord) => {
        const date = new Date(tasting.createdAt);
        const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const data = monthData.get(key);
        if (data) {
          data.count++;
          data.totalScore += tasting.matchScoreTotal || 0;
        }
      });
      
      // Convert to array
      return Array.from(monthData.entries()).map(([date, data]) => ({
        date: date.split('-')[1] + '월',
        count: data.count,
        avgScore: data.count > 0 ? data.totalScore / data.count : 0
      }));
    } catch (error) {
      // console.error('Failed to load tasting trends:', error);
      return [];
    }
  };
  

  const loadStatistics = async () => {
    try {
      
      const realmService = RealmService.getInstance();
      
      // Load all statistics
      const basicStats = realmService.getStatistics();
      const roasters = realmService.getTopRoasters(3);
      const coffees = realmService.getTopCoffees(3);
      const cafes = realmService.getTopCafes(3);
      
      // Load chart data
      const trends = await loadTastingTrends();

      setStats(basicStats);
      setTopRoasters(roasters);
      setTopCoffees(coffees);
      setTopCafes(cafes);
      setTastingTrend(trends);
    } catch (error) {
      // console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={HIGColors.blue} />
          <Text style={styles.loadingText}>통계를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats || stats.totalTastings === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Navigation Bar */}
        {!hideNavBar && (
          <View style={styles.navigationBar}>
            <View style={styles.titleContainer}>
              <Text style={styles.navigationTitle}>통계</Text>
              <View style={styles.betaBadge}>
                <Text style={styles.betaText}>BETA</Text>
              </View>
            </View>
            <View style={{ width: 80 }} />
          </View>
        )}

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>아직 테이스팅 기록이 없습니다</Text>
            <Text style={styles.emptySubtext}>
              첫 테이스팅을 기록하면 통계를 볼 수 있습니다
            </Text>
          </View>

          {/* 30일 인사이트 섹션 - 예시 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>30일 인사이트 (예시)</Text>
            <Text style={styles.insightPreviewText}>
              기록이 쌓이면 이런 인사이트를 볼 수 있어요!
            </Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} {...insight} />
            ))}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar */}
      {!hideNavBar && (
        <View style={styles.navigationBar}>
          <View style={styles.titleContainer}>
            <Text style={styles.navigationTitle}>통계</Text>
            <View style={styles.betaBadge}>
              <Text style={styles.betaText}>BETA</Text>
            </View>
          </View>
          <View style={{ width: 80 }} />
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>나의 커피 통계</Text>
          <Text style={styles.headerSubtitle}>커피 여정을 한눈에</Text>
        </View>


        {/* 기본 통계 */}
        <View style={styles.section}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalTastings}</Text>
              <Text style={styles.statLabel}>나의 커피 기록</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{topRoasters.length}</Text>
              <Text style={styles.statLabel}>발견한 로스터리</Text>
            </View>
          </View>
        </View>

        {/* Home Cafe vs Cafe 모드 통계 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>☕ 테이스팅 장소</Text>
          <View style={styles.modeStatsContainer}>
            <View style={styles.modeStatCard}>
              <Text style={styles.modeIcon}>🏪</Text>
              <Text style={styles.modeNumber}>{stats.cafeCount || 0}</Text>
              <Text style={styles.modeLabel}>카페에서</Text>
            </View>
            <View style={styles.modeStatCard}>
              <Text style={styles.modeIcon}>🏠</Text>
              <Text style={styles.modeNumber}>{stats.homeCafeCount || 0}</Text>
              <Text style={styles.modeLabel}>홈카페에서</Text>
            </View>
          </View>
          {stats.totalTastings > 0 && (
            <View style={styles.modePercentageContainer}>
              <View style={styles.modePercentageBar}>
                <View 
                  style={[
                    styles.modePercentageFill, 
                    styles.cafePercentage,
                    { width: `${((stats.cafeCount || 0) / stats.totalTastings) * 100}%` }
                  ]} 
                />
                <View 
                  style={[
                    styles.modePercentageFill, 
                    styles.homeCafePercentage,
                    { width: `${((stats.homeCafeCount || 0) / stats.totalTastings) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          )}
        </View>

        {/* TOP 로스터리 */}
        {topRoasters.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>가장 많이 마신 로스터리</Text>
            <View style={styles.rankingCard}>
              {topRoasters.map((roaster, index) => (
                <View key={roaster.name} style={[styles.rankingItem, index === topRoasters.length - 1 && styles.rankingItemLast]}>
                  <View style={styles.rankingLeft}>
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                    <View style={styles.rankingInfo}>
                      <Text style={styles.rankName}>{roaster.name}</Text>
                      <Text style={styles.rankScore}>평균 {roaster.avgScore}%</Text>
                    </View>
                  </View>
                  <Text style={styles.rankCount}>{roaster.count}회</Text>
                </View>
              ))}
            </View>
          </View>
        )}


        {/* TOP 카페 */}
        {topCafes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>자주 방문한 카페</Text>
            <View style={styles.rankingCard}>
              {topCafes.map((cafe, index) => (
                <View key={cafe.name} style={[styles.rankingItem, index === topCafes.length - 1 && styles.rankingItemLast]}>
                  <View style={styles.rankingLeft}>
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                    <View style={styles.rankingInfo}>
                      <Text style={styles.rankName}>{cafe.name}</Text>
                    </View>
                  </View>
                  <Text style={styles.rankCount}>{cafe.count}회</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 테이스팅 트렌드 차트 - Temporarily disabled due to missing react-native-chart-kit */}
        {/* {tastingTrend.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 테이스팅 트렌드</Text>
            <View style={styles.chartCard}>
              <LineChart
                data={{
                  labels: tastingTrend.map(item => item.date),
                  datasets: [{
                    data: tastingTrend.map(item => item.count),
                    strokeWidth: 3,
                    color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
                  }]
                }}
                width={screenWidth - 32}
                height={220}
                chartConfig={{
                  backgroundColor: HIGColors.secondarySystemBackground,
                  backgroundGradientFrom: HIGColors.secondarySystemBackground,
                  backgroundGradientTo: HIGColors.secondarySystemBackground,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(60, 60, 67, ${opacity})`,
                  style: {
                    borderRadius: HIGConstants.BORDER_RADIUS,
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: HIGColors.blue
                  }
                }}
                bezier
                style={styles.chart}
              />
            </View>
          </View>
        )} */}

        {/* 더 보기 버튼 */}

        {/* 30일 인사이트 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>30일 인사이트</Text>
          {insights.map((insight, index) => (
            <InsightCard key={index} {...insight} />
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navigationBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  betaBadge: {
    backgroundColor: HIGColors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  betaText: {
    fontSize: 11,
    fontWeight: '700',
    color: HIGColors.white,
    letterSpacing: 0.5,
  },
  languageSwitch: {},
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: HIGConstants.SPACING_MD,
    fontSize: 16,
    color: HIGColors.secondaryLabel,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: HIGConstants.SPACING_LG,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: HIGConstants.SPACING_MD,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  emptySubtext: {
    fontSize: 15,
    color: HIGColors.tertiaryLabel,
    textAlign: 'center',
  },
  header: {
    padding: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_SM,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  headerSubtitle: {
    fontSize: 17,
    color: HIGColors.secondaryLabel,
  },
  section: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_XL,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: HIGConstants.SPACING_LG,
  },
  statCard: {
    flex: 1,
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_LG,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: HIGColors.blue,
    marginBottom: HIGConstants.SPACING_XS,
  },
  statLabel: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
  },
  rankingCard: {
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  rankingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_SM,
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  rankingItemLast: {
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  rankingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: HIGColors.blue,
    width: 28,
  },
  rankingInfo: {
    flex: 1,
    marginLeft: HIGConstants.SPACING_SM,
  },
  rankName: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
  },
  rankSubtext: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
    marginTop: 2,
  },
  rankScore: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
    marginTop: 2,
  },
  rankCount: {
    fontSize: 15,
    fontWeight: '600',
    color: HIGColors.blue,
  },
  flavorCard: {
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  flavorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_MD,
  },
  flavorLeft: {
    flex: 1,
    marginRight: HIGConstants.SPACING_MD,
  },
  flavorName: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  flavorBarContainer: {
    height: 6,
    backgroundColor: HIGColors.gray4,
    borderRadius: 3,
    overflow: 'hidden',
  },
  flavorBar: {
    height: '100%',
    backgroundColor: HIGColors.blue,
    borderRadius: 3,
  },
  flavorCount: {
    fontSize: 15,
    fontWeight: '600',
    color: HIGColors.blue,
  },
  bottomSpacer: {
    height: HIGConstants.SPACING_XL * 2,
  },
  insightPreviewText: {
    fontSize: 14,
    color: HIGColors.tertiaryLabel,
    marginBottom: HIGConstants.SPACING_LG,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_SM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  chart: {
    marginVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.BORDER_RADIUS,
  },
  moreButton: {
    backgroundColor: '#F0F9FF',
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_LG,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HIGColors.blue + '30',
    flexDirection: 'column',
  },
  moreButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.blue,
    marginBottom: HIGConstants.SPACING_XS,
  },
  moreButtonSubtext: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  moreButtonArrow: {
    fontSize: 20,
    color: HIGColors.blue,
  },
  modeStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: HIGConstants.SPACING_LG,
  },
  modeStatCard: {
    flex: 1,
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_LG,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  modeIcon: {
    fontSize: 24,
    marginBottom: HIGConstants.SPACING_XS,
  },
  modeNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  modeLabel: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    fontWeight: '500',
  },
  modePercentageContainer: {
    marginTop: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_SM,
  },
  modePercentageBar: {
    height: 8,
    backgroundColor: HIGColors.systemGray5,
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  modePercentageFill: {
    height: '100%',
  },
  cafePercentage: {
    backgroundColor: '#FF6B35', // Orange for cafe
  },
  homeCafePercentage: {
    backgroundColor: '#4CAF50', // Green for home cafe
  },
});

export default StatsScreen;