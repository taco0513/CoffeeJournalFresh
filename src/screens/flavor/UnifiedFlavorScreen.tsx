import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HIGConstants, HIGColors } from '../../styles/common';
import { useTastingStore } from '../../stores/tastingStore';
import { flavorWheelKorean } from '../../data/flavorWheelKorean';
import { FlavorPath } from '../../types/tasting';
import { 
  FlavorWheelData, 
  TransformedCategory, 
  TransformedSubcategory, 
  TransformedFlavor 
} from '../../types/flavor';
import { FlavorCategory } from '../../components/flavor/FlavorCategory';
import { SelectedFlavors } from '../../components/flavor/SelectedFlavors';

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

// Transform flavorWheelKorean data into the expected format with proper typing
const transformFlavorData = (data: FlavorWheelData): TransformedCategory[] => {
  const result: TransformedCategory[] = [];
  const { level1, level2, level3, translations } = data;
  
  for (const [category, koreanName] of Object.entries(level1)) {
    const subcategories = (level2[category as keyof typeof level2] || []) as string[];
    const subcategoryData: TransformedSubcategory[] = subcategories.map((subcat: string) => {
      const flavors = (level3[subcat as keyof typeof level3] || []) as string[];
      return {
        name: subcat,
        koreanName: translations[subcat as keyof typeof translations] || subcat,
        flavors: flavors.map((flavor: string): TransformedFlavor => ({
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

export default function UnifiedFlavorScreen() {
  const navigation = useNavigation();
  const { currentTasting, updateField } = useTastingStore();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Memoize the transformed data to prevent recalculation on every render
  const flavorData = useMemo(
    () => transformFlavorData(flavorWheelKorean as FlavorWheelData),
    []
  );

  const selectedPaths = currentTasting.selectedFlavors || [];

  // Auto-expand categories that have search results
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const categoriesWithResults = flavorData
        .filter(item => {
          return item.subcategories.some(sub =>
            sub.name.toLowerCase().includes(query) ||
            sub.koreanName.toLowerCase().includes(query) ||
            sub.flavors.some(f =>
              f.name.toLowerCase().includes(query) ||
              f.koreanName.toLowerCase().includes(query)
            )
          );
        })
        .map(item => item.category);

      setExpandedCategories(categoriesWithResults);
    } else {
      // When search is cleared, collapse all categories
      setExpandedCategories([]);
    }
  }, [searchQuery, flavorData]);

  const handleSelectFlavor = useCallback((level1: string, level2: string, level3: string) => {
    const currentPaths = [...selectedPaths];
    
    if (level3) {
      // Handle level 3 (specific flavor) selection
      const path: FlavorPath = { level1, level2, level3 };
      const existingIndex = currentPaths.findIndex(
        (p: FlavorPath) => p.level1 === path.level1 && p.level2 === path.level2 && p.level3 === path.level3
      );

      if (existingIndex >= 0) {
        currentPaths.splice(existingIndex, 1);
      } else if (currentPaths.length < 5) {
        // Remove any level 2 selection for this subcategory if selecting a specific flavor
        const level2Index = currentPaths.findIndex(
          p => p.level1 === level1 && p.level2 === level2 && !p.level3
        );
        if (level2Index >= 0) {
          currentPaths.splice(level2Index, 1);
        }
        currentPaths.push(path);
      }
    } else {
      // Handle level 2 (subcategory) selection
      const path: FlavorPath = { level1, level2 };
      const existingIndex = currentPaths.findIndex(
        (p: FlavorPath) => p.level1 === path.level1 && p.level2 === path.level2 && !p.level3
      );

      if (existingIndex >= 0) {
        currentPaths.splice(existingIndex, 1);
      } else if (currentPaths.length < 5) {
        // Remove any level 3 selections for this subcategory if selecting the whole subcategory
        const indicesToRemove: number[] = [];
        currentPaths.forEach((p, index) => {
          if (p.level1 === level1 && p.level2 === level2 && p.level3) {
            indicesToRemove.push(index);
          }
        });
        // Remove from end to start to maintain indices
        indicesToRemove.reverse().forEach(index => {
          currentPaths.splice(index, 1);
        });
        
        currentPaths.push(path);
      }
    }

    updateField('selectedFlavors', currentPaths);
  }, [selectedPaths, updateField]);

  const handleRemoveFlavor = useCallback((path: FlavorPath) => {
    const currentPaths = selectedPaths.filter(
      (p: FlavorPath) => {
        if (path.level3) {
          // Remove specific level 3 flavor
          return !(p.level1 === path.level1 && p.level2 === path.level2 && p.level3 === path.level3);
        } else {
          // Remove level 2 subcategory
          return !(p.level1 === path.level1 && p.level2 === path.level2 && !p.level3);
        }
      }
    );
    updateField('selectedFlavors', currentPaths);
  }, [selectedPaths, updateField]);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  }, []);

  const handleNext = () => {
    navigation.navigate('Sensory' as never);
  };

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return flavorData;
    }

    const query = searchQuery.toLowerCase();
    return flavorData.filter(item => {
      // Check if category matches
      if (item.category.toLowerCase().includes(query) || 
          item.koreanName.toLowerCase().includes(query)) {
        return true;
      }

      // Check if any subcategory or flavor matches
      return item.subcategories.some(sub =>
        sub.name.toLowerCase().includes(query) ||
        sub.koreanName.toLowerCase().includes(query) ||
        sub.flavors.some(f =>
          f.name.toLowerCase().includes(query) ||
          f.koreanName.toLowerCase().includes(query)
        )
      );
    });
  }, [flavorData, searchQuery]);

  return (
    <View style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navigationTitle}>향미 선택</Text>
        <TouchableOpacity onPress={handleNext}>
          <Text style={styles.skipButton}>건너뛰기</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="향미 검색 (예: 초콜릿, chocolate)"
            placeholderTextColor={HIGColors.tertiaryLabel}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        {searchQuery.length > 0 && filteredData.length > 0 && (
          <Text style={styles.searchResultCount}>
            {filteredData.reduce((count, cat) => 
              count + cat.subcategories.reduce((subCount, sub) => 
                subCount + sub.flavors.length, 0), 0
            )}개의 향미를 찾았습니다
          </Text>
        )}
      </View>

      {/* Selected Flavors */}
      <SelectedFlavors
        selectedPaths={selectedPaths}
        onRemove={handleRemoveFlavor}
      />

      {/* Categories */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredData.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsEmoji}>🔍</Text>
            <Text style={styles.noResultsText}>
              "{searchQuery}" 검색 결과가 없습니다
            </Text>
            <Text style={styles.noResultsHint}>
              다른 검색어로 시도해보세요
            </Text>
          </View>
        ) : (
          filteredData.map((item: TransformedCategory) => {
            const isExpanded = expandedCategories.includes(item.category);
            const selectedCount = selectedPaths.filter((p: FlavorPath) => p.level1 === item.category).length;

            return (
              <FlavorCategory
                key={item.category}
                category={item}
                isExpanded={isExpanded}
                selectedCount={selectedCount}
                onToggle={() => toggleCategory(item.category)}
                onSelectFlavor={handleSelectFlavor}
                selectedPaths={selectedPaths}
                searchQuery={searchQuery}
              />
            );
          })
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.nextButton, selectedPaths.length === 0 && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={selectedPaths.length === 0}
        >
          <Text style={styles.nextButtonText}>
            {selectedPaths.length > 0 ? '다음' : '향미를 선택해주세요'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 47 : 0,
  },
  navigationBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
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
  searchContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_SM,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.systemGray4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: HIGConstants.SPACING_SM,
    height: 36,
    borderWidth: 1,
    borderColor: HIGColors.systemGray5,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: HIGConstants.SPACING_XS,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: HIGColors.label,
    paddingVertical: 0,
  },
  clearButton: {
    fontSize: 18,
    color: HIGColors.tertiaryLabel,
    paddingLeft: HIGConstants.SPACING_XS,
  },
  searchResultCount: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
    marginTop: HIGConstants.SPACING_XS,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  bottomContainer: {
    padding: HIGConstants.SPACING_LG,
    borderTopWidth: 0.5,
    borderTopColor: HIGColors.systemGray4,
  },
  nextButton: {
    height: 48,
    backgroundColor: HIGColors.systemBlue,
    borderRadius: 12,
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
  noResultsContainer: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
  },
  noResultsEmoji: {
    fontSize: 48,
    marginBottom: HIGConstants.SPACING_MD,
  },
  noResultsText: {
    fontSize: 16,
    color: HIGColors.label,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: HIGConstants.SPACING_SM,
  },
  noResultsHint: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
  },
});