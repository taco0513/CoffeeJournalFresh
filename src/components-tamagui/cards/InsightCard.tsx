import React from 'react';
import { Card, XStack, YStack, Text, styled } from 'tamagui';

// Styled components
const StyledCard = styled(Card, {
  name: 'InsightCard',
  backgroundColor: '#FFF8F0',
  borderRadius: '$4',
  padding: '$lg',
  marginBottom: '$md',
  borderWidth: 1,
  borderColor: '#FFE5CC',
  elevate: true,
  animation: 'lazy',
  
  enterStyle: {
    opacity: 0,
    y: 10,
  },
  
  pressStyle: {
    scale: 0.99,
  },
});

const IconText = styled(Text, {
  name: 'IconText',
  fontSize: 32,
  marginRight: '$lg',
});

const TitleText = styled(Text, {
  name: 'TitleText',
  fontSize: '$2', // 16px
  color: '$gray11',
  marginBottom: 4,
});

const ValueText = styled(Text, {
  name: 'ValueText',
  fontSize: '$4', // 20px
  fontWeight: '600',
  color: '$color',
});

const TrendIcon = styled(Text, {
  name: 'TrendIcon',
  fontSize: '$3', // 18px
  
  variants: {
    trend: {
      up: {
        color: '$green9',
      },
      down: {
        color: '$red9',
      },
      stable: {
        color: '$gray9',
      },
    },
  } as const,
});

const DetailText = styled(Text, {
  name: 'DetailText',
  fontSize: '$1', // 14px
  color: '$gray10',
  marginTop: 4,
});

// Type definitions
export interface InsightCardProps {
  icon: string;
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
  detail?: string;
}

// Main component
export const InsightCard: React.FC<InsightCardProps> = ({
  icon,
  title,
  value,
  trend,
  detail,
}) => {
  const renderTrendIcon = () => {
    if (!trend) return null;
    
    const trendSymbol = {
      up: '↑',
      down: '↓',
      stable: '→',
    }[trend];
    
    return (
      <TrendIcon trend={trend}>
        {trendSymbol}
      </TrendIcon>
    );
  };

  return (
    <StyledCard>
      <XStack alignItems="flex-start">
        <IconText>{icon}</IconText>
        <YStack flex={1}>
          <TitleText>{title}</TitleText>
          <XStack alignItems="center" gap="$xs">
            <ValueText>{value}</ValueText>
            {renderTrendIcon()}
          </XStack>
          {detail && <DetailText>{detail}</DetailText>}
        </YStack>
      </XStack>
    </StyledCard>
  );
};

export default InsightCard;