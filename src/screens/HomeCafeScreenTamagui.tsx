import React from 'react';
import { SafeAreaView } from 'react-native';
import { YStack, XStack, H1, Text, Button, Card, styled } from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../stores/tastingStore';
import { HomeCafeSimpleFormTamagui } from '../components/HomeCafeSimpleFormTamagui';

// Styled components
const HeaderBar = styled(XStack, {
  height: 44,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  backgroundColor: '$background',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
})

const ProgressBar = styled(XStack, {
  height: 3,
  backgroundColor: '$gray5',
  width: '100%',
})

const ProgressFill = styled(XStack, {
  height: '100%',
  backgroundColor: '$primary',
})

const BackButton = styled(Text, {
  fontSize: 24,
  color: '$primary',
  fontFamily: '$body',
})

const SkipButton = styled(Text, {
  fontSize: 15,
  color: '$primary',
  fontFamily: '$body',
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

const BottomContainer = styled(XStack, {
  padding: '$lg',
  backgroundColor: '$background',
  borderTopWidth: 1,
  borderTopColor: '$gray4',
})

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
    <YStack flex={1} backgroundColor="$background">
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1}>
          {/* Header */}
          <HeaderBar>
            <BackButton onPress={() => navigation.goBack()}>←</BackButton>
            <Text fontSize={17} fontWeight="600" color="$color">
              홈카페 정보
            </Text>
            <SkipButton onPress={handleSkip}>건너뛰기</SkipButton>
          </HeaderBar>

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
          <BottomContainer>
            <NextButton
              flex={1}
              disabled={!isValid}
              onPress={handleNext}
              pressStyle={{ scale: 0.98 }}
              animation="quick"
            >
              다음 단계
            </NextButton>
          </BottomContainer>
        </YStack>
      </SafeAreaView>
    </YStack>
  );
};

export default HomeCafeScreenTamagui;