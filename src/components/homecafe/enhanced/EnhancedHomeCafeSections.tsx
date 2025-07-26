// EnhancedHomeCafeSections.tsx
// Content sections container for EnhancedHomeCafeScreen

import React from 'react';
import { YStack, AnimatePresence } from 'tamagui';
import { HomeCafeData, PouroverDripper } from '../../../types/tasting';
import { RecipeTemplate } from '../../../services/HomeCafeEnhancedService';
import EnhancedDripperSelector from '../EnhancedDripperSelector';
import GrindSizeGuide from '../GrindSizeGuide';
import PourPatternGuide from '../PourPatternGuide';
import InteractiveBrewTimer from '../InteractiveBrewTimer';
import { EnhancedHomeCafeRecipeSection } from './EnhancedHomeCafeRecipeSection';
import {
  SectionCard,
  SectionHeader,
  SectionTitle,
  SectionIcon,
} from './EnhancedHomeCafeStyledComponents';

interface EnhancedHomeCafeSectionsProps {
  activeSection: string;
  formData: HomeCafeData;
  useAdvancedMode: boolean;
  selectedRecipe: RecipeTemplate | null;
  showTimer: boolean;
  onDripperSelect: (dripper: string) => void;
  onUpdateField: (category: keyof HomeCafeData, field: string, value: unknown) => void;
  onRecipeTemplateSelect: (template: RecipeTemplate) => void;
  onTimerComplete: (actualBrewTime: number) => void;
  onCloseTimer: () => void;
}

export const EnhancedHomeCafeSections: React.FC<EnhancedHomeCafeSectionsProps> = ({
  activeSection,
  formData,
  useAdvancedMode,
  selectedRecipe,
  showTimer,
  onDripperSelect,
  onUpdateField,
  onRecipeTemplateSelect,
  onTimerComplete,
  onCloseTimer,
}) => {
  return (
    <AnimatePresence key={activeSection}>
      {activeSection === 'dripper' && (
        <SectionCard
          active={activeSection === 'dripper'}
          animation="lazy"
          animateOnly={['opacity', 'transform']}
        >
          <SectionHeader>
            <SectionTitle>드리퍼 선택</SectionTitle>
            <SectionIcon>⏳</SectionIcon>
          </SectionHeader>
          {/* @ts-ignore - Component prop mismatch */}
          <EnhancedDripperSelector
            selectedDripper={formData.equipment.dripper}
            onDripperSelect={onDripperSelect}
            showRecommendations={useAdvancedMode}
          />
        </SectionCard>
      )}

      {activeSection === 'recipe' && (
        <EnhancedHomeCafeRecipeSection
          formData={formData}
          useAdvancedMode={useAdvancedMode}
          selectedRecipe={selectedRecipe}
          onUpdateField={onUpdateField}
          onRecipeTemplateSelect={onRecipeTemplateSelect}
        />
      )}

      {activeSection === 'guides' && (
        <YStack gap="$lg">
          <SectionCard
            animation="lazy"
            animateOnly={['opacity', 'transform']}
          >
            <SectionHeader>
              <SectionTitle>분쇄도 가이드</SectionTitle>
              <SectionIcon>☕</SectionIcon>
            </SectionHeader>
            {/* @ts-ignore - Component prop mismatch */}
            <GrindSizeGuide 
              dripper={formData.equipment.dripper}
              brewMethod="pourover"
            />
          </SectionCard>
          
          <SectionCard
            animation="lazy"
            animateOnly={['opacity', 'transform']}
          >
            <SectionHeader>
              <SectionTitle>푸어링 패턴</SectionTitle>
              <SectionIcon>💧</SectionIcon>
            </SectionHeader>
            {/* @ts-ignore - Component prop mismatch */}
            <PourPatternGuide 
              technique={formData.recipe.pourTechnique}
              dripper={formData.equipment.dripper}
            />
          </SectionCard>
        </YStack>
      )}

      {activeSection === 'timer' && (
        <SectionCard
          animation="lazy"
          animateOnly={['opacity', 'transform']}
        >
          <SectionHeader>
            <SectionTitle>추출 타이머</SectionTitle>
            <SectionIcon>⏰</SectionIcon>
          </SectionHeader>
          {/* @ts-ignore - Component prop mismatch */}
          <InteractiveBrewTimer
            recipe={formData.recipe}
            onComplete={onTimerComplete}
            showModal={showTimer}
            onClose={onCloseTimer}
          />
        </SectionCard>
      )}
    </AnimatePresence>
  );
};