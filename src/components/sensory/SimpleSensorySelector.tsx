import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  koreanSensoryData,
  getSensoryExpressionsByCategory,
  SensoryExpression,
} from '../../data/koreanSensoryData';

const { width } = Dimensions.get('window');

interface SelectedSensory {
  categoryId: string;
  expressionId: string;
  korean: string;
  english: string;
  emoji: string;
  intensity: number;
}

interface SimpleSensorySelectorProps {
  selectedSensories: SelectedSensory[];
  onSensoryChange: (sensories: SelectedSensory[]) => void;
  maxSelections?: number;
  beginnerMode?: boolean;
}

const SimpleSensorySelector: React.FC<SimpleSensorySelectorProps> = ({
  selectedSensories,
  onSensoryChange,
  maxSelections = 8,
  beginnerMode = true,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('acidity');

  const handleExpressionSelect = useCallback((
    categoryId: string,
    expression: SensoryExpression
  ) => {
    const existingIndex = selectedSensories.findIndex(
      item => item.categoryId === categoryId && item.expressionId === expression.id
    );

    let newSelections = [...selectedSensories];

    if (existingIndex >= 0) {
      // Remove if already selected
      newSelections.splice(existingIndex, 1);
    } else {
      // Check max selections limit
      if (newSelections.length >= maxSelections) {
        return; // Don't add if at max limit
      }

      // Add new selection with default intensity based on expression
      newSelections.push({
        categoryId,
        expressionId: expression.id,
        korean: expression.korean,
        english: expression.english,
        emoji: expression.emoji,
        intensity: expression.intensity + 2, // Convert 1-3 to 3-5 scale
      });
    }

    onSensoryChange(newSelections);
  }, [selectedSensories, onSensoryChange, maxSelections]);

  const isExpressionSelected = useCallback((
    categoryId: string,
    expressionId: string
  ): boolean => {
    return selectedSensories.some(
      item => item.categoryId === categoryId && item.expressionId === expressionId
    );
  }, [selectedSensories]);

  const updateIntensity = useCallback((
    categoryId: string,
    expressionId: string,
    newIntensity: number
  ) => {
    const newSelections = selectedSensories.map(item => {
      if (item.categoryId === categoryId && item.expressionId === expressionId) {
        return { ...item, intensity: newIntensity };
      }
      return item;
    });
    onSensoryChange(newSelections);
  }, [selectedSensories, onSensoryChange]);

  const renderCategoryTab = (category: typeof koreanSensoryData[keyof typeof koreanSensoryData]) => {
    const isActive = activeCategory === category.id;
    const selectedCount = selectedSensories.filter(item => item.categoryId === category.id).length;

    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryTab,
          isActive && { backgroundColor: category.color, borderColor: category.color },
          !isActive && { borderColor: '#E9ECEF' }
        ]}
        onPress={() => setActiveCategory(category.id)}
        activeOpacity={0.8}
      >
        <Text style={styles.categoryTabEmoji}>{category.emoji}</Text>
        <Text style={[
          styles.categoryTabText,
          isActive && { color: '#FFFFFF' },
          !isActive && { color: '#495057' }
        ]}>
          {category.nameKo}
        </Text>
        {selectedCount > 0 && (
          <View style={[
            styles.categoryBadge,
            isActive ? { backgroundColor: '#FFFFFF' } : { backgroundColor: category.color }
          ]}>
            <Text style={[
              styles.categoryBadgeText,
              isActive ? { color: category.color } : { color: '#FFFFFF' }
            ]}>
              {selectedCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderExpressionChip = (categoryId: string, expression: SensoryExpression) => {
    const isSelected = isExpressionSelected(categoryId, expression.id);
    const category = koreanSensoryData[categoryId];
    const selectedItem = selectedSensories.find(
      item => item.categoryId === categoryId && item.expressionId === expression.id
    );

    return (
      <View key={expression.id} style={styles.expressionChipContainer}>
        <TouchableOpacity
          style={[
            styles.expressionChip,
            isSelected && {
              backgroundColor: `${category.color}20`,
              borderColor: category.color,
              borderWidth: 2,
            },
            !isSelected && {
              backgroundColor: '#F8F9FA',
              borderColor: '#E9ECEF',
              borderWidth: 1,
            }
          ]}
          onPress={() => handleExpressionSelect(categoryId, expression)}
          activeOpacity={0.8}
        >
          <Text style={styles.expressionEmoji}>{expression.emoji}</Text>
          <Text style={[
            styles.expressionText,
            isSelected && { color: category.color, fontWeight: '600' },
            !isSelected && { color: '#495057' }
          ]}>
            {expression.korean}
          </Text>
          {beginnerMode && expression.beginner && !isSelected && (
            <Text style={styles.beginnerIndicator}>⭐</Text>
          )}
        </TouchableOpacity>

        {/* Intensity selector for selected expressions */}
        {isSelected && selectedItem && (
          <View style={styles.intensitySelector}>
            {[3, 4, 5].map((intensity) => (
              <TouchableOpacity
                key={intensity}
                style={[
                  styles.intensityButton,
                  selectedItem.intensity === intensity && {
                    backgroundColor: category.color,
                  }
                ]}
                onPress={() => updateIntensity(categoryId, expression.id, intensity)}
              >
                <Text style={[
                  styles.intensityText,
                  selectedItem.intensity === intensity && { color: '#FFFFFF' }
                ]}>
                  {intensity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const currentCategory = koreanSensoryData[activeCategory];
  const expressions = getSensoryExpressionsByCategory(activeCategory, beginnerMode);

  return (
    <View style={styles.container}>
      {/* Header with selection count */}
      <View style={styles.header}>
        <Text style={styles.title}>감각 표현 선택</Text>
        <Text style={styles.selectionCount}>
          {selectedSensories.length} / {maxSelections}개 선택됨
        </Text>
      </View>

      {/* Category tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabsContainer}
        contentContainerStyle={styles.categoryTabsContent}
      >
        {Object.values(koreanSensoryData).map(renderCategoryTab)}
      </ScrollView>

      {/* Current category info */}
      <View style={[
        styles.categoryInfo,
        { backgroundColor: `${currentCategory.color}10` }
      ]}>
        <Text style={[styles.categoryInfoTitle, { color: currentCategory.color }]}>
          {currentCategory.nameKo} - {currentCategory.nameEn}
        </Text>
        <Text style={styles.categoryInfoDesc}>
          {currentCategory.description}
        </Text>
      </View>

      {/* Expression chips */}
      <ScrollView style={styles.expressionsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.expressionGrid}>
          {expressions.map((expression) =>
            renderExpressionChip(activeCategory, expression)
          )}
        </View>
        
        {expressions.length === 0 && (
          <Text style={styles.noExpressionsText}>
            {beginnerMode ? '초보자용 표현이 준비 중입니다' : '표현이 없습니다'}
          </Text>
        )}
      </ScrollView>

      {/* Selected summary at bottom */}
      {selectedSensories.length > 0 && (
        <View style={styles.selectedSummary}>
          <Text style={styles.selectedSummaryTitle}>선택된 표현들</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.selectedItems}>
              {selectedSensories.map((item, index) => {
                const category = koreanSensoryData[item.categoryId];
                return (
                  <View
                    key={`${item.categoryId}-${item.expressionId}-${index}`}
                    style={[
                      styles.selectedItem,
                      { borderColor: category.color }
                    ]}
                  >
                    <Text style={styles.selectedItemEmoji}>{item.emoji}</Text>
                    <Text style={styles.selectedItemText}>{item.korean}</Text>
                    <Text style={[styles.selectedItemIntensity, { color: category.color }]}>
                      {item.intensity}점
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
  },
  selectionCount: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },

  // Category tabs
  categoryTabsContainer: {
    maxHeight: 60,
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
    justifyContent: 'center',
  },
  categoryTabEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryBadge: {
    marginLeft: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Category info
  categoryInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  categoryInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryInfoDesc: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },

  // Expressions
  expressionsContainer: {
    flex: 1,
  },
  expressionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingBottom: 8,
  },
  expressionChipContainer: {
    marginRight: 8,
    marginBottom: 8,
  },
  expressionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minHeight: 36,
  },
  expressionEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  expressionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  beginnerIndicator: {
    fontSize: 12,
    marginLeft: 4,
  },

  // Intensity selector
  intensitySelector: {
    flexDirection: 'row',
    marginTop: 4,
    justifyContent: 'center',
  },
  intensityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  intensityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
  },

  // Selected summary
  selectedSummary: {
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    padding: 12,
  },
  selectedSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  selectedItems: {
    flexDirection: 'row',
  },
  selectedItem: {
    alignItems: 'center',
    marginRight: 8,
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    minWidth: 60,
  },
  selectedItemEmoji: {
    fontSize: 12,
    marginBottom: 2,
  },
  selectedItemText: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 2,
  },
  selectedItemIntensity: {
    fontSize: 10,
    fontWeight: '600',
  },

  noExpressionsText: {
    textAlign: 'center',
    color: '#6C757D',
    fontSize: 14,
    padding: 40,
    fontStyle: 'italic',
  },
});

export default SimpleSensorySelector;