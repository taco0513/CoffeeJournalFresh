import React from 'react';
import { SafeAreaView } from 'react-native';
import {
  View,
  Text,
  Button,
  YStack,
  XStack,
  Card,
  H1,
  H2,
  Paragraph,
  styled,
  useTheme,
  AnimatePresence,
  GetProps,
} from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../../stores/tastingStore';
import { LabModeForm } from '../../components/LabModeForm';

// Styled Components
const Container = styled(View, {
  name: 'LabModeContainer',
  flex: 1,
  backgroundColor: '$background',
});

const Header = styled(XStack, {
  name: 'LabModeHeader',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
});

const BackButton = styled(Button, {
  name: 'BackButton',
  backgroundColor: 'transparent',
  borderWidth: 0,
  paddingHorizontal: '$sm',
  pressStyle: {
    opacity: 0.7,
    scale: 0.95,
},
});

const HeaderTitle = styled(H1, {
  name: 'HeaderTitle',
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
});

const SkipButton = styled(Button, {
  name: 'SkipButton',
  backgroundColor: 'transparent',
  borderWidth: 0,
  paddingHorizontal: '$sm',
  pressStyle: {
    opacity: 0.7,
    scale: 0.95,
},
});

const SkipText = styled(Text, {
  name: 'SkipText',
  fontSize: '$4',
  color: '$gray11',
});

const ProgressContainer = styled(XStack, {
  name: 'ProgressContainer',
  alignItems: 'center',
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
  gap: '$md',
});

const ProgressBar = styled(View, {
  name: 'ProgressBar',
  flex: 1,
  height: 4,
  backgroundColor: '$gray4',
  borderRadius: 2,
});

const ProgressFill = styled(View, {
  name: 'ProgressFill',
  height: '100%',
  backgroundColor: '$cupBlue',
  borderRadius: 2,
  animation: 'lazy',
  enterStyle: {
    width: '0%',
},
});

const ProgressText = styled(Text, {
  name: 'ProgressText',
  fontSize: '$3',
  fontWeight: '600',
  color: '$cupBlue',
});

const Content = styled(YStack, {
  name: 'Content',
  flex: 1,
  paddingHorizontal: '$lg',
  paddingTop: '$lg',
  gap: '$lg',
});

const TitleSection = styled(YStack, {
  name: 'TitleSection',
  alignItems: 'center',
  gap: '$md',
  paddingBottom: '$lg',
});

const Title = styled(H1, {
  name: 'Title',
  fontSize: '$7',
  fontWeight: '700',
  color: '$color',
  textAlign: 'center',
});

const Subtitle = styled(Paragraph, {
  name: 'Subtitle',
  fontSize: '$4',
  color: '$gray11',
  textAlign: 'center',
  lineHeight: '$6',
});

const FormContainer = styled(Card, {
  name: 'FormContainer',
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderWidth: 0.5,
  borderRadius: '$4',
  padding: '$lg',
  flex: 1,
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    y: 30,
    scale: 0.95,
},
});

const BottomContainer = styled(View, {
  name: 'BottomContainer',
  backgroundColor: '$background',
  borderTopWidth: 0.5,
  borderTopColor: '$borderColor',
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
});

const NextButton = styled(Button, {
  name: 'NextButton',
  backgroundColor: '$cupBlue',
  color: 'white',
  borderRadius: '$3',
  paddingVertical: '$md',
  fontSize: '$4',
  fontWeight: '600',
  width: '100%',
  animation: 'bouncy',
  variants: {
    disabled: {
      true: {
        backgroundColor: '$gray6',
        color: '$gray10',
    },
  },
} as const,
  pressStyle: {
    backgroundColor: '$cupBlueDark',
    scale: 0.98,
},
});

const ValidationMessage = styled(XStack, {
  name: 'ValidationMessage',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$sm',
  paddingVertical: '$sm',
  animation: 'bouncy',
  enterStyle: {
    opacity: 0,
    y: 10,
},
});

const ValidationIcon = styled(Text, {
  name: 'ValidationIcon',
  fontSize: 16,
});

const ValidationText = styled(Text, {
  name: 'ValidationText',
  fontSize: '$3',
  color: '$gray11',
  textAlign: 'center',
});

const InfoCard = styled(Card, {
  name: 'InfoCard',
  backgroundColor: '$blue2',
  borderColor: '$blue8',
  borderWidth: 1,
  borderRadius: '$3',
  padding: '$md',
  marginBottom: '$lg',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    x: -20,
},
});

const InfoText = styled(Text, {
  name: 'InfoText',
  fontSize: '$3',
  color: '$blue11',
  lineHeight: '$5',
});

export type LabModeScreenProps = GetProps<typeof Container>;

const LabModeScreen: React.FC<LabModeScreenProps> = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { currentTasting } = useTastingStore();

  const handleNext = () => {
    navigation.navigate('UnifiedFlavor' as never);
};

  const handleSkip = () => {
    navigation.navigate('UnifiedFlavor' as never);
};

  // 필수 필드 검증 - 랩 모드
  const isValid = 
    currentTasting.labModeData?.equipment.dripper &&
    currentTasting.labModeData?.equipment.filter &&
    (currentTasting.labModeData?.recipe.doseIn || 0) > 0 &&
    (currentTasting.labModeData?.recipe.waterAmount || 0) > 0 &&
    (currentTasting.labModeData?.recipe.waterTemp || 0) > 0 &&
    (currentTasting.labModeData?.recipe.totalBrewTime || 0) > 0;

  const requiredFields = [
    '드리퍼 선택',
    '필터 타입',
    '원두량',
    '물의 양',
    '물 온도',
    '총 추출 시간'
  ];

  const getCompletedFieldsCount = () => {
    let count = 0;
    if (currentTasting.labModeData?.equipment.dripper) count++;
    if (currentTasting.labModeData?.equipment.filter) count++;
    if ((currentTasting.labModeData?.recipe.doseIn || 0) > 0) count++;
    if ((currentTasting.labModeData?.recipe.waterAmount || 0) > 0) count++;
    if ((currentTasting.labModeData?.recipe.waterTemp || 0) > 0) count++;
    if ((currentTasting.labModeData?.recipe.totalBrewTime || 0) > 0) count++;
    return count;
};

  const completedFields = getCompletedFieldsCount();
  const progressPercentage = (completedFields / requiredFields.length) * 100;

  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <Header>
          <BackButton unstyled onPress={() => navigation.goBack()}>
            <Text color="$cupBlue" fontSize="$6">←</Text>
          </BackButton>
          <HeaderTitle>랩 모드</HeaderTitle>
          <SkipButton unstyled onPress={handleSkip}>
            <SkipText>건너뛰기</SkipText>
          </SkipButton>
        </Header>

        {/* Progress Bar */}
        <ProgressContainer>
          <ProgressBar>
            <ProgressFill 
              width={`${progressPercentage}%`}
              animation="lazy"
              animateOnly={['width']}
            />
          </ProgressBar>
          <ProgressText>2/7</ProgressText>
        </ProgressContainer>

        {/* Content */}
        <Content>
          <AnimatePresence>
            {/* Title Section */}
            <TitleSection
              animation="lazy"
              animateOnly={['opacity', 'transform']}
            >
              <Title>🧪 전문가 수준 분석</Title>
              <Subtitle>
                모든 추출 변수를 상세히 기록하고 분석해보세요
              </Subtitle>
            </TitleSection>

            {/* Info Card */}
            <InfoCard
              animation="lazy"
              animateOnly={['opacity', 'transform']}
            >
              <InfoText>
                랩 모드는 큐핑 프로토콜과 정밀한 측정을 통해 전문가 수준의 분석을 제공합니다. 
                모든 변수를 정확히 기록하여 재현 가능한 결과를 얻어보세요.
              </InfoText>
            </InfoCard>

            {/* Form Container */}
            <FormContainer
              animation="lazy"
              animateOnly={['opacity', 'transform']}
            >
              <LabModeForm />
            </FormContainer>

            {/* Validation Message */}
            {!isValid && completedFields > 0 && (
              <ValidationMessage
                animation="bouncy"
                animateOnly={['opacity', 'transform']}
              >
                <ValidationIcon>📋</ValidationIcon>
                <ValidationText>
                  {completedFields}/{requiredFields.length}개 필드 완료됨
                </ValidationText>
              </ValidationMessage>
            )}
          </AnimatePresence>
        </Content>

        {/* Bottom Button */}
        <BottomContainer>
          <AnimatePresence>
            {!isValid && (
              <ValidationMessage
                animation="bouncy"
                animateOnly={['opacity', 'transform']}
              >
                <ValidationIcon>⚠️</ValidationIcon>
                <ValidationText>
                  필수 항목을 모두 입력해주세요
                </ValidationText>
              </ValidationMessage>
            )}
          </AnimatePresence>
          
          <NextButton
            disabled={!isValid}
            onPress={handleNext}
            animation="bouncy"
            animateOnly={['backgroundColor', 'transform']}
          >
            다음 단계
          </NextButton>
        </BottomContainer>
      </SafeAreaView>
    </Container>
  );
};

export default LabModeScreen;