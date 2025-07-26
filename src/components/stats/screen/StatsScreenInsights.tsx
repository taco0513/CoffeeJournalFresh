// StatsScreenInsights.tsx
// Insights section component

import React from 'react';
import { View, AnimatePresence, YStack, XStack } from 'tamagui';
import { InsightCard } from '../../../components-tamagui/cards/InsightCard';
import { InsightSeparator } from '../../../components-tamagui/shared/InsightStyles';
import {
  Section,
  SectionTitle,
} from './StatsScreenStyledComponents';

interface StatsScreenInsightsProps {
  insights: unknown[];
}

export const StatsScreenInsights: React.FC<StatsScreenInsightsProps> = ({
  insights,
}) => {
  if (insights.length === 0) {
    return null;
}

  return (
    <Section>
      <SectionTitle>30일 인사이트</SectionTitle>
      <YStack>
        {insights.map((insight, index) => {
          const uniqueKey = `data-state-insight-${index}-${insight.title || 'no-title'}-${insight.icon || 'no-icon'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          return (
            <React.Fragment key={uniqueKey}>
              <InsightCard 
                icon={insight.icon || ''}
                title={insight.title || ''}
                value={insight.description || insight.value || ''}
                isLast={index === insights.length - 1}
              />
              {index < insights.length - 1 && (
                <InsightSeparator />
              )}
            </React.Fragment>
          );
      })}
      </YStack>
    </Section>
  );
};