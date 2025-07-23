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
  MouthfeelButton,
  SliderSection
} from '../components/sensory';
import { useSensoryState } from '../hooks/useSensoryState';
import { MouthfeelType } from '../types/sensory';

const ExperimentalDataScreen = () => {
  const navigation = useNavigation();
  const { currentTasting, updateField } = useTastingStore();
  
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

  const mouthfeelOptions: MouthfeelType[] = useMemo(() => ['Clean', 'Creamy', 'Juicy', 'Silky'], []);

  const handleComplete = useCallback(async () => {
    // Update all sensory fields in the store
    Object.entries(sensoryData).forEach(([key, value]) => {
      updateField(key, value);
    });
    
    // Navigate to Korean sensory evaluation screen
    navigation.navigate('SensoryEvaluation' as never);
  }, [sensoryData, updateField, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navigationTitle}>실험 데이터</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SensoryEvaluation' as never)}>
          <Text style={styles.skipButton}>건너뛰기</Text>
        </TouchableOpacity>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '57%' }]} />
      </View>

      {/* Guide Message */}
      <View style={styles.guideMessageContainer}>
        <Text style={styles.guideMessage}>
          🔬 실험 데이터를 기록해보세요
        </Text>
        <Text style={styles.guideSubMessage}>
          레시피 개선을 위한 정량적 측정 데이터입니다
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.experimentalIntro}>
          <Text style={styles.experimentalTitle}>커피의 강도를 측정해보세요</Text>
          <Text style={styles.experimentalSubtitle}>
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
  experimentalIntro: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    marginBottom: HIGConstants.SPACING_SM,
  },
  experimentalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  experimentalSubtitle: {
    fontSize: 15,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 22,
  },
  sliderSectionContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
  },
  mouthfeelSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_SM,
  },
  mouthfeelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  mouthfeelSubtitle: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_MD,
  },
  mouthfeelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HIGConstants.SPACING_SM,
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

export default ExperimentalDataScreen;