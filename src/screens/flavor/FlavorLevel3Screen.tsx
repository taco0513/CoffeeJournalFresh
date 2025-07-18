import React, { useState, useEffect } from 'react';
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
import { flavorLevel3 } from '../../data/flavorWheel';
import { flavorWheelKorean } from '../../data/flavorWheelKorean';

const FlavorLevel3Screen = () => {
  const navigation = useNavigation();
  const { selectedFlavors, setSelectedFlavors } = useTastingStore();
  const [selectedLevel3, setSelectedLevel3] = useState<string[]>(
    selectedFlavors?.map(f => f.level3).filter((item): item is string => Boolean(item)) || []
  );

  // Group level3 options by their parent level2 category
  const level2Categories = selectedFlavors?.map(f => f.level2).filter((item): item is string => Boolean(item)) || [];
  const categorizedLevel3 = level2Categories.reduce((acc, level2Item) => {
    if (level2Item) {
      const level3Options = flavorLevel3[level2Item as keyof typeof flavorLevel3] || [];
      if (level3Options.length > 0) {
        acc[level2Item] = level3Options;
      }
    }
    return acc;
  }, {} as Record<string, string[]>);

  // Check if there are any level3 options available
  const hasLevel3Options = Object.keys(categorizedLevel3).length > 0;

  // Skip to level 4 if no level 3 options
  useEffect(() => {
    if (!hasLevel3Options) {
      navigation.navigate('FlavorLevel4' as never);
    }
  }, [hasLevel3Options]);

  const handleLevel3Press = (item: string) => {
    setSelectedLevel3(prev => {
      if (prev.includes(item)) {
        return prev.filter(i => i !== item);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleNext = () => {
    if (!isNextEnabled) return;
    
    // Build updated flavor paths with level3
    const existingPaths = selectedFlavors || [];
    const newFlavors: FlavorPath[] = [];
    
    existingPaths.forEach(flavor => {
      const relatedLevel3 = selectedLevel3.filter(l3 => {
        const level3Options = flavor.level2 ? flavorLevel3[flavor.level2 as keyof typeof flavorLevel3] || [] : [];
        return level3Options.includes(l3);
      });
      
      if (relatedLevel3.length > 0) {
        relatedLevel3.forEach(level3 => {
          newFlavors.push({ ...flavor, level3 });
        });
      } else {
        newFlavors.push(flavor);
      }
    });
    
    setSelectedFlavors(newFlavors);
    navigation.navigate('FlavorLevel4' as never);
  };

  const handleSkip = () => {
    navigation.navigate('FlavorLevel4' as never);
  };

  const isNextEnabled = selectedLevel3.length > 0;

  // Don't render if no options available
  if (!hasLevel3Options) {
    return null;
  }

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
        <Text style={styles.navigationTitle}>구체적인 맛 선택</Text>
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
        <View style={[styles.progressFill, { width: '83%' }]} />
      </View>

      {/* 제목 및 설명 */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>구체적인 맛 선택</Text>
        <Text style={styles.subtitle}>원하는 맛을 선택해주세요</Text>
      </View>

      {/* Level3 options by category */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {Object.entries(categorizedLevel3).map(([category, items]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.sectionHeader}>
              {flavorWheelKorean.translations[category as keyof typeof flavorWheelKorean.translations] || category}
            </Text>
            <View style={styles.gridContainer}>
              {items.map((item) => {
                const isSelected = selectedLevel3.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.categoryButton,
                      isSelected && styles.selectedButton,
                    ]}
                    onPress={() => handleLevel3Press(item)}
                    hitSlop={hitSlop.small}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        isSelected && styles.selectedText,
                      ]}
                    >
                      {flavorWheelKorean.translations[item as keyof typeof flavorWheelKorean.translations] || item}
                    </Text>
                    <Text
                      style={[
                        styles.categorySubtext,
                        isSelected && styles.selectedSubtext,
                      ]}
                    >
                      ({item})
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

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - HIGConstants.SPACING_LG * 2 - HIGConstants.SPACING_SM * 2) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
  },
  navigationBar: {
    height: HIGConstants.MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: HIGColors.systemBackground,
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
    marginHorizontal: -HIGConstants.SPACING_XS,
  },
  categoryButton: {
    width: ITEM_WIDTH,
    paddingVertical: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_SM,
    margin: HIGConstants.SPACING_XS,
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  selectedButton: {
    backgroundColor: HIGColors.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '400',
    color: HIGColors.label,
    textAlign: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: HIGConstants.SPACING_XS,
    right: HIGConstants.SPACING_XS,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bottomContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_MD,
    paddingBottom: HIGConstants.SPACING_LG,
    backgroundColor: HIGColors.systemBackground,
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

export default FlavorLevel3Screen;