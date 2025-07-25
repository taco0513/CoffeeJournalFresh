import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { HIGColors, HIGConstants } from '../../styles/common';
import HomeCafeEnhancedService, { DripperSpec } from '../../services/HomeCafeEnhancedService';

interface EnhancedDripperSelectorProps {
  selectedDripper: string;
  onDripperSelect: (dripper: string) => void;
  onSizeSelect?: (size: string) => void;
  selectedSize?: string;
  showRecommendations?: boolean;
}

const { width } = Dimensions.get('window');

export const EnhancedDripperSelector: React.FC<EnhancedDripperSelectorProps> = ({
  selectedDripper,
  onDripperSelect,
  onSizeSelect,
  selectedSize,
  showRecommendations = false,
}) => {
  const { t } = useTranslation();
  const [showSpecs, setShowSpecs] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState<DripperSpec | null>(null);
  const enhancedService = HomeCafeEnhancedService.getInstance();
  const dripperSpecs = enhancedService.getDripperSpecs();

  const handleDripperPress = (dripper: string) => {
    onDripperSelect(dripper);
  };

  const handleSpecPress = (spec: DripperSpec) => {
    setSelectedSpec(spec);
    setShowSpecs(true);
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
      <Text style={styles.sectionTitle}>드리퍼 선택</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {dripperSpecs.map((spec) => (
          <View key={spec.name} style={styles.dripperCard}>
            <TouchableOpacity
              style={[
                styles.dripperButton,
                selectedDripper === spec.name && styles.selectedDripper
              ]}
              onPress={() => handleDripperPress(spec.name)}
            >
              <Text style={styles.dripperIcon}>{spec.icon}</Text>
              <Text style={styles.dripperName}>{spec.korean}</Text>
              <Text style={styles.dripperBrand}>{spec.brand}</Text>
              
              <View style={styles.difficultyBadge}>
                <View style={[
                  styles.difficultyDot,
                  { backgroundColor: getDifficultyColor(spec.difficulty) }
                ]} />
                <Text style={styles.difficultyText}>
                  {getDifficultyText(spec.difficulty)}
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.specsButton}
              onPress={() => handleSpecPress(spec)}
            >
              <Text style={styles.specsButtonText}>상세보기</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Size Selection */}
      {selectedDripper && (
        <View style={styles.sizeSection}>
          <Text style={styles.sizeTitle}>사이즈 선택</Text>
          <View style={styles.sizeContainer}>
            {dripperSpecs
              .find(spec => spec.name === selectedDripper)?.sizes
              .map((size) => (
                <TouchableOpacity
                  key={size.size}
                  style={[
                    styles.sizeButton,
                    selectedSize === size.size && styles.selectedSize
                  ]}
                  onPress={() => onSizeSelect?.(size.size)}
                >
                  <Text style={[
                    styles.sizeText,
                    selectedSize === size.size && styles.selectedSizeText
                  ]}>
                    {size.size}
                  </Text>
                  <Text style={[
                    styles.sizeCapacity,
                    selectedSize === size.size && styles.selectedSizeText
                  ]}>
                    {size.cupCount}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      )}

      {/* Specs Modal */}
      <Modal
        visible={showSpecs}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSpecs(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowSpecs(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedSpec?.korean} 상세 정보
            </Text>
          </View>

          {selectedSpec && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.specCard}>
                <Text style={styles.specIcon}>{selectedSpec.icon}</Text>
                <Text style={styles.specName}>{selectedSpec.korean}</Text>
                <Text style={styles.specBrand}>{selectedSpec.brand}</Text>
                
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>재질</Text>
                  <Text style={styles.specValue}>{selectedSpec.material}</Text>
                </View>
                
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>드레인 속도</Text>
                  <Text style={styles.specValue}>
                    {selectedSpec.flowRate === 'fast' ? '빠름' : 
                     selectedSpec.flowRate === 'medium' ? '보통' : '느림'}
                  </Text>
                </View>
                
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>난이도</Text>
                  <View style={styles.difficultyContainer}>
                    <View style={[
                      styles.difficultyDot,
                      { backgroundColor: getDifficultyColor(selectedSpec.difficulty) }
                    ]} />
                    <Text style={styles.specValue}>
                      {getDifficultyText(selectedSpec.difficulty)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.characteristicsSection}>
                <Text style={styles.sectionHeader}>특징</Text>
                {selectedSpec.characteristics.map((char, index) => (
                  <View key={index} style={styles.characteristicItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.characteristicText}>{char}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.techniquesSection}>
                <Text style={styles.sectionHeader}>추천 기법</Text>
                <View style={styles.techniqueContainer}>
                  {selectedSpec.recommendedTechniques.map((technique, index) => (
                    <View key={index} style={styles.techniqueBadge}>
                      <Text style={styles.techniqueText}>{technique}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.sizesSection}>
                <Text style={styles.sectionHeader}>사이즈별 정보</Text>
                {selectedSpec.sizes.map((size, index) => (
                  <View key={index} style={styles.sizeDetailCard}>
                    <View style={styles.sizeDetailHeader}>
                      <Text style={styles.sizeDetailTitle}>{size.size}</Text>
                      <Text style={styles.sizeDetailCapacity}>{size.cupCount}</Text>
                    </View>
                    <Text style={styles.sizeDetailFilter}>필터: {size.filterType}</Text>
                    <Text style={styles.sizeDetailRatio}>기본 비율: {size.defaultRatio}</Text>
                    <Text style={styles.sizeDetailDose}>
                      추천 원두량: {size.recommendedDose.join('g, ')}g
                    </Text>
                  </View>
                ))}
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
  sectionTitle: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  scrollContainer: {
    paddingHorizontal: HIGConstants.SPACING_SM,
  },
  dripperCard: {
    marginRight: HIGConstants.SPACING_MD,
    alignItems: 'center',
  },
  dripperButton: {
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
  selectedDripper: {
    borderColor: HIGColors.systemBlue,
    backgroundColor: HIGColors.systemBlue + '10',
  },
  dripperIcon: {
    fontSize: 32,
    marginBottom: HIGConstants.SPACING_XS,
  },
  dripperName: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
  },
  dripperBrand: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    marginTop: 2,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: HIGConstants.SPACING_XS,
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
  specsButton: {
    marginTop: HIGConstants.SPACING_XS,
    paddingVertical: 4,
    paddingHorizontal: HIGConstants.SPACING_SM,
  },
  specsButtonText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.systemBlue,
    fontWeight: '500',
  },
  
  // Size Selection
  sizeSection: {
    marginTop: HIGConstants.SPACING_LG,
  },
  sizeTitle: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeButton: {
    backgroundColor: HIGColors.systemGray6,
    paddingVertical: HIGConstants.SPACING_SM,
    paddingHorizontal: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.cornerRadiusSmall,
    marginRight: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_XS,
    alignItems: 'center',
  },
  selectedSize: {
    backgroundColor: HIGColors.systemBlue,
  },
  sizeText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
  },
  selectedSizeText: {
    color: HIGColors.white,
  },
  sizeCapacity: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    marginTop: 2,
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
  specCard: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_LG,
    marginVertical: HIGConstants.SPACING_MD,
    alignItems: 'center',
  },
  specIcon: {
    fontSize: 48,
    marginBottom: HIGConstants.SPACING_SM,
  },
  specName: {
    fontSize: HIGConstants.FONT_SIZE_H2,
    fontWeight: '600',
    color: HIGColors.label,
  },
  specBrand: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_MD,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: HIGConstants.SPACING_SM,
  },
  specLabel: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.secondaryLabel,
  },
  specValue: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '500',
    color: HIGColors.label,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
    marginTop: HIGConstants.SPACING_LG,
  },
  
  // Characteristics
  characteristicsSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  characteristicItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: HIGConstants.SPACING_XS,
  },
  bullet: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.systemBlue,
    marginRight: HIGConstants.SPACING_SM,
    lineHeight: 22,
  },
  characteristicText: {
    flex: 1,
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    lineHeight: 22,
  },
  
  // Techniques
  techniquesSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  techniqueContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  techniqueBadge: {
    backgroundColor: HIGColors.systemBlue,
    paddingVertical: HIGConstants.SPACING_XS,
    paddingHorizontal: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.cornerRadiusSmall,
    marginRight: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_XS,
  },
  techniqueText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.white,
    fontWeight: '500',
  },
  
  // Size Details
  sizesSection: {
    marginBottom: HIGConstants.SPACING_XL,
  },
  sizeDetailCard: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusSmall,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
  },
  sizeDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_XS,
  },
  sizeDetailTitle: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
  },
  sizeDetailCapacity: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.secondaryLabel,
  },
  sizeDetailFilter: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    marginBottom: 2,
  },
  sizeDetailRatio: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    marginBottom: 2,
  },
  sizeDetailDose: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
  },
});

export default EnhancedDripperSelector;