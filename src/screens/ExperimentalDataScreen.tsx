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
import { CurrentTasting, LabModeData } from '../types/tasting';
import { HIGConstants, HIGColors, commonButtonStyles, commonTextStyles } from '../styles/common';
import { 
  MouthfeelButton,
  SliderSection
} from '../components/sensory';
import { CompactSensoryGrid } from '../components/sensory/CompactSensoryGrid';
import { useSensoryState } from '../hooks/useSensoryState';
import { MouthfeelType } from '../types/sensory';
import { LabModeDataEntry } from '../components/lab/LabModeDataEntry';

const ExperimentalDataScreen = () => {
  const navigation = useNavigation();
  const { currentTasting, updateField } = useTastingStore();
  const [activeTab, setActiveTab] = useState<'basic' | 'lab'>('basic');
  
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
    mouthfeel: (currentTasting.mouthfeel as MouthfeelType) || 'Clean',
  });

  const mouthfeelOptions: MouthfeelType[] = useMemo(() => ['Clean', 'Creamy', 'Juicy', 'Silky'], []);

  const handleLabDataChange = useCallback((labData: LabModeData) => {
    updateField('labModeData', labData);
  }, [updateField]);

  // Calculate completion progress for gamification
  const getCompletionProgress = useCallback(() => {
    const requiredFields = ['body', 'acidity', 'sweetness', 'bitterness', 'finish', 'balance'];
    const completedFields = requiredFields.filter(field => {
      const value = sensoryData[field as keyof typeof sensoryData];
      return value && value !== 3; // 3 is default/neutral value
    });
    return {
      completed: completedFields.length,
      total: requiredFields.length,
      percentage: Math.round((completedFields.length / requiredFields.length) * 100)
    };
  }, [sensoryData]);

  const progress = getCompletionProgress();

  const handleComplete = useCallback(async () => {
    // Update all sensory fields in the store
    Object.entries(sensoryData).forEach(([key, value]) => {
      updateField(key as keyof CurrentTasting, value);
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

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'basic' && styles.tabActive]}
          onPress={() => setActiveTab('basic')}
        >
          <Text style={[styles.tabText, activeTab === 'basic' && styles.tabTextActive]}>
            기본 평가
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lab' && styles.tabActive]}
          onPress={() => setActiveTab('lab')}
        >
          <Text style={[styles.tabText, activeTab === 'lab' && styles.tabTextActive]}>
            전문 분석
          </Text>
        </TouchableOpacity>
      </View>

      {/* Guide Message with Progress */}
      <View style={styles.guideMessageContainer}>
        <View style={styles.guideHeader}>
          <View style={styles.guideTextContainer}>
            <Text style={styles.guideMessage}>
              {activeTab === 'basic' 
                ? '커피의 강도를 측정해보세요' 
                : '전문적인 분석 데이터를 기록하세요'
              }
            </Text>
            <Text style={styles.guideSubMessage}>
              {activeTab === 'basic'
                ? `${progress.completed}/${progress.total} 항목 완료`
                : 'TDS, 추출수율, 실험 변수를 정밀하게 기록할 수 있습니다'
              }
            </Text>
          </View>
        </View>
      </View>

      {activeTab === 'basic' ? (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        
        <CompactSensoryGrid
          attributes={[
            {
              title: "바디감",
              value: sensoryData.body,
              onValueChange: updateNumericValue('body'),
              leftLabel: "가벼움",
              rightLabel: "무거움",
              description: "입안에서 느껴지는 질감과 무게감"
            },
            {
              title: "산미",
              value: sensoryData.acidity,
              onValueChange: updateNumericValue('acidity'),
              leftLabel: "약함",
              rightLabel: "강함",
              description: "밝고 상큼한 신맛의 강도"
            },
            {
              title: "단맛",
              value: sensoryData.sweetness,
              onValueChange: updateNumericValue('sweetness'),
              leftLabel: "없음",
              rightLabel: "강함",
              description: "자연스러운 당도와 단맛"
            },
            {
              title: "쓴맛",
              value: sensoryData.bitterness,
              onValueChange: updateNumericValue('bitterness'),
              leftLabel: "약함",
              rightLabel: "강함",
              description: "다크 초콜릿같은 쓴맛"
            },
            {
              title: "여운",
              value: sensoryData.finish,
              onValueChange: updateNumericValue('finish'),
              leftLabel: "짧음",
              rightLabel: "길음",
              description: "입안에 남는 맛의 지속시간"
            },
            {
              title: "밸런스",
              value: sensoryData.balance,
              onValueChange: updateNumericValue('balance'),
              leftLabel: "불균형",
              rightLabel: "조화로운",
              description: "맛과 향의 전체적 균형"
            }
          ]}
        />

        {/* Mouthfeel Section - Card Style */}
        <View style={styles.mouthfeelCard}>
          <View style={styles.mouthfeelHeader}>
            <View style={styles.mouthfeelTitleRow}>
              <Text style={styles.mouthfeelIcon}>👄</Text>
              <Text style={styles.mouthfeelTitle}>입안 느낌</Text>
            </View>
            <Text style={styles.mouthfeelSubtitle}>가장 가까운 느낌을 선택해주세요</Text>
          </View>
          <View style={styles.mouthfeelContainer}>
            {mouthfeelOptions.map((option) => (
              <MouthfeelButton 
                key={option} 
                mouthfeel={option}
                isSelected={sensoryData.mouthfeel === option}
                onPress={() => setMouthfeel(option)}
              />
            ))}
          </View>
        </View>
        </ScrollView>
      ) : (
        <LabModeDataEntry
          data={currentTasting.labModeData}
          onChange={handleLabDataChange}
        />
      )}

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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: HIGConstants.SPACING_LG,
    marginTop: HIGConstants.SPACING_MD,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: 10,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 1,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: HIGColors.secondaryLabel,
  },
  tabTextActive: {
    color: HIGColors.label,
    fontWeight: '600',
  },
  guideMessageContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    backgroundColor: '#FFFFFF',
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guideTextContainer: {
    flex: 1,
  },
  guideMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  guideSubMessage: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
  },
  motivationContainer: {
    marginTop: HIGConstants.SPACING_SM,
    backgroundColor: HIGColors.systemBlue + '10',
    borderRadius: 8,
    padding: HIGConstants.SPACING_SM,
    borderLeftWidth: 3,
    borderLeftColor: HIGColors.systemBlue,
  },
  motivationText: {
    fontSize: 13,
    color: HIGColors.systemBlue,
    fontWeight: '500',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom button
  },
  sliderSectionContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
  },
  mouthfeelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_MD,
    padding: HIGConstants.SPACING_MD,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  mouthfeelHeader: {
    marginBottom: HIGConstants.SPACING_SM,
  },
  mouthfeelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  mouthfeelIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  mouthfeelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: HIGColors.label,
  },
  mouthfeelSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: HIGColors.secondaryLabel,
    marginTop: 2,
  },
  mouthfeelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: HIGConstants.SPACING_XS,
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