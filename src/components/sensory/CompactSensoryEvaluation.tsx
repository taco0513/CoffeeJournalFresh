import React, { useState, useCallback, useMemo } from 'react';
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

interface SelectedExpression {
  categoryId: string;
  expression: SensoryExpression;
}

interface CompactSensoryEvaluationProps {
  selectedExpressions?: SelectedExpression[];
  onExpressionChange: (expressions: SelectedExpression[]) => void;
  beginnerMode?: boolean;
}

const MAX_PER_CATEGORY = 3;

const CompactSensoryEvaluation: React.FC<CompactSensoryEvaluationProps> = ({
  selectedExpressions = [],
  onExpressionChange,
  beginnerMode = true,
}) => {
  console.log('🚀 CompactSensoryEvaluation rendered with selectedExpressions:', selectedExpressions?.length || 0);
  const [activeCategory, setActiveCategory] = useState('acidity');

  // Ensure selectedExpressions is always an array
  const safeSelectedExpressions = selectedExpressions || [];

  const handleExpressionSelect = useCallback((
    categoryId: string,
    expression: SensoryExpression
  ) => {
    const currentExpressions = selectedExpressions || [];
    
    // Create unique identifier using Korean text + category (allows same Korean text in different categories)
    const uniqueKey = `${expression.korean}_${categoryId}`;
    
    // Find if this exact expression+category combination is already selected
    const existingIndex = currentExpressions.findIndex(
      item => item.categoryId === categoryId && item.expression.id === expression.id
    );
    
    
    const categorySelections = currentExpressions.filter(
      item => item.categoryId === categoryId
    );

    let newExpressions = [...currentExpressions];

    if (existingIndex >= 0) {
      // Deselecting - remove the existing selection
      newExpressions.splice(existingIndex, 1);
    } else {
      // Attempting to select
      if (categorySelections.length >= MAX_PER_CATEGORY) {
        return; // Category limit reached
      }
      
      // Add new selection
      newExpressions.push({ categoryId, expression });
    }

    onExpressionChange(newExpressions);
  }, [selectedExpressions, onExpressionChange]);

  const isExpressionSelected = useCallback((
    categoryId: string,
    expressionId: string
  ): boolean => {
    return safeSelectedExpressions.some(
      item => item.categoryId === categoryId && item.expression.id === expressionId
    );
  }, [safeSelectedExpressions]);

  const getSelectedCount = useCallback((categoryId: string): number => {
    return safeSelectedExpressions.filter(item => item.categoryId === categoryId).length;
  }, [safeSelectedExpressions]);



  const categories = useMemo(() => Object.values(koreanSensoryData), []);
  const activeExpressions = useMemo(
    () => getSensoryExpressionsByCategory(activeCategory, beginnerMode),
    [activeCategory, beginnerMode]
  );

  return (
    <View style={styles.container}>
      {/* Compact header */}
      <View style={styles.header}>
        <Text style={styles.title}>감각 평가</Text>
        <Text style={styles.selectedCount}>
          {safeSelectedExpressions.length}개 선택됨
        </Text>
      </View>

      {/* Horizontal category tabs */}
      <View style={styles.categoryTabsWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryTabs}
          contentContainerStyle={styles.categoryTabsContent}
        >
        {categories.map((category) => {
          const isActive = category.id === activeCategory;
          const count = getSelectedCount(category.id);
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                isActive && styles.categoryTabActive,
                isActive && { borderColor: category.color },
                count > 0 && styles.categoryTabWithSelection
              ]}
              onPress={() => setActiveCategory(category.id)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.categoryTabText,
                isActive && styles.categoryTabTextActive,
                isActive && { color: category.color },
                count > 0 && styles.categoryTabTextSelected
              ]}>
                {category.nameKo}
              </Text>
            </TouchableOpacity>
          );
        })}
        </ScrollView>
        {/* 스크롤 가능 표시 */}
        <View style={styles.scrollIndicator} pointerEvents="none">
          <Text style={styles.scrollIndicatorText}>›</Text>
        </View>
      </View>

      {/* Expression grid */}
      <ScrollView 
        style={styles.expressionContainer}
        contentContainerStyle={styles.expressionGrid}
        showsVerticalScrollIndicator={false}
      >
        {activeExpressions.map((expression) => {
          const isSelected = isExpressionSelected(activeCategory, expression.id);
          const categorySelections = safeSelectedExpressions.filter(
            item => item.categoryId === activeCategory
          );
          const isDisabled = categorySelections.length >= MAX_PER_CATEGORY && !isSelected;
          
          return (
            <TouchableOpacity
              key={expression.id}
              style={[
                styles.expressionButton,
                isSelected && styles.expressionButtonSelected,
                isDisabled && styles.expressionButtonDisabled
              ]}
              onPress={() => handleExpressionSelect(activeCategory, expression)}
              activeOpacity={isDisabled ? 1 : 0.7}
              disabled={isDisabled}
            >
              <Text style={[
                styles.expressionText,
                isSelected && styles.expressionTextSelected,
                isDisabled && styles.expressionTextDisabled
              ]}>
                {expression.korean}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Limit indicator */}
      <View style={styles.footer}>
        <Text style={styles.limitText}>
          카테고리당 최대 3개까지 선택 가능
        </Text>
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  selectedCount: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  categoryTabsWrapper: {
    position: 'relative',
  },
  categoryTabs: {
    maxHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
    paddingRight: 40, // 스크롤 인디케이터 공간
  },
  scrollIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollIndicatorText: {
    fontSize: 24,
    color: '#8E8E93',
    fontWeight: '300',
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  categoryTabActive: {
    borderBottomWidth: 2,
  },
  categoryTabSelected: {
    borderRadius: 8,
  },
  categoryTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
  },
  categoryTabTextActive: {
    fontWeight: '700',
  },
  categoryTabTextSelected: {
    fontWeight: '800',
  },
  categoryTabWithSelection: {
    backgroundColor: '#F0F7FF',
  },
  expressionContainer: {
    flex: 1,
    padding: 12,
  },
  expressionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  expressionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 16,
    margin: 4,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  expressionText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  expressionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  expressionButtonDisabled: {
    opacity: 0.3,
  },
  expressionTextDisabled: {
    color: '#8E8E93',
  },
  footer: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  limitText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  // New selected state styles
  expressionButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
});

export default CompactSensoryEvaluation;