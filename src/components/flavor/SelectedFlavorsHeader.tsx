import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { FlavorPath } from '../../stores/tastingStore';
import { selectedFlavorsHeaderStyles as styles } from './styles/selectedFlavorsHeaderStyles';
import { transformFlavorData } from './utils/flavorDataTransform';

const flavorData = transformFlavorData();

interface SelectedFlavorsHeaderProps {
  selectedPaths: FlavorPath[];
  onRemoveFlavor: (index: number) => void;
  onToggleAllCategories: () => void;
  expandedCategoriesCount: number;
  totalCategoriesCount: number;
}

export const SelectedFlavorsHeader: React.FC<SelectedFlavorsHeaderProps> = React.memo(({
  selectedPaths,
  onRemoveFlavor,
  onToggleAllCategories,
  expandedCategoriesCount,
  totalCategoriesCount,
}) => {
  return (
    <View style={[styles.stickyHeader, selectedPaths.length === 0 && styles.stickyHeaderEmpty]}>
      <View style={styles.stickyHeaderTop}>
        <Text style={styles.stickyHeaderTitle}>
          선택한 향미 ({selectedPaths.length}/5)
        </Text>
        <TouchableOpacity onPress={onToggleAllCategories}>
          <Text style={styles.toggleAllText}>
            {expandedCategoriesCount === totalCategoriesCount ? '모든 카테고리 닫기' : '모든 카테고리 열기'}
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
              displayName = subcategoryData?.koreanName || path.level2;
              isSubcategorySelection = true;
            } else {
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
                  onPress={() => onRemoveFlavor(index)}
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
  );
});

SelectedFlavorsHeader.displayName = 'SelectedFlavorsHeader';