import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTastingStore } from '../stores/tastingStore';
import { HIGColors, HIGConstants } from '../styles/common';
import { LabModeData, PouroverDripper, FilterType, PourTechnique } from '../types/tasting';

export const LabModeForm = () => {
  const { currentTasting, updateLabModeData } = useTastingStore();
  
  const [formData, setFormData] = useState<LabModeData>({
    equipment: {
      dripper: 'V60',
      filter: 'bleached',
    },
    recipe: {
      doseIn: 0,
      waterAmount: 0,
      ratio: '1:15',
      waterTemp: 93,
      bloomWater: 0,
      bloomTime: 30,
      pourTechnique: 'center',
      numberOfPours: 3,
      totalBrewTime: 0,
    },
    notes: {},
  });

  useEffect(() => {
    if (currentTasting.labModeData) {
      setFormData(currentTasting.labModeData);
    }
  }, [currentTasting.labModeData]);

  const updateField = (path: string, value: any) => {
    const keys = path.split('.');
    const updatedFormData = { ...formData };
    let current: any = updatedFormData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    
    // Calculate ratio if dose or water changed
    if (path === 'recipe.doseIn' || path === 'recipe.waterAmount') {
      if (updatedFormData.recipe.doseIn > 0) {
        const ratio = updatedFormData.recipe.waterAmount / updatedFormData.recipe.doseIn;
        updatedFormData.recipe.ratio = `1:${ratio.toFixed(1)}`;
      }
    }
    
    setFormData(updatedFormData);
    updateLabModeData(updatedFormData);
  };

  const allDrippers: { key: PouroverDripper; label: string }[] = [
    { key: 'V60', label: 'V60' },
    { key: 'KalitaWave', label: 'Kalita Wave' },
    { key: 'Origami', label: 'Origami' },
    { key: 'Chemex', label: 'Chemex' },
    { key: 'FellowStagg', label: 'Fellow Stagg' },
    { key: 'April', label: 'April' },
    { key: 'Orea', label: 'Orea' },
    { key: 'FlowerDripper', label: 'Flower' },
    { key: 'BluebottleDripper', label: 'Blue Bottle' },
    { key: 'TimemoreCrystalEye', label: 'Timemore' },
    { key: 'Other', label: '기타' },
  ];

  const filters: { key: FilterType; label: string }[] = [
    { key: 'bleached', label: '표백 필터' },
    { key: 'natural', label: '갈색 필터' },
    { key: 'wave', label: '웨이브' },
    { key: 'chemex', label: '케멕스' },
    { key: 'metal', label: '메탈' },
    { key: 'cloth', label: '융' },
  ];

  const pourTechniques: { key: PourTechnique; label: string; description: string }[] = [
    { key: 'center', label: '센터 포어', description: '중앙 집중' },
    { key: 'spiral', label: '스파이럴', description: '나선형' },
    { key: 'pulse', label: '펄스', description: '단계별' },
    { key: 'continuous', label: '연속', description: '끊김 없이' },
    { key: 'multiStage', label: '다단계', description: '여러 번' },
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Equipment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>장비 설정</Text>
          
          {/* Dripper Selection */}
          <Text style={styles.fieldLabel}>드리퍼</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            <View style={styles.chipContainer}>
              {allDrippers.map((dripper) => (
                <TouchableOpacity
                  key={dripper.key}
                  style={[
                    styles.chip,
                    formData.equipment.dripper === dripper.key && styles.chipActive
                  ]}
                  onPress={() => updateField('equipment.dripper', dripper.key)}
                >
                  <Text style={[
                    styles.chipText,
                    formData.equipment.dripper === dripper.key && styles.chipTextActive
                  ]}>
                    {dripper.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Dripper Size */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>드리퍼 사이즈</Text>
            <TextInput
              style={styles.textInput}
              value={formData.equipment.dripperSize || ''}
              onChangeText={(text) => updateField('equipment.dripperSize', text)}
              placeholder="01, 02, 155..."
              placeholderTextColor={HIGColors.tertiaryLabel}
            />
          </View>

          {/* Filter Selection */}
          <Text style={styles.fieldLabel}>필터</Text>
          <View style={styles.gridContainer}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.gridItem,
                  formData.equipment.filter === filter.key && styles.gridItemActive
                ]}
                onPress={() => updateField('equipment.filter', filter.key)}
              >
                <Text style={[
                  styles.gridItemText,
                  formData.equipment.filter === filter.key && styles.gridItemTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Grinder Info */}
          <View style={styles.grinderSection}>
            <Text style={styles.fieldLabel}>그라인더 정보</Text>
            <View style={styles.grinderInputs}>
              <TextInput
                style={[styles.textInput, styles.grinderInput]}
                value={formData.equipment.grinder?.brand || ''}
                onChangeText={(text) => updateField('equipment.grinder.brand', text)}
                placeholder="브랜드"
                placeholderTextColor={HIGColors.tertiaryLabel}
              />
              <TextInput
                style={[styles.textInput, styles.grinderInput]}
                value={formData.equipment.grinder?.model || ''}
                onChangeText={(text) => updateField('equipment.grinder.model', text)}
                placeholder="모델"
                placeholderTextColor={HIGColors.tertiaryLabel}
              />
              <TextInput
                style={[styles.textInput, styles.grinderInput]}
                value={formData.equipment.grinder?.setting || ''}
                onChangeText={(text) => updateField('equipment.grinder.setting', text)}
                placeholder="설정값"
                placeholderTextColor={HIGColors.tertiaryLabel}
              />
            </View>
          </View>
        </View>

        {/* Recipe Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>레시피 상세</Text>
          
          {/* Basic Recipe */}
          <View style={styles.recipeGrid}>
            <View style={styles.recipeItem}>
              <Text style={styles.recipeLabel}>원두 (g)</Text>
              <TextInput
                style={styles.recipeInput}
                value={formData.recipe.doseIn.toString()}
                onChangeText={(text) => updateField('recipe.doseIn', parseInt(text) || 0)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.recipeItem}>
              <Text style={styles.recipeLabel}>물 (g)</Text>
              <TextInput
                style={styles.recipeInput}
                value={formData.recipe.waterAmount.toString()}
                onChangeText={(text) => updateField('recipe.waterAmount', parseInt(text) || 0)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.recipeItem}>
              <Text style={styles.recipeLabel}>비율</Text>
              <Text style={styles.ratioText}>{formData.recipe.ratio}</Text>
            </View>
            <View style={styles.recipeItem}>
              <Text style={styles.recipeLabel}>온도 (°C)</Text>
              <TextInput
                style={styles.recipeInput}
                value={formData.recipe.waterTemp.toString()}
                onChangeText={(text) => updateField('recipe.waterTemp', parseInt(text) || 0)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Bloom Phase */}
          <View style={styles.bloomSection}>
            <Text style={styles.subsectionTitle}>블룸 단계</Text>
            <View style={styles.bloomGrid}>
              <View style={styles.bloomItem}>
                <Text style={styles.bloomLabel}>블룸 물량 (g)</Text>
                <TextInput
                  style={styles.bloomInput}
                  value={formData.recipe.bloomWater.toString()}
                  onChangeText={(text) => updateField('recipe.bloomWater', parseInt(text) || 0)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.bloomItem}>
                <Text style={styles.bloomLabel}>블룸 시간 (초)</Text>
                <TextInput
                  style={styles.bloomInput}
                  value={formData.recipe.bloomTime.toString()}
                  onChangeText={(text) => updateField('recipe.bloomTime', parseInt(text) || 0)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.bloomItem}>
                <Text style={styles.bloomLabel}>블룸 교반</Text>
                <Switch
                  value={formData.recipe.bloomAgitation || false}
                  onValueChange={(value) => updateField('recipe.bloomAgitation', value)}
                  trackColor={{ false: HIGColors.systemGray5, true: HIGColors.systemGreen }}
                />
              </View>
            </View>
          </View>

          {/* Pour Technique */}
          <Text style={styles.subsectionTitle}>붓기 기법</Text>
          {pourTechniques.map((technique) => (
            <TouchableOpacity
              key={technique.key}
              style={[
                styles.techniqueCard,
                formData.recipe.pourTechnique === technique.key && styles.techniqueCardActive
              ]}
              onPress={() => updateField('recipe.pourTechnique', technique.key)}
            >
              <View>
                <Text style={[
                  styles.techniqueTitle,
                  formData.recipe.pourTechnique === technique.key && styles.techniqueTitleActive
                ]}>
                  {technique.label}
                </Text>
                <Text style={styles.techniqueDescription}>{technique.description}</Text>
              </View>
              {formData.recipe.pourTechnique === technique.key && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}

          {/* Pour Details */}
          <View style={styles.pourDetails}>
            <View style={styles.pourDetailRow}>
              <Text style={styles.pourDetailLabel}>붓기 횟수</Text>
              <View style={styles.numberPicker}>
                <TouchableOpacity
                  style={styles.numberButton}
                  onPress={() => updateField('recipe.numberOfPours', Math.max(1, formData.recipe.numberOfPours - 1))}
                >
                  <Text style={styles.numberButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.numberText}>{formData.recipe.numberOfPours}</Text>
                <TouchableOpacity
                  style={styles.numberButton}
                  onPress={() => updateField('recipe.numberOfPours', Math.min(10, formData.recipe.numberOfPours + 1))}
                >
                  <Text style={styles.numberButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.pourDetailRow}>
              <Text style={styles.pourDetailLabel}>총 추출시간 (초)</Text>
              <TextInput
                style={styles.timeInput}
                value={formData.recipe.totalBrewTime.toString()}
                onChangeText={(text) => updateField('recipe.totalBrewTime', parseInt(text) || 0)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Agitation */}
          <View style={styles.agitationSection}>
            <Text style={styles.subsectionTitle}>교반 설정</Text>
            <View style={styles.agitationOptions}>
              {['none', 'stir', 'swirl', 'tap'].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.agitationOption,
                    formData.recipe.agitation === method && styles.agitationOptionActive
                  ]}
                  onPress={() => updateField('recipe.agitation', method)}
                >
                  <Text style={[
                    styles.agitationText,
                    formData.recipe.agitation === method && styles.agitationTextActive
                  ]}>
                    {method === 'none' ? '없음' : 
                     method === 'stir' ? '젓기' :
                     method === 'swirl' ? '돌리기' : '탭핑'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {formData.recipe.agitation && formData.recipe.agitation !== 'none' && (
              <TextInput
                style={styles.agitationTimingInput}
                value={formData.recipe.agitationTiming || ''}
                onChangeText={(text) => updateField('recipe.agitationTiming', text)}
                placeholder="교반 타이밍 (예: 블룸 후, 마지막 붓기 후)"
                placeholderTextColor={HIGColors.tertiaryLabel}
              />
            )}
          </View>
        </View>

        {/* Advanced Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>고급 분석</Text>
          
          <View style={styles.analysisGrid}>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>TDS (%)</Text>
              <TextInput
                style={styles.analysisInput}
                value={formData.tds?.toString() || ''}
                onChangeText={(text) => updateField('tds', parseFloat(text) || undefined)}
                keyboardType="decimal-pad"
                placeholder="1.35"
                placeholderTextColor={HIGColors.tertiaryLabel}
              />
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>추출 수율 (%)</Text>
              <TextInput
                style={styles.analysisInput}
                value={formData.extractionYield?.toString() || ''}
                onChangeText={(text) => updateField('extractionYield', parseFloat(text) || undefined)}
                keyboardType="decimal-pad"
                placeholder="20.5"
                placeholderTextColor={HIGColors.tertiaryLabel}
              />
            </View>
          </View>
        </View>

        {/* Experiment Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>실험 노트</Text>
          
          <View style={styles.notesSection}>
            <View style={styles.noteRow}>
              <Text style={styles.noteLabel}>채널링</Text>
              <Switch
                value={formData.notes?.channeling || false}
                onValueChange={(value) => updateField('notes.channeling', value)}
                trackColor={{ false: HIGColors.systemGray5, true: HIGColors.systemRed }}
              />
            </View>
            
            <View style={styles.noteRow}>
              <Text style={styles.noteLabel}>머드베드</Text>
              <Switch
                value={formData.notes?.mudBed || false}
                onValueChange={(value) => updateField('notes.mudBed', value)}
                trackColor={{ false: HIGColors.systemGray5, true: HIGColors.systemRed }}
              />
            </View>

            <TextInput
              style={styles.noteInput}
              value={formData.notes?.grindAdjustment || ''}
              onChangeText={(text) => updateField('notes.grindAdjustment', text)}
              placeholder="그라인딩 조절 (예: 1클릭 더 굵게)"
              placeholderTextColor={HIGColors.tertiaryLabel}
            />

            <TextInput
              style={styles.noteInput}
              value={formData.notes?.tasteResult || ''}
              onChangeText={(text) => updateField('notes.tasteResult', text)}
              placeholder="맛 결과 (예: 밸런스 좋음, 단맛 증가)"
              placeholderTextColor={HIGColors.tertiaryLabel}
              multiline
            />

            <TextInput
              style={styles.noteInput}
              value={formData.notes?.nextExperiment || ''}
              onChangeText={(text) => updateField('notes.nextExperiment', text)}
              placeholder="다음 실험 계획"
              placeholderTextColor={HIGColors.tertiaryLabel}
              multiline
            />
          </View>
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
    fontSize: 20,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_LG,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginTop: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_MD,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  fieldRow: {
    marginBottom: HIGConstants.SPACING_MD,
  },
  textInput: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    fontSize: 16,
    color: HIGColors.label,
  },
  horizontalScroll: {
    marginBottom: HIGConstants.SPACING_MD,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_SM,
  },
  chip: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: 20,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipActive: {
    borderColor: HIGColors.systemBlue,
    backgroundColor: HIGColors.systemBlue + '10',
  },
  chipText: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    fontWeight: '500',
  },
  chipTextActive: {
    color: HIGColors.systemBlue,
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_MD,
  },
  gridItem: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gridItemActive: {
    borderColor: HIGColors.systemBlue,
    backgroundColor: HIGColors.systemBlue + '10',
  },
  gridItemText: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    fontWeight: '500',
  },
  gridItemTextActive: {
    color: HIGColors.systemBlue,
    fontWeight: '700',
  },
  grinderSection: {
    marginTop: HIGConstants.SPACING_MD,
  },
  grinderInputs: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_SM,
  },
  grinderInput: {
    flex: 1,
  },
  recipeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_LG,
  },
  recipeItem: {
    flex: 1,
    minWidth: 80,
  },
  recipeLabel: {
    fontSize: 12,
    color: HIGColors.tertiaryLabel,
    marginBottom: 4,
  },
  recipeInput: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_SM,
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
  },
  ratioText: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.systemBlue,
    textAlign: 'center',
    paddingVertical: HIGConstants.SPACING_SM,
  },
  bloomSection: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_LG,
  },
  bloomGrid: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_MD,
    alignItems: 'center',
  },
  bloomItem: {
    flex: 1,
  },
  bloomLabel: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
    marginBottom: 4,
  },
  bloomInput: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusSmall,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_SM,
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
  },
  techniqueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  techniqueCardActive: {
    borderColor: HIGColors.systemBlue,
    backgroundColor: HIGColors.systemBlue + '10',
  },
  techniqueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
  },
  techniqueTitleActive: {
    color: HIGColors.systemBlue,
  },
  techniqueDescription: {
    fontSize: 14,
    color: HIGColors.tertiaryLabel,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 20,
    color: HIGColors.systemBlue,
    fontWeight: '700',
  },
  pourDetails: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    marginTop: HIGConstants.SPACING_MD,
  },
  pourDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: HIGConstants.SPACING_MD,
  },
  pourDetailLabel: {
    fontSize: 16,
    color: HIGColors.label,
    fontWeight: '500',
  },
  numberPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HIGConstants.SPACING_MD,
  },
  numberButton: {
    width: 32,
    height: 32,
    backgroundColor: HIGColors.systemGray5,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
  },
  numberText: {
    fontSize: 18,
    fontWeight: '700',
    color: HIGColors.label,
    minWidth: 30,
    textAlign: 'center',
  },
  timeInput: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusSmall,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    width: 80,
    textAlign: 'center',
  },
  agitationSection: {
    marginTop: HIGConstants.SPACING_LG,
  },
  agitationOptions: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_MD,
  },
  agitationOption: {
    flex: 1,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    paddingVertical: HIGConstants.SPACING_SM,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  agitationOptionActive: {
    borderColor: HIGColors.systemBlue,
    backgroundColor: HIGColors.systemBlue + '10',
  },
  agitationText: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    fontWeight: '500',
  },
  agitationTextActive: {
    color: HIGColors.systemBlue,
    fontWeight: '700',
  },
  agitationTimingInput: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_MD,
    fontSize: 14,
    color: HIGColors.label,
  },
  analysisGrid: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_MD,
  },
  analysisItem: {
    flex: 1,
  },
  analysisLabel: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
    fontWeight: '600',
  },
  analysisInput: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_MD,
    fontSize: 18,
    fontWeight: '700',
    color: HIGColors.label,
    textAlign: 'center',
  },
  notesSection: {
    gap: HIGConstants.SPACING_MD,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteLabel: {
    fontSize: 16,
    color: HIGColors.label,
    fontWeight: '500',
  },
  noteInput: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_MD,
    fontSize: 16,
    color: HIGColors.label,
    minHeight: 44,
    textAlignVertical: 'top',
  },
});