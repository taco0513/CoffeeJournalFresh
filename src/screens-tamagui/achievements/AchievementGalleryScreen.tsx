import React, { useState, useMemo } from 'react';
import { RefreshControl, SafeAreaView } from 'react-native';
import {
  View,
  Text,
  ScrollView,
  Button,
  YStack,
  XStack,
  Card,
  Separator,
  Spinner,
  H1,
  H2,
  H3,
  Paragraph,
  SizableText,
  styled,
  useTheme,
  AnimatePresence,
  GetProps,
} from 'tamagui';
import { AchievementCard } from '../../components-tamagui';
import { useAchievements } from '../../hooks/useAchievements';
import StatusBadge from '../../components/StatusBadge';
import { AchievementType } from '../../types/achievements';

type FilterType = 'all' | 'unlocked' | 'locked' | AchievementType;

interface AchievementGalleryScreenProps {
  hideNavBar?: boolean;
}

const FILTER_OPTIONS: { key: FilterType; label: string; icon: string }[] = [
  { key: 'all', label: '전체', icon: '🎯' },
  { key: 'unlocked', label: '달성완료', icon: '✅' },
  { key: 'locked', label: '진행중', icon: '🔒' },
  { key: AchievementType.FIRST_STEPS, label: '첫 걸음', icon: '👶' },
  { key: AchievementType.CONSISTENCY, label: '일관성', icon: '📅' },
  { key: AchievementType.VOCABULARY, label: '어휘력', icon: '📚' },
  { key: AchievementType.HIDDEN, label: '숨겨진', icon: '🕵️' },
];

// Styled Components
const Container = styled(View, {
  name: 'AchievementGalleryContainer',
  flex: 1,
  backgroundColor: '$background',
});

const NavigationBar = styled(XStack, {
  name: 'AchievementGalleryNavigation',
  height: 44,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  backgroundColor: '$background',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
});

const TitleContainer = styled(XStack, {
  name: 'TitleContainer',
  alignItems: 'center',
  gap: '$sm',
});

const NavigationTitle = styled(H1, {
  name: 'NavigationTitle',
  fontSize: '$6',
  fontWeight: '700',
  color: '$color',
});

const BetaBadge = styled(XStack, {
  name: 'BetaBadge',
  paddingHorizontal: '$xs',
  paddingVertical: 2,
  backgroundColor: '$orange9',
  borderRadius: '$2',
  alignItems: 'center',
});

const BetaText = styled(Text, {
  name: 'BetaText',
  fontSize: 10,
  fontWeight: '700',
  color: 'white',
});

const StatsContainer = styled(YStack, {
  name: 'StatsContainer',
  backgroundColor: '$background',
  paddingHorizontal: '$lg',
  paddingVertical: '$lg',
  gap: '$md',
});

const StatsGrid = styled(XStack, {
  name: 'StatsGrid',
  justifyContent: 'space-between',
  gap: '$sm',
});

const StatCard = styled(Card, {
  name: 'StatCard',
  flex: 1,
  alignItems: 'center',
  padding: '$md',
  backgroundColor: '$gray4',
  borderRadius: '$3',
  borderWidth: 0,
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  pressStyle: {
    scale: 0.98,
  },
});

const StatNumber = styled(Text, {
  name: 'StatNumber',
  fontSize: '$7',
  fontWeight: '700',
  color: '$color',
});

const StatLabel = styled(Text, {
  name: 'StatLabel',
  fontSize: '$3',
  color: '$gray11',
  marginTop: '$xs',
});

const NextAchievementCard = styled(Card, {
  name: 'NextAchievementCard',
  backgroundColor: '$gray4',
  borderRadius: '$3',
  padding: '$md',
  borderWidth: 0,
  animation: 'bouncy',
  enterStyle: {
    opacity: 0,
    y: 30,
    scale: 0.9,
  },
});

const NextAchievementName = styled(Text, {
  name: 'NextAchievementName',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
  marginBottom: '$xs',
});

const FilterContainer = styled(XStack, {
  name: 'FilterContainer',
  backgroundColor: '$background',
  paddingHorizontal: '$lg',
  paddingBottom: '$sm',
});

const FilterPill = styled(Button, {
  name: 'FilterPill',
  size: '$3',
  paddingHorizontal: '$md',
  paddingVertical: '$xs',
  marginRight: '$sm',
  borderRadius: '$round',
  backgroundColor: '$gray4',
  borderWidth: 0,
  variants: {
    active: {
      true: {
        backgroundColor: '$cupBlue',
      },
    },
  } as const,
  pressStyle: {
    scale: 0.95,
  },
  animation: 'quick',
});

const FilterIcon = styled(Text, {
  name: 'FilterIcon',
  fontSize: 16,
  marginRight: '$xs',
});

const FilterText = styled(Text, {
  name: 'FilterText',
  fontSize: '$3',
  color: '$color',
  variants: {
    active: {
      true: {
        color: 'white',
        fontWeight: '600',
      },
    },
  } as const,
});

const AchievementList = styled(YStack, {
  name: 'AchievementList',
  flex: 1,
  paddingHorizontal: '$lg',
  paddingTop: '$sm',
  gap: '$md',
});

const EmptyStateContainer = styled(YStack, {
  name: 'EmptyStateContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: '$xxxl',
  gap: '$md',
});

const EmptyStateIcon = styled(Text, {
  name: 'EmptyStateIcon',
  fontSize: 48,
});

const EmptyStateText = styled(Paragraph, {
  name: 'EmptyStateText',
  fontSize: '$4',
  color: '$gray11',
  textAlign: 'center',
  lineHeight: '$6',
});

const ErrorContainer = styled(YStack, {
  name: 'ErrorContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$xl',
  gap: '$lg',
});

const ErrorIcon = styled(Text, {
  name: 'ErrorIcon',
  fontSize: 48,
});

const ErrorTitle = styled(Text, {
  name: 'ErrorTitle',
  fontSize: '$6',
  fontWeight: '700',
  color: '$color',
  textAlign: 'center',
});

const ErrorText = styled(Paragraph, {
  name: 'ErrorText',
  fontSize: '$4',
  color: '$red9',
  textAlign: 'center',
  lineHeight: '$6',
});

const RetryButton = styled(Button, {
  name: 'RetryButton',
  backgroundColor: '$cupBlue',
  color: 'white',
  borderRadius: '$3',
  fontWeight: '600',
  pressStyle: {
    backgroundColor: '$cupBlueDark',
    scale: 0.95,
  },
});

const LoadingContainer = styled(YStack, {
  name: 'LoadingContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$lg',
});

export type AchievementGalleryScreenProps_Styled = GetProps<typeof Container>;

const AchievementGalleryScreen: React.FC<AchievementGalleryScreenProps> = ({ hideNavBar = true }) => {
  const theme = useTheme();
  const { 
    achievements, 
    stats, 
    isLoading, 
    error, 
    refreshAchievements,
    getNextAchievement 
  } = useAchievements();
  
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const nextAchievement = getNextAchievement();

  // Filter achievements based on selected filter
  const filteredAchievements = useMemo(() => {
    let filtered = [...achievements];

    switch (selectedFilter) {
      case 'unlocked':
        filtered = filtered.filter(a => a.unlockedAt);
        break;
      case 'locked':
        filtered = filtered.filter(a => !a.unlockedAt);
        break;
      case 'all':
        break;
      default:
        filtered = filtered.filter(a => a.category === selectedFilter);
        break;
    }

    // Sort: unlocked achievements first, then by rarity, then by progress
    return filtered.sort((a, b) => {
      // Unlocked achievements first
      if (a.unlockedAt && !b.unlockedAt) return -1;
      if (!a.unlockedAt && b.unlockedAt) return 1;
      
      // Then by rarity (legendary first)
      const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
      const rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      
      // Finally by progress (higher progress first)
      return (b.progress || 0) - (a.progress || 0);
    });
  }, [achievements, selectedFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAchievements();
    } finally {
      setRefreshing(false);
    }
  };

  const renderStatsHeader = () => (
    <StatsContainer>
      <StatsGrid>
        <StatCard>
          <StatNumber>{stats.unlockedAchievements}</StatNumber>
          <StatLabel>달성 업적</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber>{stats.totalPoints}</StatNumber>
          <StatLabel>총 포인트</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber>{stats.completionPercentage}%</StatNumber>
          <StatLabel>완료율</StatLabel>
        </StatCard>
      </StatsGrid>

      {nextAchievement && (
        <NextAchievementCard>
          <NextAchievementName>🎯 다음 목표</NextAchievementName>
          <AchievementCard 
            achievement={nextAchievement}
            compact
          />
        </NextAchievementCard>
      )}
    </StatsContainer>
  );

  const renderFilterBar = () => (
    <FilterContainer>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: '$lg' }}
      >
        <XStack gap="$sm">
          {FILTER_OPTIONS.map((filter) => (
            <FilterPill
              key={filter.key}
              active={selectedFilter === filter.key}
              onPress={() => setSelectedFilter(filter.key)}
              unstyled
            >
              <XStack alignItems="center" gap="$xs">
                <FilterIcon>{filter.icon}</FilterIcon>
                <FilterText active={selectedFilter === filter.key}>
                  {filter.label}
                </FilterText>
              </XStack>
            </FilterPill>
          ))}
        </XStack>
      </ScrollView>
    </FilterContainer>
  );

  const renderAchievementsList = () => {
    if (filteredAchievements.length === 0) {
      return (
        <EmptyStateContainer>
          <EmptyStateIcon>🎯</EmptyStateIcon>
          <StatNumber>업적이 없습니다</StatNumber>
          <EmptyStateText>
            {selectedFilter === 'unlocked' 
              ? '아직 달성한 업적이 없습니다.\n커피 테이스팅을 시작해보세요!'
              : selectedFilter === 'locked'
              ? '진행 중인 업적이 없습니다.'
              : '이 카테고리에는 업적이 없습니다.'
            }
          </EmptyStateText>
        </EmptyStateContainer>
      );
    }

    return (
      <AchievementList>
        <AnimatePresence>
          {filteredAchievements.map((achievement, index) => (
            <View
              key={achievement.id}
              animation="lazy"
              enterStyle={{
                opacity: 0,
                y: 30 + (index * 10), // Staggered entrance
                scale: 0.9,
              }}
              animateOnly={['opacity', 'transform']}
            >
              <AchievementCard
                achievement={achievement}
              />
            </View>
          ))}
        </AnimatePresence>
      </AchievementList>
    );
  };

  if (isLoading) {
    return (
      <Container>
        {!hideNavBar && (
          <NavigationBar>
            <TitleContainer>
              <NavigationTitle>나의 업적</NavigationTitle>
              <BetaBadge>
                <BetaText>BETA</BetaText>
              </BetaBadge>
            </TitleContainer>
            <StatusBadge />
          </NavigationBar>
        )}
        
        <LoadingContainer>
          <Spinner size="large" color="$cupBlue" />
          <Text fontSize="$4" color="$gray11">업적을 불러오는 중...</Text>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        {!hideNavBar && (
          <NavigationBar>
            <TitleContainer>
              <NavigationTitle>나의 업적</NavigationTitle>
              <BetaBadge>
                <BetaText>BETA</BetaText>
              </BetaBadge>
            </TitleContainer>
            <StatusBadge />
          </NavigationBar>
        )}
        
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>업적을 불러올 수 없습니다</ErrorTitle>
          <ErrorText>{error}</ErrorText>
          <RetryButton onPress={handleRefresh}>
            다시 시도
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      {/* Navigation Bar */}
      {!hideNavBar && (
        <NavigationBar>
          <TitleContainer>
            <NavigationTitle>나의 업적</NavigationTitle>
            <BetaBadge>
              <BetaText>BETA</BetaText>
            </BetaBadge>
          </TitleContainer>
          <StatusBadge />
        </NavigationBar>
      )}
      
      <ScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <AnimatePresence>
          {renderStatsHeader()}
          {renderFilterBar()}
          {renderAchievementsList()}
          
          <View height="$xxxl" />
        </AnimatePresence>
      </ScrollView>
    </Container>
  );
};

export default AchievementGalleryScreen;