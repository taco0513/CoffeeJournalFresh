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
  searchQuery,
}) => {
  const [expandedSubcategories, setExpandedSubcategories] = React.useState<string[]>([]);

  const toggleSubcategory = (subcategoryName: string) => {
    setExpandedSubcategories(prev => {
      if (prev.includes(subcategoryName)) {
        return prev.filter(name => name !== subcategoryName);
      } else {
        return [...prev, subcategoryName];
      }
    });
  };

  const checkIsSelected = (level1: string, level2: string, level3?: string): boolean => {
    if (level3) {
      // Check for exact level 3 match
      return selectedPaths.some(
        p => p.level1 === level1 && p.level2 === level2 && p.level3 === level3
      );
    } else {
      // Check for level 2 match (subcategory)
      return selectedPaths.some(
        p => p.level1 === level1 && p.level2 === level2 && !p.level3
      );
    }
  };

  const renderHighlightedText = (text: string, isSelected: boolean = false) => {
    if (!searchQuery || searchQuery.trim() === '') {
      return text;
    }

    const query = searchQuery.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(query);

    if (index === -1) {
      return text;
    }

    const before = text.substring(0, index);
    const match = text.substring(index, index + searchQuery.length);
    const after = text.substring(index + searchQuery.length);

    return (
      <>
        {before}
        <Text style={[styles.highlightedText, isSelected && styles.highlightedTextSelected]}>{match}</Text>
        {after}
      </>
    );
  };

  return (
    <View style={styles.categoryContainer}>
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={onToggle}
        accessible={true}
        accessibilityLabel={`${category.koreanName} 카테고리, ${selectedCount}개 선택됨`}
        accessibilityHint={`탭하여 ${isExpanded ? '접기' : '펼치기'}`}
        accessibilityRole="button"
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
          {category.subcategories.map(sub => {
            const isSubcategoryExpanded = expandedSubcategories.includes(sub.name);
            const isSubcategorySelected = checkIsSelected(category.category, sub.name);
            const hasSelectedFlavors = sub.flavors.some(flavor => 
              checkIsSelected(category.category, sub.name, flavor.name)
            );

            return (
              <View key={sub.name} style={styles.subcategory}>
                <TouchableOpacity
                  style={[
                    styles.subcategoryHeader,
                    isSubcategorySelected && styles.subcategoryHeaderSelected,
                    hasSelectedFlavors && !isSubcategorySelected && styles.subcategoryHeaderHasSelection
                  ]}
                  onPress={() => toggleSubcategory(sub.name)}
                  onLongPress={() => onSelectFlavor(category.category, sub.name, '')}
                  accessible={true}
                  accessibilityLabel={`${sub.koreanName} 서브카테고리`}
                  accessibilityHint={`탭하여 펼치기, 길게 눌러서 전체 선택`}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isSubcategoryExpanded, selected: isSubcategorySelected }}
                >
                  <View style={styles.subcategoryLeft}>
                    <Text style={[
                      styles.subcategoryTitle,
                      isSubcategorySelected && styles.subcategoryTitleSelected
                    ]}>
                      {renderHighlightedText(sub.koreanName, isSubcategorySelected)}
                    </Text>
                    {(isSubcategorySelected || hasSelectedFlavors) && (
                      <View style={styles.selectionBadge}>
                        <Text style={styles.selectionBadgeText}>
                          {isSubcategorySelected ? '전체' : `${sub.flavors.filter(f => checkIsSelected(category.category, sub.name, f.name)).length}`}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[
                    styles.expandIcon,
                    isSubcategorySelected && styles.expandIconSelected
                  ]}>
                    {isSubcategoryExpanded ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>
                
                {isSubcategoryExpanded && (
                  <View style={styles.flavorGrid}>
                    {sub.flavors.map(flavor => (
                      <FlavorChip
                        key={flavor.name}
                        flavor={flavor}
                        isSelected={checkIsSelected(category.category, sub.name, flavor.name)}
                        onPress={() => onSelectFlavor(category.category, sub.name, flavor.name)}
                        searchQuery={searchQuery}
                      />
                    ))}
                  </View>
                )}
              </View>
            );
          })}
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
  subcategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: HIGColors.systemGray6,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_SM,
    borderRadius: 10,
  },
  subcategoryHeaderSelected: {
    backgroundColor: HIGColors.systemBlue,
  },
  subcategoryHeaderHasSelection: {
    borderWidth: 1,
    borderColor: HIGColors.systemBlue,
  },
  subcategoryCheckbox: {
    paddingRight: HIGConstants.SPACING_SM,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: HIGColors.systemGray3,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: HIGColors.systemBlue,
    borderColor: HIGColors.systemBlue,
  },
  checkboxPartial: {
    backgroundColor: '#FFFFFF',
    borderColor: HIGColors.systemBlue,
  },
  checkboxCheckmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxPartialMark: {
    width: 10,
    height: 2,
    backgroundColor: HIGColors.systemBlue,
  },
  subcategoryContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subcategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subcategoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: HIGColors.label,
  },
  subcategoryTitleSelected: {
    color: '#FFFFFF',
  },
  selectionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: HIGConstants.SPACING_SM,
  },
  selectionBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 12,
    color: HIGColors.tertiaryLabel,
    marginLeft: HIGConstants.SPACING_SM,
  },
  expandIconSelected: {
    color: '#FFFFFF',
  },
  flavorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  highlightedText: {
    backgroundColor: HIGColors.yellow,
    fontWeight: '700',
  },
  highlightedTextSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});