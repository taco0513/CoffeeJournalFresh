import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { HIGColors, HIGConstants } from '../styles/common';
import { IOSColors, IOSLayout, IOSTypography, IOSSpacing, IOSShadows } from '../styles/ios-hig-2024';
import { AchievementCard } from '../components/achievements/AchievementCard';
import { useAchievements } from '../hooks/useAchievements';
import StatusBadge from '../components/StatusBadge';
import { AchievementType } from '../services/AchievementSystem';

type FilterType = 'all' | 'unlocked' | 'locked' | AchievementType;

const FILTER_OPTIONS: { key: FilterType; label: string; icon: string }[] = [
  { key: 'all', label: '전체', icon: '🎯' },
  { key: 'unlocked', label: '달성완료', icon: '✅' },
  { key: 'locked', label: '진행중', icon: '🔒' },
  { key: AchievementType.FIRST_STEPS, label: '첫 걸음', icon: '👶' },
  { key: AchievementType.CONSISTENCY, label: '일관성', icon: '📅' },
  { key: AchievementType.VOCABULARY, label: '어휘력', icon: '📚' },
  { key: AchievementType.HIDDEN, label: '숨겨진', icon: '🕵️' },
];

export const AchievementGalleryScreen: React.FC = () => {
  const { 
    achievements, 
    stats, 
    isLoading, 
    error, 
    refreshAchievements,
    getNextAchievement 
  } = useAchievements();
  
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const nextAchievement = getNextAchievement();

  // Filter achievements based on selected filter
  const filteredAchievements = useMemo(() => {
    let filtered = [...achievements];

    switch (selectedFilter) {
      case 'unlocked':
        filtered = filtered.filter(a => a.unlockedAt);
        break;
      case 'locked':
        filtered = filtered.filter(a => !a.unlockedAt);
        break;
      case 'all':
        break;
      default:
        filtered = filtered.filter(a => a.category === selectedFilter);
        break;
    }

    // Sort: unlocked achievements first, then by rarity, then by progress
    return filtered.sort((a, b) => {
      // Unlocked achievements first
      if (a.unlockedAt && !b.unlockedAt) return -1;
      if (!a.unlockedAt && b.unlockedAt) return 1;
      
      // Then by rarity (legendary first)
      const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
      const rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      
      // Finally by progress (higher progress first)
      return (b.progress || 0) - (a.progress || 0);
    });
  }, [achievements, selectedFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAchievements();
    } finally {
      setRefreshing(false);
    }
  };

  const renderStatsHeader = () => (
    <View style={styles.statsContainer}>      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.unlockedAchievements}</Text>
          <Text style={styles.statLabel}>달성 업적</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalPoints}</Text>
          <Text style={styles.statLabel}>총 포인트</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.completionPercentage}%</Text>
          <Text style={styles.statLabel}>완료율</Text>
        </View>
      </View>

      {nextAchievement && (
        <View style={styles.nextAchievementContainer}>
          <Text style={styles.nextAchievementTitle}>🎯 다음 목표</Text>
          <AchievementCard 
            achievement={nextAchievement}
            compact
          />
        </View>
      )}
    </View>
  );

  const renderFilterBar = () => (
    <View style={styles.filterContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}
      >
        {FILTER_OPTIONS.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={styles.filterIcon}>{filter.icon}</Text>
            <Text style={[
              styles.filterText,
              selectedFilter === filter.key && styles.filterTextActive,
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAchievementsList = () => {
    if (filteredAchievements.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyTitle}>업적이 없습니다</Text>
          <Text style={styles.emptySubtitle}>
            {selectedFilter === 'unlocked' 
              ? '아직 달성한 업적이 없습니다.\n커피 테이스팅을 시작해보세요!'
              : selectedFilter === 'locked'
              ? '진행 중인 업적이 없습니다.'
              : '이 카테고리에는 업적이 없습니다.'
            }
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.achievementsList}>
        {filteredAchievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
          />
        ))}
      </View>
    );
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>업적을 불러올 수 없습니다</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <View style={styles.titleContainer}>
          <Text style={styles.navigationTitle}>나의 업적</Text>
          <View style={styles.betaBadge}>
            <Text style={styles.betaText}>BETA</Text>
          </View>
        </View>
        <StatusBadge />
      </View>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderStatsHeader()}
        {renderFilterBar()}
        {renderAchievementsList()}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IOSColors.systemBackground,
  },
  navigationBar: {
    height: IOSLayout.navBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: IOSSpacing.screenPadding,
    backgroundColor: IOSColors.systemBackground,
    borderBottomWidth: IOSLayout.borderWidthThin,
    borderBottomColor: IOSColors.separator,
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
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    padding: IOSSpacing.lg,
    backgroundColor: IOSColors.systemBackground,
    borderBottomWidth: IOSLayout.borderWidthThin,
    borderBottomColor: IOSColors.separator,
  },
  title: {
    ...IOSTypography.title1,
    color: IOSColors.label,
    marginBottom: IOSSpacing.lg,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: HIGConstants.SPACING_LG,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.systemBlue,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
  },
  nextAchievementContainer: {
    marginTop: HIGConstants.SPACING_MD,
  },
  nextAchievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  filterContainer: {
    backgroundColor: HIGColors.white,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray6,
    paddingVertical: HIGConstants.SPACING_MD,
  },
  filterScrollContent: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    gap: HIGConstants.SPACING_SM,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.cornerRadiusMedium,
    backgroundColor: HIGColors.systemGray6,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: HIGColors.systemBlue,
  },
  filterIcon: {
    fontSize: 16,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: HIGColors.secondaryLabel,
  },
  filterTextActive: {
    color: HIGColors.white,
  },
  achievementsList: {
    padding: HIGConstants.SPACING_LG,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HIGConstants.SPACING_XL * 2,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: HIGConstants.SPACING_LG,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  emptySubtitle: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: HIGConstants.SPACING_LG,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  errorMessage: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_LG,
  },
  retryButton: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    backgroundColor: HIGColors.systemBlue,
    borderRadius: HIGConstants.cornerRadiusMedium,
  },
  retryButtonText: {
    color: HIGColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: HIGConstants.SPACING_XL,
  },
});