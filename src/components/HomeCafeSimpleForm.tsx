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
import { useTastingStore } from '../stores/tastingStore';
import { HIGColors, HIGConstants } from '../styles/common';
import { SimpleHomeCafeData, SimpleDripper } from '../types/tasting';

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

  useEffect(() => {
    if (currentTasting.simpleHomeCafeData) {
      setFormData(currentTasting.simpleHomeCafeData);
      if (currentTasting.simpleHomeCafeData.recipe.lapTimes) {
        setLapTimes(currentTasting.simpleHomeCafeData.recipe.lapTimes);
      }
    }
  }, [currentTasting.simpleHomeCafeData]);

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
  };

  const updateRecipeField = (field: keyof SimpleHomeCafeData['recipe'], value: number) => {
    const updatedFormData = {
      ...formData,
      recipe: { ...formData.recipe, [field]: value }
    };
    setFormData(updatedFormData);
    updateSimpleHomeCafeData(updatedFormData);
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

  const drippers: { key: SimpleDripper; label: string; icon: string }[] = [
    { key: 'V60', label: 'V60', icon: '🔻' },
    { key: 'KalitaWave', label: '칼리타', icon: '〰️' },
    { key: 'Chemex', label: '케멕스', icon: '⏳' },
    { key: 'Other', label: '기타', icon: '☕' },
  ];

  const presetRecipes = [
    { name: '아침 V60', coffee: 15, water: 250, temp: 93 },
    { name: '진한 커피', coffee: 20, water: 300, temp: 92 },
    { name: '연한 커피', coffee: 12, water: 200, temp: 94 },
  ];

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
              {presetRecipes.map((preset, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.presetCard}
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
                  }}
                >
                  <Text style={styles.presetName}>{preset.name}</Text>
                  <Text style={styles.presetDetails}>
                    {preset.coffee}g : {preset.water}ml
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 기본 레시피 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>레시피</Text>
          <View style={styles.recipeContainer}>
            <View style={styles.recipeRow}>
              <Text style={styles.recipeLabel}>원두</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.recipeInput}
                  value={formData.recipe.coffeeAmount.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text) || 0;
                    updateRecipeField('coffeeAmount', value);
                  }}
                  keyboardType="numeric"
                  placeholder="15"
                />
                <Text style={styles.unit}>g</Text>
              </View>
            </View>

            <View style={styles.recipeRow}>
              <Text style={styles.recipeLabel}>물</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.recipeInput}
                  value={formData.recipe.waterAmount.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text) || 0;
                    updateRecipeField('waterAmount', value);
                  }}
                  keyboardType="numeric"
                  placeholder="250"
                />
                <Text style={styles.unit}>ml</Text>
              </View>
            </View>

            <View style={styles.ratioContainer}>
              <Text style={styles.ratioText}>비율 {calculateRatio()}</Text>
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
  },
  presetName: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 2,
  },
  presetDetails: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
  },
  recipeContainer: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_MD,
  },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: HIGConstants.SPACING_MD,
  },
  recipeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeInput: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusSmall,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    minWidth: 60,
    textAlign: 'center',
  },
  unit: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    marginLeft: HIGConstants.SPACING_SM,
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