import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  koreanSensoryData,
  getSensoryExpressionsByCategory,
  SensoryExpression,
} from '../data/koreanSensoryData';

interface SensoryScore {
  body: number;
  acidity: number;
  sweetness: number;
  finish: number;
  bitterness?: number;
  balance?: number;
}

interface SelectedExpression {
  categoryId: string;
  expression: SensoryExpression;
  selected: boolean;
}

interface EnhancedSensoryEvaluationProps {
  scores: SensoryScore;
  onScoreChange: (attribute: keyof SensoryScore, value: number) => void;
  selectedExpressions?: SelectedExpression[];
  onExpressionChange?: (expressions: SelectedExpression[]) => void;
  beginnerMode?: boolean;
  mouthfeel?: string;
  onMouthfeelChange?: (value: string) => void;
}

const EnhancedSensoryEvaluation: React.FC<EnhancedSensoryEvaluationProps> = ({
  scores,
  onScoreChange,
  selectedExpressions = [],
  onExpressionChange,
  beginnerMode = true,
  mouthfeel = 'Clean',
  onMouthfeelChange,
}) => {
  const [expandedExpressions, setExpandedExpressions] = useState<Set<string>>(
    new Set(['acidity', 'sweetness']) // Start with familiar categories expanded
  );
  const [activeTab, setActiveTab] = useState<'sliders' | 'expressions'>('sliders');

  // Map current scores to available categories
  const sensoryAttributes = [
    {
      key: 'acidity' as keyof SensoryScore,
      dataKey: 'acidity',
      ...koreanSensoryData.acidity,
  },
    {
      key: 'sweetness' as keyof SensoryScore,
      dataKey: 'sweetness',
      ...koreanSensoryData.sweetness,
  },
    {
      key: 'body' as keyof SensoryScore,
      dataKey: 'body',
      ...koreanSensoryData.body,
  },
    {
      key: 'finish' as keyof SensoryScore,
      dataKey: 'aftertaste',
      ...koreanSensoryData.aftertaste,
  },
  ];

  const getScoreColor = (score: number): string => {
    if (score <= 2) return '#FF6B6B';
    if (score <= 3) return '#FFA07A';
    if (score <= 4) return '#FFD93D';
    return '#4ECDC4';
};

  const getScoreLabel = (score: number): string => {
    const labels = ['', 'Very Low', 'Low', 'Medium', 'High', 'Very High'];
    return labels[Math.round(score)] || 'Medium';
};

  const getScoreLabelKo = (score: number): string => {
    const labelsKo = ['', '매우 약함', '약함', '보통', '강함', '매우 강함'];
    return labelsKo[Math.round(score)] || '보통';
};

  const toggleExpressionCategory = useCallback((categoryId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newExpanded = new Set(expandedExpressions);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
  } else {
      newExpanded.add(categoryId);
  }
    setExpandedExpressions(newExpanded);
}, [expandedExpressions]);

  const handleExpressionToggle = useCallback((categoryId: string, expression: SensoryExpression) => {
    if (!onExpressionChange) return;

    const existingIndex = selectedExpressions.findIndex(
      item => item.categoryId === categoryId && item.expression.id === expression.id
    );

    let newExpressions = [...selectedExpressions];

    if (existingIndex >= 0) {
      // Toggle off
      newExpressions[existingIndex] = {
        ...newExpressions[existingIndex],
        selected: !newExpressions[existingIndex].selected,
    };
  } else {
      // Add new
      newExpressions.push({
        categoryId,
        expression,
        selected: true,
    });
  }

    onExpressionChange(newExpressions);
}, [selectedExpressions, onExpressionChange]);

  const isExpressionSelected = useCallback((categoryId: string, expressionId: string): boolean => {
    const item = selectedExpressions.find(
      expr => expr.categoryId === categoryId && expr.expression.id === expressionId
    );
    return item ? item.selected : false;
}, [selectedExpressions]);

  const renderSliderAttribute = (attr: typeof sensoryAttributes[0], index: number) => (
    <View 
      key={attr.key} 
      style={[
        styles.attributeContainer, 
        index === sensoryAttributes.length - 1 && styles.attributeContainerLast
      ]}
    >
      <View style={styles.labelContainer}>
        <View style={styles.attributeLabels}>
          <Text style={styles.attributeEmoji}>{attr.emoji}</Text>
          <View style={styles.attributeTexts}>
            <Text style={[styles.attributeLabel, { color: attr.color }]}>
              {attr.nameKo}
            </Text>
            <Text style={styles.attributeLabelEn}>{attr.nameEn}</Text>
          </View>
        </View>
        <Text style={[styles.scoreValue, { color: attr.color }]}>
          {(scores[attr.key] ?? 0).toFixed(1)}
        </Text>
      </View>

      <Text style={styles.description}>{attr.description}</Text>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>{attr.scaleLabels.low.ko}</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={5}
          value={scores[attr.key] ?? 0}
          onValueChange={(value: number) => onScoreChange(attr.key, value)}
          minimumTrackTintColor={attr.color}
          maximumTrackTintColor="#E0E0E0"
          thumbTintColor={attr.color}
          step={0.5}
        />
        <Text style={styles.sliderLabel}>{attr.scaleLabels.high.ko}</Text>
      </View>

      <View style={styles.scoreIndicator}>
        <Text style={[styles.scoreLabel, { color: attr.color }]}>
          {getScoreLabelKo(scores[attr.key] ?? 0)} ({getScoreLabel(scores[attr.key] ?? 0)})
        </Text>
      </View>
    </View>
  );

  const renderExpressionCategory = (attr: typeof sensoryAttributes[0]) => {
    const isExpanded = expandedExpressions.has(attr.dataKey);
    const expressions = getSensoryExpressionsByCategory(attr.dataKey, beginnerMode);
    const selectedCount = selectedExpressions.filter(
      item => item.categoryId === attr.dataKey && item.selected
    ).length;

    return (
      <View key={attr.dataKey} style={styles.expressionCategoryContainer}>
        <TouchableOpacity
          style={[
            styles.expressionCategoryHeader,
            { backgroundColor: `${attr.color}15` },
            isExpanded && { backgroundColor: `${attr.color}25` }
          ]}
          onPress={() => toggleExpressionCategory(attr.dataKey)}
          activeOpacity={0.8}
        >
          <View style={styles.categoryHeaderLeft}>
            <Text style={styles.categoryEmoji}>{attr.emoji}</Text>
            <Text style={[styles.categoryNameKo, { color: attr.color }]}>
              {attr.nameKo}
            </Text>
            <Text style={[styles.scoreValue, { color: attr.color }]}>
              {(scores[attr.key] ?? 0).toFixed(1)}
            </Text>
          </View>
          
          <View style={styles.categoryHeaderRight}>
            {selectedCount > 0 && (
              <View style={[styles.selectionBadge, { backgroundColor: attr.color }]}>
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

        {isExpanded && (
          <View style={styles.expressionsGrid}>
            {expressions.map((expression) => {
              const isSelected = isExpressionSelected(attr.dataKey, expression.id);
              return (
                <TouchableOpacity
                  key={expression.id}
                  style={[
                    styles.expressionChip,
                    isSelected && {
                      backgroundColor: `${attr.color}20`,
                      borderColor: attr.color,
                  }
                  ]}
                  onPress={() => handleExpressionToggle(attr.dataKey, expression)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.expressionChipEmoji}>{expression.emoji}</Text>
                  <Text style={[
                    styles.expressionChipText,
                    isSelected && { color: attr.color, fontWeight: '600' }
                  ]}>
                    {expression.korean}
                  </Text>
                  {beginnerMode && expression.beginner && (
                    <Text style={styles.beginnerStar}>⭐</Text>
                  )}
                </TouchableOpacity>
              );
          })}
          </View>
        )}
      </View>
    );
};

  const getSelectedExpressionsCount = () => {
    return selectedExpressions.filter(expr => expr.selected).length;
};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>감각 평가</Text>
        <Text style={styles.subtitle}>
          {beginnerMode ? '초보자 모드' : '전문가 모드'}
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'sliders' && styles.activeTab
          ]}
          onPress={() => setActiveTab('sliders')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'sliders' && styles.activeTabText
          ]}>
            점수 평가
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'expressions' && styles.activeTab
          ]}
          onPress={() => setActiveTab('expressions')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'expressions' && styles.activeTabText
          ]}>
            표현 선택 {getSelectedExpressionsCount() > 0 && `(${getSelectedExpressionsCount()})`}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'sliders' ? (
          <View style={styles.slidersContainer}>
            {sensoryAttributes.map((attr, index) => renderSliderAttribute(attr, index))}
            
            {/* Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>전체 프로필</Text>
              <View style={styles.summaryScores}>
                {sensoryAttributes.map((attr) => (
                  <View key={attr.key} style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>{attr.nameKo}</Text>
                    <View style={[styles.summaryBar, { backgroundColor: attr.color }]}>
                      <Text style={styles.summaryValue}>{(scores[attr.key] ?? 0).toFixed(1)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.expressionsContainer}>
            <Text style={styles.expressionsTitle}>
              맛의 특성을 표현하는 단어들을 선택해보세요
            </Text>
            <Text style={styles.expressionsSubtitle}>
              {beginnerMode && '⭐ 표시는 초보자에게 추천하는 표현입니다'}
            </Text>
            
            {sensoryAttributes.map(renderExpressionCategory)}
            
            {/* Selected expressions summary */}
            {getSelectedExpressionsCount() > 0 && (
              <View style={styles.selectedExpressionsContainer}>
                <Text style={styles.selectedExpressionsTitle}>
                  선택된 표현들 ({getSelectedExpressionsCount()}개)
                </Text>
                <View style={styles.selectedExpressionsList}>
                  {selectedExpressions
                    .filter(item => item.selected)
                    .map((item, index) => {
                      const category = koreanSensoryData[item.categoryId];
                      return (
                        <View
                          key={`${item.categoryId}-${item.expression.id}-${index}`}
                          style={[
                            styles.selectedExpressionItem,
                            { borderColor: category.color, backgroundColor: `${category.color}10` }
                          ]}
                        >
                          <Text style={styles.selectedExpressionEmoji}>{item.expression.emoji}</Text>
                          <Text style={styles.selectedExpressionText}>{item.expression.korean}</Text>
                        </View>
                      );
                  })
                }
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
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

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 4,
},
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
},
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
},
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C757D',
},
  activeTabText: {
    color: '#495057',
    fontWeight: '600',
},

  content: {
    flex: 1,
},

  // Sliders section
  slidersContainer: {
    padding: 20,
},
  attributeContainer: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
},
  attributeContainerLast: {
    borderBottomWidth: 0,
},
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
},
  attributeLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
},
  attributeEmoji: {
    fontSize: 20,
    marginRight: 8,
},
  attributeTexts: {
    flex: 1,
},
  attributeLabel: {
    fontSize: 18,
    fontWeight: '600',
},
  attributeLabelEn: {
    fontSize: 13,
    color: '#7F8C8D',
    marginTop: 2,
},
  scoreValue: {
    fontSize: 20,
    fontWeight: '700',
},
  description: {
    fontSize: 14,
    color: '#95A5A6',
    marginBottom: 15,
    lineHeight: 20,
},
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
},
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
},
  sliderLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    width: 50,
    textAlign: 'center',
},
  scoreIndicator: {
    alignItems: 'center',
},
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
},

  // Summary
  summaryContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
},
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
},
  summaryScores: {
    flexDirection: 'row',
    justifyContent: 'space-around',
},
  summaryItem: {
    alignItems: 'center',
},
  summaryLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 5,
},
  summaryBar: {
    width: 60,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
},
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
},

  // Expressions section
  expressionsContainer: {
    padding: 16,
},
  expressionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
    marginBottom: 8,
},
  expressionsSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 20,
},
  expressionCategoryContainer: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
},
  expressionCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
},
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
},
  categoryEmoji: {
    fontSize: 20,
    marginRight: 8,
},
  categoryNameKo: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
},
  categoryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
},
  selectionBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
},
  selectionBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
},
  expandIcon: {
    fontSize: 12,
    color: '#6C757D',
},
  expressionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingTop: 8,
},
  expressionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#F8F9FA',
},
  expressionChipEmoji: {
    fontSize: 12,
    marginRight: 4,
},
  expressionChipText: {
    fontSize: 12,
    color: '#495057',
},
  beginnerStar: {
    fontSize: 10,
    marginLeft: 2,
},

  // Selected expressions
  selectedExpressionsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
},
  selectedExpressionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
},
  selectedExpressionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
},
  selectedExpressionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
    borderRadius: 8,
    borderWidth: 1,
},
  selectedExpressionEmoji: {
    fontSize: 12,
    marginRight: 4,
},
  selectedExpressionText: {
    fontSize: 12,
    fontWeight: '500',
},
});

export default EnhancedSensoryEvaluation;