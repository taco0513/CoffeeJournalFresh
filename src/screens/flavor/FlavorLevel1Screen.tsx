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
import { flavorWheelKorean } from '../../data/flavorWheelKorean';
import {
  HIGColors,
  HIGConstants,
  hitSlop,
  commonButtonStyles,
  commonTextStyles,
} from '../../styles/common';
import { NavigationButton } from '../../components/common';

const FlavorLevel1Screen = () => {
  const navigation = useNavigation();
  const { selectedFlavors, setSelectedFlavors } = useTastingStore();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    // Get unique level1 categories from existing selections
    const level1Set = new Set(selectedFlavors?.map(f => f.level1).filter((item): item is string => Boolean(item)) || []);
    return Array.from(level1Set);
  });

  const categories = [
    'Fruity', 'Sour/Fermented', 'Green/Vegetative',
    'Other', 'Roasted', 'Spices',
    'Nutty/Cocoa', 'Sweet', 'Floral'
  ];

  // 화면 크기에 따른 동적 계산
  const screenWidth = Dimensions.get('window').width;
  const padding = 20;
  const gap = HIGConstants.SPACING_SM;
  const itemsPerRow = 3;
  const availableWidth = screenWidth - (padding * 2) - (gap * (itemsPerRow - 1));
  const itemWidth = Math.max(HIGConstants.MIN_TOUCH_TARGET * 1.5, availableWidth / itemsPerRow);

  const handleCategoryPress = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleNext = () => {
    if (!isNextEnabled) return;
    
    // Preserve existing flavor paths and update level1 selections
    const existingFlavors = selectedFlavors || [];
    const newFlavors = selectedCategories.map(category => {
      // Check if this category already exists in selectedFlavors
      const existing = existingFlavors.find(f => f.level1 === category);
      return existing || { level1: category };
    });
    
    // Remove any flavors that are no longer selected at level1
    const filteredFlavors = newFlavors.filter(f => 
      selectedCategories.includes(f.level1!)
    );
    
    setSelectedFlavors(filteredFlavors);
    navigation.navigate('FlavorLevel2' as never);
  };

  const isNextEnabled = selectedCategories.length > 0;

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
        <Text style={styles.navigationTitle}>플레이버 선택</Text>
        <Text style={styles.progressIndicator}>4/6</Text>
      </View>
      
      {/* 진행 상태 바 */}
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 제목 및 설명 */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>맛 카테고리 선택</Text>
          <Text style={styles.subtitle}>감지된 맛 카테고리를 모두 선택하세요</Text>
        </View>

        {/* Categories Grid */}
        <View style={styles.gridContainer}>
          {categories.map((category, index) => {
            const isSelected = selectedCategories.includes(category);
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  { width: itemWidth, height: Math.max(HIGConstants.MIN_TOUCH_TARGET * 1.5, itemWidth) },
                  isSelected && styles.selectedButton,
                ]}
                onPress={() => handleCategoryPress(category)}
                hitSlop={hitSlop.small}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.selectedText,
                  ]}
                >
                  {flavorWheelKorean.level1[category as keyof typeof flavorWheelKorean.level1]}
                </Text>
                <Text
                  style={[
                    styles.categorySubtext,
                    isSelected && styles.selectedText,
                  ]}
                >
                  ({category})
                </Text>
                {isSelected && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 다음 버튼 */}
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
      </ScrollView>
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
    width: '67%', // 4/6 = 67%
    backgroundColor: HIGColors.blue,
  },
  scrollContainer: {
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
    marginBottom: HIGConstants.SPACING_XL,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: HIGConstants.SPACING_XL,
    gap: HIGConstants.SPACING_SM,
  },
  categoryButton: {
    minHeight: HIGConstants.MIN_TOUCH_TARGET * 1.5,
    minWidth: HIGConstants.MIN_TOUCH_TARGET * 1.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: HIGColors.gray4,
    borderRadius: HIGConstants.BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    padding: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_SM,
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
    fontSize: HIGConstants.FONT_SIZE_SMALL,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
    lineHeight: 16,
  },
  categorySubtext: {
    fontSize: 11, // HIG 최소 크기 준수
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 13,
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
  nextButton: {
    width: '100%',
    marginTop: HIGConstants.SPACING_LG,
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
});

export default FlavorLevel1Screen;