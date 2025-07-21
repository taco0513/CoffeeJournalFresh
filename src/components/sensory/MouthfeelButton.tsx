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
      {isSelected && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mouthfeelButton: {
    width: '48%',
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: HIGColors.gray4,
    borderRadius: HIGConstants.BORDER_RADIUS,
    paddingVertical: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_SM,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: HIGConstants.SPACING_MD,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedMouthfeel: {
    backgroundColor: HIGColors.blue,
    borderColor: HIGColors.blue,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mouthfeelText: {
    fontSize: HIGConstants.FONT_SIZE_MEDIUM,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
  },
  selectedMouthfeelText: {
    color: '#FFFFFF',
  },
  checkmark: {
    position: 'absolute',
    top: 5,
    right: 5,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});