import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { HIGConstants } from '../styles/common';
import { HIGColors } from '../constants/HIG';
import { useTastingStore } from '../stores/tastingStore';
import { HomeCafeData } from '../types/tasting';
import { defaultHomeCafeData, calculateRatio, calculateWaterAmount } from '../data/homeCafeData';

// Components
import { HomeCafeInputs } from './homecafe/HomeCafeInputs';
import { RecipePresets } from './homecafe/RecipePresets';
import { BrewTimer } from './homecafe/BrewTimer';

interface HomeCafePouroverFormProps {
  onNext?: () => void;
}

export const HomeCafePouroverForm: React.FC<HomeCafePouroverFormProps> = ({ onNext }) => {
  const { currentTasting, updateHomeCafeData } = useTastingStore();
  const [formData, setFormData] = useState<HomeCafeData>(
    currentTasting.homeCafeData || defaultHomeCafeData
  );
  const [showTimer, setShowTimer] = useState(false);

  // Auto-save form data to store
  useEffect(() => {
    updateHomeCafeData(formData);
}, [formData, updateHomeCafeData]);

  // Auto-calculate ratio when dose or water changes
  useEffect(() => {
    if (formData.recipe?.doseIn && formData.recipe?.waterAmount) {
      const newRatio = calculateRatio(formData.recipe.doseIn, formData.recipe.waterAmount);
      if (newRatio !== formData.recipe.ratio) {
        handleUpdateFormData({
          recipe: {
            ...formData.recipe,
            ratio: newRatio,
        },
      });
    }
  }
}, [formData.recipe?.doseIn, formData.recipe?.waterAmount]);

  const handleUpdateFormData = (updates: Partial<HomeCafeData>) => {
    setFormData(prevData => ({
      ...prevData,
      ...updates,
      equipment: {
        ...prevData.equipment,
        ...updates.equipment,
    },
      recipe: {
        ...prevData.recipe,
        ...updates.recipe,
    },
      notes: {
        ...prevData.notes,
        ...updates.notes,
    },
  }));
};

  const handleApplyPreset = (presetData: Partial<HomeCafeData>) => {
    handleUpdateFormData(presetData);
    Alert.alert('레시피 적용됨', '추천 레시피가 적용되었습니다.');
};

  const handleTimerComplete = (lapTimes: unknown[]) => {
    // Store lap times in experiment notes if needed
    if (lapTimes.length > 0) {
      const lapTimesText = lapTimes
        .map(lap => `${lap.name}: ${Math.floor(lap.time / 60)}:${(lap.time % 60).toString().padStart(2, '0')}`)
        .join('\n');
      
      const currentNotes = formData.notes?.tasteResult || '';
      const updatedNotes = currentNotes ? 
        `${currentNotes}\n\n[추출 기록]\n${lapTimesText}` : 
        `[추출 기록]\n${lapTimesText}`;

      handleUpdateFormData({
        notes: {
          ...formData.notes,
          tasteResult: updatedNotes,
      },
    });
  }
    setShowTimer(false);
};

  const validateForm = (): boolean => {
    if (!formData.equipment?.dripper) {
      Alert.alert('필수 입력', '드리퍼를 선택해주세요.');
      return false;
  }

    if (!formData.recipe?.doseIn || formData.recipe.doseIn <= 0) {
      Alert.alert('필수 입력', '원두량을 입력해주세요.');
      return false;
  }

    if (!formData.recipe?.waterAmount || formData.recipe.waterAmount <= 0) {
      Alert.alert('필수 입력', '물 양을 입력해주세요.');
      return false;
  }

    return true;
};

  const handleNext = () => {
    if (validateForm()) {
      onNext?.();
  }
};

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>홈카페 추출 기록</Text>
          <Text style={styles.headerSubtitle}>
            드리퍼와 레시피를 선택하고 추출 과정을 기록해보세요
          </Text>
        </View>

        {/* Recipe Presets */}
        {formData.equipment?.dripper && (
          <RecipePresets
            selectedDripper={formData.equipment.dripper}
            onApplyPreset={handleApplyPreset}
          />
        )}

        {/* Main Form Inputs */}
        <HomeCafeInputs
          formData={formData}
          onUpdateFormData={handleUpdateFormData}
        />

        {/* Timer Section */}
        <View style={styles.timerSection}>
          <TouchableOpacity
            style={styles.timerToggleButton}
            onPress={() => setShowTimer(!showTimer)}
          >
            <Text style={styles.timerToggleIcon}>
              {showTimer ? '⏱️' : '⏱️'}
            </Text>
            <Text style={styles.timerToggleText}>
              {showTimer ? '타이머 숨기기' : '추출 타이머 사용'}
            </Text>
          </TouchableOpacity>

          {showTimer && (
            <BrewTimer
              bloomTime={formData.recipe?.bloomTime || 30}
              totalBrewTime={formData.recipe?.totalBrewTime || 180}
              onTimerComplete={handleTimerComplete}
            />
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>다음 단계</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
},
  scrollView: {
    flex: 1,
},
  header: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_LG,
    paddingBottom: HIGConstants.SPACING_MD,
    backgroundColor: HIGColors.systemBackground,
},
  headerTitle: {
    fontSize: HIGConstants.FONT_SIZE_TITLE,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: 4,
},
  headerSubtitle: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.secondaryLabel,
    lineHeight: 20,
},
  timerSection: {
    marginBottom: HIGConstants.SPACING_XL,
},
  timerToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    marginHorizontal: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_MD,
},
  timerToggleIcon: {
    fontSize: 20,
    marginRight: HIGConstants.SPACING_SM,
},
  timerToggleText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
},
  bottomSpacing: {
    height: 100, // Space for bottom button
},
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: HIGColors.systemBackground,
    borderTopWidth: 1,
    borderTopColor: HIGColors.separator,
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    paddingBottom: HIGConstants.SPACING_LG,
},
  nextButton: {
    backgroundColor: HIGColors.systemBlue,
    borderRadius: HIGConstants.cornerRadiusMedium,
    paddingVertical: HIGConstants.SPACING_MD,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
},
  nextButtonText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.white,
},
});

export default HomeCafePouroverForm;