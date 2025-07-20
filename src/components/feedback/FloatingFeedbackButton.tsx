import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useFeedbackStore } from '../../stores/useFeedbackStore';
import { HIGColors } from '../../constants/HIG';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 56;
const SAFE_AREA = 20;

export const FloatingFeedbackButton: React.FC<{ visible: boolean }> = ({ visible }) => {
  const { showFeedback } = useFeedbackStore();
  const [expanded, setExpanded] = useState(false);
  
  // Animation values
  const pan = useRef(new Animated.ValueXY({
    x: SCREEN_WIDTH - BUTTON_SIZE - SAFE_AREA,
    y: SCREEN_HEIGHT - BUTTON_SIZE - 200,
  })).current;
  
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Pan responder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only move if dragged more than 5 pixels
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        // Reduce opacity when dragging
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        // Restore opacity
        Animated.timing(opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }).start();

        // If not dragged much, treat as a tap
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          handlePress();
          return;
        }

        // Snap to edges
        const currentX = gestureState.moveX;
        const targetX = currentX < SCREEN_WIDTH / 2 
          ? SAFE_AREA 
          : SCREEN_WIDTH - BUTTON_SIZE - SAFE_AREA;

        Animated.spring(pan.x, {
          toValue: targetX,
          useNativeDriver: false,
          tension: 40,
          friction: 8,
        }).start();

        // Keep within screen bounds
        let targetY = gestureState.moveY - BUTTON_SIZE / 2;
        targetY = Math.max(SAFE_AREA, targetY);
        targetY = Math.min(SCREEN_HEIGHT - BUTTON_SIZE - 100, targetY);

        Animated.spring(pan.y, {
          toValue: targetY,
          useNativeDriver: false,
          tension: 40,
          friction: 8,
        }).start();
      },
    })
  ).current;

  const handlePress = () => {
    // Animate press
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Toggle expanded state or show feedback
    if (expanded) {
      showFeedback();
      setExpanded(false);
    } else {
      setExpanded(true);
      // Auto collapse after 5 seconds
      setTimeout(() => setExpanded(false), 5000);
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale },
          ],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
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