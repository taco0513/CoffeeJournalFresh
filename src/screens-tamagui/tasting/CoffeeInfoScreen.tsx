import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IOSLayout, IOSSpacing } from '../../styles/ios-hig-2024';
import { useNavigation } from '@react-navigation/native';
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  Input,
  ScrollView,
  styled,
  Separator,
} from 'tamagui';
import { useTastingStore } from '../../stores/tastingStore';
import { useDevStore } from '../../stores/useDevStore';
import { AutocompleteInput } from '../../components/common';
import RealmService from '../../services/realm/RealmService';
import { searchRoasters, searchCoffees } from '../../services/supabase/coffeeSearch';
import { AddCoffeeModal } from '../../components/AddCoffeeModal';
import { BetaFeedbackPrompt } from '../../components/beta/BetaFeedbackPrompt';
import { Logger } from '../../services/LoggingService';
import { FloatingDummyDataButton } from '../../components/dev/FloatingDummyDataButton';

// Styled Components
const Container = styled(YStack, {
  flex: 1,
  backgroundColor: '$background',
});

const ProgressBar = styled(XStack, {
  height: '$progressBarHeight',
  backgroundColor: '$gray5',
  width: '100%',
});

const ProgressFill = styled(XStack, {
  height: '100%',
  backgroundColor: '$primary',
});

const TitleSection = styled(YStack, {
  paddingHorizontal: '$lg',
  paddingVertical: '$lg',
  backgroundColor: '$background',
});

const Title = styled(Text, {
  fontSize: '$4', // 24px (headingFont)
  fontWeight: '700',
  color: '$color',
  marginBottom: '$xs',
});

const Subtitle = styled(Text, {
  fontSize: '$3', // 16px
  color: '$gray11',
  lineHeight: '$1', // 22px
});

const FormCard = styled(Card, {
  margin: '$md',
  padding: '$lg',
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$4',
});

const FieldLabel = styled(Text, {
  fontSize: '$3', // 16px
  fontWeight: '600',
  color: '$color',
  marginBottom: '$sm',
});

const StyledInput = styled(Input, {
  backgroundColor: '$gray2',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$3',
  paddingHorizontal: '$md',
  height: '$inputHeight', // 44px
  fontSize: '$3', // 16px
  marginBottom: '$md',
});

const ToggleButton = styled(Button, {
  backgroundColor: '$gray2',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$3',
  padding: '$sm',
  marginRight: '$sm',
  marginBottom: '$sm',
  
  variants: {
    selected: {
      true: {
        backgroundColor: '$blue2',
        borderColor: '$primary',
        borderWidth: '$borderWidthThick', // 2px
    },
  },
} as const,
});

const DetailsToggle = styled(Button, {
  backgroundColor: '$gray2',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$3',
  marginTop: '$md',
  marginBottom: '$md',
});

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
});

const CoffeeInfoScreenTamagui = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // Zustand store 사용
  const { currentTasting, updateField } = useTastingStore();
  const { isDeveloperMode } = useDevStore();
  
  // 자동완성 상태
  const [cafeSuggestions, setCafeSuggestions] = useState<string[]>([]);
  const [roasterSuggestions, setRoasterSuggestions] = useState<string[]>([]);
  const [coffeeNameSuggestions, setCoffeeNameSuggestions] = useState<string[]>([]);
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [varietySuggestions, setVarietySuggestions] = useState<string[]>([]);
  const [processSuggestions, setProcessSuggestions] = useState<string[]>([]);
  const [showAddCoffeeModal, setShowAddCoffeeModal] = useState(false);
  const [showCoffeeDetails, setShowCoffeeDetails] = useState(false);
  
  const realmService = RealmService.getInstance();
  
  // 기본 가공 방식과 로스팅 레벨 옵션
  const defaultProcessOptions = ['Washed', 'Natural', 'Honey', 'Anaerobic'];
  const roastLevelOptions = ['Light', 'Medium', 'Dark'];

  // 자동완성 로직
  useEffect(() => {
    loadSuggestions();
}, []);

  const loadSuggestions = async () => {
    try {
      if (!realmService.isInitialized) {
        await realmService.initialize();
    }

      const tastings = await realmService.getTastingRecords({ isDeleted: false });
      const tastingArray = Array.from(tastings);

      // 고유값 추출
      const cafes = [...new Set(tastingArray.map(t => t.cafeName).filter(Boolean))];
      const roasters = [...new Set(tastingArray.map(t => t.roastery).filter(Boolean))];
      const coffeeNames = [...new Set(tastingArray.map(t => t.coffeeName).filter(Boolean))];
      const origins = Array.from(new Set(tastingArray.map(t => t.origin).filter(Boolean)));
      const varieties = Array.from(new Set(tastingArray.map(t => t.variety).filter(Boolean)));
      const processes = Array.from(new Set(tastingArray.map(t => t.process).filter(Boolean)));

      setCafeSuggestions(cafes.filter((c): c is string => c !== undefined));
      setRoasterSuggestions(roasters.filter((r): r is string => r !== undefined));
      setCoffeeNameSuggestions(coffeeNames.filter((c): c is string => c !== undefined));
      setOriginSuggestions(origins.filter((o): o is string => o !== undefined));
      setVarietySuggestions(varieties.filter((v): v is string => v !== undefined));
      setProcessSuggestions([...defaultProcessOptions, ...processes.filter((p): p is string => p !== undefined)]);
  } catch (error) {
      Logger.error('Failed to load suggestions:', 'screen', { component: 'CoffeeInfoScreen', error: error });
  }
};

  const handleNext = () => {
    // Determine next screen based on mode
    if (currentTasting.mode === 'home_cafe') {
      navigation.navigate('HomeCafe' as never);
    } else if (currentTasting.mode === 'lab') {
      navigation.navigate('LabMode' as never);
    } else {
      navigation.navigate('RoasterNotes' as never);
    }
  };

  const handleSkip = () => {
    navigation.navigate('UnifiedFlavor' as never);
};

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
  } else {
      navigation.navigate('ModeSelection' as never);
  }
};

  // 필수 필드 검증 - 온도 필드도 필수로 추가
  const isValid = (currentTasting.cafeName?.trim() || currentTasting.roastery?.trim()) && 
                  currentTasting.coffeeName?.trim() && 
                  currentTasting.temperature;

  return (
    <Container>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <YStack flex={1}>

          {/* Progress Bar */}
          <ProgressBar>
            <ProgressFill width="$progressStep1" />
          </ProgressBar>

          {/* Content */}
          <ScrollView 
            flex={1} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: '$lg' // Reasonable padding for bottom button
            }}
          >
            <TitleSection>
              <Title>☕ 어떤 커피인가요?</Title>
              <Subtitle>기본 정보를 입력해주세요</Subtitle>
            </TitleSection>

            <FormCard elevate size="$4">
              <YStack space="$md">
                {/* Cafe/Roaster */}
                <YStack>
                  <FieldLabel>카페/로스터 *</FieldLabel>
                  <AutocompleteInput
                    value={currentTasting.cafeName || ''}
                    onChangeText={(value) => updateField('cafeName', value)}
                    onSelect={(value) => updateField('cafeName', value)}
                    placeholder="예: 블루보틀, 커피리브레"
                    suggestions={cafeSuggestions}
                    style={{
                      backgroundColor: '$backgroundStrong',
                      borderWidth: 1,
                      borderColor: '$borderColor',
                      borderRadius: '$3',
                      paddingHorizontal: '$md',
                      height: '$inputHeight',
                      fontSize: '$3',
                  }}
                  />
                </YStack>

                {/* Coffee Name */}
                <YStack>
                  <FieldLabel>커피 이름 *</FieldLabel>
                  <AutocompleteInput
                    value={currentTasting.coffeeName || ''}
                    onChangeText={(value) => updateField('coffeeName', value)}
                    onSelect={(value) => updateField('coffeeName', value)}
                    placeholder="예: 에티오피아 예가체프, 콜롬비아 수프리모"
                    suggestions={coffeeNameSuggestions}
                    style={{
                      backgroundColor: '$backgroundStrong',
                      borderWidth: 1,
                      borderColor: '$borderColor',
                      borderRadius: '$3',
                      paddingHorizontal: '$md',
                      height: '$inputHeight',
                      fontSize: '$3',
                  }}
                  />
                </YStack>

                {/* Roast Level */}
                <YStack>
                  <FieldLabel>로스팅 레벨</FieldLabel>
                  <XStack flexWrap="wrap">
                    {roastLevelOptions.map((level) => (
                      <ToggleButton
                        key={level}
                        selected={currentTasting.roastLevel === level}
                        onPress={() => updateField('roastLevel', 
                          currentTasting.roastLevel === level ? '' : level
                        )}
                        pressStyle={{ scale: 0.95 }}
                      >
                        <Text 
                          fontSize="$3" // 16px
                          fontWeight={currentTasting.roastLevel === level ? '600' : '400'}
                          color={currentTasting.roastLevel === level ? '$blue11' : '$color'}
                        >
                          {level}
                        </Text>
                      </ToggleButton>
                    ))}
                  </XStack>
                </YStack>

                {/* Temperature */}
                <YStack>
                  <FieldLabel>온도 *</FieldLabel>
                  <XStack flexWrap="wrap">
                    <ToggleButton
                      selected={currentTasting.temperature === 'hot'}
                      onPress={() => updateField('temperature', 
                        currentTasting.temperature === 'hot' ? undefined : 'hot'
                      )}
                      pressStyle={{ scale: 0.95 }}
                    >
                      <XStack alignItems="center" space="$xs">
                        <Text fontSize="$4">☕</Text>
                        <Text 
                          fontSize="$3"
                          fontWeight={currentTasting.temperature === 'hot' ? '600' : '400'}
                          color={currentTasting.temperature === 'hot' ? '$blue11' : '$color'}
                        >
                          Hot
                        </Text>
                      </XStack>
                    </ToggleButton>
                    <ToggleButton
                      selected={currentTasting.temperature === 'cold'}
                      onPress={() => updateField('temperature', 
                        currentTasting.temperature === 'cold' ? undefined : 'cold'
                      )}
                      pressStyle={{ scale: 0.95 }}
                    >
                      <XStack alignItems="center" space="$xs">
                        <Text fontSize="$4">🧊</Text>
                        <Text 
                          fontSize="$3"
                          fontWeight={currentTasting.temperature === 'cold' ? '600' : '400'}
                          color={currentTasting.temperature === 'cold' ? '$blue11' : '$color'}
                        >
                          Ice
                        </Text>
                      </XStack>
                    </ToggleButton>
                  </XStack>
                </YStack>

                {/* Coffee Details Toggle */}
                <DetailsToggle
                  onPress={() => setShowCoffeeDetails(!showCoffeeDetails)}
                  backgroundColor={showCoffeeDetails ? '$blue2' : '$gray2'}
                  borderColor={showCoffeeDetails ? '$primary' : '$borderColor'}
                >
                  <XStack alignItems="center" justifyContent="space-between" width="100%">
                    <Text 
                      fontSize="$3" // 16px
                      fontWeight="500"
                      color={showCoffeeDetails ? '$blue11' : '$color'}
                    >
                      상세 정보 {showCoffeeDetails ? '숨기기' : '더보기'}
                    </Text>
                    <Text 
                      fontSize="$5" // 20px (적절한 아이콘 크기)
                      color={showCoffeeDetails ? '$blue11' : '$gray11'}
                    >
                      {showCoffeeDetails ? '−' : '+'}
                    </Text>
                  </XStack>
                </DetailsToggle>

                {/* Detailed Fields */}
                {showCoffeeDetails && (
                  <YStack
                    space="$md"
                  >
                      <Separator borderColor="$borderColor" />
                      
                      {/* Origin */}
                      <YStack>
                        <FieldLabel>원산지</FieldLabel>
                        <AutocompleteInput
                          value={currentTasting.origin || ''}
                          onChangeText={(value) => updateField('origin', value)}
                          onSelect={(value) => updateField('origin', value)}
                          placeholder="예: 에티오피아, 콜롬비아"
                          suggestions={originSuggestions}
                          style={{
                            backgroundColor: '$backgroundStrong',
                            borderWidth: 1,
                            borderColor: '$borderColor',
                            borderRadius: '$3',
                            paddingHorizontal: '$md',
                            height: '$inputHeight',
                            fontSize: '$3',
                        }}
                        />
                      </YStack>

                      {/* Variety */}
                      <YStack>
                        <FieldLabel>품종</FieldLabel>
                        <AutocompleteInput
                          value={currentTasting.variety || ''}
                          onChangeText={(value) => updateField('variety', value)}
                          onSelect={(value) => updateField('variety', value)}
                          placeholder="예: 아라비카, 게이샤"
                          suggestions={varietySuggestions}
                          style={{
                            backgroundColor: '$backgroundStrong',
                            borderWidth: 1,
                            borderColor: '$borderColor',
                            borderRadius: '$3',
                            paddingHorizontal: '$md',
                            height: '$inputHeight',
                            fontSize: '$3',
                        }}
                        />
                      </YStack>

                      {/* Process */}
                      <YStack>
                        <FieldLabel>가공 방식</FieldLabel>
                        <XStack flexWrap="wrap">
                          {defaultProcessOptions.map((process) => (
                            <ToggleButton
                              key={process}
                              selected={currentTasting.process === process}
                              onPress={() => updateField('process', 
                                currentTasting.process === process ? '' : process
                              )}
                              pressStyle={{ scale: 0.95 }}
                                  >
                              <Text 
                                fontSize="$3" // 16px
                                fontWeight={currentTasting.process === process ? '600' : '400'}
                                color={currentTasting.process === process ? '$blue11' : '$color'}
                              >
                                {process}
                              </Text>
                            </ToggleButton>
                          ))}
                        </XStack>
                      </YStack>
                    </YStack>
                  )}
              </YStack>
            </FormCard>
          </ScrollView>

          {/* Bottom Button */}
          <XStack
            padding="$lg"
            paddingBottom={Math.max(insets.bottom, IOSLayout.safeAreaBottom) + IOSSpacing.md}
            backgroundColor="$background"
            borderTopWidth="$borderWidthThin"
            borderTopColor="$gray4"
          >
            <Button
              backgroundColor={isValid ? '$cupBlue' : '$gray8'}
              paddingVertical="$md"
              borderRadius="$3"
              alignItems="center"
              justifyContent="center"
              flex={1}
              height="$buttonHeight" // 48px
              onPress={handleNext}
              disabled={!isValid}
              pressStyle={{ scale: '$scalePress' }}
            >
              <Text
                color="white"
                fontSize="$5"
                fontWeight="600"
                textAlign="center"
              >
                다음
              </Text>
            </Button>
          </XStack>
        </YStack>

        {/* Modals and Dev Tools */}
        <AddCoffeeModal 
          visible={showAddCoffeeModal} 
          onClose={() => setShowAddCoffeeModal(false)}
          roastery={currentTasting.roastery || ''}
          onCoffeeAdded={(coffeeName) => {
            updateField('coffeeName', coffeeName);
            setShowAddCoffeeModal(false);
        }}
        />
        <BetaFeedbackPrompt screenName="CoffeeInfoScreen" />
        {isDeveloperMode && <FloatingDummyDataButton />}
      </KeyboardAvoidingView>
    </Container>
  );
};

export default CoffeeInfoScreenTamagui;