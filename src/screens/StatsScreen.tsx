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
import { Colors } from '../constants/colors';
import { HIGConstants, HIGColors } from '../styles/common';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from 'react-native-chart-kit';

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

interface FlavorProfile {
  flavor: string;
  count: number;
  percentage: number;
}

interface TastingTrend {
  date: string;
  count: number;
  avgScore: number;
}

interface SensoryData {
  body: number;
  acidity: number;
  sweetness: number;
  finish: number;
  mouthfeel: number;
}

const StatsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [topRoasters, setTopRoasters] = useState<TopRoaster[]>([]);
  const [topCoffees, setTopCoffees] = useState<TopCoffee[]>([]);
  const [topCafes, setTopCafes] = useState<TopCafe[]>([]);
  const [flavorProfile, setFlavorProfile] = useState<FlavorProfile[]>([]);
  const [tastingTrend, setTastingTrend] = useState<TastingTrend[]>([]);
  const [sensoryData, setSensoryData] = useState<SensoryData | null>(null);

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
  
  const loadSensoryAverages = async (): Promise<SensoryData | null> => {
    try {
      const realmService = RealmService.getInstance();
      const tastings = realmService.getTastingRecords({ isDeleted: false });
      
      if (tastings.length === 0) return null;
      
      let totalBody = 0, totalAcidity = 0, totalSweetness = 0, totalFinish = 0, totalMouthfeel = 0;
      let count = 0;
      
      tastings.forEach(tasting => {
        if (tasting.sensoryAttribute) {
          totalBody += tasting.sensoryAttribute.body || 0;
          totalAcidity += tasting.sensoryAttribute.acidity || 0;
          totalSweetness += tasting.sensoryAttribute.sweetness || 0;
          totalFinish += tasting.sensoryAttribute.finish || 0;
          totalMouthfeel += tasting.sensoryAttribute.mouthfeel || 0;
          count++;
        }
      });
      
      if (count === 0) return null;
      
      return {
        body: totalBody / count,
        acidity: totalAcidity / count,
        sweetness: totalSweetness / count,
        finish: totalFinish / count,
        mouthfeel: totalMouthfeel / count
      };
    } catch (error) {
      // console.error('Failed to load sensory averages:', error);
      return null;
    }
  };

  const loadStatistics = async () => {
    try {
      const realmService = RealmService.getInstance();
      
      // Load all statistics
      const basicStats = realmService.getStatistics();
      const roasters = realmService.getTopRoasters(5);
      const coffees = realmService.getTopCoffees(5);
      const cafes = realmService.getTopCafes(5);
      const flavors = realmService.getFlavorProfile();
      
      // Load chart data
      const trends = await loadTastingTrends();
      const sensoryAvg = await loadSensoryAverages();

      setStats(basicStats);
      setTopRoasters(roasters);
      setTopCoffees(coffees);
      setTopCafes(cafes);
      setFlavorProfile(flavors);
      setTastingTrend(trends);
      setSensoryData(sensoryAvg);
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
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>통계를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats || stats.totalTastings === 0) {
    return (
      <SafeAreaView style={styles.container}>
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>나의 커피 통계</Text>
          <Text style={styles.headerSubtitle}>커피 여정을 한눈에</Text>
        </View>

        {/* Personal Taste Journey Button */}
        <TouchableOpacity 
          style={styles.personalTasteButton}
          onPress={() => navigation.navigate('PersonalTaste' as never)}
          activeOpacity={0.8}
        >
          <View style={styles.personalTasteContent}>
            <Text style={styles.personalTasteIcon}>🎯</Text>
            <View style={styles.personalTasteText}>
              <Text style={styles.personalTasteTitle}>Personal Taste Journey</Text>
              <Text style={styles.personalTasteSubtitle}>나만의 커피 취향 분석과 성장 기록</Text>
            </View>
            <Text style={styles.personalTasteArrow}>→</Text>
          </View>
        </TouchableOpacity>

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

        {/* 감각 평가 레이더 차트 */}
        {sensoryData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 감각 평가 평균</Text>
            <View style={styles.chartCard}>
              <ProgressChart
                data={{
                  labels: ["바디", "산미", "단맛", "여운", "질감"],
                  data: [
                    sensoryData.body / 5,
                    sensoryData.acidity / 5,
                    sensoryData.sweetness / 5,
                    sensoryData.finish / 5,
                    sensoryData.mouthfeel / 5
                  ]
                }}
                width={screenWidth - 32}
                height={220}
                strokeWidth={16}
                radius={32}
                chartConfig={{
                  backgroundColor: HIGColors.secondarySystemBackground,
                  backgroundGradientFrom: HIGColors.secondarySystemBackground,
                  backgroundGradientTo: HIGColors.secondarySystemBackground,
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(60, 60, 67, ${opacity})`,
                  style: {
                    borderRadius: HIGConstants.BORDER_RADIUS,
                  },
                }}
                style={styles.chart}
              />
            </View>
          </View>
        )}

        {/* 맛 프로필 파이 차트 */}
        {flavorProfile.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ 나의 맛 프로필</Text>
            <View style={styles.chartCard}>
              <PieChart
                data={flavorProfile.slice(0, 5).map((flavor, index) => ({
                  name: flavor.flavor,
                  population: flavor.count,
                  color: [
                    '#3498db',
                    '#e74c3c',
                    '#2ecc71',
                    '#f39c12',
                    '#9b59b6'
                  ][index % 5],
                  legendFontColor: HIGColors.label,
                  legendFontSize: 14,
                }))}
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
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                style={styles.chart}
              />
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
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
    backgroundColor: HIGColors.systemBackground,
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
  personalTasteButton: {
    marginHorizontal: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_LG,
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS_LG,
    padding: HIGConstants.SPACING_LG,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  personalTasteContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personalTasteIcon: {
    fontSize: 36,
    marginRight: HIGConstants.SPACING_MD,
  },
  personalTasteText: {
    flex: 1,
  },
  personalTasteTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  personalTasteSubtitle: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
  },
  personalTasteArrow: {
    fontSize: 24,
    color: HIGColors.tertiaryLabel,
    marginLeft: HIGConstants.SPACING_SM,
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
});

export default StatsScreen;