import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { HIGConstants, HIGColors } from '../../styles/common';
import { SelectedFlavorsProps } from '../../types/flavor';

export const SelectedFlavors: React.FC<SelectedFlavorsProps> = ({ selectedPaths, onRemove }) => {
  return (
    <View style={styles.selectedContainer}>
      <Text style={styles.selectedTitle}>
        선택한 향미 ({selectedPaths.length}/5)
      </Text>
      {selectedPaths.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {selectedPaths.map((path, index) => (
            <TouchableOpacity
              key={`${path.level1}-${path.level2}-${path.level3}-${index}`}
              style={styles.selectedChip}
              onPress={() => onRemove(path)}
            >
              <Text style={styles.selectedChipText}>
                {path.level3 || path.level2} ✕
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.emptyMessage}>아직 선택된 향미가 없습니다</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  selectedContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingBottom: HIGConstants.SPACING_MD,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  selectedChip: {
    backgroundColor: HIGColors.systemBlue,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: 20,
    marginRight: HIGConstants.SPACING_SM,
  },
  selectedChipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyMessage: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
  },
});