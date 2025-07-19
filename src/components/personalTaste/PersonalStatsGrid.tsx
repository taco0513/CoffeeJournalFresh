import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
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
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  onPress,
  delay,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
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
    </Animated.View>
  );
};

export const PersonalStatsGrid: React.FC<PersonalStatsGridProps> = ({
  stats,
  onStatTap,
  style,
}) => {
  const statsConfig = [
    {
      key: 'totalTastings' as keyof PersonalStatsData,
      title: '총 테이스팅',
      icon: '☕',
      color: HIGColors.brown,
      subtitle: '지금까지의 여정',
    },
    {
      key: 'uniqueCoffees' as keyof PersonalStatsData,
      title: '다양한 커피',
      icon: '🌍',
      color: HIGColors.blue,
      subtitle: '탐험한 종류',
    },
    {
      key: 'favoriteFlavor' as keyof PersonalStatsData,
      title: '선호 향미',
      icon: '💝',
      color: HIGColors.accent,
      subtitle: '가장 좋아하는',
    },
    {
      key: 'vocabularySize' as keyof PersonalStatsData,
      title: '향미 어휘',
      icon: '📚',
      color: HIGColors.purple,
      subtitle: '단어 수',
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
      key: 'currentLevel' as keyof PersonalStatsData,
      title: '현재 레벨',
      icon: '🏆',
      color: HIGColors.orange,
      subtitle: `다음까지 ${Math.round(stats.nextLevelProgress)}%`,
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
              delay={index * 50}
            />
          );
        })}
      </View>

      {/* Summary Card */}
      <Animated.View
        style={[
          styles.summaryCard,
          {
            opacity: new Animated.Value(1),
            transform: [
              {
                translateY: new Animated.Value(0),
              },
            ],
          },
        ]}
      >
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>커피 여정 요약</Text>
          <Text style={styles.summaryIcon}>📊</Text>
        </View>
        
        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>평균 매칭 점수</Text>
            <Text style={styles.summaryValue}>
              {stats.averageMatchScore || 0}점
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>즐겨찾는 로스터리</Text>
            <Text style={styles.summaryValue}>
              {stats.favoriteRoaster}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>탐험한 로스터리</Text>
            <Text style={styles.summaryValue}>
              {stats.uniqueRoasters}곳
            </Text>
          </View>
        </View>
      </Animated.View>
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
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    borderTopWidth: 3,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
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
  summaryCard: {
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_LG,
    borderWidth: 1,
    borderColor: HIGColors.gray5,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_MD,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  summaryIcon: {
    fontSize: 24,
  },
  summaryContent: {
    gap: HIGConstants.SPACING_SM,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_XS,
  },
  summaryLabel: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.label,
  },
});