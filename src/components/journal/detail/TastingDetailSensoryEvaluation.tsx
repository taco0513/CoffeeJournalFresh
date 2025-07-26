// TastingDetailSensoryEvaluation.tsx
// Sensory evaluation section component

import React from 'react';
import { YStack, Separator } from 'tamagui';
import {
  InfoCard,
  SectionTitle,
  InfoRow,
  InfoLabel,
  InfoValue,
} from './TastingDetailStyledComponents';

interface SensoryAttribute {
  body?: number;
  acidity?: number;
  sweetness?: number;
  finish?: number;
  bitterness?: number;
  balance?: number;
  mouthfeel?: string;
}

interface TastingDetailSensoryEvaluationProps {
  sensoryAttribute: SensoryAttribute;
}

export const TastingDetailSensoryEvaluation: React.FC<TastingDetailSensoryEvaluationProps> = ({
  sensoryAttribute,
}) => {
  const getSensoryDescription = (type: string, value: number): string => {
    const descriptions = {
      body: ['Very Light', 'Light', 'Medium-Light', 'Medium', 'Medium-Full', 'Full', 'Very Full'],
      acidity: ['Very Low', 'Low', 'Medium-Low', 'Medium', 'Medium-High', 'High', 'Very High'],
      sweetness: ['None', 'Subtle', 'Mild', 'Moderate', 'High', 'Very High', 'Intense'],
      finish: ['Very Short', 'Short', 'Medium-Short', 'Medium', 'Medium-Long', 'Long', 'Very Long'],
  };
    
    const desc = (descriptions as unknown)[type];
    if (!desc) return value.toString();
    
    const index = Math.min(Math.max(Math.round(value) - 1, 0), desc.length - 1);
    return desc[index];
};

  const getMouthfeelKorean = (mouthfeel: string): string => {
    const translations: { [key: string]: string } = {
      'Smooth': '부드러운',
      'Creamy': '크리미한',
      'Silky': '실크 같은',
      'Round': '둥근',
      'Full': '풍부한',
      'Clean': '깔끔한',
      'Crisp': '상쾌한',
      'Bright': '밝은',
      'Juicy': '과즙 같은',
      'Thin': '얇은',
      'Watery': '물 같은',
      'Astringent': '떫은',
      'Harsh': '거친',
      'Coarse': '거칠거칠한',
  };
    
    return translations[mouthfeel] || mouthfeel;
};

  const renderSensoryRow = (label: string, type: string, value?: number, showSeparator: boolean = true) => {
    if (value === undefined) return null;
    
    return (
      <>
        <InfoRow>
          <InfoLabel>{label}</InfoLabel>
          <InfoValue>{getSensoryDescription(type, value)}</InfoValue>
        </InfoRow>
        {showSeparator && <Separator />}
      </>
    );
};

  if (!sensoryAttribute) {
    return null;
}

  return (
    <InfoCard>
      <SectionTitle>감각 평가</SectionTitle>
      <YStack space="$3">
        {renderSensoryRow('바디', 'body', sensoryAttribute.body)}
        {renderSensoryRow('산미', 'acidity', sensoryAttribute.acidity)}
        {renderSensoryRow('단맛', 'sweetness', sensoryAttribute.sweetness)}
        {renderSensoryRow('여운', 'finish', sensoryAttribute.finish)}
        
        {sensoryAttribute.mouthfeel && (
          <InfoRow>
            <InfoLabel>마우스필</InfoLabel>
            <InfoValue>{getMouthfeelKorean(sensoryAttribute.mouthfeel)}</InfoValue>
          </InfoRow>
        )}
      </YStack>
    </InfoCard>
  );
};