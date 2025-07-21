import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { HIGConstants, HIGColors } from '../../styles/common';
import { SliderSectionProps } from '../../types/sensory';

export const SliderSection = memo<SliderSectionProps>(({ 
  title, 
  value, 
  onValueChange, 
  leftLabel, 
  rightLabel 
}) => {
  return (
    <View style={styles.sliderSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>{leftLabel}</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={5}
          value={value}
          onValueChange={onValueChange}
          step={1}
          minimumTrackTintColor={HIGColors.blue}
          maximumTrackTintColor={HIGColors.gray4}
          thumbTintColor={HIGColors.blue}
        />
        <Text style={styles.sliderLabel}>{rightLabel}</Text>
      </View>
      <Text style={styles.valueText}>{Math.round(value)}</Text>
    </View>
  );
});

SliderSection.displayName = 'SliderSection';

const styles = StyleSheet.create({
  sliderSection: {
    marginBottom: HIGConstants.SPACING_XL,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: HIGConstants.MIN_TOUCH_TARGET,
    marginHorizontal: HIGConstants.SPACING_MD,
  },
  sliderLabel: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    width: 50,
    textAlign: 'center',
  },
  valueText: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.blue,
    textAlign: 'center',
    marginTop: HIGConstants.SPACING_SM,
  },
});