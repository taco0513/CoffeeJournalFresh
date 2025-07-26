import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { HIGConstants } from '../../styles/common';
import { HIGColors } from '../../constants/HIG';
import { PouroverDripper, FilterType, PourTechnique, HomeCafeData } from '../../types/tasting';
import { dripperConfigs, filterTypes, pourTechniques } from '../../data/homeCafeData';

interface HomeCafeInputsProps {
  formData: HomeCafeData;
  onUpdateFormData: (updates: Partial<HomeCafeData>) => void;
}

export const HomeCafeInputs: React.FC<HomeCafeInputsProps> = ({
  formData,
  onUpdateFormData,
}) => {
  const updateEquipment = (field: keyof HomeCafeData['equipment'], value: unknown) => {
    onUpdateFormData({
      equipment: {
        ...formData.equipment,
        [field]: value,
    },
  });
};

  const updateRecipe = (field: keyof HomeCafeData['recipe'], value: unknown) => {
    onUpdateFormData({
      recipe: {
        ...formData.recipe,
        [field]: value,
    },
  });
};

  const updateNotes = (field: string, value: unknown) => {
    onUpdateFormData({
      notes: {
        ...formData.notes,
        [field]: value,
    },
  });
};

  const renderSectionHeader = (title: string, icon: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderDripperSelector = () => (
    <View style={styles.section}>
      {renderSectionHeader('드리퍼 선택', '☕')}
      <View style={styles.optionGrid}>
        {Object.entries(dripperConfigs).map(([key, config]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.optionButton,
              formData.equipment?.dripper === key && styles.optionButtonSelected,
            ]}
            onPress={() => updateEquipment('dripper', key as PouroverDripper)}
          >
            <Text style={styles.optionIcon}>{config.icon}</Text>
            <Text style={[
              styles.optionText,
              formData.equipment?.dripper === key && styles.optionTextSelected,
            ]}>
              {config.korean}
            </Text>
            <Text style={[
              styles.optionSubtext,
              formData.equipment?.dripper === key && styles.optionSubtextSelected,
            ]}>
              {config.defaultRatio}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFilterSelector = () => (
    <View style={styles.section}>
      {renderSectionHeader('필터 종류', '📄')}
      <View style={styles.optionGrid}>
        {filterTypes.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              formData.equipment?.filter === filter.id && styles.filterButtonSelected,
            ]}
            onPress={() => updateEquipment('filter', filter.id as FilterType)}
          >
            <Text style={[
              styles.filterText,
              formData.equipment?.filter === filter.id && styles.filterTextSelected,
            ]}>
              {filter.label}
            </Text>
            <Text style={[
              styles.filterDescription,
              formData.equipment?.filter === filter.id && styles.filterDescriptionSelected,
            ]}>
              {filter.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderNumberInput = (
    label: string,
    value: number,
    onChangeValue: (value: number) => void,
    unit: string,
    step: number = 1,
    min: number = 0,
    max: number = 999
  ) => (
    <View style={styles.numberInputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.numberInputRow}>
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => onChangeValue(Math.max(min, value - step))}
        >
          <Text style={styles.numberButtonText}>-</Text>
        </TouchableOpacity>
        
        <TextInput
          style={styles.numberInput}
          value={value.toString()}
          onChangeText={(text) => {
            const num = parseInt(text) || 0;
            onChangeValue(Math.min(max, Math.max(min, num)));
        }}
          keyboardType="numeric"
          textAlign="center"
        />
        
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => onChangeValue(Math.min(max, value + step))}
        >
          <Text style={styles.numberButtonText}>+</Text>
        </TouchableOpacity>
        
        <Text style={styles.unitText}>{unit}</Text>
      </View>
    </View>
  );

  const renderTextInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    multiline: boolean = false
  ) => (
    <View style={styles.textInputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.textInput, multiline && styles.textInputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={HIGColors.systemGray4}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  const renderPourTechniqueSelector = () => (
    <View style={styles.section}>
      {renderSectionHeader('추출 기법', '💧')}
      <View style={styles.techniqueGrid}>
        {pourTechniques.map((technique) => (
          <TouchableOpacity
            key={technique.id}
            style={[
              styles.techniqueButton,
              formData.recipe?.pourTechnique === technique.id && styles.techniqueButtonSelected,
            ]}
            onPress={() => updateRecipe('pourTechnique', technique.id as PourTechnique)}
          >
            <Text style={[
              styles.techniqueText,
              formData.recipe?.pourTechnique === technique.id && styles.techniqueTextSelected,
            ]}>
              {technique.label}
            </Text>
            <Text style={[
              styles.techniqueDescription,
              formData.recipe?.pourTechnique === technique.id && styles.techniqueDescriptionSelected,
            ]}>
              {technique.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <>
      {renderDripperSelector()}
      {renderFilterSelector()}
      
      {/* Recipe Section */}
      <View style={styles.section}>
        {renderSectionHeader('레시피', '📝')}
        
        {renderNumberInput(
          '원두량',
          formData.recipe?.doseIn || 15,
          (value) => updateRecipe('doseIn', value),
          'g',
          0.5,
          5,
          50
        )}
        
        {renderNumberInput(
          '물 양',
          formData.recipe?.waterAmount || 225,
          (value) => updateRecipe('waterAmount', value),
          'ml',
          5,
          50,
          1000
        )}
        
        {renderNumberInput(
          '물 온도',
          formData.recipe?.waterTemp || 92,
          (value) => updateRecipe('waterTemp', value),
          '°C',
          1,
          70,
          100
        )}
        
        {renderTextInput(
          '분쇄도',
          formData.notes?.grindAdjustment || '',
          (value) => updateNotes('grindAdjustment', value),
          '예: 중간, 중세, 굵게'
        )}
        
        {renderNumberInput(
          '뜸 시간',
          formData.recipe?.bloomTime || 30,
          (value) => updateRecipe('bloomTime', value),
          '초',
          5,
          0,
          120
        )}
        
        {renderNumberInput(
          '뜸물 양',
          formData.recipe?.bloomWater || 30,
          (value) => updateRecipe('bloomWater', value),
          'ml',
          5,
          0,
          100
        )}
        
        {renderNumberInput(
          '총 추출시간',
          formData.recipe?.totalBrewTime || 180,
          (value) => updateRecipe('totalBrewTime', value),
          '초',
          10,
          60,
          600
        )}
      </View>
      
      {renderPourTechniqueSelector()}
      
      {/* Experiment Notes */}
      <View style={styles.section}>
        {renderSectionHeader('실험 노트', '🔬')}
        
        {renderTextInput(
          '분쇄도 조정',
          formData.notes?.grindAdjustment || '',
          (value) => updateNotes('grindAdjustment', value),
          '예: 조금 더 굵게, 한 단계 세게'
        )}
        
        {renderTextInput(
          '오늘의 결과',
          formData.notes?.tasteResult || '',
          (value) => updateNotes('tasteResult', value),
          '맛, 향, 바디감, 산미 등 자유롭게 기록',
          true
        )}
        
        {renderTextInput(
          '다음 시도',
          formData.notes?.nextExperiment || '',
          (value) => updateNotes('nextExperiment', value),
          '다음에 바꿔볼 점들',
          true
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: HIGConstants.SPACING_XL,
},
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_LG,
},
  sectionIcon: {
    fontSize: 20,
    marginRight: HIGConstants.SPACING_SM,
},
  sectionTitle: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
},
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HIGConstants.SPACING_LG,
    gap: HIGConstants.SPACING_SM,
},
  optionButton: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_SM,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
},
  optionButtonSelected: {
    backgroundColor: HIGColors.systemBlue,
    borderColor: HIGColors.systemBlue,
},
  optionIcon: {
    fontSize: 24,
    marginBottom: 4,
},
  optionText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: 2,
},
  optionTextSelected: {
    color: HIGColors.white,
},
  optionSubtext: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
},
  optionSubtextSelected: {
    color: HIGColors.white,
    opacity: 0.8,
},
  filterButton: {
    width: '48%',
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    borderWidth: 2,
    borderColor: 'transparent',
},
  filterButtonSelected: {
    backgroundColor: HIGColors.systemGreen,
    borderColor: HIGColors.systemGreen,
},
  filterText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 4,
},
  filterTextSelected: {
    color: HIGColors.white,
},
  filterDescription: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
},
  filterDescriptionSelected: {
    color: HIGColors.white,
    opacity: 0.8,
},
  numberInputContainer: {
    marginBottom: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_LG,
},
  inputLabel: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
},
  numberInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
},
  numberButton: {
    width: 40,
    height: 40,
    backgroundColor: HIGColors.systemGray5,
    borderRadius: HIGConstants.cornerRadiusSmall,
    alignItems: 'center',
    justifyContent: 'center',
},
  numberButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
},
  numberInput: {
    flex: 1,
    height: 40,
    backgroundColor: HIGColors.systemBackground,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
    borderRadius: HIGConstants.cornerRadiusSmall,
    marginHorizontal: HIGConstants.SPACING_SM,
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    paddingHorizontal: HIGConstants.SPACING_SM,
},
  unitText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.secondaryLabel,
    marginLeft: HIGConstants.SPACING_SM,
    minWidth: 30,
},
  textInputContainer: {
    marginBottom: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_LG,
},
  textInput: {
    backgroundColor: HIGColors.systemBackground,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
    borderRadius: HIGConstants.cornerRadiusSmall,
    padding: HIGConstants.SPACING_MD,
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    minHeight: 44,
},
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
},
  techniqueGrid: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    gap: HIGConstants.SPACING_SM,
},
  techniqueButton: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
    borderWidth: 2,
    borderColor: 'transparent',
},
  techniqueButtonSelected: {
    backgroundColor: HIGColors.systemOrange,
    borderColor: HIGColors.systemOrange,
},
  techniqueText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 4,
},
  techniqueTextSelected: {
    color: HIGColors.white,
},
  techniqueDescription: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
},
  techniqueDescriptionSelected: {
    color: HIGColors.white,
    opacity: 0.8,
},
});