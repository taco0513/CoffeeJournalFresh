// EnhancedHomeCafeQuickActions.tsx
// Quick actions component for EnhancedHomeCafeScreen

import React from 'react';
import { RecipeTemplate } from '../../../services/HomeCafeEnhancedService';
import { PouroverDripper } from '../../../types/tasting';
import {
  QuickActionsCard,
  QuickActionsGrid,
  QuickActionButton,
  QuickActionContent,
  QuickActionIcon,
  QuickActionText,
  SectionHeader,
  SectionTitle,
  SectionIcon,
} from './EnhancedHomeCafeStyledComponents';

interface EnhancedHomeCafeQuickActionsProps {
  useAdvancedMode: boolean;
  currentDripper: PouroverDripper;
  onStartTimer: () => void;
  onShowGuides: () => void;
  onApplyTemplate: (template: RecipeTemplate) => void;
  onToggleAdvancedMode: () => void;
}

export const EnhancedHomeCafeQuickActions: React.FC<EnhancedHomeCafeQuickActionsProps> = ({
  useAdvancedMode,
  currentDripper,
  onStartTimer,
  onShowGuides,
  onApplyTemplate,
  onToggleAdvancedMode,
}) => {
  const handleApplyDefaultTemplate = () => {
    // Create default template based on current dripper
    const defaultTemplate: RecipeTemplate = {
      id: 'default-standard',
      name: 'Standard Recipe',
      korean: '표준 레시피',
      author: 'CupNote',
      dripper: currentDripper,
      difficulty: 'beginner',
      description: '표준적인 추출 레시피',
      recipe: {
        doseIn: 15,
        waterAmount: 250,
        ratio: '1:16.7',
        waterTemp: 93,
        grindSize: 'Medium',
        totalBrewTime: 210,
        steps: []
    },
      notes: [],
      tags: ['standard', 'basic']
  };
    
    onApplyTemplate(defaultTemplate);
};

  return (
    <QuickActionsCard>
      <SectionHeader>
        <SectionTitle>빠른 액션</SectionTitle>
        <SectionIcon>⚡</SectionIcon>
      </SectionHeader>
      
      <QuickActionsGrid>
        <QuickActionButton onPress={onStartTimer} unstyled>
          <QuickActionContent>
            <QuickActionIcon>⏰</QuickActionIcon>
            <QuickActionText>타이머 시작</QuickActionText>
          </QuickActionContent>
        </QuickActionButton>
        
        <QuickActionButton onPress={onShowGuides} unstyled>
          <QuickActionContent>
            <QuickActionIcon>📖</QuickActionIcon>
            <QuickActionText>추출 가이드</QuickActionText>
          </QuickActionContent>
        </QuickActionButton>
        
        <QuickActionButton onPress={handleApplyDefaultTemplate} unstyled>
          <QuickActionContent>
            <QuickActionIcon>🎯</QuickActionIcon>
            <QuickActionText>추천 레시피</QuickActionText>
          </QuickActionContent>
        </QuickActionButton>
        
        <QuickActionButton onPress={onToggleAdvancedMode} unstyled>
          <QuickActionContent>
            <QuickActionIcon>{useAdvancedMode ? '🔧' : '⚙️'}</QuickActionIcon>
            <QuickActionText>
              {useAdvancedMode ? '고급 모드' : '간단 모드'}
            </QuickActionText>
          </QuickActionContent>
        </QuickActionButton>
      </QuickActionsGrid>
    </QuickActionsCard>
  );
};