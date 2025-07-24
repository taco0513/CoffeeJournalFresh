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

const HOMECAFE_RECIPE_KEY = '@homecafe_last_recipe';
const MY_COFFEE_RECIPE_KEY = '@homecafe_my_coffee_recipe';

export const HomeCafeSimpleForm = () => {
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
  const [selectedRatio, setSelectedRatio] = useState<number>(15); // 1:15 기본값

  // 저장된 레시피 불러오기
  const loadSavedRecipe = async () => {
    try {
      const savedRecipe = await AsyncStorage.getItem(HOMECAFE_RECIPE_KEY);
      if (savedRecipe) {
        const parsedRecipe = JSON.parse(savedRecipe);
        console.log('🔄 HomeCafe: Loaded saved recipe:', parsedRecipe);
        setFormData(parsedRecipe);
        updateSimpleHomeCafeData(parsedRecipe);
      }
    } catch (error) {
      console.error('❌ HomeCafe: Failed to load saved recipe:', error);
    }
  };

  // 레시피 자동 저장
  const saveRecipe = async (recipeData: SimpleHomeCafeData) => {
    try {
      await AsyncStorage.setItem(HOMECAFE_RECIPE_KEY, JSON.stringify(recipeData));
      console.log('💾 HomeCafe: Recipe auto-saved:', recipeData);
    } catch (error) {
      console.error('❌ HomeCafe: Failed to save recipe:', error);
    }
  };

  // '나의 커피' 레시피 저장
  const saveMyCoffeeRecipe = async () => {
    try {
      await AsyncStorage.setItem(MY_COFFEE_RECIPE_KEY, JSON.stringify(formData));
      setMyCoffeeRecipe(formData);
      console.log('☕ HomeCafe: My Coffee recipe saved:', formData);
      // 사용자에게 저장되었다는 피드백 (간단한 alert 대신 나중에 toast로 대체 가능)
      // Alert.alert('저장 완료', '나의 커피 레시피가 저장되었습니다.');
    } catch (error) {
      console.error('❌ HomeCafe: Failed to save My Coffee recipe:', error);
    }
  };

  // '나의 커피' 레시피 불러오기
  const loadMyCoffeeRecipe = async () => {
    try {
      const savedMyCoffee = await AsyncStorage.getItem(MY_COFFEE_RECIPE_KEY);
      if (savedMyCoffee) {
        const parsedMyCoffee = JSON.parse(savedMyCoffee);
        setMyCoffeeRecipe(parsedMyCoffee);
        console.log('☕ HomeCafe: My Coffee recipe loaded:', parsedMyCoffee);
      }
    } catch (error) {
      console.error('❌ HomeCafe: Failed to load My Coffee recipe:', error);
    }
  };

  // '나의 커피' 레시피 적용
  const applyMyCoffeeRecipe = () => {
    if (myCoffeeRecipe) {
      setFormData(myCoffeeRecipe);
      updateSimpleHomeCafeData(myCoffeeRecipe);
      saveRecipe(myCoffeeRecipe); // 마지막 사용 레시피로도 저장
      setSelectedPreset('나의 커피');
      console.log('☕ HomeCafe: My Coffee recipe applied:', myCoffeeRecipe);
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

  const updateField = (field: keyof SimpleHomeCafeData, value: any) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    updateSimpleHomeCafeData(updatedFormData);
    // 자동 저장
    saveRecipe(updatedFormData);
  };

  const updateRecipeField = (field: keyof SimpleHomeCafeData['recipe'], value: number) => {
    const updatedFormData = {
      ...formData,
      recipe: { ...formData.recipe, [field]: value }
    };
    setFormData(updatedFormData);
    updateSimpleHomeCafeData(updatedFormData);
    // 자동 저장
    saveRecipe(updatedFormData);
  };

  // 비율 변경 시 물량 자동 계산
  const handleRatioChange = (ratio: number) => {
    setSelectedRatio(ratio);
    const newWaterAmount = Math.round(formData.recipe.coffeeAmount * ratio);
    const updatedFormData = {
      ...formData,
      recipe: { 
        ...formData.recipe, 
        waterAmount: newWaterAmount 
      }
    };
    setFormData(updatedFormData);
    updateSimpleHomeCafeData(updatedFormData);
    // 자동 저장
    saveRecipe(updatedFormData);
  };

  // 원두량 변경 시 비율에 맞춰 물량 자동 계산
  const handleCoffeeAmountChange = (coffeeAmount: number) => {
    const newWaterAmount = Math.round(coffeeAmount * selectedRatio);
    const updatedFormData = {
      ...formData,
      recipe: { 
        ...formData.recipe, 
        coffeeAmount: coffeeAmount,
        waterAmount: newWaterAmount 
      }
    };
    setFormData(updatedFormData);
    updateSimpleHomeCafeData(updatedFormData);
    // 자동 저장
    saveRecipe(updatedFormData);
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
    ratioOptions.push(i);
  }

  const drippers: { key: SimpleDripper; label: string; icon: string }[] = [
    { key: 'V60', label: 'V60', icon: '🔻' },
    { key: 'KalitaWave', label: '칼리타', icon: '〰️' },
    { key: 'Chemex', label: '케멕스', icon: '⏳' },
    { key: 'Other', label: '기타', icon: '☕' },
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>드리퍼 선택</Text>
          <View style={styles.dripperGrid}>
            {drippers.map((dripper) => (
              <TouchableOpacity
                key={dripper.key}
                style={[
                  styles.dripperCard,
                  formData.dripper === dripper.key && styles.dripperCardActive
                ]}
                onPress={() => updateField('dripper', dripper.key)}
              >
                <Text style={styles.dripperIcon}>{dripper.icon}</Text>
                <Text style={[
                  styles.dripperLabel,
                  formData.dripper === dripper.key && styles.dripperLabelActive
                ]}>
                  {dripper.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 프리셋 레시피 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>빠른 레시피</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.presetContainer}>
              {/* 나의 커피 저장 버튼 (나의 커피가 없을 때만 표시) - 맨 앞에 위치 */}
              {!myCoffeeRecipe && (
                <TouchableOpacity
                  style={styles.saveMyCoffeeCard}
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
        </View>

        {/* 기본 레시피 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>레시피</Text>
          
          {/* 원두량 입력 */}
          <View style={styles.recipeInputCard}>
            <View style={styles.recipeInputRow}>
              <View style={styles.inputLabelContainer}>
                <Text style={styles.inputLabel}>원두</Text>
                <Text style={styles.inputDescription}>그램 단위로 입력</Text>
              </View>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={styles.primaryInput}
                  value={formData.recipe.coffeeAmount.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text) || 0;
                    handleCoffeeAmountChange(value);
                  }}
                  keyboardType="numeric"
                  placeholder="15"
                  placeholderTextColor={HIGColors.tertiaryLabel}
                />
                <Text style={styles.inputUnit}>g</Text>
              </View>
            </View>
          </View>

          {/* 비율 선택 */}
          <View style={styles.recipeInputCard}>
            <View style={styles.ratioSection}>
              <View style={styles.inputLabelContainer}>
                <Text style={styles.inputLabel}>추출 비율</Text>
                <Text style={styles.inputDescription}>커피:물 비율 선택</Text>
              </View>
              <View style={styles.ratioWheelContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.ratioWheel}
                  snapToInterval={60}
                  decelerationRate="fast"
                >
                  {ratioOptions.map((ratio) => {
                    const isSelected = selectedRatio === ratio;
                    return (
                      <TouchableOpacity
                        key={ratio}
                        style={[
                          styles.ratioChip,
                          isSelected && styles.ratioChipSelected
                        ]}
                        onPress={() => handleRatioChange(ratio)}
                      >
                        <Text style={[
                          styles.ratioChipText,
                          isSelected && styles.ratioChipTextSelected
                        ]}>
                          1:{ratio}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </View>

          {/* 물량 표시 (자동계산) */}
          <View style={styles.recipeResultCard}>
            <View style={styles.recipeInputRow}>
              <View style={styles.inputLabelContainer}>
                <Text style={styles.inputLabel}>물량</Text>
                <Text style={styles.autoCalculationLabel}>✨ 자동 계산됨</Text>
              </View>
              <View style={styles.resultDisplay}>
                <Text style={styles.resultValue}>{formData.recipe.waterAmount}</Text>
                <Text style={styles.resultUnit}>ml</Text>
              </View>
            </View>
            
            {/* 계산 요약 */}
            <View style={styles.calculationSummary}>
              <Text style={styles.summaryText}>
                {formData.recipe.coffeeAmount}g × {selectedRatio} = {formData.recipe.waterAmount}ml
              </Text>
            </View>
          </View>

          {/* 타이머 */}
          <View style={styles.timerSection}>
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
          </View>
        </View>

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
          <View style={styles.section}>
            <View style={styles.advancedContainer}>
              <View style={styles.tempContainer}>
                <Text style={styles.tempLabel}>물 온도</Text>
                <View style={styles.tempInputWrapper}>
                  <TouchableOpacity
                    style={styles.tempButton}
                    onPress={() => updateField('waterTemp', (formData.waterTemp || 93) - 1)}
                  >
                    <Text style={styles.tempButtonText}>−</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.tempInput}
                    value={(formData.waterTemp || 93).toString()}
                    onChangeText={(text) => {
                      const value = parseInt(text) || 93;
                      updateField('waterTemp', value);
                    }}
                    keyboardType="numeric"
                  />
                  <Text style={styles.tempUnit}>°C</Text>
                  <TouchableOpacity
                    style={styles.tempButton}
                    onPress={() => updateField('waterTemp', (formData.waterTemp || 93) + 1)}
                  >
                    <Text style={styles.tempButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.grindContainer}>
                <Text style={styles.grindLabel}>그라인딩 메모</Text>
                <TextInput
                  style={styles.grindInput}
                  value={formData.grindNote || ''}
                  onChangeText={(text) => updateField('grindNote', text)}
                  placeholder="예: 2클릭 더 굵게"
                  placeholderTextColor={HIGColors.tertiaryLabel}
                />
              </View>
            </View>
          </View>
        )}

        {/* 추출 노트 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>추출 노트</Text>
          <TextInput
            style={styles.quickNoteInput}
            value={formData.quickNote}
            onChangeText={(text) => updateField('quickNote', text)}
            placeholder="예: 블룸 30초, 첫 붓기 천천히, 다음엔 물온도 1도 낮춰보기"
            placeholderTextColor={HIGColors.tertiaryLabel}
            multiline
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: HIGColors.white,
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_SM,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  dripperGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HIGConstants.SPACING_MD,
  },
  dripperCard: {
    flex: 1,
    minWidth: 70,
    maxWidth: 85,
    aspectRatio: 1,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dripperCardActive: {
    borderColor: HIGColors.systemBlue,
    backgroundColor: HIGColors.systemBlue + '10',
  },
  dripperIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  dripperLabel: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    fontWeight: '500',
  },
  dripperLabelActive: {
    color: HIGColors.systemBlue,
    fontWeight: '700',
  },
  presetContainer: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_SM,
  },
  presetCard: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    minWidth: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetCardSelected: {
    backgroundColor: HIGColors.systemBlue + '10',
    borderColor: HIGColors.systemBlue,
  },
  presetName: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 2,
  },
  presetNameSelected: {
    color: HIGColors.systemBlue,
    fontWeight: '700',
  },
  presetDetails: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
  },
  presetDetailsSelected: {
    color: HIGColors.systemBlue,
    fontWeight: '500',
  },
  // 나의 커피 관련 스타일
  myCoffeeCard: {
    backgroundColor: '#F0F8FF', // 연한 하늘색 배경
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderStyle: 'dashed', // 점선 테두리
  },
  myCoffeeName: {
    color: '#4A90E2',
    fontWeight: '700',
  },
  myCoffeeDetails: {
    color: '#4A90E2',
    fontWeight: '500',
  },
  // 나의 커피 저장 버튼 스타일
  saveMyCoffeeCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: HIGConstants.cornerRadiusMedium,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    minWidth: 100,
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveMyCoffeeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 2,
  },
  saveMyCoffeeDetails: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '400',
  },
  // 컴팩트한 레시피 카드 레이아웃
  recipeInputCard: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusSmall,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
    borderWidth: 1,
    borderColor: HIGColors.systemGray5,
  },
  recipeResultCard: {
    backgroundColor: '#F8FBFF', // 더 연한 파란 배경
    borderRadius: HIGConstants.cornerRadiusSmall,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  recipeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabelContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 1,
  },
  inputDescription: {
    fontSize: 11,
    color: HIGColors.tertiaryLabel,
    fontWeight: '400',
  },
  autoCalculationLabel: {
    fontSize: 11,
    color: '#1976D2',
    fontWeight: '500',
  },
  // 원두 입력 관련
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryInput: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    minWidth: 60,
    textAlign: 'center',
  },
  inputUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: HIGColors.secondaryLabel,
    marginLeft: HIGConstants.SPACING_XS,
  },
  // 비율 섹션 - 컴팩트하게
  ratioSection: {
    gap: HIGConstants.SPACING_SM,
  },
  ratioWheelContainer: {
    marginTop: HIGConstants.SPACING_XS,
  },
  ratioWheel: {
    paddingHorizontal: HIGConstants.SPACING_XS,
  },
  ratioChip: {
    width: 56,
    height: 32,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  ratioChipSelected: {
    backgroundColor: HIGColors.systemBlue,
    borderColor: HIGColors.systemBlue,
  },
  ratioChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: HIGColors.label,
  },
  ratioChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // 결과 표시 - 컴팩트하게
  resultDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.cornerRadiusSmall,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1976D2',
  },
  resultUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1976D2',
    marginLeft: HIGConstants.SPACING_XS,
  },
  // 계산 요약 - 간소화
  calculationSummary: {
    marginTop: HIGConstants.SPACING_XS,
    paddingTop: HIGConstants.SPACING_XS,
    borderTopWidth: 1,
    borderTopColor: '#E3F2FD',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 11,
    color: '#1976D2',
    fontWeight: '400',
    textAlign: 'center',
  },
  ratioContainer: {
    alignItems: 'center',
    paddingTop: HIGConstants.SPACING_SM,
    borderTopWidth: 1,
    borderTopColor: HIGColors.systemGray5,
  },
  ratioText: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    fontWeight: '500',
  },
  timerSection: {
    marginTop: HIGConstants.SPACING_MD,
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    gap: HIGConstants.SPACING_MD,
  },
  timerButtonActive: {
    backgroundColor: HIGColors.systemGreen + '20',
  },
  timerIcon: {
    fontSize: 32,
  },
  timerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
  },
  timerTime: {
    fontSize: 20,
    fontWeight: '700',
    color: HIGColors.systemGreen,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HIGColors.systemGreen + '20',
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_LG,
    gap: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_MD,
  },
  runningTime: {
    fontSize: 32,
    fontWeight: '700',
    color: HIGColors.systemGreen,
  },
  lapTimesContainer: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_MD,
  },
  lapTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: HIGConstants.SPACING_SM,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray5,
  },
  lapLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
  },
  lapTime: {
    fontSize: 14,
    fontWeight: '700',
    color: HIGColors.label,
  },
  timerControls: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_SM,
  },
  controlButton: {
    flex: 1,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.cornerRadiusSmall,
    alignItems: 'center',
  },
  lapButton: {
    backgroundColor: HIGColors.systemBlue,
  },
  stopButton: {
    backgroundColor: HIGColors.systemRed,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.white,
  },
  advancedToggle: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
  },
  advancedToggleText: {
    fontSize: 16,
    color: HIGColors.systemBlue,
    fontWeight: '600',
  },
  advancedContainer: {
    gap: HIGConstants.SPACING_LG,
  },
  tempContainer: {
    gap: HIGConstants.SPACING_SM,
  },
  tempLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
  },
  tempInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HIGConstants.SPACING_SM,
  },
  tempButton: {
    width: 36,
    height: 36,
    backgroundColor: HIGColors.systemGray5,
    borderRadius: HIGConstants.cornerRadiusSmall,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
  },
  tempInput: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusSmall,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    minWidth: 50,
    textAlign: 'center',
  },
  tempUnit: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
  },
  grindContainer: {
    gap: HIGConstants.SPACING_SM,
  },
  grindLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
  },
  grindInput: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusSmall,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_MD,
    fontSize: 16,
    color: HIGColors.label,
  },
  quickNoteInput: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_MD,
    fontSize: 16,
    color: HIGColors.label,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});