import React, { memo, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  UIManager,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HIGColors } from '../styles/common';
import { useFlavorScreenData } from '../stores/selectors';
import { usePerformanceOptimized } from '../hooks/usePerformanceOptimized';
import { withPerformanceMonitoring } from '../components/common/PerformanceOptimizedWrapper';
import { flavorDataOptimizer } from '../services/FlavorDataOptimizer';
import { CategoryAccordion } from '../components/flavor/CategoryAccordion';
import { SelectedFlavorsHeader } from '../components/flavor/SelectedFlavorsHeader';
import { unifiedFlavorScreenStyles as styles } from './flavor/styles/unifiedFlavorScreenStyles';
import { trackPerformance } from '../utils/performanceAnalysis';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Memoized search input component
const SearchInput = memo<{
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}>(({ value, onChangeText, placeholder }) => (
  <TextInput
    style={styles.searchInput}
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor={HIGColors.secondaryLabel}
  />
));

SearchInput.displayName = 'SearchInput';

// Memoized navigation buttons
const NavigationButtons = memo<{
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  selectedCount: number;
}>(({ onBack, onNext, canGoBack, selectedCount }) => (
  <View style={styles.navigationContainer}>
    {canGoBack && (
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.buttonText}>← 뒤로</Text>
      </TouchableOpacity>
    )}
    
    <TouchableOpacity 
      style={[styles.nextButton, selectedCount === 0 && styles.disabledButton]} 
      onPress={onNext}
      disabled={selectedCount === 0}
    >
      <Text style={[styles.buttonText, selectedCount === 0 && styles.disabledButtonText]}>
        다음 →
      </Text>
    </TouchableOpacity>
  </View>
));

NavigationButtons.displayName = 'NavigationButtons';

function OptimizedUnifiedFlavorScreen() {
  const navigation = useNavigation();
  const { mode, selectedFlavors, setSelectedFlavors, updateField } = useFlavorScreenData();
  const { debouncedCallback, memoizedComputation } = usePerformanceOptimized();

  // Optimized search state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());
  const [expandedSubCategories, setExpandedSubCategories] = React.useState<Set<string>>(new Set());

  // Memoized flavor data with performance tracking
  const flavorData = memoizedComputation(
    () => flavorDataOptimizer.getTransformedFlavorData(),
    [],
    'flavor_data_load'
  );

  // Memoized search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return flavorDataOptimizer.searchFlavors(searchQuery, 20);
  }, [searchQuery]);

  // Optimized search handler with debouncing
  const handleSearchChange = debouncedCallback(
    (text: string) => {
      setSearchQuery(text);
      
      // Auto-expand categories when searching
      if (text.trim()) {
        const newExpanded = new Set<string>();
        searchResults.forEach(result => {
          newExpanded.add(result.category);
          if (result.subcategory) {
            newExpanded.add(`${result.category}-${result.subcategory}`);
          }
        });
        setExpandedCategories(newExpanded);
        setExpandedSubCategories(newExpanded);
      }
    },
    300,
    'search_debounce'
  );

  // Optimized flavor selection handlers
  const handleSelectFlavor = useCallback(
    trackPerformance((flavorPath: any) => {
      const newFlavors = [...selectedFlavors];
      const existingIndex = newFlavors.findIndex(f => 
        f.level1 === flavorPath.level1 && 
        f.level2 === flavorPath.level2 && 
        f.level3 === flavorPath.level3
      );

      if (existingIndex >= 0) {
        newFlavors.splice(existingIndex, 1);
      } else if (newFlavors.length < 5) {
        newFlavors.push(flavorPath);
      }

      setSelectedFlavors(newFlavors);
      updateField('selectedFlavors', newFlavors);
    }, 'flavor_selection'),
    [selectedFlavors, setSelectedFlavors, updateField]
  );

  const handleRemoveFlavor = useCallback(
    trackPerformance((index: number) => {
      const newFlavors = [...selectedFlavors];
      newFlavors.splice(index, 1);
      setSelectedFlavors(newFlavors);
      updateField('selectedFlavors', newFlavors);
    }, 'flavor_removal'),
    [selectedFlavors, setSelectedFlavors, updateField]
  );

  // Navigation handlers
  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const handleNext = useCallback(
    trackPerformance(() => {
      if (mode === 'lab') {
        navigation.navigate('ExperimentalData' as never);
      } else {
        navigation.navigate('SensoryEvaluation' as never);
      }
    }, 'navigation_next'),
    [navigation, mode]
  );

  // Category toggle handlers
  const toggleCategory = useCallback((categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  }, []);

  const toggleSubcategory = useCallback((subcategoryKey: string) => {
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

  // Memoized filtered flavor data
  const filteredFlavorData = useMemo(() => {
    if (!searchQuery.trim()) return flavorData;
    
    // Filter categories based on search results
    const relevantCategories = new Set(searchResults.map(r => r.category));
    return flavorData.filter((category: any) => relevantCategories.has(category.name));
  }, [flavorData, searchQuery, searchResults]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with selected flavors */}
      <SelectedFlavorsHeader
        selectedFlavors={selectedFlavors}
        onRemoveFlavor={handleRemoveFlavor}
        maxFlavors={5}
      />

      {/* Search input */}
      <View style={styles.searchContainer}>
        <SearchInput
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="향미 검색..."
        />
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${(selectedFlavors.length / 5) * 100}%` }]} 
          />
        </View>
        <Text style={styles.progressText}>
          {selectedFlavors.length}/5 선택됨
        </Text>
      </View>

      {/* Flavor categories */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
      >
        {filteredFlavorData.map((category: any, index: number) => (
          <CategoryAccordion
            key={category.name}
            category={category}
            isExpanded={expandedCategories.has(category.name)}
            expandedSubCategories={expandedSubCategories}
            selectedFlavors={selectedFlavors}
            searchQuery={searchQuery}
            onToggleCategory={() => toggleCategory(category.name)}
            onToggleSubcategory={toggleSubcategory}
            onSelectFlavor={handleSelectFlavor}
            maxFlavors={5}
          />
        ))}
      </ScrollView>

      {/* Navigation buttons */}
      <NavigationButtons
        onBack={handleBack}
        onNext={handleNext}
        canGoBack={navigation.canGoBack()}
        selectedCount={selectedFlavors.length}
      />
    </SafeAreaView>
  );
}

// Export with performance monitoring
export default withPerformanceMonitoring(
  OptimizedUnifiedFlavorScreen,
  'OptimizedUnifiedFlavorScreen'
);