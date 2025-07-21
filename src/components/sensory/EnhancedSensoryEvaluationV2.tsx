import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  Vibration,
  AccessibilityInfo,
} from 'react-native';
import {
  koreanSensoryData,
  getSensoryExpressionsByCategory,
  SensoryExpression,
} from '../../data/koreanSensoryData';

const { width } = Dimensions.get('window');
const HAPTIC_ENABLED = Platform.OS === 'ios';

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

// Animation config for smoother transitions
const animationConfig = {
  ...LayoutAnimation.Presets.easeInEaseOut,
  duration: 250,
};

const EnhancedSensoryEvaluationV2: React.FC<EnhancedSensoryEvaluationProps> = ({
  selectedExpressions,
  onExpressionChange,
  beginnerMode = true,
  showDescriptions = true,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['acidity']) // Start with only acidity expanded
  );
  
  // Animated values for each category
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({});
  
  // Initialize animated values
  Object.keys(koreanSensoryData).forEach(key => {
    if (!animatedValues.current[key]) {
      animatedValues.current[key] = new Animated.Value(0);
    }
  });

  const toggleCategory = useCallback((categoryId: string) => {
    LayoutAnimation.configureNext(animationConfig);
    
    const newExpanded = new Set(expandedCategories);
    const isExpanding = !newExpanded.has(categoryId);
    
    if (isExpanding) {
      newExpanded.add(categoryId);
      // Animate expansion
      Animated.spring(animatedValues.current[categoryId], {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      newExpanded.delete(categoryId);
      // Animate collapse
      Animated.timing(animatedValues.current[categoryId], {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    
    setExpandedCategories(newExpanded);
    
    // Haptic feedback
    if (HAPTIC_ENABLED) {
      Vibration.vibrate(10);
    }
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

    let newExpressions = [...selectedExpressions];

    if (existingIndex >= 0) {
      // Deselect
      newExpressions.splice(existingIndex, 1);
      if (HAPTIC_ENABLED) {
        Vibration.vibrate(15);
      }
    } else {
      // Check limit
      if (categorySelections.length >= MAX_PER_CATEGORY) {
        // Provide feedback that limit is reached
        if (HAPTIC_ENABLED) {
          Vibration.vibrate([0, 10, 50, 10]);
        }
        return;
      }
      // Select
      newExpressions.push({ categoryId, expression });
      if (HAPTIC_ENABLED) {
        Vibration.vibrate(20);
      }
    }

    onExpressionChange(newExpressions);
    
    // Announce to screen readers
    const action = existingIndex >= 0 ? '선택 해제됨' : '선택됨';
    AccessibilityInfo.announceForAccessibility(`${expression.korean} ${action}`);
  }, [selectedExpressions, onExpressionChange]);

  const isExpressionSelected = useCallback((
    categoryId: string,
    expressionId: string
  ): boolean => {
    return selectedExpressions.some(
      item => item.categoryId === categoryId && item.expression.id === expressionId
    );
  }, [selectedExpressions]);

  const getCategoryProgress = useCallback((categoryId: string): number => {
    const count = selectedExpressions.filter(item => item.categoryId === categoryId).length;
    return count / MAX_PER_CATEGORY;
  }, [selectedExpressions]);

  const renderExpressionButton = useCallback((
    categoryId: string,
    expression: SensoryExpression,
    isDisabled: boolean
  ) => {
    const isSelected = isExpressionSelected(categoryId, expression.id);
    const category = koreanSensoryData[categoryId];
    
    return (
      <TouchableOpacity
        key={expression.id}
        style={[
          styles.expressionButton,
          isSelected && { 
            backgroundColor: category?.color || '#007AFF',
            borderColor: category?.color || '#007AFF',
            transform: [{ scale: 1.02 }],
          },
          isDisabled && styles.expressionButtonDisabled
        ]}
        onPress={() => !isDisabled && handleExpressionSelect(categoryId, expression)}
        activeOpacity={isDisabled ? 1 : 0.7}
        disabled={isDisabled}
        accessible={true}
        accessibilityLabel={`${expression.korean} ${expression.english}`}
        accessibilityRole="button"
        accessibilityState={{ 
          selected: isSelected,
          disabled: isDisabled 
        }}
        accessibilityHint={isDisabled ? '선택 한도에 도달했습니다' : '탭하여 선택하거나 선택 해제'}
      >
        <Text style={[
          styles.expressionButtonText,
          isSelected && styles.expressionButtonTextSelected,
          isDisabled && styles.expressionButtonTextDisabled
        ]}>
          {expression.korean}
        </Text>
      </TouchableOpacity>
    );
  }, [isExpressionSelected, handleExpressionSelect]);

  const renderCategory = (category: typeof koreanSensoryData[keyof typeof koreanSensoryData]) => {
    const isExpanded = expandedCategories.has(category.id);
    const expressions = getSensoryExpressionsByCategory(category.id, beginnerMode);
    const selectedCount = selectedExpressions?.filter(item => item?.categoryId === category.id).length || 0;
    const progress = getCategoryProgress(category.id);
    
    // Animated rotation for expand icon
    const rotateAnim = animatedValues.current[category.id].interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '90deg'],
    });

    return (
      <View key={category.id} style={styles.categoryContainer}>
        <TouchableOpacity
          style={[
            styles.categoryHeader,
            isExpanded && styles.categoryHeaderExpanded
          ]}
          onPress={() => toggleCategory(category.id)}
          activeOpacity={0.8}
          accessible={true}
          accessibilityLabel={`${category.nameKo} ${category.nameEn} 카테고리`}
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded }}
          accessibilityHint={`${selectedCount}개 선택됨. 탭하여 ${isExpanded ? '접기' : '펼치기'}`}
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
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: category.color + '20' }]}>
                <Animated.View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: category.color,
                      width: `${progress * 100}%`
                    }
                  ]} 
                />
              </View>
              <Text style={[
                styles.selectionCount,
                selectedCount > 0 && { color: category.color }
              ]}>
                {selectedCount}/3
              </Text>
            </View>
            <Animated.Text style={[
              styles.expandIcon,
              { transform: [{ rotate: rotateAnim }] }
            ]}>
              ▶
            </Animated.Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <Animated.View 
            style={[
              styles.expressionsContainer,
              {
                opacity: animatedValues.current[category.id],
                transform: [{
                  translateY: animatedValues.current[category.id].interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  })
                }]
              }
            ]}
          >
            {showDescriptions && (
              <Text style={styles.categoryDescription}>
                {category.description}
              </Text>
            )}
            
            <View style={styles.expressionsGrid}>
              {expressions.map((expression) => {
                const categorySelections = selectedExpressions.filter(
                  item => item.categoryId === category.id
                );
                const isDisabled = categorySelections.length >= MAX_PER_CATEGORY && 
                  !isExpressionSelected(category.id, expression.id);
                
                return renderExpressionButton(category.id, expression, isDisabled);
              })}
            </View>
            
            {expressions.length === 0 && (
              <Text style={styles.noExpressionsText}>
                표현이 준비 중입니다
              </Text>
            )}
          </Animated.View>
        )}
      </View>
    );
  };

  // Memoized category groups for summary
  const selectedByCategory = useMemo(() => {
    const groups: { [key: string]: SelectedExpression[] } = {};
    selectedExpressions.forEach(item => {
      if (!groups[item.categoryId]) {
        groups[item.categoryId] = [];
      }
      groups[item.categoryId].push(item);
    });
    return groups;
  }, [selectedExpressions]);

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <Text style={styles.title}>감각 평가</Text>
        <Text style={styles.subtitle}>
          커피에서 느껴지는 특징을 선택해주세요
        </Text>
      </View>

      {/* Compact Summary */}
      {selectedExpressions.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>
            선택한 표현 ({selectedExpressions.length})
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.summaryScroll}
          >
            <View style={styles.summaryItems}>
              {Object.entries(selectedByCategory).map(([categoryId, items]) => {
                const category = koreanSensoryData[categoryId];
                return (
                  <View key={categoryId} style={styles.summaryCategoryGroup}>
                    <Text style={[styles.summaryCategoryName, { color: category.color }]}>
                      {category.nameKo}
                    </Text>
                    <View style={styles.summaryExpressions}>
                      {items.map((item, index) => (
                        <TouchableOpacity
                          key={`${item.categoryId}-${item.expression.id}-${index}`}
                          style={[
                            styles.summaryItem,
                            { 
                              borderColor: category.color,
                              backgroundColor: category.color + '15'
                            }
                          ]}
                          onPress={() => handleExpressionSelect(item.categoryId, item.expression)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.summaryItemText, { color: category.color }]}>
                            {item?.expression?.korean}
                          </Text>
                        </TouchableOpacity>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },

  // Summary section
  summaryContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 12,
  },
  summaryScroll: {
    marginHorizontal: -4,
  },
  summaryItems: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  summaryCategoryGroup: {
    marginRight: 20,
  },
  summaryCategoryName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryExpressions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  summaryItemText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Categories
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  categoryContainer: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FAFBFC',
  },
  categoryHeaderExpanded: {
    backgroundColor: '#F5F7FA',
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
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  categoryNameEn: {
    fontSize: 13,
    color: '#8E8E93',
  },
  categoryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  progressBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  selectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  expandIcon: {
    fontSize: 14,
    color: '#8E8E93',
  },
  categoryDescription: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },

  // Expressions
  expressionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  expressionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  expressionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    margin: 4,
    minHeight: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expressionButtonText: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  expressionButtonTextSelected: {
    color: '#FFFFFF',
  },
  expressionButtonDisabled: {
    opacity: 0.4,
  },
  expressionButtonTextDisabled: {
    color: '#8E8E93',
  },
  noExpressionsText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 14,
    padding: 20,
    fontStyle: 'italic',
  },
});

export default EnhancedSensoryEvaluationV2;