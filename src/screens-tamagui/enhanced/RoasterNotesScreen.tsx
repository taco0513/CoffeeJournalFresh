import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  Button,
  YStack,
  XStack,
  Card,
  TextArea,
  H1,
  H2,
  H3,
  Paragraph,
  SizableText,
  styled,
  useTheme,
  GetProps,
} from 'tamagui';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTastingStore } from '../../stores/tastingStore';

// Styled Components
const Container = styled(View, {
  name: 'RoasterNotesContainer',
  flex: 1,
  backgroundColor: '$background',
});

const ProgressContainer = styled(View, {
  name: 'ProgressContainer',
  height: 3,
  backgroundColor: '$gray4',
  overflow: 'hidden',
});

const ProgressFill = styled(View, {
  name: 'ProgressFill',
  height: '100%',
  width: '86%',
  backgroundColor: '$cupBlue',
});

const ContentScrollView = styled(ScrollView, {
  name: 'ContentScrollView',
  flex: 1,
  paddingHorizontal: '$lg',
});

const HeaderSection = styled(YStack, {
  name: 'HeaderSection',
  paddingTop: '$xl',
  paddingBottom: '$lg',
  alignItems: 'center',
});

const MainTitle = styled(H1, {
  name: 'MainTitle',
  fontSize: '$8',
  fontWeight: '700',
  color: '$color',
  textAlign: 'center',
  marginBottom: '$md',
});

const Subtitle = styled(Paragraph, {
  name: 'Subtitle',
  size: '$5',
  color: '$gray11',
  textAlign: 'center',
  marginBottom: '$md',
  lineHeight: '$6',
});

const TipText = styled(SizableText, {
  name: 'TipText',
  size: '$4',
  color: '$cupBlue',
  textAlign: 'center',
  marginTop: '$sm',
  fontWeight: '500',
});

const OCRNoticeCard = styled(Card, {
  name: 'OCRNoticeCard',
  backgroundColor: '$cupBlue',
  borderRadius: '$4',
  padding: '$md',
  marginBottom: '$lg',
  alignItems: 'center',
  pressStyle: {
    scale: 0.98,
},
});

const OCRNoticeText = styled(SizableText, {
  name: 'OCRNoticeText',
  size: '$3',
  color: 'white',
  textAlign: 'center',
  fontWeight: '500',
});

const InputSection = styled(YStack, {
  name: 'InputSection',
  flex: 1,
  marginBottom: '$lg',
});

const StyledTextArea = styled(TextArea, {
  name: 'StyledTextArea',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$4',
  padding: '$md',
  fontSize: '$4',
  color: '$color',
  minHeight: 200,
  backgroundColor: '$background',
  lineHeight: '$6',
  focusStyle: {
    borderColor: '$cupBlue',
    backgroundColor: '$backgroundFocus',
},
  variants: {
    hasContent: {
      true: {
        borderColor: '$cupBlueLight',
    },
  },
} as const,
});

const BottomContainer = styled(YStack, {
  name: 'BottomContainer',
  padding: '$lg',
  backgroundColor: '$background',
  borderTopWidth: 0.5,
  borderTopColor: '$borderColor',
});

const NextButton = styled(Button, {
  name: 'NextButton',
  backgroundColor: '$primary',
  height: '$buttonHeight', // 48px
  borderRadius: '$3',
  fontSize: '$5', // 20px (적절한 버튼 텍스트 크기)
  fontWeight: '600',
  color: 'white',
  variants: {
    hasContent: {
      true: {
        backgroundColor: '$primary',
    },
      false: {
        backgroundColor: '$gray8',
        opacity: '$opacityDisabled', // 0.6
    },
  },
} as const,
  pressStyle: {
    backgroundColor: '$primaryHover',
    scale: 0.98,
},
});

const KeyboardDismissWrapper = styled(TouchableWithoutFeedback, {
  name: 'KeyboardDismissWrapper',
});

const PlaceholderSection = styled(YStack, {
  name: 'PlaceholderSection',
  gap: '$md',
  paddingVertical: '$md',
});

const PlaceholderTitle = styled(Text, {
  name: 'PlaceholderTitle',
  fontSize: '$4',
  fontWeight: '600',
  color: '$gray11',
  marginBottom: '$sm',
});

const PlaceholderExample = styled(Text, {
  name: 'PlaceholderExample',
  fontSize: '$4',
  color: '$gray10',
  lineHeight: '$5',
});

export type RoasterNotesScreenProps = GetProps<typeof Container>;

const RoasterNotesScreen: React.FC<RoasterNotesScreenProps> = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { currentTasting, updateField } = useTastingStore();
  const scannedRoasterNotes = (route.params as unknown)?.scannedRoasterNotes;
  
  // 초기값으로 스캔된 노트 사용
  const [notes, setNotes] = useState(scannedRoasterNotes || currentTasting.roasterNotes || '');
  
  useEffect(() => {
    if (scannedRoasterNotes) {
      setNotes(scannedRoasterNotes);
  }
}, [scannedRoasterNotes]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '로스터 노트',
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

  const handleNext = () => {
    updateField('roasterNotes', notes);
    navigation.navigate('Result' as never);
};

  const handleSkip = () => {
    navigation.navigate('Result' as never);
};

  const hasContent = notes.trim().length > 0;

  const placeholderText = `예시: 블루베리, 다크 초콜릿, 꿀과 같은 단맛

로스터가 제공한 맛 설명을 자유롭게 입력하세요.
이 정보는 나중에 여러분의 테이스팅 결과와 비교됩니다.`;

  return (
    <Container>
      <KeyboardDismissWrapper onPress={Keyboard.dismiss}>
        <View flex={1}>
          {/* Progress Bar */}
          <ProgressContainer>
            <ProgressFill />
          </ProgressContainer>

            {/* Main Content */}
            <ContentScrollView>
                {/* Header Section */}
                <HeaderSection>
                  <MainTitle>로스터의 컵 노트</MainTitle>
                  <Subtitle>
                    로스터의 설명을 적어두면 나중에 비교해볼 수 있어요
                  </Subtitle>
                  <TipText> 커피 봉투나 카페 메뉴판의 설명을 참고하세요</TipText>
                </HeaderSection>

                {/* OCR Notice */}
                {scannedRoasterNotes && (
                  <OCRNoticeCard>
                    <OCRNoticeText>
                      📷 OCR로 인식된 노트가 자동 입력되었습니다
                    </OCRNoticeText>
                  </OCRNoticeCard>
                )}

                {/* Text Input */}
                <InputSection>
                  <StyledTextArea
                    placeholder={placeholderText}
                    placeholderTextColor="$gray10"
                    value={notes}
                    onChangeText={setNotes}
                    hasContent={hasContent}
                    multiline
                    textAlignVertical="top"
                  />
                </InputSection>
            </ContentScrollView>

            {/* Bottom Button */}
            <BottomContainer>
              <NextButton 
                hasContent={hasContent}
                onPress={handleNext}
              >
                다음
              </NextButton>
            </BottomContainer>
          </View>
        </KeyboardDismissWrapper>
    </Container>
  );
};

export default RoasterNotesScreen;