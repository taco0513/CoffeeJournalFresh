import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  LayoutAnimation,
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

interface EnhancedSensoryEvaluationProps {
  selectedExpressions: SelectedExpression[];
  onExpressionChange: (expressions: SelectedExpression[]) => void;
  beginnerMode?: boolean;
  showDescriptions?: boolean;
  maxPerCategory?: number;
}

const MAX_PER_CATEGORY = 3;

const EnhancedSensoryEvaluation: React.FC<EnhancedSensoryEvaluationProps> = ({
  selectedExpressions,
  onExpressionChange,
  beginnerMode = true,
  showDescriptions = true,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['acidity', 'sweetness']) // Start with most familiar categories expanded
  );

  const toggleCategory = useCallback((categoryId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  }, [expandedCategories]);

  const handleExpressionSelect = useCallback((
    categoryId: string,
    expression: SensoryExpression
  ) => {
    const existingIndex = selectedExpressions.findIndex(
      item => item.categoryId === categoryId && item.expression.id === expression.id
    );
    const categorySelections = selectedExpressions.filter(
      item => item.categoryId === categoryId
    );
    const maxSelectionsPerCategory = 3;

    let newExpressions = [...selectedExpressions];

    if (existingIndex >= 0) {
      // Already selected - remove it
      newExpressions.splice(existingIndex, 1);
    } else {
      // Check if category limit reached
      if (categorySelections.length >= maxSelectionsPerCategory) {
        // Optionally show a message or haptic feedback
        return;
      }
      // New expression - add it
      newExpressions.push({ categoryId, expression });
    }

    onExpressionChange(newExpressions);
  }, [selectedExpressions, onExpressionChange]);

  const isExpressionSelected = useCallback((
    categoryId: string,
    expressionId: string
  ): boolean => {
    return selectedExpressions.some(
      item => item.categoryId === categoryId && item.expression.id === expressionId
    );
  }, [selectedExpressions]);

  const renderExpressionButton = (
    categoryId: string,
    expression: SensoryExpression
  ) => {
    const isSelected = isExpressionSelected(categoryId, expression.id);
    const category = koreanSensoryData[categoryId];
    
    return (
      <TouchableOpacity
        style={[
          styles.expressionButton,
          isSelected && { 
            backgroundColor: category?.color || '#007AFF',
            borderColor: category?.color || '#007AFF'
          }
        ]}
        onPress={() => handleExpressionSelect(categoryId, expression)}
        activeOpacity={0.7}
      >
        <Text style={styles.expressionEmoji}>{expression.emoji}</Text>
        <Text style={[
          styles.expressionButtonText,
          isSelected && styles.expressionButtonTextSelected
        ]}>
          {expression.korean}
        </Text>
        {isSelected && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  // Remove the old renderExpressionCard function - we'll use renderExpressionButton directly

  const renderCategory = (category: typeof koreanSensoryData[keyof typeof koreanSensoryData]) => {
    const isExpanded = expandedCategories.has(category.id);
    const expressions = getSensoryExpressionsByCategory(category.id, beginnerMode);
    const selectedCount = selectedExpressions?.filter(item => item?.categoryId === category.id).length || 0;
    const maxSelectionsPerCategory = 3;

    return (
      <View key={category.id} style={styles.categoryContainer}>
        <TouchableOpacity
          style={[
            styles.categoryHeader,
            { backgroundColor: `${category.color}15` },
            isExpanded && { backgroundColor: `${category.color}25` }
          ]}
          onPress={() => toggleCategory(category.id)}
          activeOpacity={0.8}
        >
          <View style={styles.categoryHeaderLeft}>
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <View style={styles.categoryTitles}>
              <Text style={[styles.categoryNameKo, { color: category.color }]}>
                {category.nameKo}
              </Text>
              <Text style={styles.categoryNameEn}>
                {category.nameEn}
              </Text>
            </View>
          </View>

          <View style={styles.categoryHeaderRight}>
            <View style={[styles.selectionBadge, { 
              backgroundColor: selectedCount > 0 ? category?.color || '#007AFF' : '#E0E0E0' 
            }]}>
              <Text style={[
                styles.selectionBadgeText,
                selectedCount === 0 && { color: '#666666' }
              ]}>
                {selectedCount}/{maxSelectionsPerCategory}
              </Text>
            </View>
            <Text style={[
              styles.expandIcon,
              { transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }
            ]}>
              ▶
            </Text>
          </View>
        </TouchableOpacity>

        {showDescriptions && (
          <Text style={styles.categoryDescription}>
            {category.description}
          </Text>
        )}

        {isExpanded && (
          <View style={styles.expressionsContainer}>
            {/* Guide text for multi-selection */}
            <View style={styles.guideTextContainer}>
              <Text style={styles.guideText}>
                최대 3개까지 선택 가능
              </Text>
            </View>
            <View style={styles.expressionsGrid}>
              {expressions.map((expression) => {
                const categorySelections = selectedExpressions.filter(
                  item => item.categoryId === category.id
                );
                const isDisabled = categorySelections.length >= maxSelectionsPerCategory && 
                  !isExpressionSelected(category.id, expression.id);
                
                return (
                  <TouchableOpacity
                    key={expression.id}
                    style={[
                      styles.expressionButton,
                      isExpressionSelected(category.id, expression.id) && { 
                        backgroundColor: category?.color || '#007AFF',
                        borderColor: category?.color || '#007AFF'
                      },
                      isDisabled && styles.expressionButtonDisabled
                    ]}
                    onPress={() => !isDisabled && handleExpressionSelect(category.id, expression)}
                    activeOpacity={isDisabled ? 1 : 0.7}
                    disabled={isDisabled}
                  >
                    <Text style={styles.expressionEmoji}>{expression.emoji}</Text>
                    <Text style={[
                      styles.expressionButtonText,
                      isExpressionSelected(category.id, expression.id) && styles.expressionButtonTextSelected,
                      isDisabled && styles.expressionButtonTextDisabled
                    ]}>
                      {expression.korean}
                    </Text>
                    {isExpressionSelected(category.id, expression.id) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            {expressions.length === 0 && (
              <Text style={styles.noExpressionsText}>
                표현이 준비 중입니다
              </Text>
            )}
            {selectedCount === 0 && expressions.length > 0 && (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>
                  이 카테고리에서 느껴지는 특징을 선택해주세요
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const getSelectedSummary = () => {
    const categoryGroups = selectedExpressions.reduce((acc, item) => {
      if (!acc[item.categoryId]) acc[item.categoryId] = [];
      acc[item.categoryId].push(item);
      return acc;
    }, {} as Record<string, SelectedExpression[]>);

    return Object.entries(categoryGroups);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>감각 평가</Text>
        <Text style={styles.subtitle}>
          커피에서 느껴지는 특징을 선택해주세요
        </Text>
        <View style={styles.headerGuide}>
          <Text style={styles.headerGuideText}>
            💡 각 카테고리별로 최대 3개까지 다중 선택 가능합니다
          </Text>
        </View>
      </View>

      {/* Selected Summary */}
      <View style={[
        styles.summaryContainer,
        selectedExpressions.length === 0 && styles.summaryContainerEmpty
      ]}>
        <Text style={styles.summaryTitle}>
          선택된 표현 ({selectedExpressions.length}개)
        </Text>
        {selectedExpressions.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.summaryItems}>
              {selectedExpressions.map((item, index) => {
                const category = koreanSensoryData[item?.categoryId] || koreanSensoryData.acidity;
                return (
                  <TouchableOpacity
                    key={`${item?.categoryId}-${item?.expression?.id}-${index}`}
                    style={[
                      styles.summaryItem,
                      { borderColor: category.color, backgroundColor: `${category.color}15` }
                    ]}
                    onPress={() => handleExpressionSelect(item.categoryId, item.expression)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.summaryItemEmoji}>{item?.expression?.emoji}</Text>
                    <Text style={styles.summaryItemText}>{item?.expression?.korean}</Text>
                    <Text style={styles.summaryItemRemove}>×</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        ) : (
          <Text style={styles.summaryEmptyText}>
            아직 선택된 표현이 없습니다. 아래 카테고리를 탭하여 시작하세요.
          </Text>
        )}
      </View>

      {/* Category Sections */}
      <View style={styles.categoriesContainer}>
        {Object.values(koreanSensoryData).map(renderCategory)}
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  headerGuide: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  headerGuideText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Summary section
  summaryContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  summaryContainerEmpty: {
    backgroundColor: '#FFF3E0',
  },
  summaryEmptyText: {
    fontSize: 14,
    color: '#F57C00',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
  },
  summaryItems: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  summaryItem: {
    marginRight: 12,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 80,
  },
  summaryItemEmoji: {
    fontSize: 16,
    marginBottom: 4,
  },
  summaryItemText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  summaryItemRemove: {
    position: 'absolute',
    top: -4,
    right: -4,
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    textAlign: 'center',
    lineHeight: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  // Categories
  categoriesContainer: {
    padding: 16,
  },
  categoryContainer: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryTitles: {
    flex: 1,
  },
  categoryNameKo: {
    fontSize: 18,
    fontWeight: '700',
  },
  categoryNameEn: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 2,
  },
  categoryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionBadge: {
    minWidth: 40,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    paddingHorizontal: 8,
  },
  selectionBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 16,
    color: '#6C757D',
  },
  categoryDescription: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },

  // Expressions
  expressionsContainer: {
    padding: 16,
    paddingTop: 8,
  },
  expressionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    padding: 12,
    marginBottom: 12,
  },
  expressionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  expressionLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expressionTexts: {
    flex: 1,
  },
  expressionKorean: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  expressionEnglish: {
    fontSize: 13,
    color: '#6C757D',
    marginTop: 2,
  },
  beginnerBadge: {
    backgroundColor: '#28A745',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  beginnerBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  expressionDescription: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 8,
    lineHeight: 16,
  },

  // Expression Button
  expressionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  expressionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  expressionEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  expressionButtonText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  expressionButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  expressionButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#F5F5F5',
  },
  expressionButtonTextDisabled: {
    color: '#BDBDBD',
  },
  checkmark: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '600',
  },
  guideTextContainer: {
    marginBottom: 12,
  },
  guideText: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyStateContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
  },

  noExpressionsText: {
    textAlign: 'center',
    color: '#6C757D',
    fontSize: 14,
    padding: 20,
    fontStyle: 'italic',
  },
});

export default EnhancedSensoryEvaluation;