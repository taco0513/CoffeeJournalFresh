import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { HIGConstants, HIGColors } from '../../styles/common';
import { SliderSectionProps } from '../../types/sensory';

// Visual metaphors for each sensory attribute
const getTasteIcon = (title: string, intensity: number): string => {
  const iconMap: Record<string, string[]> = {
    '바디감': ['', '', '', '', ''],
    '산미': ['', '', '', '', ''],
    '단맛': ['', '', '', '', ''],
    '쓴맛': ['', '', '', '', ''],
    '여운': ['〰️', '〰️', '〰️', '〰️〰️', '〰️〰️〰️'],
    '밸런스': ['', '', '', '', ''],
};
  
  return iconMap[title]?.[intensity - 1] || '';
};

const getSegmentLabels = (title: string): string[] => {
  const labelMap: Record<string, string[]> = {
    '바디감': ['1', '2', '3', '4', '5'],
    '산미': ['1', '2', '3', '4', '5'],
    '단맛': ['1', '2', '3', '4', '5'],
    '쓴맛': ['1', '2', '3', '4', '5'],
    '여운': ['1', '2', '3', '4', '5'],
    '밸런스': ['1', '2', '3', '4', '5'],
};
  
  return labelMap[title] || ['1', '2', '3', '4', '5'];
};

// Smart suggestions based on coffee origin and roast
const getSmartSuggestion = (title: string): { value: number; text: string } => {
  const suggestionMap: Record<string, { value: number; text: string }> = {
    '바디감': { value: 3, text: '에티오피아 원두는 보통 수준' },
    '산미': { value: 4, text: '라이트 로스팅은 강한 편' },
    '단맛': { value: 3, text: '워시드 가공은 보통 수준' },
    '쓴맛': { value: 2, text: '스페셜티 커피는 약한 편' },
    '여운': { value: 3, text: '아라비카는 보통 지속' },
    '밸런스': { value: 4, text: '고품질 원두는 조화로운 편' },
};
  
  return suggestionMap[title] || { value: 3, text: '평균적으로 보통 수준' };
};

export const SliderSection = memo<SliderSectionProps>(({ 
  title, 
  value, 
  onValueChange, 
  leftLabel, 
  rightLabel,
  description
}) => {
  const [showSuggestion, setShowSuggestion] = useState(false); // Disable suggestions for compact layout
  const segmentLabels = getSegmentLabels(title);
  const currentIcon = getTasteIcon(title, Math.round(value));
  const suggestion = getSmartSuggestion(title);
  
  const handleSegmentPress = (segmentValue: number) => {
    // Add haptic feedback for better interaction
    ReactNativeHapticFeedback.trigger('impactLight');
    onValueChange(segmentValue);
    setShowSuggestion(false); // Hide suggestion after user interaction
};

  const handleUseSuggestion = () => {
    ReactNativeHapticFeedback.trigger('impactMedium');
    onValueChange(suggestion.value);
    setShowSuggestion(false);
};

  return (
    <View style={styles.sliderSection}>
      {/* Header with icon and title */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.tasteIcon}>{currentIcon}</Text>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>
      
      {/* Smart Suggestion */}
      {showSuggestion && (
        <TouchableOpacity style={styles.suggestionContainer} onPress={handleUseSuggestion}>
          <View style={styles.suggestionContent}>
            <Text style={styles.suggestionIcon}></Text>
            <Text style={styles.suggestionText}>{suggestion.text}</Text>
            <Text style={styles.suggestionAction}>탭하여 적용</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        {segmentLabels.map((label, index) => {
          const segmentValue = index + 1;
          const isSelected = Math.round(value) === segmentValue;
          const isSuggested = segmentValue === suggestion.value && showSuggestion;
          
          return (
            <TouchableOpacity
              key={segmentValue}
              style={[
                styles.segment,
                isSelected && styles.segmentSelected,
                isSuggested && styles.segmentSuggested,
                index === 0 && styles.segmentFirst,
                index === segmentLabels.length - 1 && styles.segmentLast,
              ]}
              onPress={() => handleSegmentPress(segmentValue)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.segmentText,
                isSelected && styles.segmentTextSelected,
                isSuggested && styles.segmentTextSuggested,
              ]}>
                {label}
              </Text>
              {isSuggested && (
                <View style={styles.suggestionBadge}>
                  <Text style={styles.suggestionBadgeText}>추천</Text>
                </View>
              )}
            </TouchableOpacity>
          );
      })}
      </View>
      
    </View>
  );
});

SliderSection.displayName = 'SliderSection';

const styles = StyleSheet.create({
  sliderSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: HIGConstants.SPACING_SM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 100,
    justifyContent: 'space-between',
},
  header: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: HIGConstants.SPACING_XS,
},
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
},
  tasteIcon: {
    fontSize: 20,
    marginRight: 8,
},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: HIGColors.label,
},
  description: {
    fontSize: 11,
    lineHeight: 14,
    color: HIGColors.secondaryLabel,
    marginTop: 2,
},
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: HIGColors.systemGray6,
    borderRadius: 8,
    padding: 2,
},
  segment: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
},
  segmentFirst: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
},
  segmentLast: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
},
  segmentSelected: {
    backgroundColor: HIGColors.systemBlue,
    borderRadius: 6,
    shadowColor: HIGColors.systemBlue,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
},
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
},
  segmentTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
},
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
},
  rangeLabel: {
    fontSize: 11,
    color: HIGColors.tertiaryLabel,
    fontWeight: '500',
},
  // Suggestion styles
  suggestionContainer: {
    backgroundColor: HIGColors.systemYellow + '15',
    borderRadius: 8,
    marginBottom: HIGConstants.SPACING_SM,
    borderWidth: 1,
    borderColor: HIGColors.systemYellow + '40',
},
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: HIGConstants.SPACING_SM,
},
  suggestionIcon: {
    fontSize: 16,
    marginRight: 8,
},
  suggestionText: {
    flex: 1,
    fontSize: 12,
    color: HIGColors.label,
    fontWeight: '500',
},
  suggestionAction: {
    fontSize: 11,
    color: HIGColors.systemBlue,
    fontWeight: '600',
},
  segmentSuggested: {
    borderWidth: 2,
    borderColor: HIGColors.systemYellow,
    backgroundColor: HIGColors.systemYellow + '10',
},
  segmentTextSuggested: {
    color: HIGColors.systemYellow,
    fontWeight: '700',
},
  suggestionBadge: {
    position: 'absolute',
    top: -6,
    right: -4,
    backgroundColor: HIGColors.systemYellow,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
},
  suggestionBadgeText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '700',
},
});