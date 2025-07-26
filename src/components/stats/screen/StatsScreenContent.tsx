// StatsScreenContent.tsx
// Main content component that combines all stats sections

import React from 'react';
import { AnimatePresence } from 'tamagui';
import { StatsScreenHeader } from './StatsScreenHeader';
import { StatsScreenBasicStats } from './StatsScreenBasicStats';
import { StatsScreenModeStats } from './StatsScreenModeStats';
import { StatsScreenTopItems } from './StatsScreenTopItems';
import { StatsScreenInsights } from './StatsScreenInsights';

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

interface TopCafe {
  name: string;
  count: number;
  location?: string;
}

interface StatsScreenContentProps {
  stats: Statistics;
  topRoasters: TopRoaster[];
  topCafes: TopCafe[];
  insights: unknown[];
}

export const StatsScreenContent: React.FC<StatsScreenContentProps> = ({
  stats,
  topRoasters,
  topCafes,
  insights,
}) => {
  return (
    <AnimatePresence>
      {/* Header */}
      <StatsScreenHeader />

      {/* Basic Statistics */}
      <StatsScreenBasicStats 
        stats={stats}
        topRoasters={topRoasters}
      />

      {/* Mode Statistics */}
      <StatsScreenModeStats stats={stats} />

      {/* Top Items */}
      <StatsScreenTopItems 
        topRoasters={topRoasters}
        topCafes={topCafes}
      />

      {/* Insights */}
      <StatsScreenInsights insights={insights} />
    </AnimatePresence>
  );
};