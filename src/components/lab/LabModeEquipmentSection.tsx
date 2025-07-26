// LabModeEquipmentSection.tsx
// Equipment section component for LabModeForm

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { HIGColors } from '../../styles/common';
import { PouroverDripper, FilterType } from '../../types/tasting';
import { labModeFormStyles } from './LabModeFormStyles';

interface EquipmentData {
  dripper: PouroverDripper;
  filter: FilterType;
  dripperSize?: string;
  grinder?: {
    brand?: string;
    model?: string;
    setting?: string;
};
}

interface LabModeEquipmentSectionProps {
  equipmentData: EquipmentData;
  onUpdateField: (path: string, value: unknown) => void;
}

const allDrippers: { key: PouroverDripper; label: string }[] = [
  { key: 'V60', label: 'V60' },
  { key: 'Kalita Wave', label: 'Kalita Wave' },
  { key: 'Origami', label: 'Origami' },
  { key: 'Chemex', label: 'Chemex' },
  { key: 'Fellow Stagg', label: 'Fellow Stagg' },
  { key: 'April', label: 'April' },
  { key: 'Orea', label: 'Orea' },
  { key: 'Flower Dripper', label: 'Flower Dripper' },
  { key: 'Blue Bottle', label: 'Blue Bottle' },
  { key: 'Timemore Crystal Eye', label: 'Timemore' },
];

const filters: { key: FilterType; label: string }[] = [
  { key: 'bleached', label: '표백 필터' },
  { key: 'natural', label: '무표백 필터' },
  { key: 'wave', label: '웨이브 필터' },
  { key: 'chemex', label: '케멕스 필터' },
  { key: 'metal', label: '금속 필터' },
  { key: 'cloth', label: '천 필터' },
];

export const LabModeEquipmentSection: React.FC<LabModeEquipmentSectionProps> = ({
  equipmentData,
  onUpdateField,
}) => {
  return (
    <View style={labModeFormStyles.section}>
      <Text style={labModeFormStyles.sectionTitle}>장비 설정</Text>
      
      {/* Dripper Selection */}
      <Text style={labModeFormStyles.fieldLabel}>드리퍼</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={labModeFormStyles.horizontalScroll}
      >
        <View style={labModeFormStyles.chipContainer}>
          {allDrippers.map((dripper) => (
            <TouchableOpacity
              key={dripper.key}
              style={[
                labModeFormStyles.chip,
                equipmentData.dripper === dripper.key && labModeFormStyles.chipActive
              ]}
              onPress={() => onUpdateField('equipment.dripper', dripper.key)}
            >
              <Text style={[
                labModeFormStyles.chipText,
                equipmentData.dripper === dripper.key && labModeFormStyles.chipTextActive
              ]}>
                {dripper.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Dripper Size */}
      <View style={labModeFormStyles.fieldRow}>
        <Text style={labModeFormStyles.fieldLabel}>드리퍼 사이즈</Text>
        <TextInput
          style={labModeFormStyles.textInput}
          value={equipmentData.dripperSize || ''}
          onChangeText={(text) => onUpdateField('equipment.dripperSize', text)}
          placeholder="01, 02, 155..."
          placeholderTextColor={HIGColors.tertiaryLabel}
        />
      </View>

      {/* Filter Selection */}
      <Text style={labModeFormStyles.fieldLabel}>필터</Text>
      <View style={labModeFormStyles.gridContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              labModeFormStyles.gridItem,
              equipmentData.filter === filter.key && labModeFormStyles.gridItemActive
            ]}
            onPress={() => onUpdateField('equipment.filter', filter.key)}
          >
            <Text style={[
              labModeFormStyles.gridItemText,
              equipmentData.filter === filter.key && labModeFormStyles.gridItemTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Grinder Info */}
      <View style={labModeFormStyles.grinderSection}>
        <Text style={labModeFormStyles.fieldLabel}>그라인더 정보</Text>
        <View style={labModeFormStyles.grinderInputs}>
          <TextInput
            style={[labModeFormStyles.textInput, labModeFormStyles.grinderInput]}
            value={equipmentData.grinder?.brand || ''}
            onChangeText={(text) => onUpdateField('equipment.grinder.brand', text)}
            placeholder="브랜드"
            placeholderTextColor={HIGColors.tertiaryLabel}
          />
          <TextInput
            style={[labModeFormStyles.textInput, labModeFormStyles.grinderInput]}
            value={equipmentData.grinder?.model || ''}
            onChangeText={(text) => onUpdateField('equipment.grinder.model', text)}
            placeholder="모델"
            placeholderTextColor={HIGColors.tertiaryLabel}
          />
        </View>
        <TextInput
          style={[labModeFormStyles.textInput, { marginTop: 8 }]}
          value={equipmentData.grinder?.setting || ''}
          onChangeText={(text) => onUpdateField('equipment.grinder.setting', text)}
          placeholder="분쇄도 설정 (예: 4.5, Medium)"
          placeholderTextColor={HIGColors.tertiaryLabel}
        />
      </View>
    </View>
  );
};