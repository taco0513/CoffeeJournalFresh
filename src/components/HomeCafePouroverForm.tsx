import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { HIGColors, HIGConstants } from '../styles/common';
import { useTastingStore } from '../stores/tastingStore';
import { HomeCafeData, PouroverDripper, FilterType, PourTechnique } from '../types/tasting';

interface HomeCafePouroverFormProps {
  onNext?: () => void;
}

// Dripper configurations with Korean names and characteristics
const dripperConfigs = {
  V60: { 
    name: 'V60', 
    korean: '브이60',
    sizes: ['01 (1-2잔)', '02 (1-4잔)', '03 (3-6잔)'],
    defaultRatio: '1:15',
    icon: '⏳'
  },
  KalitaWave: { 
    name: 'Kalita Wave', 
    korean: '칼리타 웨이브',
    sizes: ['155 (1-2잔)', '185 (2-4잔)'],
    defaultRatio: '1:16',
    icon: '〰️'
  },
  Origami: { 
    name: 'Origami', 
    korean: '오리가미',
    sizes: ['S (1-2잔)', 'M (1-4잔)'],
    defaultRatio: '1:15',
    icon: '🗾'
  },
  Chemex: { 
    name: 'Chemex', 
    korean: '케멕스',
    sizes: ['3컵', '6컵', '8컵', '10컵'],
    defaultRatio: '1:17',
    icon: '⏳'
  },
  FellowStagg: { 
    name: 'Fellow Stagg', 
    korean: '펠로우 스태그',
    sizes: ['[X]', '[XF]'],
    defaultRatio: '1:16',
    icon: '◼️'
  },
  April: { 
    name: 'April', 
    korean: '에이프릴',
    sizes: ['플라스틱', '글라스'],
    defaultRatio: '1:16',
    icon: '🌸'
  },
  Orea: { 
    name: 'Orea', 
    korean: '오레아',
    sizes: ['V3', 'V4'],
    defaultRatio: '1:16',
    icon: '💎'
  },
  FlowerDripper: { 
    name: 'Flower Dripper', 
    korean: '플라워 드리퍼',
    sizes: ['1잔용', '2-4잔용'],
    defaultRatio: '1:15',
    icon: '🌺'
  },
  BluebottleDripper: { 
    name: 'Blue Bottle', 
    korean: '블루보틀',
    sizes: ['표준'],
    defaultRatio: '1:16',
    icon: '💙'
  },
  TimemoreCrystalEye: { 
    name: 'Crystal Eye', 
    korean: '크리스탈 아이',
    sizes: ['01', '02'],
    defaultRatio: '1:15',
    icon: '💎'
  },
  Other: { 
    name: 'Other', 
    korean: '기타',
    sizes: [],
    defaultRatio: '1:15',
    icon: '☕'
  },
};

const filterTypes = [
  { id: 'bleached', label: '표백 필터', description: '깔끔한 맛' },
  { id: 'natural', label: '갈색 필터', description: '바디감 있는 맛' },
  { id: 'wave', label: '웨이브 필터', description: '칼리타 전용' },
  { id: 'chemex', label: '케멕스 필터', description: '두꺼운 종이' },
  { id: 'metal', label: '메탈 필터', description: '오일 통과' },
  { id: 'cloth', label: '융 필터', description: '부드러운 맛' },
];

const pourTechniques = [
  { id: 'center', label: '센터 포어', description: '중앙 집중' },
  { id: 'spiral', label: '스파이럴', description: '나선형 붓기' },
  { id: 'pulse', label: '펄스 포어', description: '단계별 붓기' },
  { id: 'continuous', label: '연속 붓기', description: '끊김 없이' },
  { id: 'multiStage', label: '다단계', description: '여러 번 나눠' },
];

export const HomeCafePouroverForm: React.FC<HomeCafePouroverFormProps> = ({ onNext }) => {
  const { currentTasting, updateHomeCafeData } = useTastingStore();
  const [formData, setFormData] = useState<HomeCafeData>(
    currentTasting.homeCafeData || {
      equipment: {
        dripper: 'V60',
        filter: 'bleached',
      },
      recipe: {
        doseIn: 15,
        waterAmount: 225,
        ratio: '1:15',
        waterTemp: 92,
        bloomWater: 30,
        bloomTime: 30,
        pourTechnique: 'pulse',
        numberOfPours: 3,
        totalBrewTime: 150,
      },
    }
  );

  // Update field helper - now properly updates nested state
  const updateField = (category: keyof HomeCafeData, field: string, value: any) => {
    const updatedFormData = {
      ...formData,
      [category]: {
        ...formData[category],
        [field]: value,
      },
    } as HomeCafeData;
    
    setFormData(updatedFormData);
    updateHomeCafeData(updatedFormData);
  };

  // Calculate and update ratio
  const calculateRatio = (dose: number, water: number) => {
    if (dose > 0 && water > 0) {
      const ratio = Math.round((water / dose) * 10) / 10;
      return `1:${ratio}`;
    }
    return '';
  };

  // Handle dose change
  const handleDoseChange = (value: string) => {
    const dose = parseFloat(value) || 0;
    updateField('recipe', 'doseIn', dose);
    
    if (dose > 0 && formData.recipe.waterAmount > 0) {
      const ratio = calculateRatio(dose, formData.recipe.waterAmount);
      updateField('recipe', 'ratio', ratio);
    }
    
    // Auto-calculate bloom water (2x dose)
    updateField('recipe', 'bloomWater', dose * 2);
  };

  // Handle water change
  const handleWaterChange = (value: string) => {
    const water = parseFloat(value) || 0;
    updateField('recipe', 'waterAmount', water);
    
    if (formData.recipe.doseIn > 0 && water > 0) {
      const ratio = calculateRatio(formData.recipe.doseIn, water);
      updateField('recipe', 'ratio', ratio);
    }
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Parse time input
  const parseTimeInput = (value: string): number => {
    if (value.includes(':')) {
      const [mins, secs] = value.split(':').map(v => parseInt(v) || 0);
      return mins * 60 + secs;
    }
    return parseInt(value) || 0;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Dripper Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>드리퍼 선택</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.dripperScroll}
        >
          {Object.entries(dripperConfigs).map(([key, config]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.dripperButton,
                formData.equipment.dripper === key && styles.dripperButtonActive,
              ]}
              onPress={() => {
                // Create new formData with updated dripper
                const updatedFormData = {
                  ...formData,
                  equipment: {
                    ...formData.equipment,
                    dripper: key as PouroverDripper,
                  },
                };
                
                // Update local state
                setFormData(updatedFormData);
                
                // Update store
                updateHomeCafeData(updatedFormData);
                
                // Auto-set default ratio for dripper
                const [dose, water] = config.defaultRatio.split(':').map(v => parseFloat(v));
                if (updatedFormData.recipe.doseIn > 0) {
                  const newWater = updatedFormData.recipe.doseIn * water;
                  const finalFormData = {
                    ...updatedFormData,
                    recipe: {
                      ...updatedFormData.recipe,
                      waterAmount: newWater,
                      ratio: calculateRatio(updatedFormData.recipe.doseIn, newWater),
                    },
                  };
                  setFormData(finalFormData);
                  updateHomeCafeData(finalFormData);
                }
              }}
            >
              <Text style={styles.dripperIcon}>{config.icon}</Text>
              <Text style={[
                styles.dripperName,
                formData.equipment.dripper === key && styles.dripperNameActive,
              ]}>
                {config.korean}
              </Text>
              <Text style={[
                styles.dripperSubtitle,
                formData.equipment.dripper === key && styles.dripperSubtitleActive,
              ]}>
                {config.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Dripper Size Selection */}
        {dripperConfigs[formData.equipment.dripper as PouroverDripper].sizes.length > 0 && (
          <View style={styles.sizeContainer}>
            <Text style={styles.inputLabel}>사이즈</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {dripperConfigs[formData.equipment.dripper as PouroverDripper].sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    formData.equipment.dripperSize === size && styles.sizeButtonActive,
                  ]}
                  onPress={() => updateField('equipment', 'dripperSize', size)}
                >
                  <Text style={[
                    styles.sizeButtonText,
                    formData.equipment.dripperSize === size && styles.sizeButtonTextActive,
                  ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Filter Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>필터 종류</Text>
        <View style={styles.filterGrid}>
          {filterTypes.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                formData.equipment.filter === filter.id && styles.filterButtonActive,
              ]}
              onPress={() => {
                const updatedFormData = {
                  ...formData,
                  equipment: {
                    ...formData.equipment,
                    filter: filter.id as FilterType,
                  },
                };
                setFormData(updatedFormData);
                updateHomeCafeData(updatedFormData);
              }}
            >
              <Text style={[
                styles.filterLabel,
                formData.equipment.filter === filter.id && styles.filterLabelActive,
              ]}>
                {filter.label}
              </Text>
              <Text style={styles.filterDescription}>{filter.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Grinder Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>그라인더 정보 (선택)</Text>
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>브랜드/모델</Text>
            <TextInput
              style={styles.textInput}
              value={formData.equipment.grinder?.brand || ''}
              onChangeText={(value) => {
                const newGrinder = {
                  brand: value,
                  model: formData.equipment.grinder?.model || '',
                  setting: formData.equipment.grinder?.setting || '',
                };
                updateField('equipment', 'grinder', newGrinder);
              }}
              placeholder="예: 커맨단테 C40"
              placeholderTextColor={HIGColors.placeholderText}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>그라인딩 설정</Text>
            <TextInput
              style={styles.textInput}
              value={formData.equipment.grinder?.setting || ''}
              onChangeText={(value) => {
                const newGrinder = {
                  brand: formData.equipment.grinder?.brand || '',
                  model: formData.equipment.grinder?.model || '',
                  setting: value,
                };
                updateField('equipment', 'grinder', newGrinder);
              }}
              placeholder="예: 24클릭"
              placeholderTextColor={HIGColors.placeholderText}
            />
          </View>
        </View>
      </View>

      {/* Basic Recipe */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>기본 레시피</Text>
        
        <View style={styles.row}>
          <View style={styles.thirdInput}>
            <Text style={styles.inputLabel}>원두 (g)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.recipe.doseIn.toString()}
              onChangeText={handleDoseChange}
              keyboardType="decimal-pad"
              placeholder="15"
              placeholderTextColor={HIGColors.placeholderText}
            />
          </View>
          <View style={styles.thirdInput}>
            <Text style={styles.inputLabel}>물 (g)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.recipe.waterAmount.toString()}
              onChangeText={handleWaterChange}
              keyboardType="decimal-pad"
              placeholder="225"
              placeholderTextColor={HIGColors.placeholderText}
            />
          </View>
          <View style={styles.thirdInput}>
            <Text style={styles.inputLabel}>비율</Text>
            <View style={styles.ratioDisplay}>
              <Text style={styles.ratioText}>{formData.recipe.ratio || '1:15'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>물 온도 (°C)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.recipe.waterTemp.toString()}
              onChangeText={(value) => updateField('recipe', 'waterTemp', parseFloat(value) || 0)}
              keyboardType="decimal-pad"
              placeholder="92"
              placeholderTextColor={HIGColors.placeholderText}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>총 추출시간</Text>
            <TextInput
              style={styles.textInput}
              value={formatTime(formData.recipe.totalBrewTime)}
              onChangeText={(value) => updateField('recipe', 'totalBrewTime', parseTimeInput(value))}
              placeholder="2:30"
              placeholderTextColor={HIGColors.placeholderText}
            />
          </View>
        </View>
      </View>

      {/* Bloom Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>블룸 (Bloom)</Text>
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>블룸 물량 (g)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.recipe.bloomWater.toString()}
              onChangeText={(value) => updateField('recipe', 'bloomWater', parseFloat(value) || 0)}
              keyboardType="decimal-pad"
              placeholder="30"
              placeholderTextColor={HIGColors.placeholderText}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>블룸 시간 (초)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.recipe.bloomTime.toString()}
              onChangeText={(value) => updateField('recipe', 'bloomTime', parseInt(value) || 0)}
              keyboardType="number-pad"
              placeholder="30"
              placeholderTextColor={HIGColors.placeholderText}
            />
          </View>
        </View>
        
        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => updateField('recipe', 'bloomAgitation', !formData.recipe.bloomAgitation)}
          >
            <View style={[
              styles.checkboxInner,
              formData.recipe.bloomAgitation && styles.checkboxChecked,
            ]}>
              {formData.recipe.bloomAgitation && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>블룸 교반 (스푼으로 저어주기)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pour Technique */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>붓기 방법</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {pourTechniques.map((technique) => (
            <TouchableOpacity
              key={technique.id}
              style={[
                styles.techniqueButton,
                formData.recipe.pourTechnique === technique.id && styles.techniqueButtonActive,
              ]}
              onPress={() => {
                const updatedFormData = {
                  ...formData,
                  recipe: {
                    ...formData.recipe,
                    pourTechnique: technique.id as PourTechnique,
                  },
                };
                setFormData(updatedFormData);
                updateHomeCafeData(updatedFormData);
              }}
            >
              <Text style={[
                styles.techniqueLabel,
                formData.recipe.pourTechnique === technique.id && styles.techniqueLabelActive,
              ]}>
                {technique.label}
              </Text>
              <Text style={styles.techniqueDescription}>{technique.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <View style={styles.pourDetails}>
          <Text style={styles.inputLabel}>붓기 횟수</Text>
          <View style={styles.pourNumberContainer}>
            {[1, 2, 3, 4, 5].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.pourNumberButton,
                  formData.recipe.numberOfPours === num && styles.pourNumberButtonActive,
                ]}
                onPress={() => updateField('recipe', 'numberOfPours', num)}
              >
                <Text style={[
                  styles.pourNumberText,
                  formData.recipe.numberOfPours === num && styles.pourNumberTextActive,
                ]}>
                  {num}회
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Agitation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>교반 (Agitation)</Text>
        <View style={styles.agitationGrid}>
          {[
            { id: 'none', label: '없음' },
            { id: 'stir', label: '젓기' },
            { id: 'swirl', label: '돌리기' },
            { id: 'tap', label: '탭핑' },
          ].map((agitation) => (
            <TouchableOpacity
              key={agitation.id}
              style={[
                styles.agitationButton,
                formData.recipe.agitation === agitation.id && styles.agitationButtonActive,
              ]}
              onPress={() => updateField('recipe', 'agitation', agitation.id)}
            >
              <Text style={[
                styles.agitationLabel,
                formData.recipe.agitation === agitation.id && styles.agitationLabelActive,
              ]}>
                {agitation.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {formData.recipe.agitation && formData.recipe.agitation !== 'none' && (
          <TextInput
            style={[styles.textInput, styles.agitationTiming]}
            value={formData.recipe.agitationTiming || ''}
            onChangeText={(value) => updateField('recipe', 'agitationTiming', value)}
            placeholder="예: 마지막 붓기 후"
            placeholderTextColor={HIGColors.placeholderText}
          />
        )}
      </View>

      {/* Experiment Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>실험 노트 (선택)</Text>
        
        <View style={styles.noteRow}>
          <Text style={styles.noteLabel}>그라인딩 조절</Text>
          <TextInput
            style={[styles.textInput, styles.noteInput]}
            value={formData.notes?.grindAdjustment || ''}
            onChangeText={(value) => updateField('notes', 'grindAdjustment', value)}
            placeholder="예: 2클릭 더 굵게"
            placeholderTextColor={HIGColors.placeholderText}
          />
        </View>
        
        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => updateField('notes', 'channeling', !formData.notes?.channeling)}
          >
            <View style={[
              styles.checkboxInner,
              formData.notes?.channeling && styles.checkboxChecked,
            ]}>
              {formData.notes?.channeling && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>채널링 발생</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => updateField('notes', 'mudBed', !formData.notes?.mudBed)}
          >
            <View style={[
              styles.checkboxInner,
              formData.notes?.mudBed && styles.checkboxChecked,
            ]}>
              {formData.notes?.mudBed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>머드베드</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.noteRow}>
          <Text style={styles.noteLabel}>맛 결과</Text>
          <TextInput
            style={[styles.textInput, styles.noteInput]}
            value={formData.notes?.tasteResult || ''}
            onChangeText={(value) => updateField('notes', 'tasteResult', value)}
            placeholder="예: 산미 증가, 바디감 좋음"
            placeholderTextColor={HIGColors.placeholderText}
            multiline
          />
        </View>
        
        <View style={styles.noteRow}>
          <Text style={styles.noteLabel}>다음 실험</Text>
          <TextInput
            style={[styles.textInput, styles.noteInput]}
            value={formData.notes?.nextExperiment || ''}
            onChangeText={(value) => updateField('notes', 'nextExperiment', value)}
            placeholder="예: 물온도 2도 낮춰보기"
            placeholderTextColor={HIGColors.placeholderText}
            multiline
          />
        </View>
      </View>

      {/* Optional Equipment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>추가 장비 (선택)</Text>
        
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>서버/저그</Text>
            <TextInput
              style={styles.textInput}
              value={formData.equipment.server || ''}
              onChangeText={(value) => updateField('equipment', 'server', value)}
              placeholder="예: Hario Range Server"
              placeholderTextColor={HIGColors.placeholderText}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>저울</Text>
            <TextInput
              style={styles.textInput}
              value={formData.equipment.scale || ''}
              onChangeText={(value) => updateField('equipment', 'scale', value)}
              placeholder="예: Acaia Pearl"
              placeholderTextColor={HIGColors.placeholderText}
            />
          </View>
        </View>
        
        <View style={styles.fullInput}>
          <Text style={styles.inputLabel}>주전자</Text>
          <TextInput
            style={styles.textInput}
            value={formData.equipment.kettle || ''}
            onChangeText={(value) => updateField('equipment', 'kettle', value)}
            placeholder="예: Fellow Stagg EKG"
            placeholderTextColor={HIGColors.placeholderText}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: HIGConstants.SPACING_XL,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  
  // Dripper selection
  dripperScroll: {
    marginBottom: HIGConstants.SPACING_MD,
  },
  dripperButton: {
    width: 80,
    alignItems: 'center',
    marginRight: HIGConstants.SPACING_SM,
    padding: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.BORDER_RADIUS_MD,
    backgroundColor: HIGColors.secondarySystemBackground,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dripperButtonActive: {
    borderColor: HIGColors.accent,
    backgroundColor: HIGColors.systemBackground,
  },
  dripperIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  dripperName: {
    fontSize: 12,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
  },
  dripperNameActive: {
    color: HIGColors.accent,
  },
  dripperSubtitle: {
    fontSize: 10,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginTop: 2,
  },
  dripperSubtitleActive: {
    color: HIGColors.accent,
  },
  
  // Size selection
  sizeContainer: {
    marginTop: HIGConstants.SPACING_SM,
  },
  sizeButton: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    marginRight: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.BORDER_RADIUS_SM,
    backgroundColor: HIGColors.secondarySystemBackground,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
  },
  sizeButtonActive: {
    backgroundColor: HIGColors.accent,
    borderColor: HIGColors.accent,
  },
  sizeButtonText: {
    fontSize: 14,
    color: HIGColors.label,
  },
  sizeButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  
  // Filter selection
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -HIGConstants.SPACING_XS,
  },
  filterButton: {
    width: '31%',
    margin: '1.16%',
    padding: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.BORDER_RADIUS_SM,
    backgroundColor: HIGColors.secondarySystemBackground,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
  },
  filterButtonActive: {
    backgroundColor: HIGColors.accent,
    borderColor: HIGColors.accent,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: HIGColors.label,
    textAlign: 'center',
  },
  filterLabelActive: {
    color: 'white',
  },
  filterDescription: {
    fontSize: 10,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginTop: 2,
  },
  
  // Input fields
  row: {
    flexDirection: 'row',
    marginBottom: HIGConstants.SPACING_MD,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: HIGConstants.SPACING_XS,
  },
  thirdInput: {
    flex: 1,
    marginHorizontal: HIGConstants.SPACING_XS,
  },
  fullInput: {
    marginHorizontal: HIGConstants.SPACING_XS,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
  },
  textInput: {
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS_SM,
    padding: HIGConstants.SPACING_MD,
    fontSize: 16,
    color: HIGColors.label,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
  },
  ratioDisplay: {
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS_SM,
    padding: HIGConstants.SPACING_MD,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  ratioText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.accent,
  },
  
  // Checkbox
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: HIGConstants.SPACING_SM,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: HIGConstants.SPACING_LG,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: HIGColors.systemGray4,
    marginRight: HIGConstants.SPACING_SM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: HIGColors.accent,
    borderColor: HIGColors.accent,
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: HIGColors.label,
  },
  
  // Pour technique
  techniqueButton: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    marginRight: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.BORDER_RADIUS_SM,
    backgroundColor: HIGColors.secondarySystemBackground,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
    minWidth: 100,
    alignItems: 'center',
  },
  techniqueButtonActive: {
    backgroundColor: HIGColors.accent,
    borderColor: HIGColors.accent,
  },
  techniqueLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: HIGColors.label,
  },
  techniqueLabelActive: {
    color: 'white',
  },
  techniqueDescription: {
    fontSize: 11,
    color: HIGColors.secondaryLabel,
    marginTop: 2,
  },
  
  pourDetails: {
    marginTop: HIGConstants.SPACING_MD,
  },
  pourNumberContainer: {
    flexDirection: 'row',
    marginTop: HIGConstants.SPACING_SM,
  },
  pourNumberButton: {
    width: 50,
    height: 40,
    borderRadius: HIGConstants.BORDER_RADIUS_SM,
    backgroundColor: HIGColors.secondarySystemBackground,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: HIGConstants.SPACING_SM,
  },
  pourNumberButtonActive: {
    backgroundColor: HIGColors.accent,
    borderColor: HIGColors.accent,
  },
  pourNumberText: {
    fontSize: 14,
    color: HIGColors.label,
  },
  pourNumberTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  
  // Agitation
  agitationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  agitationButton: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    marginRight: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.BORDER_RADIUS_SM,
    backgroundColor: HIGColors.secondarySystemBackground,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
  },
  agitationButtonActive: {
    backgroundColor: HIGColors.accent,
    borderColor: HIGColors.accent,
  },
  agitationLabel: {
    fontSize: 14,
    color: HIGColors.label,
  },
  agitationLabelActive: {
    color: 'white',
    fontWeight: '500',
  },
  agitationTiming: {
    marginTop: HIGConstants.SPACING_SM,
  },
  
  // Notes
  noteRow: {
    marginBottom: HIGConstants.SPACING_MD,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
  },
  noteInput: {
    minHeight: 44,
    textAlignVertical: 'top',
  },
});

export default HomeCafePouroverForm;