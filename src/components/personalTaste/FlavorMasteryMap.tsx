import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { HIGColors, HIGConstants } from '@/styles/common';
import { MasteryLevel } from '@/types/personalTaste';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - HIGConstants.SPACING_LG * 2 - HIGConstants.SPACING_SM * 2) / 3;

interface FlavorCategory {
  id: string;
  name: string;
  color: string;
  emoji?: string;
}

interface FlavorMasteryMapProps {
  categories: FlavorCategory[];
  masteryLevels: MasteryLevel[];
  layout?: 'grid' | 'wheel' | 'tree';
  onCategorySelect?: (category: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const FlavorMasteryMap: React.FC<FlavorMasteryMapProps> = ({
  categories,
  masteryLevels,
  layout = 'grid',
  onCategorySelect,
  style,
}) => {
  const animatedValues = useRef(
    categories.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Reset animations when categories change
    animatedValues.forEach(anim => anim.setValue(0));
    
    // Staggered animation with proper completion
    const animations = animatedValues.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * 80,
        useNativeDriver: true,
    })
    );

    Animated.stagger(80, animations).start(() => {
      // Animation complete - ensure all values are at final state
      animatedValues.forEach(anim => anim.setValue(1));
  });
}, [categories.length]);

  const getMasteryColor = (score: number): string => {
    if (score >= 90) return HIGColors.green;
    if (score >= 75) return HIGColors.blue;
    if (score >= 50) return HIGColors.orange;
    if (score >= 25) return HIGColors.yellow;
    return HIGColors.gray;
};

  const getMasteryEmoji = (level: number | string): string => {
    const emojiMap: Record<string, string> = {
      novice: '🌱',
      apprentice: '🌿',
      proficient: '🌳',
      expert: '🏆',
      master: '👑',
  };
    
    // Convert numeric level to string representation
    let levelKey = typeof level === 'string' ? level : 'novice';
    if (typeof level === 'number') {
      if (level >= 5) levelKey = 'master';
      else if (level >= 4) levelKey = 'expert';
      else if (level >= 3) levelKey = 'proficient';
      else if (level >= 2) levelKey = 'apprentice';
      else levelKey = 'novice';
  }
    
    return emojiMap[levelKey] || '🌱';
};

  const getCategoryEmoji = (categoryName: string): string => {
    const emojiMap: Record<string, string> = {
      fruity: '🍓',
      floral: '🌸',
      sweet: '🍯',
      nutty: '🥜',
      chocolate: '🍫',
      spices: '🌶️',
      roasted: '☕',
      vegetal: '🌿',
      sour: '🍋',
      other: '✨',
  };
    return emojiMap[categoryName.toLowerCase()] || '☕';
};

  const renderGridLayout = () => {
    return (
      <View style={styles.gridContainer}>
        {categories.map((category, index) => {
          const mastery = masteryLevels.find(m => m.category === category.id);
          const score = mastery?.score || 0;
          const color = getMasteryColor(score);
          const emoji = category.emoji || getCategoryEmoji(category.name);
          const levelEmoji = getMasteryEmoji(mastery?.level || 'novice');

          return (
            <Animated.View
              key={category.id}
              style={[
                styles.gridItem,
                {
                  opacity: animatedValues[index],
                  transform: [
                    {
                      scale: animatedValues[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                        extrapolate: 'clamp',
                    }),
                  },
                    {
                      translateY: animatedValues[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                        extrapolate: 'clamp',
                    }),
                  },
                  ],
              },
              ]}
            >
              <TouchableOpacity
                style={[styles.categoryCard, { borderColor: color }]}
                onPress={() => onCategorySelect?.(category.id)}
                activeOpacity={0.8}
              >
                {/* Progress Ring */}
                <View style={styles.progressRing}>
                  <View style={[styles.progressRingOuter, { borderColor: color }]}>
                    <View style={[styles.progressRingInner, { borderColor: color }]}>
                      <Text style={styles.categoryEmoji}>{emoji}</Text>
                    </View>
                  </View>
                  {/* Progress Arc - Simplified for now */}
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        backgroundColor: color,
                        height: `${score}%`,
                    }
                    ]} 
                  />
                </View>

                {/* Category Info */}
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={[styles.masteryScore, { color }]}>
                  {Math.round(score)}%
                </Text>

                {/* Level Badge */}
                <View style={[styles.levelBadge, { backgroundColor: color }]}>
                  <Text style={styles.levelEmoji}>{levelEmoji}</Text>
                  <Text style={styles.levelText}>
                    {mastery?.level || 'novice'}
                  </Text>
                </View>

                {/* Stats */}
                {mastery && (
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {mastery.totalExposures}
                      </Text>
                      <Text style={styles.statLabel}>시도</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {Math.round((mastery.accuracyRate ?? 0) * 100)}%
                      </Text>
                      <Text style={styles.statLabel}>정확도</Text>
                    </View>
                  </View>
                )}

                {/* Progress to Next */}
                {mastery && (
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>
                      {mastery.nextMilestone}
                    </Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { 
                            width: `${(mastery.progressToNext ?? 0) * 100}%`,
                            backgroundColor: color,
                        },
                        ]}
                      />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
      })}
      </View>
    );
};

  const renderWheelLayout = () => {
    // Simplified wheel layout - could be enhanced with actual circular positioning
    return (
      <View style={styles.wheelContainer}>
        <Text style={styles.comingSoon}>Wheel layout coming soon!</Text>
      </View>
    );
};

  const renderTreeLayout = () => {
    // Simplified tree layout - could be enhanced with hierarchical view
    return (
      <View style={styles.treeContainer}>
        <Text style={styles.comingSoon}>Tree layout coming soon!</Text>
      </View>
    );
};

  const renderLayout = () => {
    switch (layout) {
      case 'wheel':
        return renderWheelLayout();
      case 'tree':
        return renderTreeLayout();
      default:
        return renderGridLayout();
  }
};

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.totalMastery}>
          전체 마스터리: {Math.round(
            masteryLevels.reduce((sum, m) => sum + (m.score ?? 0), 0) / 
            Math.max(masteryLevels.length, 1)
          )}%
        </Text>
      </View>

      {/* Mastery Map */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderLayout()}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: HIGColors.gray }]} />
          <Text style={styles.legendText}>초보</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: HIGColors.yellow }]} />
          <Text style={styles.legendText}>학습중</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: HIGColors.orange }]} />
          <Text style={styles.legendText}>숙련</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: HIGColors.blue }]} />
          <Text style={styles.legendText}>전문가</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: HIGColors.green }]} />
          <Text style={styles.legendText}>마스터</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
},
  header: {
    marginBottom: HIGConstants.SPACING_MD,
},
  totalMastery: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
},
  scrollContent: {
    paddingBottom: HIGConstants.SPACING_MD,
},
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HIGConstants.SPACING_SM,
},
  gridItem: {
    width: CARD_WIDTH,
    marginBottom: HIGConstants.SPACING_SM,
},
  categoryCard: {
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    borderWidth: 2,
    alignItems: 'center',
    minHeight: 180,
},
  progressRing: {
    width: 60,
    height: 60,
    marginBottom: HIGConstants.SPACING_SM,
    position: 'relative',
},
  progressRingOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
},
  progressRingInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
},
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.2,
    borderRadius: 30,
},
  categoryEmoji: {
    fontSize: 28,
},
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
},
  masteryScore: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: HIGConstants.SPACING_SM,
},
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: HIGConstants.SPACING_SM,
},
  levelEmoji: {
    fontSize: 14,
    marginRight: 4,
},
  levelText: {
    fontSize: 11,
    fontWeight: '600',
    color: HIGColors.white,
    textTransform: 'capitalize',
},
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
},
  statItem: {
    flex: 1,
    alignItems: 'center',
},
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.label,
},
  statLabel: {
    fontSize: 10,
    color: HIGColors.tertiaryLabel,
},
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: HIGColors.gray5,
    marginHorizontal: HIGConstants.SPACING_SM,
},
  progressInfo: {
    width: '100%',
},
  progressText: {
    fontSize: 10,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
    textAlign: 'center',
},
  progressBar: {
    height: 4,
    backgroundColor: HIGColors.gray5,
    borderRadius: 2,
    overflow: 'hidden',
},
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
},
  wheelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
},
  treeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
},
  comingSoon: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    fontStyle: 'italic',
},
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: HIGConstants.SPACING_MD,
    marginTop: HIGConstants.SPACING_MD,
    paddingTop: HIGConstants.SPACING_MD,
    borderTopWidth: 1,
    borderTopColor: HIGColors.gray5,
},
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HIGConstants.SPACING_XS,
},
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
},
  legendText: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
},
});