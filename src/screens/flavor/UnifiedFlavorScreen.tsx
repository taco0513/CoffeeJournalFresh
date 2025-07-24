import React from 'react';
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
import { HIGColors } from '../../styles/common';
import { useTastingStore } from '../../stores/tastingStore';
import { useFlavorSelection } from '../../hooks/useFlavorSelection';
import { CategoryAccordion } from '../../components/flavor/CategoryAccordion';
import { SelectedFlavorsHeader } from '../../components/flavor/SelectedFlavorsHeader';
import { transformFlavorData } from '../../components/flavor/utils/flavorDataTransform';
import { unifiedFlavorScreenStyles as styles } from './styles/unifiedFlavorScreenStyles';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const flavorData = transformFlavorData();

export default function UnifiedFlavorScreen() {
  const navigation = useNavigation();
  const { currentTasting, updateField } = useTastingStore();
  const selectedPaths = currentTasting.selectedFlavors || [];

  const {
    searchQuery,
    setSearchQuery,
    expandedCategories,
    expandedSubCategories,
    handleSelectSubcategory,
    handleSelectFlavor,
    handleRemoveFlavor,
    toggleCategory,
    toggleSubcategory,
    toggleAllCategories,
  } = useFlavorSelection(selectedPaths, updateField as (field: string, value: any) => void);

  const handleNext = () => {
    // Navigate based on mode
    if (currentTasting.mode === 'lab') {
      navigation.navigate('ExperimentalData' as never);
    } else {
      // For both cafe and home_cafe modes, go to sensory evaluation
      navigation.navigate('SensoryEvaluation' as never);
    }
  };

  const handleSkip = () => {
    // Navigate based on mode
    if (currentTasting.mode === 'lab') {
      navigation.navigate('ExperimentalData' as never);
    } else {
      // For both cafe and home_cafe modes, go to sensory evaluation
      navigation.navigate('SensoryEvaluation' as never);
    }
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

      {/* Progress Bar - Different progress for different modes */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: currentTasting.mode === 'lab' ? '25%' : '43%' }]} />
      </View>

      {/* Guide Message */}
      <View style={styles.guideMessageContainer}>
        <Text style={styles.guideMessage}>
          향과 맛을 선택해보세요
        </Text>
        <Text style={styles.guideSubMessage}>
          커피에서 느껴지는 향미를 골라주세요 (최대 5개)
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
      <SelectedFlavorsHeader
        selectedPaths={selectedPaths}
        onRemoveFlavor={handleRemoveFlavor}
        onToggleAllCategories={toggleAllCategories}
        expandedCategoriesCount={expandedCategories.length}
        totalCategoriesCount={flavorData.length}
      />

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
