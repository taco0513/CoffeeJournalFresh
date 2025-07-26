// EnhancedHomeCafeScreen.tsx
// Main screen component - now modularized for better build performance

import React, { useState, useEffect } from 'react';
import { SafeAreaView, Alert } from 'react-native';
import { View, ScrollView } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { useTastingStore } from '../../stores/tastingStore';
import { HomeCafeData, PouroverDripper } from '../../types/tasting';
import { RecipeTemplate } from '../../services/HomeCafeEnhancedService';
import HomeCafeEnhancedService from '../../services/HomeCafeEnhancedService';

// Modular Components
import {
  Container,
  SectionContainer,
} from '../../components/homecafe/enhanced';
import { EnhancedHomeCafeNavigation } from '../../components/homecafe/enhanced/EnhancedHomeCafeNavigation';
import { EnhancedHomeCafeTabs } from '../../components/homecafe/enhanced/EnhancedHomeCafeTabs';
import { EnhancedHomeCafeSections } from '../../components/homecafe/enhanced/EnhancedHomeCafeSections';
import { EnhancedHomeCafeQuickActions } from '../../components/homecafe/enhanced/EnhancedHomeCafeQuickActions';
import { EnhancedHomeCafeBottomActions } from '../../components/homecafe/enhanced/EnhancedHomeCafeBottomActions';
import { EnhancedHomeCafeTimerModal } from '../../components/homecafe/enhanced/EnhancedHomeCafeTimerModal';

interface EnhancedHomeCafeScreenProps {
  onNext?: () => void;
}

export const EnhancedHomeCafeScreen: React.FC<EnhancedHomeCafeScreenProps> = ({ onNext }) => {
  const { t } = useTranslation();
  const { currentTasting, updateHomeCafeData } = useTastingStore();
  const enhancedService = HomeCafeEnhancedService.getInstance();

  // Form state
  const [formData, setFormData] = useState<HomeCafeData>(
    currentTasting.homeCafeData || {
      equipment: {
        dripper: 'V60',
        filter: 'bleached',
    },
      recipe: {
        doseIn: 20,
        waterAmount: 300,
        ratio: '1:15',
        waterTemp: 92,
        bloomWater: 40,
        bloomTime: 30,
        pourTechnique: 'pulse',
        numberOfPours: 3,
        totalBrewTime: 180,
    },
  }
  );

  // UI state
  const [activeSection, setActiveSection] = useState<string>('dripper');
  const [showTimer, setShowTimer] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeTemplate | null>(null);
  const [useAdvancedMode, setUseAdvancedMode] = useState(false);

  // Update parent store when form data changes
  useEffect(() => {
    updateHomeCafeData(formData);
}, [formData, updateHomeCafeData]);

  const updateField = (category: keyof HomeCafeData, field: string, value: unknown) => {
    const updatedFormData = {
      ...formData,
      [category]: {
        ...formData[category],
        [field]: value,
    },
  } as HomeCafeData;
    
    setFormData(updatedFormData);
};

  const handleDripperSelect = (dripper: string) => {
    updateField('equipment', 'dripper', dripper);
    
    // Auto-calculate recommended recipe
    const recommendedRecipe = enhancedService.calculateRecommendedRecipe(
      dripper,
      formData.recipe.doseIn
    );
    
    if (recommendedRecipe.waterAmount) {
      updateField('recipe', 'waterAmount', recommendedRecipe.waterAmount);
  }
    if (recommendedRecipe.ratio) {
      updateField('recipe', 'ratio', recommendedRecipe.ratio);
  }
    if (recommendedRecipe.waterTemp) {
      updateField('recipe', 'waterTemp', recommendedRecipe.waterTemp);
  }
};

  const handleRecipeTemplateSelect = (template: RecipeTemplate) => {
    setSelectedRecipe(template);
    
    // Apply template to form data
    setFormData({
      ...formData,
      equipment: {
        ...formData.equipment,
        dripper: template.dripper as PouroverDripper,
        filter: (template as unknown).filter || formData.equipment.filter,
    },
      recipe: {
        ...formData.recipe,
        ...template.recipe,
    },
  });
};

  const handleStartTimer = () => {
    if (!formData.recipe.totalBrewTime) {
      Alert.alert('오류', '먼저 총 추출 시간을 설정해주세요.');
      return;
  }
    setShowTimer(true);
};

  const handleTimerComplete = (actualBrewTime: number) => {
    updateField('recipe', 'totalBrewTime', actualBrewTime);
    setShowTimer(false);
    
    Alert.alert(
      '추출 완료!',
      `실제 추출 시간: ${Math.floor(actualBrewTime / 60)}분 ${actualBrewTime % 60}초`,
      [{ text: '확인' }]
    );
};

  const handleShowGuides = () => {
    setActiveSection('guides');
};

  const handleToggleAdvancedMode = () => {
    setUseAdvancedMode(!useAdvancedMode);
};

  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Navigation Bar */}
        <EnhancedHomeCafeNavigation
          useAdvancedMode={useAdvancedMode}
          onAdvancedModeToggle={setUseAdvancedMode}
        />

        {/* Section Tabs */}
        <View paddingHorizontal="$lg" paddingVertical="$sm">
          <EnhancedHomeCafeTabs
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </View>

        <ScrollView 
          flex={1} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <SectionContainer>
            {/* Main Sections */}
            <EnhancedHomeCafeSections
              activeSection={activeSection}
              formData={formData}
              useAdvancedMode={useAdvancedMode}
              selectedRecipe={selectedRecipe}
              showTimer={showTimer}
              onDripperSelect={handleDripperSelect}
              onUpdateField={updateField}
              onRecipeTemplateSelect={handleRecipeTemplateSelect}
              onTimerComplete={handleTimerComplete}
              onCloseTimer={() => setShowTimer(false)}
            />

            {/* Quick Actions */}
            <EnhancedHomeCafeQuickActions
              useAdvancedMode={useAdvancedMode}
              currentDripper={formData.equipment.dripper}
              onStartTimer={handleStartTimer}
              onShowGuides={handleShowGuides}
              onApplyTemplate={handleRecipeTemplateSelect}
              onToggleAdvancedMode={handleToggleAdvancedMode}
            />
          </SectionContainer>
        </ScrollView>

        {/* Bottom Actions */}
        <EnhancedHomeCafeBottomActions
          onNext={onNext}
        />

        {/* Timer Modal */}
        <EnhancedHomeCafeTimerModal
          showTimer={showTimer}
          recipe={formData.recipe}
          onComplete={handleTimerComplete}
          onClose={() => setShowTimer(false)}
        />
      </SafeAreaView>
    </Container>
  );
};

export default EnhancedHomeCafeScreen;