// StatsScreenLoadingState.tsx
// Loading state component for StatsScreen

import React from 'react';
import { YStack, Spinner } from 'tamagui';
import {
  LoadingContainer,
  LoadingText,
} from './StatsScreenStyledComponents';

export const StatsScreenLoadingState: React.FC = () => {
  return (
    <YStack flex={1}>
      <LoadingContainer>
        <Spinner size="large" color="$cupBlue" />
        <LoadingText>통계를 불러오는 중...</LoadingText>
      </LoadingContainer>
    </YStack>
  );
};