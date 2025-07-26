// LabModeAnalysisSection.tsx
// Advanced analysis section component for LabModeForm

import React from 'react';
import {
  View,
  Text,
  TextInput,
} from 'react-native';
import { HIGColors } from '../../styles/common';
import { labModeFormStyles } from './LabModeFormStyles';

interface AnalysisData {
  tds?: number;
  extractionYield?: number;
}

interface LabModeAnalysisSectionProps {
  analysisData: AnalysisData;
  onUpdateField: (path: string, value: unknown) => void;
}

export const LabModeAnalysisSection: React.FC<LabModeAnalysisSectionProps> = ({
  analysisData,
  onUpdateField,
}) => {
  return (
    <View style={labModeFormStyles.section}>
      <Text style={labModeFormStyles.sectionTitle}>고급 분석</Text>
      
      <View style={styles.analysisGrid}>
        <View style={styles.analysisItem}>
          <Text style={styles.analysisLabel}>TDS (%)</Text>
          <TextInput
            style={styles.analysisInput}
            value={analysisData.tds?.toString() || ''}
            onChangeText={(text) => onUpdateField('tds', parseFloat(text) || undefined)}
            keyboardType="decimal-pad"
            placeholder="1.35"
            placeholderTextColor={HIGColors.tertiaryLabel}
          />
        </View>
        <View style={styles.analysisItem}>
          <Text style={styles.analysisLabel}>추출 수율 (%)</Text>
          <TextInput
            style={styles.analysisInput}
            value={analysisData.extractionYield?.toString() || ''}
            onChangeText={(text) => onUpdateField('extractionYield', parseFloat(text) || undefined)}
            keyboardType="decimal-pad"
            placeholder="20.5"
            placeholderTextColor={HIGColors.tertiaryLabel}
          />
        </View>
      </View>
    </View>
  );
};

// Styles specific to analysis section
const styles = {
  analysisGrid: {
    flexDirection: 'row' as const,
    gap: 16,
},
  analysisItem: {
    flex: 1,
},
  analysisLabel: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    marginBottom: 12,
    fontWeight: '600' as const,
},
  analysisInput: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    fontWeight: '700' as const,
    color: HIGColors.label,
    textAlign: 'center' as const,
},
};