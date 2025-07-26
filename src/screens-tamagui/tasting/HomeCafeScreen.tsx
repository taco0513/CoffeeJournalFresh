import React, { useLayoutEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IOSLayout, IOSSpacing } from '../../styles/ios-hig-2024';
import { YStack, XStack, H1, Text, Button, Card, styled } from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../../stores/tastingStore';
import { HomeCafeSimpleFormTamagui } from '../../components/HomeCafeSimpleFormTamagui';

// Styled components

const ProgressBar = styled(XStack, {
  height: 3,
  backgroundColor: '$gray5',
  width: '100%',
})

const ProgressFill = styled(XStack, {
  height: '100%',
  backgroundColor: '$primary',
})


const TitleSection = styled(YStack, {
  paddingHorizontal: '$lg',
  paddingVertical: '$lg',
  backgroundColor: '$background',
  marginBottom: '$sm',
})

const Title = styled(H1, {
  fontSize: 24,
  fontWeight: '700',
  color: '$color',
  marginBottom: 4,
})

const Subtitle = styled(Text, {
  fontSize: 16,
  color: '$gray11',
  lineHeight: 22,
})

// BottomContainer는 SafeArea를 고려해서 동적으로 처리

const NextButton = styled(Button, {
  backgroundColor: '$primary',
  height: 48,
  borderRadius: '$3',
  fontSize: 17,
  fontWeight: '600',
  color: 'white',
  
  variants: {
    disabled: {
      true: {
        backgroundColor: '$gray8',
        opacity: 0.6,
    },
  },
} as const,
})

const HomeCafeScreenTamagui = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { currentTasting } = useTastingStore();

  const handleNext = () => {
    navigation.navigate('UnifiedFlavor' as never);
};

  const handleSkip = () => {
    navigation.navigate('UnifiedFlavor' as never);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '홈카페 정보',
      headerRight: () => (
        <Button
          unstyled
          onPress={handleSkip}
          pressStyle={{ opacity: 0.7 }}
        >
          <Text fontSize="$3" color="$cupBlue">건너뛰기</Text>
        </Button>
      ),
    });
  }, [navigation, handleSkip]);

  // 필수 필드 검증 - 간소화된 홈카페 모드
  const isValid = 
    currentTasting.simpleHomeCafeData?.dripper &&
    (currentTasting.simpleHomeCafeData?.recipe.coffeeAmount || 0) > 0 &&
    (currentTasting.simpleHomeCafeData?.recipe.waterAmount || 0) > 0;

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Progress Bar */}
      <ProgressBar>
        <ProgressFill width="25%" animation="lazy" />
      </ProgressBar>

      {/* Content */}
      <YStack flex={1}>
        <TitleSection>
          <Title>🏠 간단 홈카페 기록</Title>
          <Subtitle>5개 필드로 빠르게 기록해보세요</Subtitle>
        </TitleSection>

        <HomeCafeSimpleFormTamagui />
      </YStack>

      {/* Bottom Button */}
      <XStack
        padding="$lg"
        paddingBottom={Math.max(insets.bottom, IOSLayout.safeAreaBottom) + IOSSpacing.md}
        backgroundColor="$background"
        borderTopWidth={1}
        borderTopColor="$gray4"
      >
        <NextButton
          flex={1}
          disabled={!isValid}
          onPress={handleNext}
          pressStyle={{ scale: 0.98 }}
          animation="quick"
          height={48}
          justifyContent="center"
        >
          <Text
            color="white"
            fontSize="$4"
            fontWeight="600"
            textAlign="center"
          >
            다음 단계
          </Text>
        </NextButton>
      </XStack>
    </YStack>
  );
};

export default HomeCafeScreenTamagui;