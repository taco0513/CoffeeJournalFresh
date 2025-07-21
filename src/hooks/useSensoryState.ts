import { useState, useCallback } from 'react';
import { SensoryData, MouthfeelType } from '../types/sensory';

const DEFAULT_SENSORY_DATA: SensoryData = {
  body: 3,
  acidity: 3,
  sweetness: 3,
  finish: 3,
  bitterness: 3,
  balance: 3,
  mouthfeel: 'Clean',
};

export const useSensoryState = (initialData?: Partial<SensoryData>) => {
  const [sensoryData, setSensoryData] = useState<SensoryData>({
    ...DEFAULT_SENSORY_DATA,
    ...initialData,
  });

  const updateValue = useCallback((key: keyof SensoryData, value: number | MouthfeelType) => {
    setSensoryData(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const updateNumericValue = useCallback((key: keyof Omit<SensoryData, 'mouthfeel'>) => {
    return (value: number) => updateValue(key, value);
  }, [updateValue]);

  const setMouthfeel = useCallback((value: MouthfeelType) => {
    updateValue('mouthfeel', value);
  }, [updateValue]);

  const resetToDefaults = useCallback(() => {
    setSensoryData(DEFAULT_SENSORY_DATA);
  }, []);

  return {
    sensoryData,
    updateValue,
    updateNumericValue,
    setMouthfeel,
    resetToDefaults,
  };
};