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
        <YStack 
          alignItems="center" 
          justifyContent="center" 
          paddingVertical="$16" 
          paddingHorizontal="$6"
        >
          <SizableText size="12" marginBottom="$6">🎯</SizableText>
          <SizableText size="$5" fontWeight="600" color="$color" marginBottom="$3">
            업적이 없습니다
          </SizableText>
          <SizableText size="$3" color="$colorPress" textAlign="center" lineHeight="$5">
            {selectedFilter === 'unlocked' 
              ? '아직 달성한 업적이 없습니다.\n커피 테이스팅을 시작해보세요!'
              : selectedFilter === 'locked'
              ? '진행 중인 업적이 없습니다.'
              : '이 카테고리에는 업적이 없습니다.'
            }
          </SizableText>
        </YStack>
      );
    }

    return (
      <YStack padding="$6">
        {filteredAchievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
          />
        ))}
      </YStack>
    );
  };

  if (error) {
    return (
      <View flex={1} backgroundColor="$background" alignItems="center" justifyContent="center" paddingHorizontal="$6">
        <SizableText size="12" marginBottom="$6">⚠️</SizableText>
        <SizableText size="$5" fontWeight="600" color="$color" marginBottom="$3">
          업적을 불러올 수 없습니다
        </SizableText>
        <SizableText size="$3" color="$colorPress" textAlign="center" marginBottom="$6">
          {error}
        </SizableText>
        <Button 
          size="$4" 
          theme="blue" 
          onPress={handleRefresh}
          animation="bouncy"
        >
          다시 시도
        </Button>
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
        
        <View height="$8" />
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles migrated to Tamagui - no StyleSheet needed