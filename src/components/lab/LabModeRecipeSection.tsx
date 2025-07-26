// LabModeRecipeSection.tsx
// Recipe section component for LabModeForm

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { HIGColors } from '../../styles/common';
import { PourTechnique } from '../../types/tasting';
import { labModeFormStyles } from './LabModeFormStyles';

interface RecipeData {
  doseIn: number;
  waterAmount: number;
  ratio: string;
  waterTemp: number;
  bloomWater: number;
  bloomTime: number;
  bloomAgitation?: boolean;
  pourTechnique: PourTechnique;
  numberOfPours: number;
  totalBrewTime: number;
  agitation?: string;
  agitationTiming?: string;
}

interface LabModeRecipeSectionProps {
  recipeData: RecipeData;
  onUpdateField: (path: string, value: unknown) => void;
}

const pourTechniques: { key: PourTechnique; label: string; description: string }[] = [
  { key: 'center', label: '센터 포어', description: '중앙 집중' },
  { key: 'spiral', label: '스파이럴', description: '나선형' },
  { key: 'pulse', label: '펄스', description: '단계별' },
  { key: 'continuous', label: '연속', description: '끊김 없이' },
  { key: 'multiStage', label: '다단계', description: '여러 번' },
];

export const LabModeRecipeSection: React.FC<LabModeRecipeSectionProps> = ({
  recipeData,
  onUpdateField,
}) => {
  return (
    <View style={labModeFormStyles.section}>
      <Text style={labModeFormStyles.sectionTitle}>레시피 상세</Text>
      
      {/* Basic Recipe Grid */}
      <View style={styles.recipeGrid}>
        <View style={styles.recipeItem}>
          <Text style={styles.recipeLabel}>원두 (g)</Text>
          <TextInput
            style={styles.recipeInput}
            value={recipeData.doseIn.toString()}
            onChangeText={(text) => onUpdateField('recipe.doseIn', parseInt(text) || 0)}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.recipeItem}>
          <Text style={styles.recipeLabel}>물 (g)</Text>
          <TextInput
            style={styles.recipeInput}
            value={recipeData.waterAmount.toString()}
            onChangeText={(text) => onUpdateField('recipe.waterAmount', parseInt(text) || 0)}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.recipeItem}>
          <Text style={styles.recipeLabel}>비율</Text>
          <Text style={styles.ratioText}>{recipeData.ratio}</Text>
        </View>
        <View style={styles.recipeItem}>
          <Text style={styles.recipeLabel}>온도 (°C)</Text>
          <TextInput
            style={styles.recipeInput}
            value={recipeData.waterTemp.toString()}
            onChangeText={(text) => onUpdateField('recipe.waterTemp', parseInt(text) || 0)}
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
              value={recipeData.bloomWater.toString()}
              onChangeText={(text) => onUpdateField('recipe.bloomWater', parseInt(text) || 0)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.bloomItem}>
            <Text style={styles.bloomLabel}>블룸 시간 (초)</Text>
            <TextInput
              style={styles.bloomInput}
              value={recipeData.bloomTime.toString()}
              onChangeText={(text) => onUpdateField('recipe.bloomTime', parseInt(text) || 0)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.bloomItem}>
            <Text style={styles.bloomLabel}>블룸 교반</Text>
            <Switch
              value={recipeData.bloomAgitation || false}
              onValueChange={(value) => onUpdateField('recipe.bloomAgitation', value)}
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
            labModeFormStyles.pourTechniqueCard,
            recipeData.pourTechnique === technique.key && labModeFormStyles.pourTechniqueCardActive
          ]}
          onPress={() => onUpdateField('recipe.pourTechnique', technique.key)}
        >
          <View>
            <Text style={[
              labModeFormStyles.pourTechniqueTitle,
              recipeData.pourTechnique === technique.key && labModeFormStyles.pourTechniqueTitleActive
            ]}>
              {technique.label}
            </Text>
            <Text style={[
              labModeFormStyles.pourTechniqueDescription,
              recipeData.pourTechnique === technique.key && labModeFormStyles.pourTechniqueDescriptionActive
            ]}>
              {technique.description}
            </Text>
          </View>
          {recipeData.pourTechnique === technique.key && (
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
              style={labModeFormStyles.numberButton}
              onPress={() => onUpdateField('recipe.numberOfPours', Math.max(1, recipeData.numberOfPours - 1))}
            >
              <Text style={labModeFormStyles.numberButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.numberText}>{recipeData.numberOfPours}</Text>
            <TouchableOpacity
              style={labModeFormStyles.numberButton}
              onPress={() => onUpdateField('recipe.numberOfPours', Math.min(10, recipeData.numberOfPours + 1))}
            >
              <Text style={labModeFormStyles.numberButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.pourDetailRow}>
          <Text style={styles.pourDetailLabel}>총 추출시간 (초)</Text>
          <TextInput
            style={styles.timeInput}
            value={recipeData.totalBrewTime.toString()}
            onChangeText={(text) => onUpdateField('recipe.totalBrewTime', parseInt(text) || 0)}
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
                recipeData.agitation === method && styles.agitationOptionActive
              ]}
              onPress={() => onUpdateField('recipe.agitation', method)}
            >
              <Text style={[
                styles.agitationText,
                recipeData.agitation === method && styles.agitationTextActive
              ]}>
                {method === 'none' ? '없음' : 
                 method === 'stir' ? '젓기' :
                 method === 'swirl' ? '돌리기' : '탭핑'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {recipeData.agitation && recipeData.agitation !== 'none' && (
          <TextInput
            style={styles.agitationTimingInput}
            value={recipeData.agitationTiming || ''}
            onChangeText={(text) => onUpdateField('recipe.agitationTiming', text)}
            placeholder="교반 타이밍 (예: 블룸 후, 마지막 붓기 후)"
            placeholderTextColor={HIGColors.tertiaryLabel}
          />
        )}
      </View>
    </View>
  );
};

// Additional styles specific to recipe section
const styles = {
  recipeGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 16,
    marginBottom: 24,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600' as const,
    color: HIGColors.label,
    textAlign: 'center' as const,
},
  ratioText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: HIGColors.systemBlue,
    textAlign: 'center' as const,
    paddingVertical: 12,
},
  bloomSection: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
},
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: HIGColors.label,
    marginTop: 16,
    marginBottom: 16,
},
  bloomGrid: {
    flexDirection: 'row' as const,
    gap: 16,
    alignItems: 'center' as const,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600' as const,
    color: HIGColors.label,
    textAlign: 'center' as const,
},
  pourDetails: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
},
  pourDetailRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 16,
},
  pourDetailLabel: {
    fontSize: 16,
    color: HIGColors.label,
    fontWeight: '500' as const,
},
  numberPicker: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
},
  numberText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: HIGColors.label,
    minWidth: 30,
    textAlign: 'center' as const,
},
  timeInput: {
    backgroundColor: HIGColors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600' as const,
    color: HIGColors.label,
    width: 80,
    textAlign: 'center' as const,
},
  agitationSection: {
    marginTop: 24,
},
  agitationOptions: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 16,
},
  agitationOption: {
    flex: 1,
    backgroundColor: HIGColors.systemGray6,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center' as const,
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
    fontWeight: '500' as const,
},
  agitationTextActive: {
    color: HIGColors.systemBlue,
    fontWeight: '700' as const,
},
  agitationTimingInput: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 14,
    color: HIGColors.label,
},
  checkmark: {
    fontSize: 20,
    color: HIGColors.systemBlue,
    fontWeight: '700' as const,
},
};