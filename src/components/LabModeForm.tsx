import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useTastingStore } from '../stores/tastingStore';
import { LabModeData } from '../types/tasting';

// Modular Components
import { Logger } from '../services/LoggingService';
import {
  labModeFormStyles,
  LabModeEquipmentSection,
  LabModeRecipeSection,
  LabModeAnalysisSection,
  LabModeNotesSection,
} from './lab';

export const LabModeForm = () => {
  const { currentTasting, updateLabModeData } = useTastingStore();
  
  const [formData, setFormData] = useState<LabModeData>({
    equipment: {
      dripper: 'V60',
      filter: 'bleached',
  },
    recipe: {
      doseIn: 0,
      waterAmount: 0,
      ratio: '1:15',
      waterTemp: 93,
      bloomWater: 0,
      bloomTime: 30,
      pourTechnique: 'center',
      numberOfPours: 3,
      totalBrewTime: 0,
  },
    notes: {},
});

  useEffect(() => {
    if (currentTasting.labModeData) {
      setFormData(currentTasting.labModeData);
  }
}, [currentTasting.labModeData]);

  const updateField = (path: string, value: unknown) => {
    const keys = path.split('.');
    const updatedFormData = { ...formData };
    let current: unknown = updatedFormData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
  }
    
    current[keys[keys.length - 1]] = value;
    
    // Calculate ratio if dose or water changed
    if (path === 'recipe.doseIn' || path === 'recipe.waterAmount') {
      if (updatedFormData.recipe.doseIn > 0) {
        const ratio = updatedFormData.recipe.waterAmount / updatedFormData.recipe.doseIn;
        updatedFormData.recipe.ratio = `1:${ratio.toFixed(1)}`;
    }
  }
    
    setFormData(updatedFormData);
    updateLabModeData(updatedFormData);
};


  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={labModeFormStyles.container}
    >
      <ScrollView style={labModeFormStyles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Equipment Section */}
        <LabModeEquipmentSection
          equipmentData={formData.equipment}
          onUpdateField={updateField}
        />

        {/* Recipe Section */}
        <LabModeRecipeSection
          recipeData={formData.recipe}
          onUpdateField={updateField}
        />

        {/* Advanced Analysis */}
        <LabModeAnalysisSection
          analysisData={{ tds: formData.tds, extractionYield: formData.extractionYield }}
          onUpdateField={updateField}
        />

        {/* Experiment Notes */}
        <LabModeNotesSection
          notesData={formData.notes || {}}
          onUpdateField={updateField}
        />

        {/* Save Button */}
        <TouchableOpacity 
          style={labModeFormStyles.saveButton}
          onPress={() => {
            // Handle save logic here
            Logger.debug('Lab mode data:', 'component', { component: 'LabModeForm', data: formData });
        }}
        >
          <Text style={labModeFormStyles.saveButtonText}>저장</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

