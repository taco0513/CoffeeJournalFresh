import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTastingStore } from '../stores/tastingStore';
import { HIGColors, HIGConstants } from '../styles/common';
import { SimpleHomeCafeData, SimpleDripper } from '../types/tasting';
import { Logger } from '../services/LoggingService';
import {
  Card,
  InputCard,
  ResultCard,
  Input,
  NumberInput,
  WheelPicker,
  SegmentedPicker,
  ButtonGroup,
  createStyles,
  useTheme,
} from '../design-system';

const HOMECAFE_RECIPE_KEY = '@homecafe_last_recipe';
const MY_COFFEE_RECIPE_KEY = '@homecafe_my_coffee_recipe';

export const HomeCafeSimpleForm = () => {
  const { currentTasting, updateSimpleHomeCafeData } = useTastingStore();
  const theme = useTheme();
  
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
  const [selectedRatio, setSelectedRatio] = useState<number>(15); // 1:15 기본값

  // 저장된 레시피 불러오기
  const loadSavedRecipe = async () => {
    try {
      const savedRecipe = await AsyncStorage.getItem(HOMECAFE_RECIPE_KEY);
      if (savedRecipe) {
        const parsedRecipe = JSON.parse(savedRecipe);
        Logger.debug('🔄 HomeCafe: Loaded saved recipe:', 'component', { component: 'HomeCafeSimpleForm', data: parsedRecipe });
        setFormData(parsedRecipe);
        updateSimpleHomeCafeData(parsedRecipe);
    }
  } catch (error) {
      Logger.error('❌ HomeCafe: Failed to load saved recipe:', 'component', { component: 'HomeCafeSimpleForm', error: error });
  }
};

  // 레시피 자동 저장
  const saveRecipe = async (recipeData: SimpleHomeCafeData) => {
    try {
      await AsyncStorage.setItem(HOMECAFE_RECIPE_KEY, JSON.stringify(recipeData));
      Logger.debug('💾 HomeCafe: Recipe auto-saved:', 'component', { component: 'HomeCafeSimpleForm', data: recipeData });
  } catch (error) {
      Logger.error('❌ HomeCafe: Failed to save recipe:', 'component', { component: 'HomeCafeSimpleForm', error: error });
  }
};

  // '나의 커피' 레시피 저장
  const saveMyCoffeeRecipe = async () => {
    try {
      await AsyncStorage.setItem(MY_COFFEE_RECIPE_KEY, JSON.stringify(formData));
      setMyCoffeeRecipe(formData);
      Logger.debug('☕ HomeCafe: My Coffee recipe saved:', 'component', { component: 'HomeCafeSimpleForm', data: formData });
  } catch (error) {
      Logger.error('❌ HomeCafe: Failed to save My Coffee recipe:', 'component', { component: 'HomeCafeSimpleForm', error: error });
  }
};

  // '나의 커피' 레시피 불러오기
  const loadMyCoffeeRecipe = async () => {
    try {
      const savedMyCoffee = await AsyncStorage.getItem(MY_COFFEE_RECIPE_KEY);
      if (savedMyCoffee) {
        const parsedMyCoffee = JSON.parse(savedMyCoffee);
        setMyCoffeeRecipe(parsedMyCoffee);
        Logger.debug('☕ HomeCafe: My Coffee recipe loaded:', 'component', { component: 'HomeCafeSimpleForm', data: parsedMyCoffee });
    }
  } catch (error) {
      Logger.error('❌ HomeCafe: Failed to load My Coffee recipe:', 'component', { component: 'HomeCafeSimpleForm', error: error });
  }
};

  // '나의 커피' 레시피 적용
  const applyMyCoffeeRecipe = () => {
    if (myCoffeeRecipe) {
      setFormData(myCoffeeRecipe);
      updateSimpleHomeCafeData(myCoffeeRecipe);
      saveRecipe(myCoffeeRecipe); // 마지막 사용 레시피로도 저장
      setSelectedPreset('나의 커피');
      Logger.debug('☕ HomeCafe: My Coffee recipe applied:', 'component', { component: 'HomeCafeSimpleForm', data: myCoffeeRecipe });
  }
};

  // 컴포넌트 마운트 시 저장된 레시피들 로드
  useEffect(() => {
    loadSavedRecipe();
    loadMyCoffeeRecipe();
}, []);

  // 현재 테이스팅 데이터가 있으면 우선 적용
  useEffect(() => {
    if (currentTasting.simpleHomeCafeData) {
      setFormData(currentTasting.simpleHomeCafeData);
      if (currentTasting.simpleHomeCafeData.recipe.lapTimes) {
        setLapTimes(currentTasting.simpleHomeCafeData.recipe.lapTimes);
    }
      // 현재 데이터에서 비율 계산
      const currentRatio = currentTasting.simpleHomeCafeData.recipe.waterAmount / currentTasting.simpleHomeCafeData.recipe.coffeeAmount;
      const roundedRatio = Math.round(currentRatio * 2) / 2; // 0.5 단위로 반올림
      if (roundedRatio >= 15 && roundedRatio <= 18) {
        setSelectedRatio(roundedRatio);
    }
  }
}, [currentTasting.simpleHomeCafeData]);

  // formData가 변경될 때 비율 업데이트
  useEffect(() => {
    if (formData.recipe.coffeeAmount > 0) {
      const currentRatio = formData.recipe.waterAmount / formData.recipe.coffeeAmount;
      const roundedRatio = Math.round(currentRatio * 2) / 2; // 0.5 단위로 반올림
      if (roundedRatio >= 15 && roundedRatio <= 18) {
        setSelectedRatio(roundedRatio);
    }
  }
}, [formData.recipe.coffeeAmount, formData.recipe.waterAmount]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
    }, 1000);
  }
    return () => clearInterval(interval);
}, [isTimerRunning]);

  const updateField = (field: keyof SimpleHomeCafeData, value: unknown) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    updateSimpleHomeCafeData(updatedFormData);
    // 자동 저장
    saveRecipe(updatedFormData);
    Logger.debug('📝 HomeCafe: Updated ${field}:', 'component', { component: 'HomeCafeSimpleForm', data: value });
};

  const handleCoffeeAmountChange = (coffeeAmount: number) => {
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
    // 자동 저장
    saveRecipe(updatedFormData);
    Logger.debug('📝 HomeCafe: Updated coffee amount and auto-calculated water:', 'component', { component: 'HomeCafeSimpleForm', data: { coffeeAmount, waterAmount } });
};

  const handleRatioChange = (ratio: number) => {
    setSelectedRatio(ratio);
    const waterAmount = Math.round(formData.recipe.coffeeAmount * ratio);
    const updatedFormData = {
      ...formData,
      recipe: {
        ...formData.recipe,
        waterAmount,
    },
  };
    setFormData(updatedFormData);
    updateSimpleHomeCafeData(updatedFormData);
    // 자동 저장
    saveRecipe(updatedFormData);
    Logger.debug('📝 HomeCafe: Updated ratio and auto-calculated water:', 'component', { component: 'HomeCafeSimpleForm', data: { ratio, waterAmount } });
};

  const handleTimerStart = () => {
    setIsTimerRunning(true);
    setElapsedTime(0);
    setLapTimes([]);
};

  const handleLapTime = () => {
    const lapLabels = ['1차 추출(뜸)', '2차 추출', '3차 추출', '4차 추출', '5차 추출'];
    const currentLapIndex = lapTimes.length;
    const label = currentLapIndex < lapLabels.length ? lapLabels[currentLapIndex] : `${currentLapIndex + 1}차 추출`;
    
    setLapTimes([...lapTimes, { time: elapsedTime, label }]);
};

  const handleTimerStop = () => {
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
    // 자동 저장
    saveRecipe(updatedFormData);
};

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

  const calculateRatio = () => {
    const ratio = formData.recipe.waterAmount / formData.recipe.coffeeAmount;
    return `1:${ratio.toFixed(1)}`;
};

  // 비율 옵션 생성 (1:15 ~ 1:18, 0.5 단위)
  const ratioOptions = [];
  for (let i = 15; i <= 18; i += 0.5) {
    ratioOptions.push({ label: `1:${i}`, value: i });
}

  const drippers = [
    { label: '🔻 V60', value: 'V60' },
    { label: '〰️ 칼리타', value: 'KalitaWave' },
    { label: '⏳ 케멕스', value: 'Chemex' },
    { label: '☕ 기타', value: 'Other' },
  ];

  const basePresetRecipes = [
    { name: '아침 V60', coffee: 15, water: 250, temp: 93 },
    { name: '진한 커피', coffee: 20, water: 300, temp: 92 },
    { name: '연한 커피', coffee: 12, water: 200, temp: 94 },
  ];

  // 나의 커피 레시피가 있으면 프리셋 맨 앞에 추가
  const presetRecipes = myCoffeeRecipe 
    ? [
        { 
          name: '나의 커피', 
          coffee: myCoffeeRecipe.recipe.coffeeAmount, 
          water: myCoffeeRecipe.recipe.waterAmount, 
          temp: myCoffeeRecipe.waterTemp || 93 
      },
        ...basePresetRecipes
      ]
    : basePresetRecipes;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 드리퍼 선택 */}
        <InputCard 
          title="드리퍼 선택"
          description="사용할 드리퍼를 선택해주세요"
          style={styles.section}
        >
          <SegmentedPicker
            items={drippers}
            selectedValue={formData.dripper}
            onValueChange={(value) => updateField('dripper', value)}
            columns={2}
          />
        </InputCard>

        {/* 프리셋 레시피 */}
        <InputCard 
          title="빠른 레시피"
          description="자주 사용하는 레시피를 선택하세요"
          style={styles.section}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.presetContainer}>
              {/* 나의 커피 저장 버튼 (나의 커피가 없을 때만 표시) - 맨 앞에 위치 */}
              {!myCoffeeRecipe && (
                <TouchableOpacity
                  style={[styles.presetCard, styles.saveMyCoffeeCard]}
                  activeOpacity={0.7}
                  onPress={saveMyCoffeeRecipe}
                >
                  <Text style={styles.saveMyCoffeeName}>+ 나의 커피</Text>
                  <Text style={styles.saveMyCoffeeDetails}>현재 설정 저장</Text>
                </TouchableOpacity>
              )}
              
              {presetRecipes.map((preset, index) => {
                // Check if this preset is currently selected
                const isSelected = formData.recipe.coffeeAmount === preset.coffee &&
                                 formData.recipe.waterAmount === preset.water &&
                                 formData.waterTemp === preset.temp;
                
                // '나의 커피' 버튼인 경우 특별한 처리
                const isMyCoffeePreset = preset.name === '나의 커피';
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.presetCard,
                      isSelected && styles.presetCardSelected,
                      isMyCoffeePreset && styles.myCoffeeCard
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (isMyCoffeePreset) {
                        // 나의 커피 레시피 적용
                        applyMyCoffeeRecipe();
                    } else {
                        // 일반 프리셋 적용
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
                        // 자동 저장
                        saveRecipe(updatedFormData);
                    }
                  }}
                    onLongPress={isMyCoffeePreset ? saveMyCoffeeRecipe : undefined}
                  >
                    <Text style={[
                      styles.presetName,
                      isSelected && styles.presetNameSelected,
                      isMyCoffeePreset && styles.myCoffeeName
                    ]}>
                      {isMyCoffeePreset ? '☕ ' + preset.name : preset.name}
                    </Text>
                    <Text style={[
                      styles.presetDetails,
                      isSelected && styles.presetDetailsSelected,
                      isMyCoffeePreset && styles.myCoffeeDetails
                    ]}>
                      {preset.coffee}g : {preset.water}ml
                    </Text>
                  </TouchableOpacity>
                );
            })}
            </View>
          </ScrollView>
        </InputCard>

        {/* 기본 레시피 입력 */}
        <View style={styles.section}>
          {/* 원두량 입력 */}
          <InputCard 
            title="원두량"
            description="그램 단위로 입력해주세요"
            style={styles.recipeCard}
          >
            <NumberInput
              value={formData.recipe.coffeeAmount}
              onChangeValue={handleCoffeeAmountChange}
              unit="g"
              placeholder="15"
              min={1}
              max={50}
            />
          </InputCard>

          {/* 비율 선택 */}
          <InputCard 
            title="추출 비율"
            description="커피:물 비율을 선택해주세요"
            style={styles.recipeCard}
          >
            <WheelPicker
              items={ratioOptions}
              selectedValue={selectedRatio}
              onValueChange={handleRatioChange}
            />
          </InputCard>

          {/* 물량 표시 (자동계산) */}
          <ResultCard 
            title="물량"
            badge="✨ 자동 계산됨"
            style={styles.recipeCard}
          >
            <View style={styles.resultDisplay}>
              <Text style={styles.resultValue}>{formData.recipe.waterAmount}</Text>
              <Text style={styles.resultUnit}>ml</Text>
            </View>
            <Text style={styles.ratioDisplay}>
              현재 비율: {calculateRatio()}
            </Text>
          </ResultCard>
        </View>

        {/* 타이머 */}
        <InputCard
          title="추출 타이머"
          description="추출 시간을 기록해보세요"
          style={styles.section}
        >
          {!isTimerRunning && lapTimes.length === 0 ? (
            <TouchableOpacity 
              style={styles.timerButton}
              onPress={handleTimerStart}
            >
              <Text style={styles.timerIcon}>⏱️</Text>
              <View>
                <Text style={styles.timerTitle}>타이머 시작</Text>
                <Text style={styles.timerTime}>
                  {formatTime(formData.recipe.brewTime || 0)}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View>
              <View style={styles.timerDisplay}>
                <Text style={styles.timerIcon}>⏱️</Text>
                <Text style={styles.runningTime}>
                  {formatTime(elapsedTime)}
                </Text>
              </View>
              
              {/* Lap times */}
              {lapTimes.length > 0 && (
                <View style={styles.lapTimesContainer}>
                  {lapTimes.map((lap, index) => (
                    <View key={index} style={styles.lapTimeRow}>
                      <Text style={styles.lapLabel}>{lap.label}</Text>
                      <Text style={styles.lapTime}>{formatTime(lap.time)}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Control buttons */}
              <View style={styles.timerControls}>
                {isTimerRunning && (
                  <TouchableOpacity
                    style={[styles.controlButton, styles.lapButton]}
                    onPress={handleLapTime}
                  >
                    <Text style={styles.controlButtonText}>추출타임</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.controlButton, styles.stopButton]}
                  onPress={handleTimerStop}
                >
                  <Text style={styles.controlButtonText}>
                    {isTimerRunning ? '정지' : '완료'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </InputCard>

        {/* 선택 입력 (고급 옵션) */}
        <TouchableOpacity 
          style={styles.advancedToggle}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Text style={styles.advancedToggleText}>
            상세 설정 {showAdvanced ? '−' : '+'}
          </Text>
        </TouchableOpacity>

        {showAdvanced && (
          <InputCard
            title="상세 설정"
            description="물 온도와 추가 메모를 입력하세요"
            style={styles.section}
          >
            <NumberInput
              label="물 온도"
              value={formData.waterTemp || 93}
              onChangeValue={(value) => updateField('waterTemp', value)}
              unit="°C"
              min={80}
              max={100}
              step={1}
            />
            
            <Input
              label="그라인딩 메모"
              value={formData.grindNote || ''}
              onChangeText={(text) => updateField('grindNote', text)}
              placeholder="예: 2클릭 더 굵게"
              multiline
            />
          </InputCard>
        )}

        {/* 추출 노트 */}
        <InputCard
          title="추출 노트"
          description="오늘의 추출에 대한 메모를 남겨보세요 (선택사항)"
          style={styles.section}
        >
          <Input
            value={formData.quickNote || ''}
            onChangeText={(text) => updateField('quickNote', text)}
            placeholder="예: 블룸 30초, 첫 붓기 천천히, 다음엔 물온도 1도 낮춰보기"
            multiline
            variant="filled"
          />
        </InputCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = createStyles((tokens) => ({
  container: {
    flex: 1,
},
  scrollView: {
    flex: 1,
},
  section: {
    marginBottom: tokens.spacing.sm,
},
  recipeCard: {
    marginBottom: tokens.spacing.sm,
},
  
  // Preset recipe styles
  presetContainer: {
    flexDirection: 'row',
    paddingLeft: tokens.spacing.md,
},
  presetCard: {
    backgroundColor: tokens.colors.background.primary,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    borderRadius: tokens.layout.radius.md,
    padding: tokens.spacing.md,
    marginRight: tokens.spacing.sm,
    minWidth: 120,
    alignItems: 'center',
},
  presetCardSelected: {
    backgroundColor: tokens.colors.primary[50],
    borderColor: tokens.colors.primary[500],
},
  myCoffeeCard: {
    borderStyle: 'dashed',
    borderColor: tokens.colors.primary[300],
},
  presetName: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
},
  presetNameSelected: {
    color: tokens.colors.primary[700],
},
  myCoffeeName: {
    color: tokens.colors.primary[600],
},
  presetDetails: {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
},
  presetDetailsSelected: {
    color: tokens.colors.primary[600],
},
  myCoffeeDetails: {
    color: tokens.colors.primary[500],
},
  saveMyCoffeeCard: {
    borderStyle: 'dashed',
    backgroundColor: tokens.colors.background.secondary,
},
  saveMyCoffeeName: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
},
  saveMyCoffeeDetails: {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.text.tertiary,
    textAlign: 'center',
},
  
  // Result display styles
  resultDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: tokens.spacing.sm,
},
  resultValue: {
    fontSize: tokens.typography.fontSize['6xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.primary[600],
},
  resultUnit: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.text.secondary,
    marginLeft: 4,
},
  ratioDisplay: {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
},
  
  // Timer styles
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.primary[50],
    borderRadius: tokens.layout.radius.md,
    padding: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.colors.primary[200],
},
  timerIcon: {
    fontSize: 24,
    marginRight: tokens.spacing.md,
},
  timerTitle: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
},
  timerTime: {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
},
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.md,
},
  runningTime: {
    fontSize: tokens.typography.fontSize['6xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.primary[600],
    marginLeft: tokens.spacing.sm,
},
  lapTimesContainer: {
    marginBottom: tokens.spacing.md,
},
  lapTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: tokens.colors.border.light,
},
  lapLabel: {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.primary,
},
  lapTime: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.primary[600],
},
  timerControls: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
},
  controlButton: {
    flex: 1,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.layout.radius.sm,
    alignItems: 'center',
},
  lapButton: {
    backgroundColor: tokens.colors.gray[100],
    borderWidth: 1,
    borderColor: tokens.colors.gray[300],
},
  stopButton: {
    backgroundColor: tokens.colors.primary[500],
},
  controlButtonText: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.text.primary,
},
  
  // Advanced toggle
  advancedToggle: {
    backgroundColor: tokens.colors.background.secondary,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.lg,
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
},
  advancedToggleText: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.text.secondary,
},
}));

export default HomeCafeSimpleForm;