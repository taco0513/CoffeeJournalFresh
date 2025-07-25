import React from 'react';
import { TouchableOpacity } from 'react-native';
import {
  TastingCard,
  CardHeader,
  CardInfo,
  CoffeeName,
  RoasteryName,
  ScoreText,
  CardDetails,
  DetailItem,
  FlavorContainer,
  FlavorChip,
  FlavorText,
  FlavorCount,
} from './SearchScreenStyles';
import { ITastingRecord } from '../../services/realm/schemas';

interface TastingSearchCardProps {
  tasting: ITastingRecord;
  onPress: (tasting: ITastingRecord) => void;
}

export const TastingSearchCard: React.FC<TastingSearchCardProps> = ({
  tasting,
  onPress,
}) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFlavorNotes = (): string[] => {
    if (tasting.flavorNotes && Array.isArray(tasting.flavorNotes)) {
      return tasting.flavorNotes.map(note => 
        note.koreanValue || note.value || String(note)
      ).filter(Boolean);
    }
    return [];
  };

  const flavorNotes = getFlavorNotes();
  const displayedFlavors = flavorNotes.slice(0, 3);
  const remainingCount = flavorNotes.length - displayedFlavors.length;

  return (
    <TouchableOpacity onPress={() => onPress(tasting)}>
      <TastingCard>
        <CardHeader>
          <CardInfo>
            <CoffeeName numberOfLines={1}>
              {tasting.coffeeName || '커피명 없음'}
            </CoffeeName>
            <RoasteryName numberOfLines={1}>
              {tasting.roastery || tasting.cafeName || '로스터리명 없음'}
            </RoasteryName>
          </CardInfo>
          
          {tasting.matchScoreTotal !== undefined && tasting.matchScoreTotal > 0 && (
            <ScoreText>
              {tasting.matchScoreTotal.toFixed(1)}점
            </ScoreText>
          )}
        </CardHeader>

        <CardDetails>
          <DetailItem>
            📅 {formatDate(tasting.createdAt)}
          </DetailItem>
          
          {tasting.temperature && (
            <DetailItem>
              ☕ {tasting.temperature === 'hot' ? '뜨거운' : tasting.temperature === 'cold' ? '차가운' : '아이스'}
            </DetailItem>
          )}
          
          {tasting.origin && (
            <DetailItem>
              🌍 {tasting.origin}
            </DetailItem>
          )}
          
          {tasting.variety && (
            <DetailItem>
              🌱 {tasting.variety}
            </DetailItem>
          )}
        </CardDetails>

        {flavorNotes.length > 0 && (
          <FlavorContainer>
            {displayedFlavors.map((flavor, index) => (
              <FlavorChip key={index}>
                <FlavorText>{flavor}</FlavorText>
              </FlavorChip>
            ))}
            
            {remainingCount > 0 && (
              <FlavorCount>
                +{remainingCount}개 더
              </FlavorCount>
            )}
          </FlavorContainer>
        )}
      </TastingCard>
    </TouchableOpacity>
  );
};