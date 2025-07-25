import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { HIGColors, HIGConstants } from '../../styles/common';
import HomeCafeEnhancedService, { RecipeTemplate } from '../../services/HomeCafeEnhancedService';

interface RecipeTemplateSelectorProps {
  selectedDripper: string;
  onRecipeSelect: (recipe: RecipeTemplate) => void;
  selectedTemplate?: RecipeTemplate | null;
  onTemplateSelect?: (template: RecipeTemplate) => void;
  dripper?: string;
}

const { width } = Dimensions.get('window');

export const RecipeTemplateSelector: React.FC<RecipeTemplateSelectorProps> = ({
  selectedDripper,
  onRecipeSelect,
  selectedTemplate,
  onTemplateSelect,
  dripper,
}) => {
  const { t } = useTranslation();
  const [showRecipeDetail, setShowRecipeDetail] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeTemplate | null>(null);
  const enhancedService = HomeCafeEnhancedService.getInstance();
  
  // Filter recipes by selected dripper
  const availableRecipes = enhancedService.getRecipeTemplates()
    .filter(recipe => recipe.dripper === selectedDripper);

  const handleRecipePress = (recipe: RecipeTemplate) => {
    setSelectedRecipe(recipe);
    setShowRecipeDetail(true);
  };

  const handleUseRecipe = () => {
    if (selectedRecipe) {
      onRecipeSelect(selectedRecipe);
      setShowRecipeDetail(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return HIGColors.systemGreen;
      case 'intermediate':
        return HIGColors.systemOrange;
      case 'advanced':
        return HIGColors.systemRed;
      default:
        return HIGColors.systemGray;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '초보자';
      case 'intermediate':
        return '중급자';
      case 'advanced':
        return '고급자';
      default:
        return difficulty;
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (availableRecipes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {selectedDripper}에 맞는 레시피 템플릿을 준비 중입니다
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>프로 레시피 템플릿</Text>
      <Text style={styles.sectionSubtitle}>
        세계 챔피언과 전문가들의 검증된 레시피
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {availableRecipes.map((recipe) => (
          <TouchableOpacity
            key={recipe.id}
            style={styles.recipeCard}
            onPress={() => handleRecipePress(recipe)}
          >
            {recipe.championship && (
              <View style={styles.championBadge}>
                <Text style={styles.championText}>🏆 {recipe.championship}</Text>
              </View>
            )}
            
            <Text style={styles.recipeName}>{recipe.korean}</Text>
            <Text style={styles.recipeAuthor}>by {recipe.author}</Text>
            
            <View style={styles.recipeSpecs}>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>비율</Text>
                <Text style={styles.specValue}>{recipe.recipe.ratio}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>시간</Text>
                <Text style={styles.specValue}>
                  {formatTime(recipe.recipe.totalBrewTime)}
                </Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>온도</Text>
                <Text style={styles.specValue}>{recipe.recipe.waterTemp}°C</Text>
              </View>
            </View>
            
            <View style={styles.difficultyBadge}>
              <View style={[
                styles.difficultyDot,
                { backgroundColor: getDifficultyColor(recipe.difficulty) }
              ]} />
              <Text style={styles.difficultyText}>
                {getDifficultyText(recipe.difficulty)}
              </Text>
            </View>
            
            <View style={styles.tagContainer}>
              {recipe.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recipe Detail Modal */}
      <Modal
        visible={showRecipeDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRecipeDetail(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowRecipeDetail(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedRecipe?.korean}
            </Text>
            <TouchableOpacity 
              style={styles.useButton}
              onPress={handleUseRecipe}
            >
              <Text style={styles.useButtonText}>사용</Text>
            </TouchableOpacity>
          </View>

          {selectedRecipe && (
            <ScrollView style={styles.modalContent}>
              {/* Recipe Header */}
              <View style={styles.recipeHeader}>
                {selectedRecipe.championship && (
                  <View style={styles.championshipBadge}>
                    <Text style={styles.championshipText}>
                      🏆 {selectedRecipe.championship} {selectedRecipe.year}
                    </Text>
                  </View>
                )}
                <Text style={styles.modalRecipeName}>{selectedRecipe.korean}</Text>
                <Text style={styles.modalRecipeAuthor}>by {selectedRecipe.author}</Text>
                <Text style={styles.recipeDescription}>{selectedRecipe.description}</Text>
              </View>

              {/* Recipe Overview */}
              <View style={styles.overviewSection}>
                <Text style={styles.sectionHeader}>레시피 개요</Text>
                <View style={styles.overviewGrid}>
                  <View style={styles.overviewItem}>
                    <Text style={styles.overviewLabel}>원두량</Text>
                    <Text style={styles.overviewValue}>{selectedRecipe.recipe.doseIn}g</Text>
                  </View>
                  <View style={styles.overviewItem}>
                    <Text style={styles.overviewLabel}>물량</Text>
                    <Text style={styles.overviewValue}>{selectedRecipe.recipe.waterAmount}g</Text>
                  </View>
                  <View style={styles.overviewItem}>
                    <Text style={styles.overviewLabel}>비율</Text>
                    <Text style={styles.overviewValue}>{selectedRecipe.recipe.ratio}</Text>
                  </View>
                  <View style={styles.overviewItem}>
                    <Text style={styles.overviewLabel}>물온도</Text>
                    <Text style={styles.overviewValue}>{selectedRecipe.recipe.waterTemp}°C</Text>
                  </View>
                  <View style={styles.overviewItem}>
                    <Text style={styles.overviewLabel}>분쇄도</Text>
                    <Text style={styles.overviewValue}>{selectedRecipe.recipe.grindSize}</Text>
                  </View>
                  <View style={styles.overviewItem}>
                    <Text style={styles.overviewLabel}>총 시간</Text>
                    <Text style={styles.overviewValue}>
                      {formatTime(selectedRecipe.recipe.totalBrewTime)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Brewing Steps */}
              <View style={styles.stepsSection}>
                <Text style={styles.sectionHeader}>추출 단계</Text>
                {selectedRecipe.recipe.steps.map((step, index) => (
                  <View key={index} style={styles.stepCard}>
                    <View style={styles.stepHeader}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{step.stepNumber}</Text>
                      </View>
                      <View style={styles.stepInfo}>
                        <Text style={styles.stepTime}>
                          {formatTime(step.time)}
                        </Text>
                        {step.waterAmount && (
                          <Text style={styles.stepWater}>+{step.waterAmount}g</Text>
                        )}
                      </View>
                    </View>
                    <Text style={styles.stepDescription}>{step.korean}</Text>
                    {step.pourPattern && (
                      <View style={styles.stepTechnique}>
                        <Text style={styles.stepTechniqueText}>
                          기법: {step.pourPattern}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>

              {/* Pro Tips */}
              <View style={styles.notesSection}>
                <Text style={styles.sectionHeader}>프로 팁</Text>
                {selectedRecipe.notes.map((note, index) => (
                  <View key={index} style={styles.noteItem}>
                    <Text style={styles.bullet}>💡</Text>
                    <Text style={styles.noteText}>{note}</Text>
                  </View>
                ))}
              </View>

              {/* Tags */}
              <View style={styles.tagsSection}>
                <Text style={styles.sectionHeader}>특징</Text>
                <View style={styles.modalTagContainer}>
                  {selectedRecipe.tags.map((tag, index) => (
                    <View key={index} style={styles.modalTag}>
                      <Text style={styles.modalTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: HIGConstants.SPACING_MD,
  },
  sectionTitle: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  scrollContainer: {
    paddingHorizontal: HIGConstants.SPACING_SM,
  },
  emptyContainer: {
    padding: HIGConstants.SPACING_LG,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
  },
  
  // Recipe Cards
  recipeCard: {
    width: 240,
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    marginRight: HIGConstants.SPACING_MD,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  championBadge: {
    backgroundColor: HIGColors.systemYellow,
    paddingHorizontal: HIGConstants.SPACING_XS,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: HIGConstants.SPACING_XS,
  },
  championText: {
    fontSize: HIGConstants.FONT_SIZE_FOOTNOTE,
    color: HIGColors.black,
    fontWeight: '600',
  },
  recipeName: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 2,
  },
  recipeAuthor: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  recipeSpecs: {
    marginBottom: HIGConstants.SPACING_SM,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  specLabel: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
  },
  specValue: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.label,
    fontWeight: '500',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  difficultyText: {
    fontSize: HIGConstants.FONT_SIZE_FOOTNOTE,
    color: HIGColors.secondaryLabel,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: HIGColors.systemGray6,
    paddingHorizontal: HIGConstants.SPACING_XS,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  tagText: {
    fontSize: HIGConstants.FONT_SIZE_FOOTNOTE,
    color: HIGColors.secondaryLabel,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: HIGColors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray5,
  },
  closeButton: {
    padding: HIGConstants.SPACING_SM,
  },
  closeButtonText: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    color: HIGColors.systemGray,
  },
  modalTitle: {
    flex: 1,
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
  },
  useButton: {
    backgroundColor: HIGColors.systemBlue,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.cornerRadiusSmall,
  },
  useButtonText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.white,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  
  // Recipe Header
  recipeHeader: {
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_LG,
  },
  championshipBadge: {
    backgroundColor: HIGColors.systemYellow,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
    borderRadius: HIGConstants.cornerRadiusSmall,
    marginBottom: HIGConstants.SPACING_SM,
  },
  championshipText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.black,
    fontWeight: '600',
  },
  modalRecipeName: {
    fontSize: HIGConstants.FONT_SIZE_H1,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalRecipeAuthor: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  recipeDescription: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Overview Section
  overviewSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  sectionHeader: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  overviewGrid: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  overviewItem: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  overviewLabel: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    marginBottom: 2,
  },
  overviewValue: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
  },
  
  // Steps Section
  stepsSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  stepCard: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusSmall,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_XS,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: HIGColors.systemBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: HIGConstants.SPACING_SM,
  },
  stepNumberText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.white,
    fontWeight: '600',
  },
  stepInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTime: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
  },
  stepWater: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.systemBlue,
    fontWeight: '500',
  },
  stepDescription: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    lineHeight: 20,
  },
  stepTechnique: {
    marginTop: HIGConstants.SPACING_XS,
    paddingTop: HIGConstants.SPACING_XS,
    borderTopWidth: 1,
    borderTopColor: HIGColors.systemGray5,
  },
  stepTechniqueText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    fontStyle: 'italic',
  },
  
  // Notes Section
  notesSection: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: HIGConstants.SPACING_SM,
  },
  bullet: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    marginRight: HIGConstants.SPACING_SM,
    lineHeight: 22,
  },
  noteText: {
    flex: 1,
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    lineHeight: 22,
  },
  
  // Tags Section
  tagsSection: {
    marginBottom: HIGConstants.SPACING_XL,
  },
  modalTagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalTag: {
    backgroundColor: HIGColors.systemBlue,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
    borderRadius: HIGConstants.cornerRadiusSmall,
    marginRight: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_XS,
  },
  modalTagText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.white,
    fontWeight: '500',
  },
});

export default RecipeTemplateSelector;