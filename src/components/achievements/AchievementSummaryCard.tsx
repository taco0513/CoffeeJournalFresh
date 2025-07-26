import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { HIGColors, HIGConstants } from '../../styles/common';
import { Achievement } from '../../types/achievements';

interface AchievementSummaryCardProps {
  unlockedCount: number;
  totalCount: number;
  totalPoints: number;
  nextAchievement?: Achievement | null;
  onPress: () => void;
}

export const AchievementSummaryCard: React.FC<AchievementSummaryCardProps> = ({
  unlockedCount,
  totalCount,
  totalPoints,
  nextAchievement,
  onPress,
}) => {
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🏆</Text>
          </View>
          <View style={styles.titleInfo}>
            <Text style={styles.title}>나의 업적</Text>
            <Text style={styles.subtitle}>커피 여정의 성과를 확인해보세요</Text>
          </View>
        </View>
        <View style={styles.chevron}>
          <Text style={styles.chevronText}>›</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{unlockedCount}</Text>
          <Text style={styles.statLabel}>달성</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{completionPercentage}%</Text>
          <Text style={styles.statLabel}>완료율</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalPoints}</Text>
          <Text style={styles.statLabel}>포인트</Text>
        </View>
      </View>

      {nextAchievement && (
        <View style={styles.nextAchievementSection}>
          <Text style={styles.nextTitle}>다음 목표</Text>
          <View style={styles.nextAchievementRow}>
            <View style={styles.nextIconContainer}>
              <Text style={styles.nextIcon}>{nextAchievement.icon}</Text>
            </View>
            <View style={styles.nextInfo}>
              <Text style={styles.nextAchievementTitle} numberOfLines={1}>
                {nextAchievement.title}
              </Text>
              <Text style={styles.nextProgress}>
                {Math.round((nextAchievement.progress || 0) * 100)}% 완료
              </Text>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_MD,
    borderWidth: 1,
    borderColor: HIGColors.systemGray6,
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_LG,
},
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
},
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: HIGColors.systemYellow + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: HIGConstants.SPACING_MD,
},
  icon: {
    fontSize: 24,
},
  titleInfo: {
    flex: 1,
},
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 2,
},
  subtitle: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
},
  chevron: {
    marginLeft: HIGConstants.SPACING_SM,
},
  chevronText: {
    fontSize: 20,
    color: HIGColors.systemGray4,
    fontWeight: '300',
},
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_MD,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    marginBottom: HIGConstants.SPACING_LG,
},
  statItem: {
    alignItems: 'center',
    flex: 1,
},
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: HIGColors.systemBlue,
    marginBottom: 2,
},
  statLabel: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
},
  divider: {
    width: 1,
    height: 24,
    backgroundColor: HIGColors.systemGray4,
},
  nextAchievementSection: {
    borderTopWidth: 1,
    borderTopColor: HIGColors.systemGray6,
    paddingTop: HIGConstants.SPACING_MD,
},
  nextTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
},
  nextAchievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
},
  nextIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: HIGColors.systemGray6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: HIGConstants.SPACING_MD,
},
  nextIcon: {
    fontSize: 18,
},
  nextInfo: {
    flex: 1,
},
  nextAchievementTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: HIGColors.label,
    marginBottom: 2,
},
  nextProgress: {
    fontSize: 12,
    color: HIGColors.systemBlue,
    fontWeight: '500',
},
});