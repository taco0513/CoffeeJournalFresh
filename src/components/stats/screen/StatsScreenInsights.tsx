// StatsScreenInsights.tsx
// Insights section component

import React from 'react';
import { View, AnimatePresence } from 'tamagui';
import { InsightCard } from '../InsightCard';
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
    <Section
      animation="lazy"
      enterStyle={{
        opacity: 0,
        y: 30,
    }}
      animateOnly={['opacity', 'transform']}
    >
      <SectionTitle> 30일 인사이트</SectionTitle>
      <AnimatePresence>
        {insights.map((insight, index) => {
          const uniqueKey = `data-state-insight-${index}-${insight.title || 'no-title'}-${insight.icon || 'no-icon'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          return (
            <View
              key={uniqueKey}
              animation="lazy"
              enterStyle={{
                opacity: 0,
                y: 30,
            }}
              animateOnly={['opacity', 'transform']}
            >
              <InsightCard insight={insight} />
            </View>
          );
      })}
      </AnimatePresence>
    </Section>
  );
};