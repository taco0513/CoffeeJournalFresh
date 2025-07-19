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
import LiteAICoachService from '@/services/LiteAICoachService';

export default function HomeScreenEnhanced() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { currentUser } = useUserStore();
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
    totalTastings: 0,
    thisWeekTastings: 0,
    avgScore: 0,
    bestScore: 0,
  });
  
  // AI Coach Modal state
  const [showCoachFeedback, setShowCoachFeedback] = useState(false);
  const [coachFeedback, setCoachFeedback] = useState(null);

  const realmService = RealmService.getInstance();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      if (realmService.isInitialized) {
        const realm = realmService.getRealm();
        const allTastings = realm.objects('TastingRecord').filtered('isDeleted = false').sorted('createdAt', true);
        
        const recent = Array.from(allTastings.slice(0, 3));
        setRecentTastings(recent);
        
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
      console.error('Error loading dashboard data:', error);
    }
  };

  const getThisWeekTastings = (tastings: any) => {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    return tastings.filtered('createdAt >= $0', weekStart).length;
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

  const renderRecommendation = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.recommendationCard} activeOpacity={0.8}>
      <View style={styles.recommendationHeader}>
        <Text style={styles.recommendationScore}>{item.matchScore}%</Text>
        <Text style={styles.recommendationMatch}>match</Text>
      </View>
      <Text style={styles.recommendationCoffee}>{item.coffeeName}</Text>
      <Text style={styles.recommendationRoaster}>{item.roasterName}</Text>
      <Text style={styles.recommendationReason}>{item.reason}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <View style={styles.titleContainer}>
          <Text style={styles.navigationTitle}>Coffee Journey</Text>
          <View style={styles.betaBadge}>
            <Text style={styles.betaText}>v0.4</Text>
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
        {/* AI Coach Daily Insight */}
        {dailyInsight && !coachLoading && (
          <CoachInsightBanner
            insight={dailyInsight}
            onAction={handleInsightAction}
            style={styles.insightBanner}
          />
        )}

        <View style={styles.content}>
          {/* Welcome Section with Journey Progress */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>안녕하세요, {currentUser?.username || 'Guest'}님!</Text>
            
            {tastePattern && (
              <TouchableOpacity 
                style={styles.journeyProgress}
                onPress={handleViewPersonalDashboard}
                activeOpacity={0.8}
              >
                <View style={styles.progressHeader}>
                  <Text style={styles.tasteProfile}>{tastePattern.tasteProfile}</Text>
                  <Text style={styles.levelBadge}>Lv.{growthMetrics?.vocabularyGrowth || 1}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(growthMetrics?.weeklyProgress || 0)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  이번 주 {growthMetrics?.weeklyProgress || 0}% 달성
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Enhanced Stats Overview */}
          <View style={styles.statsOverview}>
            <TouchableOpacity style={styles.statCard} onPress={handleQuickStats}>
              <Text style={styles.statValue}>{stats.totalTastings}</Text>
              <Text style={styles.statLabel}>총 테이스팅</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard} onPress={handleQuickStats}>
              <Text style={styles.statValue}>{stats.thisWeekTastings}</Text>
              <Text style={styles.statLabel}>이번 주</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard} onPress={handleViewPersonalDashboard}>
              <Text style={styles.statValue}>
                {tastePattern ? tastePattern.dominantFlavors.length : 0}
              </Text>
              <Text style={styles.statLabel}>발견한 향미</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard} onPress={handleViewPersonalDashboard}>
              <Text style={styles.statValue}>
                {growthMetrics ? Math.round(growthMetrics.accuracyImprovement) : 0}%
              </Text>
              <Text style={styles.statLabel}>성장률</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
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

            <View style={styles.secondaryActions}>
              <TouchableOpacity 
                style={styles.secondaryAction}
                onPress={() => navigation.navigate('FlavorQuiz')}
                activeOpacity={0.8}
              >
                <Text style={styles.actionIcon}>🎯</Text>
                <Text style={styles.secondaryActionText}>향미 퀴즈</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryAction}
                onPress={handleViewPersonalDashboard}
                activeOpacity={0.8}
              >
                <Text style={styles.actionIcon}>📊</Text>
                <Text style={styles.secondaryActionText}>내 취향 분석</Text>
              </TouchableOpacity>
            </View>

            {/* AI Coach Button */}
            <TouchableOpacity 
              style={[styles.aiCoachButton]}
              onPress={async () => {
                // Generate AI coach feedback
                if (recentTastings.length > 0) {
                  const feedback = await LiteAICoachService.provideFeedback(recentTastings[0]);
                  setCoachFeedback(feedback);
                  setShowCoachFeedback(true);
                } else {
                  // Show welcome message if no tastings yet
                  const welcomeFeedback = {
                    overall: 'improving',
                    matchScore: 0,
                    encouragement: '안녕하세요! 저는 당신의 AI 커피 코치입니다. 첫 테이스팅을 시작해보세요!',
                    strengths: ['열정적인 시작', '배움에 대한 의지'],
                    improvements: ['첫 테이스팅 기록하기', '향미 표현 연습하기'],
                    tips: [{
                      id: 'welcome-tip',
                      type: 'taste' as const,
                      content: '커피를 테이스팅할 때는 온도가 변함에 따라 향미가 어떻게 변하는지 주목해보세요.',
                      action: '테이스팅 시작하기',
                      level: 'beginner' as const,
                    }],
                  };
                  setCoachFeedback(welcomeFeedback);
                  setShowCoachFeedback(true);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.aiCoachIcon}>🤖</Text>
              <Text style={styles.aiCoachButtonText}>AI 코치와 대화하기</Text>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* AI Recommendations */}
          {recommendations.length > 0 && (
            <View style={styles.recommendationsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>AI 추천 커피</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Recommendations')}>
                  <Text style={styles.seeAllText}>전체 보기</Text>
                </TouchableOpacity>
              </View>
              
              <FlatList
                horizontal
                data={recommendations.slice(0, 3)}
                renderItem={renderRecommendation}
                keyExtractor={(item, index) => `rec-${index}`}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recommendationsList}
              />
            </View>
          )}

          {/* Recent Records Section */}
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최근 기록</Text>
              <TouchableOpacity onPress={handleViewHistory}>
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
                <Text style={styles.emptyStateSubtext}>AI 코치가 당신의 커피 여정을 도와드릴게요</Text>
              </View>
            )}
          </View>

          {/* Learning Path Preview */}
          {learningPath && (
            <TouchableOpacity 
              style={styles.learningPathCard}
              onPress={() => navigation.navigate('LearningPath')}
              activeOpacity={0.8}
            >
              <View style={styles.learningPathHeader}>
                <Text style={styles.learningPathTitle}>오늘의 학습</Text>
                <Text style={styles.learningPathTime}>{learningPath.estimatedTime}</Text>
              </View>
              <Text style={styles.learningPathFocus}>
                집중 영역: {learningPath.currentFocus}
              </Text>
              <Text style={styles.learningPathGoal}>
                목표: {learningPath.nextMilestone}
              </Text>
              <View style={styles.learningPathCTA}>
                <Text style={styles.learningPathCTAText}>시작하기</Text>
                <Text style={styles.learningPathArrow}>→</Text>
              </View>
            </TouchableOpacity>
          )}
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
    backgroundColor: HIGColors.systemBackground,
  },
  navigationBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: HIGColors.systemBackground,
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
    paddingBottom: HIGConstants.SPACING_LG,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_MD,
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
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: HIGConstants.SPACING_LG,
  },
  statCard: {
    flex: 1,
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    alignItems: 'center',
    marginHorizontal: HIGConstants.SPACING_XS,
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
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: HIGConstants.SPACING_SM,
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    gap: HIGConstants.SPACING_SM,
  },
  actionIcon: {
    fontSize: 20,
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: '500',
    color: HIGColors.label,
  },
  recommendationsSection: {
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
  recommendationsList: {
    paddingRight: HIGConstants.SPACING_LG,
  },
  recommendationCard: {
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    marginRight: HIGConstants.SPACING_MD,
    width: 160,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: HIGConstants.SPACING_XS,
  },
  recommendationScore: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.accent,
  },
  recommendationMatch: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    marginLeft: 4,
  },
  recommendationCoffee: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 2,
  },
  recommendationRoaster: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  recommendationReason: {
    fontSize: 12,
    color: HIGColors.tertiaryLabel,
    lineHeight: 16,
  },
  recentSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  tastingCard: {
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
    minHeight: 60,
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
  learningPathCard: {
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_LG,
    borderWidth: 1,
    borderColor: HIGColors.accent,
  },
  learningPathHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  learningPathTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  learningPathTime: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
  },
  learningPathFocus: {
    fontSize: 15,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
  },
  learningPathGoal: {
    fontSize: 14,
    color: HIGColors.tertiaryLabel,
    marginBottom: HIGConstants.SPACING_MD,
  },
  learningPathCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  learningPathCTAText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.accent,
  },
  learningPathArrow: {
    fontSize: 20,
    color: HIGColors.accent,
  },
  
  // AI Coach Button Styles
  aiCoachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HIGColors.accent,
    borderRadius: HIGConstants.BORDER_RADIUS * 2,
    padding: HIGConstants.SPACING_MD,
    marginTop: HIGConstants.SPACING_MD,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiCoachIcon: {
    fontSize: 24,
    marginRight: HIGConstants.SPACING_SM,
  },
  aiCoachButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.white,
  },
  newBadge: {
    backgroundColor: HIGColors.red,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: HIGConstants.SPACING_SM,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: HIGColors.white,
  },
});