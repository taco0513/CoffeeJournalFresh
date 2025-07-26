// StatsScreenModeStats.tsx
// Mode statistics section (Cafe vs HomeCafe)

import React from 'react';
import {
  Section,
  SectionTitle,
  ModeStatsContainer,
  ModeStatCard,
  ModeIcon,
  ModeNumber,
  ModeLabel,
  ModePercentageContainer,
  ModePercentageBar,
  ModePercentageFill,
  ModePercentageText,
} from './StatsScreenStyledComponents';

interface Statistics {
  totalTastings: number;
  averageScore: number;
  firstTastingDays: number;
  cafeCount?: number;
  homeCafeCount?: number;
}

interface StatsScreenModeStatsProps {
  stats: Statistics;
}

export const StatsScreenModeStats: React.FC<StatsScreenModeStatsProps> = ({
  stats,
}) => {
  const cafePercentage = stats.totalTastings > 0 ? ((stats.cafeCount || 0) / stats.totalTastings) * 100 : 0;
  const homeCafePercentage = stats.totalTastings > 0 ? ((stats.homeCafeCount || 0) / stats.totalTastings) * 100 : 0;

  return (
    <Section
      animation="lazy"
      enterStyle={{
        opacity: 0,
        y: 30,
    }}
      animateOnly={['opacity', 'transform']}
    >
      <SectionTitle>테이스팅 장소</SectionTitle>
      <ModeStatsContainer>
        <ModeStatCard>
          {/* <ModeIcon>🏪</ModeIcon> */}
          <ModeNumber>{stats.cafeCount || 0}</ModeNumber>
          <ModeLabel>카페에서</ModeLabel>
        </ModeStatCard>
        
        {/* Vertical Separator */}
        <YStack 
          width={1} 
          backgroundColor="$gray5" 
          marginVertical="$sm"
        />
        
        <ModeStatCard>
          {/* <ModeIcon>☕</ModeIcon> */}
          <ModeNumber>{stats.homeCafeCount || 0}</ModeNumber>
          <ModeLabel>홈카페에서</ModeLabel>
        </ModeStatCard>
      </ModeStatsContainer>
      {stats.totalTastings > 0 && (
        <ModePercentageContainer>
          <ModePercentageBar>
            <ModePercentageFill 
              type="cafe"
              width={`${cafePercentage}%`}
            />
            <ModePercentageFill 
              type="homecafe"
              width={`${homeCafePercentage}%`}
            />
          </ModePercentageBar>
          <ModePercentageText>
            카페 {Math.round(cafePercentage)}% · 홈카페 {Math.round(homeCafePercentage)}%
          </ModePercentageText>
        </ModePercentageContainer>
      )}
    </Section>
  );
};