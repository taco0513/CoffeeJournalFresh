import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HIGConstants, HIGColors } from '../../styles/common';
import { useTastingStore } from '../../stores/tastingStore';
import { flavorWheelKorean } from '../../data/flavorWheelKorean';
import { FlavorPath } from '../../stores/tastingStore';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Category colors for visual distinction
const CATEGORY_COLORS: Record<string, string> = {
  'Fruity': '#FF6B6B',
  'Sour/Fermented': '#FFD93D',
  'Green/Vegetative': '#4CAF50',
  'Roasted': '#8B4513',
  'Spices': '#FF8C00',
  'Nutty/Cocoa': '#D2691E',
  'Sweet': '#FFB6C1',
  'Floral': '#9370DB',
  'Other': '#9E9E9E',
};

// Category emojis
const CATEGORY_EMOJIS: Record<string, string> = {
  'Fruity': '🍓',
  'Sour/Fermented': '🍋',
  'Green/Vegetative': '🌿',
  'Roasted': '🔥',
  'Spices': '🌶️',
  'Nutty/Cocoa': '🥜',
  'Sweet': '🍯',
  'Floral': '🌸',
  'Other': '📦',
};

// Transform flavorWheelKorean data into the expected format
const transformFlavorData = () => {
  const result = [];
  const { level1, level2, level3, translations } = flavorWheelKorean;
  
  for (const [category, koreanName] of Object.entries(level1)) {
    const subcategories = level2[category] || [];
    const subcategoryData = subcategories.map(subcat => {
      const flavors = level3[subcat] || [];
      return {
        name: subcat,
        koreanName: translations[subcat] || subcat,
        flavors: flavors.map(flavor => ({
          name: flavor,
          koreanName: flavor, // Korean flavors are already in Korean
        })),
      };
    });
    
    result.push({
      category,
      emoji: CATEGORY_EMOJIS[category] || '☕',
      koreanName: koreanName as string,
      subcategories: subcategoryData,
    });
  }
  
  return result;
};

const flavorData = transformFlavorData();

interface CategoryAccordionProps {
  category: string;
  expanded: boolean;
  onToggle: () => void;
  onSelectFlavor: (path: FlavorPath) => void;
  onSelectSubcategory: (level1: string, level2: string) => void;
  selectedPaths: FlavorPath[];
  searchQuery: string;
  expandedSubCategories: Set<string>;
  onToggleSubcategory: (subcategoryKey: string) => void;
}

const CategoryAccordion: React.FC<CategoryAccordionProps> = ({
  category,
  expanded,
  onToggle,
  onSelectFlavor,
  onSelectSubcategory,
  selectedPaths,
  searchQuery,
  expandedSubCategories,
  onToggleSubcategory,
}) => {
  const categoryData = flavorData.find(item => item.category === category);
  const categoryColor = CATEGORY_COLORS[category] || HIGColors.systemGray4;

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

  // Check if a subcategory (level2) is selected directly OR has any selected flavors
  const isSubcategorySelected = (level1: string, level2: string) => {
    return selectedPaths.some(
      path => path.level1 === level1 && path.level2 === level2 // This includes both direct subcategory selections and flavor selections
    );
  };

  // Get selected count for this category
  const getCategorySelectedCount = () => {
    return selectedPaths.filter(path => path.level1 === category).length;
  };

  // Get subcategory preview text
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
          {/* Multi-selection guide */}
          <View style={styles.categoryGuide}>
            <Text style={styles.categoryGuideText}>
              💡 하위 카테고리를 탭하여 세부 향미를 선택하세요
            </Text>
          </View>
          
          {/* Subcategory chips */}
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
                      // Deselect subcategory and collapse
                      onSelectSubcategory(category, sub.name);
                      if (expandedSubCategories.has(subcategoryKey)) {
                        onToggleSubcategory(subcategoryKey);
                      }
                    } else {
                      // Toggle expansion
                      onToggleSubcategory(subcategoryKey);
                      // Auto-select if expanding and no child flavors selected
                      if (!expandedSubCategories.has(subcategoryKey) && !hasSelectedFlavors) {
                        onSelectSubcategory(category, sub.name);
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

          {/* Flavors grid for each expanded subcategory */}
          {(() => {
            const expandedSubs = filteredSubCategories.filter(sub => expandedSubCategories.has(`${category}-${sub.name}`));
            
            // Separate categories with and without flavors
            const subsWithFlavors = [];
            const subsWithoutFlavors = [];
            
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
                {/* Render categories with flavors */}
                {subsWithFlavors.map(({ sub, filteredFlavors }) => (
                  <View key={sub.name} style={styles.flavorGrid}>
                    <Text style={styles.subcategoryLabel}>{sub.koreanName} 세부 향미:</Text>
                    <View style={styles.flavorRow}>
                      {filteredFlavors.map(flavor => {
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
                                onSelectFlavor({
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
                
                {/* Render combined message for categories without flavors */}
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
};

export default function UnifiedFlavorScreen() {
  const navigation = useNavigation();
  const { currentTasting, updateField } = useTastingStore();
  const [searchQuery, setSearchQuery] = useState('');
  // Cafe Mode: 초기에는 모든 카테고리를 닫아서 Level 1에 집중
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(new Set());

  const selectedPaths = currentTasting.selectedFlavors || [];

  // Handle subcategory (level2) selection
  const handleSelectSubcategory = useCallback((level1: string, level2: string) => {
    const currentPaths = [...selectedPaths];
    
    // Check if this subcategory is already selected as level2
    const existingSubcategoryIndex = currentPaths.findIndex(
      p => p.level1 === level1 && p.level2 === level2 && !p.level3
    );
    
    if (existingSubcategoryIndex >= 0) {
      // Remove subcategory selection
      currentPaths.splice(existingSubcategoryIndex, 1);
      updateField('selectedFlavors', currentPaths);
    } else {
      // Remove any specific flavors from this subcategory first
      const filteredPaths = currentPaths.filter(
        p => !(p.level1 === level1 && p.level2 === level2 && p.level3)
      );
      
      // Add subcategory selection if under limit
      if (filteredPaths.length < 5) {
        filteredPaths.push({
          level1,
          level2,
          level3: '', // Empty level3 indicates subcategory selection
        });
        updateField('selectedFlavors', filteredPaths);
      }
    }
  }, [selectedPaths, updateField]);

  const handleSelectFlavor = useCallback((path: FlavorPath) => {
    const currentPaths = [...selectedPaths];
    const existingIndex = currentPaths.findIndex(
      p => p.level1 === path.level1 && p.level2 === path.level2 && p.level3 === path.level3
    );

    if (existingIndex >= 0) {
      // Remove if already selected
      currentPaths.splice(existingIndex, 1);
      updateField('selectedFlavors', currentPaths);
    } else if (currentPaths.length < 5) {
      // Remove any subcategory selection from the same level2 first
      const indexToRemove = currentPaths.findIndex(
        p => p.level1 === path.level1 && p.level2 === path.level2 && !p.level3
      );
      if (indexToRemove >= 0) {
        currentPaths.splice(indexToRemove, 1);
      }
      
      // Add specific flavor selection
      currentPaths.push(path);
      updateField('selectedFlavors', currentPaths);
    }
    // Limit reached - could add toast or haptic feedback here
  }, [selectedPaths, updateField]);

  const handleRemoveFlavor = useCallback((index: number) => {
    const currentPaths = [...selectedPaths];
    const removedPath = currentPaths[index];
    currentPaths.splice(index, 1);
    updateField('selectedFlavors', currentPaths);
    
    // If we removed a subcategory selection, also close the expanded subcategory
    if (removedPath && !removedPath.level3) {
      const subcategoryKey = `${removedPath.level1}-${removedPath.level2}`;
      setExpandedSubCategories(prev => {
        const newSet = new Set(prev);
        if (newSet.has(subcategoryKey)) {
          newSet.delete(subcategoryKey);
        }
        return newSet;
      });
    }
  }, [selectedPaths, updateField]);

  const toggleCategory = useCallback((category: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  }, []);
  
  const toggleSubcategory = useCallback((subcategoryKey: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSubCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subcategoryKey)) {
        newSet.delete(subcategoryKey);
      } else {
        newSet.add(subcategoryKey);
      }
      return newSet;
    });
  }, []);
  
  const toggleAllCategories = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategories(prev => {
      if (prev.length === flavorData.length) {
        return [];
      } else {
        return flavorData.map(item => item.category);
      }
    });
  }, []);

  const handleNext = () => {
    navigation.navigate('Sensory' as never);
  };

  const handleSkip = () => {
    navigation.navigate('Sensory' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navigationTitle}>향미 선택</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButton}>건너뛰기</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar - Full width below header */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '33%' }]} />
      </View>

      {/* Guide Message */}
      <View style={styles.guideMessageContainer}>
        <Text style={styles.guideMessage}>
          🎯 커피에서 느껴지는 향과 맛을 선택해보세요
        </Text>
        <Text style={styles.guideSubMessage}>
          💡 각 향미는 여러 개 선택 가능합니다 (최대 5개)
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="향미 검색..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={HIGColors.tertiaryLabel}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sticky Header - Selected Flavors */}
      <View style={[styles.stickyHeader, selectedPaths.length === 0 && styles.stickyHeaderEmpty]}>
        <View style={styles.stickyHeaderTop}>
          <Text style={styles.stickyHeaderTitle}>
            선택한 향미 ({selectedPaths.length}/5)
          </Text>
          <TouchableOpacity onPress={toggleAllCategories}>
            <Text style={styles.toggleAllText}>
              {expandedCategories.length === flavorData.length ? '모든 카테고리 닫기' : '모든 카테고리 열기'}
            </Text>
          </TouchableOpacity>
        </View>
        {selectedPaths.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedScrollContent}
          >
            {selectedPaths.map((path, index) => {
              const categoryData = flavorData.find(item => item.category === path.level1);
              const subcategoryData = categoryData?.subcategories.find(sub => sub.name === path.level2);
              
              let displayName: string;
              let isSubcategorySelection = false;
              
              if (!path.level3) {
                // This is a subcategory (level2) selection
                displayName = subcategoryData?.koreanName || path.level2;
                isSubcategorySelection = true;
              } else {
                // This is a specific flavor (level3) selection
                const flavorItem = subcategoryData?.flavors.find(f => f.name === path.level3);
                displayName = flavorItem?.koreanName || path.level3;
              }
              
              return (
                <View 
                  key={index} 
                  style={[
                    styles.selectedChip,
                    isSubcategorySelection && styles.selectedSubcategoryChip
                  ]}
                >
                  <View style={styles.chipTextContainer}>
                    <Text style={[
                      styles.selectedChipText,
                      isSubcategorySelection && styles.selectedSubcategoryText
                    ]} numberOfLines={1}>
                      {displayName}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.chipRemoveButton}
                    onPress={() => handleRemoveFlavor(index)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.chipRemoveButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyMessage}>
              아직 선택된 향미가 없습니다
            </Text>
            <Text style={styles.emptySubMessage}>
              아래 카테고리를 탭하여 시작하세요 ⬇️
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {(() => {
          // Check if any categories have matching items when searching
          const hasResults = !searchQuery || flavorData.some(item => {
            const categoryData = flavorData.find(d => d.category === item.category);
            if (!categoryData) return false;
            
            return categoryData.subcategories.some(sub =>
              sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              sub.koreanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              sub.flavors.some(f =>
                f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.koreanName.toLowerCase().includes(searchQuery.toLowerCase())
              )
            );
          });

          if (!hasResults) {
            return (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsEmoji}>🔍</Text>
                <Text style={styles.noResultsText}>
                  "{searchQuery}" 검색 결과가 없습니다
                </Text>
                <Text style={styles.noResultsSubtext}>
                  다른 키워드로 검색해보세요
                </Text>
              </View>
            );
          }

          return flavorData.map(item => {
            // Check if category has search results
            const hasSearchResults = !searchQuery || item.subcategories.some(sub =>
              sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              sub.koreanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              sub.flavors.some(f =>
                f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.koreanName.toLowerCase().includes(searchQuery.toLowerCase())
              )
            );

            if (!hasSearchResults) return null;

            return (
              <CategoryAccordion
                key={item.category}
                category={item.category}
                expanded={searchQuery ? true : expandedCategories.includes(item.category)}
                onToggle={() => {
                  if (!searchQuery) {
                    toggleCategory(item.category);
                  }
                }}
                onSelectFlavor={handleSelectFlavor}
                onSelectSubcategory={handleSelectSubcategory}
                selectedPaths={selectedPaths}
                searchQuery={searchQuery}
                expandedSubCategories={expandedSubCategories}
                onToggleSubcategory={toggleSubcategory}
              />
            );
          }).filter(Boolean);
        })()}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.nextButton, selectedPaths.length === 0 && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={selectedPaths.length === 0}
        >
          <Text style={styles.nextButtonText}>
            {selectedPaths.length > 0 ? `${selectedPaths.length}개 선택 완료` : '향미를 선택해주세요'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navigationBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.systemGray4,
  },
  backButton: {
    fontSize: 24,
    color: HIGColors.systemBlue,
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  skipButton: {
    fontSize: 15,
    color: HIGColors.systemBlue,
  },
  progressBar: {
    height: 3,
    backgroundColor: HIGColors.systemGray5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: HIGColors.systemBlue,
  },
  guideMessageContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_SM,
    backgroundColor: '#E3F2FD',
  },
  guideMessage: {
    fontSize: 15,
    color: HIGColors.systemBlue,
    textAlign: 'center',
    fontWeight: '500',
  },
  guideSubMessage: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_SM,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HIGColors.systemGray6,
    borderRadius: 12,
    paddingHorizontal: HIGConstants.SPACING_MD,
    height: 44,
    borderWidth: 1,
    borderColor: HIGColors.systemGray5,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: HIGConstants.SPACING_SM,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: HIGColors.label,
  },
  clearIcon: {
    fontSize: 18,
    color: HIGColors.tertiaryLabel,
    padding: HIGConstants.SPACING_XS,
  },
  stickyHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray5,
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_SM,
    paddingBottom: HIGConstants.SPACING_MD,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 90,
  },
  stickyHeaderEmpty: {
    paddingBottom: HIGConstants.SPACING_XS,
  },
  stickyHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  stickyHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
  },
  toggleAllText: {
    fontSize: 14,
    color: HIGColors.systemBlue,
    fontWeight: '500',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_SM,
  },
  emptyMessage: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    fontWeight: '500',
  },
  emptySubMessage: {
    fontSize: 12,
    color: HIGColors.tertiaryLabel,
    marginTop: 4,
  },
  selectedScrollContent: {
    alignItems: 'center',
    paddingTop: 8, // Extra space for X buttons that extend above chips
    paddingBottom: 4,
  },
  selectedChip: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: HIGConstants.SPACING_MD,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: HIGColors.systemBlue,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'visible',
    minHeight: 40,
    minWidth: 70,
  },
  chipTextContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedChipText: {
    fontSize: 14,
    color: HIGColors.label,
    fontWeight: '500',
    lineHeight: 20,
  },
  selectedSubcategoryChip: {
    backgroundColor: '#E3F2FD',
    borderColor: HIGColors.systemBlue,
    borderWidth: 1.5,
  },
  selectedSubcategoryText: {
    fontSize: 14,
    color: HIGColors.systemBlue,
    fontWeight: '600',
    lineHeight: 20,
  },
  chipRemoveButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: HIGColors.systemRed,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  chipRemoveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: HIGConstants.SPACING_MD,
  },
  categoryContainer: {
    marginHorizontal: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_MD,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: HIGConstants.cornerRadiusLarge,
    overflow: 'visible',
  },
  categoryCardExpanded: {
    backgroundColor: HIGColors.systemGray6,
    borderBottomColor: HIGColors.systemGray4,
  },
  categoryColorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    opacity: 0.8,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
  },
  categoryLeft: {
    flex: 1,
  },
  categoryTitleRow: {
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
  categorySubtext: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
    marginTop: 2,
    marginLeft: 28, // Align with title (emoji width + spacing)
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: HIGColors.systemGray5,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: HIGConstants.SPACING_SM,
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '600',
    color: HIGColors.label,
  },
  categorySelectedBadge: {
    backgroundColor: HIGColors.systemBlue,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: HIGConstants.SPACING_XS,
  },
  categorySelectedCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  expandIcon: {
    fontSize: 20,
    color: HIGColors.tertiaryLabel,
    fontWeight: '300',
  },
  expandIconRotated: {
    transform: [{ rotate: '90deg' }],
  },
  categoryExpandedContent: {
    backgroundColor: '#FAFAFA',
    paddingVertical: HIGConstants.SPACING_SM,
    marginTop: 0,
    borderBottomLeftRadius: HIGConstants.cornerRadiusLarge,
    borderBottomRightRadius: HIGConstants.cornerRadiusLarge,
  },
  categoryGuide: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingBottom: HIGConstants.SPACING_SM,
  },
  categoryGuideText: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
    fontStyle: 'italic',
  },
  subCategoryScroll: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_XS,
  },
  subCategoryChip: {
    backgroundColor: HIGColors.systemGray6,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: 16,
    marginRight: HIGConstants.SPACING_SM,
    borderWidth: 0,
    minHeight: 36,
  },
  subCategoryChipSelected: {
    backgroundColor: HIGColors.systemBlue,
    borderWidth: 0,
  },
  subCategoryText: {
    fontSize: 14,
    color: HIGColors.label,
    fontWeight: '500',
  },
  subCategoryTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  subCategoryChipFullySelected: {
    backgroundColor: HIGColors.systemBlue,
    borderWidth: 0,
  },
  subCategoryTextFullySelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subCategoryChipChildSelected: {
    backgroundColor: '#E3F2FD', // Light blue background
    borderWidth: 1.5,
    borderColor: HIGColors.systemBlue,
  },
  subCategoryTextChildSelected: {
    color: HIGColors.systemBlue,
    fontWeight: '600',
  },
  flavorGrid: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
  },
  subcategoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
  },
  flavorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  flavorButton: {
    backgroundColor: HIGColors.systemGray6,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.cornerRadiusSmall,
    marginRight: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_SM,
    borderWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
  },
  flavorButtonSelected: {
    backgroundColor: HIGColors.systemBlue,
    borderWidth: 0,
  },
  flavorButtonDisabled: {
    opacity: 0.4,
    backgroundColor: HIGColors.systemGray5,
  },
  flavorText: {
    fontSize: 14,
    color: HIGColors.label,
    fontWeight: '500',
  },
  flavorTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  flavorTextDisabled: {
    color: HIGColors.tertiaryLabel,
  },
  bottomContainer: {
    padding: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: HIGColors.systemGray4,
  },
  nextButton: {
    height: 48,
    backgroundColor: HIGColors.systemBlue,
    borderRadius: HIGConstants.cornerRadiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: HIGColors.systemGray4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noFlavorContainer: {
    paddingVertical: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_SM,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noFlavorText: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: HIGConstants.SPACING_XL * 4,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  noResultsEmoji: {
    fontSize: 48,
    marginBottom: HIGConstants.SPACING_MD,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
  },
});