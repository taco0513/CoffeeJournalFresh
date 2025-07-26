// StatsScreenHeader.tsx
// Header section component for StatsScreen

import React from 'react';
import {
  HeaderSection,
  HeaderTitle,
  HeaderSubtitle,
} from './StatsScreenStyledComponents';

export const StatsScreenHeader: React.FC = () => {
  return (
    <HeaderSection
      animation="lazy"
      enterStyle={{
        opacity: 0,
        y: -30,
    }}
      animateOnly={['opacity', 'transform']}
    >
      <HeaderTitle>나의 커피 통계</HeaderTitle>
      <HeaderSubtitle>커피 여정을 한눈에</HeaderSubtitle>
    </HeaderSection>
  );
};