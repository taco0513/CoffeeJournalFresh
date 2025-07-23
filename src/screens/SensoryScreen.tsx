import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
import { 
  SensoryOnboarding,
  MouthfeelButton,
  SliderSection
} from '../components/sensory';
import CompactSensoryEvaluation from '../components/sensory/CompactSensoryEvaluation';
import { checkShouldShowOnboarding } from '../components/sensory/SensoryOnboarding';
import { useSensoryState } from '../hooks/useSensoryState';
import { MouthfeelType, SelectedSensoryExpression } from '../types/sensory';

const SensoryScreen = () => {
  const navigation = useNavigation();
  const { currentTasting, updateField, selectedSensoryExpressions, setSelectedSensoryExpressions } = useTastingStore();
  
  // Use custom hook for sensory state management
  const {
    sensoryData,
    updateNumericValue,
    setMouthfeel,
  } = useSensoryState({
    body: currentTasting.body,
    acidity: currentTasting.acidity,
    sweetness: currentTasting.sweetness,
    finish: currentTasting.finish,
    bitterness: currentTasting.bitterness,
    balance: currentTasting.balance,
    mouthfeel: currentTasting.mouthfeel || 'Clean',
  });
  
  const [showEnhanced, setShowEnhanced] = useState(true); // Default to Korean expressions
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if onboarding should be shown
  useEffect(() => {
    if (showEnhanced) {
      checkShouldShowOnboarding().then(shouldShow => {
        setShowOnboarding(shouldShow);
      });
    }
  }, [showEnhanced]);

  const mouthfeelOptions: MouthfeelType[] = useMemo(() => ['Clean', 'Creamy', 'Juicy', 'Silky'], []);


  const handleComplete = useCallback(async () => {
    // Update all sensory fields in the store
    Object.entries(sensoryData).forEach(([key, value]) => {
      updateField(key, value);
    });
    
    // Navigate to personal comment screen
    navigation.navigate('PersonalComment' as never);
  }, [sensoryData, updateField, navigation]);

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
          기본 평가와 감각 평가 중 선택할 수 있습니다
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Simplified Mode Toggle */}
        <View style={styles.modeToggleWrapper}>
          <View style={styles.modeToggleContainer}>
            <TouchableOpacity 
              style={[styles.modeButton, !showEnhanced && styles.modeButtonActive]}
              onPress={() => setShowEnhanced(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.modeButtonText, !showEnhanced && styles.modeButtonTextActive]}>
                기본 평가
              </Text>
              {!showEnhanced && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modeButton, showEnhanced && styles.modeButtonActive]}
              onPress={() => setShowEnhanced(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.modeButtonText, showEnhanced && styles.modeButtonTextActive]}>
                감각 평가
              </Text>
              {showEnhanced && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          </View>
        </View>

        {showEnhanced ? (
          /* Enhanced Korean Sensory Evaluation */
          <>
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
                <Text style={styles.selectedPreviewPlaceholder}>
                  —
                </Text>
              )}
            </View>
            
            <CompactSensoryEvaluation
              selectedExpressions={selectedSensoryExpressions.map(item => ({
                categoryId: item.categoryId,
                expression: {
                  id: item.expressionId,
                  korean: item.korean,
                  english: item.english,
                  emoji: item.emoji,
                  intensity: Math.min(3, Math.max(1, item.intensity - 2)) as 1 | 2 | 3,
                  beginner: true,
                },
              }))}
              onExpressionChange={handleExpressionChange}
              beginnerMode={true}
            />
          </>
        ) : (
          /* Traditional Slider Evaluation */
          <>
            <View style={styles.basicEvaluationIntro}>
              <Text style={styles.basicEvaluationTitle}>커피의 강도를 평가해보세요</Text>
              <Text style={styles.basicEvaluationSubtitle}>
                각 항목을 1점(약함)에서 5점(강함)으로 평가해주세요
              </Text>
            </View>
            
            <View style={styles.sliderSectionContainer}>
              <SliderSection
                title="바디감"
                value={sensoryData.body}
                onValueChange={updateNumericValue('body')}
                leftLabel="가벼움"
                rightLabel="무거움"
                description="입안에서 느껴지는 질감과 무게감, 묵직함을 말합니다"
              />
            <SliderSection
              title="산미"
              value={sensoryData.acidity}
              onValueChange={updateNumericValue('acidity')}
              leftLabel="약함"
              rightLabel="강함"
              description="과일이나 와인 같은 밝고 상큼한 신맛의 강도입니다"
            />
            <SliderSection
              title="단맛"
              value={sensoryData.sweetness}
              onValueChange={updateNumericValue('sweetness')}
              leftLabel="없음"
              rightLabel="강함"
              description="자연스러운 당도와 캐러멜, 초콜릿 같은 단맛의 정도입니다"
            />
            <SliderSection
              title="쓴맛"
              value={sensoryData.bitterness}
              onValueChange={updateNumericValue('bitterness')}
              leftLabel="약함"
              rightLabel="강함"
              description="다크 초콜릿이나 탄 맛 같은 쓴맛의 강도입니다"
            />
            <SliderSection
              title="여운"
              value={sensoryData.finish}
              onValueChange={updateNumericValue('finish')}
              leftLabel="짧음"
              rightLabel="길음"
              description="커피를 마신 후 입안에 남는 맛과 향의 지속 시간입니다"
            />
            <SliderSection
              title="밸런스"
              value={sensoryData.balance}
              onValueChange={updateNumericValue('balance')}
              leftLabel="불균형"
              rightLabel="조화로운"
              description="맛과 향의 전체적인 균형과 조화로움의 정도입니다"
            />
            </View>

            {/* Mouthfeel Section */}
            <View style={styles.mouthfeelSection}>
              <Text style={styles.mouthfeelTitle}>입안 느낌</Text>
              <Text style={styles.mouthfeelSubtitle}>가장 가까운 느낌을 선택해주세요</Text>
              <View style={styles.mouthfeelContainer}>
                {mouthfeelOptions.map((option) => (
                  <MouthfeelButton 
                    key={option} 
                    option={option}
                    isSelected={sensoryData.mouthfeel === option}
                    onPress={() => setMouthfeel(option)}
                  />
                ))}
              </View>
            </View>
          </>
        )}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  mouthfeelSection: {
    marginTop: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_XL,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  mouthfeelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: 2,
  },
  mouthfeelSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: HIGColors.tertiaryLabel,
    marginBottom: HIGConstants.SPACING_MD,
  },
  mouthfeelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: HIGConstants.SPACING_SM,
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
  // Mode Toggle Styles
  modeToggleWrapper: {
    paddingVertical: HIGConstants.SPACING_MD,
    alignItems: 'center',
  },
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: HIGColors.systemGray6,
    borderRadius: 12,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modeButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 9,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  modeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 30,
    height: 3,
    backgroundColor: HIGColors.systemBlue,
    borderRadius: 2,
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
  modeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
  },
  modeButtonTextActive: {
    color: HIGColors.label,
    fontWeight: '700',
  },
  basicEvaluationIntro: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_SM,
    paddingBottom: HIGConstants.SPACING_MD,
    alignItems: 'center',
  },
  basicEvaluationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
    textAlign: 'center',
  },
  basicEvaluationSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 20,
  },
  sliderSectionContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_SM,
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