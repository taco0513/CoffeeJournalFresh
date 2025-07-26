import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LabModeData, HomeCafeData } from '../../types/tasting';
import { HIGColors, HIGConstants } from '../../styles/common';

interface LabModeDataEntryProps {
  data: LabModeData | undefined;
  onChange: (data: LabModeData) => void;
}

interface AgitationMethodOption {
  value: 'none' | 'stir' | 'swirl' | 'tap';
  label: string;
  description: string;
}

const agitationMethods: AgitationMethodOption[] = [
  { value: 'none', label: '없음', description: '교반 없이 자연 추출' },
  { value: 'stir', label: '스티어링', description: '스푼으로 원형 교반' },
  { value: 'swirl', label: '스월링', description: '용기를 회전시켜 교반' },
  { value: 'tap', label: '태핑', description: '용기 측면을 가볍게 두드림' },
];

const predefinedVariables = [
  '분쇄도', '물온도', '추출시간', '교반방법', '물:원두 비율', 
  '부어넣는 속도', '필터 종류', '원두 로스팅일자'
];

export const LabModeDataEntry: React.FC<LabModeDataEntryProps> = ({
  data,
  onChange,
}) => {
  const [showAdvancedMeasurements, setShowAdvancedMeasurements] = useState(false);
  const [selectedVariable, setSelectedVariable] = useState(data?.comparison?.variable || '');
  const [customVariable, setCustomVariable] = useState('');

  const updateData = useCallback((field: keyof LabModeData, value: unknown) => {
    const currentData = data || {} as LabModeData;
    const updatedData = { ...currentData, [field]: value };
    onChange(updatedData);
}, [data, onChange]);

  const updateComparison = useCallback((field: keyof NonNullable<LabModeData['comparison']>, value: unknown) => {
    const currentData = data || {} as LabModeData;
    const currentComparison = currentData.comparison || {
      variable: '',
      previousValue: '',
      currentValue: '',
      result: '',
  };
    
    const updatedComparison = { ...currentComparison, [field]: value };
    onChange({ ...currentData, comparison: updatedComparison });
}, [data, onChange]);

  const updateAgitation = useCallback((field: keyof NonNullable<LabModeData['agitation']>, value: unknown) => {
    const currentData = data || {} as LabModeData;
    const currentAgitation = currentData.agitation || {
      method: 'none' as const,
      timing: [],
  };
    
    const updatedAgitation = { ...currentAgitation, [field]: value };
    onChange({ ...currentData, agitation: updatedAgitation });
}, [data, onChange]);

  const addTimingEntry = useCallback(() => {
    const timing = data?.agitation?.timing || [];
    const newTiming = [...timing, ''];
    updateAgitation('timing', newTiming);
}, [data?.agitation?.timing, updateAgitation]);

  const updateTimingEntry = useCallback((index: number, value: string) => {
    const timing = data?.agitation?.timing || [];
    const newTiming = [...timing];
    newTiming[index] = value;
    updateAgitation('timing', newTiming);
}, [data?.agitation?.timing, updateAgitation]);

  const removeTimingEntry = useCallback((index: number) => {
    const timing = data?.agitation?.timing || [];
    const newTiming = timing.filter((_, i) => i !== index);
    updateAgitation('timing', newTiming);
}, [data?.agitation?.timing, updateAgitation]);

  const handleVariableSelection = useCallback((variable: string) => {
    setSelectedVariable(variable);
    updateComparison('variable', variable);
}, [updateComparison]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Professional Measurements Section */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setShowAdvancedMeasurements(!showAdvancedMeasurements)}
        >
          <Text style={styles.sectionTitle}>정밀 측정 데이터</Text>
          <Text style={styles.toggleIcon}>
            {showAdvancedMeasurements ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {showAdvancedMeasurements && (
          <View style={styles.sectionContent}>
            <View style={styles.measurementRow}>
              <View style={styles.measurementItem}>
                <Text style={styles.measurementLabel}>TDS (총용존고형물)</Text>
                <TextInput
                  style={styles.measurementInput}
                  value={data?.tds?.toString() || ''}
                  onChangeText={(text) => updateData('tds', parseFloat(text) || undefined)}
                  placeholder="예: 1.35"
                  keyboardType="decimal-pad"
                />
                <Text style={styles.measurementUnit}>%</Text>
              </View>
              
              <View style={styles.measurementItem}>
                <Text style={styles.measurementLabel}>추출수율</Text>
                <TextInput
                  style={styles.measurementInput}
                  value={data?.extractionYield?.toString() || ''}
                  onChangeText={(text) => updateData('extractionYield', parseFloat(text) || undefined)}
                  placeholder="예: 19.5"
                  keyboardType="decimal-pad"
                />
                <Text style={styles.measurementUnit}>%</Text>
              </View>
            </View>
            
            <Text style={styles.measurementHint}>
               이상적인 범위: TDS 1.2-1.5%, 추출수율 18-22%
            </Text>
          </View>
        )}
      </View>

      {/* Comparison/Experiment Tracking */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>실험 비교 분석</Text>
        
        <View style={styles.subsection}>
          <Text style={styles.fieldLabel}>변경한 변수</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.variableScroll}
          >
            {predefinedVariables.map((variable) => (
              <TouchableOpacity
                key={variable}
                style={[
                  styles.variableChip,
                  selectedVariable === variable && styles.variableChipSelected
                ]}
                onPress={() => handleVariableSelection(variable)}
              >
                <Text style={[
                  styles.variableChipText,
                  selectedVariable === variable && styles.variableChipTextSelected
                ]}>
                  {variable}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TextInput
            style={styles.textInput}
            value={customVariable}
            onChangeText={(text) => {
              setCustomVariable(text);
              if (text.trim()) {
                handleVariableSelection(text.trim());
            }
          }}
            placeholder="또는 직접 입력"
          />
        </View>

        <View style={styles.comparisonRow}>
          <View style={styles.comparisonItem}>
            <Text style={styles.fieldLabel}>이전 값</Text>
            <TextInput
              style={styles.textInput}
              value={data?.comparison?.previousValue?.toString() || ''}
              onChangeText={(text) => updateComparison('previousValue', text)}
              placeholder="예: 중간 분쇄"
            />
          </View>
          
          <View style={styles.comparisonArrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
          
          <View style={styles.comparisonItem}>
            <Text style={styles.fieldLabel}>현재 값</Text>
            <TextInput
              style={styles.textInput}
              value={data?.comparison?.currentValue?.toString() || ''}
              onChangeText={(text) => updateComparison('currentValue', text)}
              placeholder="예: 세밀 분쇄"
            />
          </View>
        </View>

        <View style={styles.subsection}>
          <Text style={styles.fieldLabel}>변경 결과/관찰사항</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={data?.comparison?.result || ''}
            onChangeText={(text) => updateComparison('result', text)}
            placeholder="예: 추출시간 단축, 바디감 증가, 쓴맛 강화됨"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {/* Agitation Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>교반 방법</Text>
        
        <View style={styles.agitationMethods}>
          {agitationMethods.map((method) => (
            <TouchableOpacity
              key={method.value}
              style={[
                styles.agitationMethod,
                data?.agitation?.method === method.value && styles.agitationMethodSelected
              ]}
              onPress={() => updateAgitation('method', method.value)}
            >
              <Text style={[
                styles.agitationMethodTitle,
                data?.agitation?.method === method.value && styles.agitationMethodTitleSelected
              ]}>
                {method.label}
              </Text>
              <Text style={[
                styles.agitationMethodDesc,
                data?.agitation?.method === method.value && styles.agitationMethodDescSelected
              ]}>
                {method.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {data?.agitation?.method !== 'none' && (
          <View style={styles.subsection}>
            <View style={styles.timingHeader}>
              <Text style={styles.fieldLabel}>교반 타이밍 기록</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addTimingEntry}
              >
                <Text style={styles.addButtonText}>+ 추가</Text>
              </TouchableOpacity>
            </View>
            
            {(data?.agitation?.timing || []).map((timing, index) => (
              <View key={index} style={styles.timingEntry}>
                <TextInput
                  style={[styles.textInput, styles.timingInput]}
                  value={timing}
                  onChangeText={(text) => updateTimingEntry(index, text)}
                  placeholder={`${index + 1}차: 예) 30초 후 10초간 스티어링`}
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeTimingEntry(index)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
},
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
},
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 12,
},
  toggleIcon: {
    fontSize: 16,
    color: HIGColors.systemBlue,
    fontWeight: '600',
},
  sectionContent: {
    paddingTop: 8,
},
  subsection: {
    marginBottom: 16,
},
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
},
  measurementItem: {
    flex: 1,
    marginHorizontal: 4,
},
  measurementLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: HIGColors.label,
    marginBottom: 6,
},
  measurementInput: {
    height: 44,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: HIGColors.systemBackground,
    textAlign: 'center',
},
  measurementUnit: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginTop: 4,
},
  measurementHint: {
    fontSize: 12,
    color: HIGColors.systemBlue,
    fontStyle: 'italic',
    marginTop: 8,
    paddingHorizontal: 8,
},
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: HIGColors.label,
    marginBottom: 8,
},
  textInput: {
    height: 44,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: HIGColors.systemBackground,
},
  multilineInput: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
},
  variableScroll: {
    marginBottom: 12,
},
  variableChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: 16,
    marginRight: 8,
},
  variableChipSelected: {
    backgroundColor: HIGColors.systemBlue,
},
  variableChipText: {
    fontSize: 14,
    color: HIGColors.label,
},
  variableChipTextSelected: {
    color: HIGColors.systemBackground,
    fontWeight: '500',
},
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
},
  comparisonItem: {
    flex: 1,
},
  comparisonArrow: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
},
  arrowText: {
    fontSize: 20,
    color: HIGColors.systemBlue,
    fontWeight: '600',
},
  agitationMethods: {
    marginBottom: 16,
},
  agitationMethod: {
    padding: 16,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: HIGColors.systemBackground,
},
  agitationMethodSelected: {
    borderColor: HIGColors.systemBlue,
    backgroundColor: HIGColors.systemBlue + '10',
},
  agitationMethodTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: HIGColors.label,
    marginBottom: 4,
},
  agitationMethodTitleSelected: {
    color: HIGColors.systemBlue,
    fontWeight: '600',
},
  agitationMethodDesc: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
},
  agitationMethodDescSelected: {
    color: HIGColors.systemBlue,
},
  timingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
},
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: HIGColors.systemBlue,
    borderRadius: 16,
},
  addButtonText: {
    color: HIGColors.systemBackground,
    fontSize: 14,
    fontWeight: '500',
},
  timingEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
},
  timingInput: {
    flex: 1,
    marginRight: 8,
},
  removeButton: {
    width: 32,
    height: 32,
    backgroundColor: HIGColors.systemRed,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
},
  removeButtonText: {
    color: HIGColors.systemBackground,
    fontSize: 16,
    fontWeight: '600',
},
});