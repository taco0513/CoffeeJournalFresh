import React from 'react';
import { XStack, YStack, Text, Card, styled } from 'tamagui';
import { Achievement, ProgressData } from '../../types/achievements';
import { CircularProgress } from './CircularProgress';

// Styled components
const StyledCard = styled(Card, {
  name: 'AchievementCard',
  backgroundColor: '$backgroundHover',
  borderRadius: '$4',
  padding: '$lg',
  marginBottom: '$md',
  borderWidth: 1,
  borderColor: '$borderColor',
  elevate: true,
  position: 'relative',
  animation: 'lazy',
  
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$backgroundPress',
},
  
  variants: {
    compact: {
      true: {
        padding: '$md',
        marginBottom: '$sm',
    },
  },
    
    unlocked: {
      true: {
        borderColor: '$green9',
    },
      false: {
        opacity: 0.8,
    },
  },
} as const,
  
  defaultVariants: {
    compact: false,
    unlocked: false,
},
});

const NewBadge = styled(YStack, {
  name: 'NewBadge',
  position: 'absolute',
  top: -8,
  right: -8,
  backgroundColor: '$red9',
  borderRadius: 12,
  paddingHorizontal: '$xs',
  paddingVertical: '$xxxs',
  zIndex: 1,
});

const NewBadgeText = styled(Text, {
  name: 'NewBadgeText',
  fontSize: '$1',
  fontWeight: '700',
  color: 'white',
});

const IconContainer = styled(YStack, {
  name: 'IconContainer',
  width: 48,
  height: 48,
  borderRadius: 24,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '$md',
});

const IconText = styled(Text, {
  name: 'IconText',
  fontSize: 24,
  
  variants: {
    compact: {
      true: {
        fontSize: 20,
    },
  },
    locked: {
      true: {
        opacity: 0.5,
    },
  },
} as const,
});

const HeaderInfo = styled(YStack, {
  name: 'HeaderInfo',
  flex: 1,
});

const TitleText = styled(Text, {
  name: 'TitleText',
  fontSize: '$4', // 20px
  fontWeight: '600',
  color: '$color',
  marginBottom: '$xxxs',
  
  variants: {
    compact: {
      true: {
        fontSize: '$3', // 18px
    },
  },
    locked: {
      true: {
        opacity: 0.6,
    },
  },
} as const,
});

const RarityBadge = styled(YStack, {
  name: 'RarityBadge',
  paddingHorizontal: '$xs',
  paddingVertical: '$xxxs',
  borderRadius: '$2',
  
  variants: {
    rarity: {
      common: {
        backgroundColor: '$gray9',
    },
      rare: {
        backgroundColor: '$blue9',
    },
      epic: {
        backgroundColor: '$purple9',
    },
      legendary: {
        backgroundColor: '$orange9',
    },
  },
} as const,
  
  defaultVariants: {
    rarity: 'common',
},
});

const RarityBadgeText = styled(Text, {
  name: 'RarityBadgeText',
  fontSize: '$1', // 14px
  fontWeight: '600',
  color: 'white',
});

const RewardText = styled(Text, {
  name: 'RewardText',
  fontSize: '$2', // 16px
  fontWeight: '600',
  color: '$blue9',
  
  variants: {
    locked: {
      true: {
        opacity: 0.6,
    },
  },
} as const,
});

const DescriptionText = styled(Text, {
  name: 'DescriptionText',
  fontSize: '$2', // 16px
  color: '$gray11',
  lineHeight: 22,
  marginBottom: '$sm',
  
  variants: {
    locked: {
      true: {
        opacity: 0.6,
    },
  },
} as const,
});

const ProgressSection = styled(XStack, {
  name: 'ProgressSection',
  marginTop: '$md',
  alignItems: 'center',
  gap: '$md',
  
  variants: {
    compact: {
      true: {
        marginTop: '$sm',
        gap: '$sm',
    },
  },
} as const,
});

const ProgressInfo = styled(YStack, {
  name: 'ProgressInfo',
  flex: 1,
});

const ProgressDetailText = styled(Text, {
  name: 'ProgressDetailText',
  fontSize: '$2', // 16px
  fontWeight: '500',
  color: '$gray11',
});

const EstimatedTimeText = styled(Text, {
  name: 'EstimatedTimeText',
  fontSize: '$1', // 14px
  color: '$gray10',
  marginTop: '$xxxs',
});

const CircularProgressText = styled(Text, {
  name: 'CircularProgressText',
  fontSize: '$2', // 16px
  fontWeight: '600',
  color: '$color',
  
  variants: {
    compact: {
      true: {
        fontSize: '$1', // 14px
    },
  },
} as const,
});

const UnlockSection = styled(YStack, {
  name: 'UnlockSection',
  marginTop: '$sm',
  paddingTop: '$sm',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
});

const UnlockDateText = styled(Text, {
  name: 'UnlockDateText',
  fontSize: '$1', // 14px
  fontWeight: '500',
  color: '$gray11',
});

// Type definitions
interface AchievementCardProps {
  achievement: Achievement;
  progress?: ProgressData;
  compact?: boolean;
  onPress?: () => void;
}

// Helper functions
const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return '$gray9';
    case 'rare':
      return '$blue9';
    case 'epic':
      return '$purple9';
    case 'legendary':
      return '$orange9';
    default:
      return '$gray9';
}
};

const getRarityLabel = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return '일반';
    case 'rare':
      return '희귀';
    case 'epic':
      return '서사';
    case 'legendary':
      return '전설';
    default:
      return '일반';
}
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
}).format(date);
};

const formatReward = (reward: unknown) => {
  if (reward.type === 'points') {
    return `${reward.value}pt`;
}
  return reward.value;
};

// Main component
export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  progress,
  compact = false,
  onPress,
}) => {
  const isUnlocked = achievement.unlockedAt !== undefined;
  const progressPercentage = progress?.percentage || achievement.progress || 0;
  const rarityColor = getRarityColor(achievement.rarity);

  return (
    <StyledCard
      compact={compact}
      unlocked={isUnlocked}
      onPress={onPress}
    >
      {/* New Badge */}
      {achievement.isNew && (
        <NewBadge>
          <NewBadgeText>NEW</NewBadgeText>
        </NewBadge>
      )}

      {/* Header Row */}
      <XStack alignItems="center" marginBottom="$sm">
        <IconContainer backgroundColor={rarityColor + '20'}>
          <IconText
            compact={compact}
            locked={!isUnlocked}
          >
            {achievement.icon}
          </IconText>
        </IconContainer>
        
        <HeaderInfo>
          <TitleText
            compact={compact}
            locked={!isUnlocked}
          >
            {achievement.title}
          </TitleText>
          
          {/* Rarity Indicator */}
          <XStack alignItems="center">
            <RarityBadge rarity={achievement.rarity as unknown}>
              <RarityBadgeText>
                {getRarityLabel(achievement.rarity)}
              </RarityBadgeText>
            </RarityBadge>
          </XStack>
        </HeaderInfo>

        {/* Reward */}
        <YStack alignItems="flex-end">
          <RewardText locked={!isUnlocked}>
            {formatReward(achievement.rewards)}
          </RewardText>
        </YStack>
      </XStack>

      {/* Description */}
      {!compact && (
        <DescriptionText locked={!isUnlocked}>
          {achievement.description}
        </DescriptionText>
      )}

      {/* Progress Section */}
      {!isUnlocked && progress && (
        <ProgressSection compact={compact}>
          <CircularProgress
            size={compact ? 40 : 60}
            strokeWidth={3}
            progress={progressPercentage}
            color={rarityColor}
            backgroundColor="$gray6"
          >
            <CircularProgressText compact={compact}>
              {Math.round(progressPercentage)}%
            </CircularProgressText>
          </CircularProgress>
          
          <ProgressInfo>
            <ProgressDetailText>
              {progress.currentValue} / {progress.targetValue}
            </ProgressDetailText>
            {progress.estimatedTimeToComplete && !compact && (
              <EstimatedTimeText>
                약 {progress.estimatedTimeToComplete}일 남음
              </EstimatedTimeText>
            )}
          </ProgressInfo>
        </ProgressSection>
      )}

      {/* Unlock Date */}
      {isUnlocked && achievement.unlockedAt && (
        <UnlockSection>
          <UnlockDateText>
            {formatDate(achievement.unlockedAt)}에 달성
          </UnlockDateText>
        </UnlockSection>
      )}
    </StyledCard>
  );
};

export default AchievementCard;