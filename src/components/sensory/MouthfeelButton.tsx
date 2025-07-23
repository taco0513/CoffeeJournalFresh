import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { HIGConstants, HIGColors, hitSlop } from '../../styles/common';
import { MouthfeelButtonProps } from '../../types/sensory';

export const MouthfeelButton: React.FC<MouthfeelButtonProps> = ({ option, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.mouthfeelButton,
        isSelected && styles.selectedMouthfeel,
      ]}
      onPress={onPress}
      hitSlop={hitSlop.small}
    >
      <Text
        style={[
          styles.mouthfeelText,
          isSelected && styles.selectedMouthfeelText,
        ]}
      >
        {option}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mouthfeelButton: {
    flex: 1,
    minWidth: '45%',
    minHeight: 40,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingVertical: HIGConstants.SPACING_SM,
    paddingHorizontal: HIGConstants.SPACING_SM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMouthfeel: {
    backgroundColor: HIGColors.systemBlue,
    borderColor: HIGColors.systemBlue,
    borderWidth: 1.5,
  },
  mouthfeelText: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
  },
  selectedMouthfeelText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});