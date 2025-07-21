import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { HIGColors, HIGConstants } from '../../styles/common';
import { ProgressBar } from './ProgressBar';
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
        return HIGColors.systemGray4;
      case 'rare':
        return HIGColors.systemBlue;
      case 'epic':
        return HIGColors.systemPurple;
      case 'legendary':
        return HIGColors.systemOrange;
      default:
        return HIGColors.systemGray4;
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
        <View style={styles.iconContainer}>
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
              styles.rarityDot,
              { backgroundColor: getRarityColor(achievement.rarity) }
            ]} />
            <Text style={[
              styles.rarityText,
              !isUnlocked && styles.lockedText
            ]}>
              {achievement.rarity}
            </Text>
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
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              진행률: {Math.round(progressPercentage)}%
            </Text>
            {progress.estimatedTimeToComplete && (
              <Text style={styles.estimatedTime}>
                약 {progress.estimatedTimeToComplete}일 남음
              </Text>
            )}
          </View>
          <ProgressBar 
            progress={progressPercentage / 100}
            color={getRarityColor(achievement.rarity)}
            height={compact ? 4 : 6}
          />
          <Text style={styles.progressDetail}>
            {progress.currentValue} / {progress.targetValue}
          </Text>
        </View>
      )}

      {/* Unlock Date */}
      {isUnlocked && achievement.unlockedAt && (
        <View style={styles.unlockSection}>
          <Text style={styles.unlockDate}>
            🎉 {formatDate(achievement.unlockedAt)}에 달성
          </Text>
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
  compactContainer: {
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
  },
  unlockedContainer: {
    borderColor: HIGColors.systemGreen,
    backgroundColor: '#F8FFF8',
  },
  lockedContainer: {
    opacity: 0.7,
  },
  newBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: HIGColors.systemRed,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  newBadgeText: {
    color: HIGColors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  iconContainer: {
    marginRight: HIGConstants.SPACING_MD,
  },
  icon: {
    fontSize: 40,
  },
  compactIcon: {
    fontSize: 24,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 4,
  },
  compactTitle: {
    fontSize: 15,
  },
  rarityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rarityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  rarityText: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
    textTransform: 'capitalize',
  },
  rewardContainer: {
    alignItems: 'flex-end',
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.systemBlue,
  },
  description: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    lineHeight: 20,
    marginBottom: HIGConstants.SPACING_SM,
  },
  progressSection: {
    marginTop: HIGConstants.SPACING_SM,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
    color: HIGColors.label,
  },
  estimatedTime: {
    fontSize: 12,
    color: HIGColors.tertiaryLabel,
  },
  progressDetail: {
    fontSize: 12,
    color: HIGColors.tertiaryLabel,
    marginTop: 4,
    textAlign: 'center',
  },
  unlockSection: {
    marginTop: HIGConstants.SPACING_SM,
    padding: HIGConstants.SPACING_SM,
    backgroundColor: HIGColors.systemGreen + '20',
    borderRadius: HIGConstants.cornerRadiusSmall,
  },
  unlockDate: {
    fontSize: 13,
    color: HIGColors.systemGreen,
    fontWeight: '500',
    textAlign: 'center',
  },
  lockedText: {
    opacity: 0.6,
  },
});