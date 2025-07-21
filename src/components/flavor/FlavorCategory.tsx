import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HIGConstants, HIGColors } from '../../styles/common';
import { FlavorCategoryProps, FlavorPath } from '../../types/flavor';
import { FlavorChip } from './FlavorChip';

export const FlavorCategory: React.FC<FlavorCategoryProps> = ({
  category,
  isExpanded,
  selectedCount,
  onToggle,
  onSelectFlavor,
  selectedPaths,
}) => {
  const checkIsSelected = (level1: string, level2: string, level3: string): boolean => {
    return selectedPaths.some(
      p => p.level1 === level1 && p.level2 === level2 && p.level3 === level3
    );
  };

  return (
    <View style={styles.categoryContainer}>
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={onToggle}
      >
        <View style={styles.categoryLeft}>
          <Text style={styles.categoryEmoji}>{category.emoji}</Text>
          <Text style={styles.categoryTitle}>{category.koreanName}</Text>
        </View>
        <View style={styles.categoryRight}>
          {selectedCount > 0 && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>{selectedCount}</Text>
            </View>
          )}
          <Text style={styles.expandIcon}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.subcategoryContainer}>
          {category.subcategories.map(sub => (
            <View key={sub.name} style={styles.subcategory}>
              <Text style={styles.subcategoryTitle}>{sub.koreanName}</Text>
              <View style={styles.flavorGrid}>
                {sub.flavors.map(flavor => (
                  <FlavorChip
                    key={flavor.name}
                    flavor={flavor}
                    isSelected={checkIsSelected(category.category, sub.name, flavor.name)}
                    onPress={() => onSelectFlavor(category.category, sub.name, flavor.name)}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    marginHorizontal: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_MD,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_MD,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: 12,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: HIGConstants.SPACING_SM,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedBadge: {
    backgroundColor: HIGColors.systemBlue,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: HIGConstants.SPACING_SM,
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 12,
    color: HIGColors.tertiaryLabel,
  },
  subcategoryContainer: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
  },
  subcategory: {
    marginBottom: HIGConstants.SPACING_MD,
  },
  subcategoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  flavorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});