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
import { flavorLevel4 } from '../../data/flavorWheel';

const FlavorLevel4Screen = () => {
  const navigation = useNavigation();
  const { selectedFlavors, setSelectedFlavors } = useTastingStore();
  const [selectedLevel4, setSelectedLevel4] = useState<string[]>(
    selectedFlavors?.map(f => f.level4).filter((item): item is string => Boolean(item)) || []
  );

  // Group level4 options by their parent level3 category
  const level3Categories = selectedFlavors?.map(f => f.level3).filter((item): item is string => Boolean(item)) || [];
  const categorizedLevel4 = level3Categories.reduce((acc, level3Item) => {
    if (level3Item) {
      const level4Options = flavorLevel4[level3Item as keyof typeof flavorLevel4] || [];
      if (level4Options.length > 0) {
        acc[level3Item] = level4Options;
      }
    }
    return acc;
  }, {} as Record<string, string[]>);

  // Check if there are any level4 options available
  const hasLevel4Options = Object.keys(categorizedLevel4).length > 0;

  const handleLevel4Press = (item: string) => {
    setSelectedLevel4(prev => {
      if (prev.includes(item)) {
        return prev.filter(i => i !== item);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleNext = () => {
    // Build updated flavor paths with level4
    const existingPaths = selectedFlavors || [];
    const newFlavors: FlavorPath[] = [];
    
    existingPaths.forEach(flavor => {
      const relatedLevel4 = selectedLevel4.filter(l4 => {
        const level4Options = flavor.level3 ? flavorLevel4[flavor.level3 as keyof typeof flavorLevel4] || [] : [];
        return level4Options.includes(l4);
      });
      
      if (relatedLevel4.length > 0) {
        relatedLevel4.forEach(level4 => {
          newFlavors.push({ ...flavor, level4 });
        });
      } else {
        newFlavors.push(flavor);
      }
    });
    
    setSelectedFlavors(newFlavors);
    navigation.navigate('Sensory' as never);
  };

  const handleSkip = () => {
    navigation.navigate('Sensory' as never);
  };

  const isNextEnabled = selectedLevel4.length > 0 || !hasLevel4Options;

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
        <Text style={styles.navigationTitle}>세부 설명 선택</Text>
        {hasLevel4Options ? (
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkip}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.skipButtonText}>건너뛰기</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.skipButton} />
        )}
      </View>
      
      {/* 진행 상태 바 */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '100%' }]} />
      </View>

      {/* 제목 및 설명 */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>세부 설명 선택</Text>
        <Text style={styles.subtitle}>
          {hasLevel4Options ? '원하는 세부 설명을 선택해주세요' : '선택할 수 있는 세부 설명이 없습니다'}
        </Text>
      </View>

      {/* Content */}
      {hasLevel4Options ? (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {Object.entries(categorizedLevel4).map(([category, items]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.sectionHeader}>{category} 하위</Text>
              <View style={styles.gridContainer}>
                {items.map((item) => {
                  const isSelected = selectedLevel4.includes(item);
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.categoryButton,
                        isSelected && styles.selectedButton,
                      ]}
                      onPress={() => handleLevel4Press(item)}
                      hitSlop={hitSlop.small}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          isSelected && styles.selectedText,
                        ]}
                      >
                        {item}
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
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            선택하신 플레이버에 대한 세부 설명이 없습니다.
          </Text>
        </View>
      )}

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
            {hasLevel4Options ? '다음' : '완료'}
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  emptyStateText: {
    fontSize: 17,
    fontWeight: '400',
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
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

export default FlavorLevel4Screen;