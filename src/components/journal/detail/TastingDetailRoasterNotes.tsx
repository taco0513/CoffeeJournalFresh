// TastingDetailRoasterNotes.tsx
// Roaster notes section component

import React from 'react';
import { Paragraph } from 'tamagui';
import {
  InfoCard,
  SectionTitle,
} from './TastingDetailStyledComponents';

interface TastingDetailRoasterNotesProps {
  notes: string;
}

export const TastingDetailRoasterNotes: React.FC<TastingDetailRoasterNotesProps> = ({
  notes,
}) => {
  if (!notes) {
    return null;
}

  return (
    <InfoCard>
      <SectionTitle>로스터 노트</SectionTitle>
      <Paragraph size="$4" color="$color" lineHeight="$6">
        {notes}
      </Paragraph>
    </InfoCard>
  );
};