import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore, SelectedSensoryExpression } from '../stores/tastingStore';
import { NavigationButton } from '../components/common';
import { HIGConstants, hitSlop, HIGColors, commonButtonStyles, commonTextStyles } from '../styles/common';
import EnhancedSensoryEvaluation from '../components/sensory/EnhancedSensoryEvaluation';
import { SensoryOnboarding, checkShouldShowOnboarding } from '../components/sensory/SensoryOnboarding';

type MouthfeelType = 'Clean' | 'Creamy' | 'Juicy' | 'Silky';

const SensoryScreen = () => {
  const navigation = useNavigation();
  const { currentTasting, updateField, selectedSensoryExpressions, setSelectedSensoryExpressions } = useTastingStore();
  
  const [body, setBody] = useState(currentTasting.body || 3);
  const [acidity, setAcidity] = useState(currentTasting.acidity || 3);
  const [sweetness, setSweetness] = useState(currentTasting.sweetness || 3);
  const [finish, setFinish] = useState(currentTasting.finish || 3);
  const [bitterness, setBitterness] = useState(currentTasting.bitterness || 3);
  const [balance, setBalance] = useState(currentTasting.balance || 3);
  const [mouthfeel, setMouthfeel] = useState<MouthfeelType>(
    currentTasting.mouthfeel || 'Clean'
  );
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

  const mouthfeelOptions: MouthfeelType[] = ['Clean', 'Creamy', 'Juicy', 'Silky'];

  // Mouthfeel Button Component
  const MouthfeelButton = ({ option }: { option: MouthfeelType }) => {
    const isSelected = mouthfeel === option;

    return (
      <TouchableOpacity
        style={[
          styles.mouthfeelButton,
          isSelected && styles.selectedMouthfeel,
        ]}
        onPress={() => setMouthfeel(option)}
        hitSlop={hitSlop.small}
      >
        <Text
          style={[
            styles.mouthfeelText,
            isSelected && styles.selectedMouthfeelText,
          ]}
        >
          {option}
        </Text>
        {isSelected && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };


  const handleComplete = async () => {
    updateField('body', body);
    updateField('acidity', acidity);
    updateField('sweetness', sweetness);
    updateField('finish', finish);
    updateField('bitterness', bitterness);
    updateField('balance', balance);
    updateField('mouthfeel', mouthfeel);
    
    // 개인 감상평 화면으로 이동
    navigation.navigate('PersonalComment');
  };

  // Convert EnhancedSensoryEvaluation format to TastingStore format
  const handleExpressionChange = useCallback((expressions: any[]) => {
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

  const renderSlider = (
    title: string,
    value: number,
    setValue: (value: number) => void,
    leftLabel: string,
    rightLabel: string
  ) => (
    <View style={styles.sliderSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>{leftLabel}</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={5}
          value={value}
          onValueChange={setValue}
          step={1}
          minimumTrackTintColor={HIGColors.blue}
          maximumTrackTintColor={HIGColors.gray4}
          thumbTintColor={HIGColors.blue}
        />
        <Text style={styles.sliderLabel}>{rightLabel}</Text>
      </View>
      <Text style={styles.valueText}>{Math.round(value)}</Text>
    </View>
  );

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
                한국식 표현 🇰🇷
              </Text>
              {showEnhanced && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedBadgeText}>추천</Text>
                </View>
              )}
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
            {renderSlider('바디감', body, setBody, '가벼움', '무거움')}
            {renderSlider('산미', acidity, setAcidity, '약함', '강함')}
            {renderSlider('단맛', sweetness, setSweetness, '없음', '강함')}
            {renderSlider('쓴맛', bitterness, setBitterness, '약함', '강함')}
            {renderSlider('여운', finish, setFinish, '짧음', '길음')}
            {renderSlider('밸런스', balance, setBalance, '불균형', '조화로운')}

            {/* Mouthfeel Section */}
            <View style={styles.mouthfeelSection}>
              <Text style={styles.sectionTitle}>입안 느낌</Text>
              <View style={styles.mouthfeelContainer}>
                {mouthfeelOptions.map((option) => (
                  <MouthfeelButton key={option} option={option} />
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
  sliderSection: {
    marginBottom: HIGConstants.SPACING_XL,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: HIGConstants.MIN_TOUCH_TARGET,
    marginHorizontal: HIGConstants.SPACING_MD,
  },
  sliderLabel: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    width: 50,
    textAlign: 'center',
  },
  valueText: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.blue,
    textAlign: 'center',
    marginTop: HIGConstants.SPACING_SM,
  },
  mouthfeelSection: {
    marginBottom: HIGConstants.SPACING_XL,
  },
  mouthfeelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mouthfeelButton: {
    width: '48%',
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: HIGColors.gray4,
    borderRadius: HIGConstants.BORDER_RADIUS,
    paddingVertical: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_SM,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: HIGConstants.SPACING_MD,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedMouthfeel: {
    backgroundColor: HIGColors.blue,
    borderColor: HIGColors.blue,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mouthfeelText: {
    fontSize: HIGConstants.FONT_SIZE_MEDIUM,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
  },
  selectedMouthfeelText: {
    color: '#FFFFFF',
  },
  checkmark: {
    position: 'absolute',
    top: 5,
    right: 5,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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