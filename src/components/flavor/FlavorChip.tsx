import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated, Dimensions } from 'react-native';
import { HIGConstants, HIGColors } from '../../styles/common';
import { FlavorChipProps } from '../../types/flavor';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export const FlavorChip: React.FC<FlavorChipProps> = ({ flavor, isSelected, onPress, searchQuery }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Get screen dimensions for responsive design
  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth >= 768;
  const renderHighlightedText = (text: string) => {
    if (!searchQuery || searchQuery.trim() === '') {
      return <Text style={[styles.flavorText, isSelected && styles.flavorTextSelected]}>{text}</Text>;
    }

    const query = searchQuery.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(query);

    if (index === -1) {
      return <Text style={[styles.flavorText, isSelected && styles.flavorTextSelected]}>{text}</Text>;
    }

    const before = text.substring(0, index);
    const match = text.substring(index, index + searchQuery.length);
    const after = text.substring(index + searchQuery.length);

    return (
      <Text style={[styles.flavorText, isSelected && styles.flavorTextSelected]}>
        {before}
        <Text style={[styles.highlightedText, isSelected && styles.highlightedTextSelected]}>{match}</Text>
        {after}
      </Text>
    );
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.flavorChip,
          isSelected && styles.flavorChipSelected,
          isTablet && styles.flavorChipTablet
        ]}
        onPressIn={() => {
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }).start();
        }}
        onPressOut={() => {
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }).start();
          ReactNativeHapticFeedback.trigger('selection');
          onPress();
        }}
        accessible={true}
        accessibilityLabel={`${flavor.koreanName} 향미`}
        accessibilityHint={isSelected ? "현재 선택됨. 두 번 탭하여 선택 해제" : "두 번 탭하여 선택"}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
      >
        {renderHighlightedText(flavor.koreanName)}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  flavorChip: {
    backgroundColor: HIGColors.systemGray6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_SM,
    height: 28, // Smallest for individual flavors
    justifyContent: 'center',
  },
  flavorChipSelected: {
    backgroundColor: HIGColors.systemBlue,
  },
  flavorChipTablet: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 32,
    marginRight: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_MD,
  },
  flavorText: {
    fontSize: 14,
    color: HIGColors.label,
    fontWeight: '500',
  },
  flavorTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  highlightedText: {
    backgroundColor: HIGColors.yellow,
    color: HIGColors.label,
    fontWeight: '600',
  },
  highlightedTextSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    color: '#FFFFFF',
    fontWeight: '600',
  },
});