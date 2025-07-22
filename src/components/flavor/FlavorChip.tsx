import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { HIGConstants, HIGColors } from '../../styles/common';
import { FlavorChipProps } from '../../types/flavor';

export const FlavorChip: React.FC<FlavorChipProps> = ({ flavor, isSelected, onPress, searchQuery }) => {
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
    <TouchableOpacity
      style={[
        styles.flavorChip,
        isSelected && styles.flavorChipSelected
      ]}
      onPress={onPress}
      accessible={true}
      accessibilityLabel={`${flavor.koreanName} 향미`}
      accessibilityHint="탭하여 선택 또는 선택 해제"
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
    >
      {renderHighlightedText(flavor.koreanName)}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  flavorChip: {
    backgroundColor: HIGColors.systemGray6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_SM,
  },
  flavorChipSelected: {
    backgroundColor: HIGColors.systemBlue,
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