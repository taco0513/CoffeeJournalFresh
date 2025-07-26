import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { HIGConstants } from '../../styles/common';
import { HIGColors } from '../../constants/HIG';
import { HomeCafeData, PouroverDripper } from '../../types/tasting';
import { recipePresets, calculateWaterAmount, getDefaultBloomWater } from '../../data/homeCafeData';

interface RecipePresetsProps {
  selectedDripper: PouroverDripper;
  onApplyPreset: (presetData: Partial<HomeCafeData>) => void;
}

export const RecipePresets: React.FC<RecipePresetsProps> = ({
  selectedDripper,
  onApplyPreset,
}) => {
  const availablePresets = recipePresets[selectedDripper as keyof typeof recipePresets] || {};

  if (Object.keys(availablePresets).length === 0) {
    return null;
}

  const applyPreset = (presetKey: string) => {
    const preset = availablePresets[presetKey as keyof typeof availablePresets] as unknown;
    if (!preset) return;

    // Calculate water amount based on ratio
    const doseIn = 15; // Default dose
    const ratio = parseFloat(preset.ratio.split(':')[1]);
    const waterAmount = Math.round(doseIn * ratio);
    const bloomWater = getDefaultBloomWater(doseIn);

    const presetData: Partial<HomeCafeData> = {
      recipe: {
        doseIn,
        waterAmount,
        ratio: preset.ratio,
        waterTemp: preset.waterTemp,
        grindSize: preset.grindSize,
        bloomTime: preset.bloomTime,
        bloomWater,
        totalBrewTime: preset.totalTime,
        pourTechnique: preset.technique as unknown,
        numberOfPours: 3, // Default number of pours
        bloomAgitation: false,
        pourIntervals: [30, 60, 90], // Default pour intervals
        drawdownTime: 30, // Default drawdown time
        agitation: 'none', // Default agitation
        agitationTiming: '',
    },
  };

    onApplyPreset(presetData);
};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}></Text>
        <Text style={styles.headerTitle}>추천 레시피</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.presetContainer}
      >
        {Object.entries(availablePresets).map(([key, preset]: [string, any]) => (
          <TouchableOpacity
            key={key}
            style={styles.presetCard}
            onPress={() => applyPreset(key)}
          >
            <Text style={styles.presetName}>{preset.name}</Text>
            <Text style={styles.presetDescription}>{preset.description}</Text>
            
            <View style={styles.presetDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>비율</Text>
                <Text style={styles.detailValue}>{preset.ratio}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>온도</Text>
                <Text style={styles.detailValue}>{preset.waterTemp}°C</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>시간</Text>
                <Text style={styles.detailValue}>{Math.floor(preset.totalTime / 60)}:{(preset.totalTime % 60).toString().padStart(2, '0')}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>분쇄도</Text>
                <Text style={styles.detailValue}>{preset.grindSize}</Text>
              </View>
            </View>
            
            <View style={styles.applyButton}>
              <Text style={styles.applyButtonText}>적용</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: HIGConstants.SPACING_XL,
},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_LG,
},
  headerIcon: {
    fontSize: 20,
    marginRight: HIGConstants.SPACING_SM,
},
  headerTitle: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
},
  presetContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    gap: HIGConstants.SPACING_MD,
},
  presetCard: {
    width: 200,
    backgroundColor: HIGColors.systemBackground,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
    shadowColor: HIGColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
},
  presetName: {
    fontSize: HIGConstants.FONT_SIZE_TITLE,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 4,
},
  presetDescription: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_MD,
    lineHeight: 16,
},
  presetDetails: {
    marginBottom: HIGConstants.SPACING_MD,
},
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
},
  detailLabel: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
},
  detailValue: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    fontWeight: '600',
    color: HIGColors.label,
},
  applyButton: {
    backgroundColor: HIGColors.systemBlue,
    borderRadius: HIGConstants.cornerRadiusSmall,
    paddingVertical: HIGConstants.SPACING_SM,
    alignItems: 'center',
},
  applyButtonText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.white,
},
});