// StatsScreenEmptyState.tsx
// Empty state component for when no tasting records exist

import React from 'react';
import { View, YStack, AnimatePresence } from 'tamagui';
import { InsightCard } from '../../../components-tamagui/cards/InsightCard';
import { InsightSeparator } from '../../../components-tamagui/shared/InsightStyles';
import {
  EmptyContainer,
  EmptyText,
  EmptySubtext,
  Section,
  SectionTitle,
  InsightPreviewText,
} from './StatsScreenStyledComponents';

interface StatsScreenEmptyStateProps {
  insights: unknown[];
}

export const StatsScreenEmptyState: React.FC<StatsScreenEmptyStateProps> = ({
  insights,
}) => {
  return (
    <YStack flex={1}>
      <EmptyContainer>
        <EmptyText>아직 테이스팅 기록이 없습니다</EmptyText>
        <EmptySubtext>
          첫 테이스팅을 기록하면 통계를 볼 수 있습니다
        </EmptySubtext>
      </EmptyContainer>

      {/* 30일 인사이트 섹션 - 예시 */}
      <Section>
        <SectionTitle>30일 인사이트 (예시)</SectionTitle>
        <InsightPreviewText>
          기록이 쌓이면 이런 인사이트를 볼 수 있어요!
        </InsightPreviewText>
        <YStack>
          {insights.map((insight, index) => {
            // Generate ultra-unique key for empty state insights
            const uniqueKey = `empty-state-insight-${index}-${insight.title || 'no-title'}-${insight.icon || 'no-icon'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
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
    </YStack>
  );
};