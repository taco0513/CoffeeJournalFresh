import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { HIGColors, HIGConstants } from '../../styles/common';
import { Achievement } from '../../services/AchievementSystem';

interface AchievementNotificationProps {
  visible: boolean;
  achievement: Achievement | null;
  celebrationType: 'subtle' | 'normal' | 'epic';
  onDismiss: () => void;
  onReplay?: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  visible,
  achievement,
  celebrationType,
  onDismiss,
  onReplay,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const confettiAnims = useRef(
    Array.from({ length: 20 }, () => ({
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      rotation: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    if (visible && achievement) {
      // Entry animation
      // Reset animations before starting
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Confetti animation for epic achievements
      if (celebrationType === 'epic') {
        startConfettiAnimation();
      }

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => {
        clearTimeout(timer);
        // Clean up animations
        fadeAnim.stopAnimation();
        scaleAnim.stopAnimation();
        // Clean up confetti animations
        confettiAnims.forEach(anim => {
          anim.translateX.stopAnimation();
          anim.translateY.stopAnimation();
          anim.rotation.stopAnimation();
          anim.opacity.stopAnimation();
        });
      };
    } else {
      // Exit animation
      // Stop any running animations before starting new ones
      fadeAnim.stopAnimation();
      scaleAnim.stopAnimation();
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, achievement, celebrationType, onDismiss]);

  const startConfettiAnimation = () => {
    // Reset confetti animations
    confettiAnims.forEach(anim => {
      anim.translateX.setValue(0);
      anim.translateY.setValue(0);
      anim.rotation.setValue(0);
      anim.opacity.setValue(0);
    });
    
    const animations = confettiAnims.map((anim, index) => {
      const randomX = Math.random() * screenWidth;
      const randomRotation = Math.random() * 360;
      const delay = Math.random() * 500;

      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: randomX - screenWidth / 2,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: screenHeight,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotation, {
            toValue: randomRotation,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start();
  };

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

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

  const formatReward = (reward: any) => {
    if (reward.type === 'points') {
      return `+${reward.value} 포인트`;
    }
    return reward.value;
  };

  const getContainerStyle = () => {
    switch (celebrationType) {
      case 'subtle':
        return styles.subtleContainer;
      case 'epic':
        return styles.epicContainer;
      default:
        return styles.normalContainer;
    }
  };

  if (!achievement) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <TouchableWithoutFeedback onPress={handleDismiss}>
        <Animated.View 
          style={[
            styles.overlay,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                getContainerStyle(),
                {
                  transform: [
                    { scale: scaleAnim },
                  ],
                },
              ]}
            >
              {/* Confetti Particles */}
              {celebrationType === 'epic' && (
                <View style={styles.confettiContainer}>
                  {confettiAnims.map((anim, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.confettiParticle,
                        {
                          transform: [
                            { translateX: anim.translateX },
                            { translateY: anim.translateY },
                            { rotate: anim.rotation.interpolate({
                              inputRange: [0, 360],
                              outputRange: ['0deg', '360deg'],
                            }) },
                          ],
                          opacity: anim.opacity,
                        },
                      ]}
                    />
                  ))}
                </View>
              )}

              {/* Achievement Content */}
              <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.headerText}>🎉 업적 달성!</Text>
                </View>

                {/* Achievement Info */}
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>
                  
                  {/* Rarity Badge */}
                  <View style={[
                    styles.rarityBadge,
                    { backgroundColor: getRarityColor(achievement.rarity) }
                  ]}>
                    <Text style={styles.rarityText}>
                      {achievement.rarity.toUpperCase()}
                    </Text>
                  </View>

                  {/* Reward */}
                  <Text style={styles.rewardText}>
                    {formatReward(achievement.rewards)}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  {onReplay && (
                    <TouchableOpacity 
                      style={styles.replayButton}
                      onPress={onReplay}
                    >
                      <Text style={styles.replayButtonText}>다시보기</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.dismissButton}
                    onPress={handleDismiss}
                  >
                    <Text style={styles.dismissButtonText}>확인</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: HIGConstants.SPACING_LG,
  },
  container: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.BORDER_RADIUS_LG,
    padding: HIGConstants.SPACING_XL,
    maxWidth: 320,
    width: '100%',
    alignItems: 'center',
  },
  subtleContainer: {
    borderWidth: 2,
    borderColor: HIGColors.systemGray4,
  },
  normalContainer: {
    borderWidth: 2,
    borderColor: HIGColors.systemBlue,
    shadowColor: HIGColors.systemBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  epicContainer: {
    borderWidth: 3,
    borderColor: HIGColors.systemOrange,
    shadowColor: HIGColors.systemOrange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  confettiParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: HIGColors.systemOrange,
    borderRadius: 4,
  },
  content: {
    alignItems: 'center',
  },
  header: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: HIGColors.label,
  },
  achievementInfo: {
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_LG,
  },
  achievementIcon: {
    fontSize: 60,
    marginBottom: HIGConstants.SPACING_MD,
  },
  achievementTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  achievementDescription: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: HIGConstants.SPACING_MD,
  },
  rarityBadge: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_XS,
    borderRadius: HIGConstants.cornerRadiusSmall,
    marginBottom: HIGConstants.SPACING_SM,
  },
  rarityText: {
    color: HIGColors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  rewardText: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.systemGreen,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_MD,
  },
  replayButton: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.cornerRadiusMedium,
    borderWidth: 1,
    borderColor: HIGColors.systemBlue,
  },
  replayButtonText: {
    color: HIGColors.systemBlue,
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.cornerRadiusMedium,
    backgroundColor: HIGColors.systemBlue,
  },
  dismissButtonText: {
    color: HIGColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});