import React, { useState, useRef } from 'react';
import { ScrollView, Dimensions, SafeAreaView } from 'react-native';
import {
  View,
  Text,
  Button,
  YStack,
  XStack,
  H1,
  H2,
  Paragraph,
  styled,
  useTheme,
  AnimatePresence,
  GetProps,
} from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../types/navigation';

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
    backgroundColor: '$cream',
  },
  {
    title: '향미 분석 시스템',
    description: 'SCA 플레이버 휠 기반의\n전문적인 향미 분석을 경험하세요',
    emoji: '🎯',
    backgroundColor: '$green2',
  },
  {
    title: '커뮤니티와 함께',
    description: '베타 테스터로서 앱을 함께 만들어가요\n흔들어서 피드백을 보내주세요!',
    emoji: '🚀',
    backgroundColor: '$blue2',
  },
];

// Styled Components
const Container = styled(View, {
  name: 'OnboardingContainer',
  flex: 1,
  backgroundColor: '$background',
});

const SkipButton = styled(Button, {
  name: 'SkipButton',
  position: 'absolute',
  top: 60,
  right: 20,
  zIndex: 10,
  backgroundColor: 'transparent',
  borderWidth: 0,
  paddingHorizontal: '$sm',
  paddingVertical: '$sm',
  pressStyle: {
    scale: 0.95,
    opacity: 0.7,
  },
  animation: 'quick',
});

const SkipText = styled(Text, {
  name: 'SkipText',
  fontSize: '$4',
  color: '$gray11',
  fontWeight: '500',
});

const Slide = styled(YStack, {
  name: 'OnboardingSlide',
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  justifyContent: 'center',
  alignItems: 'center',
  animation: 'lazy',
});

const SlideContent = styled(YStack, {
  name: 'SlideContent',
  alignItems: 'center',
  paddingHorizontal: '$xl',
  gap: '$lg',
  animation: 'bouncy',
  enterStyle: {
    opacity: 0,
    y: 50,
    scale: 0.9,
  },
});

const SlideEmoji = styled(Text, {
  name: 'SlideEmoji',
  fontSize: 80,
  textAlign: 'center',
  animation: 'bouncy',
  enterStyle: {
    scale: 0.5,
    rotate: '-10deg',
  },
  exitStyle: {
    scale: 0.5,
    rotate: '10deg',
  },
});

const SlideTitle = styled(H1, {
  name: 'SlideTitle',
  fontSize: '$8',
  fontWeight: '700',
  color: '$color',
  textAlign: 'center',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    y: 30,
  },
});

const SlideDescription = styled(Paragraph, {
  name: 'SlideDescription',
  fontSize: '$5',
  color: '$gray11',
  textAlign: 'center',
  lineHeight: '$7',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    y: 40,
  },
});

const BottomContainer = styled(YStack, {
  name: 'BottomContainer',
  position: 'absolute',
  bottom: 50,
  left: 0,
  right: 0,
  alignItems: 'center',
  gap: '$lg',
  paddingHorizontal: '$lg',
});

const Pagination = styled(XStack, {
  name: 'Pagination',
  gap: '$sm',
  alignItems: 'center',
});

const PaginationDot = styled(View, {
  name: 'PaginationDot',
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '$gray6',
  animation: 'bouncy',
  variants: {
    active: {
      true: {
        backgroundColor: '$cupBlue',
        width: 24,
        scale: 1.2,
      },
      false: {
        scale: 1,
      },
    },
  } as const,
});

const NextButton = styled(Button, {
  name: 'NextButton',
  backgroundColor: '$cupBlue',
  paddingHorizontal: '$xxl',
  paddingVertical: '$md',
  borderRadius: '$4',
  borderWidth: 0,
  minWidth: 120,
  animation: 'bouncy',
  pressStyle: {
    backgroundColor: '$cupBlueDark',
    scale: 0.95,
  },
  enterStyle: {
    opacity: 0,
    y: 30,
    scale: 0.9,
  },
});

const NextButtonText = styled(Text, {
  name: 'NextButtonText',
  color: 'white',
  fontSize: '$5',
  fontWeight: '600',
});

export type OnboardingScreenProps = GetProps<typeof Container>;

const OnboardingScreen: React.FC<OnboardingScreenProps> = () => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(slideIndex);
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasLaunched', 'true');
    // Force a re-render of the app by reloading
    // This is a temporary solution - ideally we'd use a context or state management
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Force reload the app to update the navigation state
      // @ts-ignore
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    }
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
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Skip Button */}
        <SkipButton unstyled onPress={handleSkip}>
          <SkipText>건너뛰기</SkipText>
        </SkipButton>

        {/* Slides */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {slides.map((slide, index) => (
            <Slide
              key={index}
              backgroundColor={slide.backgroundColor}
            >
              <AnimatePresence key={`slide-${index}-${currentIndex}`}>
                {Math.abs(currentIndex - index) <= 1 && (
                  <SlideContent
                    animation="bouncy"
                    animateOnly={['opacity', 'transform']}
                  >
                    <SlideEmoji
                      animation="bouncy"
                      animateOnly={['transform']}
                    >
                      {slide.emoji}
                    </SlideEmoji>
                    
                    <SlideTitle
                      animation="lazy"
                      animateOnly={['opacity', 'transform']}
                    >
                      {slide.title}
                    </SlideTitle>
                    
                    <SlideDescription
                      animation="lazy"
                      animateOnly={['opacity', 'transform']}
                    >
                      {slide.description}
                    </SlideDescription>
                  </SlideContent>
                )}
              </AnimatePresence>
            </Slide>
          ))}
        </ScrollView>

        {/* Bottom Container */}
        <BottomContainer>
          {/* Pagination Dots */}
          <Pagination>
            {slides.map((_, index) => (
              <PaginationDot
                key={index}
                active={index === currentIndex}
                animation="bouncy"
                animateOnly={['backgroundColor', 'transform']}
              />
            ))}
          </Pagination>

          {/* Next Button */}
          <NextButton
            onPress={handleNext}
            animation="bouncy"
            animateOnly={['opacity', 'transform']}
          >
            <NextButtonText>
              {currentIndex === slides.length - 1 ? '시작하기' : '다음'}
            </NextButtonText>
          </NextButton>
        </BottomContainer>
      </SafeAreaView>
    </Container>
  );
};

export default OnboardingScreen;