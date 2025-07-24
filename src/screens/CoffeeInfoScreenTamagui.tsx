import React, { useState, useEffect } from 'react';
import { SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import {
  YStack,
  XStack,
  Text,
  Input,
  Button,
  Card,
  styled,
  ScrollView,
  AnimatePresence,
  H2,
  Label,
  Theme,
} from 'tamagui';
import { ChevronRight } from '@tamagui/lucide-icons';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../stores/tastingStore';
import { useDevStore } from '../stores/useDevStore';
import { CurrentTasting } from '../types/tasting';
import { AutocompleteInputTamagui } from '../components/common/AutocompleteInputTamagui';
import RealmService from '../services/realm/RealmService';
import { searchRoasters, searchCoffees } from '../services/supabase/coffeeSearch';
import { AddCoffeeModal } from '../components/AddCoffeeModal';
import { BetaFeedbackPrompt } from '../components/beta/BetaFeedbackPrompt';
import { FloatingDummyDataButton } from '../components/dev/FloatingDummyDataButton';

// Styled Components
const Container = styled(YStack, {
  flex: 1,
  backgroundColor: '$background',
})

const HeaderBar = styled(XStack, {
  height: 44,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  backgroundColor: '$background',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
})

const BackButton = styled(Text, {
  fontSize: 24,
  color: '$primary',
  fontFamily: '$body',
  pressStyle: { opacity: 0.7 },
})

const HeaderTitle = styled(Text, {
  fontSize: 17,
  fontWeight: '600',
  color: '$color',
  fontFamily: '$heading',
})

const SkipButton = styled(Text, {
  fontSize: 15,
  color: '$primary',
  fontFamily: '$body',
  pressStyle: { opacity: 0.7 },
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

const GuideSection = styled(YStack, {
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
  backgroundColor: '$cupBlueLight',
  borderBottomWidth: 0.5,
  borderBottomColor: '$gray5',
})

const GuideText = styled(Text, {
  fontSize: 15,
  color: '$primary',
  textAlign: 'center',
  fontWeight: '500',
})

const FormContainer = styled(YStack, {
  paddingHorizontal: '$lg',
  paddingTop: '$sm',
  paddingBottom: '$md',
  gap: '$sm',
})

const InputGroup = styled(YStack, {
  marginBottom: '$sm',
  gap: '$xs',
})

const StyledLabel = styled(Label, {
  fontSize: 13,
  fontWeight: '600',
  color: '$color',
  marginBottom: '$xs',
})

const StyledInput = styled(Input, {
  minHeight: 40,
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$3',
  paddingHorizontal: '$sm',
  paddingVertical: '$xs',
  fontSize: 16,
  color: '$color',
  backgroundColor: '$background',
  
  focusStyle: {
    borderColor: '$primary',
    borderWidth: 2,
  },
})

const TemperatureButtons = styled(XStack, {
  gap: '$sm',
  marginTop: '$xs',
})

const TemperatureButton = styled(Button, {
  flex: 1,
  minHeight: 36,
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$3',
  backgroundColor: 'transparent',
  
  variants: {
    active: {
      true: {
        backgroundColor: '$primary',
        borderColor: '$primary',
      },
    },
  } as const,
})

const TemperatureButtonText = styled(Text, {
  fontSize: 17,
  fontWeight: '400',
  color: '$color',
  
  variants: {
    active: {
      true: {
        color: 'white',
      },
    },
  } as const,
})

const AccordionHeader = styled(XStack, {
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '$gray2',
  borderRadius: '$3',
  padding: '$md',
  marginVertical: '$sm',
  borderWidth: 1,
  borderColor: '$borderColor',
  pressStyle: {
    backgroundColor: '$gray3',
    scale: 0.98,
  },
})

const AccordionContent = styled(YStack, {
  backgroundColor: '$background',
  borderRadius: '$3',
  padding: '$md',
  marginTop: -8,
  marginBottom: '$md',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderTopWidth: 0,
  gap: '$sm',
})

const RoastLevelButtons = styled(XStack, {
  gap: '$sm',
  marginTop: '$xs',
})

const RoastButton = styled(Button, {
  flex: 1,
  minHeight: 36,
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$3',
  backgroundColor: 'transparent',
  paddingHorizontal: '$xs',
  
  variants: {
    active: {
      true: {
        backgroundColor: '$bean',
        borderColor: '$bean',
      },
    },
  } as const,
})

const RoastButtonText = styled(Text, {
  fontSize: 15,
  fontWeight: '500',
  color: '$color',
  textAlign: 'center',
  
  variants: {
    active: {
      true: {
        color: 'white',
      },
    },
  } as const,
})

const BottomContainer = styled(XStack, {
  padding: '$lg',
  backgroundColor: '$background',
  borderTopWidth: 0.5,
  borderTopColor: '$borderColor',
})

const NextButton = styled(Button, {
  height: 48,
  backgroundColor: '$primary',
  borderRadius: '$3',
  
  pressStyle: {
    backgroundColor: '$primaryHover',
    scale: 0.98,
  },
  
  variants: {
    disabled: {
      true: {
        backgroundColor: '$gray8',
        opacity: 0.6,
      },
    },
  } as const,
})

const NextButtonText = styled(Text, {
  fontSize: 16,
  fontWeight: '600',
  color: 'white',
})

const CoffeeInfoScreenTamagui = () => {
  const navigation = useNavigation();
  const { currentTasting, updateField } = useTastingStore();
  const { isDeveloperMode } = useDevStore();
  
  // Autocomplete states
  const [cafeSuggestions, setCafeSuggestions] = useState<string[]>([]);
  const [roasterSuggestions, setRoasterSuggestions] = useState<string[]>([]);
  const [coffeeNameSuggestions, setCoffeeNameSuggestions] = useState<string[]>([]);
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [varietySuggestions, setVarietySuggestions] = useState<string[]>([]);
  const [processSuggestions, setProcessSuggestions] = useState<string[]>([]);
  const [showAddCoffeeModal, setShowAddCoffeeModal] = useState(false);
  const [showCoffeeDetails, setShowCoffeeDetails] = useState(false);
  
  const realmService = RealmService.getInstance();
  
  const defaultProcessOptions = ['Washed', 'Natural', 'Honey', 'Anaerobic'];
  const roastLevelOptions = ['Light', 'Medium', 'Dark'];
  
  const isValid = currentTasting.coffeeName && currentTasting.coffeeName.trim().length > 0 &&
                  currentTasting.roastery && currentTasting.roastery.trim().length > 0 &&
                  (currentTasting.mode !== 'cafe' || 
                   (currentTasting.cafeName && currentTasting.cafeName.trim().length > 0)) &&
                  currentTasting.temperature;

  const handleCoffeeNameParse = (coffeeName: string) => {
    const parsed = { origin: null, variety: null, process: null };
    const updates: Record<string, string> = { coffeeName };
    
    if (parsed.origin && !currentTasting.origin) {
      updates.origin = parsed.origin;
    }
    if (parsed.variety && !currentTasting.variety) {
      updates.variety = parsed.variety;
    }
    if (parsed.process && !currentTasting.process) {
      updates.process = parsed.process;
    }
    
    Object.keys(updates).forEach(key => {
      updateField(key as keyof CurrentTasting, updates[key as keyof typeof updates]);
    });
  };

  const handleNext = () => {
    if (isValid) {
      if (currentTasting.cafeName && currentTasting.cafeName.trim().length > 0) {
        realmService.incrementCafeVisit(currentTasting.cafeName);
      }
      if (currentTasting.roastery && currentTasting.roastery.trim().length > 0) {
        realmService.incrementRoasterVisit(currentTasting.roastery);
      }
      
      if (currentTasting.mode === 'home_cafe') {
        navigation.navigate('HomeCafe' as never);
      } else if (currentTasting.mode === 'lab') {
        navigation.navigate('ExperimentalData' as never);
      } else {
        navigation.navigate('UnifiedFlavor' as never);
      }
    }
  };

  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        <BetaFeedbackPrompt 
          screenName="Coffee Info Entry"
          context="User is entering coffee details"
          delayMs={10000}
        />
        
        <FloatingDummyDataButton />
        
        <YStack flex={1}>
          {/* Navigation Bar */}
          <HeaderBar>
            <BackButton onPress={() => navigation.goBack()}>←</BackButton>
            <HeaderTitle>커피 정보</HeaderTitle>
            <SkipButton onPress={() => {
              if (currentTasting.mode === 'home_cafe') {
                navigation.navigate('HomeCafe' as never);
              } else {
                navigation.navigate('UnifiedFlavor' as never);
              }
            }}>
              건너뛰기
            </SkipButton>
          </HeaderBar>

          {/* Progress Bar */}
          <ProgressBar>
            <ProgressFill width="17%" animation="lazy" />
          </ProgressBar>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{flex: 1}}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              bounces={true}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              {/* Guide Message */}
              <GuideSection animation="lazy" y={0} opacity={1}>
                <GuideText>커피 봉투에 적힌 정보를 입력해주세요</GuideText>
              </GuideSection>

              {/* Input Form */}
              <FormContainer>
                {/* Cafe Name - Only show in Cafe mode */}
                {currentTasting.mode === 'cafe' && (
                  <InputGroup 
                    zIndex={cafeSuggestions.length > 0 && currentTasting.cafeName ? 10 : 1}
                    animation="quick"
                  >
                    <AutocompleteInputTamagui
                      value={currentTasting.cafeName || ''}
                      onChangeText={(text) => updateField('cafeName', text)}
                      onSelect={(item) => {
                        updateField('cafeName', item);
                        
                        const roastersWithSameName = realmService.getRoasterSuggestions(item);
                        if (roastersWithSameName.length > 0 && 
                            roastersWithSameName.some(r => r.name === item) &&
                            !currentTasting.roastery) {
                          updateField('roastery', item);
                        }
                      }}
                      suggestions={['Home', ...cafeSuggestions]}
                      placeholder="예: 블루보틀 (집에서는 'Home' 선택)"
                      label="카페 이름 *"
                    />
                  </InputGroup>
                )}

                {/* Roastery (Required) */}
                <InputGroup 
                  zIndex={roasterSuggestions.length > 0 && currentTasting.roastery ? 5 : 1}
                  animation="quick"
                >
                  <AutocompleteInput
                    value={currentTasting.roastery || ''}
                    onChangeText={(text) => updateField('roastery', text)}
                    onSelect={(item) => updateField('roastery', item)}
                    suggestions={roasterSuggestions}
                    placeholder="예: 프릳츠"
                    label="로스터리 *"
                  />
                </InputGroup>

                {/* Coffee Name (Required) */}
                <InputGroup 
                  zIndex={coffeeNameSuggestions.length > 0 && currentTasting.coffeeName ? 4 : 1}
                  animation="quick"
                >
                  <AutocompleteInput
                    value={currentTasting.coffeeName || ''}
                    onChangeText={(text) => updateField('coffeeName', text)}
                    onSelect={async (item) => {
                      if (item.startsWith('+ "') && item.includes('새 커피 등록')) {
                        setShowAddCoffeeModal(true);
                        return;
                      }
                      
                      updateField('coffeeName', item);
                      
                      if (currentTasting.roastery) {
                        const details = realmService.getCoffeeDetails(currentTasting.roastery, item);
                        if (details) {
                          if (details.origin) updateField('origin', details.origin);
                          if (details.variety) updateField('variety', details.variety);
                          if (details.altitude) updateField('altitude', details.altitude);
                          if (details.process) updateField('process', details.process);
                          if (details.roasterNotes) updateField('roasterNotes', details.roasterNotes);
                        } else {
                          const supabaseCoffees = await searchCoffees(currentTasting.roastery, item);
                          const matchedCoffee = supabaseCoffees.find(c => c.coffee_name === item);
                          
                          if (matchedCoffee) {
                            if (matchedCoffee.origin) updateField('origin', matchedCoffee.origin);
                            if (matchedCoffee.variety) updateField('variety', matchedCoffee.variety);
                            if (matchedCoffee.process) updateField('process', matchedCoffee.process);
                            if (matchedCoffee.altitude) updateField('altitude', matchedCoffee.altitude);
                            if (matchedCoffee.region) {
                              const origin = matchedCoffee.origin 
                                ? `${matchedCoffee.origin} / ${matchedCoffee.region}`
                                : matchedCoffee.region;
                              updateField('origin', origin);
                            }
                          } else {
                            handleCoffeeNameParse(item);
                          }
                        }
                      } else {
                        handleCoffeeNameParse(item);
                      }
                    }}
                    onBlur={() => {
                      if (currentTasting.coffeeName) {
                        handleCoffeeNameParse(currentTasting.coffeeName);
                      }
                    }}
                    suggestions={coffeeNameSuggestions}
                    placeholder="예: 에티오피아 예가체프 G1"
                    label="커피 이름 *"
                  />
                </InputGroup>

                {/* Coffee Details Accordion */}
                <AccordionHeader onPress={() => setShowCoffeeDetails(!showCoffeeDetails)}>
                  <YStack flex={1}>
                    <Text fontSize={16} fontWeight="600" color="$color">
                      상세 정보
                    </Text>
                  </YStack>
                  <ChevronRight 
                    size={20} 
                    color="$gray11"
                    animation="quick"
                    rotate={showCoffeeDetails ? '90deg' : '0deg'}
                  />
                </AccordionHeader>

                <AnimatePresence>
                  {showCoffeeDetails && (
                    <AccordionContent
                      animation="lazy"
                      enterStyle={{ opacity: 0, y: -10 }}
                      exitStyle={{ opacity: 0, y: -10 }}
                    >
                      {/* Origin */}
                      <InputGroup zIndex={originSuggestions.length > 0 && currentTasting.origin ? 5 : 1}>
                        <AutocompleteInputTamaguiTamagui
                          value={currentTasting.origin || ''}
                          onChangeText={(text) => updateField('origin', text)}
                          onSelect={(item) => updateField('origin', item)}
                          suggestions={originSuggestions}
                          placeholder="예: Ethiopia / Yirgacheffe"
                          label="생산지"
                        />
                      </InputGroup>

                      {/* Variety */}
                      <InputGroup zIndex={varietySuggestions.length > 0 && currentTasting.variety ? 4 : 1}>
                        <AutocompleteInputTamaguiTamagui
                          value={currentTasting.variety || ''}
                          onChangeText={(text) => updateField('variety', text)}
                          onSelect={(item) => updateField('variety', item)}
                          suggestions={varietySuggestions}
                          placeholder="예: Heirloom, Geisha"
                          label="품종"
                        />
                      </InputGroup>

                      {/* Process */}
                      <InputGroup zIndex={processSuggestions.length > 0 && currentTasting.process ? 3 : 1}>
                        <AutocompleteInputTamaguiTamagui
                          value={currentTasting.process || ''}
                          onChangeText={(text) => updateField('process', text)}
                          onSelect={(item) => updateField('process', item)}
                          suggestions={processSuggestions}
                          placeholder="예: Washed, Natural"
                          label="가공 방식"
                        />
                      </InputGroup>

                      {/* Altitude */}
                      <InputGroup>
                        <StyledLabel>고도</StyledLabel>
                        <StyledInput
                          placeholder="예: 1,800-2,000m"
                          placeholderTextColor="$gray10"
                          value={currentTasting.altitude}
                          onChangeText={(text) => updateField('altitude', text)}
                        />
                      </InputGroup>

                      {/* Roasting Level */}
                      <InputGroup>
                        <StyledLabel>로스팅 레벨</StyledLabel>
                        <RoastLevelButtons>
                          {roastLevelOptions.map((level) => (
                            <RoastButton
                              key={level}
                              active={currentTasting.roastLevel === level}
                              onPress={() => updateField('roastLevel', currentTasting.roastLevel === level ? '' : level)}
                              animation="quick"
                            >
                              <RoastButtonText active={currentTasting.roastLevel === level}>
                                {level === 'Light' ? '☕ Light' : 
                                 level === 'Medium' ? '🟤 Medium' : 
                                 '⚫ Dark'}
                              </RoastButtonText>
                            </RoastButton>
                          ))}
                        </RoastLevelButtons>
                      </InputGroup>
                    </AccordionContent>
                  )}
                </AnimatePresence>

                {/* Temperature Selection */}
                <InputGroup>
                  <StyledLabel>온도 *</StyledLabel>
                  <TemperatureButtons>
                    <TemperatureButton
                      active={currentTasting.temperature === 'hot'}
                      onPress={() => updateField('temperature', currentTasting.temperature === 'hot' ? 'cold' : 'hot')}
                      animation="quick"
                    >
                      <TemperatureButtonText active={currentTasting.temperature === 'hot'}>
                        ☕ Hot
                      </TemperatureButtonText>
                    </TemperatureButton>
                    <TemperatureButton
                      active={currentTasting.temperature === 'cold'}
                      onPress={() => updateField('temperature', currentTasting.temperature === 'cold' ? 'hot' : 'cold')}
                      animation="quick"
                    >
                      <TemperatureButtonText active={currentTasting.temperature === 'cold'}>
                        🧊 Ice
                      </TemperatureButtonText>
                    </TemperatureButton>
                  </TemperatureButtons>
                </InputGroup>
              </FormContainer>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Bottom Button */}
          <BottomContainer>
            <NextButton
              flex={1}
              disabled={!isValid}
              onPress={handleNext}
              animation="quick"
            >
              <NextButtonText>다음</NextButtonText>
            </NextButton>
          </BottomContainer>
        </YStack>
        
        {/* Coffee Add Modal */}
        <AddCoffeeModal
          visible={showAddCoffeeModal}
          onClose={() => setShowAddCoffeeModal(false)}
          roastery={currentTasting.roastery || ''}
          onCoffeeAdded={(coffeeName) => {
            updateField('coffeeName', coffeeName);
            setShowAddCoffeeModal(false);
          }}
        />
      </SafeAreaView>
    </Container>
  );
};

export default CoffeeInfoScreenTamagui;