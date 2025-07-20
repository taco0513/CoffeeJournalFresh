import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { CoachTip } from '@/services/LiteAICoachService';
import { HIGColors, HIGConstants } from '@/styles/common';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CoachTipCardProps {
  tip: CoachTip;
  onAction?: (action: string) => void;
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
  style?: any;
}

export const CoachTipCard: React.FC<CoachTipCardProps> = ({
  tip,
  onAction,
  onDismiss,
  autoHide = false,
  autoHideDelay = 5000,
  style,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(-20);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide timer
    if (autoHide && autoHideDelay > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onDismiss?.();
    });
  };

  const handleAction = () => {
    if (tip.actionable && onAction) {
      onAction(tip.actionable.action);
    }
  };

  if (!isVisible) return null;

  const priorityColors = {
    high: HIGColors.red,
    medium: HIGColors.blue,
    low: HIGColors.secondaryLabel,
  };

  const typeIcons = {
    guidance: '🧭',
    feedback: '💬',
    insight: '💡',
    challenge: '🎯',
    encouragement: '🌟',
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
    >
      <View style={[styles.card, { borderLeftColor: priorityColors[tip.priority] }]}>
        <View style={styles.header}>
          <Text style={styles.icon}>{tip.icon || typeIcons[tip.type]}</Text>
          <Text style={styles.title}>{tip.title}</Text>
        </View>

        <Text style={styles.message}>{tip.message}</Text>

        {tip.actionable && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAction}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>{tip.actionable.text}</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    marginVertical: HIGConstants.SPACING_SM,
  },
  card: {
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: 12,
    padding: HIGConstants.SPACING_MD,
    borderLeftWidth: 4,
    // Subtle shadow
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  icon: {
    fontSize: 24,
    marginRight: HIGConstants.SPACING_SM,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    color: HIGColors.label,
  },
  message: {
    fontSize: 15,
    color: HIGColors.secondaryLabel,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    paddingHorizontal: HIGConstants.SPACING_MD,
    backgroundColor: HIGColors.blue + '20',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.blue,
  },
  actionArrow: {
    fontSize: 18,
    color: HIGColors.blue,
  },
});