import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HIGConstants, HIGColors } from '../../styles/common';
import { useTastingStore } from '../../stores/tastingStore';
import { flavorWheelKorean } from '../../data/flavorWheelKorean';
import { FlavorPath } from '../../stores/tastingStore';
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

  // Memoize the transformed data to prevent recalculation on every render
  const flavorData = useMemo(
    () => transformFlavorData(flavorWheelKorean as FlavorWheelData),
    []
  );

  const selectedPaths = currentTasting.selectedFlavors || [];

  const handleSelectFlavor = useCallback((level1: string, level2: string, level3: string) => {
    const path: FlavorPath = { level1, level2, level3 };
    const currentPaths = [...selectedPaths];
    const existingIndex = currentPaths.findIndex(
      (p: FlavorPath) => p.level1 === path.level1 && p.level2 === path.level2 && p.level3 === path.level3
    );

    if (existingIndex >= 0) {
      currentPaths.splice(existingIndex, 1);
    } else if (currentPaths.length < 5) {
      currentPaths.push(path);
    }

    updateField('selectedFlavors', currentPaths);
  }, [selectedPaths, updateField]);

  const handleRemoveFlavor = useCallback((path: FlavorPath) => {
    const currentPaths = selectedPaths.filter(
      (p: FlavorPath) => !(p.level1 === path.level1 && p.level2 === path.level2 && p.level3 === path.level3)
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

  // Use memoized flavor data
  const filteredData = flavorData;

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

      {/* Selected Flavors */}
      <SelectedFlavors
        selectedPaths={selectedPaths}
        onRemove={handleRemoveFlavor}
      />

      {/* Categories */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
            />
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
});