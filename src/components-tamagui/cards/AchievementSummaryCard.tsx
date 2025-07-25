import React from 'react';
import { XStack, YStack, Text, Card, styled, Separator } from 'tamagui';
import { Achievement } from '../../types/achievements';

// Styled components
const StyledCard = styled(Card, {
  name: 'AchievementSummaryCard',
  backgroundColor: '$background',
  borderRadius: '$4',
  padding: '$lg',
  marginBottom: '$md',
  borderWidth: 1,
  borderColor: '$borderColor',
  elevate: true,
  animation: 'lazy',
  
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$backgroundPress',
  },
  
  enterStyle: {
    opacity: 0,
    y: 10,
  },
});

const IconContainer = styled(YStack, {
  name: 'IconContainer',
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: '$yellow4',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '$md',
});

const IconText = styled(Text, {
  name: 'IconText',
  fontSize: 24,
});

const TitleInfo = styled(YStack, {
  name: 'TitleInfo',
  flex: 1,
});

const TitleText = styled(Text, {
  name: 'TitleText',
  fontSize: '$4', // 20px
  fontWeight: '600',
  color: '$color',
  marginBottom: 2,
});

const SubtitleText = styled(Text, {
  name: 'SubtitleText',
  fontSize: '$1', // 14px
  color: '$gray11',
});

const ChevronText = styled(Text, {
  name: 'ChevronText',
  fontSize: '$4', // 20px
  color: '$gray9',
  fontWeight: '300',
  marginLeft: '$sm',
});

const StatsContainer = styled(XStack, {
  name: 'StatsContainer',
  justifyContent: 'space-around',
  alignItems: 'center',
  paddingVertical: '$md',
  backgroundColor: '$gray3',
  borderRadius: '$2',
  marginBottom: '$lg',
});

const StatItem = styled(YStack, {
  name: 'StatItem',
  alignItems: 'center',
  flex: 1,
});

const StatNumber = styled(Text, {
  name: 'StatNumber',
  fontSize: '$5', // 22px
  fontWeight: '700',
  color: '$blue9',
  marginBottom: 2,
});

const StatLabel = styled(Text, {
  name: 'StatLabel',
  fontSize: '$1', // 14px
  color: '$gray11',
});

const StatDivider = styled(YStack, {
  name: 'StatDivider',
  width: 1,
  height: 24,
  backgroundColor: '$gray7',
});

const NextAchievementSection = styled(YStack, {
  name: 'NextAchievementSection',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
  paddingTop: '$md',
});

const NextTitle = styled(Text, {
  name: 'NextTitle',
  fontSize: '$2', // 16px
  fontWeight: '600',
  color: '$color',
  marginBottom: '$sm',
});

const NextIconContainer = styled(YStack, {
  name: 'NextIconContainer',
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: '$gray6',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '$md',
});

const NextIcon = styled(Text, {
  name: 'NextIcon',
  fontSize: 18,
});

const NextInfo = styled(YStack, {
  name: 'NextInfo',
  flex: 1,
});

const NextAchievementTitle = styled(Text, {
  name: 'NextAchievementTitle',
  fontSize: '$3', // 18px
  fontWeight: '500',
  color: '$color',
  marginBottom: 2,
  numberOfLines: 1,
});

const NextProgress = styled(Text, {
  name: 'NextProgress',
  fontSize: '$1', // 14px
  color: '$blue9',
  fontWeight: '500',
});

// Type definitions
interface AchievementSummaryCardProps {
  unlockedCount: number;
  totalCount: number;
  totalPoints: number;
  nextAchievement?: Achievement | null;
  onPress: () => void;
}

// Main component
export const AchievementSummaryCard: React.FC<AchievementSummaryCardProps> = ({
  unlockedCount,
  totalCount,
  totalPoints,
  nextAchievement,
  onPress,
}) => {
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <StyledCard onPress={onPress}>
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$lg">
        <XStack alignItems="center" flex={1}>
          <IconContainer>
            <IconText>🏆</IconText>
          </IconContainer>
          <TitleInfo>
            <TitleText>나의 업적</TitleText>
            <SubtitleText>커피 여정의 성과를 확인해보세요</SubtitleText>
          </TitleInfo>
        </XStack>
        <ChevronText>›</ChevronText>
      </XStack>

      {/* Stats Row */}
      <StatsContainer>
        <StatItem>
          <StatNumber>{unlockedCount}</StatNumber>
          <StatLabel>달성</StatLabel>
        </StatItem>
        
        <StatDivider />
        
        <StatItem>
          <StatNumber>{completionPercentage}%</StatNumber>
          <StatLabel>완료율</StatLabel>
        </StatItem>
        
        <StatDivider />
        
        <StatItem>
          <StatNumber>{totalPoints}</StatNumber>
          <StatLabel>포인트</StatLabel>
        </StatItem>
      </StatsContainer>

      {/* Next Achievement */}
      {nextAchievement && (
        <NextAchievementSection>
          <NextTitle>다음 목표</NextTitle>
          <XStack alignItems="center">
            <NextIconContainer>
              <NextIcon>{nextAchievement.icon}</NextIcon>
            </NextIconContainer>
            <NextInfo>
              <NextAchievementTitle>
                {nextAchievement.title}
              </NextAchievementTitle>
              <NextProgress>
                {Math.round((nextAchievement.progress || 0) * 100)}% 완료
              </NextProgress>
            </NextInfo>
          </XStack>
        </NextAchievementSection>
      )}
    </StyledCard>
  );
};

export default AchievementSummaryCard;