// Type definitions for sensory evaluation

export type MouthfeelType = 'Clean' | 'Creamy' | 'Juicy' | 'Silky';

export interface SensoryData {
  body: number;
  acidity: number;
  sweetness: number;
  finish: number;
  bitterness: number;
  balance: number;
  mouthfeel: MouthfeelType;
}

export interface SliderSectionProps {
  title: string;
  value: number;
  onValueChange: (value: number) => void;
  leftLabel: string;
  rightLabel: string;
  description?: string;
}

export interface MouthfeelButtonProps {
  option: MouthfeelType;
  isSelected: boolean;
  onPress: () => void;
}

export interface SensoryScreenMode {
  showEnhanced: boolean;
  showOnboarding: boolean;
}

// Re-export types from other files for convenience
export type { SelectedSensoryExpression } from './tasting';