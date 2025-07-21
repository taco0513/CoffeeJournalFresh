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
  intensity: number; // 1-5 scale for UI
}

interface EnhancedSensoryEvaluationProps {
  selectedExpressions: SelectedExpression[];
  onExpressionChange: (expressions: SelectedExpression[]) => void;
  beginnerMode?: boolean;
  showDescriptions?: boolean;
}

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
    expression: SensoryExpression,
    intensity: number
  ) => {
    const existingIndex = selectedExpressions.findIndex(
      item => item.categoryId === categoryId && item.expression.id === expression.id
    );

    let newExpressions = [...selectedExpressions];

    if (existingIndex >= 0) {
      if (newExpressions[existingIndex].intensity === intensity) {
        // Same intensity clicked - remove the expression
        newExpressions.splice(existingIndex, 1);
      } else {
        // Different intensity - update it
        newExpressions[existingIndex] = { categoryId, expression, intensity };
      }
    } else {
      // New expression - add it
      newExpressions.push({ categoryId, expression, intensity });
    }

    onExpressionChange(newExpressions);
  }, [selectedExpressions, onExpressionChange]);

  const isExpressionSelected = useCallback((
    categoryId: string,
    expressionId: string,
    intensity: number
  ): boolean => {
    const selected = selectedExpressions.find(
      item => item.categoryId === categoryId && item.expression.id === expressionId
    );
    return selected ? selected.intensity === intensity : false;
  }, [selectedExpressions]);

  const getSelectedIntensity = useCallback((
    categoryId: string,
    expressionId: string
  ): number | null => {
    const selected = selectedExpressions.find(
      item => item.categoryId === categoryId && item.expression.id === expressionId
    );
    return selected ? selected.intensity : null;
  }, [selectedExpressions]);

  const renderStarRating = (
    categoryId: string,
    expression: SensoryExpression,
    maxStars: number = 5
  ) => {
    const selectedIntensity = getSelectedIntensity(categoryId, expression.id);
    
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            style={[
              styles.starButton,
              star <= (selectedIntensity || 0) && styles.starButtonSelected,
            ]}
            onPress={() => handleExpressionSelect(categoryId, expression, star)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.starText,
              star <= (selectedIntensity || 0) && styles.starTextSelected,
            ]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderExpressionCard = (
    categoryId: string,
    expression: SensoryExpression
  ) => {
    const isSelected = getSelectedIntensity(categoryId, expression.id) !== null;
    const category = koreanSensoryData[categoryId];

    return (
      <View
        key={expression.id}
        style={[
          styles.expressionCard,
          isSelected && { borderColor: category.color, backgroundColor: `${category.color}10` }
        ]}
      >
        <View style={styles.expressionHeader}>
          <View style={styles.expressionLabels}>
            <Text style={styles.expressionEmoji}>{expression.emoji}</Text>
            <View style={styles.expressionTexts}>
              <Text style={[styles.expressionKorean, isSelected && { color: category.color }]}>
                {expression.korean}
              </Text>
              <Text style={styles.expressionEnglish}>
                {expression.english}
              </Text>
            </View>
          </View>
          
          {beginnerMode && expression.beginner && (
            <View style={styles.beginnerBadge}>
              <Text style={styles.beginnerBadgeText}>초보자 추천</Text>
            </View>
          )}
        </View>

        {showDescriptions && expression.description && (
          <Text style={styles.expressionDescription}>
            {expression.description}
          </Text>
        )}

        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>강도</Text>
          {renderStarRating(categoryId, expression)}
        </View>
      </View>
    );
  };

  const renderCategory = (category: typeof koreanSensoryData[keyof typeof koreanSensoryData]) => {
    const isExpanded = expandedCategories.has(category.id);
    const expressions = getSensoryExpressionsByCategory(category.id, beginnerMode);
    const selectedCount = selectedExpressions.filter(item => item.categoryId === category.id).length;

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
            {selectedCount > 0 && (
              <View style={[styles.selectionBadge, { backgroundColor: category.color }]}>
                <Text style={styles.selectionBadgeText}>{selectedCount}</Text>
              </View>
            )}
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
            {expressions.map((expression) =>
              renderExpressionCard(category.id, expression)
            )}
            {expressions.length === 0 && (
              <Text style={styles.noExpressionsText}>
                {beginnerMode ? '초보자용 표현이 준비 중입니다' : '표현이 없습니다'}
              </Text>
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
          {beginnerMode ? '초보자 친화적' : '전문가'} 모드
        </Text>
      </View>

      {/* Selected Summary */}
      {selectedExpressions.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>선택된 표현 ({selectedExpressions.length}개)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.summaryItems}>
              {selectedExpressions.map((item, index) => {
                const category = koreanSensoryData[item.categoryId];
                return (
                  <View
                    key={`${item.categoryId}-${item.expression.id}-${index}`}
                    style={[
                      styles.summaryItem,
                      { borderColor: category.color, backgroundColor: `${category.color}15` }
                    ]}
                  >
                    <Text style={styles.summaryItemEmoji}>{item.expression.emoji}</Text>
                    <Text style={styles.summaryItemText}>{item.expression.korean}</Text>
                    <View style={styles.summaryStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Text
                          key={star}
                          style={[
                            styles.summaryStarText,
                            { color: star <= item.intensity ? category.color : '#E0E0E0' }
                          ]}
                        >
                          ★
                        </Text>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Category Sections */}
      <View style={styles.categoriesContainer}>
        {Object.values(koreanSensoryData).map(renderCategory)}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {beginnerMode
            ? '🌟 초보자에게 권장되는 표현들이 우선 표시됩니다'
            : '🔍 모든 전문 표현들이 표시됩니다'
          }
        </Text>
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
  },

  // Summary section
  summaryContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
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
  summaryStars: {
    flexDirection: 'row',
  },
  summaryStarText: {
    fontSize: 10,
    marginHorizontal: 1,
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
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  expressionEmoji: {
    fontSize: 20,
    marginRight: 8,
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

  // Star Rating
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  starContainer: {
    flexDirection: 'row',
  },
  starButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  starButtonSelected: {
    backgroundColor: 'transparent',
  },
  starText: {
    fontSize: 18,
    color: '#E0E0E0',
  },
  starTextSelected: {
    color: '#FFC107',
  },

  // Footer
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 20,
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