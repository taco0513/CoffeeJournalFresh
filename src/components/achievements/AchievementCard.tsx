import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { HIGColors, HIGConstants } from '../../styles/common';
import { IOSColors, IOSLayout, IOSTypography, IOSSpacing, IOSShadows } from '../../styles/ios-hig-2024';
import { ProgressBar } from './ProgressBar';
import { CircularProgress } from './CircularProgress';
import { Achievement, ProgressData } from '../../services/AchievementSystem';

interface AchievementCardProps {
  achievement: Achievement;
  progress?: ProgressData;
  compact?: boolean;
  onPress?: () => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  progress,
  compact = false,
  onPress,
}) => {
  const isUnlocked = achievement.unlockedAt !== undefined;
  const progressPercentage = progress?.percentage || achievement.progress || 0;
  
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return IOSColors.systemGray3;
      case 'rare':
        return IOSColors.systemBlue;
      case 'epic':
        return IOSColors.systemPurple;
      case 'legendary':
        return IOSColors.systemOrange;
      default:
        return IOSColors.systemGray3;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatReward = (reward: any) => {
    if (reward.type === 'points') {
      return `${reward.value}pt`;
    }
    return reward.value;
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        compact && styles.compactContainer,
        isUnlocked ? styles.unlockedContainer : styles.lockedContainer,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* New Badge */}
      {achievement.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}

      {/* Header Row */}
      <View style={styles.header}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: getRarityColor(achievement.rarity) + '20' }
        ]}>
          <Text style={[
            styles.icon,
            compact && styles.compactIcon,
            !isUnlocked && styles.lockedIcon
          ]}>
            {achievement.icon}
          </Text>
        </View>
        
        <View style={styles.headerInfo}>
          <Text style={[
            styles.title,
            compact && styles.compactTitle,
            !isUnlocked && styles.lockedText
          ]}>
            {achievement.title}
          </Text>
          
          {/* Rarity Indicator */}
          <View style={styles.rarityRow}>
            <View style={[
              styles.rarityBadge,
              { backgroundColor: getRarityColor(achievement.rarity) }
            ]}>
              <Text style={styles.rarityBadgeText}>
                {achievement.rarity === 'common' ? '일반' :
                 achievement.rarity === 'rare' ? '희귀' :
                 achievement.rarity === 'epic' ? '서사' :
                 achievement.rarity === 'legendary' ? '전설' : '일반'}
              </Text>
            </View>
          </View>
        </View>

        {/* Reward */}
        <View style={styles.rewardContainer}>
          <Text style={[
            styles.rewardText,
            !isUnlocked && styles.lockedText
          ]}>
            {formatReward(achievement.rewards)}
          </Text>
        </View>
      </View>

      {/* Description */}
      {!compact && (
        <Text style={[
          styles.description,
          !isUnlocked && styles.lockedText
        ]}>
          {achievement.description}
        </Text>
      )}

      {/* Progress Section */}
      {!isUnlocked && progress && (
        <View style={[
          styles.progressSection,
          compact && styles.progressSectionCompact
        ]}>
          <CircularProgress
            size={compact ? 40 : 60}
            strokeWidth={3}
            progress={progressPercentage}
            color={getRarityColor(achievement.rarity)}
            backgroundColor={IOSColors.systemGray6}
          >
            <Text style={[
              styles.circularProgressText,
              compact && styles.circularProgressTextCompact
            ]}>
              {Math.round(progressPercentage)}%
            </Text>
          </CircularProgress>
          
          <View style={styles.progressInfo}>
            <Text style={styles.progressDetail}>
              {progress.currentValue} / {progress.targetValue}
            </Text>
            {progress.estimatedTimeToComplete && !compact && (
              <Text style={styles.estimatedTime}>
                약 {progress.estimatedTimeToComplete}일 남음
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Unlock Date */}
      {isUnlocked && achievement.unlockedAt && (
        <View style={styles.unlockSection}>
          <Text style={styles.unlockDate}>
            {formatDate(achievement.unlockedAt)}에 달성
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOSColors.secondarySystemGroupedBackground,
    borderRadius: IOSLayout.cornerRadiusMedium,
    padding: IOSSpacing.lg,
    marginBottom: IOSSpacing.md,
    borderWidth: IOSLayout.borderWidthThin,
    borderColor: IOSColors.separator,
    ...IOSShadows.small,
  },
  compactContainer: {
    padding: IOSSpacing.md,
    marginBottom: IOSSpacing.sm,
  },
  unlockedContainer: {
    borderColor: IOSColors.systemGreen,
  },
  lockedContainer: {
    opacity: 0.8,
  },
  newBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: IOSColors.systemRed,
    borderRadius: 12,
    paddingHorizontal: IOSSpacing.xs,
    paddingVertical: IOSSpacing.xxs,
    zIndex: 1,
  },
  newBadgeText: {
    ...IOSTypography.caption2,
    fontWeight: '700' as const,
    color: IOSColors.systemBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: IOSSpacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: IOSSpacing.md,
  },
  icon: {
    fontSize: IOSLayout.iconSizeLarge,
  },
  compactIcon: {
    fontSize: IOSLayout.iconSizeMedium,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    ...IOSTypography.headline,
    color: IOSColors.label,
    marginBottom: IOSSpacing.xxs,
  },
  compactTitle: {
    ...IOSTypography.subheadline,
  },
  rarityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rarityBadge: {
    paddingHorizontal: IOSSpacing.xs,
    paddingVertical: IOSSpacing.xxxs,
    borderRadius: IOSLayout.cornerRadiusSmall,
  },
  rarityBadgeText: {
    ...IOSTypography.caption2,
    fontWeight: '600' as const,
    color: IOSColors.systemBackground,
  },
  rewardContainer: {
    alignItems: 'flex-end',
  },
  rewardText: {
    ...IOSTypography.footnote,
    fontWeight: '600' as const,
    color: IOSColors.systemBlue,
  },
  description: {
    ...IOSTypography.footnote,
    color: IOSColors.secondaryLabel,
    lineHeight: 20,
    marginBottom: IOSSpacing.sm,
  },
  progressSection: {
    marginTop: IOSSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: IOSSpacing.md,
  },
  progressSectionCompact: {
    marginTop: IOSSpacing.sm,
    gap: IOSSpacing.sm,
  },
  progressInfo: {
    flex: 1,
  },
  circularProgressText: {
    ...IOSTypography.footnote,
    fontWeight: '600' as const,
    color: IOSColors.label,
  },
  circularProgressTextCompact: {
    ...IOSTypography.caption2,
    fontWeight: '600' as const,
  },
  estimatedTime: {
    ...IOSTypography.caption1,
    color: IOSColors.tertiaryLabel,
    marginTop: IOSSpacing.xxxs,
  },
  progressDetail: {
    ...IOSTypography.footnote,
    fontWeight: '500' as const,
    color: IOSColors.secondaryLabel,
  },
  unlockSection: {
    marginTop: IOSSpacing.sm,
    paddingTop: IOSSpacing.sm,
    borderTopWidth: IOSLayout.borderWidthThin,
    borderTopColor: IOSColors.separator,
  },
  unlockDate: {
    ...IOSTypography.caption1,
    fontWeight: '500' as const,
    color: IOSColors.secondaryLabel,
  },
  lockedText: {
    opacity: 0.6,
  },
});