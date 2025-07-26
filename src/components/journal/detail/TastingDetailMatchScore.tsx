// TastingDetailMatchScore.tsx
// Match score section component

import React from 'react';
import { YStack, XStack, SizableText } from 'tamagui';
import {
  ScoreCard,
  SectionTitle,
  ScoreValue,
} from './TastingDetailStyledComponents';

interface MatchScoreData {
  matchScoreTotal: number;
  matchScoreFlavor: number;
  matchScoreSensory: number;
}

interface TastingDetailMatchScoreProps {
  scoreData: MatchScoreData;
}

export const TastingDetailMatchScore: React.FC<TastingDetailMatchScoreProps> = ({
  scoreData,
}) => {
  const ScoreItem: React.FC<{ label: string; score: number }> = ({ label, score }) => (
    <YStack alignItems="center" flex={1}>
      <SizableText size="$3" color="$gray11" fontWeight="500" marginBottom="$2">
        {label}
      </SizableText>
      <ScoreValue>{score}점</ScoreValue>
    </YStack>
  );

  return (
    <ScoreCard>
      <SectionTitle>매칭 스코어</SectionTitle>
      <XStack justifyContent="space-around" alignItems="center">
        <ScoreItem label="전체" score={scoreData.matchScoreTotal} />
        <ScoreItem label="향미" score={scoreData.matchScoreFlavor} />
        <ScoreItem label="감각" score={scoreData.matchScoreSensory} />
      </XStack>
    </ScoreCard>
  );
};