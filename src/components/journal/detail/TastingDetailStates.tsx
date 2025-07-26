// TastingDetailStates.tsx
// Loading and error state components for TastingDetailScreen

import React from 'react';
import { Text, Spinner } from 'tamagui';
import {
  LoadingContainer,
  ErrorContainer,
  ActionButton,
} from './TastingDetailStyledComponents';

interface TastingDetailLoadingStateProps {
  message?: string;
}

export const TastingDetailLoadingState: React.FC<TastingDetailLoadingStateProps> = ({
  message = '로딩 중...',
}) => {
  return (
    <LoadingContainer>
      <Spinner size="large" color="$cupBlue" />
      <Text fontSize="$4" color="$gray11">{message}</Text>
    </LoadingContainer>
  );
};

interface TastingDetailErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export const TastingDetailErrorState: React.FC<TastingDetailErrorStateProps> = ({
  error,
  onRetry,
}) => {
  return (
    <ErrorContainer>
      <Text fontSize="$6" color="$red9"></Text>
      <Text fontSize="$5" fontWeight="600" color="$color" textAlign="center">
        오류가 발생했습니다
      </Text>
      <Text fontSize="$4" color="$gray11" textAlign="center">
        {error}
      </Text>
      {onRetry && (
        <ActionButton onPress={onRetry}>
          다시 시도
        </ActionButton>
      )}
    </ErrorContainer>
  );
};