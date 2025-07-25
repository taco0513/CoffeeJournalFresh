import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  Button,
  YStack,
  XStack,
  Card,
  H1,
  H2,
  H3,
  Paragraph,
  SizableText,
  styled,
  useTheme,
  AnimatePresence,
  GetProps,
} from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../../stores/tastingStore';
import { CurrentTasting, LabModeData } from '../../types/tasting';
import { 
  MouthfeelButton,
  SliderSection
} from '../../components/sensory';
import { CompactSensoryGrid } from '../../components/sensory/CompactSensoryGrid';
import { useSensoryState } from '../../hooks/useSensoryState';
import { MouthfeelType } from '../../types/sensory';
import { LabModeDataEntry } from '../../components/lab/LabModeDataEntry';

// Styled Components
const Container = styled(View, {
  name: 'ExperimentalDataContainer',
  flex: 1,
  backgroundColor: '$background',
});

const NavigationBar = styled(XStack, {
  name: 'ExperimentalDataNavigation',
  height: 44,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  backgroundColor: '$background',
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

const NavigationTitle = styled(H3, {
  name: 'NavigationTitle',
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
  color: '$cupBlue',
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
  width: '57%',
  backgroundColor: '$cupBlue',
  animation: 'lazy',
});

const TabContainer = styled(XStack, {
  name: 'TabContainer',
  marginHorizontal: '$lg',
  marginTop: '$md',
  backgroundColor: '$gray2',
  borderRadius: '$3',
  padding: '$xs',
});

const Tab = styled(Button, {
  name: 'Tab',
  flex: 1,
  backgroundColor: 'transparent',
  borderWidth: 0,
  borderRadius: '$2',
  paddingVertical: '$sm',
  marginHorizontal: '$xs',
  animation: 'bouncy',
  variants: {
    active: {
      true: {
        backgroundColor: '$background',
        shadowColor: '$shadowColor',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
    },
  } as const,
  pressStyle: {
    scale: 0.98,
  },
});

const TabText = styled(SizableText, {
  name: 'TabText',
  size: '$3',
  fontWeight: '500',
  textAlign: 'center',
  variants: {
    active: {
      true: {
        fontWeight: '600',
        color: '$color',
      },
      false: {
        color: '$gray11',
      },
    },
  } as const,
});

const GuideSection = styled(YStack, {
  name: 'GuideSection',
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
  backgroundColor: '$background',
});

const GuideContent = styled(XStack, {
  name: 'GuideContent',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const GuideTextContainer = styled(YStack, {
  name: 'GuideTextContainer',
  flex: 1,
});

const GuideTitle = styled(SizableText, {
  name: 'GuideTitle',
  size: '$4',
  fontWeight: '600',
  color: '$color',
  marginBottom: '$sm',
});

const GuideSubtitle = styled(SizableText, {
  name: 'GuideSubtitle',
  size: '$3',
  color: '$gray11',
});

const ContentContainer = styled(View, {
  name: 'ContentContainer',
  flex: 1,
});

const SensoryScrollView = styled(ScrollView, {
  name: 'SensoryScrollView',
  flex: 1,
  showsVerticalScrollIndicator: false,
});

const MouthfeelCard = styled(Card, {
  name: 'MouthfeelCard',
  backgroundColor: '$background',
  borderRadius: '$4',
  marginHorizontal: '$lg',
  marginBottom: '$md',
  padding: '$md',
  borderWidth: 0.5,
  borderColor: '$borderColor',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  pressStyle: {
    scale: 0.98,
  },
});

const MouthfeelHeader = styled(YStack, {
  name: 'MouthfeelHeader',
  marginBottom: '$md',
});

const MouthfeelTitleRow = styled(XStack, {
  name: 'MouthfeelTitleRow',
  alignItems: 'center',
  marginBottom: '$xs',
});

const MouthfeelIcon = styled(SizableText, {
  name: 'MouthfeelIcon',
  size: '$5',
  marginRight: '$sm',
});

const MouthfeelTitle = styled(SizableText, {
  name: 'MouthfeelTitle',
  size: '$4',
  fontWeight: '700',
  color: '$color',
});

const MouthfeelDescription = styled(SizableText, {
  name: 'MouthfeelDescription',
  size: '$2',
  lineHeight: '$4',
  color: '$gray11',
  marginTop: '$xs',
});

const MouthfeelOptions = styled(XStack, {
  name: 'MouthfeelOptions',
  flexWrap: 'wrap',
  marginTop: '$sm',
  gap: '$sm',
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
  backgroundColor: '$cupBlue',
  color: 'white',
  borderRadius: '$3',
  paddingVertical: '$md',
  fontSize: '$4',
  fontWeight: '600',
  animation: 'bouncy',
  pressStyle: {
    backgroundColor: '$cupBlueDark',
    scale: 0.98,
  },
});

const LabModeContainer = styled(View, {
  name: 'LabModeContainer',
  flex: 1,
  backgroundColor: '$backgroundSoft',
  paddingTop: '$md',
});

export type ExperimentalDataScreenProps = GetProps<typeof Container>;

const ExperimentalDataScreen: React.FC<ExperimentalDataScreenProps> = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { currentTasting, updateField } = useTastingStore();
  const [activeTab, setActiveTab] = useState<'basic' | 'lab'>('basic');
  
  // Use custom hook for sensory state management
  const {
    sensoryData,
    updateNumericValue,
    setMouthfeel,
  } = useSensoryState({
    body: currentTasting.body,
    acidity: currentTasting.acidity,
    sweetness: currentTasting.sweetness,
    finish: currentTasting.finish,
    bitterness: currentTasting.bitterness,
    balance: currentTasting.balance,
    mouthfeel: (currentTasting.mouthfeel as MouthfeelType) || 'Clean',
  });

  const mouthfeelOptions: MouthfeelType[] = useMemo(() => ['Clean', 'Creamy', 'Juicy', 'Silky'], []);

  const handleLabDataChange = useCallback((labData: LabModeData) => {
    updateField('labModeData', labData);
  }, [updateField]);

  // Calculate completion progress for gamification
  const getCompletionProgress = useCallback(() => {
    const requiredFields = ['body', 'acidity', 'sweetness', 'bitterness', 'finish', 'balance'];
    const completedFields = requiredFields.filter(field => {
      const value = sensoryData[field as keyof typeof sensoryData];
      return value && value !== 3; // 3 is default/neutral value
    });
    return {
      completed: completedFields.length,
      total: requiredFields.length,
      percentage: Math.round((completedFields.length / requiredFields.length) * 100)
    };
  }, [sensoryData]);

  const progress = getCompletionProgress();

  const handleComplete = useCallback(async () => {
    // Update all sensory fields in the store
    Object.entries(sensoryData).forEach(([key, value]) => {
      updateField(key as keyof CurrentTasting, value);
    });
    
    // Navigate to Korean sensory evaluation screen
    navigation.navigate('SensoryEvaluation' as never);
  }, [sensoryData, updateField, navigation]);

  const handleTabChange = (tab: 'basic' | 'lab') => {
    setActiveTab(tab);
  };

  const renderBasicTab = () => (
    <ContentContainer>
      <SensoryScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <AnimatePresence>
          <View
            animation="lazy"
            enterStyle={{
              opacity: 0,
              y: 30,
            }}
            animateOnly={['opacity', 'transform']}
          >
            <CompactSensoryGrid
              attributes={[
                {
                  title: "바디감",
                  value: sensoryData.body,
                  onValueChange: updateNumericValue('body'),
                  leftLabel: "가벼움",
                  rightLabel: "무거움",
                  description: "입안에서 느껴지는 질감과 무게감"
                },
                {
                  title: "산미",
                  value: sensoryData.acidity,
                  onValueChange: updateNumericValue('acidity'),
                  leftLabel: "약함",
                  rightLabel: "강함",
                  description: "밝고 상큼한 신맛의 강도"
                },
                {
                  title: "단맛",
                  value: sensoryData.sweetness,
                  onValueChange: updateNumericValue('sweetness'),
                  leftLabel: "없음",
                  rightLabel: "강함",
                  description: "자연스러운 당도와 단맛"
                },
                {
                  title: "쓴맛",
                  value: sensoryData.bitterness,
                  onValueChange: updateNumericValue('bitterness'),
                  leftLabel: "약함",
                  rightLabel: "강함",
                  description: "다크 초콜릿같은 쓴맛"
                },
                {
                  title: "여운",
                  value: sensoryData.finish,
                  onValueChange: updateNumericValue('finish'),
                  leftLabel: "짧음",
                  rightLabel: "길음",
                  description: "입안에 남는 맛의 지속시간"
                },
                {
                  title: "밸런스",
                  value: sensoryData.balance,
                  onValueChange: updateNumericValue('balance'),
                  leftLabel: "불균형",
                  rightLabel: "조화로운",
                  description: "맛과 향의 전체적 균형"
                }
              ]}
            />

            {/* Mouthfeel Section */}
            <MouthfeelCard
              animation="lazy"
              animateOnly={['opacity', 'transform']}
            >
              <MouthfeelHeader>
                <MouthfeelTitleRow>
                  <MouthfeelIcon>👄</MouthfeelIcon>
                  <MouthfeelTitle>입안 느낌</MouthfeelTitle>
                </MouthfeelTitleRow>
                <MouthfeelDescription>
                  가장 가까운 느낌을 선택해주세요
                </MouthfeelDescription>
              </MouthfeelHeader>
              
              <MouthfeelOptions>
                {mouthfeelOptions.map((option) => (
                  <MouthfeelButton 
                    key={option} 
                    mouthfeel={option}
                    isSelected={sensoryData.mouthfeel === option}
                    onPress={() => setMouthfeel(option)}
                  />
                ))}
              </MouthfeelOptions>
            </MouthfeelCard>
          </View>
        </AnimatePresence>
      </SensoryScrollView>
    </ContentContainer>
  );

  const renderLabTab = () => (
    <LabModeContainer>
      <AnimatePresence>
        <View
          animation="lazy"
          enterStyle={{
            opacity: 0,
            x: 30,
          }}
          animateOnly={['opacity', 'transform']}
        >
          <LabModeDataEntry
            data={currentTasting.labModeData}
            onChange={handleLabDataChange}
          />
        </View>
      </AnimatePresence>
    </LabModeContainer>
  );

  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Navigation Bar */}
        <NavigationBar style={{ paddingTop: insets.top + 8, height: 44 + insets.top + 8 }}>
          <BackButton unstyled onPress={() => navigation.goBack()}>
            <Text color="$cupBlue" fontSize="$6">←</Text>
          </BackButton>
          <NavigationTitle>실험 데이터</NavigationTitle>
          <SkipButton unstyled onPress={() => navigation.navigate('SensoryEvaluation' as never)}>
            <SkipText>건너뛰기</SkipText>
          </SkipButton>
        </NavigationBar>
        
        {/* Progress Bar */}
        <ProgressContainer>
          <ProgressFill 
            animation="lazy"
            animateOnly={['width']}
          />
        </ProgressContainer>

        {/* Tab Navigation */}
        <TabContainer>
          <Tab
            active={activeTab === 'basic'}
            onPress={() => handleTabChange('basic')}
            unstyled
          >
            <TabText active={activeTab === 'basic'}>
              기본 평가
            </TabText>
          </Tab>
          <Tab
            active={activeTab === 'lab'}
            onPress={() => handleTabChange('lab')}
            unstyled
          >
            <TabText active={activeTab === 'lab'}>
              전문 분석
            </TabText>
          </Tab>
        </TabContainer>

        {/* Guide Message with Progress */}
        <GuideSection>
          <GuideContent>
            <GuideTextContainer>
              <GuideTitle>
                {activeTab === 'basic' 
                  ? '커피의 강도를 측정해보세요' 
                  : '전문적인 분석 데이터를 기록하세요'
                }
              </GuideTitle>
              <GuideSubtitle>
                {activeTab === 'basic'
                  ? `${progress.completed}/${progress.total} 항목 완료`
                  : 'TDS, 추출수율, 실험 변수를 정밀하게 기록할 수 있습니다'
                }
              </GuideSubtitle>
            </GuideTextContainer>
          </GuideContent>
        </GuideSection>

        {/* Tab Content */}
        <AnimatePresence key={activeTab}>
          {activeTab === 'basic' ? renderBasicTab() : renderLabTab()}
        </AnimatePresence>

        {/* Bottom Button */}
        <BottomContainer>
          <NextButton 
            onPress={handleComplete}
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

export default ExperimentalDataScreen;
export { ExperimentalDataScreen };