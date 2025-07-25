import React from 'react';
import { Card, XStack, YStack, Text, styled } from 'tamagui';

// Styled components
const StyledCard = styled(Card, {
  name: 'InsightCard',
  backgroundColor: '$backgroundHover',
  borderRadius: '$4',
  padding: '$lg',
  marginBottom: '$md',
  borderWidth: 1,
  borderColor: '$borderColor',
  elevate: true,
  animation: 'lazy',
  
  enterStyle: {
    opacity: 0,
    y: 10,
  },
  
  pressStyle: {
    scale: 0.99,
    backgroundColor: '$backgroundPress',
  },
  
  // WCAG 2.4.7 Focus Visible - Enhanced accessibility
  focusStyle: {
    borderWidth: 3,
    borderColor: '$focusRing',
    shadowColor: '$focusRing',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    outlineColor: '$focusRing',
    outlineWidth: 2,
    outlineOffset: 2,
  },
});

const IconText = styled(Text, {
  name: 'IconText',
  fontSize: 32,
  marginRight: '$lg',
});

const TitleText = styled(Text, {
  name: 'TitleText',
  fontSize: '$3', // 16px - WCAG minimum
  color: '$color',
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
        color: '$success', // WCAG compliant success color
      },
      down: {
        color: '$error', // WCAG compliant error color
      },
      stable: {
        color: '$color',
      },
    },
  } as const,
});

const DetailText = styled(Text, {
  name: 'DetailText',
  fontSize: '$2', // 16px - WCAG minimum
  color: '$color',
  opacity: 0.8,
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