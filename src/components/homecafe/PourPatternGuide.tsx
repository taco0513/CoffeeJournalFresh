import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { HIGColors, HIGConstants } from '../../styles/common';

interface PourPatternGuideProps {
  selectedPattern?: string;
  onPatternSelect?: (pattern: string) => void;
  selectedDripper: string;
  technique?: string;
  dripper?: string;
}

interface PourPattern {
  id: string;
  name: string;
  korean: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  bestFor: string[];
  steps: string[];
  tips: string[];
  visualization: string;
  icon: string;
  compatibleDrippers: string[];
}

export const PourPatternGuide: React.FC<PourPatternGuideProps> = ({
  selectedPattern,
  onPatternSelect,
  selectedDripper,
}) => {
  const { t } = useTranslation();
  const [showGuide, setShowGuide] = useState(false);
  const [selectedPatternDetail, setSelectedPatternDetail] = useState<PourPattern | null>(null);

  const pourPatterns: PourPattern[] = [
    {
      id: 'center',
      name: 'Center Pour',
      korean: '센터 포어',
      description: '중앙에 집중해서 붓는 가장 기본적인 기법',
      difficulty: 'beginner',
      bestFor: ['일관된 맛', '초보자', '안정적인 추출'],
      steps: [
        '드리퍼 중앙에 물을 천천히 붓기',
        '원두가 부풀어 오르는 것 확인',
        '중앙을 벗어나지 않도록 주의',
        '일정한 속도로 계속 붓기'
      ],
      tips: [
        '필터 가장자리에 물이 닿지 않도록 주의하세요',
        '물줄기를 너무 굵게 하지 마세요',
        '원두 베드가 평평하게 유지되도록 하세요'
      ],
      visualization: '●',
      icon: '🎯',
      compatibleDrippers: ['V60', 'KalitaWave', 'Origami', 'Chemex']
    },
    {
      id: 'spiral',
      name: 'Spiral Pour',
      korean: '스파이럴 포어',
      description: '나선형으로 돌면서 붓는 고급 기법',
      difficulty: 'intermediate',
      bestFor: ['균등한 추출', '복잡한 향미', '풀바디'],
      steps: [
        '중앙에서 시작해서 천천히 바깥쪽으로',
        '시계방향으로 나선형 그리기',
        '가장자리 근처에서 다시 중앙으로',
        '2-3회 반복하며 물 조절'
      ],
      tips: [
        '속도를 일정하게 유지하세요',
        '나선의 크기를 점진적으로 늘려가세요',
        '필터 가장자리는 피해주세요'
      ],
      visualization: '🌀',
      icon: '🌪️',
      compatibleDrippers: ['V60', 'Origami', 'Chemex']
    },
    {
      id: 'pulse',
      name: 'Pulse Pour',
      korean: '펄스 포어',
      description: '여러 번에 나누어 붓는 단계적 기법',
      difficulty: 'intermediate',
      bestFor: ['조절된 추출', '산미 강조', '깔끔한 맛'],
      steps: [
        '정해진 물량을 여러 번에 나누어 계획',
        '각 단계마다 물이 거의 빠질 때까지 대기',
        '다음 물을 부어 베드 높이 유지',
        '마지막까지 일정한 간격으로 반복'
      ],
      tips: [
        '각 부음 사이의 간격을 일정하게 하세요',
        '물이 완전히 빠지기 전에 다음 물을 부으세요',
        '각 단계의 물량을 미리 계산해두세요'
      ],
      visualization: '●●●',
      icon: '⚡',
      compatibleDrippers: ['V60', 'KalitaWave', 'Origami', 'Chemex']
    },
    {
      id: 'continuous',
      name: 'Continuous Pour',
      korean: '연속 붓기',
      description: '끊임없이 연속적으로 붓는 기법',
      difficulty: 'beginner',
      bestFor: ['단순함', '일관성', '빠른 추출'],
      steps: [
        '블룸 후 연속적으로 물 붓기',
        '일정한 속도와 높이 유지',
        '중간에 멈추지 않고 계속',
        '목표 물량까지 한 번에 완성'
      ],
      tips: [
        '팔의 피로를 줄이기 위해 편안한 자세를 취하세요',
        '물줄기의 굵기를 일정하게 유지하세요',
        '속도 조절이 가장 중요합니다'
      ],
      visualization: '━━━',
      icon: '🌊',
      compatibleDrippers: ['KalitaWave', 'Chemex']
    },
    {
      id: 'multiStage',
      name: 'Multi-Stage Pour',
      korean: '다단계 붓기',
      description: '복잡한 단계별 붓기 기법',
      difficulty: 'advanced',
      bestFor: ['정밀한 조절', '전문적 추출', '실험적 접근'],
      steps: [
        '블룸, 1차, 2차, 3차 등 단계 설정',
        '각 단계마다 다른 기법 적용',
        '추출 진행 상황에 따라 조절',
        '타이밍과 물량을 정밀하게 관리'
      ],
      tips: [
        '사전에 자세한 계획을 세우세요',
        '타이머를 활용해 정확한 타이밍을 지키세요',
        '많은 연습이 필요한 고급 기법입니다'
      ],
      visualization: '①②③④',
      icon: '🎭',
      compatibleDrippers: ['V60', 'Origami']
    }
  ];

  // Filter patterns compatible with selected dripper
  const compatiblePatterns = pourPatterns.filter(pattern => 
    pattern.compatibleDrippers.includes(selectedDripper)
  );

  const handlePatternSelect = (pattern: PourPattern) => {
    onPatternSelect?.(pattern.id);
  };

  const handlePatternDetail = (pattern: PourPattern) => {
    setSelectedPatternDetail(pattern);
    setShowGuide(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return HIGColors.systemGreen;
      case 'intermediate':
        return HIGColors.systemOrange;
      case 'advanced':
        return HIGColors.systemRed;
      default:
        return HIGColors.systemGray;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '초보자';
      case 'intermediate':
        return '중급자';
      case 'advanced':
        return '고급자';
      default:
        return difficulty;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>붓기 기법 가이드</Text>
      <Text style={styles.subtitle}>
        {selectedDripper}에 적합한 기법들 ({compatiblePatterns.length}개)
      </Text>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {compatiblePatterns.map((pattern) => (
          <View key={pattern.id} style={styles.patternCard}>
            <TouchableOpacity
              style={[
                styles.patternButton,
                selectedPattern === pattern.id && styles.selectedPattern
              ]}
              onPress={() => handlePatternSelect(pattern)}
            >
              <Text style={styles.patternIcon}>{pattern.icon}</Text>
              <Text style={styles.patternName}>{pattern.korean}</Text>
              <Text style={styles.patternVisualization}>
                {pattern.visualization}
              </Text>
              
              <View style={styles.difficultyBadge}>
                <View style={[
                  styles.difficultyDot,
                  { backgroundColor: getDifficultyColor(pattern.difficulty) }
                ]} />
                <Text style={styles.difficultyText}>
                  {getDifficultyText(pattern.difficulty)}
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => handlePatternDetail(pattern)}
            >
              <Text style={styles.detailButtonText}>자세히</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Quick Tips */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>💡 붓기 기법 기본 원칙</Text>
        <View style={styles.tipsList}>
          <Text style={styles.tipItem}>• 일정한 속도로 붓기</Text>
          <Text style={styles.tipItem}>• 필터 가장자리 피하기</Text>
          <Text style={styles.tipItem}>• 물줄기 높이 일정하게 유지</Text>
          <Text style={styles.tipItem}>• 원두 베드 평평하게 유지</Text>
        </View>
      </View>

      {/* Pattern Detail Modal */}
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
            <Text style={styles.modalTitle}>
              {selectedPatternDetail?.korean}
            </Text>
            <TouchableOpacity 
              style={styles.useButton}
              onPress={() => {
                if (selectedPatternDetail) {
                  handlePatternSelect(selectedPatternDetail);
                  setShowGuide(false);
                }
              }}
            >
              <Text style={styles.useButtonText}>사용</Text>
            </TouchableOpacity>
          </View>

          {selectedPatternDetail && (
            <ScrollView style={styles.modalContent}>
              {/* Pattern Header */}
              <View style={styles.patternHeader}>
                <Text style={styles.modalPatternIcon}>
                  {selectedPatternDetail.icon}
                </Text>
                <Text style={styles.modalPatternName}>
                  {selectedPatternDetail.korean}
                </Text>
                <Text style={styles.modalPatternEnglish}>
                  {selectedPatternDetail.name}
                </Text>
                <Text style={styles.patternDescription}>
                  {selectedPatternDetail.description}
                </Text>
                
                <View style={styles.modalDifficultyBadge}>
                  <View style={[
                    styles.difficultyDot,
                    { backgroundColor: getDifficultyColor(selectedPatternDetail.difficulty) }
                  ]} />
                  <Text style={styles.modalDifficultyText}>
                    {getDifficultyText(selectedPatternDetail.difficulty)}
                  </Text>
                </View>
              </View>

              {/* Visualization */}
              <View style={styles.visualizationSection}>
                <Text style={styles.sectionHeader}>시각적 표현</Text>
                <View style={styles.visualizationContainer}>
                  <Text style={styles.visualizationDisplay}>
                    {selectedPatternDetail.visualization}
                  </Text>
                  <Text style={styles.visualizationDesc}>
                    물줄기의 움직임을 표현한 패턴
                  </Text>
                </View>
              </View>

              {/* Best For */}
              <View style={styles.bestForSection}>
                <Text style={styles.sectionHeader}>이런 경우에 좋아요</Text>
                <View style={styles.tagContainer}>
                  {selectedPatternDetail.bestFor.map((item, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Steps */}
              <View style={styles.stepsSection}>
                <Text style={styles.sectionHeader}>단계별 실행</Text>
                {selectedPatternDetail.steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>

              {/* Tips */}
              <View style={styles.modalTipsSection}>
                <Text style={styles.sectionHeader}>프로 팁</Text>
                {selectedPatternDetail.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Text style={styles.tipBullet}>💡</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>

              {/* Compatible Drippers */}
              <View style={styles.compatibleSection}>
                <Text style={styles.sectionHeader}>호환 드리퍼</Text>
                <View style={styles.dripperList}>
                  {selectedPatternDetail.compatibleDrippers.map((dripper, index) => (
                    <View key={index} style={[
                      styles.dripperBadge,
                      dripper === selectedDripper && styles.currentDripperBadge
                    ]}>
                      <Text style={[
                        styles.dripperBadgeText,
                        dripper === selectedDripper && styles.currentDripperText
                      ]}>
                        {dripper}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: HIGConstants.SPACING_MD,
  },
  title: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  scrollContainer: {
    paddingHorizontal: HIGConstants.SPACING_SM,
  },
  
  // Pattern Cards
  patternCard: {
    marginRight: HIGConstants.SPACING_MD,
    alignItems: 'center',
  },
  patternButton: {
    width: 120,
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: HIGColors.systemGray4,
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedPattern: {
    borderColor: HIGColors.systemBlue,
    backgroundColor: HIGColors.systemBlue + '10',
  },
  patternIcon: {
    fontSize: 32,
    marginBottom: HIGConstants.SPACING_XS,
  },
  patternName: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_XS,
  },
  patternVisualization: {
    fontSize: 24,
    color: HIGColors.systemBlue,
    marginBottom: HIGConstants.SPACING_XS,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_XS,
    paddingVertical: 2,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: 8,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  difficultyText: {
    fontSize: HIGConstants.FONT_SIZE_FOOTNOTE,
    color: HIGColors.secondaryLabel,
  },
  detailButton: {
    marginTop: HIGConstants.SPACING_XS,
    paddingVertical: 4,
    paddingHorizontal: HIGConstants.SPACING_SM,
  },
  detailButtonText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.systemBlue,
    fontWeight: '500',
  },
  
  // Tips Section
  tipsSection: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    padding: HIGConstants.SPACING_MD,
    marginTop: HIGConstants.SPACING_MD,
  },
  tipsTitle: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  tipsList: {
    gap: 4,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
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
  },
  useButton: {
    backgroundColor: HIGColors.systemBlue,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.cornerRadiusSmall,
  },
  useButtonText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.white,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  
  // Pattern Header
  patternHeader: {
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_LG,
  },
  modalPatternIcon: {
    fontSize: 64,
    marginBottom: HIGConstants.SPACING_SM,
  },
  modalPatternName: {
    fontSize: HIGConstants.FONT_SIZE_H1,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalPatternEnglish: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  patternDescription: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: HIGConstants.SPACING_SM,
  },
  modalDifficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
  },
  modalDifficultyText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    fontWeight: '500',
  },
  
  // Section Headers
  sectionHeader: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
    marginTop: HIGConstants.SPACING_LG,
  },
  
  // Visualization Section
  visualizationSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  visualizationContainer: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_LG,
    alignItems: 'center',
  },
  visualizationDisplay: {
    fontSize: 48,
    color: HIGColors.systemBlue,
    marginBottom: HIGConstants.SPACING_SM,
  },
  visualizationDesc: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
  },
  
  // Best For Section
  bestForSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: HIGColors.systemGreen,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
    borderRadius: HIGConstants.cornerRadiusSmall,
    marginRight: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_XS,
  },
  tagText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.white,
    fontWeight: '500',
  },
  
  // Steps Section
  stepsSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: HIGConstants.SPACING_MD,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: HIGColors.systemBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: HIGConstants.SPACING_SM,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.white,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    lineHeight: 22,
  },
  
  // Modal Tips Section
  modalTipsSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  tipBullet: {
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
  
  // Compatible Section
  compatibleSection: {
    marginBottom: HIGConstants.SPACING_XL,
  },
  dripperList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dripperBadge: {
    backgroundColor: HIGColors.systemGray6,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
    borderRadius: HIGConstants.cornerRadiusSmall,
    marginRight: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_XS,
  },
  currentDripperBadge: {
    backgroundColor: HIGColors.systemBlue,
  },
  dripperBadgeText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    fontWeight: '500',
  },
  currentDripperText: {
    color: HIGColors.white,
  },
});

export default PourPatternGuide;