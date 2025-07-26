import React, { useLayoutEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IOSLayout, IOSSpacing } from '../../styles/ios-hig-2024';
import { YStack, XStack, H1, Text, Button, Card, styled } from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../../stores/tastingStore';
import { HomeCafeSimpleFormTamagui } from '../../components/HomeCafeSimpleFormTamagui';
import { FloatingButton } from '../../components-tamagui/buttons/FloatingButton';

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
  paddingTop: '$md',
  paddingBottom: '$sm',
  backgroundColor: '$background',
})

const Title = styled(H1, {
  fontSize: 20,
  fontWeight: '600',
  color: '$color',
  marginBottom: 2,
})

const Subtitle = styled(Text, {
  fontSize: 14,
  color: '$gray11',
  lineHeight: 18,
})

// BottomContainer는 SafeArea를 고려해서 동적으로 처리

const NextButton = styled(Button, {
  backgroundColor: '$primary',
  height: '$buttonHeight', // 48px
  borderRadius: '$3',
  fontSize: '$5', // 20px (적절한 버튼 텍스트 크기)
  fontWeight: '600',
  color: 'white',
  
  variants: {
    disabled: {
      true: {
        backgroundColor: '$gray8',
        opacity: '$opacityDisabled', // 0.6
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
        <ProgressFill width="43%" />
      </ProgressBar>

      {/* Content */}
      <YStack flex={1}>
        <TitleSection>
          <Title> 간단 홈카페 기록</Title>
          <Subtitle>5개 필드로 빠르게 기록해보세요</Subtitle>
        </TitleSection>

        <HomeCafeSimpleFormTamagui />
      </YStack>

      {/* Floating Bottom Button */}
      <FloatingButton
        title="다음 단계"
        isValid={isValid}
        onPress={handleNext}
      />
    </YStack>
  );
};

export default HomeCafeScreenTamagui;