import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import LanguageSwitch from '../components/LanguageSwitch';
import { HIGConstants, HIGColors, commonButtonStyles, commonTextStyles } from '../styles/common';
import RealmService from '../services/realm/RealmService';
import { useUserStore } from '../stores/useUserStore';
import { ITastingRecord } from '../services/realm/schemas';
import { CoachInsightBanner } from '@/components/personalTaste';
import { usePersonalTaste, useLiteAICoach } from '@/hooks/usePersonalTaste';
import { CoachFeedbackModal } from '@/components/coach/CoachFeedbackModal';
import { LiteAICoachService } from '@/services/LiteAICoachService';
import { generateGuestMockData, generateGuestStats } from '../utils/guestMockData';

export default function HomeScreenEnhanced() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { currentUser } = useUserStore();
  
  // 게스트 모드 체크
  const isGuestMode = currentUser?.username === 'Guest' || !currentUser;
  
  // 게스트 모드일 때 mock 데이터 사용
  const guestMockData = isGuestMode ? generateGuestMockData() : [];
  const guestMockStats = isGuestMode ? generateGuestStats() : {
    thisWeekTastings: 0,
    currentStreak: 0,
    thisMonthNewCoffees: 0,
    avgScore: 0,
  };
  
  const [recentTastings, setRecentTastings] = useState<ITastingRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Personal taste hooks
  const { 
    tastePattern, 
    growthMetrics, 
    recommendations, 
    loading: tasteLoading,
    refresh: refreshTaste 
  } = usePersonalTaste();
  
  const { 
    dailyInsight, 
    learningPath,
    loading: coachLoading 
  } = useLiteAICoach();

  const [stats, setStats] = useState({
    thisWeekTastings: 0,
    currentStreak: 0,
    thisMonthNewCoffees: 0,
    avgScore: 0,
  });
  
  // AI Coach Modal state
  const [showCoachFeedback, setShowCoachFeedback] = useState(false);
  const [coachFeedback, setCoachFeedback] = useState<any>(null);
  

  const realmService = RealmService.getInstance();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      if (realmService.isInitialized) {
        const realm = realmService.getRealm();
        const allTastings = realm.objects<ITastingRecord>('TastingRecord').filtered('isDeleted = false').sorted('createdAt', true);
        
        const recent = Array.from(allTastings.slice(0, 3)) as ITastingRecord[];
        setRecentTastings(recent);
        
        const thisWeek = getThisWeekTastings(allTastings);
        const avgScore = allTastings.length > 0 ? allTastings.reduce((sum, t) => sum + (t.matchScoreTotal || 0), 0) / allTastings.length : 0;
        const currentStreak = calculateCurrentStreak(allTastings);
        const thisMonthNewCoffees = getThisMonthNewCoffees(allTastings);
        
        setStats({
          thisWeekTastings: thisWeek,
          currentStreak,
          thisMonthNewCoffees,
          avgScore: Math.round(avgScore),
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const getThisWeekTastings = (tastings: any) => {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    return tastings.filtered('createdAt >= $0', weekStart).length;
  };

  const calculateCurrentStreak = (tastings: any) => {
    // 연속 테이스팅 일수 계산 (간단 버전)
    if (tastings.length === 0) return 0;
    
    const sortedTastings = Array.from(tastings).sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const tasting of sortedTastings) {
      const tastingDate = new Date(tasting.createdAt);
      tastingDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - tastingDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }
    
    return streak;
  };

  const getThisMonthNewCoffees = (tastings: any) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthTastings = tastings.filtered('createdAt >= $0', monthStart);
    
    const uniqueCoffees = new Set();
    Array.from(thisMonthTastings).forEach((tasting: any) => {
      uniqueCoffees.add(`${tasting.roastery}-${tasting.coffeeName}`);
    });
    
    return uniqueCoffees.size;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadDashboardData(),
      refreshTaste(),
    ]);
    setRefreshing(false);
  };

  const handleNewTasting = () => {
    navigation.navigate('TastingFlow', { screen: 'CoffeeInfo' });
  };

  const handleViewHistory = () => {
    navigation.navigate('Journal');
  };

  const handleQuickStats = () => {
    navigation.navigate('Stats');
  };

  const handleTastingDetail = (tastingId: string) => {
    navigation.navigate('Journal', { screen: 'TastingDetail', params: { tastingId } });
  };

  const handleInsightAction = () => {
    // Navigate based on the insight's suggested action
    if (dailyInsight?.suggestedAction.includes('tasting')) {
      handleNewTasting();
    } else if (dailyInsight?.suggestedAction.includes('explore')) {
      navigation.navigate('PersonalTasteDashboard');
    } else {
      navigation.navigate('Journal');
    }
  };

  const handleViewPersonalDashboard = () => {
    navigation.navigate('PersonalTasteDashboard');
  };

  const renderRecentTasting = ({ item }: { item: ITastingRecord }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
    
    const handlePress = () => {
      if (isGuestMode) {
        // 게스트 모드에서는 Journal 탭으로 이동
        navigation.navigate('Journal');
      } else {
        // 일반 모드에서는 상세 화면으로 이동
        handleTastingDetail(item.id);
      }
    };
    
    return (
      <TouchableOpacity 
        style={styles.tastingCard} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.coffeeName}>{item.coffeeName}</Text>
          <View style={[styles.matchScoreContainer, {
            backgroundColor: item.matchScoreTotal >= 85 ? HIGColors.green : 
                           item.matchScoreTotal >= 70 ? HIGColors.orange : HIGColors.red
          }]}>
            <Text style={styles.matchScore}>{item.matchScoreTotal}%</Text>
          </View>
        </View>
        <Text style={styles.roasterName}>{item.roastery}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </TouchableOpacity>
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <View style={styles.titleContainer}>
          <Text style={styles.navigationTitle}>Coffee Journey</Text>
          <View style={styles.betaBadge}>
            <Text style={styles.betaText}>BETA</Text>
          </View>
        </View>
        <LanguageSwitch style={styles.languageSwitch} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Simplified Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>안녕하세요, {currentUser?.username || 'Guest'}님!</Text>
            
            {/* 게스트 모드 안내 - 더 눈에 띄게 */}
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
          </View>

          {/* Today's Mission - NEW */}
          {!isGuestMode && (
            <View style={styles.todayMission}>
              <View style={styles.missionHeader}>
                <Text style={styles.missionTitle}>🎯 오늘의 미션</Text>
                <Text style={styles.missionReward}>+10 EXP</Text>
              </View>
              <Text style={styles.missionDescription}>
                {dailyInsight ? dailyInsight.content : "새로운 커피를 테이스팅하고 향미를 3개 이상 찾아보세요"}
              </Text>
              <TouchableOpacity 
                style={styles.missionButton}
                onPress={handleNewTasting}
              >
                <Text style={styles.missionButtonText}>미션 시작 →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Big Primary Action Button */}
          <TouchableOpacity 
            style={styles.bigActionButton}
            onPress={handleNewTasting}
            activeOpacity={0.8}
          >
            <Text style={styles.bigActionEmoji}>☕</Text>
            <Text style={styles.bigActionText}>커피 기록하기</Text>
            <Text style={styles.bigActionSubtext}>새로운 커피를 테이스팅해보세요</Text>
          </TouchableOpacity>

          {/* Quick Stats Summary */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{isGuestMode ? guestMockStats.thisWeekTastings : stats.thisWeekTastings}</Text>
              <Text style={styles.quickStatLabel}>이번주</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>
                {isGuestMode ? 3 : (stats.currentStreak || 0)}
              </Text>
              <Text style={styles.quickStatLabel}>연속일</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>
                {isGuestMode ? 5 : (stats.thisMonthNewCoffees || 0)}
              </Text>
              <Text style={styles.quickStatLabel}>신규 커피</Text>
            </View>
          </View>

          {/* Recent Records Section - Simplified */}
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최근 기록</Text>
              <TouchableOpacity onPress={handleViewHistory}>
                <Text style={styles.seeAllText}>전체 보기 →</Text>
              </TouchableOpacity>
            </View>

            {(isGuestMode ? guestMockData.slice(0, 2) : recentTastings.slice(0, 2)).length > 0 ? (
              <FlatList
                data={isGuestMode ? guestMockData.slice(0, 2) : recentTastings.slice(0, 2)}
                renderItem={renderRecentTasting}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>☕</Text>
                <Text style={styles.emptyStateText}>아직 기록이 없어요</Text>
                <Text style={styles.emptyStateSubtext}>첫 커피를 기록해보세요!</Text>
              </View>
            )}
          </View>

        </View>
      </ScrollView>
      
      {/* AI Coach Feedback Modal */}
      <CoachFeedbackModal
        visible={showCoachFeedback}
        feedback={coachFeedback}
        onClose={() => {
          setShowCoachFeedback(false);
          setCoachFeedback(null);
        }}
        onAction={(action) => {
          switch (action) {
            case '테이스팅 시작하기':
            case 'start-tasting':
              setShowCoachFeedback(false);
              handleNewTasting();
              break;
            case 'practice-flavors':
              setShowCoachFeedback(false);
              navigation.navigate('FlavorQuiz' as never);
              break;
            case 'view-progress':
              setShowCoachFeedback(false);
              handleViewPersonalDashboard();
              break;
            case 'ask-question':
              // TODO: Implement chat with AI coach
              Alert.alert('준비 중', 'AI 코치와의 대화 기능은 곧 추가될 예정입니다!');
              break;
          }
        }}
      />
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
  languageSwitch: {},
  insightBanner: {
    marginTop: HIGConstants.SPACING_SM,
  },
  content: {
    flex: 1,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  welcomeSection: {
    paddingTop: HIGConstants.SPACING_LG,
    paddingBottom: HIGConstants.SPACING_SM,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_MD,
  },
  
  // Today's Mission Styles
  todayMission: {
    backgroundColor: '#FFF3E0',
    borderRadius: HIGConstants.BORDER_RADIUS * 1.5,
    padding: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_LG,
    borderWidth: 1,
    borderColor: HIGColors.orange,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: HIGColors.label,
  },
  missionReward: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.orange,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
    borderRadius: 12,
  },
  missionDescription: {
    fontSize: 15,
    color: HIGColors.secondaryLabel,
    lineHeight: 20,
    marginBottom: HIGConstants.SPACING_MD,
  },
  missionButton: {
    alignSelf: 'flex-end',
  },
  missionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: HIGColors.orange,
  },
  
  // Big Action Button Styles
  bigActionButton: {
    backgroundColor: HIGColors.accent,
    borderRadius: HIGConstants.BORDER_RADIUS * 2,
    padding: HIGConstants.SPACING_XL,
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_LG,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  bigActionEmoji: {
    fontSize: 48,
    marginBottom: HIGConstants.SPACING_SM,
  },
  bigActionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: HIGConstants.SPACING_XS,
  },
  bigActionSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  
  // Quick Stats Styles
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_LG,
    borderWidth: 1,
    borderColor: HIGColors.gray4,
  },
  quickStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
  },
  quickStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: HIGColors.gray4,
  },
  journeyProgress: {
    width: '100%',
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  tasteProfile: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
  },
  levelBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.white,
    backgroundColor: HIGColors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: HIGColors.gray5,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: HIGConstants.SPACING_XS,
  },
  progressFill: {
    height: '100%',
    backgroundColor: HIGColors.accent,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
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
    fontWeight: '400',
    color: HIGColors.blue,
  },
  recentSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  tastingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
    minHeight: 60,
    borderWidth: 1,
    borderColor: HIGColors.purple + '20',
    shadowColor: HIGColors.purple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
    paddingVertical: HIGConstants.SPACING_XL,
    backgroundColor: '#F5F5F5',
    borderRadius: HIGConstants.BORDER_RADIUS,
    marginTop: HIGConstants.SPACING_SM,
  },
  emptyStateEmoji: {
    fontSize: 36,
    marginBottom: HIGConstants.SPACING_SM,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_XS,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
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