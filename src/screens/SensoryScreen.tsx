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
import { HIGConstants, HIGColors } from '../styles/common';
import { 
  SensoryOnboarding
} from '../components/sensory';
import CompactSensoryEvaluation from '../components/sensory/CompactSensoryEvaluation';
import { checkShouldShowOnboarding } from '../components/sensory/SensoryOnboarding';
import { SelectedSensoryExpression } from '../types/sensory';

const SensoryScreen = () => {
  const navigation = useNavigation();
  const { selectedSensoryExpressions, setSelectedSensoryExpressions } = useTastingStore();
  
  // 카페 모드 전용 (홈카페는 별도 스크린 사용)
  // Note: 홈카페 모드는 ExperimentalDataScreen + SensoryEvaluationScreen 사용
  
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if onboarding should be shown
  useEffect(() => {
    checkShouldShowOnboarding().then(shouldShow => {
      setShowOnboarding(shouldShow);
    });
  }, []);


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
      
      {/* 진행 상태 바 */}
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>

      {/* Guide Message */}
      <View style={styles.guideMessageContainer}>
        <Text style={styles.guideMessage}>
          커피에서 느껴지는 감각을 평가해보세요
        </Text>
        <Text style={styles.guideSubMessage}>
          한국식 감각 표현으로 커피의 맛을 기록해보세요
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cafe Mode: Only Korean Sensory Evaluation */}
            <View style={styles.evaluationIntroContainer}>
              <Text style={styles.evaluationIntroTitle}>맛의 언어로 표현해보세요</Text>
              <Text style={styles.evaluationIntroSubtitle}>
                이 커피에서 느껴지는 감각을 선택해주세요
              </Text>
            </View>
            
            {/* Selected Sensory Preview */}
            <View style={styles.selectedPreviewContainer}>
              {(selectedSensoryExpressions || []).length > 0 ? (
                <View style={styles.selectedPreviewContent}>
                  {(() => {
                    // Group by category
                    const groupedExpressions = (selectedSensoryExpressions || []).reduce((acc, expr) => {
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
                <Text style={styles.selectedPreviewPlaceholder}>
                  —
                </Text>
              )}
            </View>
            
            <CompactSensoryEvaluation
              selectedExpressions={(selectedSensoryExpressions || []).map(item => ({
                categoryId: item.categoryId,
                expression: {
                  id: item.expressionId,
                  korean: item.korean,
                  english: item.english,
                  emoji: item.emoji || '',
                  intensity: 2 as 1 | 2 | 3, // Simplified - just use default intensity
                  beginner: true,
                },
              }))}
              onExpressionChange={handleExpressionChange}
              beginnerMode={true}
            />
        
        {/* Note: Home Cafe mode uses separate ExperimentalDataScreen + SensoryEvaluationScreen */}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleComplete}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            평가 완료
          </Text>
        </TouchableOpacity>
      </View>

      {/* Onboarding Modal */}
      <SensoryOnboarding
        visible={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  skipButton: {
    fontSize: 15,
    color: HIGColors.systemBlue,
  },
  progressBar: {
    height: 3,
    backgroundColor: HIGColors.systemGray5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '67%', // 4/6 = 67% (Sensory is 4th step)
    backgroundColor: HIGColors.systemBlue,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingBottom: HIGConstants.SPACING_XL,
  },
  bottomContainer: {
    padding: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: HIGColors.systemGray4,
  },
  nextButton: {
    height: 48,
    backgroundColor: HIGColors.systemBlue,
    borderRadius: HIGConstants.cornerRadiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedPreviewContainer: {
    backgroundColor: '#FAFAFA',
    padding: HIGConstants.SPACING_MD,
    marginTop: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_MD,
    borderRadius: 8,
    minHeight: 60,
    justifyContent: 'center',
  },
  selectedPreviewContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  categoryGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: HIGConstants.SPACING_LG,
    paddingRight: HIGConstants.SPACING_LG,
    borderRightWidth: 1,
    borderRightColor: HIGColors.systemGray4,
    marginBottom: HIGConstants.SPACING_SM,
  },
  categoryGroupLast: {
    borderRightWidth: 0,
    paddingRight: 0,
    marginRight: 0,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    marginRight: HIGConstants.SPACING_SM,
  },
  categoryExpressions: {
    fontSize: 15,
    color: HIGColors.label,
    fontWeight: '500',
  },
  selectedPreviewPlaceholder: {
    fontSize: 15,
    color: HIGColors.tertiaryLabel,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  evaluationIntroContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_MD,
    paddingBottom: HIGConstants.SPACING_LG,
    alignItems: 'center',
  },
  evaluationIntroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
    textAlign: 'center',
  },
  evaluationIntroSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 22,
  },
  guideMessageContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_SM,
    backgroundColor: '#E3F2FD',
  },
  guideMessage: {
    fontSize: 15,
    color: HIGColors.systemBlue,
    textAlign: 'center',
    fontWeight: '500',
  },
  guideSubMessage: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default SensoryScreen;