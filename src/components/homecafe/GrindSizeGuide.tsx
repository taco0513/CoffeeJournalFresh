import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { HIGColors, HIGConstants } from '../../styles/common';
import HomeCafeEnhancedService, { GrindGuide } from '../../services/HomeCafeEnhancedService';

interface GrindSizeGuideProps {
  selectedDripper: string;
  onGrindSizeSelect?: (grindSize: string) => void;
  currentGrindSize?: string;
}

export const GrindSizeGuide: React.FC<GrindSizeGuideProps> = ({
  selectedDripper,
  onGrindSizeSelect,
  currentGrindSize,
}) => {
  const { t } = useTranslation();
  const [showGuide, setShowGuide] = useState(false);
  const enhancedService = HomeCafeEnhancedService.getInstance();
  const grindGuide = enhancedService.getGrindGuide(selectedDripper);

  if (!grindGuide) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {selectedDripper}의 분쇄도 가이드를 준비 중입니다
        </Text>
      </View>
    );
  }

  const handleGrindSizeSelect = () => {
    onGrindSizeSelect?.(grindGuide.grindSize);
  };

  const getGrindSizeIcon = (grindSize: string): string => {
    if (grindSize.includes('fine')) return '🔹'; // Fine
    if (grindSize.includes('coarse')) return '🔸'; // Coarse
    return '◾'; // Medium
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>분쇄도 가이드</Text>
          <Text style={styles.subtitle}>{selectedDripper} 전용</Text>
        </View>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => setShowGuide(true)}
        >
          <Text style={styles.helpButtonText}>?</Text>
        </TouchableOpacity>
      </View>

      {/* Recommended Grind Size */}
      <TouchableOpacity
        style={[
          styles.grindSizeCard,
          currentGrindSize === grindGuide.grindSize && styles.selectedGrindSize
        ]}
        onPress={handleGrindSizeSelect}
      >
        <View style={styles.grindSizeHeader}>
          <Text style={styles.grindSizeIcon}>
            {getGrindSizeIcon(grindGuide.grindSize)}
          </Text>
          <View style={styles.grindSizeInfo}>
            <Text style={styles.grindSizeName}>{grindGuide.korean}</Text>
            <Text style={styles.grindSizeEnglish}>{grindGuide.grindSize}</Text>
          </View>
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>추천</Text>
          </View>
        </View>
        <Text style={styles.grindSizeDescription}>{grindGuide.description}</Text>
        <Text style={styles.visualReference}>비유: {grindGuide.visualReference}</Text>
      </TouchableOpacity>

      {/* Quick Grinder Settings */}
      <View style={styles.settingsSection}>
        <Text style={styles.settingsTitle}>그라인더별 설정</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {grindGuide.commonSettings.map((setting, index) => (
            <View key={index} style={styles.settingCard}>
              <Text style={styles.grinderName}>{setting.grinder}</Text>
              <Text style={styles.grinderSetting}>{setting.setting}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Adjustment Tips */}
      <View style={styles.adjustmentSection}>
        <Text style={styles.adjustmentTitle}>추출 시간 조절</Text>
        <View style={styles.adjustmentGrid}>
          <View style={styles.adjustmentCard}>
            <Text style={styles.adjustmentIcon}>⚡</Text>
            <Text style={styles.adjustmentLabel}>너무 빠름</Text>
            <Text style={styles.adjustmentTip}>{grindGuide.adjustment.tooFast}</Text>
          </View>
          <View style={styles.adjustmentCard}>
            <Text style={styles.adjustmentIcon}>🐌</Text>
            <Text style={styles.adjustmentLabel}>너무 느림</Text>
            <Text style={styles.adjustmentTip}>{grindGuide.adjustment.tooSlow}</Text>
          </View>
        </View>
      </View>

      {/* Detailed Guide Modal */}
      <Modal
        visible={showGuide}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGuide(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowGuide(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>분쇄도 완전 가이드</Text>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Visual Reference Section */}
            <View style={styles.visualSection}>
              <Text style={styles.sectionHeader}>시각적 기준</Text>
              <View style={styles.visualGrid}>
                <View style={styles.visualItem}>
                  <Text style={styles.visualIcon}>🔹</Text>
                  <Text style={styles.visualLabel}>Fine</Text>
                  <Text style={styles.visualDesc}>소금, 설탕</Text>
                </View>
                <View style={styles.visualItem}>
                  <Text style={styles.visualIcon}>◾</Text>
                  <Text style={styles.visualLabel}>Medium</Text>
                  <Text style={styles.visualDesc}>굵은 소금</Text>
                </View>
                <View style={styles.visualItem}>
                  <Text style={styles.visualIcon}>🔸</Text>
                  <Text style={styles.visualLabel}>Coarse</Text>
                  <Text style={styles.visualDesc}>빵가루</Text>
                </View>
              </View>
            </View>

            {/* Dripper-Specific Recommendations */}
            <View style={styles.recommendationsSection}>
              <Text style={styles.sectionHeader}>드리퍼별 추천 분쇄도</Text>
              {enhancedService.getGrindGuides().map((guide, index) => (
                <View key={index} style={[
                  styles.dripperGuideCard,
                  guide.dripper === selectedDripper && styles.currentDripperCard
                ]}>
                  <View style={styles.dripperGuideHeader}>
                    <Text style={styles.dripperGuideName}>{guide.dripper}</Text>
                    <Text style={styles.dripperGuideSize}>{guide.korean}</Text>
                  </View>
                  <Text style={styles.dripperGuideDesc}>{guide.description}</Text>
                </View>
              ))}
            </View>

            {/* Troubleshooting Section */}
            <View style={styles.troubleshootingSection}>
              <Text style={styles.sectionHeader}>추출 문제 해결</Text>
              
              <View style={styles.troubleCard}>
                <Text style={styles.troubleTitle}>🏃‍♂️ 추출이 너무 빨라요</Text>
                <Text style={styles.troubleSymptom}>증상: 2분 30초 이내 완료</Text>
                <Text style={styles.troubleSolution}>해결: 분쇄도를 더 곱게 (1-2단계)</Text>
                <Text style={styles.troubleReason}>이유: 물이 너무 빨리 통과해서 추출 부족</Text>
              </View>

              <View style={styles.troubleCard}>
                <Text style={styles.troubleTitle}>🐢 추출이 너무 느려요</Text>
                <Text style={styles.troubleSymptom}>증상: 5분 이상 소요</Text>
                <Text style={styles.troubleSolution}>해결: 분쇄도를 더 굵게 (1-2단계)</Text>
                <Text style={styles.troubleReason}>이유: 물이 막혀서 과추출 위험</Text>
              </View>

              <View style={styles.troubleCard}>
                <Text style={styles.troubleTitle}>😖 맛이 이상해요</Text>
                <Text style={styles.troubleSymptom}>쓴맛: 과추출 / 신맛: 부족추출</Text>
                <Text style={styles.troubleSolution}>해결: 분쇄도와 함께 추출시간 조절</Text>
                <Text style={styles.troubleReason}>이유: 추출율이 적정 범위를 벗어남</Text>
              </View>
            </View>

            {/* Professional Tips */}
            <View style={styles.tipsSection}>
              <Text style={styles.sectionHeader}>프로 팁</Text>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.tipText}>
                  분쇄도는 원두와 로스팅에 따라 달라져요. 같은 설정이라도 원두가 바뀌면 조정이 필요합니다.
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>🎯</Text>
                <Text style={styles.tipText}>
                  목표 추출시간: V60 2:30-4:00, Kalita Wave 3:00-5:00, Chemex 4:00-6:00
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>⚖️</Text>
                <Text style={styles.tipText}>
                  일관성이 가장 중요해요. 같은 설정으로 여러 번 시도해보세요.
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>📝</Text>
                <Text style={styles.tipText}>
                  매번 기록하세요. 좋은 컵과 아쉬운 컵 모두 다음번에 도움이 됩니다.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: HIGConstants.SPACING_MD,
  },
  emptyContainer: {
    padding: HIGConstants.SPACING_LG,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  title: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
  },
  subtitle: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
  },
  helpButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: HIGColors.systemBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButtonText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.white,
    fontWeight: '600',
  },
  
  // Grind Size Card
  grindSizeCard: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    borderWidth: 2,
    borderColor: HIGColors.systemGray4,
    marginBottom: HIGConstants.SPACING_MD,
  },
  selectedGrindSize: {
    borderColor: HIGColors.systemBlue,
    backgroundColor: HIGColors.systemBlue + '10',
  },
  grindSizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_XS,
  },
  grindSizeIcon: {
    fontSize: 24,
    marginRight: HIGConstants.SPACING_SM,
  },
  grindSizeInfo: {
    flex: 1,
  },
  grindSizeName: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
  },
  grindSizeEnglish: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
  },
  recommendedBadge: {
    backgroundColor: HIGColors.systemGreen,
    paddingHorizontal: HIGConstants.SPACING_XS,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: HIGConstants.FONT_SIZE_FOOTNOTE,
    color: HIGColors.white,
    fontWeight: '600',
  },
  grindSizeDescription: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  visualReference: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    fontStyle: 'italic',
  },
  
  // Settings Section
  settingsSection: {
    marginBottom: HIGConstants.SPACING_MD,
  },
  settingsTitle: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  settingCard: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    padding: HIGConstants.SPACING_SM,
    marginRight: HIGConstants.SPACING_SM,
    alignItems: 'center',
    minWidth: 80,
  },
  grinderName: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginBottom: 2,
  },
  grinderSetting: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
  },
  
  // Adjustment Section
  adjustmentSection: {
    marginBottom: HIGConstants.SPACING_MD,
  },
  adjustmentTitle: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  adjustmentGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  adjustmentCard: {
    flex: 1,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    padding: HIGConstants.SPACING_SM,
    marginHorizontal: HIGConstants.SPACING_XS,
    alignItems: 'center',
  },
  adjustmentIcon: {
    fontSize: 20,
    marginBottom: HIGConstants.SPACING_XS,
  },
  adjustmentLabel: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  adjustmentTip: {
    fontSize: HIGConstants.FONT_SIZE_FOOTNOTE,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: HIGColors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray5,
  },
  closeButton: {
    padding: HIGConstants.SPACING_SM,
  },
  closeButtonText: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    color: HIGColors.systemGray,
  },
  modalTitle: {
    flex: 1,
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
    marginRight: 44, // Balance close button
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  sectionHeader: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
    marginTop: HIGConstants.SPACING_LG,
  },
  
  // Visual Section
  visualSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  visualGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  visualItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    padding: HIGConstants.SPACING_MD,
    marginHorizontal: HIGConstants.SPACING_XS,
  },
  visualIcon: {
    fontSize: 32,
    marginBottom: HIGConstants.SPACING_XS,
  },
  visualLabel: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 2,
  },
  visualDesc: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
  },
  
  // Recommendations Section
  recommendationsSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  dripperGuideCard: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
  },
  currentDripperCard: {
    backgroundColor: HIGColors.systemBlue + '20',
    borderWidth: 1,
    borderColor: HIGColors.systemBlue,
  },
  dripperGuideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_XS,
  },
  dripperGuideName: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
  },
  dripperGuideSize: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.systemBlue,
    fontWeight: '500',
  },
  dripperGuideDesc: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
  },
  
  // Troubleshooting Section
  troubleshootingSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  troubleCard: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusSmall,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
  },
  troubleTitle: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  troubleSymptom: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    marginBottom: 2,
  },
  troubleSolution: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.systemBlue,
    fontWeight: '500',
    marginBottom: 2,
  },
  troubleReason: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    fontStyle: 'italic',
  },
  
  // Tips Section
  tipsSection: {
    marginBottom: HIGConstants.SPACING_XL,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: HIGConstants.SPACING_SM,
  },
  tipIcon: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    marginRight: HIGConstants.SPACING_SM,
    lineHeight: 22,
  },
  tipText: {
    flex: 1,
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    lineHeight: 22,
  },
});

export default GrindSizeGuide;