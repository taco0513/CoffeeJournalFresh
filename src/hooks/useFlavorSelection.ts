import { useState, useCallback } from 'react';
import { LayoutAnimation } from 'react-native';
import { FlavorPath } from '../types/tasting';
import { transformFlavorData } from '../components/flavor/utils/flavorDataTransform';

const flavorData = transformFlavorData();

export const useFlavorSelection = (
  selectedPaths: FlavorPath[],
  updateField: (field: string, value: unknown) => void
) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(new Set());

  const handleSelectSubcategory = useCallback((level1: string, level2: string) => {
    const currentPaths = [...selectedPaths];
    
    const existingSubcategoryIndex = currentPaths.findIndex(
      p => p.level1 === level1 && p.level2 === level2 && !p.level3
    );
    
    if (existingSubcategoryIndex >= 0) {
      currentPaths.splice(existingSubcategoryIndex, 1);
      updateField('selectedFlavors', currentPaths);
  } else {
      const filteredPaths = currentPaths.filter(
        p => !(p.level1 === level1 && p.level2 === level2 && p.level3)
      );
      
      if (filteredPaths.length < 5) {
        filteredPaths.push({
          level1,
          level2,
          level3: '',
      });
        updateField('selectedFlavors', filteredPaths);
    }
  }
}, [selectedPaths, updateField]);

  const handleSelectFlavor = useCallback((path: FlavorPath) => {
    const currentPaths = [...selectedPaths];
    const existingIndex = currentPaths.findIndex(
      p => p.level1 === path.level1 && p.level2 === path.level2 && p.level3 === path.level3
    );

    if (existingIndex >= 0) {
      currentPaths.splice(existingIndex, 1);
      updateField('selectedFlavors', currentPaths);
  } else if (currentPaths.length < 5) {
      const indexToRemove = currentPaths.findIndex(
        p => p.level1 === path.level1 && p.level2 === path.level2 && !p.level3
      );
      if (indexToRemove >= 0) {
        currentPaths.splice(indexToRemove, 1);
    }
      
      currentPaths.push(path);
      updateField('selectedFlavors', currentPaths);
  }
}, [selectedPaths, updateField]);

  const handleRemoveFlavor = useCallback((index: number) => {
    const currentPaths = [...selectedPaths];
    const removedPath = currentPaths[index];
    currentPaths.splice(index, 1);
    updateField('selectedFlavors', currentPaths);
    
    if (removedPath && !removedPath.level3) {
      const subcategoryKey = `${removedPath.level1}-${removedPath.level2}`;
      setExpandedSubCategories(prev => {
        const newSet = new Set(prev);
        if (newSet.has(subcategoryKey)) {
          newSet.delete(subcategoryKey);
      }
        return newSet;
    });
  }
}, [selectedPaths, updateField]);

  const toggleCategory = useCallback((category: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
    } else {
        return [...prev, category];
    }
  });
}, []);
  
  const toggleSubcategory = useCallback((subcategoryKey: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
  
  const toggleAllCategories = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategories(prev => {
      if (prev.length === flavorData.length) {
        return [];
    } else {
        return flavorData.map(item => item.category);
    }
  });
}, []);

  return {
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
};
};