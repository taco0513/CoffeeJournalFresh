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
import RealmService from '../services/realm/RealmService';
import { HIGConstants, HIGColors } from '../styles/common';
import {
  LineChart,
} from 'react-native-chart-kit';
import { useUserStore } from '../stores/useUserStore';
import { InsightCard } from '../components/stats/InsightCard';

const screenWidth = Dimensions.get('window').width;

interface Statistics {
  totalTastings: number;
  averageScore: number;
  firstTastingDays: number;
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
  

  useEffect(() => {
    loadStatistics();
  }, []);

  // 30일 인사이트 생성 함수
  const generateInsights = () => {
    const insights = [];
    
    // 데이터가 없을 때 더미 데이터 표시
    if (!stats || stats.totalTastings === 0) {
      return [
        {
          icon: '🍓',
          title: '가장 좋아한 향미',
          value: '과일향',
          detail: '예시) 15회 선택',
          trend: 'up' as const,
        },
        {
          icon: '☕',
          title: '최애 원산지',
          value: '에티오피아',
          detail: '예시) 평균 88점',
        },
        {
          icon: '⏰',
          title: '커피 타임',
          value: '오전형',
          detail: '예시) 10시 피크',
        },
        {
          icon: '🎯',
          title: '일관성 점수',
          value: '82%',
          detail: '예시) 취향이 명확한 편입니다',
        },
      ];
    }
    
    // 실제 데이터 분석
    const realmService = RealmService.getInstance();
    const recentTastings = realmService.getTastingRecords({ 
      isDeleted: false,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30일 전
    });

    // 1. 가장 좋아한 향미
    const flavorCounts = new Map<string, number>();
    recentTastings.forEach(tasting => {
      tasting.flavorNotes.forEach(flavor => {
        flavorCounts.set(flavor, (flavorCounts.get(flavor) || 0) + 1);
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
        title: '가장 좋아한 향미',
        value: topFlavor,
        detail: `${topFlavorCount}회 선택`,
        trend: topFlavorCount > 10 ? 'up' : 'stable',
      });
    }

    // 2. 최애 원산지
    const topOrigins = new Map<string, { count: number; totalScore: number }>();
    recentTastings.forEach(tasting => {
      if (tasting.origin) {
        const current = topOrigins.get(tasting.origin) || { count: 0, totalScore: 0 };
        current.count++;
        current.totalScore += tasting.matchScore || 0;
        topOrigins.set(tasting.origin, current);
      }
    });

    let bestOrigin = '';
    let bestScore = 0;
    topOrigins.forEach((data, origin) => {
      const avgScore = data.totalScore / data.count;
      if (avgScore > bestScore) {
        bestOrigin = origin;
        bestScore = avgScore;
      }
    });

    if (bestOrigin) {
      insights.push({
        icon: '☕',
        title: '최애 원산지',
        value: bestOrigin,
        detail: `평균 ${Math.round(bestScore)}점`,
      });
    }

    // 3. 커피 타임
    const timeDistribution = new Map<number, number>();
    recentTastings.forEach(tasting => {
      const hour = new Date(tasting.createdAt).getHours();
      timeDistribution.set(hour, (timeDistribution.get(hour) || 0) + 1);
    });

    let peakHour = 0;
    let peakCount = 0;
    timeDistribution.forEach((count, hour) => {
      if (count > peakCount) {
        peakHour = hour;
        peakCount = count;
      }
    });

    if (peakHour > 0) {
      const timeType = peakHour < 12 ? '오전형' : peakHour < 18 ? '오후형' : '저녁형';
      insights.push({
        icon: '⏰',
        title: '커피 타임',
        value: timeType,
        detail: `${peakHour}시 피크`,
      });
    }

    // 4. 일관성 점수
    if (recentTastings.length > 5) {
      const scores = recentTastings.map(t => t.matchScore || 0);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
      const consistency = Math.max(0, 100 - Math.sqrt(variance) * 2);

      insights.push({
        icon: '🎯',
        title: '일관성 점수',
        value: `${Math.round(consistency)}%`,
        detail: consistency > 80 ? '취향이 명확한 편입니다' : '다양한 스타일을 탐험중',
      });
    }

    // 최소 4개의 인사이트를 보장
    while (insights.length < 4) {
      if (!insights.find(i => i.title === '가장 좋아한 향미')) {
        insights.push({
          icon: '🍓',
          title: '가장 좋아한 향미',
          value: '더 많은 기록이 필요해요',
          detail: '5개 이상 기록 후 확인 가능',
        });
      } else if (!insights.find(i => i.title === '최애 원산지')) {
        insights.push({
          icon: '☕',
          title: '최애 원산지',
          value: '더 많은 기록이 필요해요',
          detail: '원산지 정보 입력 필요',
        });
      } else if (!insights.find(i => i.title === '커피 타임')) {
        insights.push({
          icon: '⏰',
          title: '커피 타임',
          value: '패턴 분석중',
          detail: '더 많은 기록이 필요해요',
        });
      } else if (!insights.find(i => i.title === '일관성 점수')) {
        insights.push({
          icon: '🎯',
          title: '일관성 점수',
          value: '계산중',
          detail: '5개 이상 기록 필요',
        });
      }
    }

    return insights;
  };

  const loadTastingTrends = async (): Promise<TastingTrend[]> => {
    try {
      const realmService = RealmService.getInstance();
      const tastings = realmService.getTastingRecords({ isDeleted: false });
      
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
      tastings.forEach(tasting => {
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
            <Text style={styles.emptyIcon}>📊</Text>
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
            {generateInsights().map((insight, index) => (
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
              <Text style={styles.statLabel}>총 테이스팅</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.averageScore}%</Text>
              <Text style={styles.statLabel}>평균 매칭</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.firstTastingDays}일</Text>
              <Text style={styles.statLabel}>커피 여정</Text>
            </View>
          </View>
        </View>

        {/* TOP 로스터리 */}
        {topRoasters.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 가장 많이 마신 로스터리</Text>
            <View style={styles.rankingCard}>
              {topRoasters.map((roaster, index) => (
                <View key={roaster.name} style={styles.rankingItem}>
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

        {/* TOP 커피 */}
        {topCoffees.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>☕ 가장 많이 마신 커피</Text>
            <View style={styles.rankingCard}>
              {topCoffees.map((coffee, index) => (
                <View key={`${coffee.roastery}-${coffee.name}`} style={styles.rankingItem}>
                  <View style={styles.rankingLeft}>
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                    <View style={styles.rankingInfo}>
                      <Text style={styles.rankName} numberOfLines={1}>
                        {coffee.name}
                      </Text>
                      <Text style={styles.rankSubtext}>{coffee.roastery}</Text>
                    </View>
                  </View>
                  <Text style={styles.rankCount}>{coffee.count}회</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* TOP 카페 */}
        {topCafes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏠 자주 방문한 카페</Text>
            <View style={styles.rankingCard}>
              {topCafes.map((cafe, index) => (
                <View key={cafe.name} style={styles.rankingItem}>
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

        {/* 테이스팅 트렌드 차트 */}
        {tastingTrend.length > 0 && (
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
        )}

        {/* 더 보기 버튼 */}

        {/* 30일 인사이트 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>30일 인사이트</Text>
          {generateInsights().map((insight, index) => (
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
    justifyContent: 'space-between',
    gap: HIGConstants.SPACING_SM,
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
});

export default StatsScreen;