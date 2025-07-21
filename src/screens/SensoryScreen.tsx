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
  EnhancedSensoryEvaluation, 
  SensoryOnboarding,
  MouthfeelButton,
  SliderSection
} from '../components/sensory';
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
      {/* HIG 준수 네비게이션 바 */}
      <View style={styles.navigationBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backButtonText}>‹ 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.navigationTitle}>감각 평가</Text>
        <Text style={styles.progressIndicator}>3/6</Text>
      </View>
      
      {/* 진행 상태 바 */}
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 제목 및 설명 */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>감각 평가</Text>
          <Text style={styles.subtitle}>입안의 느낌에 집중해보세요</Text>
          <Text style={styles.guideMessage}>
            ☕ 천천히 음미하며 각각의 요소를 느껴보세요
          </Text>
          
          {/* Mode Toggle */}
          <View style={styles.modeToggleContainer}>
            <TouchableOpacity 
              style={[styles.modeButton, !showEnhanced && styles.modeButtonActive]}
              onPress={() => setShowEnhanced(false)}
            >
              <Text style={[styles.modeButtonText, !showEnhanced && styles.modeButtonTextActive]}>
                기본 평가
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modeButton, showEnhanced && styles.modeButtonActive]}
              onPress={() => setShowEnhanced(true)}
            >
              <Text style={[styles.modeButtonText, showEnhanced && styles.modeButtonTextActive]}>
                감각 평가
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showEnhanced ? (
          /* Enhanced Korean Sensory Evaluation */
          <EnhancedSensoryEvaluation
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
            showDescriptions={true}
          />
        ) : (
          /* Traditional Slider Evaluation */
          <>
            <SliderSection
              title="바디감"
              value={sensoryData.body}
              onValueChange={updateNumericValue('body')}
              leftLabel="가벼움"
              rightLabel="무거움"
            />
            <SliderSection
              title="산미"
              value={sensoryData.acidity}
              onValueChange={updateNumericValue('acidity')}
              leftLabel="약함"
              rightLabel="강함"
            />
            <SliderSection
              title="단맛"
              value={sensoryData.sweetness}
              onValueChange={updateNumericValue('sweetness')}
              leftLabel="없음"
              rightLabel="강함"
            />
            <SliderSection
              title="쓴맛"
              value={sensoryData.bitterness}
              onValueChange={updateNumericValue('bitterness')}
              leftLabel="약함"
              rightLabel="강함"
            />
            <SliderSection
              title="여운"
              value={sensoryData.finish}
              onValueChange={updateNumericValue('finish')}
              leftLabel="짧음"
              rightLabel="길음"
            />
            <SliderSection
              title="밸런스"
              value={sensoryData.balance}
              onValueChange={updateNumericValue('balance')}
              leftLabel="불균형"
              rightLabel="조화로운"
            />

            {/* Mouthfeel Section */}
            <View style={styles.mouthfeelSection}>
              <Text style={styles.sectionTitle}>입안 느낌</Text>
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

        {/* 완료 버튼 */}
        <TouchableOpacity 
          style={[commonButtonStyles.buttonSuccess, commonButtonStyles.buttonLarge, styles.completeButton]}
          onPress={handleComplete}
          activeOpacity={0.8}
        >
          <Text style={[commonTextStyles.buttonTextLarge, styles.completeButtonText]}>
            평가 완료
          </Text>
        </TouchableOpacity>
      </ScrollView>

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
    height: HIGConstants.MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  backButton: {
    minWidth: HIGConstants.MIN_TOUCH_TARGET,
    height: HIGConstants.MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: '400',
    color: HIGColors.blue,
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  progressIndicator: {
    fontSize: 15,
    fontWeight: '400',
    color: HIGColors.secondaryLabel,
    minWidth: HIGConstants.MIN_TOUCH_TARGET,
    textAlign: 'right',
  },
  progressBar: {
    height: 4,
    backgroundColor: HIGColors.gray5,
  },
  progressFill: {
    height: 4,
    width: '50%', // 3/6 = 50%
    backgroundColor: HIGColors.blue,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingBottom: HIGConstants.SPACING_XL,
  },
  headerSection: {
    paddingTop: HIGConstants.SPACING_XL,
    paddingBottom: HIGConstants.SPACING_LG,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  guideMessage: {
    fontSize: 15,
    fontWeight: '400',
    color: HIGColors.blue,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_XL,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  mouthfeelSection: {
    marginBottom: HIGConstants.SPACING_XL,
  },
  mouthfeelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  completeButton: {
    width: '100%',
    marginTop: HIGConstants.SPACING_LG,
  },
  completeButtonText: {
    color: '#FFFFFF',
  },
  // Mode Toggle Styles
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: 2,
    marginTop: HIGConstants.SPACING_MD,
    alignSelf: 'center',
  },
  modeButton: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.cornerRadiusSmall,
    minWidth: 120,
    alignItems: 'center',
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: HIGColors.systemGreen,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  recommendedBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modeButtonActive: {
    backgroundColor: HIGColors.systemBlue,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: HIGColors.secondaryLabel,
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default SensoryScreen;