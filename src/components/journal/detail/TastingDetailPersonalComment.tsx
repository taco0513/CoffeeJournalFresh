// TastingDetailPersonalComment.tsx
// Personal comment section component

import React from 'react';
import { Paragraph } from 'tamagui';
import {
  InfoCard,
  SectionTitle,
} from './TastingDetailStyledComponents';

interface TastingDetailPersonalCommentProps {
  comment: string;
}

export const TastingDetailPersonalComment: React.FC<TastingDetailPersonalCommentProps> = ({
  comment,
}) => {
  if (!comment) {
    return null;
}

  return (
    <InfoCard>
      <SectionTitle>개인 코멘트</SectionTitle>
      <Paragraph size="$4" color="$color" lineHeight="$6">
        {comment}
      </Paragraph>
    </InfoCard>
  );
};