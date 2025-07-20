import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useFeedbackStore } from '../../stores/useFeedbackStore';
import { HIGColors, HIGConstants } from '../../constants/HIG';

interface BetaFeedbackPromptProps {
  screenName: string;
  context?: string;
  delayMs?: number;
}

export const BetaFeedbackPrompt: React.FC<BetaFeedbackPromptProps> = ({
  screenName,
  context,
  delayMs = 3000, // Show after 3 seconds by default
}) => {
  const { showFeedback } = useFeedbackStore();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const fadeAnim = new Animated.Value(0);

  // Track if user has already given feedback for this screen
  const [hasGivenFeedback, setHasGivenFeedback] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or feedback given
    if (dismissed || hasGivenFeedback) return;

    // Show prompt after delay
    const timer = setTimeout(() => {
      setVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, delayMs);

    return () => clearTimeout(timer);
  }, [dismissed, hasGivenFeedback, delayMs]);

  const handleFeedback = () => {
    setHasGivenFeedback(true);
    setVisible(false);
    showFeedback(screenName, context);
  };

  const handleDismiss = () => {
    setDismissed(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[styles.container, { opacity: fadeAnim }]}
      pointerEvents="box-none"
    >
      <View style={styles.prompt}>
        <View style={styles.header}>
          <Text style={styles.title}>💬 Beta Feedback</Text>
          <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.message}>
          How's your experience with {screenName}? Your feedback helps improve the app!
        </Text>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.feedbackButton} 
            onPress={handleFeedback}
          >
            <Text style={styles.feedbackText}>Give Feedback</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.laterButton} 
            onPress={handleDismiss}
          >
            <Text style={styles.laterText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: HIGConstants.SPACING_MD,
    right: HIGConstants.SPACING_MD,
    zIndex: 1000,
  },
  prompt: {
    backgroundColor: HIGColors.systemBackground,
    borderRadius: HIGConstants.RADIUS_LG,
    padding: HIGConstants.SPACING_MD,
    shadowColor: HIGColors.label,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: HIGColors.systemBlue,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
  },
  closeButton: {
    padding: HIGConstants.SPACING_XS,
  },
  closeText: {
    fontSize: 20,
    color: HIGColors.secondaryLabel,
    fontWeight: '300',
  },
  message: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    lineHeight: 20,
    marginBottom: HIGConstants.SPACING_MD,
  },
  actions: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_SM,
  },
  feedbackButton: {
    flex: 1,
    backgroundColor: HIGColors.systemBlue,
    paddingVertical: HIGConstants.SPACING_SM,
    paddingHorizontal: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.RADIUS_MD,
    alignItems: 'center',
  },
  feedbackText: {
    color: HIGColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  laterButton: {
    flex: 1,
    backgroundColor: HIGColors.systemGray6,
    paddingVertical: HIGConstants.SPACING_SM,
    paddingHorizontal: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.RADIUS_MD,
    alignItems: 'center',
  },
  laterText: {
    color: HIGColors.label,
    fontSize: 14,
    fontWeight: '500',
  },
});