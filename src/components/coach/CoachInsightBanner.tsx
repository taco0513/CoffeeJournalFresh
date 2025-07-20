import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { DailyInsight } from '@/services/LiteAICoachService';
import { HIGColors, HIGConstants } from '@/styles/common';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CoachInsightBannerProps {
  insight: DailyInsight;
  onAction?: () => void;
  style?: any;
}

export const CoachInsightBanner: React.FC<CoachInsightBannerProps> = ({
  insight,
  onAction,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <View style={styles.banner}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>💡</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.fact}>{insight.fact}</Text>
          <Text style={styles.message}>{insight.personalizedMessage}</Text>
          
          <TouchableOpacity
            style={styles.actionContainer}
            onPress={onAction}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>{insight.suggestedAction}</Text>
            <View style={styles.actionIcon}>
              <Text style={styles.actionArrow}>→</Text>
            </View>
          </TouchableOpacity>

          {insight.relatedAchievement && (
            <View style={styles.achievementHint}>
              <Text style={styles.achievementIcon}>🏆</Text>
              <Text style={styles.achievementText}>
                Related to: {insight.relatedAchievement.replace(/_/g, ' ')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    marginVertical: HIGConstants.SPACING_MD,
  },
  banner: {
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: 16,
    padding: HIGConstants.SPACING_LG,
    flexDirection: 'row',
    // Gradient-like shadow
    shadowColor: HIGColors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: HIGColors.blue + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: HIGConstants.SPACING_MD,
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  fact: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  message: {
    fontSize: 15,
    color: HIGColors.secondaryLabel,
    lineHeight: 20,
    marginBottom: HIGConstants.SPACING_MD,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HIGColors.blue,
    borderRadius: 12,
    paddingVertical: HIGConstants.SPACING_SM,
    paddingHorizontal: HIGConstants.SPACING_MD,
    alignSelf: 'flex-start',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.white,
    marginRight: HIGConstants.SPACING_SM,
  },
  actionIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionArrow: {
    color: HIGColors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  achievementHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: HIGConstants.SPACING_SM,
    paddingTop: HIGConstants.SPACING_SM,
    borderTopWidth: 1,
    borderTopColor: HIGColors.gray5,
  },
  achievementIcon: {
    fontSize: 16,
    marginRight: HIGConstants.SPACING_XS,
  },
  achievementText: {
    fontSize: 12,
    color: HIGColors.tertiaryLabel,
    fontStyle: 'italic',
  },
});