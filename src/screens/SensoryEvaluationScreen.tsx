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
          😊 감각으로 표현해보세요
        </Text>
        <Text style={styles.guideSubMessage}>
          실험 결과를 한국식 감각 표현으로 기록해보세요
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Korean Sensory Evaluation */}
        <View style={styles.evaluationIntroContainer}>
          <Text style={styles.evaluationIntroTitle}>맛의 언어로 표현해보세요</Text>
          <Text style={styles.evaluationIntroSubtitle}>
            이 커피에서 느껴지는 감각을 선택해주세요
          </Text>
        </View>
        
        {/* Selected Sensory Preview */}
        <View style={styles.selectedPreviewContainer}>
          {selectedSensoryExpressions.length > 0 ? (
            <View style={styles.selectedPreviewContent}>
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
            </View>
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
        
        {/* Enhanced Sensory Evaluation Component */}
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
      </ScrollView>

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
  scrollContent: {
    paddingBottom: 100, // Space for bottom button
  },
  evaluationIntroContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    marginBottom: HIGConstants.SPACING_SM,
  },
  evaluationIntroTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  evaluationIntroSubtitle: {
    fontSize: 15,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 22,
  },
  selectedPreviewContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_SM,
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.BORDER_RADIUS,
    borderWidth: 1,
    borderColor: HIGColors.systemGray5,
    minHeight: 60,
  },
  selectedPreviewContent: {
    flex: 1,
  },
  categoryGroup: {
    marginBottom: HIGConstants.SPACING_SM,
    paddingBottom: HIGConstants.SPACING_SM,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray6,
  },
  categoryGroupLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
  },
  categoryExpressions: {
    fontSize: 15,
    color: HIGColors.label,
    lineHeight: 20,
  },
  emptyPreviewContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPreviewText: {
    fontSize: 14,
    color: HIGColors.tertiaryLabel,
    fontStyle: 'italic',
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