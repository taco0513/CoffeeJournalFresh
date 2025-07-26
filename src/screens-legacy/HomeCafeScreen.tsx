import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../stores/tastingStore';
import { HIGColors, HIGConstants } from '../styles/common';
import { HomeCafeSimpleForm } from '../components/HomeCafeSimpleForm';
import { Header } from '../design-system/components/Header';

const HomeCafeScreen = () => {
  const navigation = useNavigation();
  const { currentTasting } = useTastingStore();

  const handleNext = () => {
    navigation.navigate('UnifiedFlavor' as never);
};

  const handleSkip = () => {
    navigation.navigate('UnifiedFlavor' as never);
};

  // 필수 필드 검증 - 간소화된 홈카페 모드
  const isValid = 
    currentTasting.simpleHomeCafeData?.dripper &&
    (currentTasting.simpleHomeCafeData?.recipe.coffeeAmount || 0) > 0 &&
    (currentTasting.simpleHomeCafeData?.recipe.waterAmount || 0) > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* 표준화된 헤더 */}
      <Header
        title="홈카페 정보"
        leftAction={{ 
          icon: '←', 
          onPress: () => navigation.goBack() 
      }}
        rightAction={{ 
          text: '건너뛰기', 
          onPress: handleSkip 
      }}
        progressPercent={25} // HomeCafe는 TastingFlow의 25% 지점
      />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>🏠 간단 홈카페 기록</Text>
          <Text style={styles.subtitle}>
            5개 필드로 빠르게 기록해보세요
          </Text>
        </View>

        <HomeCafeSimpleForm />
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

export default HomeCafeScreen;