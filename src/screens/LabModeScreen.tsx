import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../stores/tastingStore';
import { HIGColors, HIGConstants } from '../styles/common';
import { LabModeForm } from '../components/LabModeForm';

const LabModeScreen = () => {
  const navigation = useNavigation();
  const { currentTasting } = useTastingStore();

  const handleNext = () => {
    navigation.navigate('UnifiedFlavor' as never);
  };

  const handleSkip = () => {
    navigation.navigate('UnifiedFlavor' as never);
  };

  // 필수 필드 검증 - 랩 모드
  const isValid = 
    currentTasting.labModeData?.equipment.dripper &&
    currentTasting.labModeData?.equipment.filter &&
    (currentTasting.labModeData?.recipe.doseIn || 0) > 0 &&
    (currentTasting.labModeData?.recipe.waterAmount || 0) > 0 &&
    (currentTasting.labModeData?.recipe.waterTemp || 0) > 0 &&
    (currentTasting.labModeData?.recipe.totalBrewTime || 0) > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>랩 모드</Text>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '29%' }]} />
        </View>
        <Text style={styles.progressText}>2/7</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>🧪 전문가 수준 분석</Text>
          <Text style={styles.subtitle}>
            모든 추출 변수를 상세히 기록하고 분석해보세요
          </Text>
        </View>

        <LabModeForm />
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.nextButton, !isValid && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!isValid}
        >
          <Text style={[
            styles.nextButtonText, 
            !isValid && styles.nextButtonTextDisabled
          ]}>
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
    backgroundColor: HIGColors.systemBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray4,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: HIGColors.systemBlue,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  skipButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    color: HIGColors.systemBlue,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_SM,
    backgroundColor: HIGColors.white,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: HIGColors.systemGray5,
    borderRadius: 2,
    marginRight: HIGConstants.SPACING_SM,
  },
  progressFill: {
    height: '100%',
    backgroundColor: HIGColors.systemBlue,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: HIGColors.secondaryLabel,
    minWidth: 30,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_LG,
    backgroundColor: HIGColors.white,
    marginBottom: HIGConstants.SPACING_SM,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    lineHeight: 22,
  },
  bottomContainer: {
    padding: HIGConstants.SPACING_LG,
    backgroundColor: HIGColors.white,
    borderTopWidth: 1,
    borderTopColor: HIGColors.systemGray6,
  },
  nextButton: {
    backgroundColor: HIGColors.systemBlue,
    borderRadius: HIGConstants.cornerRadiusMedium,
    paddingVertical: HIGConstants.SPACING_LG,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: HIGColors.systemGray4,
  },
  nextButtonText: {
    color: HIGColors.white,
    fontSize: 17,
    fontWeight: '600',
  },
  nextButtonTextDisabled: {
    color: HIGColors.gray2,
  },
});

export default LabModeScreen;