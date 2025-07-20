import React, { useEffect, useState } from 'react';
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
import { generateGuestMockData, generateGuestStats } from '../utils/guestMockData';
import LanguageSwitch from '../components/LanguageSwitch';

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

const StatsScreen = () => {
  const navigation = useNavigation();
  const { currentUser } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [topRoasters, setTopRoasters] = useState<TopRoaster[]>([]);
  const [topCoffees, setTopCoffees] = useState<TopCoffee[]>([]);
  const [topCafes, setTopCafes] = useState<TopCafe[]>([]);
  const [tastingTrend, setTastingTrend] = useState<TastingTrend[]>([]);
  
  // 게스트 모드 체크
  const isGuestMode = currentUser?.username === 'Guest' || !currentUser;

  useEffect(() => {
    loadStatistics();
  }, []);

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
      // 게스트 모드인 경우 mock 데이터 사용
      if (isGuestMode) {
        const guestMockData = generateGuestMockData();
        const guestStats = generateGuestStats();
        
        // Mock 통계 데이터 생성
        setStats({
          totalTastings: guestStats.totalTastings,
          averageScore: guestStats.avgScore,
          firstTastingDays: 45,
        });
        
        // Mock TOP 로스터리 데이터 (3등까지)
        setTopRoasters([
          { name: 'Blue Bottle Coffee', count: 8, avgScore: 89 },
          { name: 'Fritz Coffee Company', count: 5, avgScore: 85 },
          { name: 'Anthracite Coffee', count: 3, avgScore: 88 },
        ]);
        
        // Mock TOP 커피 데이터 (3등까지)
        setTopCoffees([
          { name: 'Three Africas', roastery: 'Blue Bottle Coffee', count: 4 },
          { name: 'Colombia Geisha', roastery: 'Fritz Coffee Company', count: 3 },
          { name: 'Ethiopia Yirgacheffe', roastery: 'Anthracite Coffee', count: 2 },
        ]);
        
        // Mock TOP 카페 데이터 (3등까지)
        setTopCafes([
          { name: 'Blue Bottle 삼청점', count: 6 },
          { name: 'Fritz 성수점', count: 4 },
          { name: 'Anthracite 한남점', count: 2 },
        ]);
        
        // Mock 테이스팅 트렌드 데이터
        setTastingTrend([
          { date: '02월', count: 0, avgScore: 0 },
          { date: '03월', count: 1, avgScore: 85 },
          { date: '04월', count: 2, avgScore: 87 },
          { date: '05월', count: 1, avgScore: 92 },
          { date: '06월', count: 1, avgScore: 88 },
          { date: '07월', count: 0, avgScore: 0 },
        ]);
        
        setLoading(false);
        return;
      }
      
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

  if (!stats || (!isGuestMode && stats.totalTastings === 0)) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.navigationBar}>
          <View style={styles.titleContainer}>
            <Text style={styles.navigationTitle}>통계</Text>
            <View style={styles.betaBadge}>
              <Text style={styles.betaText}>BETA</Text>
            </View>
          </View>
          <LanguageSwitch style={styles.languageSwitch} />
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>아직 테이스팅 기록이 없습니다</Text>
          <Text style={styles.emptySubtext}>
            첫 테이스팅을 기록하면 통계를 볼 수 있습니다
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <View style={styles.titleContainer}>
          <Text style={styles.navigationTitle}>통계</Text>
          <View style={styles.betaBadge}>
            <Text style={styles.betaText}>BETA</Text>
          </View>
        </View>
        <LanguageSwitch style={styles.languageSwitch} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 게스트 모드 안내 */}
        {isGuestMode && (
          <View style={styles.guestNotice}>
            <Text style={styles.guestNoticeText}>🔍 게스트 모드로 둘러보는 중입니다</Text>
            <TouchableOpacity
              style={styles.loginPromptButton}
              onPress={() => navigation.navigate('Auth' as never)}
            >
              <Text style={styles.loginPromptText}>로그인하고 나만의 기록 시작하기 →</Text>
            </TouchableOpacity>
          </View>
        )}

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
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => {
              // 임시로 PersonalTasteDashboard로 이동 (추후 상세 분석 화면 구현 예정)
              navigation.navigate('Profile', { 
                screen: 'PersonalTasteDashboard' 
              });
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.moreButtonText}>더 자세한 분석 보기</Text>
            <Text style={styles.moreButtonSubtext}>감각평가, 맛프로필 차트 등</Text>
            <Text style={styles.moreButtonArrow}>→</Text>
          </TouchableOpacity>
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
  guestNotice: {
    backgroundColor: '#E3F2FD',
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    margin: HIGConstants.SPACING_LG,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HIGColors.blue,
  },
  guestNoticeText: {
    fontSize: 15,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  loginPromptButton: {
    paddingVertical: HIGConstants.SPACING_SM,
    paddingHorizontal: HIGConstants.SPACING_MD,
  },
  loginPromptText: {
    fontSize: 15,
    fontWeight: '600',
    color: HIGColors.blue,
  },
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