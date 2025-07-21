import React, { useState, useCallback, useEffect } from 'react';
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
import { FlavorPath } from '../../stores/tastingStore';

// Debug component to track renders
const RenderCounter = ({ name }: { name: string }) => {
  const renderCount = React.useRef(0);
  renderCount.current += 1;
  
  console.log(`[RENDER] ${name}: ${renderCount.current}`);
  
  return (
    <Text style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'red', color: 'white', padding: 4 }}>
      {name}: {renderCount.current}
    </Text>
  );
};

export default function UnifiedFlavorScreenDebug() {
  console.log('[UnifiedFlavorScreenDebug] Component mounting');
  
  const navigation = useNavigation();
  const { currentTasting, updateField } = useTastingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const selectedPaths = currentTasting.selectedFlavors || [];

  // Log every state change
  useEffect(() => {
    console.log('[UnifiedFlavorScreenDebug] selectedPaths changed:', selectedPaths);
  }, [selectedPaths]);

  useEffect(() => {
    console.log('[UnifiedFlavorScreenDebug] searchQuery changed:', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    console.log('[UnifiedFlavorScreenDebug] expandedCategories changed:', expandedCategories);
  }, [expandedCategories]);

  const handleSelectFlavor = (path: FlavorPath) => {
    console.log('[UnifiedFlavorScreenDebug] handleSelectFlavor called with:', path);
    const newPaths = selectedPaths.filter(p => 
      !(p.level1 === path.level1 && p.level2 === path.level2 && p.level3 === path.level3)
    );
    
    if (newPaths.length === selectedPaths.length && selectedPaths.length < 5) {
      newPaths.push(path);
    }
    
    console.log('[UnifiedFlavorScreenDebug] Updating selectedFlavors to:', newPaths);
    updateField('selectedFlavors', newPaths);
  };

  const toggleCategory = (category: string) => {
    console.log('[UnifiedFlavorScreenDebug] toggleCategory called with:', category);
    setExpandedCategories(prev => {
      const newCategories = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      console.log('[UnifiedFlavorScreenDebug] New expandedCategories:', newCategories);
      return newCategories;
    });
  };

  const handleNext = () => {
    console.log('[UnifiedFlavorScreenDebug] Navigating to Sensory');
    navigation.navigate('Sensory' as never);
  };

  // Simple test data
  const testCategories = [
    { id: 'fruity', name: '과일향', emoji: '🍓' },
    { id: 'floral', name: '꽃향', emoji: '🌸' },
    { id: 'nutty', name: '견과류', emoji: '🥜' },
  ];

  const testFlavors: Record<string, string[]> = {
    'fruity': ['딸기', '블루베리', '체리'],
    'floral': ['장미', '자스민', '라벤더'],
    'nutty': ['아몬드', '헤이즐넛', '호두'],
  };

  return (
    <View style={styles.container}>
      <RenderCounter name="UnifiedFlavorScreenDebug" />
      
      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navigationTitle}>향미 선택 (Debug)</Text>
        <TouchableOpacity onPress={handleNext}>
          <Text style={styles.skipButton}>건너뛰기</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="향미 검색..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Selected Count */}
      <Text style={styles.selectedTitle}>
        선택한 향미 ({selectedPaths.length}/5)
      </Text>

      {/* Categories */}
      <ScrollView style={styles.content}>
        {testCategories.map(category => {
          const isExpanded = searchQuery ? true : expandedCategories.includes(category.id);
          
          return (
            <View key={category.id} style={styles.categoryContainer}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => !searchQuery && toggleCategory(category.id)}
              >
                <Text>{category.emoji} {category.name}</Text>
                <Text>{isExpanded ? '▼' : '▶'}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.flavorContainer}>
                  {testFlavors[category.id]?.map(flavor => {
                    const isSelected = selectedPaths.some(
                      p => p.level1 === category.id && p.level3 === flavor
                    );
                    
                    return (
                      <TouchableOpacity
                        key={flavor}
                        style={[
                          styles.flavorChip,
                          isSelected && styles.flavorChipSelected
                        ]}
                        onPress={() => handleSelectFlavor({
                          level1: category.id,
                          level2: category.id,
                          level3: flavor,
                        })}
                      >
                        <Text style={isSelected && styles.flavorTextSelected}>
                          {flavor}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Button */}
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
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    fontSize: 24,
    color: '#007AFF',
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  skipButton: {
    fontSize: 15,
    color: '#007AFF',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  categoryContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  flavorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  flavorChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  flavorChipSelected: {
    backgroundColor: '#007AFF',
  },
  flavorTextSelected: {
    color: '#FFFFFF',
  },
  nextButton: {
    height: 48,
    backgroundColor: '#007AFF',
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});