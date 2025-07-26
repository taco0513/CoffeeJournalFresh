// TastingDetailContent.tsx
// Main content component that combines all tasting detail sections

import React from 'react';
import { AnimatePresence } from 'tamagui';
import { TastingDetailCoffeeInfo } from './TastingDetailCoffeeInfo';
import { TastingDetailMatchScore } from './TastingDetailMatchScore';
import { TastingDetailFlavorPaths } from './TastingDetailFlavorPaths';
import { TastingDetailPersonalComment } from './TastingDetailPersonalComment';
import { TastingDetailSensoryEvaluation } from './TastingDetailSensoryEvaluation';
import { TastingDetailRoasterNotes } from './TastingDetailRoasterNotes';
import { TimestampText } from './TastingDetailStyledComponents';

interface TastingRecord {
  // Coffee info
  roastery: string;
  coffeeName: string;
  mode?: 'cafe' | 'home_cafe' | 'lab';
  cafeName?: string;
  origin?: string;
  variety?: string;
  altitude?: string;
  process?: string;
  
  // Scores
  matchScoreTotal: number;
  matchScoreFlavor: number;
  matchScoreSensory: number;
  
  // User selections
  selectedFlavorPaths?: unknown[];
  personalComment?: string;
  sensoryAttribute?: {
    body?: number;
    acidity?: number;
    sweetness?: number;
    finish?: number;
    bitterness?: number;
    balance?: number;
    mouthfeel?: string;
};
  roasterNotes?: string;
  
  // Metadata
  createdAt: string | Date;
  updatedAt?: string | Date;
}

interface TastingDetailContentProps {
  tastingRecord: TastingRecord;
}

export const TastingDetailContent: React.FC<TastingDetailContentProps> = ({
  tastingRecord,
}) => {
  const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
  });
};

  return (
    <AnimatePresence>
      {/* Coffee Information */}
      <TastingDetailCoffeeInfo coffeeData={tastingRecord} />

      {/* Match Score */}
      <TastingDetailMatchScore 
        scoreData={{
          matchScoreTotal: tastingRecord.matchScoreTotal,
          matchScoreFlavor: tastingRecord.matchScoreFlavor,
          matchScoreSensory: tastingRecord.matchScoreSensory,
      }}
      />

      {/* My Selected Flavors */}
      {tastingRecord.selectedFlavorPaths && (
        <TastingDetailFlavorPaths 
          flavorPaths={tastingRecord.selectedFlavorPaths}
        />
      )}

      {/* Personal Comment */}
      {tastingRecord.personalComment && (
        <TastingDetailPersonalComment 
          comment={tastingRecord.personalComment}
        />
      )}

      {/* Sensory Attributes */}
      {tastingRecord.sensoryAttribute && (
        <TastingDetailSensoryEvaluation 
          sensoryAttribute={tastingRecord.sensoryAttribute}
        />
      )}

      {/* Roaster Notes */}
      {tastingRecord.roasterNotes && (
        <TastingDetailRoasterNotes 
          notes={tastingRecord.roasterNotes}
        />
      )}

      {/* Timestamp */}
      <TimestampText>
        기록됨: {formatDate(tastingRecord.createdAt)}
        {tastingRecord.updatedAt && tastingRecord.updatedAt !== tastingRecord.createdAt && (
          ` • 수정됨: ${formatDate(tastingRecord.updatedAt)}`
        )}
      </TimestampText>
    </AnimatePresence>
  );
};