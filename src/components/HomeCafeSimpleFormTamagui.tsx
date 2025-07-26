import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  YStack,
  XStack,
  H2,
  H3,
  Text,
  Button,
  Card,
  Input,
  styled,
  Stack,
} from 'tamagui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTastingStore } from '../stores/tastingStore';
import { Logger } from '../services/LoggingService';
import { SimpleHomeCafeData, SimpleDripper } from '../types/tasting';

const HOMECAFE_RECIPE_KEY = '@homecafe_last_recipe';
const MY_COFFEE_RECIPE_KEY = '@homecafe_my_coffee_recipe';

// Styled Components
const FormContainer = styled(YStack, {
  flex: 1,
})

const Section = styled(Card, {
  margin: '$md',
  padding: '$md',
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
})

const SectionTitle = styled(H2, {
  fontSize: '$4', // 18px → 20px
  fontWeight: '600',
  marginBottom: '$sm',
  color: '$color',
})

const SectionDescription = styled(Text, {
  fontSize: '$2', // 14px
  color: '$gray11',
  marginBottom: '$md',
})

const PresetButton = styled(Button, {
  minWidth: 120,
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$3',
  padding: '$md',
  marginRight: '$sm',
  
  variants: {
    selected: {
      true: {
        backgroundColor: '$blue2',
        borderColor: '$primary',
        borderWidth: 2,
    },
  },
    myCoffee: {
      true: {
        borderStyle: 'dashed',
        borderColor: '$blue8',
    },
  },
} as const,
})

const DripperButton = styled(Button, {
  flex: 1,
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$3',
  padding: '$md',
  margin: '$xs',
  
  variants: {
    selected: {
      true: {
        backgroundColor: '$blue2',
        borderColor: '$primary',
        borderWidth: 2,
    },
  },
} as const,
})

const NumberInput = styled(Input, {
  flex: 1,
  backgroundColor: '$gray2',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$2',
  paddingHorizontal: '$md',
  height: 44,
  fontSize: '$4',
  textAlign: 'center',
})

const TimerButton = styled(Button, {
  backgroundColor: '$blue2',
  borderWidth: 1,
  borderColor: '$blue5',
  borderRadius: '$3',
  padding: '$md',
  flexDirection: 'row',
  alignItems: 'center',
})

const LapTimeRow = styled(XStack, {
  justifyContent: 'space-between',
  paddingVertical: 4,
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
})

const ControlButton = styled(Button, {
  flex: 1,
  height: 40,
  borderRadius: '$2',
  margin: '$xs',
  
  variants: {
    type: {
      lap: {
        backgroundColor: '$gray3',
        borderWidth: 1,
        borderColor: '$gray8',
    },
      stop: {
        backgroundColor: '$primary',
    },
  },
} as const,
})

const ResultCard = styled(Card, {
  backgroundColor: '$blue1',
  borderWidth: 1,
  borderColor: '$blue4',
  padding: '$md',
  alignItems: 'center',
})

export const HomeCafeSimpleFormTamagui = () => {
  const { currentTasting, updateSimpleHomeCafeData } = useTastingStore();
  
  const [formData, setFormData] = useState<SimpleHomeCafeData>({
    dripper: 'V60',
    recipe: {
      coffeeAmount: 15,
      waterAmount: 250,
  },
    waterTemp: 93,
});

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lapTimes, setLapTimes] = useState<{ time: number; label: string }[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [myCoffeeRecipe, setMyCoffeeRecipe] = useState<SimpleHomeCafeData | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<number>(15);

  // Load saved recipes
  useEffect(() => {
    loadSavedRecipe();
    loadMyCoffeeRecipe();
}, []);

  // Load current tasting data
  useEffect(() => {
    if (currentTasting.simpleHomeCafeData) {
      setFormData(currentTasting.simpleHomeCafeData);
      if (currentTasting.simpleHomeCafeData.recipe.lapTimes) {
        setLapTimes(currentTasting.simpleHomeCafeData.recipe.lapTimes);
    }
  }
}, [currentTasting.simpleHomeCafeData]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
    }, 1000);
  }
    return () => clearInterval(interval);
}, [isTimerRunning]);

  const loadSavedRecipe = async () => {
    try {
      const savedRecipe = await AsyncStorage.getItem(HOMECAFE_RECIPE_KEY);
      if (savedRecipe) {
        const parsedRecipe = JSON.parse(savedRecipe);
        setFormData(parsedRecipe);
        updateSimpleHomeCafeData(parsedRecipe);
    }
  } catch (error) {
      Logger.error('Failed to load saved recipe:', 'component', { component: 'HomeCafeSimpleFormTamagui', error: error });
  }
};

  const saveRecipe = async (recipeData: SimpleHomeCafeData) => {
    try {
      await AsyncStorage.setItem(HOMECAFE_RECIPE_KEY, JSON.stringify(recipeData));
  } catch (error) {
      Logger.error('Failed to save recipe:', 'component', { component: 'HomeCafeSimpleFormTamagui', error: error });
  }
};

  const loadMyCoffeeRecipe = async () => {
    try {
      const savedMyCoffee = await AsyncStorage.getItem(MY_COFFEE_RECIPE_KEY);
      if (savedMyCoffee) {
        setMyCoffeeRecipe(JSON.parse(savedMyCoffee));
    }
  } catch (error) {
      Logger.error('Failed to load My Coffee recipe:', 'component', { component: 'HomeCafeSimpleFormTamagui', error: error });
  }
};

  const saveMyCoffeeRecipe = async () => {
    try {
      await AsyncStorage.setItem(MY_COFFEE_RECIPE_KEY, JSON.stringify(formData));
      setMyCoffeeRecipe(formData);
  } catch (error) {
      Logger.error('Failed to save My Coffee recipe:', 'component', { component: 'HomeCafeSimpleFormTamagui', error: error });
  }
};

  const updateField = (field: keyof SimpleHomeCafeData, value: unknown) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    updateSimpleHomeCafeData(updatedFormData);
    saveRecipe(updatedFormData);
};

  const handleCoffeeAmountChange = (value: string) => {
    const coffeeAmount = parseInt(value) || 0;
    const waterAmount = Math.round(coffeeAmount * selectedRatio);
    const updatedFormData = {
      ...formData,
      recipe: {
        ...formData.recipe,
        coffeeAmount,
        waterAmount,
    },
  };
    setFormData(updatedFormData);
    updateSimpleHomeCafeData(updatedFormData);
    saveRecipe(updatedFormData);
};

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

  const drippers: { label: string; value: SimpleDripper }[] = [
    { label: 'V60', value: 'V60' },
    { label: '칼리타', value: 'KalitaWave' },
    { label: '케멕스', value: 'Chemex' },
    { label: '기타', value: 'Other' },
  ];

  const presetRecipes = myCoffeeRecipe 
    ? [
        { name: '나의 커피', coffee: myCoffeeRecipe.recipe.coffeeAmount, water: myCoffeeRecipe.recipe.waterAmount, temp: myCoffeeRecipe.waterTemp || 93 },
        { name: '아침 V60', coffee: 15, water: 250, temp: 93 },
        { name: '진한 커피', coffee: 20, water: 300, temp: 92 },
        { name: '연한 커피', coffee: 12, water: 200, temp: 94 },
      ]
    : [
        { name: '아침 V60', coffee: 15, water: 250, temp: 93 },
        { name: '진한 커피', coffee: 20, water: 300, temp: 92 },
        { name: '연한 커피', coffee: 12, water: 200, temp: 94 },
      ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <FormContainer>
          {/* Dripper Selection */}
          <Section elevate size="$4">
            <SectionTitle>드리퍼 선택</SectionTitle>
            <SectionDescription>사용할 드리퍼를 선택해주세요</SectionDescription>
            
            <XStack flexWrap="wrap">
              {drippers.map((dripper) => (
                <DripperButton
                  key={dripper.value}
                  selected={formData.dripper === dripper.value}
                  onPress={() => updateField('dripper', dripper.value)}
                  pressStyle={{ scale: 0.95 }}
                >
                  <Text fontSize="$2" fontWeight={formData.dripper === dripper.value ? '600' : '400'}>
                    {dripper.label}
                  </Text>
                </DripperButton>
              ))}
            </XStack>
          </Section>

          {/* Preset Recipes */}
          <Section elevate size="$4">
            <SectionTitle>빠른 레시피</SectionTitle>
            <SectionDescription>자주 사용하는 레시피를 선택하세요</SectionDescription>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack>
                {!myCoffeeRecipe && (
                  <PresetButton
                    onPress={saveMyCoffeeRecipe}
                    pressStyle={{ scale: 0.95 }}
                    >
                    <Text fontSize="$2" fontWeight="600">+ 나의 커피</Text>
                    <Text fontSize="$1" color="$gray11" marginTop={4}>현재 설정 저장</Text>
                  </PresetButton>
                )}
                
                {presetRecipes.map((preset, index) => {
                  const isSelected = formData.recipe.coffeeAmount === preset.coffee &&
                                   formData.recipe.waterAmount === preset.water &&
                                   formData.waterTemp === preset.temp;
                  
                  return (
                    <PresetButton
                      key={index}
                      selected={isSelected}
                      myCoffee={preset.name === '나의 커피'}
                      onPress={() => {
                        const updatedFormData = {
                          ...formData,
                          recipe: {
                            ...formData.recipe,
                            coffeeAmount: preset.coffee,
                            waterAmount: preset.water,
                        },
                          waterTemp: preset.temp,
                      };
                        setFormData(updatedFormData);
                        updateSimpleHomeCafeData(updatedFormData);
                        setSelectedPreset(preset.name);
                        saveRecipe(updatedFormData);
                    }}
                      pressStyle={{ scale: 0.95 }}
                        >
                      <Text 
                        fontSize="$2" 
                        fontWeight={isSelected ? '600' : '500'}
                        color={isSelected ? '$blue11' : '$color'}
                      >
                        {preset.name === '나의 커피' ? ' ' : ''}{preset.name}
                      </Text>
                      <Text 
                        fontSize="$1" 
                        color={isSelected ? '$blue10' : '$gray11'} 
                        marginTop={4}
                      >
                        {preset.coffee}g : {preset.water}ml
                      </Text>
                    </PresetButton>
                  );
              })}
              </XStack>
            </ScrollView>
          </Section>

          {/* Recipe Input */}
          <YStack space="$md" paddingHorizontal="$md">
            {/* Coffee Amount */}
            <Card padding="$md" backgroundColor="$background" borderWidth={1} borderColor="$borderColor">
              <H3 fontSize="$3" marginBottom="$sm">원두량</H3>
              <Text fontSize="$1" color="$gray11" marginBottom="$md">그램 단위로 입력해주세요</Text>
              <XStack alignItems="center" space="$md">
                <NumberInput
                  value={formData.recipe.coffeeAmount.toString()}
                  onChangeText={handleCoffeeAmountChange}
                  placeholder="15"
                  keyboardType="numeric"
                />
                <Text fontSize="$3" fontWeight="500">g</Text>
              </XStack>
            </Card>

            {/* Water Amount (Auto-calculated) */}
            <ResultCard elevate>
              <XStack alignItems="center" justifyContent="space-between" width="100%">
                <YStack>
                  <Text fontSize="$2" color="$gray11">물량</Text>
                  <Text fontSize="10" color="$blue11"> 자동 계산됨</Text>
                </YStack>
                <XStack alignItems="baseline" space="$xs">
                  <Text fontSize="$8" fontWeight="700" color="$blue11">
                    {formData.recipe.waterAmount}
                  </Text>
                  <Text fontSize="$4" fontWeight="500" color="$blue10">ml</Text>
                </XStack>
              </XStack>
              <Text fontSize="$1" color="$gray11" marginTop="$sm">
                현재 비율: 1:{(formData.recipe.waterAmount / formData.recipe.coffeeAmount).toFixed(1)}
              </Text>
            </ResultCard>
          </YStack>

          {/* Timer */}
          <Section elevate size="$4" marginTop="$md">
            <SectionTitle>추출 타이머</SectionTitle>
            <SectionDescription>추출 시간을 기록해보세요</SectionDescription>
            
            {!isTimerRunning && lapTimes.length === 0 ? (
              <TimerButton
                onPress={() => {
                  setIsTimerRunning(true);
                  setElapsedTime(0);
                  setLapTimes([]);
              }}
                pressStyle={{ scale: 0.95 }}
              >
                <Text fontSize="$6" marginRight="$md"></Text>
                <YStack>
                  <Text fontSize="$3" fontWeight="600">타이머 시작</Text>
                  <Text fontSize="$2" color="$gray11">
                    {formatTime(formData.recipe.brewTime || 0)}
                  </Text>
                </YStack>
              </TimerButton>
            ) : (
              <YStack space="$md">
                <XStack justifyContent="center" alignItems="center">
                  <Text fontSize="$6" marginRight="$md"></Text>
                  <Text fontSize="$8" fontWeight="700" color="$blue11">
                    {formatTime(elapsedTime)}
                  </Text>
                </XStack>
                
                {lapTimes.length > 0 && (
                  <YStack space="$xs">
                    {lapTimes.map((lap, index) => (
                      <LapTimeRow key={index}>
                        <Text fontSize="$2">{lap.label}</Text>
                        <Text fontSize="$2" fontWeight="500" color="$blue11">
                          {formatTime(lap.time)}
                        </Text>
                      </LapTimeRow>
                    ))}
                  </YStack>
                )}
                
                <XStack space="$sm">
                  {isTimerRunning && (
                    <ControlButton
                      type="lap"
                      onPress={() => {
                        const lapLabels = ['1차 추출(뜸)', '2차 추출', '3차 추출', '4차 추출', '5차 추출'];
                        const currentLapIndex = lapTimes.length;
                        const label = currentLapIndex < lapLabels.length ? lapLabels[currentLapIndex] : `${currentLapIndex + 1}차 추출`;
                        setLapTimes([...lapTimes, { time: elapsedTime, label }]);
                    }}
                    >
                      <Text fontSize="$2" fontWeight="500">추출타임</Text>
                    </ControlButton>
                  )}
                  <ControlButton
                    type="stop"
                    onPress={() => {
                      setIsTimerRunning(false);
                      const updatedFormData = {
                        ...formData,
                        recipe: { 
                          ...formData.recipe, 
                          brewTime: elapsedTime,
                          lapTimes: lapTimes 
                      }
                    };
                      setFormData(updatedFormData);
                      updateSimpleHomeCafeData(updatedFormData);
                      saveRecipe(updatedFormData);
                  }}
                  >
                    <Text fontSize="$2" fontWeight="600" color="white">
                      {isTimerRunning ? '정지' : '완료'}
                    </Text>
                  </ControlButton>
                </XStack>
              </YStack>
            )}
          </Section>

          {/* Advanced Options */}
          <Button
            backgroundColor="$gray2"
            borderWidth={0}
            onPress={() => setShowAdvanced(!showAdvanced)}
            marginHorizontal="$md"
            marginTop="$md"
          >
            <Text fontSize="$2" fontWeight="500" color="$gray11">
              상세 설정 {showAdvanced ? '−' : '+'}
            </Text>
          </Button>

            {showAdvanced && (
              <Section
                elevate
                size="$4"
              >
                <SectionTitle>상세 설정</SectionTitle>
                <SectionDescription>물 온도와 추가 메모를 입력하세요</SectionDescription>
                
                <YStack space="$md">
                  <YStack>
                    <Text fontSize="$2" marginBottom="$sm">물 온도</Text>
                    <XStack alignItems="center" space="$md">
                      <NumberInput
                        value={(formData.waterTemp || 93).toString()}
                        onChangeText={(text: string) => updateField('waterTemp', parseInt(text) || 93)}
                        placeholder="93"
                        keyboardType="numeric"
                      />
                      <Text fontSize="$3" fontWeight="500">°C</Text>
                    </XStack>
                  </YStack>
                  
                  <YStack>
                    <Text fontSize="$2" marginBottom="$sm">그라인딩 메모</Text>
                    <Input
                      value={formData.grindNote || ''}
                      onChangeText={(text: string) => updateField('grindNote', text)}
                      placeholder="예: 2클릭 더 굵게"
                      backgroundColor="$gray2"
                      borderWidth={1}
                      borderColor="$borderColor"
                      borderRadius="$2"
                      paddingHorizontal="$md"
                      height={80}
                      fontSize="$4"
                      multiline
                      textAlignVertical="top"
                    />
                  </YStack>
                </YStack>
              </Section>
            )}

          {/* Extraction Notes */}
          <Section elevate size="$4" marginTop="$md" marginBottom="$xl">
            <SectionTitle>추출 노트</SectionTitle>
            <SectionDescription>오늘의 추출에 대한 메모를 남겨보세요 (선택사항)</SectionDescription>
            
            <Input
              value={formData.quickNote || ''}
              onChangeText={(text: string) => updateField('quickNote', text)}
              placeholder="예: 블룸 30초, 첫 붓기 천천히, 다음엔 물온도 1도 낮춰보기"
              backgroundColor="$gray2"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$2"
              paddingHorizontal="$md"
              height={100}
              fontSize="$4"
              multiline
              textAlignVertical="top"
            />
          </Section>
        </FormContainer>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default HomeCafeSimpleFormTamagui;