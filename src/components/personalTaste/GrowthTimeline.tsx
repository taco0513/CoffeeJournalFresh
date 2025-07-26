import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { HIGColors, HIGConstants } from '@/styles/common';

interface GrowthMilestone {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: 'achievement' | 'discovery' | 'level_up' | 'milestone';
  icon: string;
  data?: Record<string, string | number | boolean>;
}

interface GrowthTimelineProps {
  milestones: GrowthMilestone[];
  currentWeek: number;
  onMilestoneTap?: (milestone: GrowthMilestone) => void;
  style?: StyleProp<ViewStyle>;
}

export const GrowthTimeline: React.FC<GrowthTimelineProps> = ({
  milestones,
  currentWeek,
  onMilestoneTap,
  style,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
  }).start();

    // Scroll to current week
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: currentWeek * 100 - 50,
        animated: true,
    });
  }, 100);
}, [currentWeek]);

  const getTypeColor = (type: GrowthMilestone['type']): string => {
    switch (type) {
      case 'achievement':
        return HIGColors.accent;
      case 'discovery':
        return HIGColors.blue;
      case 'level_up':
        return HIGColors.green;
      case 'milestone':
        return HIGColors.orange;
      default:
        return HIGColors.gray;
  }
};

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
  });
};

  const renderMilestone = (milestone: GrowthMilestone, index: number) => {
    const isLast = index === milestones.length - 1;
    const typeColor = getTypeColor(milestone.type);

    return (
      <Animated.View
        key={milestone.id}
        style={[
          styles.milestoneContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
              }),
            },
            ],
        },
        ]}
      >
        {/* Timeline Line */}
        {!isLast && <View style={styles.timelineLine} />}

        {/* Milestone Node */}
        <TouchableOpacity
          style={[styles.milestoneNode, { borderColor: typeColor }]}
          onPress={() => onMilestoneTap?.(milestone)}
          activeOpacity={0.8}
          disabled={!onMilestoneTap}
        >
          <View style={[styles.nodeInner, { backgroundColor: typeColor }]}>
            <Text style={styles.nodeIcon}>{milestone.icon}</Text>
          </View>
        </TouchableOpacity>

        {/* Milestone Content */}
        <TouchableOpacity
          style={styles.milestoneContent}
          onPress={() => onMilestoneTap?.(milestone)}
          activeOpacity={0.9}
          disabled={!onMilestoneTap}
        >
          <View style={styles.contentHeader}>
            <Text style={styles.milestoneDate}>{formatDate(milestone.date)}</Text>
            <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
              <Text style={styles.typeBadgeText}>
                {milestone.type.replace('_', ' ')}
              </Text>
            </View>
          </View>
          
          <Text style={styles.milestoneTitle}>{milestone.title}</Text>
          <Text style={styles.milestoneDescription}>{milestone.description}</Text>

          {milestone.data && (
            <View style={styles.milestoneData}>
              {milestone.data.score && (
                <Text style={styles.dataText}>
                  점수: {milestone.data.score}
                </Text>
              )}
              {milestone.data.flavor && (
                <Text style={styles.dataText}>
                  향미: {milestone.data.flavor}
                </Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
};

  // Group milestones by week
  const groupedMilestones = milestones.reduce((acc, milestone) => {
    const weekNumber = Math.floor(
      (new Date().getTime() - milestone.date.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    if (!acc[weekNumber]) {
      acc[weekNumber] = [];
  }
    acc[weekNumber].push(milestone);
    return acc;
}, {} as Record<number, GrowthMilestone[]>);

  return (
    <Animated.View style={[styles.container, style]}>
      {/* Week Indicator */}
      <View style={styles.weekIndicator}>
        <Text style={styles.weekText}>Week {currentWeek}</Text>
        <Text style={styles.weekSubtext}>
          {milestones.length}개의 이정표
        </Text>
      </View>

      {/* Timeline */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.timelineContainer}
        showsVerticalScrollIndicator={false}
      >
        {milestones.length > 0 ? (
          milestones.map((milestone, index) => renderMilestone(milestone, index))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📅</Text>
            <Text style={styles.emptyStateText}>
              커피 여정이 여기에 기록됩니다
            </Text>
          </View>
        )}

        {/* Future Milestone Preview */}
        <View style={styles.futureMilestone}>
          <View style={[styles.milestoneNode, styles.futureNode]}>
            <Text style={styles.futureIcon}>?</Text>
          </View>
          <View style={styles.futureContent}>
            <Text style={styles.futureTitle}>다음 이정표는?</Text>
            <Text style={styles.futureText}>
              계속 테이스팅하고 새로운 발견을 해보세요!
            </Text>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
},
  weekIndicator: {
    paddingVertical: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    marginBottom: HIGConstants.SPACING_MD,
},
  weekText: {
    fontSize: 18,
    fontWeight: '700',
    color: HIGColors.label,
},
  weekSubtext: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    marginTop: 2,
},
  timelineContainer: {
    paddingHorizontal: HIGConstants.SPACING_MD,
},
  milestoneContainer: {
    flexDirection: 'row',
    marginBottom: HIGConstants.SPACING_LG,
    position: 'relative',
},
  timelineLine: {
    position: 'absolute',
    left: 20,
    top: 40,
    bottom: -HIGConstants.SPACING_LG,
    width: 2,
    backgroundColor: HIGColors.gray5,
},
  milestoneNode: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    backgroundColor: HIGColors.systemBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: HIGConstants.SPACING_MD,
    zIndex: 1,
},
  nodeInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
},
  nodeIcon: {
    fontSize: 16,
},
  milestoneContent: {
    flex: 1,
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
},
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_XS,
},
  milestoneDate: {
    fontSize: 12,
    color: HIGColors.tertiaryLabel,
},
  typeBadge: {
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: 2,
    borderRadius: 10,
},
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: HIGColors.white,
    textTransform: 'uppercase',
},
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
},
  milestoneDescription: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    lineHeight: 18,
},
  milestoneData: {
    marginTop: HIGConstants.SPACING_SM,
    paddingTop: HIGConstants.SPACING_SM,
    borderTopWidth: 1,
    borderTopColor: HIGColors.gray5,
},
  dataText: {
    fontSize: 12,
    color: HIGColors.tertiaryLabel,
    marginBottom: 2,
},
  emptyState: {
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_XL * 2,
},
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: HIGConstants.SPACING_MD,
},
  emptyStateText: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
},
  futureMilestone: {
    flexDirection: 'row',
    marginBottom: HIGConstants.SPACING_XL,
    opacity: 0.5,
},
  futureNode: {
    borderStyle: 'dashed',
    borderColor: HIGColors.gray,
},
  futureIcon: {
    fontSize: 20,
    color: HIGColors.gray,
},
  futureContent: {
    flex: 1,
    padding: HIGConstants.SPACING_MD,
},
  futureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
},
  futureText: {
    fontSize: 14,
    color: HIGColors.tertiaryLabel,
},
});