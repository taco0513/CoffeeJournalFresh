import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { HIGConstants, HIGColors, hitSlop } from '../../styles/common';
import { MouthfeelButtonProps } from '../../types/sensory';

export const MouthfeelButton: React.FC<MouthfeelButtonProps> = ({ mouthfeel, isSelected, onPress }) => {
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
        {mouthfeel}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mouthfeelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
    minHeight: 32,
},
  selectedMouthfeel: {
    backgroundColor: HIGColors.systemBlue,
    borderColor: HIGColors.systemBlue,
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
    shadowColor: HIGColors.systemBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
},
  mouthfeelText: {
    fontSize: 13,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
},
  selectedMouthfeelText: {
    color: '#FFFFFF',
    fontWeight: '700',
},
});