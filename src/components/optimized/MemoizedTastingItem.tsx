import React, { memo } from 'react';
import { View } from 'tamagui';
import { ITastingRecord } from '../../services/realm/schemas';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { formatDate } from '../../utils/dateFormatter';
import { Logger } from '../../services/LoggingService';
import {
  TastingCard,
  CardHeader,
  CoffeeName,
  MatchScoreContainer,
  MatchScore,
  RoasterName,
  DateText,
} from '../../screens-tamagui/analytics/HistoryScreen.styles';

interface MemoizedTastingItemProps {
  item: ITastingRecord;
  index: number;
}

const getScoreType = (score: number): 'high' | 'medium' | 'low' => {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
};

// Memoized component with custom comparison
export const MemoizedTastingItem = memo<MemoizedTastingItemProps>(({ item, index }) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  
  const handlePress = () => {
    navigation.navigate('TastingDetail', { tastingId: item.id });
};

  try {
    const formattedDate = formatDate(item.createdAt, 'short');
    
    return (
      <TastingCard
        onPress={handlePress}
        animation="lazy"
        enterStyle={{
          opacity: 0,
          scale: 0.95,
          y: 20,
      }}
        animateOnly={['opacity', 'transform']}
      >
        <CardHeader>
          <CoffeeName>{item.coffeeName}</CoffeeName>
          <MatchScoreContainer score={getScoreType(item.matchScoreTotal || 0)}>
            <MatchScore>{item.matchScoreTotal || 0}%</MatchScore>
          </MatchScoreContainer>
        </CardHeader>
        <RoasterName>{item.roastery || 'Unknown Roastery'}</RoasterName>
        <DateText>{formattedDate}</DateText>
      </TastingCard>
    );
} catch (error) {
    Logger.error('Error rendering tasting item:', 'component', { 
      component: 'MemoizedTastingItem', 
      error, 
      item 
  });
    return (
      <TastingCard>
        <CoffeeName>Error loading item</CoffeeName>
        <RoasterName>ID: {item.id}</RoasterName>
      </TastingCard>
    );
}
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.coffeeName === nextProps.item.coffeeName &&
    prevProps.item.matchScoreTotal === nextProps.item.matchScoreTotal &&
    prevProps.item.createdAt === nextProps.item.createdAt &&
    prevProps.index === nextProps.index
  );
});

MemoizedTastingItem.displayName = 'MemoizedTastingItem';