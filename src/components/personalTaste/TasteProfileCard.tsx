import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { HIGColors, HIGConstants } from '@/styles/common';
import { ProgressData, TasteProfileType, TASTE_PROFILE_DESCRIPTIONS } from '@/types/personalTaste';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TasteProfileCardProps {
  level: number;
  progress: ProgressData;
  tasteType: string;
  onLevelTap?: () => void;
  style?: any;
}

export const TasteProfileCard: React.FC<TasteProfileCardProps> = ({
  level,
  progress,
  tasteType,
  onLevelTap,
  style,
}) => {

  const getLevelName = (level: number): string => {
    const levels = [
      'Beginner',
      'Novice',
      'Apprentice',
      'Intermediate',
      'Advanced',
      'Expert',
      'Master',
      'Virtuoso',
      'Connoisseur',
      'Legend',
    ];
    return levels[Math.min(Math.floor(level) - 1, levels.length - 1)] || 'Beginner';
  };

  const getProfileEmoji = (tasteType: string): string => {
    const emojiMap: Record<string, string> = {
      'Fruity Explorer': '🍓',
      'Chocolate Lover': '🍫',
      'Floral Enthusiast': '🌸',
      'Nutty Adventurer': '🥜',
      'Balanced Seeker': '⚖️',
      'Bold Pioneer': '💪',
      'Sweet Tooth': '🍯',
      'Acid Lover': '🍋',
      'Complex Connoisseur': '🎭',
      'explorer': '🍓',
      'traditionalist': '🍫',
      'balanced': '⚖️',
      'adventurous': '💪',
    };
    return emojiMap[tasteType] || '☕';
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return HIGColors.green;
    if (percentage >= 50) return HIGColors.orange;
    return HIGColors.blue;
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.card}
        onPress={onLevelTap}
        activeOpacity={0.9}
        disabled={!onLevelTap}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileEmoji}>{getProfileEmoji(tasteType)}</Text>
            <View style={styles.titleContainer}>
              <Text style={styles.tasteType}>{tasteType}</Text>
              <Text style={styles.description}>
                {TASTE_PROFILE_DESCRIPTIONS[tasteType] || 'Discovering your unique coffee preferences'}
              </Text>
            </View>
          </View>
        </View>

        {/* Level Section */}
        <View style={styles.levelSection}>
          <View style={styles.levelInfo}>
            <Text style={styles.levelLabel}>레벨</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelNumber}>{Math.floor(level)}</Text>
              <Text style={styles.levelName}>{getLevelName(level)}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.round(progress.percentage * 100)}%`,
                    backgroundColor: getProgressColor(progress.percentage * 100),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress.percentage * 100)}%
            </Text>
          </View>

          {/* Next Level Info */}
          <View style={styles.nextLevelInfo}>
            <Text style={styles.nextLevelText}>
              다음 레벨까지 {100 - Math.round(progress.percentage * 100)}% 남음
            </Text>
            {progress.estimatedTimeToComplete && (
              <Text style={styles.estimatedTime}>
                예상 기간: {progress.estimatedTimeToComplete}일
              </Text>
            )}
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{progress.currentValue}</Text>
            <Text style={styles.statLabel}>현재</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{progress.targetValue}</Text>
            <Text style={styles.statLabel}>목표</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {new Date(progress.lastUpdated).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.statLabel}>업데이트</Text>
          </View>
        </View>

        {/* Call to Action */}
        {onLevelTap && (
          <View style={styles.ctaContainer}>
            <Text style={styles.ctaText}>자세히 보기</Text>
            <Text style={styles.ctaArrow}>→</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  card: {
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS_LG,
    padding: HIGConstants.SPACING_LG,
    // Shadow
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileEmoji: {
    fontSize: 48,
    marginRight: HIGConstants.SPACING_MD,
  },
  titleContainer: {
    flex: 1,
  },
  tasteType: {
    fontSize: 20,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  description: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    lineHeight: 18,
  },
  levelSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_MD,
  },
  levelLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: HIGColors.accent,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_XS,
    borderRadius: HIGConstants.BORDER_RADIUS,
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.white,
    marginRight: HIGConstants.SPACING_XS,
  },
  levelName: {
    fontSize: 14,
    fontWeight: '500',
    color: HIGColors.white,
    opacity: 0.9,
  },
  progressContainer: {
    marginBottom: HIGConstants.SPACING_SM,
  },
  progressBar: {
    height: 12,
    backgroundColor: HIGColors.gray5,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: HIGConstants.SPACING_XS,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    textAlign: 'right',
  },
  nextLevelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextLevelText: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
  },
  estimatedTime: {
    fontSize: 12,
    color: HIGColors.tertiaryLabel,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: HIGConstants.SPACING_MD,
    borderTopWidth: 1,
    borderTopColor: HIGColors.gray5,
    marginBottom: HIGConstants.SPACING_SM,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  statLabel: {
    fontSize: 12,
    color: HIGColors.tertiaryLabel,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: HIGColors.gray5,
  },
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: HIGConstants.SPACING_SM,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.accent,
    marginRight: HIGConstants.SPACING_XS,
  },
  ctaArrow: {
    fontSize: 18,
    color: HIGColors.accent,
  },
});