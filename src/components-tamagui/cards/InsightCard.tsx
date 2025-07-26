import React from 'react';
import { Card, XStack, YStack, Text, styled } from 'tamagui';

// Styled components
const StyledCard = styled(YStack, {
  name: 'InsightCard',
  backgroundColor: 'transparent',
  paddingHorizontal: '$xxs',
  paddingVertical: '$sm',
  marginBottom: 0,
  minHeight: 80,
  justifyContent: 'center',
  
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
  isLast?: boolean;
}

// Main component
export const InsightCard: React.FC<InsightCardProps> = ({
  icon,
  title,
  value,
  trend,
  detail,
  isLast = false,
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
      <YStack alignItems="center" justifyContent="center" flex={1}>
        <YStack alignItems="center" justifyContent="center" gap="$xxs">
          <TitleText textAlign="center">{title}</TitleText>
          <XStack alignItems="center" gap="$xs">
            <ValueText textAlign="center">{value}</ValueText>
            {renderTrendIcon()}
          </XStack>
          {detail && <DetailText textAlign="center" marginTop="$xxs">{detail}</DetailText>}
        </YStack>
      </YStack>
    </StyledCard>
  );
};

export default InsightCard;