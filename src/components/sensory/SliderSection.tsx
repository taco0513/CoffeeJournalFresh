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
  rightLabel,
  description
}) => {
  return (
    <View style={styles.sliderSection}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>
      <View style={styles.sliderWrapper}>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={5}
          value={value}
          onValueChange={onValueChange}
          step={1}
          minimumTrackTintColor={HIGColors.systemBlue}
          maximumTrackTintColor={HIGColors.systemGray5}
          thumbTintColor={HIGColors.systemBlue}
        />
        <View style={styles.labelContainer}>
          <Text style={styles.sliderLabel}>{leftLabel}</Text>
          <Text style={styles.sliderLabel}>{rightLabel}</Text>
        </View>
      </View>
    </View>
  );
});

SliderSection.displayName = 'SliderSection';

const styles = StyleSheet.create({
  sliderSection: {
    marginBottom: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_SM,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: HIGConstants.SPACING_SM,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: 2,
  },
  sliderWrapper: {
    paddingHorizontal: 0,
  },
  slider: {
    height: 44,
    marginHorizontal: 0,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  sliderLabel: {
    fontSize: 11,
    color: HIGColors.tertiaryLabel,
    fontWeight: '400',
  },
  description: {
    fontSize: 11,
    lineHeight: 15,
    color: HIGColors.tertiaryLabel,
    marginTop: 0,
  },
});