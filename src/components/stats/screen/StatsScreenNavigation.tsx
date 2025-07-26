// StatsScreenNavigation.tsx
// Navigation header component for StatsScreen

import React from 'react';
import { View } from 'tamagui';
import {
  NavigationBar,
  TitleContainer,
  NavigationTitle,
  BetaBadge,
  BetaText,
} from './StatsScreenStyledComponents';

interface StatsScreenNavigationProps {
  hideNavBar?: boolean;
}

export const StatsScreenNavigation: React.FC<StatsScreenNavigationProps> = ({
  hideNavBar = false,
}) => {
  if (hideNavBar) {
    return null;
}

  return (
    <NavigationBar>
      <TitleContainer>
        <NavigationTitle>통계</NavigationTitle>
        <BetaBadge>
          <BetaText>BETA</BetaText>
        </BetaBadge>
      </TitleContainer>
      <View width={80} />
    </NavigationBar>
  );
};