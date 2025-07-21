import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { HIGConstants, HIGColors, commonButtonStyles, commonTextStyles } from '../styles/common';
import RealmService from '../services/realm/RealmService';
import { useUserStore } from '../stores/useUserStore';
import { ITastingRecord } from '../services/realm/schemas';
import { useCoffeeNotifications } from '../hooks/useCoffeeNotifications';
import { CoffeeDiscoveryAlert } from '../components/CoffeeDiscoveryAlert';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({navigation}: HomeScreenProps) {
  const { t } = useTranslation();
  const { currentUser } = useUserStore();
  
  
  const [recentTastings, setRecentTastings] = useState<ITastingRecord[]>([]);
  const [stats, setStats] = useState({
    totalTastings: 0,
    totalRoasteries: 0,
    thisWeekTastings: 0,
    avgScore: 0,
    bestScore: 0,
    newCoffeesThisMonth: 0,
  });
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

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  // 컴포넌트 마운트 시에도 실행
  useEffect(() => {
    loadDashboardData();
  }, []);

  // 디버깅용 useEffect - 컴포넌트 마운트 시 실행

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (realmService.isInitialized) {
        const realm = realmService.getRealm();
        const allTastings = realm.objects<ITastingRecord>('TastingRecord').filtered('isDeleted = false').sorted('createdAt', true);
        
        // 최근 3개 테이스팅
        const recent = Array.from(allTastings.slice(0, 3)) as ITastingRecord[];
        setRecentTastings(recent);
        
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
        
        setStats({
          totalTastings: total,
          totalRoasteries: uniqueRoasteries.size,
          thisWeekTastings: thisWeek,
          avgScore: Math.round(avgScore),
          bestScore,
          newCoffeesThisMonth: newCoffees,
        });
      }
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

  const handleNewTasting = () => {
    navigation.navigate('TastingFlow' as never, { screen: 'CoffeeInfo' } as never);
  };

  const handleViewHistory = () => {
    navigation.navigate('Journal' as never);
  };

  const handleQuickStats = () => {
    navigation.navigate('Journal' as never, { initialTab: 'stats' } as never);
  };

  const handleTastingDetail = (tastingId: string) => {
    navigation.navigate('Journal' as never, { screen: 'TastingDetail', params: { tastingId } } as never);
  };

  const renderRecentTasting = ({ item }: { item: ITastingRecord }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
    
    return (
      <TouchableOpacity 
        style={styles.tastingCard} 
        onPress={() => handleTastingDetail(item.id)}
        activeOpacity={0.7}
        accessible={true}
        accessibilityLabel={`${item.coffeeName}, ${item.roastery}, 점수 ${item.matchScoreTotal}점, ${formattedDate}`}
        accessibilityHint="탭하여 상세 정보를 확인합니다"
        accessibilityRole="button"
      >
        <View style={styles.cardHeader}>
          <Text style={styles.coffeeName}>{item.coffeeName}</Text>
          <View style={[styles.matchScoreContainer, {
            backgroundColor: item.matchScoreTotal >= 85 ? HIGColors.green : 
                           item.matchScoreTotal >= 70 ? HIGColors.orange : HIGColors.red
          }]}>
            <Text style={styles.matchScore} accessibilityElementsHidden={true}>{item.matchScoreTotal}</Text>
          </View>
        </View>
        <Text style={styles.roasterName} accessibilityElementsHidden={true}>{item.roastery}</Text>
        <Text style={styles.date} accessibilityElementsHidden={true}>{formattedDate}</Text>
      </TouchableOpacity>
    );
  };

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
          <Text style={styles.navigationTitle}>Coffee Journal</Text>
          <View style={styles.betaBadge}>
            <Text style={styles.betaText}>BETA</Text>
          </View>
        </View>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 메인 컨텐츠 */}
        <View style={styles.content}>
          {/* 환영 메시지 */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>안녕하세요, {currentUser?.username || 'User'}님!</Text>
            <Text style={styles.welcomeSubtitle}>오늘도 좋은 커피 한 잔 어떠세요?</Text>
          </View>

          {/* 로딩 상태 */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={HIGColors.blue} />
              <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
            </View>
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

          {/* 통계 요약 카드 - MVP 2개로 단순화 */}
          <View style={styles.statsOverview}>
            <TouchableOpacity 
              style={styles.statCard} 
              onPress={handleQuickStats}
              accessible={true}
              accessibilityLabel={`나의 커피 기록 ${stats.totalTastings || 0}개`}
              accessibilityHint="탭하여 상세 통계를 확인합니다"
              accessibilityRole="button"
            >
              <Text style={styles.statValue}>{stats.totalTastings || 0}</Text>
              <Text style={styles.statLabel}>나의 커피 기록</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statCard} 
              onPress={handleQuickStats}
              accessible={true}
              accessibilityLabel={`발견한 로스터리 ${stats.totalRoasteries || 0}곳`}
              accessibilityHint="탭하여 상세 통계를 확인합니다"
              accessibilityRole="button"
            >
              <Text style={styles.statValue}>{stats.totalRoasteries || 0}</Text>
              <Text style={styles.statLabel}>발견한 로스터리</Text>
            </TouchableOpacity>
          </View>

          {/* 빠른 액션 버튼 */}
          <TouchableOpacity 
            style={styles.primaryActionCard}
            onPress={handleNewTasting}
            activeOpacity={0.8}
            accessible={true}
            accessibilityLabel="커피 기록하기"
            accessibilityHint="탭하여 새로운 커피 테이스팅을 기록합니다"
            accessibilityRole="button"
          >
            <Text style={styles.primaryActionTitle}>커피 기록하기</Text>
            <Text style={styles.primaryActionSubtitle}>새로운 커피를 테이스팅해보세요</Text>
          </TouchableOpacity>

          {/* 최근 기록 섹션 */}
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최근 기록</Text>
              <TouchableOpacity 
                onPress={handleViewHistory}
                accessible={true}
                accessibilityLabel="전체 기록 보기"
                accessibilityHint="탭하여 모든 커피 기록을 확인합니다"
                accessibilityRole="button"
              >
                <Text style={styles.seeAllText}>전체 보기</Text>
              </TouchableOpacity>
            </View>

            {recentTastings.length > 0 ? (
              <FlatList
                data={recentTastings}
                renderItem={renderRecentTasting}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>첫 테이스팅을 시작해보세요!</Text>
                <Text style={styles.emptyStateSubtext}>위의 버튼을 눌러 새로운 커피를 평가해보세요</Text>
              </View>
            )}
          </View>
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
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  scrollView: {
    flex: 1,
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
  languageSwitch: {
    // 언어 스위치 스타일은 컴포넌트 내부에서 관리
  },
  content: {
    flex: 1,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  welcomeSection: {
    paddingTop: HIGConstants.SPACING_MD,
    paddingBottom: HIGConstants.SPACING_LG,
  },
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: HIGConstants.SPACING_XL,
    paddingHorizontal: HIGConstants.SPACING_LG,
    gap: HIGConstants.SPACING_MD,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_XL,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    minHeight: 110,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: HIGConstants.SPACING_SM,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
    lineHeight: 18,
  },
  primaryActionCard: {
    backgroundColor: HIGColors.blue,
    borderRadius: 16,
    padding: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_XL,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryActionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: HIGColors.white,
    marginBottom: HIGConstants.SPACING_XS,
  },
  primaryActionSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: HIGColors.secondaryLabel,
  },
  recentSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_MD,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: HIGColors.blue,
  },
  tastingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_MD,
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_XS,
  },
  coffeeName: {
    fontSize: 17,
    fontWeight: '700',
    color: HIGColors.label,
    flex: 1,
    letterSpacing: 0.1,
  },
  matchScoreContainer: {
    backgroundColor: HIGColors.green,
    borderRadius: 14,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: 6,
    minWidth: 44,
    alignItems: 'center',
  },
  matchScore: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  roasterName: {
    fontSize: 15,
    fontWeight: '500',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
  },
  date: {
    fontSize: 12,
    fontWeight: '400',
    color: HIGColors.tertiaryLabel,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_XL * 2,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_SM,
    letterSpacing: 0.1,
  },
  emptyStateSubtext: {
    fontSize: 15,
    fontWeight: '500',
    color: HIGColors.tertiaryLabel,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Coffee Discovery Styles
  discoverySection: {
    backgroundColor: '#F3E5F5',
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_LG,
    borderWidth: 1,
    borderColor: HIGColors.purple,
  },
  discoverySectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
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
  
  // Admin Button
  adminButton: {
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_LG,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HIGColors.orange,
    shadowColor: HIGColors.orange,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  adminButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: HIGColors.label,
    letterSpacing: 0.2,
  },
  
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_XL * 3,
  },
  loadingText: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    marginTop: HIGConstants.SPACING_MD,
  },
  errorContainer: {
    backgroundColor: '#FEE',
    borderRadius: 16,
    padding: HIGConstants.SPACING_LG,
    marginVertical: HIGConstants.SPACING_LG,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCC',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: HIGConstants.SPACING_MD,
  },
  errorText: {
    fontSize: 16,
    color: HIGColors.red,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_LG,
  },
  retryButton: {
    backgroundColor: HIGColors.red,
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.BORDER_RADIUS,
  },
  retryButtonText: {
    color: HIGColors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});