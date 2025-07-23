import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFeedbackStore } from '../../stores/useFeedbackStore';
import { HIGColors, HIGConstants } from '../../constants/HIG';

const FIRST_TIME_FEEDBACK_KEY = '@first_time_feedback_shown';

export const FirstTimeUserFeedback: React.FC = () => {
  const { showFeedback } = useFeedbackStore();
  const [visible, setVisible] = useState(false);
  const [hasShown, setHasShown] = useState(true); // Default to true until we check
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    checkFirstTimeUser();
  }, []);

  const checkFirstTimeUser = async () => {
    try {
      const hasShownBefore = await AsyncStorage.getItem(FIRST_TIME_FEEDBACK_KEY);
      
      if (!hasShownBefore) {
        // Show after 30 seconds for first-time users
        setTimeout(() => {
          setHasShown(false);
          setVisible(true);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }, 30000); // 30 seconds
      }
    } catch (error) {
      console.error('Error checking first time user:', error);
    }
  };

  const handleFeedback = async () => {
    try {
      await AsyncStorage.setItem(FIRST_TIME_FEEDBACK_KEY, 'true');
      setVisible(false);
      showFeedback('App First Impression', 'First-time user experience after 30 seconds');
    } catch (error) {
      console.error('Error storing first time feedback flag:', error);
    }
  };

  const handleDismiss = async () => {
    try {
      await AsyncStorage.setItem(FIRST_TIME_FEEDBACK_KEY, 'true');
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    } catch (error) {
      console.error('Error storing first time feedback flag:', error);
    }
  };

  if (hasShown || !visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[styles.modal, { opacity: fadeAnim }]}
        >
          <View style={styles.header}>
            <Text style={styles.emoji}>👋</Text>
            <Text style={styles.title}>Welcome to CupNote Beta!</Text>
          </View>
          
          <Text style={styles.message}>
            You've been exploring the app for a bit now. We'd love to hear your first impressions! 
            Your feedback helps us build a better coffee experience.
          </Text>
          
          <View style={styles.features}>
            <Text style={styles.featureText}>✨ What do you love?</Text>
            <Text style={styles.featureText}>🤔 What's confusing?</Text>
            <Text style={styles.featureText}>💡 What's missing?</Text>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.feedbackButton} 
              onPress={handleFeedback}
            >
              <Text style={styles.feedbackText}>Share Feedback</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.laterButton} 
              onPress={handleDismiss}
            >
              <Text style={styles.laterText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: HIGConstants.SPACING_LG,
  },
  modal: {
    backgroundColor: HIGColors.systemBackground,
    borderRadius: HIGConstants.RADIUS_LG,
    padding: HIGConstants.SPACING_LG,
    width: '100%',
    maxWidth: 340,
    shadowColor: HIGColors.label,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_MD,
  },
  emoji: {
    fontSize: 48,
    marginBottom: HIGConstants.SPACING_SM,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: HIGColors.label,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_LG,
  },
  features: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  featureText: {
    fontSize: 14,
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
    textAlign: 'center',
  },
  actions: {
    gap: HIGConstants.SPACING_SM,
  },
  feedbackButton: {
    backgroundColor: HIGColors.systemBlue,
    paddingVertical: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_LG,
    borderRadius: HIGConstants.RADIUS_MD,
    alignItems: 'center',
    shadowColor: HIGColors.systemBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackText: {
    color: HIGColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  laterButton: {
    paddingVertical: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_LG,
    alignItems: 'center',
  },
  laterText: {
    color: HIGColors.secondaryLabel,
    fontSize: 16,
    fontWeight: '500',
  },
});