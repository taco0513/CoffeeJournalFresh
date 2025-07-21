import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HIGConstants, HIGColors } from '../../styles/common';
import { useTastingStore } from '../../stores/tastingStore';
import { flavorWheelKorean } from '../../data/flavorWheelKorean';
import { FlavorPath } from '../../types/tasting';

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
          koreanName: translations[flavor] || flavor,
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
  selectedPaths: FlavorPath[];
  searchQuery: string;
}

const CategoryAccordion: React.FC<CategoryAccordionProps> = ({
  category,
  expanded,
  onToggle,
  onSelectFlavor,
  selectedPaths,
  searchQuery,
}) => {
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
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
        <View style={[styles.categoryColorBar, { backgroundColor: categoryColor }]} />
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
          {/* Subcategory chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subCategoryScroll}>
            {filteredSubCategories.map(sub => (
              <TouchableOpacity
                key={sub.name}
                style={[
                  styles.subCategoryChip,
                  selectedSubCategory === sub.name && styles.subCategoryChipSelected,
                ]}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setSelectedSubCategory(selectedSubCategory === sub.name ? null : sub.name);
                }}
              >
                <Text
                  style={[
                    styles.subCategoryText,
                    selectedSubCategory === sub.name && styles.subCategoryTextSelected,
                  ]}
                >
                  {sub.koreanName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Flavors grid */}
          {selectedSubCategory && (
            <View style={styles.flavorGrid}>
              {filteredSubCategories
                .find(sub => sub.name === selectedSubCategory)
                ?.flavors.filter(f =>
                  searchQuery
                    ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      f.koreanName.toLowerCase().includes(searchQuery.toLowerCase())
                    : true
                )
                .map(flavor => {
                  const isSelected = isFlavorSelected(category, selectedSubCategory, flavor.name);
                  return (
                    <TouchableOpacity
                      key={flavor.name}
                      style={[
                        styles.flavorButton,
                        isSelected && styles.flavorButtonSelected,
                      ]}
                      onPress={() => {
                        onSelectFlavor({
                          level1: category,
                          level2: selectedSubCategory,
                          level3: flavor.name,
                        });
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.flavorText,
                          isSelected && styles.flavorTextSelected,
                        ]}
                      >
                        {flavor.koreanName}
                      </Text>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default function UnifiedFlavorScreen() {
  const navigation = useNavigation();
  const { currentTasting, updateField } = useTastingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const selectedPaths = currentTasting.selectedFlavors || [];

  const handleSelectFlavor = useCallback((path: FlavorPath) => {
    const currentPaths = [...selectedPaths];
    const existingIndex = currentPaths.findIndex(
      p => p.level1 === path.level1 && p.level2 === path.level2 && p.level3 === path.level3
    );

    if (existingIndex >= 0) {
      // Remove if already selected
      currentPaths.splice(existingIndex, 1);
    } else if (currentPaths.length < 5) {
      // Add if under limit
      currentPaths.push(path);
    } else {
      // Show limit reached message
      return;
    }

    updateField('selectedFlavors', currentPaths);
  }, [selectedPaths, updateField]);

  const handleRemoveFlavor = useCallback((index: number) => {
    const currentPaths = [...selectedPaths];
    currentPaths.splice(index, 1);
    updateField('selectedFlavors', currentPaths);
  }, [selectedPaths, updateField]);

  const toggleCategory = useCallback((category: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory(expandedCategory === category ? null : category);
  }, [expandedCategory]);

  const handleNext = () => {
    if (selectedPaths.length > 0) {
      navigation.navigate('Sensory' as never);
    }
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

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '57%' }]} />
        </View>
        <Text style={styles.progressText}>4/7</Text>
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

      {/* Selected Flavors */}
      {selectedPaths.length > 0 && (
        <View style={styles.selectedContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedScrollContent}
          >
            {selectedPaths.map((path, index) => {
              const categoryData = flavorData.find(item => item.category === path.level1);
              const emoji = categoryData?.emoji || '☕';
              return (
                <View key={index} style={styles.selectedChip}>
                  <Text style={styles.selectedChipEmoji}>{emoji}</Text>
                  <Text style={styles.selectedChipText} numberOfLines={1}>
                    {path.level3}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => handleRemoveFlavor(index)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeIcon}>×</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
            {selectedPaths.length < 5 && (
              <View style={styles.remainingChip}>
                <Text style={styles.remainingText}>+{5 - selectedPaths.length}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {flavorData.map(item => (
          <CategoryAccordion
            key={item.category}
            category={item.category}
            expanded={expandedCategory === item.category}
            onToggle={() => toggleCategory(item.category)}
            onSelectFlavor={handleSelectFlavor}
            selectedPaths={selectedPaths}
            searchQuery={searchQuery}
          />
        ))}
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
  progressContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_SM,
    backgroundColor: '#FFFFFF',
  },
  progressBar: {
    height: 4,
    backgroundColor: HIGColors.systemGray5,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: HIGColors.systemBlue,
  },
  progressText: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
    marginTop: HIGConstants.SPACING_XS,
  },
  searchContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_SM,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    paddingHorizontal: HIGConstants.SPACING_MD,
    height: 44,
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
  selectedContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_SM,
    backgroundColor: HIGColors.systemGray6,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray5,
  },
  selectedScrollContent: {
    alignItems: 'center',
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingLeft: HIGConstants.SPACING_SM,
    paddingRight: HIGConstants.SPACING_XS,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: 20,
    marginRight: HIGConstants.SPACING_SM,
    borderWidth: 1,
    borderColor: HIGColors.systemBlue,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedChipEmoji: {
    fontSize: 16,
    marginRight: HIGConstants.SPACING_XS,
  },
  selectedChipText: {
    fontSize: 14,
    color: HIGColors.label,
    fontWeight: '500',
    maxWidth: 100,
  },
  removeButton: {
    marginLeft: HIGConstants.SPACING_XS,
    padding: HIGConstants.SPACING_XS,
  },
  removeIcon: {
    fontSize: 18,
    color: HIGColors.systemRed,
    fontWeight: '600',
  },
  remainingChip: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
    borderStyle: 'dashed',
  },
  remainingText: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
  },
  content: {
    flex: 1,
  },
  categoryContainer: {
    marginHorizontal: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_MD,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: HIGConstants.cornerRadiusMedium,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryCardExpanded: {
    shadowOpacity: 0.12,
    elevation: 5,
  },
  categoryColorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_MD,
  },
  categoryLeft: {
    flex: 1,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 24,
    marginRight: HIGConstants.SPACING_SM,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  categorySubtext: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    marginTop: HIGConstants.SPACING_XS,
    marginLeft: 32, // Align with title (emoji width + spacing)
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
  expandIcon: {
    fontSize: 24,
    color: HIGColors.tertiaryLabel,
    fontWeight: '300',
  },
  expandIconRotated: {
    transform: [{ rotate: '90deg' }],
  },
  categoryExpandedContent: {
    backgroundColor: HIGColors.systemGray6,
    paddingVertical: HIGConstants.SPACING_SM,
    marginTop: -HIGConstants.cornerRadiusMedium,
    borderBottomLeftRadius: HIGConstants.cornerRadiusMedium,
    borderBottomRightRadius: HIGConstants.cornerRadiusMedium,
  },
  subCategoryScroll: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_SM,
  },
  subCategoryChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: 16,
    marginRight: HIGConstants.SPACING_SM,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
  },
  subCategoryChipSelected: {
    backgroundColor: HIGColors.systemBlue,
    borderColor: HIGColors.systemBlue,
    borderWidth: 2,
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
  flavorGrid: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  flavorButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.cornerRadiusSmall,
    marginRight: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_SM,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  flavorButtonSelected: {
    backgroundColor: HIGColors.systemBlue,
    borderColor: HIGColors.systemBlue,
    borderWidth: 2,
    shadowOpacity: 0.15,
    elevation: 3,
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
  checkmark: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: HIGConstants.SPACING_XS,
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
});