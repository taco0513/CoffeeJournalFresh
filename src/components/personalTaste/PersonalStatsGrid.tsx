import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { HIGColors, HIGConstants } from '@/styles/common';
import { PersonalStatsData } from '@/types/personalTaste';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - HIGConstants.SPACING_LG * 2 - HIGConstants.SPACING_SM) / 2;

interface PersonalStatsGridProps {
  stats: PersonalStatsData;
  onStatTap?: (statKey: keyof PersonalStatsData) => void;
  style?: any;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  onPress,
}) => {
  return (
    <View style={styles.statCard}>
      <TouchableOpacity
        style={[styles.statCardInner, { borderTopColor: color }]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={!onPress}
      >
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
        {subtitle && (
          <Text style={styles.statSubtitle}>{subtitle}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export const PersonalStatsGrid: React.FC<PersonalStatsGridProps> = ({
  stats,
  onStatTap,
  style,
}) => {
  const statsConfig = [
    {
      key: 'currentLevel' as keyof PersonalStatsData,
      title: '현재 레벨',
      icon: '🏆',
      color: HIGColors.orange,
      subtitle: `다음까지 ${Math.round(stats.nextLevelProgress)}%`,
    },
    {
      key: 'quizAccuracy' as keyof PersonalStatsData,
      title: '퀴즈 정확도',
      icon: '🎯',
      color: HIGColors.green,
      subtitle: '평균 점수',
      format: (val: any) => `${Math.round(val)}%`,
    },
    {
      key: 'favoriteFlavor' as keyof PersonalStatsData,
      title: '선호 향미',
      icon: '💝',
      color: HIGColors.accent,
      subtitle: '가장 좋아하는',
    },
    {
      key: 'uniqueCoffees' as keyof PersonalStatsData,
      title: '이번달 신규',
      icon: '🌟',
      color: HIGColors.blue,
      subtitle: '새로 시도한 커피',
    },
  ];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.grid}>
        {statsConfig.map((config, index) => {
          const value = stats[config.key];
          const displayValue = config.format ? config.format(value) : value;

          return (
            <StatCard
              key={config.key}
              title={config.title}
              value={displayValue}
              subtitle={config.subtitle}
              icon={config.icon}
              color={config.color}
              onPress={onStatTap ? () => onStatTap(config.key) : undefined}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: HIGConstants.SPACING_MD,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_MD,
  },
  statCard: {
    width: CARD_WIDTH,
  },
  statCardInner: {
    backgroundColor: '#FFF8DC',
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    borderTopWidth: 3,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DEB887',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: HIGConstants.SPACING_SM,
  },
  statTitle: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: HIGConstants.SPACING_XS,
  },
  statSubtitle: {
    fontSize: 11,
    color: HIGColors.tertiaryLabel,
  },
});