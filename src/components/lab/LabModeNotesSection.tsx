// LabModeNotesSection.tsx
// Experiment notes section component for LabModeForm

import React from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
} from 'react-native';
import { HIGColors } from '../../styles/common';
import { labModeFormStyles } from './LabModeFormStyles';

interface NotesData {
  channeling?: boolean;
  mudBed?: boolean;
  grindAdjustment?: string;
  tasteResult?: string;
  nextExperiment?: string;
}

interface LabModeNotesSectionProps {
  notesData: NotesData;
  onUpdateField: (path: string, value: unknown) => void;
}

export const LabModeNotesSection: React.FC<LabModeNotesSectionProps> = ({
  notesData,
  onUpdateField,
}) => {
  return (
    <View style={labModeFormStyles.section}>
      <Text style={labModeFormStyles.sectionTitle}>실험 노트</Text>
      
      <View style={styles.notesSection}>
        <View style={labModeFormStyles.switchRow}>
          <Text style={labModeFormStyles.switchLabel}>채널링</Text>
          <Switch
            value={notesData.channeling || false}
            onValueChange={(value) => onUpdateField('notes.channeling', value)}
            trackColor={{ false: HIGColors.systemGray5, true: HIGColors.systemRed }}
          />
        </View>
        
        <View style={labModeFormStyles.switchRow}>
          <Text style={labModeFormStyles.switchLabel}>머드베드</Text>
          <Switch
            value={notesData.mudBed || false}
            onValueChange={(value) => onUpdateField('notes.mudBed', value)}
            trackColor={{ false: HIGColors.systemGray5, true: HIGColors.systemRed }}
          />
        </View>

        <TextInput
          style={labModeFormStyles.textInput}
          value={notesData.grindAdjustment || ''}
          onChangeText={(text) => onUpdateField('notes.grindAdjustment', text)}
          placeholder="그라인딩 조절 (예: 1클릭 더 굵게)"
          placeholderTextColor={HIGColors.tertiaryLabel}
        />

        <TextInput
          style={[labModeFormStyles.textInput, labModeFormStyles.notesTextArea]}
          value={notesData.tasteResult || ''}
          onChangeText={(text) => onUpdateField('notes.tasteResult', text)}
          placeholder="맛 결과 (예: 밸런스 좋음, 단맛 증가)"
          placeholderTextColor={HIGColors.tertiaryLabel}
          multiline
        />

        <TextInput
          style={[labModeFormStyles.textInput, labModeFormStyles.notesTextArea]}
          value={notesData.nextExperiment || ''}
          onChangeText={(text) => onUpdateField('notes.nextExperiment', text)}
          placeholder="다음 실험 계획"
          placeholderTextColor={HIGColors.tertiaryLabel}
          multiline
        />
      </View>
    </View>
  );
};

// Styles specific to notes section
const styles = {
  notesSection: {
    gap: 16,
},
};