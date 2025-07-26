import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { betaTestingService } from '../../services/BetaTestingService';
import { QuickFeedbackOptions } from '../../types/BetaTestingTypes';
import { HIGColors } from '../../constants/HIG';

interface QuickFeedbackPanelProps {
  onFeedbackSubmitted: () => void;
}

export const QuickFeedbackPanel: React.FC<QuickFeedbackPanelProps> = ({
  onFeedbackSubmitted,
}) => {
  const { t } = useTranslation();

  /**
   * Handle quick feedback submission
   */
  const handleQuickFeedback = (rating: 1 | 2 | 3 | 4 | 5): void => {
    Alert.prompt(
      t('feedbackTitle'),
      t('feedbackPrompt'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('submit'),
          onPress: async (comment?: string) => {
            try {
              await betaTestingService.submitQuickFeedback(rating, comment);
              Alert.alert(t('success'), t('feedbackSubmitted'));
              onFeedbackSubmitted();
          } catch (error) {
              Alert.alert(t('error'), t('feedbackError'));
          }
        },
      },
      ],
      'plain-text'
    );
};

  const renderRatingButton = (rating: 1 | 2 | 3 | 4 | 5, emoji: string, label: string) => (
    <TouchableOpacity
      key={`rating-${rating}`}
      style={styles.ratingButton}
      onPress={() => handleQuickFeedback(rating)}
    >
      <Text style={styles.ratingEmoji}>{emoji}</Text>
      <Text style={styles.ratingLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Feedback</Text>
      <Text style={styles.subtitle}>How is your beta testing experience?</Text>
      
      <View style={styles.ratingGrid}>
        {renderRatingButton(5, '🤩', 'Excellent')}
        {renderRatingButton(4, '😊', 'Good')}
        {renderRatingButton(3, '😐', 'Okay')}
        {renderRatingButton(2, '😞', 'Poor')}
        {renderRatingButton(1, '😤', 'Terrible')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
},
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 4,
},
  subtitle: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    marginBottom: 16,
},
  ratingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
},
  ratingButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HIGColors.separator,
    backgroundColor: HIGColors.systemGray6,
},
  ratingEmoji: {
    fontSize: 24,
    marginBottom: 4,
},
  ratingLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: HIGColors.label,
    textAlign: 'center',
},
});

export default QuickFeedbackPanel;