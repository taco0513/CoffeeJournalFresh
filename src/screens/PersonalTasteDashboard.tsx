import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { HIGConstants, HIGColors } from '../styles/common';
import { 
  usePersonalTaste, 
  useAchievements, 
  useFlavorMastery,
  useLiteAICoach 
} from '@/hooks/usePersonalTaste';
import { TasteProfileCard } from '@/components/personalTaste/TasteProfileCard';
import { FlavorRadarChart } from '@/components/personalTaste/FlavorRadarChart';
import { GrowthTimeline } from '@/components/personalTaste/GrowthTimeline';
import { FlavorMasteryMap } from '@/components/personalTaste/FlavorMasteryMap';
import { PersonalStatsGrid } from '@/components/personalTaste/PersonalStatsGrid';
import { CoachTipCard } from '@/components/coach';
import { PersonalTasteViewMode } from '@/types/personalTaste';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PersonalTasteDashboard() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [viewMode, setViewMode] = useState<PersonalTasteViewMode>(
    PersonalTasteViewMode.DASHBOARD
  );
  const [refreshing, setRefreshing] = useState(false);

  // Hooks for data
  const { 
    tastePattern, 
    growthMetrics, 
    recommendations,
    insights,
    loading: tasteLoading,
    refresh: refreshTaste 
  } = usePersonalTaste();
  
  const { 
    achievements, 
    stats: achievementStats,
    loading: achievementsLoading 
  } = useAchievements();
  
  const { 
    flavorMastery,
    loading: masteryLoading 
  } = useFlavorMastery();

  const { coachService } = useLiteAICoach();

  const loading = tasteLoading || achievementsLoading || masteryLoading;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshTaste();
    setRefreshing(false);
  };

  const handleViewModeChange = (mode: PersonalTasteViewMode) => {
    setViewMode(mode);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleFlavorCategorySelect = (category: string) => {
    navigation.navigate('FlavorCategoryDetail', { category });
  };

  const handleViewAchievements = () => {
    navigation.navigate('Achievements');
  };

  const handleStartQuiz = () => {
    navigation.navigate('FlavorQuiz');
  };

  const handleViewRecommendations = () => {
    navigation.navigate('Recommendations');
  };

  const renderViewModeTab = (mode: PersonalTasteViewMode, label: string) => (
    <TouchableOpacity
      style={[styles.tab, viewMode === mode && styles.activeTab]}
      onPress={() => handleViewModeChange(mode)}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabText, viewMode === mode && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={HIGColors.accent} />
          <Text style={styles.loadingText}>분석 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tastePattern) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>☕</Text>
          <Text style={styles.emptyStateTitle}>아직 데이터가 없어요</Text>
          <Text style={styles.emptyStateText}>
            몇 번의 테이스팅 후에 개인 취향 분석을 볼 수 있어요
          </Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Text style={styles.emptyStateButtonText}>첫 테이스팅 시작하기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navigationTitle}>나의 커피 여정</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* View Mode Tabs */}
      <View style={styles.tabContainer}>
        {renderViewModeTab(PersonalTasteViewMode.DASHBOARD, '대시보드')}
        {renderViewModeTab(PersonalTasteViewMode.PROFILE, '취향 프로필')}
        {renderViewModeTab(PersonalTasteViewMode.PROGRESS, '성장 기록')}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {viewMode === PersonalTasteViewMode.DASHBOARD && (
            <>
              {/* Taste Profile Card */}
              <TasteProfileCard
                level={growthMetrics?.vocabularyGrowth || 1}
                progress={{
                  currentValue: growthMetrics?.weeklyProgress || 0,
                  targetValue: 100,
                  percentage: (growthMetrics?.weeklyProgress || 0) / 100,
                  lastUpdated: new Date(),
                }}
                tasteType={tastePattern.tasteProfile}
                onLevelTap={() => handleViewModeChange(PersonalTasteViewMode.PROGRESS)}
              />

              {/* Quick Insights */}
              {insights && (
                <View style={styles.insightsSection}>
                  <Text style={styles.sectionTitle}>AI 인사이트</Text>
                  <View style={styles.insightsList}>
                    {insights.strengths.map((strength, index) => (
                      <View key={`strength-${index}`} style={styles.insightItem}>
                        <Text style={styles.insightIcon}>💪</Text>
                        <Text style={styles.insightText}>{strength}</Text>
                      </View>
                    ))}
                    {insights.areasToExplore.slice(0, 2).map((area, index) => (
                      <View key={`area-${index}`} style={styles.insightItem}>
                        <Text style={styles.insightIcon}>🎯</Text>
                        <Text style={styles.insightText}>{area}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                <TouchableOpacity 
                  style={styles.actionCard} 
                  onPress={handleStartQuiz}
                >
                  <Text style={styles.actionIcon}>🎯</Text>
                  <Text style={styles.actionTitle}>향미 퀴즈</Text>
                  <Text style={styles.actionSubtitle}>실력 테스트</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={handleViewRecommendations}
                >
                  <Text style={styles.actionIcon}>☕</Text>
                  <Text style={styles.actionTitle}>추천 커피</Text>
                  <Text style={styles.actionSubtitle}>{recommendations.length}개</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={handleViewAchievements}
                >
                  <Text style={styles.actionIcon}>🏆</Text>
                  <Text style={styles.actionTitle}>성취도</Text>
                  <Text style={styles.actionSubtitle}>
                    {achievementStats?.totalUnlocked || 0}개
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Personal Stats Grid */}
              <PersonalStatsGrid
                stats={{
                  totalTastings: tastePattern.growthTrend.weeklyProgress || 0,
                  uniqueCoffees: 0, // TODO: Calculate from records
                  uniqueRoasters: 0, // TODO: Calculate from records
                  favoriteRoaster: 'Coming soon',
                  favoriteFlavor: tastePattern.dominantFlavors[0]?.category || 'Unknown',
                  averageMatchScore: 0, // TODO: Calculate
                  vocabularySize: growthMetrics?.vocabularyGrowth || 0,
                  quizAccuracy: growthMetrics?.accuracyImprovement || 0,
                  currentLevel: Math.floor(growthMetrics?.vocabularyGrowth || 1),
                  nextLevelProgress: ((growthMetrics?.vocabularyGrowth || 1) % 1) * 100,
                }}
              />
            </>
          )}

          {viewMode === PersonalTasteViewMode.PROFILE && (
            <>
              {/* Flavor Radar Chart */}
              <View style={styles.chartSection}>
                <Text style={styles.sectionTitle}>향미 선호도</Text>
                <FlavorRadarChart
                  preferences={{
                    fruity: tastePattern.dominantFlavors.find(f => f.category === 'fruity')?.preference || 0,
                    floral: tastePattern.dominantFlavors.find(f => f.category === 'floral')?.preference || 0,
                    sweet: tastePattern.dominantFlavors.find(f => f.category === 'sweet')?.preference || 0,
                    nutty: tastePattern.dominantFlavors.find(f => f.category === 'nutty')?.preference || 0,
                    chocolate: tastePattern.dominantFlavors.find(f => f.category === 'chocolate')?.preference || 0,
                    spices: tastePattern.dominantFlavors.find(f => f.category === 'spices')?.preference || 0,
                  }}
                  interactive={true}
                />
              </View>

              {/* Flavor Mastery Map */}
              <View style={styles.masterySection}>
                <Text style={styles.sectionTitle}>향미 마스터리</Text>
                <FlavorMasteryMap
                  categories={Array.from(flavorMastery.keys()).map(key => ({
                    id: key,
                    name: key,
                    color: '#8B4513',
                  }))}
                  masteryLevels={Array.from(flavorMastery.values())}
                  layout="grid"
                  onCategorySelect={handleFlavorCategorySelect}
                />
              </View>

              {/* Taste Recommendations */}
              {tastePattern.recommendations.length > 0 && (
                <View style={styles.recommendationsSection}>
                  <Text style={styles.sectionTitle}>맞춤 추천</Text>
                  {tastePattern.recommendations.map((rec, index) => (
                    <CoachTipCard
                      key={`rec-${index}`}
                      tip={{
                        id: `rec-${index}`,
                        type: 'guidance',
                        priority: 'medium',
                        title: '추천',
                        message: rec,
                        icon: '💡',
                      }}
                      onAction={() => {}}
                    />
                  ))}
                </View>
              )}
            </>
          )}

          {viewMode === PersonalTasteViewMode.PROGRESS && (
            <>
              {/* Growth Timeline */}
              <View style={styles.timelineSection}>
                <Text style={styles.sectionTitle}>성장 타임라인</Text>
                <GrowthTimeline
                  milestones={[
                    {
                      id: '1',
                      date: new Date(),
                      title: '첫 테이스팅',
                      description: '커피 여정의 시작',
                      type: 'achievement',
                      icon: '☕',
                    },
                    // TODO: Generate from actual data
                  ]}
                  currentWeek={1}
                />
              </View>

              {/* Growth Metrics */}
              <View style={styles.metricsSection}>
                <Text style={styles.sectionTitle}>성장 지표</Text>
                <View style={styles.metricsList}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>어휘 성장</Text>
                    <Text style={styles.metricValue}>
                      {growthMetrics?.vocabularyGrowth.toFixed(1)} 단어/주
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>정확도 향상</Text>
                    <Text style={styles.metricValue}>
                      +{Math.round(growthMetrics?.accuracyImprovement || 0)}%
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>향미 다양성</Text>
                    <Text style={styles.metricValue}>
                      {Math.round((growthMetrics?.flavorDiversityIndex || 0) * 100)}%
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>일관성 점수</Text>
                    <Text style={styles.metricValue}>
                      {Math.round((growthMetrics?.consistencyScore || 0) * 100)}%
                    </Text>
                  </View>
                </View>
              </View>

              {/* Recent Discoveries */}
              {insights?.recentDiscoveries && insights.recentDiscoveries.length > 0 && (
                <View style={styles.discoveriesSection}>
                  <Text style={styles.sectionTitle}>최근 발견</Text>
                  {insights.recentDiscoveries.map((discovery, index) => (
                    <View key={index} style={styles.discoveryItem}>
                      <Text style={styles.discoveryIcon}>✨</Text>
                      <Text style={styles.discoveryText}>{discovery}</Text>
                    </View>
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
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  backButton: {
    fontSize: 24,
    color: HIGColors.blue,
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_SM,
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    paddingVertical: HIGConstants.SPACING_SM,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: HIGColors.accent,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: HIGColors.secondaryLabel,
  },
  activeTabText: {
    color: HIGColors.accent,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_MD,
    paddingBottom: HIGConstants.SPACING_XL * 2,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_XL,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: HIGConstants.SPACING_LG,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  emptyStateText: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_LG,
    lineHeight: 22,
  },
  emptyStateButton: {
    backgroundColor: HIGColors.accent,
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.BORDER_RADIUS,
  },
  emptyStateButtonText: {
    color: HIGColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  insightsSection: {
    marginTop: HIGConstants.SPACING_LG,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  insightsList: {
    gap: HIGConstants.SPACING_SM,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.BORDER_RADIUS,
    borderWidth: 1,
    borderColor: HIGColors.blue,
  },
  insightIcon: {
    fontSize: 20,
    marginRight: HIGConstants.SPACING_SM,
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    color: HIGColors.secondaryLabel,
  },
  quickActions: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_SM,
    marginTop: HIGConstants.SPACING_LG,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFF3E0',
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HIGColors.orange,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: HIGConstants.SPACING_XS,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
  },
  chartSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  masterySection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  recommendationsSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  timelineSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  metricsSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  metricsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HIGConstants.SPACING_SM,
  },
  metricItem: {
    width: (SCREEN_WIDTH - HIGConstants.SPACING_LG * 2 - HIGConstants.SPACING_SM) / 2,
    backgroundColor: '#F3E5F5',
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    borderWidth: 1,
    borderColor: HIGColors.purple,
  },
  metricLabel: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.accent,
  },
  discoveriesSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  discoveryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: HIGConstants.SPACING_SM,
  },
  discoveryIcon: {
    fontSize: 16,
    marginRight: HIGConstants.SPACING_SM,
    marginTop: 2,
  },
  discoveryText: {
    flex: 1,
    fontSize: 15,
    color: HIGColors.secondaryLabel,
    lineHeight: 20,
  },
});