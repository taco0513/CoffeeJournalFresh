// EnhancedHomeCafeRecipeSection.tsx
// Recipe configuration section for EnhancedHomeCafeScreen

import React from 'react';
import { Alert } from 'react-native';
import { YStack } from 'tamagui';
import { HomeCafeData, PouroverDripper } from '../../../types/tasting';
import { RecipeTemplate } from '../../../services/HomeCafeEnhancedService';
import RecipeTemplateSelector from '../RecipeTemplateSelector';
import { EnhancedHomeCafeFormRow } from './EnhancedHomeCafeFormRow';
import {
  SectionCard,
  SectionHeader,
  SectionTitle,
  SectionIcon,
} from './EnhancedHomeCafeStyledComponents';

interface EnhancedHomeCafeRecipeSectionProps {
  formData: HomeCafeData;
  useAdvancedMode: boolean;
  selectedRecipe: RecipeTemplate | null;
  onUpdateField: (category: keyof HomeCafeData, field: string, value: unknown) => void;
  onRecipeTemplateSelect: (template: RecipeTemplate) => void;
}

export const EnhancedHomeCafeRecipeSection: React.FC<EnhancedHomeCafeRecipeSectionProps> = ({
  formData,
  useAdvancedMode,
  selectedRecipe,
  onUpdateField,
  onRecipeTemplateSelect,
}) => {
  const showPrompt = (
    title: string,
    message: string,
    field: string,
    currentValue: number,
    validator?: (value: number) => boolean
  ) => {
    Alert.prompt(
      title,
      message,
      (text) => {
        const value = parseInt(text);
        if (!isNaN(value) && value > 0 && (!validator || validator(value))) {
          onUpdateField('recipe', field, value);
      }
    },
      'plain-text',
      currentValue.toString()
    );
};

  return (
    <SectionCard
      active={true}
      animation="lazy"
      animateOnly={['opacity', 'transform']}
    >
      <SectionHeader>
        <SectionTitle>레시피 설정</SectionTitle>
        <SectionIcon></SectionIcon>
      </SectionHeader>
      
      {useAdvancedMode && (
        <RecipeTemplateSelector
          selectedDripper={formData.equipment.dripper}
          onRecipeSelect={onRecipeTemplateSelect}
          selectedTemplate={selectedRecipe}
          onTemplateSelect={onRecipeTemplateSelect}
          dripper={formData.equipment.dripper}
        />
      )}
      
      <YStack gap="$sm" marginTop="$md">
        <EnhancedHomeCafeFormRow
          label="원두량"
          value={`${formData.recipe.doseIn}g`}
          onPress={() => showPrompt(
            '원두량 설정',
            '원두량을 입력하세요 (g)',
            'doseIn',
            formData.recipe.doseIn,
            (value) => value >= 5 && value <= 50
          )}
        />
        
        <EnhancedHomeCafeFormRow
          label="물의 양"
          value={`${formData.recipe.waterAmount}ml`}
          onPress={() => showPrompt(
            '물의 양 설정',
            '물의 양을 입력하세요 (ml)',
            'waterAmount',
            formData.recipe.waterAmount,
            (value) => value >= 50 && value <= 1000
          )}
        />
        
        <EnhancedHomeCafeFormRow
          label="물 온도"
          value={`${formData.recipe.waterTemp}°C`}
          onPress={() => showPrompt(
            '물 온도 설정',
            '물 온도를 입력하세요 (°C)',
            'waterTemp',
            formData.recipe.waterTemp,
            (value) => value >= 80 && value <= 100
          )}
        />
        
        <EnhancedHomeCafeFormRow
          label="추출 비율"
          value={formData.recipe.ratio}
          onPress={() => {
            // Calculate ratio based on current dose and water
            const ratio = `1:${Math.round(formData.recipe.waterAmount / formData.recipe.doseIn * 10) / 10}`;
            onUpdateField('recipe', 'ratio', ratio);
        }}
        />
        
        <EnhancedHomeCafeFormRow
          label="블룸 물 양"
          value={`${formData.recipe.bloomWater}ml`}
          onPress={() => showPrompt(
            '블룸 물 양 설정',
            '블룸 물 양을 입력하세요 (ml)',
            'bloomWater',
            formData.recipe.bloomWater || 40,
            (value) => value >= 20 && value <= 100
          )}
        />
        
        <EnhancedHomeCafeFormRow
          label="블룸 시간"
          value={`${formData.recipe.bloomTime}초`}
          onPress={() => showPrompt(
            '블룸 시간 설정',
            '블룸 시간을 입력하세요 (초)',
            'bloomTime',
            formData.recipe.bloomTime || 30,
            (value) => value >= 15 && value <= 60
          )}
        />
        
        <EnhancedHomeCafeFormRow
          label="총 추출 시간"
          value={`${Math.floor(formData.recipe.totalBrewTime / 60)}분 ${formData.recipe.totalBrewTime % 60}초`}
          onPress={() => showPrompt(
            '총 추출 시간 설정',
            '총 추출 시간을 입력하세요 (초)',
            'totalBrewTime',
            formData.recipe.totalBrewTime,
            (value) => value >= 60 && value <= 600
          )}
        />
      </YStack>
    </SectionCard>
  );
};