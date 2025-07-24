import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../stores/tastingStore';
import { HIGConstants, HIGColors, commonButtonStyles, commonTextStyles } from '../styles/common';
import { SensoryOnboarding } from '../components/sensory';
import CompactSensoryEvaluation from '../components/sensory/CompactSensoryEvaluation';
import { checkShouldShowOnboarding } from '../components/sensory/SensoryOnboarding';
import { SelectedSensoryExpression } from '../types/sensory';

const SensoryEvaluationScreen = () => {
  const navigation = useNavigation();
  const { selectedSensoryExpressions, setSelectedSensoryExpressions, currentTasting } = useTastingStore();
  
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if onboarding should be shown
  useEffect(() => {
    // 홈카페 모드일 때는 온보딩을 표시하지 않음
    if (currentTasting.mode === 'home_cafe' || currentTasting.mode === 'lab') {
      setShowOnboarding(false);
      return;
    }
    
    checkShouldShowOnboarding().then(shouldShow => {
      setShowOnboarding(shouldShow);
    });
  }, [currentTasting.mode]);

  const handleComplete = useCallback(async () => {
    // Navigate to personal comment screen
    navigation.navigate('PersonalComment' as never);
  }, [navigation]);

  // Convert EnhancedSensoryEvaluation format to TastingStore format
  const handleExpressionChange = useCallback((expressions: Array<{
    categoryId: string;
    expression: {
      id: string;
      korean: string;
      english: string;
      emoji: string;
      intensity?: number;
    };
  }>) => {
    const converted: SelectedSensoryExpression[] = expressions.map(item => ({
      categoryId: item.categoryId,
      expressionId: item.expression.id,
      korean: item.expression.korean,
      english: item.expression.english,
      emoji: item.expression.emoji,
      intensity: 3, // Default intensity since we removed user selection
      selected: true,
    }));
    setSelectedSensoryExpressions(converted);
  }, [setSelectedSensoryExpressions]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navigationTitle}>감각 평가</Text>
        <TouchableOpacity onPress={() => navigation.navigate('PersonalComment' as never)}>
          <Text style={styles.skipButton}>건너뛰기</Text>
        </TouchableOpacity>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '71%' }]} />
      </View>

      {/* Guide Message */}
      <View style={styles.guideMessageContainer}>
        <Text style={styles.guideMessage}>
          맛의 언어로 표현해보세요
        </Text>
        <Text style={styles.guideSubMessage}>
          이 커피에서 느껴지는 감각을 선택해주세요
        </Text>
      </View>

      {/* Top Section: Preview Box - Takes remaining space */}
      <View style={styles.topSection}>
        {/* Selected Sensory Preview - Expanded */}
        <View style={styles.selectedPreviewContainer}>
          {selectedSensoryExpressions.length > 10 && (
            <View style={styles.scrollHint}>
              <Text style={styles.scrollHintText}>스크롤해서 더 보기 ↕️</Text>
            </View>
          )}
          {selectedSensoryExpressions.length > 0 ? (
            <ScrollView 
              style={styles.selectedPreviewScroll}
              contentContainerStyle={styles.selectedPreviewContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {(() => {
                // Group by category
                const groupedExpressions = selectedSensoryExpressions.reduce((acc, expr) => {
                  const category = expr.categoryId;
                  if (!acc[category]) {
                    acc[category] = [];
                  }
                  acc[category].push(expr.korean);
                  return acc;
                }, {} as Record<string, string[]>);
                
                // Format the display with category names
                const categoryNames: Record<string, string> = {
                  acidity: '산미',
                  sweetness: '단맛',
                  bitterness: '쓴맛',
                  body: '바디',
                  aftertaste: '애프터',
                  balance: '밸런스'
                };
                
                const categoryOrder = ['acidity', 'sweetness', 'bitterness', 'body', 'aftertaste', 'balance'];
                const filteredCategories = categoryOrder.filter(cat => groupedExpressions[cat]);
                
                // Show more compact format when many selections
                if (selectedSensoryExpressions.length > 9) {
                  return (
                    <View style={styles.compactPreviewContent}>
                      {filteredCategories.map((cat, index) => (
                        <View key={cat} style={styles.compactCategoryRow}>
                          <Text style={styles.compactCategoryLabel}>
                            {categoryNames[cat]}:
                          </Text>
                          <Text style={styles.compactCategoryExpressions}>
                            {groupedExpressions[cat].join(', ')}
                          </Text>
                        </View>
                      ))}
                      <Text style={styles.previewCount}>
                        총 {selectedSensoryExpressions.length}개 선택
                      </Text>
                    </View>
                  );
                }
                
                // Normal format for fewer selections
                return filteredCategories.map((category, index) => {
                  const categoryName = categoryNames[category];
                  const expressions = groupedExpressions[category].join(', ');
                  const isLast = index === filteredCategories.length - 1;
                  
                  return (
                    <View 
                      key={category} 
                      style={[
                        styles.categoryGroup,
                        isLast && styles.categoryGroupLast
                      ]}
                    >
                      <Text style={styles.categoryLabel}>{categoryName}</Text>
                      <Text style={styles.categoryExpressions}>{expressions}</Text>
                    </View>
                  );
                });
              })()}
            </ScrollView>
          ) : (
            <View style={styles.emptyPreviewContent}>
              <Text style={styles.emptyPreviewText}>선택한 표현이 여기에 나타납니다</Text>
            </View>
          )}
        </View>

        {/* Show onboarding if needed */}
        {showOnboarding && (
          <SensoryOnboarding 
            onComplete={() => setShowOnboarding(false)}
          />
        )}
      </View>

      {/* Bottom Section: Fixed Sensory Evaluation */}
      <View style={styles.bottomSection}>
        <CompactSensoryEvaluation 
          selectedExpressions={(selectedSensoryExpressions || []).map(item => ({
            categoryId: item.categoryId,
            expression: {
              id: item.expressionId,
              korean: item.korean,
              english: item.english,
              emoji: item.emoji || '',
              intensity: item.intensity || 2,
              beginner: true,
            } as any,
          }))}
          onExpressionChange={handleExpressionChange}
          beginnerMode={true}
        />
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[commonButtonStyles.buttonPrimary, styles.continueButton]}
          onPress={handleComplete}
          activeOpacity={0.8}
        >
          <Text style={[commonTextStyles.buttonText, styles.continueButtonText]}>
            다음 단계
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.secondarySystemBackground,
  },
  navigationBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.systemGray4,
  },
  backButton: {
    fontSize: 24,
    color: HIGColors.systemBlue,
    fontWeight: '400',
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  skipButton: {
    fontSize: 17,
    color: HIGColors.systemBlue,
    fontWeight: '400',
  },
  progressBar: {
    height: 3,
    backgroundColor: HIGColors.systemGray5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: HIGColors.systemBlue,
  },
  guideMessageContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    backgroundColor: '#FFFFFF',
  },
  guideMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_XS,
  },
  guideSubMessage: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  topSection: {
    flex: 1, // Takes remaining space
    paddingHorizontal: 0,
    paddingBottom: HIGConstants.SPACING_SM,
  },
  bottomSection: {
    height: 280, // Fixed height for sensory evaluation (reduced from 320)
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: HIGColors.systemGray5,
    paddingTop: HIGConstants.SPACING_SM,
  },
  selectedPreviewContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: HIGConstants.SPACING_LG,
    marginTop: HIGConstants.SPACING_SM,
    marginBottom: 0,
    padding: HIGConstants.SPACING_LG,
    borderRadius: HIGConstants.BORDER_RADIUS,
    flex: 1, // 사용 가능한 모든 공간 활용
    borderWidth: 1,
    borderColor: HIGColors.systemGray5,
    minHeight: 160, // 최소 높이 증가
  },
  selectedPreviewScroll: {
    flex: 1,
  },
  selectedPreviewContent: {
    flexGrow: 1,
    paddingVertical: HIGConstants.SPACING_SM,
  },
  compactPreviewContent: {
    paddingVertical: HIGConstants.SPACING_SM,
  },
  compactCategoryRow: {
    flexDirection: 'row',
    marginBottom: HIGConstants.SPACING_SM,
    alignItems: 'flex-start',
  },
  compactCategoryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    marginRight: HIGConstants.SPACING_SM,
    minWidth: 50,
  },
  compactCategoryExpressions: {
    fontSize: 15,
    color: HIGColors.label,
    lineHeight: 22,
    flex: 1,
  },
  previewCount: {
    fontSize: 12,
    color: HIGColors.systemBlue,
    fontWeight: '600',
    textAlign: 'right',
  },
  scrollHint: {
    position: 'absolute',
    top: 4,
    right: 8,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  scrollHintText: {
    fontSize: 10,
    color: HIGColors.systemBlue,
    fontWeight: '500',
  },
  categoryGroup: {
    marginBottom: HIGConstants.SPACING_MD,
    paddingBottom: HIGConstants.SPACING_MD,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray6,
  },
  categoryGroupLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  categoryExpressions: {
    fontSize: 17,
    color: HIGColors.label,
    lineHeight: 24,
    fontWeight: '500',
  },
  emptyPreviewContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPreviewText: {
    fontSize: 16,
    color: HIGColors.tertiaryLabel,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  bottomContainer: {
    padding: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: HIGColors.systemGray4,
  },
  continueButton: {
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});

export default SensoryEvaluationScreen;