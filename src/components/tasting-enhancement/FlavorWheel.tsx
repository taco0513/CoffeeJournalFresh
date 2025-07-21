import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import Svg, { Circle, Path, Text as SvgText, G } from 'react-native-svg';
import { HIGColors, HIGConstants } from '../../styles/common';
import { UserLevel } from './UserLevelSelector';

interface FlavorCategory {
  id: string;
  name: string;
  color: string;
  subcategories: FlavorSubcategory[];
}

interface FlavorSubcategory {
  id: string;
  name: string;
  flavors: string[];
}

interface FlavorWheelProps {
  userLevel: UserLevel;
  selectedFlavors: string[];
  recentFlavors?: string[];
  savedFlavors?: string[];
  onSelectFlavor: (flavor: string) => void;
  onDeselectFlavor: (flavor: string) => void;
}

// 간단한 5개 카테고리 (초보자용)
const SIMPLE_FLAVOR_CATEGORIES: FlavorCategory[] = [
  {
    id: 'fruity',
    name: 'Fruity',
    color: '#FF6B6B',
    subcategories: [{
      id: 'fruity-simple',
      name: 'Fruity',
      flavors: ['Berry', 'Citrus', 'Tropical', 'Stone Fruit', 'Apple']
    }]
  },
  {
    id: 'nutty',
    name: 'Nutty',
    color: '#8B6914',
    subcategories: [{
      id: 'nutty-simple',
      name: 'Nutty',
      flavors: ['Almond', 'Hazelnut', 'Walnut', 'Peanut', 'Cashew']
    }]
  },
  {
    id: 'chocolate',
    name: 'Chocolate',
    color: '#6B4423',
    subcategories: [{
      id: 'chocolate-simple',
      name: 'Chocolate',
      flavors: ['Dark Chocolate', 'Milk Chocolate', 'Cocoa', 'Brownie', 'Fudge']
    }]
  },
  {
    id: 'floral',
    name: 'Floral',
    color: '#DDA0DD',
    subcategories: [{
      id: 'floral-simple',
      name: 'Floral',
      flavors: ['Jasmine', 'Rose', 'Lavender', 'Chamomile', 'Hibiscus']
    }]
  },
  {
    id: 'other',
    name: 'Other',
    color: '#708090',
    subcategories: [{
      id: 'other-simple',
      name: 'Other',
      flavors: ['Honey', 'Caramel', 'Vanilla', 'Spice', 'Earthy']
    }]
  }
];

// 전체 플레이버 휠 (중급자/전문가용)
const FULL_FLAVOR_CATEGORIES: FlavorCategory[] = [
  {
    id: 'fruity',
    name: 'Fruity',
    color: '#FF6B6B',
    subcategories: [
      {
        id: 'berry',
        name: 'Berry',
        flavors: ['Blackberry', 'Raspberry', 'Blueberry', 'Strawberry', 'Cranberry']
      },
      {
        id: 'citrus',
        name: 'Citrus',
        flavors: ['Lemon', 'Lime', 'Orange', 'Grapefruit', 'Bergamot']
      },
      {
        id: 'tropical',
        name: 'Tropical',
        flavors: ['Mango', 'Pineapple', 'Passion Fruit', 'Papaya', 'Lychee']
      },
      {
        id: 'stone-fruit',
        name: 'Stone Fruit',
        flavors: ['Peach', 'Apricot', 'Plum', 'Cherry', 'Nectarine']
      }
    ]
  },
  {
    id: 'nutty',
    name: 'Nutty/Cocoa',
    color: '#8B6914',
    subcategories: [
      {
        id: 'nut',
        name: 'Nut',
        flavors: ['Almond', 'Hazelnut', 'Walnut', 'Peanut', 'Cashew', 'Pecan']
      },
      {
        id: 'cocoa',
        name: 'Cocoa',
        flavors: ['Dark Chocolate', 'Milk Chocolate', 'Cocoa Nibs', 'Cacao', 'Brownie']
      }
    ]
  },
  {
    id: 'sweet',
    name: 'Sweet',
    color: '#FFD700',
    subcategories: [
      {
        id: 'brown-sugar',
        name: 'Brown Sugar',
        flavors: ['Molasses', 'Maple Syrup', 'Caramel', 'Honey', 'Butterscotch']
      },
      {
        id: 'vanilla',
        name: 'Vanilla',
        flavors: ['Vanilla', 'Vanillin', 'Cream', 'Custard', 'Marshmallow']
      }
    ]
  },
  {
    id: 'floral',
    name: 'Floral',
    color: '#DDA0DD',
    subcategories: [
      {
        id: 'floral-white',
        name: 'White Flowers',
        flavors: ['Jasmine', 'Orange Blossom', 'Elderflower', 'Honeysuckle']
      },
      {
        id: 'floral-color',
        name: 'Colored Flowers',
        flavors: ['Rose', 'Lavender', 'Violet', 'Hibiscus', 'Chamomile']
      }
    ]
  },
  {
    id: 'other',
    name: 'Other',
    color: '#708090',
    subcategories: [
      {
        id: 'spice',
        name: 'Spice',
        flavors: ['Cinnamon', 'Clove', 'Nutmeg', 'Black Pepper', 'Anise']
      },
      {
        id: 'savory',
        name: 'Savory',
        flavors: ['Tomato', 'Cucumber', 'Bell Pepper', 'Olive', 'Herbs']
      },
      {
        id: 'earthy',
        name: 'Earthy',
        flavors: ['Soil', 'Forest Floor', 'Mushroom', 'Moss', 'Wood']
      }
    ]
  }
];

export const FlavorWheel: React.FC<FlavorWheelProps> = ({
  userLevel,
  selectedFlavors,
  recentFlavors = [],
  savedFlavors = [],
  onSelectFlavor,
  onDeselectFlavor,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FlavorCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const categories = userLevel === 'beginner' ? SIMPLE_FLAVOR_CATEGORIES : FULL_FLAVOR_CATEGORIES;
  const maxFlavors = userLevel === 'beginner' ? 3 : userLevel === 'intermediate' ? 5 : 10;

  const isFlavorSelected = (flavor: string) => selectedFlavors.includes(flavor);
  const canSelectMore = selectedFlavors.length < maxFlavors;

  const handleFlavorPress = (flavor: string) => {
    if (isFlavorSelected(flavor)) {
      onDeselectFlavor(flavor);
    } else if (canSelectMore) {
      onSelectFlavor(flavor);
    }
  };

  const filteredFlavors = searchQuery
    ? categories
        .flatMap(cat => cat.subcategories.flatMap(sub => sub.flavors))
        .filter(flavor => flavor.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const renderSimpleCategories = () => (
    <View style={styles.simpleCategoriesContainer}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.simpleCategoryCard,
            { borderColor: category.color },
            selectedCategory?.id === category.id && styles.selectedCategoryCard
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text style={[styles.categoryName, { color: category.color }]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFlavorGrid = () => {
    if (!selectedCategory) return null;

    return (
      <View style={styles.flavorGridContainer}>
        <Text style={styles.subcategoryTitle}>
          {userLevel === 'beginner' ? '맛을 선택해주세요' : selectedCategory.name}
        </Text>
        {selectedCategory.subcategories.map((subcategory) => (
          <View key={subcategory.id} style={styles.subcategorySection}>
            {userLevel !== 'beginner' && (
              <Text style={styles.subcategoryName}>{subcategory.name}</Text>
            )}
            <View style={styles.flavorGrid}>
              {subcategory.flavors.map((flavor) => (
                <TouchableOpacity
                  key={flavor}
                  style={[
                    styles.flavorChip,
                    isFlavorSelected(flavor) && styles.selectedFlavorChip,
                    !canSelectMore && !isFlavorSelected(flavor) && styles.disabledFlavorChip,
                    savedFlavors.includes(flavor) && styles.savedFlavorChip,
                  ]}
                  onPress={() => handleFlavorPress(flavor)}
                  disabled={!canSelectMore && !isFlavorSelected(flavor)}
                >
                  <Text style={[
                    styles.flavorText,
                    isFlavorSelected(flavor) && styles.selectedFlavorText,
                  ]}>
                    {flavor}
                  </Text>
                  {savedFlavors.includes(flavor) && (
                    <Text style={styles.savedIndicator}>★</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderSearchResults = () => (
    <ScrollView style={styles.searchResults}>
      {filteredFlavors.map((flavor) => (
        <TouchableOpacity
          key={flavor}
          style={[
            styles.searchResultItem,
            isFlavorSelected(flavor) && styles.selectedSearchResult,
          ]}
          onPress={() => handleFlavorPress(flavor)}
          disabled={!canSelectMore && !isFlavorSelected(flavor)}
        >
          <Text style={[
            styles.searchResultText,
            isFlavorSelected(flavor) && styles.selectedSearchResultText,
          ]}>
            {flavor}
          </Text>
          {savedFlavors.includes(flavor) && (
            <Text style={styles.savedIndicator}>★</Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>향미 선택</Text>
        <Text style={styles.subtitle}>
          {selectedFlavors.length} / {maxFlavors} 선택됨
        </Text>
        {userLevel !== 'beginner' && (
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Text style={styles.searchButtonText}>🔍 검색</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="향미 검색..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && renderSearchResults()}
        </View>
      )}

      {/* Selected Flavors */}
      {selectedFlavors.length > 0 && (
        <View style={styles.selectedFlavorsContainer}>
          <Text style={styles.selectedFlavorsTitle}>선택한 향미</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.selectedFlavorsList}>
              {selectedFlavors.map((flavor) => (
                <TouchableOpacity
                  key={flavor}
                  style={styles.selectedFlavorPill}
                  onPress={() => onDeselectFlavor(flavor)}
                >
                  <Text style={styles.selectedFlavorPillText}>{flavor}</Text>
                  <Text style={styles.removeButton}>×</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Main Content */}
      {!showSearch && (
        <>
          {userLevel === 'beginner' ? renderSimpleCategories() : renderSimpleCategories()}
          {renderFlavorGrid()}
        </>
      )}

      {/* Recent/Saved Flavors */}
      {(recentFlavors.length > 0 || savedFlavors.length > 0) && !selectedCategory && (
        <View style={styles.quickAccessContainer}>
          {recentFlavors.length > 0 && (
            <View style={styles.quickAccessSection}>
              <Text style={styles.quickAccessTitle}>최근 사용한 향미</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.quickAccessList}>
                  {recentFlavors.slice(0, 5).map((flavor) => (
                    <TouchableOpacity
                      key={flavor}
                      style={[
                        styles.quickAccessChip,
                        isFlavorSelected(flavor) && styles.selectedQuickAccessChip,
                      ]}
                      onPress={() => handleFlavorPress(flavor)}
                      disabled={!canSelectMore && !isFlavorSelected(flavor)}
                    >
                      <Text style={styles.quickAccessText}>{flavor}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.white,
  },
  header: {
    padding: HIGConstants.SPACING_LG,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  subtitle: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
  },
  searchButton: {
    position: 'absolute',
    right: HIGConstants.SPACING_LG,
    top: HIGConstants.SPACING_LG,
    padding: HIGConstants.SPACING_SM,
  },
  searchButtonText: {
    fontSize: 16,
    color: HIGColors.systemBlue,
  },
  searchContainer: {
    padding: HIGConstants.SPACING_LG,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray6,
  },
  searchInput: {
    fontSize: 16,
    padding: HIGConstants.SPACING_MD,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    marginBottom: HIGConstants.SPACING_MD,
  },
  searchResults: {
    maxHeight: 200,
  },
  searchResultItem: {
    padding: HIGConstants.SPACING_MD,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedSearchResult: {
    backgroundColor: HIGColors.systemBlue + '20',
  },
  searchResultText: {
    fontSize: 16,
    color: HIGColors.label,
  },
  selectedSearchResultText: {
    color: HIGColors.systemBlue,
    fontWeight: '600',
  },
  simpleCategoriesContainer: {
    padding: HIGConstants.SPACING_LG,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HIGConstants.SPACING_MD,
  },
  simpleCategoryCard: {
    flex: 1,
    minWidth: '45%',
    padding: HIGConstants.SPACING_LG,
    borderWidth: 2,
    borderRadius: HIGConstants.cornerRadiusMedium,
    alignItems: 'center',
  },
  selectedCategoryCard: {
    backgroundColor: HIGColors.systemGray6,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
  },
  flavorGridContainer: {
    padding: HIGConstants.SPACING_LG,
  },
  subcategoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  subcategorySection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  subcategoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  flavorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HIGConstants.SPACING_SM,
  },
  flavorChip: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.cornerRadiusSmall,
    backgroundColor: HIGColors.systemGray6,
    borderWidth: 1,
    borderColor: HIGColors.systemGray5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: HIGConstants.SPACING_XS,
  },
  selectedFlavorChip: {
    backgroundColor: HIGColors.systemBlue,
    borderColor: HIGColors.systemBlue,
  },
  disabledFlavorChip: {
    opacity: 0.5,
  },
  savedFlavorChip: {
    borderColor: HIGColors.systemYellow,
  },
  flavorText: {
    fontSize: 14,
    color: HIGColors.label,
  },
  selectedFlavorText: {
    color: HIGColors.white,
    fontWeight: '600',
  },
  savedIndicator: {
    fontSize: 12,
    color: HIGColors.systemYellow,
  },
  selectedFlavorsContainer: {
    padding: HIGConstants.SPACING_LG,
    backgroundColor: HIGColors.systemGray6,
  },
  selectedFlavorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  selectedFlavorsList: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_SM,
  },
  selectedFlavorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HIGColors.systemBlue,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.cornerRadiusSmall,
    gap: HIGConstants.SPACING_XS,
  },
  selectedFlavorPillText: {
    color: HIGColors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    color: HIGColors.white,
    fontSize: 18,
    fontWeight: '300',
  },
  quickAccessContainer: {
    padding: HIGConstants.SPACING_LG,
  },
  quickAccessSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  quickAccessList: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_SM,
  },
  quickAccessChip: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.cornerRadiusSmall,
    backgroundColor: HIGColors.white,
    borderWidth: 1,
    borderColor: HIGColors.systemGray5,
  },
  selectedQuickAccessChip: {
    backgroundColor: HIGColors.systemBlue,
    borderColor: HIGColors.systemBlue,
  },
  quickAccessText: {
    fontSize: 14,
    color: HIGColors.label,
  },
});