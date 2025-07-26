// TastingDetailFlavorPaths.tsx
// Flavor paths section component

import React from 'react';
import { XStack } from 'tamagui';
import { flavorWheelKorean } from '../../../data/flavorWheelKorean';
import {
  InfoCard,
  SectionTitle,
  FlavorChip,
  ChipText,
} from './TastingDetailStyledComponents';

interface FlavorPath {
  level1?: string;
  level2?: string;
  level3?: string;
  level4?: string;
}

interface TastingDetailFlavorPathsProps {
  flavorPaths: FlavorPath[];
}

export const TastingDetailFlavorPaths: React.FC<TastingDetailFlavorPathsProps> = ({
  flavorPaths,
}) => {
  const getKoreanName = (englishName: string): string => {
    return (flavorWheelKorean.translations as unknown)[englishName] || englishName;
};

  const renderFlavorPath = (path: FlavorPath, index: number) => {
    const parts = [];
    if (path.level1) parts.push(getKoreanName(path.level1));
    if (path.level2) parts.push(getKoreanName(path.level2));
    if (path.level3) parts.push(path.level3);
    if (path.level4) parts.push(path.level4);
    
    const displayText = parts.join(' > ');
    const level = parts.length;

    return (
      <FlavorChip 
        key={`flavor-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`}
        level={level as 1 | 2 | 3}
      >
        <ChipText level={level as 1 | 2 | 3}>
          {displayText}
        </ChipText>
      </FlavorChip>
    );
};

  if (!flavorPaths || flavorPaths.length === 0) {
    return null;
}

  return (
    <InfoCard>
      <SectionTitle>내가 느낀 향미</SectionTitle>
      <XStack flexWrap="wrap" gap="$2">
        {flavorPaths.map((path, index) => renderFlavorPath(path, index))}
      </XStack>
    </InfoCard>
  );
};