import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { HIGColors, HIGConstants } from '../styles/common';
import { useTastingStore } from '../stores/tastingStore';
import { HomeCafeData } from '../types/tasting';

// Enhanced HomeCafe Components
import EnhancedDripperSelector from '../components/homecafe/EnhancedDripperSelector';
import RecipeTemplateSelector from '../components/homecafe/RecipeTemplateSelector';
import GrindSizeGuide from '../components/homecafe/GrindSizeGuide';
import PourPatternGuide from '../components/homecafe/PourPatternGuide';
import InteractiveBrewTimer from '../components/homecafe/InteractiveBrewTimer';

// Services
import HomeCafeEnhancedService, { RecipeTemplate } from '../services/HomeCafeEnhancedService';

interface EnhancedHomeCafeScreenProps {
  onNext?: () => void;
}

export const EnhancedHomeCafeScreen: React.FC<EnhancedHomeCafeScreenProps> = ({ onNext }) => {
  const navigation = useNavigation();
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

  const updateField = (category: keyof HomeCafeData, field: string, value: any) => {
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

  const handleSizeSelect = (size: string) => {
    updateField('equipment', 'dripperSize', size);
  };

  const handleRecipeSelect = (recipe: RecipeTemplate) => {
    setSelectedRecipe(recipe);
    
    // Apply recipe to form data
    updateField('recipe', 'doseIn', recipe.recipe.doseIn);
    updateField('recipe', 'waterAmount', recipe.recipe.waterAmount);
    updateField('recipe', 'ratio', recipe.recipe.ratio);
    updateField('recipe', 'waterTemp', recipe.recipe.waterTemp);
    updateField('recipe', 'totalBrewTime', recipe.recipe.totalBrewTime);
    
    Alert.alert(
      '레시피 적용됨 ✅',
      `${recipe.korean} 레시피가 적용되었습니다.\n타이머를 사용하여 단계별로 진행하세요.`,
      [
        { text: '타이머 시작', onPress: () => setShowTimer(true) },
        { text: '나중에', style: 'cancel' }
      ]
    );
  };

  const handleGrindSizeSelect = (grindSize: string) => {
    // Add grind size to notes or equipment
    const currentNotes = formData.notes?.nextExperiment || '';
    const newNotes = currentNotes ? `${currentNotes}, 분쇄도: ${grindSize}` : `분쇄도: ${grindSize}`;
    
    setFormData(prev => ({
      ...prev,
      notes: {
        ...prev.notes,
        nextExperiment: newNotes
      }
    }));
  };

  const handlePatternSelect = (pattern: string) => {
    updateField('recipe', 'pourTechnique', pattern);
  };

  const handleTimerComplete = (lapTimes: number[]) => {
    // Store lap times in notes
    const lapTimesStr = lapTimes.map((time, index) => 
      `${index + 1}단계: ${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`
    ).join(', ');
    
    setFormData(prev => ({
      ...prev,
      notes: {
        ...prev.notes,
        tasteResult: `추출 완료 - ${lapTimesStr}`
      }
    }));
  };

  const sections = [
    { id: 'dripper', title: '드리퍼 선택', icon: '☕' },
    { id: 'recipe', title: '레시피', icon: '📋' },
    { id: 'grind', title: '분쇄도', icon: '⚙️' },
    { id: 'technique', title: '붓기 기법', icon: '🌊' },
    { id: 'timer', title: '타이머', icon: '⏱️' }
  ];

  const handleNext = () => {
    // Validate required fields
    if (!formData.equipment.dripper) {
      Alert.alert('드리퍼를 선택해주세요');
      return;
    }
    
    updateHomeCafeData(formData);
    onNext?.();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로 홈카페 모드</Text>
        <View style={styles.advancedToggle}>
          <Text style={styles.advancedLabel}>고급</Text>
          <Switch
            value={useAdvancedMode}
            onValueChange={setUseAdvancedMode}
            trackColor={{ false: HIGColors.systemGray4, true: HIGColors.systemBlue }}
          />
        </View>
      </View>

      {/* Section Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.sectionNav}
        contentContainerStyle={styles.sectionNavContent}
      >
        {sections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[
              styles.sectionButton,
              activeSection === section.id && styles.activeSectionButton
            ]}
            onPress={() => setActiveSection(section.id)}
          >
            <Text style={styles.sectionIcon}>{section.icon}</Text>
            <Text style={[
              styles.sectionButtonText,
              activeSection === section.id && styles.activeSectionButtonText
            ]}>
              {section.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeSection === 'dripper' && (
          <View style={styles.sectionContent}>
            <EnhancedDripperSelector
              selectedDripper={formData.equipment.dripper}
              onDripperSelect={handleDripperSelect}
              onSizeSelect={handleSizeSelect}
              selectedSize={formData.equipment.dripperSize}
            />
          </View>
        )}

        {activeSection === 'recipe' && (
          <View style={styles.sectionContent}>
            <RecipeTemplateSelector
              selectedDripper={formData.equipment.dripper}
              onRecipeSelect={handleRecipeSelect}
            />
            
            {/* Manual Recipe Adjustment */}
            {useAdvancedMode && (
              <View style={styles.manualRecipeSection}>
                <Text style={styles.manualRecipeTitle}>수동 조정</Text>
                <View style={styles.recipeInputGrid}>
                  <View style={styles.recipeInputItem}>
                    <Text style={styles.inputLabel}>원두량 (g)</Text>
                    <Text style={styles.inputValue}>{formData.recipe.doseIn}</Text>
                  </View>
                  <View style={styles.recipeInputItem}>
                    <Text style={styles.inputLabel}>물량 (g)</Text>
                    <Text style={styles.inputValue}>{formData.recipe.waterAmount}</Text>
                  </View>
                  <View style={styles.recipeInputItem}>
                    <Text style={styles.inputLabel}>비율</Text>
                    <Text style={styles.inputValue}>{formData.recipe.ratio}</Text>
                  </View>
                  <View style={styles.recipeInputItem}>
                    <Text style={styles.inputLabel}>물온도</Text>
                    <Text style={styles.inputValue}>{formData.recipe.waterTemp}°C</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {activeSection === 'grind' && (
          <View style={styles.sectionContent}>
            <GrindSizeGuide
              selectedDripper={formData.equipment.dripper}
              onGrindSizeSelect={handleGrindSizeSelect}
            />
          </View>
        )}

        {activeSection === 'technique' && (
          <View style={styles.sectionContent}>
            <PourPatternGuide
              selectedDripper={formData.equipment.dripper}
              selectedPattern={formData.recipe.pourTechnique}
              onPatternSelect={handlePatternSelect}
            />
          </View>
        )}

        {activeSection === 'timer' && selectedRecipe && (
          <View style={styles.sectionContent}>
            <InteractiveBrewTimer
              steps={selectedRecipe.recipe.steps}
              totalBrewTime={selectedRecipe.recipe.totalBrewTime}
              onTimerComplete={handleTimerComplete}
            />
          </View>
        )}

        {activeSection === 'timer' && !selectedRecipe && (
          <View style={styles.emptyTimerSection}>
            <Text style={styles.emptyTimerTitle}>⏱️ 타이머 사용 불가</Text>
            <Text style={styles.emptyTimerText}>
              레시피를 먼저 선택해주세요.{'\n'}
              선택한 레시피의 단계별 가이드와 함께{'\n'}
              인터랙티브 타이머를 사용할 수 있습니다.
            </Text>
            <TouchableOpacity
              style={styles.selectRecipeButton}
              onPress={() => setActiveSection('recipe')}
            >
              <Text style={styles.selectRecipeButtonText}>레시피 선택하러 가기</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>현재 설정</Text>
          <Text style={styles.summaryText}>
            {formData.equipment.dripper} • {formData.recipe.ratio} • {formData.recipe.pourTechnique}
          </Text>
          {selectedRecipe && (
            <Text style={styles.recipeNameText}>
              📋 {selectedRecipe.korean}
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>다음 단계</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemGray6,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    backgroundColor: HIGColors.white,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray5,
  },
  backButton: {
    padding: HIGConstants.SPACING_SM,
  },
  backArrow: {
    fontSize: HIGConstants.FONT_SIZE_H2,
    color: HIGColors.systemBlue,
  },
  headerTitle: {
    flex: 1,
    fontSize: HIGConstants.FONT_SIZE_TITLE,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  advancedLabel: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    marginRight: HIGConstants.SPACING_XS,
  },
  
  // Section Navigation
  sectionNav: {
    backgroundColor: HIGColors.white,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray5,
  },
  sectionNavContent: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
  },
  sectionButton: {
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_SM,
    paddingHorizontal: HIGConstants.SPACING_MD,
    marginRight: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.cornerRadiusSmall,
    backgroundColor: HIGColors.systemGray6,
  },
  activeSectionButton: {
    backgroundColor: HIGColors.systemBlue,
  },
  sectionIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  sectionButtonText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    fontWeight: '500',
  },
  activeSectionButtonText: {
    color: HIGColors.white,
  },
  
  // Content
  content: {
    flex: 1,
  },
  sectionContent: {
    backgroundColor: HIGColors.white,
    marginVertical: HIGConstants.SPACING_SM,
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
  },
  
  // Manual Recipe Section
  manualRecipeSection: {
    marginTop: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_LG,
    borderTopWidth: 1,
    borderTopColor: HIGColors.systemGray5,
  },
  manualRecipeTitle: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  recipeInputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recipeInputItem: {
    width: '48%',
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusSmall,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    marginBottom: 4,
  },
  inputValue: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
  },
  
  // Empty Timer Section
  emptyTimerSection: {
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_XL,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  emptyTimerTitle: {
    fontSize: HIGConstants.FONT_SIZE_H2,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  emptyTimerText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: HIGConstants.SPACING_LG,
  },
  selectRecipeButton: {
    backgroundColor: HIGColors.systemBlue,
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.cornerRadiusMedium,
  },
  selectRecipeButtonText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.white,
    fontWeight: '600',
  },
  
  // Bottom Actions
  bottomActions: {
    backgroundColor: HIGColors.white,
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    borderTopWidth: 1,
    borderTopColor: HIGColors.systemGray5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summarySection: {
    flex: 1,
    marginRight: HIGConstants.SPACING_MD,
  },
  summaryTitle: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    marginBottom: 2,
  },
  summaryText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    fontWeight: '500',
  },
  recipeNameText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.systemBlue,
    marginTop: 2,
  },
  nextButton: {
    backgroundColor: HIGColors.systemBlue,
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.cornerRadiusMedium,
  },
  nextButtonText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.white,
    fontWeight: '600',
  },
});

export default EnhancedHomeCafeScreen;