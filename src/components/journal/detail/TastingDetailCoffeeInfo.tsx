// TastingDetailCoffeeInfo.tsx
// Coffee information section component

import React from 'react';
import { YStack, Separator } from 'tamagui';
import {
  InfoCard,
  SectionTitle,
  InfoRow,
  InfoLabel,
  InfoValue,
} from './TastingDetailStyledComponents';

interface CoffeeInfoData {
  roastery: string;
  coffeeName: string;
  mode?: 'cafe' | 'home_cafe' | 'lab';
  cafeName?: string;
  origin?: string;
  variety?: string;
  altitude?: string;
  process?: string;
  [key: string]: unknown;
}

interface TastingDetailCoffeeInfoProps {
  coffeeData: CoffeeInfoData;
}

export const TastingDetailCoffeeInfo: React.FC<TastingDetailCoffeeInfoProps> = ({
  coffeeData,
}) => {
  const renderInfoRow = (label: string, value: string, showSeparator: boolean = true) => (
    <>
      <InfoRow>
        <InfoLabel>{label}</InfoLabel>
        <InfoValue>{value}</InfoValue>
      </InfoRow>
      {showSeparator && <Separator />}
    </>
  );

  const getModeDisplayText = (mode?: string) => {
    switch (mode) {
      case 'cafe':
        return ' 카페';
      case 'home_cafe':
        return ' 홈카페';
      case 'lab':
        return ' 랩 모드';
      default:
        return mode;
  }
};

  return (
    <InfoCard>
      <SectionTitle>커피 정보</SectionTitle>
      <YStack space="$3">
        {renderInfoRow('로스터리', coffeeData.roastery)}
        {renderInfoRow('커피명', coffeeData.coffeeName)}
        
        {coffeeData.mode === 'cafe' && coffeeData.cafeName && 
          renderInfoRow('카페', coffeeData.cafeName)
      }
        
        {coffeeData.mode && coffeeData.mode !== 'cafe' && 
          renderInfoRow('추출 방식', getModeDisplayText(coffeeData.mode))
      }
        
        {coffeeData.origin && 
          renderInfoRow('원산지', coffeeData.origin)
      }
        
        {coffeeData.variety && 
          renderInfoRow('품종', coffeeData.variety)
      }
        
        {coffeeData.altitude && 
          renderInfoRow('고도', coffeeData.altitude)
      }
        
        {coffeeData.process && 
          renderInfoRow('가공법', coffeeData.process, false)
      }
      </YStack>
    </InfoCard>
  );
};