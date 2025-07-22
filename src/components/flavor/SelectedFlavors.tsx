import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { HIGConstants, HIGColors } from '../../styles/common';
import { SelectedFlavorsProps } from '../../types/flavor';
import { flavorWheelKorean } from '../../data/flavorWheelKorean';

export const SelectedFlavors: React.FC<SelectedFlavorsProps> = ({ selectedPaths, onRemove }) => {
  const getKoreanName = (englishName: string): string => {
    return (flavorWheelKorean.translations as any)[englishName] || englishName;
  };

  return (
    <View style={styles.selectedContainer}>
      <Text style={styles.selectedTitle}>
        선택한 향미 ({selectedPaths.length}/5)
      </Text>
      {selectedPaths.length > 0 ? (
        <View style={styles.scrollContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedPaths.map((path, index) => (
              <TouchableOpacity
                key={`${path.level1}-${path.level2}-${path.level3}-${index}`}
                style={styles.selectedChip}
                onPress={() => onRemove(path)}
              >
                <Text style={styles.selectedChipText}>
                  {path.level3 ? path.level3 : getKoreanName(path.level2)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : (
        <Text style={styles.emptyMessage}>아직 선택된 향미가 없습니다</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  selectedContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingTop: 24,
    paddingBottom: 24,
    backgroundColor: '#F8F9FA',
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  scrollContainer: {
    flexShrink: 1,
  },
  selectedChip: {
    backgroundColor: HIGColors.systemBlue,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: 8,
    marginRight: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_XS,
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
    marginTop: HIGConstants.SPACING_SM,
  },
});