// InsightStyles.tsx
// Shared styled components for insight lists

import { styled, YStack } from 'tamagui';

export const InsightListContainer = styled(YStack, {
  name: 'InsightListContainer',
  gap: 0,
});

export const InsightSeparator = styled(YStack, {
  name: 'InsightSeparator',
  height: 1,
  backgroundColor: '$gray5',
  marginVertical: '$md',
  marginHorizontal: '$md',
});