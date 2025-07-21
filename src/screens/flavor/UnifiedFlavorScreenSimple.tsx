import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HIGConstants, HIGColors } from '../../styles/common';
import { useTastingStore } from '../../stores/tastingStore';
import { flavorWheelKorean } from '../../data/flavorWheelKorean';
import { FlavorPath } from '../../stores/tastingStore';

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

export default function UnifiedFlavorScreenSimple() {
  const navigation = useNavigation();
  const { currentTasting, updateField } = useTastingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const selectedPaths = currentTasting.selectedFlavors || [];

  const handleSelectFlavor = useCallback((path: FlavorPath) => {
    const currentPaths = [...(currentTasting.selectedFlavors || [])];
    const existingIndex = currentPaths.findIndex(
      p => p.level1 === path.level1 && p.level2 === path.level2 && p.level3 === path.level3
    );

    if (existingIndex >= 0) {
      currentPaths.splice(existingIndex, 1);
    } else if (currentPaths.length < 5) {
      currentPaths.push(path);
    }

    updateField('selectedFlavors', currentPaths);
  }, [currentTasting.selectedFlavors, updateField]);

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

  // Filter categories based on search
  const filteredData = searchQuery
    ? flavorData.filter(item => 
        item.subcategories.some(sub =>
          sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.koreanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.flavors.some(f =>
            f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.koreanName.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      )
    : flavorData;

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
      <View style={styles.selectedContainer}>
        <Text style={styles.selectedTitle}>
          선택한 향미 ({selectedPaths.length}/5)
        </Text>
        {selectedPaths.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedPaths.map((path, index) => (
              <TouchableOpacity
                key={index}
                style={styles.selectedChip}
                onPress={() => handleSelectFlavor(path)}
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

      {/* Categories */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredData.map(item => {
          const isExpanded = searchQuery ? true : expandedCategories.includes(item.category);
          const selectedCount = selectedPaths.filter(p => p.level1 === item.category).length;

          return (
            <View key={item.category} style={styles.categoryContainer}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => !searchQuery && toggleCategory(item.category)}
              >
                <View style={styles.categoryLeft}>
                  <Text style={styles.categoryEmoji}>{item.emoji}</Text>
                  <Text style={styles.categoryTitle}>{item.koreanName}</Text>
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
                  {item.subcategories.map(sub => (
                    <View key={sub.name} style={styles.subcategory}>
                      <Text style={styles.subcategoryTitle}>{sub.koreanName}</Text>
                      <View style={styles.flavorGrid}>
                        {sub.flavors.map(flavor => {
                          const isSelected = selectedPaths.some(
                            p => p.level1 === item.category && 
                                 p.level2 === sub.name && 
                                 p.level3 === flavor.name
                          );
                          return (
                            <TouchableOpacity
                              key={flavor.name}
                              style={[
                                styles.flavorChip,
                                isSelected && styles.flavorChipSelected
                              ]}
                              onPress={() => handleSelectFlavor({
                                level1: item.category,
                                level2: sub.name,
                                level3: flavor.name,
                              })}
                            >
                              <Text style={[
                                styles.flavorText,
                                isSelected && styles.flavorTextSelected
                              ]}>
                                {flavor.koreanName}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
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
    padding: HIGConstants.SPACING_LG,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HIGColors.systemGray6,
    borderRadius: 12,
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
  content: {
    flex: 1,
  },
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
  flavorChip: {
    backgroundColor: HIGColors.systemGray6,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: 8,
    marginRight: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_SM,
  },
  flavorChipSelected: {
    backgroundColor: HIGColors.systemBlue,
  },
  flavorText: {
    fontSize: 14,
    color: HIGColors.label,
  },
  flavorTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
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
});