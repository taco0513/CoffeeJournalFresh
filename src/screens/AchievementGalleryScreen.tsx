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

const AchievementGalleryScreen: React.FC = () => {
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
        <View style={styles.nextAchievementCard}>
          <Text style={styles.nextAchievementName}>🎯 다음 목표</Text>
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
        contentContainerStyle={styles.filterScroll}
      >
        {FILTER_OPTIONS.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterPill,
              selectedFilter === filter.key && styles.filterPillActive,
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
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🎯</Text>
          <Text style={[styles.statNumber, { marginBottom: IOSSpacing.sm }]}>
            업적이 없습니다
          </Text>
          <Text style={styles.emptyStateText}>
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
      <View style={styles.achievementList}>
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
      <View style={styles.errorContainer}>
        <Text style={styles.emptyStateIcon}>⚠️</Text>
        <Text style={[styles.statNumber, { marginBottom: IOSSpacing.sm }]}>
          업적을 불러올 수 없습니다
        </Text>
        <Text style={[styles.errorText, { marginBottom: IOSSpacing.lg }]}>
          {error}
        </Text>
        <TouchableOpacity 
          style={[styles.filterPill, styles.filterPillActive, { paddingHorizontal: IOSSpacing.lg, paddingVertical: IOSSpacing.md }]}
          onPress={handleRefresh}
        >
          <Text style={[styles.filterText, styles.filterTextActive]}>다시 시도</Text>
        </TouchableOpacity>
      </View>
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
        
        <View style={{ height: IOSSpacing.xxl }} />
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
  },
  
  navigationTitle: {
    ...IOSTypography.headline,
    fontWeight: '700' as const,
    color: IOSColors.label,
  },
  
  betaBadge: {
    marginLeft: IOSSpacing.sm,
    paddingHorizontal: IOSSpacing.xs,
    paddingVertical: 2,
    backgroundColor: IOSColors.systemOrange,
    borderRadius: IOSLayout.cornerRadiusSmall,
  },
  
  betaText: {
    ...IOSTypography.caption2,
    fontSize: 10,
    fontWeight: '700' as const,
    color: IOSColors.systemBackground,
  },
  
  scrollView: {
    flex: 1,
  },
  
  statsContainer: {
    backgroundColor: IOSColors.systemBackground,
    paddingHorizontal: IOSSpacing.screenPadding,
    paddingVertical: IOSSpacing.lg,
  },
  
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: IOSSpacing.md,
  },
  
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: IOSSpacing.md,
    backgroundColor: IOSColors.quaternarySystemFill,
    borderRadius: IOSLayout.cornerRadiusSmall,
    marginHorizontal: IOSSpacing.xs,
  },
  
  statNumber: {
    ...IOSTypography.title1,
    fontWeight: '700' as const,
    color: IOSColors.label,
  },
  
  statLabel: {
    ...IOSTypography.footnote,
    color: IOSColors.secondaryLabel,
    marginTop: IOSSpacing.xs,
  },
  
  nextAchievementCard: {
    backgroundColor: IOSColors.quaternarySystemFill,
    borderRadius: IOSLayout.cornerRadiusSmall,
    padding: IOSSpacing.md,
    marginTop: IOSSpacing.sm,
  },
  
  nextAchievementHeader: {
    ...IOSTypography.footnote,
    color: IOSColors.secondaryLabel,
    marginBottom: IOSSpacing.xs,
  },
  
  nextAchievementName: {
    ...IOSTypography.body,
    fontWeight: '600' as const,
    color: IOSColors.label,
    marginBottom: IOSSpacing.xs,
  },
  
  filterContainer: {
    backgroundColor: IOSColors.systemBackground,
    paddingHorizontal: IOSSpacing.screenPadding,
    paddingBottom: IOSSpacing.sm,
  },
  
  filterScroll: {
    flexGrow: 0,
  },
  
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: IOSSpacing.md,
    paddingVertical: IOSSpacing.xs,
    marginRight: IOSSpacing.sm,
    borderRadius: IOSLayout.cornerRadiusLarge,
    backgroundColor: IOSColors.quaternarySystemFill,
  },
  
  filterPillActive: {
    backgroundColor: IOSColors.systemBrown,
  },
  
  filterIcon: {
    fontSize: 16,
    marginRight: IOSSpacing.xs,
  },
  
  filterText: {
    ...IOSTypography.caption1,
    color: IOSColors.label,
  },
  
  filterTextActive: {
    color: IOSColors.systemBackground,
    fontWeight: '600' as const,
  },
  
  achievementList: {
    flex: 1,
    paddingHorizontal: IOSSpacing.screenPadding,
    paddingTop: IOSSpacing.sm,
  },
  
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: IOSSpacing.xxxl,
  },
  
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: IOSSpacing.md,
  },
  
  emptyStateText: {
    ...IOSTypography.body,
    color: IOSColors.secondaryLabel,
    textAlign: 'center',
  },
  
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: IOSSpacing.xl,
  },
  
  errorText: {
    ...IOSTypography.body,
    color: IOSColors.systemRed,
    textAlign: 'center',
  },
});

export default AchievementGalleryScreen;