import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
} from 'react-native';
import { FlavorPath } from '../../types/tasting';
import { categoryAccordionStyles as styles } from './styles/categoryAccordionStyles';
import { CATEGORY_COLORS } from './constants';
import { transformFlavorData } from './utils/flavorDataTransform';

const flavorData = transformFlavorData();

interface CategoryAccordionProps {
  category: string | any;
  expanded?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  onToggleExpansion?: () => void;
  onSelectFlavor?: (path: FlavorPath) => void;
  onFlavorSelect?: (path: FlavorPath) => void;
  onSelectSubcategory?: (level1: string, level2: string) => void;
  selectedPaths?: FlavorPath[];
  selectedFlavors?: FlavorPath[];
  searchQuery?: string;
  expandedSubCategories?: Set<string>;
  onToggleSubcategory?: (subcategoryKey: string) => void;
  onSubCategoryToggle?: (subcategoryKey: string) => void;
}

export const CategoryAccordion: React.FC<CategoryAccordionProps> = React.memo(({
  category,
  expanded,
  isExpanded,
  onToggle,
  onToggleExpansion,
  onSelectFlavor,
  onFlavorSelect,
  onSelectSubcategory,
  selectedPaths = [],
  selectedFlavors = [],
  searchQuery = '',
  expandedSubCategories = new Set(),
  onToggleSubcategory,
  onSubCategoryToggle,
}) => {
  const categoryData = flavorData.find(item => item.category === category);
  const categoryColor = CATEGORY_COLORS[category] || '#9E9E9E';

  if (!categoryData) return null;

  // Filter subcategories and flavors based on search
  const filteredSubCategories = searchQuery
    ? categoryData.subcategories.filter(sub =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.koreanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.flavors.some(f =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.koreanName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : categoryData.subcategories;

  const isFlavorSelected = (level1: string, level2: string, level3: string) => {
    return selectedPaths.some(
      path => path.level1 === level1 && path.level2 === level2 && path.level3 === level3
    );
};

  const isSubcategorySelected = (level1: string, level2: string) => {
    return selectedPaths.some(
      path => path.level1 === level1 && path.level2 === level2
    );
};

  const getCategorySelectedCount = () => {
    return selectedPaths.filter(path => path.level1 === category).length;
};

  const getSubcategoryPreview = () => {
    const names = categoryData.subcategories.slice(0, 3).map(sub => sub.koreanName);
    return names.join(', ') + (categoryData.subcategories.length > 3 ? ' 등' : '');
};

  return (
    <View style={styles.categoryContainer}>
      <TouchableOpacity
        style={[
          styles.categoryCard,
          expanded && styles.categoryCardExpanded,
        ]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={[styles.categoryColorBar, { backgroundColor: categoryColor }]} pointerEvents="none" />
        <View style={styles.categoryContent}>
          <View style={styles.categoryLeft}>
            <View style={styles.categoryTitleRow}>
              <Text style={styles.categoryEmoji}>{categoryData.emoji}</Text>
              <Text style={styles.categoryTitle}>{categoryData.koreanName}</Text>
            </View>
            {!expanded && (
              <Text style={styles.categorySubtext}>{getSubcategoryPreview()}</Text>
            )}
          </View>
          <View style={styles.categoryRight}>
            {getCategorySelectedCount() > 0 && (
              <View style={styles.categorySelectedBadge}>
                <Text style={styles.categorySelectedCount}>{getCategorySelectedCount()}</Text>
              </View>
            )}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryCount}>{filteredSubCategories.length}</Text>
            </View>
            <Text style={[styles.expandIcon, expanded && styles.expandIconRotated]}>
              ›
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {expanded && filteredSubCategories.length > 0 && (
        <View style={styles.categoryExpandedContent}>
          <View style={styles.categoryGuide}>
            <Text style={styles.categoryGuideText}>
              💡 하위 카테고리를 탭하여 세부 향미를 선택하세요
            </Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subCategoryScroll}>
            {filteredSubCategories.map(sub => {
              const isSelected = isSubcategorySelected(category, sub.name);
              const isDirectlySelected = selectedPaths.some(
                path => path.level1 === category && path.level2 === sub.name && !path.level3
              );
              const hasSelectedFlavors = selectedPaths.some(
                path => path.level1 === category && path.level2 === sub.name && path.level3
              );
              
              return (
                <TouchableOpacity
                  key={sub.name}
                  style={[
                    styles.subCategoryChip,
                    expandedSubCategories.has(`${category}-${sub.name}`) && styles.subCategoryChipSelected,
                    isDirectlySelected && styles.subCategoryChipFullySelected,
                    hasSelectedFlavors && !isDirectlySelected && styles.subCategoryChipChildSelected,
                  ]}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    const subcategoryKey = `${category}-${sub.name}`;
                    
                    if (isDirectlySelected) {
                      onSelectSubcategory?.(category, sub.name);
                      if (expandedSubCategories.has(subcategoryKey)) {
                        onToggleSubcategory?.(subcategoryKey);
                    }
                  } else {
                      onToggleSubcategory?.(subcategoryKey);
                      if (!expandedSubCategories.has(subcategoryKey) && !hasSelectedFlavors) {
                        onSelectSubcategory?.(category, sub.name);
                    }
                  }
                }}
                >
                  <Text
                    style={[
                      styles.subCategoryText,
                      expandedSubCategories.has(`${category}-${sub.name}`) && styles.subCategoryTextSelected,
                      isDirectlySelected && styles.subCategoryTextFullySelected,
                      hasSelectedFlavors && !isDirectlySelected && styles.subCategoryTextChildSelected,
                    ]}
                  >
                    {sub.koreanName}
                  </Text>
                </TouchableOpacity>
              );
          })}
          </ScrollView>

          {(() => {
            const expandedSubs = filteredSubCategories.filter(sub => expandedSubCategories.has(`${category}-${sub.name}`));
            
            const subsWithFlavors: Array<{sub: unknown, filteredFlavors: unknown[]}> = [];
            const subsWithoutFlavors: unknown[] = [];
            
            expandedSubs.forEach(sub => {
              const filteredFlavors = sub.flavors.filter(f =>
                searchQuery
                  ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    f.koreanName.toLowerCase().includes(searchQuery.toLowerCase())
                  : true
              );
              
              if (filteredFlavors.length > 0) {
                subsWithFlavors.push({ sub, filteredFlavors });
            } else {
                subsWithoutFlavors.push(sub);
            }
          });
            
            return (
              <>
                {subsWithFlavors.map(({ sub, filteredFlavors }) => (
                  <View key={sub.name} style={styles.flavorGrid}>
                    <Text style={styles.subcategoryLabel}>{sub.koreanName} 세부 향미:</Text>
                    <View style={styles.flavorRow}>
                      {filteredFlavors.map((flavor: unknown) => {
                        const isSelected = isFlavorSelected(category, sub.name, flavor.name);
                        const isDisabled = !isSelected && selectedPaths.length >= 5;
                        return (
                          <TouchableOpacity
                            key={flavor.name}
                            style={[
                              styles.flavorButton,
                              isSelected && styles.flavorButtonSelected,
                              isDisabled && styles.flavorButtonDisabled,
                            ]}
                            onPress={() => {
                              if (!isDisabled) {
                                onSelectFlavor?.({
                                  level1: category,
                                  level2: sub.name,
                                  level3: flavor.name,
                              });
                            }
                          }}
                            activeOpacity={isDisabled ? 1 : 0.7}
                            disabled={isDisabled}
                          >
                            <Text
                              style={[
                                styles.flavorText,
                                isSelected && styles.flavorTextSelected,
                                isDisabled && styles.flavorTextDisabled,
                              ]}
                            >
                              {flavor.koreanName}
                            </Text>
                          </TouchableOpacity>
                        );
                    })}
                    </View>
                  </View>
                ))}
                
                {subsWithoutFlavors.length > 0 && (
                  <View style={styles.flavorGrid}>
                    <View style={styles.noFlavorContainer}>
                      <Text style={styles.noFlavorText}>
                        {subsWithoutFlavors.length === 1 
                          ? `'${subsWithoutFlavors[0].koreanName}'은 더 세부적인 향미가 없습니다.`
                          : `'${subsWithoutFlavors.map(sub => sub.koreanName).join('\', \'')}'은 더 세부적인 향미가 없습니다.`
                      }
                      </Text>
                    </View>
                  </View>
                )}
              </>
            );
        })()}
        </View>
      )}
    </View>
  );
});

CategoryAccordion.displayName = 'CategoryAccordion';