import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { HIGConstants, HIGColors } from '../../styles/common';
import { FlavorCategoryProps, FlavorPath } from '../../types/flavor';
import { FlavorChip } from './FlavorChip';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

// Constants for improved visual hierarchy
const SUBCATEGORY_PILL_WIDTH = 120;
const SUBCATEGORY_PILL_MARGIN = 8;
const SNAP_INTERVAL = SUBCATEGORY_PILL_WIDTH + SUBCATEGORY_PILL_MARGIN;

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
  const isScrolling = useRef(false);
  const scrollStartX = useRef(0);
  
  // Get screen dimensions for responsive design
  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth >= 768;

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
      // Check for level 2 match (subcategory) OR if any level 3 from this subcategory is selected
      return selectedPaths.some(
        p => p.level1 === level1 && p.level2 === level2 && !p.level3
      ) || selectedPaths.some(
        p => p.level1 === level1 && p.level2 === level2 && p.level3
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
        <>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subcategoryGrid}
            style={styles.subcategoryScrollView}
            snapToInterval={SNAP_INTERVAL}
            snapToAlignment="start"
            decelerationRate="fast"
            pagingEnabled={false}
            onScrollBeginDrag={(e) => {
              isScrolling.current = true;
              scrollStartX.current = e.nativeEvent.contentOffset.x;
            }}
            onScrollEndDrag={() => {
              setTimeout(() => {
                isScrolling.current = false;
              }, 100);
            }}
            onMomentumScrollEnd={() => {
              isScrolling.current = false;
            }}
            scrollEventThrottle={16}
          >
              {category.subcategories.map(sub => {
                const isSubcategorySelected = checkIsSelected(category.category, sub.name);
                const hasSelectedFlavors = sub.flavors.some(flavor => 
                  checkIsSelected(category.category, sub.name, flavor.name)
                );

                return (
                  <TouchableOpacity
                    key={sub.name}
                    style={[
                      styles.subcategoryHeader,
                      isSubcategorySelected && styles.subcategoryHeaderSelected,
                      hasSelectedFlavors && !isSubcategorySelected && styles.subcategoryHeaderHasSelection,
                    ]}
                    onPress={() => {
                      if (!isScrolling.current) {
                        ReactNativeHapticFeedback.trigger('impactLight');
                        onSelectFlavor(category.category, sub.name, '');
                      }
                    }}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityLabel={`${sub.koreanName} 서브카테고리`}
                    accessibilityHint={isSubcategorySelected ? 
                      `현재 선택됨. 두 번 탭하여 선택 해제` : 
                      `두 번 탭하여 전체 선택`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSubcategorySelected }}
                  >
                    <Text style={[
                      styles.subcategoryTitle,
                      isSubcategorySelected && styles.subcategoryTitleSelected
                    ]}>
                      {renderHighlightedText(sub.koreanName, isSubcategorySelected)}
                    </Text>
                    {hasSelectedFlavors && !isSubcategorySelected && (
                      <Text style={styles.selectionBadgeText}>
                        {sub.flavors.filter(f => checkIsSelected(category.category, sub.name, f.name)).length}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
          
          <View style={styles.subcategoryContainer}>
            <View style={[styles.flavorGrid, isTablet && styles.flavorGridTablet]}>
              {(() => {
                const selectedSubcategories = category.subcategories.filter(sub => 
                  checkIsSelected(category.category, sub.name)
                );
                const subcategoriesWithFlavors = selectedSubcategories.filter(sub => 
                  sub.flavors && sub.flavors.length > 0
                );
                const subcategoriesWithoutFlavors = selectedSubcategories.filter(sub => 
                  !sub.flavors || sub.flavors.length === 0
                );

                const flavorChips = subcategoriesWithFlavors.flatMap(sub =>
                  sub.flavors.map(flavor => (
                    <FlavorChip
                      key={`${sub.name}-${flavor.name}`}
                      flavor={flavor}
                      isSelected={checkIsSelected(category.category, sub.name, flavor.name)}
                      onPress={() => onSelectFlavor(category.category, sub.name, flavor.name)}
                      searchQuery={searchQuery}
                    />
                  ))
                );

                const emptyMessage = subcategoriesWithoutFlavors.length > 0 && (
                  <View key="empty-message" style={styles.emptyFlavorContainer}>
                    <Text style={styles.emptyFlavorText}>
                      {subcategoriesWithoutFlavors.length === 1 
                        ? `'${subcategoriesWithoutFlavors[0].koreanName}'에 대한 세부 향미가 없습니다`
                        : `'${subcategoriesWithoutFlavors.map(sub => sub.koreanName).join("', '")}'에 대한 세부 향미가 없습니다`
                      }
                    </Text>
                  </View>
                );

                return [...flavorChips, emptyMessage].filter(Boolean);
              })()}
            </View>
          </View>
        </>
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
    height: 56, // Enhanced visual hierarchy
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // Android shadow
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
  },
  subcategoryScrollView: {
    marginHorizontal: -HIGConstants.SPACING_LG,
    marginTop: HIGConstants.SPACING_SM,
  },
  subcategoryGrid: {
    flexDirection: 'row',
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  subcategory: {
    marginBottom: HIGConstants.SPACING_MD,
  },
  subcategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: HIGColors.systemGray6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: HIGConstants.SPACING_XS,
    borderRadius: 25, // Perfect pill shape - half of height
    marginRight: SUBCATEGORY_PILL_MARGIN,
    borderWidth: 0, // Remove border for clean pill look
    height: 40, // Increased for better pill proportion
    minWidth: SUBCATEGORY_PILL_WIDTH,
    justifyContent: 'center',
  },
  subcategoryHeaderSelected: {
    backgroundColor: HIGColors.systemBlue,
  },
  subcategoryHeaderHasSelection: {
    backgroundColor: HIGColors.systemGray6,
  },
  subcategoryCheckbox: {
    paddingRight: HIGConstants.SPACING_SM,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: HIGColors.systemGray4,
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
    fontSize: 14,
    fontWeight: '500',
    color: HIGColors.label,
  },
  subcategoryTitleSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
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
  expandIconSelected: {
    color: '#FFFFFF',
  },
  flavorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: HIGConstants.SPACING_XS,
  },
  flavorGridTablet: {
    justifyContent: 'flex-start',
    paddingHorizontal: HIGConstants.SPACING_MD,
  },
  highlightedText: {
    backgroundColor: HIGColors.yellow,
    fontWeight: '700',
  },
  highlightedTextSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  emptyFlavorContainer: {
    width: '100%',
    paddingVertical: HIGConstants.SPACING_MD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFlavorText: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});