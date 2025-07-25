import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
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
  AnimatePresence,
  Separator,
} from 'tamagui';
import { useTastingStore } from '../../stores/tastingStore';
import { useDevStore } from '../../stores/useDevStore';
import { AutocompleteInput } from '../../components/common';
import RealmService from '../../services/realm/RealmService';
import { searchRoasters, searchCoffees } from '../../services/supabase/coffeeSearch';
import { AddCoffeeModal } from '../../components/AddCoffeeModal';
import { BetaFeedbackPrompt } from '../../components/beta/BetaFeedbackPrompt';
import { FloatingDummyDataButton } from '../../components/dev/FloatingDummyDataButton';

// Styled Components
const Container = styled(YStack, {
  flex: 1,
  backgroundColor: '$background',
});

const HeaderBar = styled(XStack, {
  height: 44,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  backgroundColor: '$background',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
});

const ProgressBar = styled(XStack, {
  height: 3,
  backgroundColor: '$gray5',
  width: '100%',
});

const ProgressFill = styled(XStack, {
  height: '100%',
  backgroundColor: '$primary',
});

const BackButton = styled(Text, {
  fontSize: 24,
  color: '$primary',
  fontFamily: '$body',
});

const SkipButton = styled(Text, {
  fontSize: 15,
  color: '$primary',
  fontFamily: '$body',
});

const TitleSection = styled(YStack, {
  paddingHorizontal: '$lg',
  paddingVertical: '$lg',
  backgroundColor: '$background',
});

const Title = styled(Text, {
  fontSize: 24,
  fontWeight: '700',
  color: '$color',
  marginBottom: '$xs',
});

const Subtitle = styled(Text, {
  fontSize: 16,
  color: '$gray11',
  lineHeight: 22,
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
  fontSize: 16,
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
  height: 44,
  fontSize: 16,
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
        borderWidth: 2,
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

const BottomContainer = styled(XStack, {
  padding: '$lg',
  backgroundColor: '$background',
  borderTopWidth: 1,
  borderTopColor: '$gray4',
});

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
});

const CoffeeInfoScreenTamagui = () => {
  const navigation = useNavigation();
  
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
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleNext = () => {
    // Determine next screen based on mode
    if (currentTasting.mode === 'home_cafe') {
      navigation.navigate('HomeCafe' as never);
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

  // 필수 필드 검증
  const isValid = (currentTasting.cafeName?.trim() || currentTasting.roastery?.trim()) && currentTasting.coffeeName?.trim();

  return (
    <Container>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <YStack flex={1}>
          {/* Header */}
          <HeaderBar>
            <BackButton onPress={handleBack}>←</BackButton>
            <Text fontSize={17} fontWeight="600" color="$color">
              커피 정보
            </Text>
            <SkipButton onPress={handleSkip}>건너뛰기</SkipButton>
          </HeaderBar>

          {/* Progress Bar */}
          <ProgressBar>
            <ProgressFill width="10%" animation="lazy" />
          </ProgressBar>

          {/* Content */}
          <ScrollView flex={1} showsVerticalScrollIndicator={false}>
            <TitleSection>
              <Title>☕ 어떤 커피인가요?</Title>
              <Subtitle>기본 정보를 입력해주세요</Subtitle>
            </TitleSection>

            <FormCard elevate size="$4" animation="lazy">
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
                      backgroundColor: '#F5F5F5',
                      borderWidth: 1,
                      borderColor: '#E0E0E0',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      height: 44,
                      fontSize: 16,
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
                      backgroundColor: '#F5F5F5',
                      borderWidth: 1,
                      borderColor: '#E0E0E0',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      height: 44,
                      fontSize: 16,
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
                        animation="quick"
                      >
                        <Text 
                          fontSize={14} 
                          fontWeight={currentTasting.roastLevel === level ? '600' : '400'}
                          color={currentTasting.roastLevel === level ? '$blue11' : '$color'}
                        >
                          {level}
                        </Text>
                      </ToggleButton>
                    ))}
                  </XStack>
                </YStack>

                {/* Coffee Details Toggle */}
                <DetailsToggle
                  onPress={() => setShowCoffeeDetails(!showCoffeeDetails)}
                  backgroundColor={showCoffeeDetails ? '$blue2' : '$gray2'}
                  borderColor={showCoffeeDetails ? '$primary' : '$borderColor'}
                  animation="quick"
                >
                  <XStack alignItems="center" justifyContent="space-between" width="100%">
                    <Text 
                      fontSize={16} 
                      fontWeight="500"
                      color={showCoffeeDetails ? '$blue11' : '$color'}
                    >
                      상세 정보 {showCoffeeDetails ? '숨기기' : '더보기'}
                    </Text>
                    <Text 
                      fontSize={18}
                      color={showCoffeeDetails ? '$blue11' : '$gray11'}
                    >
                      {showCoffeeDetails ? '−' : '+'}
                    </Text>
                  </XStack>
                </DetailsToggle>

                {/* Detailed Fields */}
                <AnimatePresence>
                  {showCoffeeDetails && (
                    <YStack
                      space="$md"
                      animation="lazy"
                      enterStyle={{ opacity: 0, y: -10 }}
                      exitStyle={{ opacity: 0, y: -10 }}
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
                            backgroundColor: '#F5F5F5',
                            borderWidth: 1,
                            borderColor: '#E0E0E0',
                            borderRadius: 8,
                            paddingHorizontal: 16,
                            height: 44,
                            fontSize: 16,
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
                            backgroundColor: '#F5F5F5',
                            borderWidth: 1,
                            borderColor: '#E0E0E0',
                            borderRadius: 8,
                            paddingHorizontal: 16,
                            height: 44,
                            fontSize: 16,
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
                              animation="quick"
                            >
                              <Text 
                                fontSize={14} 
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
                </AnimatePresence>
              </YStack>
            </FormCard>
          </ScrollView>

          {/* Bottom Button */}
          <BottomContainer>
            <TouchableOpacity
              style={{
                backgroundColor: isValid ? '#007AFF' : '#C7C7CC',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                flex: 1,
              }}
              onPress={handleNext}
              disabled={!isValid}
              activeOpacity={0.7}
            >
              <Text 
                style={{
                  color: 'white',
                  fontSize: 17,
                  fontWeight: '600',
                }}
              >
                다음
              </Text>
            </TouchableOpacity>
          </BottomContainer>
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