import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { HIGConstants, HIGColors } from '../../styles/common';
import { FlavorChipProps } from '../../types/flavor';

export const FlavorChip: React.FC<FlavorChipProps> = ({ flavor, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.flavorChip,
        isSelected && styles.flavorChipSelected
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.flavorText,
        isSelected && styles.flavorTextSelected
      ]}>
        {flavor.koreanName}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  flavorChip: {
    backgroundColor: HIGColors.systemGray6,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
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
  },
  flavorTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});