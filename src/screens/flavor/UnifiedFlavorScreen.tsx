import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Dimensions,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
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

// Beginner-friendly flavors to show first
const BEGINNER_CATEGORIES = ['Fruity', 'Sweet', 'Nutty/Cocoa'];

// Flavor pairing suggestions
const FLAVOR_PAIRINGS: Record<string, string[]> = {
  '초콜릿': ['캐러멜', '견과류', '바닐라'],
  '베리류': ['초콜릿', '꽃향', '와인'],
  '시트러스': ['꽃향', '허브', '홍차'],
  '캐러멜': ['초콜릿', '견과류', '황설탕'],
  '꽃향': ['과일향', '허브', '홍차'],
  '견과류': ['초콜릿', '캐러멜', '향신료'],
};

export default function UnifiedFlavorScreen() {
  const navigation = useNavigation();
  const { currentTasting, updateField } = useTastingStore();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);

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
    // Add haptic feedback
    ReactNativeHapticFeedback.trigger('impactLight', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    
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

  // Filter and organize data based on search query and progressive disclosure
  const filteredData = useMemo(() => {
    let data = flavorData;
    
    // Apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = flavorData.filter(item => {
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
      return data;
    }
    
    // Apply progressive disclosure when not searching
    if (!showAllCategories) {
      // Show beginner categories first
      const beginnerData = data.filter(item => BEGINNER_CATEGORIES.includes(item.category));
      const advancedData = data.filter(item => !BEGINNER_CATEGORIES.includes(item.category));
      return beginnerData;
    }
    
    return data;
  }, [flavorData, searchQuery, showAllCategories]);
  
  // Get all categories for "show more" feature
  const hasMoreCategories = useMemo(() => {
    if (searchQuery.trim()) return false;
    return !showAllCategories && flavorData.length > BEGINNER_CATEGORIES.length;
  }, [searchQuery, showAllCategories]);

  // Create floating counter component
  const FloatingCounter = () => {
    const progress = selectedPaths.length / 5;
    const radius = 25;
    const strokeWidth = 3;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress * circumference);
    
    return (
      <View style={styles.floatingCounter}>
        <View style={styles.counterCircle}>
          <Text style={styles.counterText}>{selectedPaths.length}/5</Text>
        </View>
        <View style={styles.progressRing}>
          <View style={[styles.progressRingFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
    );
  };
  
  // Get smart flavor suggestions based on current selections
  const getFlavorSuggestions = () => {
    const suggestions = new Set<string>();
    
    selectedPaths.forEach(path => {
      const flavorKey = path.level3 || path.level2;
      const pairings = FLAVOR_PAIRINGS[flavorKey];
      if (pairings) {
        pairings.forEach(pairing => suggestions.add(pairing));
      }
    });
    
    // Remove already selected flavors
    selectedPaths.forEach(path => {
      suggestions.delete(path.level3 || path.level2);
    });
    
    return Array.from(suggestions).slice(0, 3); // Return top 3 suggestions
  };
  
  const flavorSuggestions = selectedPaths.length > 0 ? getFlavorSuggestions() : [];
  
  // Get screen dimensions for responsive design
  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth >= 768;

  return (
    <View style={[styles.container, isTablet && styles.containerTablet]}>
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

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
      </View>

      {/* Selected Flavors */}
      <SelectedFlavors
        selectedPaths={selectedPaths}
        onRemove={handleRemoveFlavor}
      />
      
      {/* Smart Suggestions */}
      {flavorSuggestions.length > 0 && selectedPaths.length < 5 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>어울리는 향미:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsList}
          >
            {flavorSuggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={styles.suggestionPill}
                onPress={() => {
                  // Find the flavor in the data structure and add it
                  flavorData.forEach(category => {
                    category.subcategories.forEach(subcategory => {
                      if (subcategory.koreanName === suggestion || subcategory.name === suggestion) {
                        handleSelectFlavor(category.category, subcategory.name, '');
                      } else {
                        subcategory.flavors.forEach(flavor => {
                          if (flavor.koreanName === suggestion) {
                            handleSelectFlavor(category.category, subcategory.name, flavor.name);
                          }
                        });
                      }
                    });
                  });
                }}
              >
                <Text style={styles.suggestionPlusIcon}>+</Text>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

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
            onSubmitEditing={() => {
              if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
                setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 2)]);
              }
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        
        
        {/* Recent Searches */}
        {searchQuery.length === 0 && recentSearches.length > 0 && (
          <View style={styles.recentSearchesContainer}>
            <Text style={styles.recentTitle}>최근 검색:</Text>
            <View style={styles.recentSearchesList}>
              {recentSearches.map((term, index) => (
                <TouchableOpacity
                  key={`${term}-${index}`}
                  style={styles.recentSearchPill}
                  onPress={() => setSearchQuery(term)}
                >
                  <Text style={styles.recentSearchText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {searchQuery.length > 0 && filteredData.length > 0 && (
          <Text style={styles.searchResultCount}>
            {filteredData.reduce((count, cat) => 
              count + cat.subcategories.reduce((subCount, sub) => 
                subCount + sub.flavors.length, 0), 0
            )}개의 향미를 찾았습니다
          </Text>
        )}
      </View>

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
          <>
            {filteredData.map((item: TransformedCategory) => {
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
            })}
            
            {/* Show More Button */}
            {hasMoreCategories && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllCategories(true)}
              >
                <Text style={styles.showMoreText}>더 많은 향미 카테고리 보기 +</Text>
                <Text style={styles.showMoreHint}>고급 사용자를 위한 추가 옵션</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
      
      {/* Floating Selection Counter */}
      {selectedPaths.length > 0 && <FloatingCounter />}

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
  containerTablet: {
    paddingHorizontal: 80,
    maxWidth: 1024,
    alignSelf: 'center',
    width: '100%',
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
  progressContainer: {
    backgroundColor: '#FFFFFF',
  },
  progressBar: {
    height: 4,
    backgroundColor: HIGColors.systemGray5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: HIGColors.systemBlue,
  },
  searchContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_LG,
    paddingBottom: HIGConstants.SPACING_LG,
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
  recentSearchesContainer: {
    marginTop: HIGConstants.SPACING_MD,
  },
  recentTitle: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
  },
  recentSearchesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentSearchPill: {
    backgroundColor: HIGColors.systemGray6,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_XS,
  },
  recentSearchText: {
    fontSize: 13,
    color: HIGColors.systemBlue,
  },
  content: {
    flex: 1,
    paddingTop: HIGConstants.SPACING_SM,
  },
  bottomContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_MD,
    paddingBottom: HIGConstants.SPACING_LG,
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
  showMoreButton: {
    marginHorizontal: HIGConstants.SPACING_LG,
    marginVertical: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_LG,
    alignItems: 'center',
    backgroundColor: HIGColors.systemGray6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HIGColors.systemGray5,
    borderStyle: 'dashed',
  },
  showMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.systemBlue,
    marginBottom: HIGConstants.SPACING_XS,
  },
  showMoreHint: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
  },
  floatingCounter: {
    position: 'absolute',
    bottom: 90,
    right: HIGConstants.SPACING_LG,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: HIGColors.systemBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 30,
    borderWidth: 3,
    borderColor: HIGColors.systemGray5,
  },
  progressRingFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: 30,
    backgroundColor: HIGColors.systemBlue,
    opacity: 0.3,
  },
  suggestionsContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingBottom: HIGConstants.SPACING_SM,
  },
  suggestionsTitle: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
  },
  suggestionsList: {
    paddingRight: HIGConstants.SPACING_LG,
  },
  suggestionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HIGColors.systemGray6,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: 16,
    marginRight: HIGConstants.SPACING_SM,
    borderWidth: 1,
    borderColor: HIGColors.systemBlue,
    borderStyle: 'dashed',
  },
  suggestionPlusIcon: {
    fontSize: 14,
    color: HIGColors.systemBlue,
    marginRight: HIGConstants.SPACING_XS,
    fontWeight: '600',
  },
  suggestionText: {
    fontSize: 14,
    color: HIGColors.systemBlue,
    fontWeight: '500',
  },
});