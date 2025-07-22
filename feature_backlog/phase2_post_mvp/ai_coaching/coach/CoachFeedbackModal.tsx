import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { CoachFeedback, CoachTip } from '@/services/LiteAICoachService';
import { HIGColors, HIGConstants } from '@/styles/common';
import { CoachTipCard } from './CoachTipCard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CoachFeedbackModalProps {
  visible: boolean;
  feedback: CoachFeedback | null;
  onClose: () => void;
  onAction?: (action: string) => void;
}

export const CoachFeedbackModal: React.FC<CoachFeedbackModalProps> = ({
  visible,
  feedback,
  onClose,
  onAction,
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && feedback) {
      // Slide up animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, feedback]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!feedback) return null;

  const getOverallEmoji = () => {
    switch (feedback.overall) {
      case 'excellent': return '🌟';
      case 'good': return '👍';
      case 'improving': return '📈';
      case 'needs_practice': return '💪';
    }
  };

  const getOverallColor = () => {
    switch (feedback.overall) {
      case 'excellent': return HIGColors.green;
      case 'good': return HIGColors.blue;
      case 'improving': return HIGColors.orange;
      case 'needs_practice': return HIGColors.secondaryLabel;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity 
          style={styles.overlayTouch} 
          onPress={handleClose}
          activeOpacity={1}
        />
        
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.handle} />
          
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerEmoji}>{getOverallEmoji()}</Text>
              <Text style={[styles.headerTitle, { color: getOverallColor() }]}>
                {feedback.overall.charAt(0).toUpperCase() + feedback.overall.slice(1).replace('_', ' ')}!
              </Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Match Score */}
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Match Score</Text>
              <View style={styles.scoreBar}>
                <Animated.View
                  style={[
                    styles.scoreBarFill,
                    {
                      width: `${feedback.matchScore}%`,
                      backgroundColor: getOverallColor(),
                    },
                  ]}
                />
              </View>
              <Text style={styles.scoreText}>{Math.round(feedback.matchScore)}%</Text>
            </View>

            {/* Encouragement */}
            <View style={styles.encouragementContainer}>
              <Text style={styles.encouragement}>{feedback.encouragement}</Text>
            </View>

            {/* Strengths */}
            {feedback.strengths.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>✨ Strengths</Text>
                {feedback.strengths.map((strength: string, index: number) => (
                  <View key={index} style={styles.bulletPoint}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{strength}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Areas for Improvement */}
            {feedback.improvements.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎯 Areas to Focus</Text>
                {feedback.improvements.map((improvement: string, index: number) => (
                  <View key={index} style={styles.bulletPoint}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{improvement}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Tips */}
            {feedback.tips.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💡 Coach Tips</Text>
                {feedback.tips.map((tip: any, index: number) => (
                  <CoachTipCard
                    key={tip.id}
                    tip={tip}
                    onAction={onAction}
                    style={styles.tipCard}
                  />
                ))}
              </View>
            )}

            {/* Interactive Actions */}
            <View style={styles.actionsSection}>
              <Text style={styles.actionsSectionTitle}>무엇을 도와드릴까요?</Text>
              
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => {
                  handleClose();
                  onAction?.('start-tasting');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.actionIcon}>☕</Text>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>새 테이스팅 시작</Text>
                  <Text style={styles.actionDescription}>AI 코치가 실시간으로 가이드합니다</Text>
                </View>
                <Text style={styles.actionArrow}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => {
                  handleClose();
                  onAction?.('practice-flavors');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.actionIcon}>🎯</Text>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>향미 표현 연습</Text>
                  <Text style={styles.actionDescription}>퀴즈로 향미 감각을 훈련해보세요</Text>
                </View>
                <Text style={styles.actionArrow}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => {
                  handleClose();
                  onAction?.('view-progress');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.actionIcon}>📊</Text>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>내 성장 기록</Text>
                  <Text style={styles.actionDescription}>취향 발전 과정을 확인하세요</Text>
                </View>
                <Text style={styles.actionArrow}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => {
                  handleClose();
                  onAction?.('ask-question');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.actionIcon}>💬</Text>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>질문하기</Text>
                  <Text style={styles.actionDescription}>커피에 대해 궁금한 점을 물어보세요</Text>
                </View>
                <Text style={styles.actionArrow}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.continueText}>나중에 하기</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: HIGConstants.SPACING_LG,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: HIGColors.gray5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_MD,
  },
  scrollContent: {
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_LG,
  },
  headerEmoji: {
    fontSize: 32,
    marginRight: HIGConstants.SPACING_SM,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    padding: HIGConstants.SPACING_SM,
  },
  closeIcon: {
    fontSize: 20,
    color: HIGColors.tertiaryLabel,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_LG,
  },
  scoreLabel: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    marginRight: HIGConstants.SPACING_SM,
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: HIGColors.gray5,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: HIGConstants.SPACING_SM,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    minWidth: 45,
    textAlign: 'right',
  },
  encouragementContainer: {
    backgroundColor: HIGColors.blue + '20',
    padding: HIGConstants.SPACING_MD,
    borderRadius: 12,
    marginBottom: HIGConstants.SPACING_LG,
  },
  encouragement: {
    fontSize: 17,
    color: HIGColors.blue,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: HIGConstants.SPACING_SM,
  },
  bullet: {
    fontSize: 15,
    color: HIGColors.secondaryLabel,
    marginRight: HIGConstants.SPACING_SM,
  },
  bulletText: {
    fontSize: 15,
    color: HIGColors.secondaryLabel,
    flex: 1,
  },
  tipCard: {
    marginBottom: HIGConstants.SPACING_SM,
  },
  continueButton: {
    backgroundColor: HIGColors.gray5,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: HIGConstants.SPACING_MD,
  },
  continueText: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  
  // Interactive Actions Styles
  actionsSection: {
    marginTop: HIGConstants.SPACING_XL,
    marginBottom: HIGConstants.SPACING_LG,
  },
  actionsSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_LG,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: 12,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_MD,
    borderWidth: 1,
    borderColor: HIGColors.gray5,
  },
  actionIcon: {
    fontSize: 28,
    marginRight: HIGConstants.SPACING_MD,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
  },
  actionArrow: {
    fontSize: 20,
    color: HIGColors.tertiaryLabel,
    marginLeft: HIGConstants.SPACING_SM,
  },
});