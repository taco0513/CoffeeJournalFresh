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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '../components/LanguageSwitch';
import { HIGConstants, HIGColors, commonButtonStyles, commonTextStyles } from '../styles/common';
import RealmService from '../services/realm/RealmService';
import { useUserStore } from '../stores/useUserStore';
import { ITastingRecord } from '../services/realm/schemas';
import { useCoffeeNotifications } from '../hooks/useCoffeeNotifications';
import { CoffeeDiscoveryAlert } from '../components/CoffeeDiscoveryAlert';
import { generateGuestMockData, generateGuestStats } from '../utils/guestMockData';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({navigation}: HomeScreenProps) {
  const { t } = useTranslation();
  const { currentUser } = useUserStore();
  
  // 게스트 모드 체크
  const isGuestMode = currentUser?.username === 'Guest' || !currentUser;
  
  // 게스트 모드일 때 mock 데이터 사용
  const guestMockData = isGuestMode ? generateGuestMockData() : [];
  const guestMockStats = isGuestMode ? generateGuestStats() : {
    totalTastings: 0,
    thisWeekTastings: 0,
    avgScore: 0,
    bestScore: 0,
  };
  
  const [recentTastings, setRecentTastings] = useState<ITastingRecord[]>([]);
  const [stats, setStats] = useState({
    totalTastings: 0,
    thisWeekTastings: 0,
    avgScore: 0,
    bestScore: 0,
  });
  
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
  useEffect(() => {
    Alert.alert('HomeScreen', 'HomeScreen mounted!');
  }, []);
  
  // currentUser 변경 시 실행
  useEffect(() => {
    if (currentUser) {
      Alert.alert(
        'User Changed',
        `Username: ${currentUser.username}\nIsGuest: ${currentUser.username === 'Guest'}`
      );
    } else {
      Alert.alert('User Changed', 'currentUser is null');
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      // 게스트 모드 강제 체크 - currentUser가 Guest이거나 없는 경우
      const isGuest = currentUser?.username === 'Guest' || !currentUser;
      
      if (isGuest) {
        // 게스트용 mock 데이터 강제 로딩
        const mockData = generateGuestMockData();
        const mockStats = generateGuestStats();
        
        // 상태 강제 업데이트
        setRecentTastings([...mockData.slice(0, 3)]);
        setStats({...mockStats});
        return;
      }
      
      if (realmService.isInitialized) {
        const realm = realmService.getRealm();
        const allTastings = realm.objects('TastingRecord').filtered('isDeleted = false').sorted('createdAt', true);
        
        // 최근 3개 테이스팅
        const recent = Array.from(allTastings.slice(0, 3));
        setRecentTastings(recent);
        
        // 통계 계산
        const total = allTastings.length;
        const thisWeek = getThisWeekTastings(allTastings);
        const avgScore = total > 0 ? allTastings.reduce((sum, t) => sum + t.matchScoreTotal, 0) / total : 0;
        const bestScore = total > 0 ? Math.max(...allTastings.map(t => t.matchScoreTotal)) : 0;
        
        setStats({
          totalTastings: total,
          thisWeekTastings: thisWeek,
          avgScore: Math.round(avgScore),
          bestScore,
        });
      }
    } catch (error) {
      // console.error('Error loading dashboard data:', error);
    }
  };

  const getThisWeekTastings = (tastings: any) => {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    return tastings.filtered('createdAt >= $0', weekStart).length;
  };

  const handleNewTasting = () => {
    // 게스트 모드 체크
    if (!currentUser || currentUser.username === 'Guest') {
      Alert.alert(
        '로그인 필요',
        '테이스팅 기록을 저장하려면 로그인이 필요합니다.',
        [
          { text: '취소', style: 'cancel' },
          { text: '로그인', onPress: () => navigation.navigate('Auth' as never) }
        ]
      );
      return;
    }
    navigation.navigate('TastingFlow' as never, { screen: 'CoffeeInfo' } as never);
  };

  const handleViewHistory = () => {
    navigation.navigate('Journal' as never);
  };

  const handleQuickStats = () => {
    navigation.navigate('Stats' as never);
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
      >
        <View style={styles.cardHeader}>
          <Text style={styles.coffeeName}>{item.coffeeName}</Text>
          <View style={[styles.matchScoreContainer, {
            backgroundColor: item.matchScoreTotal >= 85 ? HIGColors.green : 
                           item.matchScoreTotal >= 70 ? HIGColors.orange : HIGColors.red
          }]}>
            <Text style={styles.matchScore}>{item.matchScoreTotal}</Text>
          </View>
        </View>
        <Text style={styles.roasterName}>{item.roastery}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
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
        <LanguageSwitch style={styles.languageSwitch} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 메인 컨텐츠 */}
        <View style={styles.content}>
          {/* 환영 메시지 */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>안녕하세요, {currentUser?.username || 'Guest'}님!</Text>
            <Text style={styles.welcomeSubtitle}>오늘도 좋은 커피 한 잔 어떠세요?</Text>
            {/* 디버깅용 텍스트 */}
            <Text style={{fontSize: 12, color: 'red', marginTop: 10}}>
              Debug: isGuestMode={isGuestMode.toString()}, username={currentUser?.username || 'null'}
            </Text>
            <Text style={{fontSize: 12, color: 'red'}}>
              Mock data count: {guestMockData.length}
            </Text>
          </View>

          {/* 게스트 모드 안내 */}
          {(!currentUser || currentUser.username === 'Guest') && (
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

          {/* 관리자 버튼 */}
          {isAdmin && (
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => navigation.navigate('AdminDashboard' as never)}
            >
              <Text style={styles.adminButtonText}>🔧 관리자 대시보드</Text>
            </TouchableOpacity>
          )}

          {/* 통계 요약 카드 */}
          <View style={styles.statsOverview}>
            <TouchableOpacity style={styles.statCard} onPress={handleQuickStats}>
              <Text style={styles.statValue}>{isGuestMode ? guestMockStats.totalTastings : stats.totalTastings}</Text>
              <Text style={styles.statLabel}>총 테이스팅</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard} onPress={handleQuickStats}>
              <Text style={styles.statValue}>{isGuestMode ? guestMockStats.thisWeekTastings : stats.thisWeekTastings}</Text>
              <Text style={styles.statLabel}>이번 주</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard} onPress={handleQuickStats}>
              <Text style={styles.statValue}>{isGuestMode ? guestMockStats.avgScore : stats.avgScore}</Text>
              <Text style={styles.statLabel}>평균 점수</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard} onPress={handleQuickStats}>
              <Text style={styles.statValue}>{isGuestMode ? guestMockStats.bestScore : stats.bestScore}</Text>
              <Text style={styles.statLabel}>최고 점수</Text>
            </TouchableOpacity>
          </View>

          {/* 빠른 액션 버튼들 */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[commonButtonStyles.buttonPrimary, styles.primaryAction]}
              onPress={handleNewTasting}
              activeOpacity={0.8}
            >
              <Text style={[commonTextStyles.buttonText, styles.primaryActionText]}>
                ☕ 새 테이스팅 시작
              </Text>
            </TouchableOpacity>
          </View>

          {/* 최근 기록 섹션 */}
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최근 기록</Text>
              <TouchableOpacity onPress={handleViewHistory}>
                <Text style={styles.seeAllText}>전체 보기</Text>
              </TouchableOpacity>
            </View>

            {(isGuestMode ? guestMockData.slice(0, 3) : recentTastings).length > 0 ? (
              <FlatList
                data={isGuestMode ? guestMockData.slice(0, 3) : recentTastings}
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
    paddingTop: HIGConstants.SPACING_LG,
    paddingBottom: HIGConstants.SPACING_LG,
    alignItems: 'center',
  },
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: HIGConstants.SPACING_LG,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#E8F5E8',
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    alignItems: 'center',
    marginHorizontal: HIGConstants.SPACING_XS,
    borderWidth: 1,
    borderColor: HIGColors.green,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.blue,
    marginBottom: HIGConstants.SPACING_XS,
  },
  statLabel: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
  },
  quickActions: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  primaryAction: {
    width: '100%',
    marginBottom: HIGConstants.SPACING_MD,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_XS,
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
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
    fontSize: 15,
    fontWeight: '600',
    color: HIGColors.label,
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '400',
    color: HIGColors.blue,
  },
  tastingCard: {
    backgroundColor: '#FFF8DC',
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
    minHeight: 60, // HIG 최소 터치 영역 보장
    borderWidth: 1,
    borderColor: '#DEB887',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_XS,
  },
  coffeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    flex: 1,
  },
  matchScoreContainer: {
    backgroundColor: HIGColors.green,
    borderRadius: 12,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
  },
  matchScore: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  roasterName: {
    fontSize: 14,
    fontWeight: '400',
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
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  emptyStateSubtext: {
    fontSize: 15,
    fontWeight: '400',
    color: HIGColors.tertiaryLabel,
    textAlign: 'center',
    lineHeight: 20,
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
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_LG,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HIGColors.orange,
  },
  adminButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  
  // Guest Mode Styles
  guestNotice: {
    backgroundColor: '#E3F2FD',
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_LG,
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
});