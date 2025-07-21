import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useFeedbackStore } from '../../stores/useFeedbackStore';
import { HIGColors } from '../../constants/HIG';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 56;
const SAFE_AREA = 20;

export const FloatingFeedbackButton: React.FC<{ visible: boolean }> = ({ visible }) => {
  const { showSmartFeedback } = useFeedbackStore();
  const [expanded, setExpanded] = useState(false);

  const handlePress = () => {
    if (expanded) {
      showSmartFeedback();
      setExpanded(false);
    } else {
      setExpanded(true);
      // Auto collapse after 5 seconds
      setTimeout(() => setExpanded(false), 5000);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, expanded && styles.buttonExpanded]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {expanded ? (
          <View style={styles.expandedContent}>
            <Text style={styles.expandedText}>피드백</Text>
            <Text style={styles.expandedSubtext}>탭하여 열기</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>💭</Text>
        )}
      </TouchableOpacity>
      
      {/* Beta Badge */}
      <View style={styles.betaBadge}>
        <Text style={styles.betaBadgeText}>BETA</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120, // Above tab bar
    right: SAFE_AREA,
    zIndex: 9999,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: HIGColors.systemBlue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonExpanded: {
    width: 120,
    borderRadius: 28,
  },
  buttonText: {
    fontSize: 28,
  },
  expandedContent: {
    alignItems: 'center',
  },
  expandedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  expandedSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    marginTop: 2,
  },
  betaBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: HIGColors.systemOrange,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  betaBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
});