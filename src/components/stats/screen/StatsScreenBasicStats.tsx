// StatsScreenBasicStats.tsx
// Basic statistics section component

import React from 'react';
import { YStack } from 'tamagui';
import {
  Section,
  StatsGrid,
  StatCard,
  StatNumber,
  StatLabel,
} from './StatsScreenStyledComponents';

interface Statistics {
  totalTastings: number;
  averageScore: number;
  firstTastingDays: number;
  cafeCount?: number;
  homeCafeCount?: number;
}

interface TopRoaster {
  name: string;
  count: number;
  avgScore: number;
}

interface StatsScreenBasicStatsProps {
  stats: Statistics;
  topRoasters: TopRoaster[];
}

export const StatsScreenBasicStats: React.FC<StatsScreenBasicStatsProps> = ({
  stats,
  topRoasters,
}) => {
  return (
    <Section
      animation="lazy"
      enterStyle={{
        opacity: 0,
        y: 30,
    }}
      animateOnly={['opacity', 'transform']}
    >
      <StatsGrid>
        <StatCard>
          <StatNumber>{stats.totalTastings}</StatNumber>
          <StatLabel>나의 커피 기록</StatLabel>
        </StatCard>
        
        {/* Vertical Separator */}
        <YStack 
          width={1} 
          backgroundColor="$gray5" 
          marginVertical="$sm"
        />
        
        <StatCard>
          <StatNumber>{topRoasters.length}</StatNumber>
          <StatLabel>발견한 로스터리</StatLabel>
        </StatCard>
      </StatsGrid>
    </Section>
  );
};