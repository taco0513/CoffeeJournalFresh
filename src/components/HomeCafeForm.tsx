import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { HIGColors, HIGConstants } from '../styles/common';
import { useTastingStore } from '../stores/tastingStore';
import { HomeCafeData } from '../types/tasting';

interface HomeCafeFormProps {
  onNext?: () => void;
}

export const HomeCafeForm: React.FC<HomeCafeFormProps> = ({ onNext }) => {
  const { currentTasting, updateHomeCafeData } = useTastingStore();
  const [formData, setFormData] = useState<HomeCafeData>(
    currentTasting.homeCafeData || {
      equipment: {
        brewingMethod: 'V60',
      },
      recipe: {
        doseIn: 0,
        waterAmount: 0,
        ratio: '',
        waterTemp: 0,
        totalBrewTime: 0,
      },
    }
  );

  const brewingMethods = [
    { id: 'V60', label: 'V60', icon: '⏳' },
    { id: 'Chemex', label: '케멕스', icon: '🧪' },
    { id: 'AeroPress', label: '에어로프레스', icon: '💨' },
    { id: 'FrenchPress', label: '프렌치프레스', icon: '☕' },
    { id: 'Espresso', label: '에스프레소', icon: '☕' },
    { id: 'Other', label: '기타', icon: '🔧' },
  ];

  const updateField = (category: keyof HomeCafeData, field: string, value: any) => {
    const newData = {
      ...formData,
      [category]: {
        ...formData[category],
        [field]: value,
      },
    };
    setFormData(newData);
    updateHomeCafeData(newData);
  };

  const calculateRatio = (dose: number, water: number) => {
    if (dose > 0 && water > 0) {
      const ratio = Math.round((water / dose) * 10) / 10;
      return `1:${ratio}`;
    }
    return '';
  };

  const handleDoseChange = (value: string) => {
    const dose = parseFloat(value) || 0;
    updateField('recipe', 'doseIn', dose);
    
    if (dose > 0 && formData.recipe.waterAmount > 0) {
      const ratio = calculateRatio(dose, formData.recipe.waterAmount);
      updateField('recipe', 'ratio', ratio);
    }
  };

  const handleWaterChange = (value: string) => {
    const water = parseFloat(value) || 0;
    updateField('recipe', 'waterAmount', water);
    
    if (formData.recipe.doseIn > 0 && water > 0) {
      const ratio = calculateRatio(formData.recipe.doseIn, water);
      updateField('recipe', 'ratio', ratio);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Brewing Method Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>추출 도구</Text>
        <View style={styles.methodGrid}>
          {brewingMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodButton,
                formData.equipment.brewingMethod === method.id && styles.methodButtonActive,
              ]}
              onPress={() => updateField('equipment', 'brewingMethod', method.id)}
            >
              <Text style={styles.methodIcon}>{method.icon}</Text>
              <Text style={[
                styles.methodLabel,
                formData.equipment.brewingMethod === method.id && styles.methodLabelActive,
              ]}>
                {method.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Grinder Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>그라인더 (선택사항)</Text>
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>브랜드</Text>
            <TextInput
              style={styles.textInput}
              value={formData.equipment.grinder?.brand || ''}
              onChangeText={(value) => updateField('equipment', 'grinder', {
                ...formData.equipment.grinder,
                brand: value,
              })}
              placeholder="예: 커맨단테"
              placeholderTextColor={HIGColors.placeholderText}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>설정</Text>
            <TextInput
              style={styles.textInput}
              value={formData.equipment.grinder?.setting || ''}
              onChangeText={(value) => updateField('equipment', 'grinder', {
                ...formData.equipment.grinder,
                setting: value,
              })}
              placeholder="예: 15클릭"
              placeholderTextColor={HIGColors.placeholderText}
            />
          </View>
        </View>
      </View>

      {/* Recipe Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>레시피</Text>
        
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>원두량 (g)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.recipe.doseIn?.toString() || ''}
              onChangeText={handleDoseChange}
              placeholder="20"
              keyboardType="numeric"
              placeholderTextColor={HIGColors.placeholderText}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>물량 (g)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.recipe.waterAmount?.toString() || ''}
              onChangeText={handleWaterChange}
              placeholder="320"
              keyboardType="numeric"
              placeholderTextColor={HIGColors.placeholderText}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>비율</Text>
            <View style={styles.ratioDisplay}>
              <Text style={styles.ratioText}>
                {formData.recipe.ratio || '1:16'}
              </Text>
            </View>
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>물온도 (°C)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.recipe.waterTemp?.toString() || ''}
              onChangeText={(value) => updateField('recipe', 'waterTemp', parseFloat(value) || 0)}
              placeholder="93"
              keyboardType="numeric"
              placeholderTextColor={HIGColors.placeholderText}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>블룸 시간 (초)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.recipe.bloomTime?.toString() || ''}
              onChangeText={(value) => updateField('recipe', 'bloomTime', parseFloat(value) || 0)}
              placeholder="30"
              keyboardType="numeric"
              placeholderTextColor={HIGColors.placeholderText}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>총 시간 (초)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.recipe.totalBrewTime?.toString() || ''}
              onChangeText={(value) => updateField('recipe', 'totalBrewTime', parseFloat(value) || 0)}
              placeholder="240"
              keyboardType="numeric"
              placeholderTextColor={HIGColors.placeholderText}
            />
          </View>
        </View>
      </View>

      {/* Experiment Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>실험 노트 (선택사항)</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>이전 변경사항</Text>
          <TextInput
            style={styles.textArea}
            value={formData.notes?.previousChange || ''}
            onChangeText={(value) => updateField('notes', 'previousChange', value)}
            placeholder="예: 그라인딩 1클릭 더 굵게"
            placeholderTextColor={HIGColors.placeholderText}
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>결과</Text>
          <TextInput
            style={styles.textArea}
            value={formData.notes?.result || ''}
            onChangeText={(value) => updateField('notes', 'result', value)}
            placeholder="예: 산미가 더 밝아짐, 단맛은 약간 감소"
            placeholderTextColor={HIGColors.placeholderText}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>다음 실험</Text>
          <TextInput
            style={styles.textArea}
            value={formData.notes?.nextExperiment || ''}
            onChangeText={(value) => updateField('notes', 'nextExperiment', value)}
            placeholder="예: 다음엔 물온도 5도 낮춰보기"
            placeholderTextColor={HIGColors.placeholderText}
            multiline
            numberOfLines={2}
          />
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  section: {
    marginVertical: HIGConstants.SPACING_LG,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HIGConstants.SPACING_SM,
  },
  methodButton: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    paddingVertical: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_MD,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodButtonActive: {
    backgroundColor: HIGColors.systemBlue + '20',
    borderColor: HIGColors.systemBlue,
  },
  methodIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  methodLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: HIGColors.label,
    textAlign: 'center',
  },
  methodLabelActive: {
    color: HIGColors.systemBlue,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_MD,
  },
  halfInput: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: HIGConstants.SPACING_MD,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: HIGColors.label,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusSmall,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    fontSize: 16,
    color: HIGColors.label,
  },
  textArea: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusSmall,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    fontSize: 16,
    color: HIGColors.label,
    textAlignVertical: 'top',
    minHeight: 70,
  },
  ratioDisplay: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    justifyContent: 'center',
    minHeight: 44,
  },
  ratioText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.systemBlue,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: HIGConstants.SPACING_XL,
  },
});