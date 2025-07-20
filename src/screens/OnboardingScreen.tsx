import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HIGColors, HIGConstants } from '../styles/common';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlide {
  title: string;
  description: string;
  emoji: string;
  backgroundColor: string;
}

const slides: OnboardingSlide[] = [
  {
    title: '커피 취향 발견',
    description: '개인의 고유한 커피 취향을 발견하고\n데이터 기반 인사이트로 성장해보세요',
    emoji: '☕',
    backgroundColor: '#FFF8DC',
  },
  {
    title: '향미 분석 시스템',
    description: 'SCA 플레이버 휠 기반의\n전문적인 향미 분석을 경험하세요',
    emoji: '🎯',
    backgroundColor: '#E8F5E8',
  },
  {
    title: '커뮤니티와 함께',
    description: '베타 테스터로서 앱을 함께 만들어가요\n흔들어서 피드백을 보내주세요!',
    emoji: '🚀',
    backgroundColor: '#E3F2FD',
  },
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(slideIndex);
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.navigate('Auth' as never);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      handleSkip();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>건너뛰기</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide, index) => (
          <View
            key={index}
            style={[
              styles.slide,
              { backgroundColor: slide.backgroundColor },
            ]}
          >
            <View style={styles.slideContent}>
              <Text style={styles.emoji}>{slide.emoji}</Text>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1 ? '시작하기' : '다음'}
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
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: HIGConstants.SPACING_SM,
  },
  skipText: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_XL,
  },
  emoji: {
    fontSize: 80,
    marginBottom: HIGConstants.SPACING_XL,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 26,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: HIGConstants.SPACING_LG,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: HIGColors.gray4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: HIGColors.systemBrown,
    width: 24,
  },
  nextButton: {
    backgroundColor: HIGColors.systemBrown,
    paddingHorizontal: HIGConstants.SPACING_XL * 2,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.BORDER_RADIUS_LG,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OnboardingScreen;