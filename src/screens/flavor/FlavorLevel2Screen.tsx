import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../../stores/tastingStore';
import {
  hitSlop,
  HIGColors,
  HIGConstants,
  commonButtonStyles,
  commonTextStyles,
} from '../../styles/common';
import { NavigationButton } from '../../components/common';

interface FlavorPath {
  level1?: string;
  level2?: string;
  level3?: string;
  level4?: string;
}
import { flavorWheel } from '../../data/flavorWheel';
import { flavorWheelKorean } from '../../data/flavorWheelKorean';

const FlavorLevel2Screen = () => {
  const navigation = useNavigation();
  const { selectedFlavors, setSelectedFlavors } = useTastingStore();
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    selectedFlavors?.map(f => f.level2).filter((item): item is string => Boolean(item)) || []
  );

  // Group subcategories by their parent category
  const level1Categories = selectedFlavors?.map(f => f.level1).filter((item): item is string => Boolean(item)) || [];
  const categorizedSubcategories = level1Categories.reduce((acc, category) => {
    if (category) {
      const subcategories = flavorWheel[category as keyof typeof flavorWheel] || [];
      if (subcategories.length > 0) {
        acc[category] = subcategories;
      }
    }
    return acc;
  }, {} as Record<string, string[]>);

  const handleSubcategoryPress = (subcategory: string) => {
    setSelectedSubcategories(prev => {
      if (prev.includes(subcategory)) {
        return prev.filter(c => c !== subcategory);
      } else {
        return [...prev, subcategory];
      }
    });
  };

  const handleNext = () => {
    if (!isNextEnabled) return;
    
    // Level 1 선택값들과 Level 2를 결합해서 저장
    const level1Categories = selectedFlavors?.map(f => f.level1).filter(Boolean) || [];
    const newFlavors: FlavorPath[] = [];
    
    // Level 1 카테고리별로 Level 2 서브카테고리 매핑
    level1Categories.forEach(level1 => {
      const relatedSubcategories = selectedSubcategories.filter(sub => 
        (flavorWheel[level1 as keyof typeof flavorWheel] || []).includes(sub)
      );
      
      if (relatedSubcategories.length > 0) {
        relatedSubcategories.forEach(level2 => {
          newFlavors.push({ level1, level2 });
        });
      } else {
        newFlavors.push({ level1 });
      }
    });
    
    setSelectedFlavors(newFlavors);
    navigation.navigate('FlavorLevel3' as never);
  };

  const handleSkip = () => {
    navigation.navigate('FlavorLevel3' as never);
  };

  const isNextEnabled = selectedSubcategories.length > 0;

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
        <Text style={styles.navigationTitle}>세부 맛 선택</Text>
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkip}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.skipButtonText}>건너뛰기</Text>
        </TouchableOpacity>
      </View>
      
      {/* 진행 상태 바 */}
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>

      {/* 제목 및 설명 */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>세부 맛 선택</Text>
        <Text style={styles.subtitle}>원하는 세부 맛을 선택해보세요</Text>
      </View>

      {/* 카테고리별 서브카테고리 */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {Object.entries(categorizedSubcategories).map(([category, subcategories]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.sectionHeader}>
              {flavorWheelKorean.level1[category as keyof typeof flavorWheelKorean.level1] || category}
            </Text>
            <View style={styles.gridContainer}>
              {subcategories.map((subcategory) => {
                const isSelected = selectedSubcategories.includes(subcategory);
                return (
                  <TouchableOpacity
                    key={subcategory}
                    style={[
                      styles.categoryButton,
                      isSelected && styles.selectedButton,
                    ]}
                    onPress={() => handleSubcategoryPress(subcategory)}
                    hitSlop={hitSlop.small}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        isSelected && styles.selectedText,
                      ]}
                    >
                      {flavorWheelKorean.translations[subcategory as keyof typeof flavorWheelKorean.translations] || subcategory}
                    </Text>
                    <Text
                      style={[
                        styles.categoryText,
                        isSelected && styles.selectedText,
                      ]}
                    >
                      ({subcategory})
                    </Text>
                    {isSelected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 다음 버튼 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[
            commonButtonStyles.buttonPrimary, 
            commonButtonStyles.buttonLarge, 
            styles.nextButton,
            !isNextEnabled && commonButtonStyles.buttonDisabled
          ]}
          onPress={handleNext}
          disabled={!isNextEnabled}
          activeOpacity={0.8}
        >
          <Text style={[
            commonTextStyles.buttonTextLarge, 
            styles.nextButtonText,
            !isNextEnabled && commonTextStyles.buttonTextDisabled
          ]}>
            다음
          </Text>
        </TouchableOpacity>
      </View>
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
  skipButton: {
    minWidth: HIGConstants.MIN_TOUCH_TARGET,
    height: HIGConstants.MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '400',
    color: HIGColors.blue,
  },
  progressBar: {
    height: 4,
    backgroundColor: HIGColors.gray5,
  },
  progressFill: {
    height: 4,
    width: '67%', // 4/6 = 67%
    backgroundColor: HIGColors.blue,
  },
  headerSection: {
    paddingTop: HIGConstants.SPACING_LG,
    paddingBottom: HIGConstants.SPACING_LG,
    paddingHorizontal: HIGConstants.SPACING_LG,
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
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  categorySection: {
    marginBottom: HIGConstants.SPACING_XL,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_XS,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -HIGConstants.SPACING_XS,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: HIGColors.gray4,
    borderRadius: HIGConstants.BORDER_RADIUS_LARGE,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    margin: HIGConstants.SPACING_XS,
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedButton: {
    backgroundColor: HIGColors.blue,
    borderColor: HIGColors.blue,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryText: {
    fontSize: HIGConstants.FONT_SIZE_MEDIUM,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
  },
  selectedText: {
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
  bottomContainer: {
    padding: HIGConstants.SPACING_LG,
    borderTopWidth: 0.5,
    borderTopColor: HIGColors.gray4,
  },
  nextButton: {
    width: '100%',
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
});

export default FlavorLevel2Screen;