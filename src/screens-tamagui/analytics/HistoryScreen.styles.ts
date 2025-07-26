import { View, Text, Card, styled } from 'tamagui';

export const TastingCard = styled(Card, {
  name: 'TastingCard',
  backgroundColor: '$background',
  marginHorizontal: '$lg',
  marginBottom: '$sm',
  borderRadius: '$3',
  padding: '$md',
  minHeight: 60,
  borderWidth: 1,
  borderColor: '$purple5',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    scale: 0.95,
    y: 20,
},
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$backgroundPress',
},
});

export const CardHeader = styled(View, {
  name: 'CardHeader',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$xs',
});

export const CoffeeName = styled(Text, {
  name: 'CoffeeName',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
  flex: 1,
});

export const RoasterName = styled(Text, {
  name: 'RoasterName',
  fontSize: '$3',
  fontWeight: '400',
  color: '$gray11',
  marginBottom: '$xs',
});

export const DateText = styled(Text, {
  name: 'DateText',
  fontSize: '$2',
  fontWeight: '400',
  color: '$gray10',
});

export const MatchScoreContainer = styled(View, {
  name: 'MatchScoreContainer',
  borderRadius: '$3',
  paddingHorizontal: '$sm',
  paddingVertical: '$xs',
  variants: {
    score: {
      high: {
        backgroundColor: '$green9',
    },
      medium: {
        backgroundColor: '$orange9',
    },
      low: {
        backgroundColor: '$red9',
    },
  },
} as const,
});

export const MatchScore = styled(Text, {
  name: 'MatchScore',
  fontSize: '$2',
  fontWeight: '600',
  color: 'white',
});