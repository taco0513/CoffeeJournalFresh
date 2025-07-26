import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { HIGConstants, HIGColors } from '../../styles/common';
import { SelectedFlavorsProps } from '../../types/flavor';
import { flavorWheelKorean } from '../../data/flavorWheelKorean';

export const SelectedFlavors: React.FC<SelectedFlavorsProps> = ({ selectedPaths, onRemove }) => {
  const getKoreanName = (englishName: string): string => {
    return (flavorWheelKorean.translations as unknown)[englishName] || englishName;
};

  return (
    <View style={styles.selectedContainer}>
      <Text style={styles.selectedTitle}>
        선택한 향미 ({selectedPaths.length}/5)
      </Text>
      <View style={styles.contentContainer}>
        {selectedPaths.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
            {selectedPaths.map((path, index) => (
              <View
                key={`${path.level1}-${path.level2}-${path.level3}-${index}`}
                style={styles.selectedChipContainer}
              >
                <View style={styles.selectedChip}>
                  <Text style={styles.selectedChipText}>
                    {path.level3 ? path.level3 : getKoreanName(path.level2 || '')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => onRemove(path)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyMessage}>아직 선택된 향미가 없습니다</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  selectedContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingTop: 24, // Further increased for remove button clearance
    paddingBottom: 20, // Increased bottom padding too
    backgroundColor: '#F8F9FA',
    minHeight: 112, // Increased to prevent any clipping
    overflow: 'visible', // Ensure overflow is visible
},
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD, // Increased margin
},
  contentContainer: {
    minHeight: 52, // Changed to minHeight and increased
    justifyContent: 'center',
    overflow: 'visible',
    paddingTop: 4, // Add padding to push content down slightly
},
  scrollView: {
    flexGrow: 0,
    overflow: 'visible', // Ensure scroll view doesn't clip
},
  emptyStateContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
},
  selectedChipContainer: {
    position: 'relative',
    marginRight: HIGConstants.SPACING_MD,
    alignSelf: 'center',
    paddingTop: 4, // Add padding to account for negative positioned button
},
  selectedChip: {
    backgroundColor: HIGColors.systemBlue,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    paddingRight: HIGConstants.SPACING_LG, // Extra padding for 'x' button
    borderRadius: 8,
},
  removeButton: {
    position: 'absolute',
    top: -2, // Reduced negative positioning
    right: -2, // Reduced negative positioning
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: HIGColors.systemRed,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    zIndex: 1, // Ensure it's above other elements
},
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
},
  selectedChipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
},
  emptyMessage: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
},
});