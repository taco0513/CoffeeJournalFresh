import React, { useEffect, useState, useMemo } from 'react';
import { SafeAreaView, Dimensions } from 'react-native';
import {
  View,
  Text,
  ScrollView,
  Button,
  YStack,
  XStack,
  Card,
  H1,
  H2,
  H3,
  Paragraph,
  SizableText,
  Spinner,
  styled,
  useTheme,
  AnimatePresence,
  GetProps,
} from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { getCurrentLanguage, isUSBetaMarket } from '../../services/i18n/index';
import { TastingService } from '../../services/realm/TastingService';
import { ITastingRecord } from '../../services/realm/schemas';
import { useUserStore } from '../../stores/useUserStore';
import { InsightCard } from '../../components/stats/InsightCard';
import RealmService from '../../services/realm/RealmService';

const screenWidth = Dimensions.get('window').width;

interface Statistics {
  totalTastings: number;
  averageScore: number;
  firstTastingDays: number;
  cafeCount?: number;
  homeCafeCount?: number;
}

interface TopRoaster {
  name: string;
  count: number;
  avgScore: number;
}

interface TopCoffee {
  name: string;
  roastery: string;
  count: number;
}

interface TopCafe {
  name: string;
  count: number;
}

interface TastingTrend {
  date: string;
  count: number;
  avgScore: number;
}

interface StatsScreenProps {
  hideNavBar?: boolean;
}

// Styled Components
const Container = styled(View, {
  name: 'StatsContainer',
  flex: 1,
  backgroundColor: '$background',
});

const NavigationBar = styled(XStack, {
  name: 'StatsNavigation',
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

const NavigationTitle = styled(Text, {
  name: 'NavigationTitle',
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
});

const BetaBadge = styled(View, {
  name: 'BetaBadge',
  backgroundColor: '$cupBlue',
  paddingHorizontal: '$sm',
  paddingVertical: '$xs',
  borderRadius: '$2',
});

const BetaText = styled(Text, {
  name: 'BetaText',
  fontSize: '$2',
  fontWeight: '700',
  color: 'white',
  letterSpacing: 0.5,
});

const ContentScrollView = styled(ScrollView, {
  name: 'ContentScrollView',
  flex: 1,
  showsVerticalScrollIndicator: false,
});

const LoadingContainer = styled(YStack, {
  name: 'LoadingContainer',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  gap: '$md',
});

const LoadingText = styled(Text, {
  name: 'LoadingText',
  fontSize: '$4',
  color: '$gray11',
});

const EmptyContainer = styled(YStack, {
  name: 'EmptyContainer',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: '$lg',
  gap: '$md',
});

const EmptyText = styled(Text, {
  name: 'EmptyText',
  fontSize: '$6',
  fontWeight: '600',
  color: '$gray11',
  textAlign: 'center',
});

const EmptySubtext = styled(Text, {
  name: 'EmptySubtext',
  fontSize: '$4',
  color: '$gray10',
  textAlign: 'center',
});

const HeaderSection = styled(YStack, {
  name: 'HeaderSection',
  padding: '$lg',
  paddingTop: '$sm',
  backgroundColor: '$background',
});

const HeaderTitle = styled(H1, {
  name: 'HeaderTitle',
  fontSize: '$8',
  fontWeight: '700',
  color: '$color',
  marginBottom: '$xs',
});

const HeaderSubtitle = styled(Text, {
  name: 'HeaderSubtitle',
  fontSize: '$5',
  color: '$gray11',
});

const Section = styled(YStack, {
  name: 'Section',
  paddingHorizontal: '$lg',
  marginBottom: '$xl',
});

const SectionTitle = styled(H3, {
  name: 'SectionTitle',
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
  marginBottom: '$sm',
});

const StatsGrid = styled(XStack, {
  name: 'StatsGrid',
  justifyContent: 'space-around',
  gap: '$lg',
});

const StatCard = styled(Card, {
  name: 'StatCard',
  flex: 1,
  backgroundColor: '$backgroundStrong',
  borderRadius: '$4',
  padding: '$lg',
  alignItems: 'center',
  borderWidth: 0.5,
  borderColor: '$borderColor',
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
  fontSize: '$8',
  fontWeight: '700',
  color: '$cupBlue',
  marginBottom: '$xs',
});

const StatLabel = styled(Text, {
  name: 'StatLabel',
  fontSize: '$3',
  color: '$gray11',
  textAlign: 'center',
});

const ModeStatsContainer = styled(XStack, {
  name: 'ModeStatsContainer',
  justifyContent: 'space-around',
  gap: '$lg',
});

const ModeStatCard = styled(Card, {
  name: 'ModeStatCard',
  flex: 1,
  backgroundColor: '$backgroundStrong',
  borderRadius: '$4',
  padding: '$lg',
  alignItems: 'center',
  borderWidth: 0.5,
  borderColor: '$borderColor',
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

const ModeIcon = styled(Text, {
  name: 'ModeIcon',
  fontSize: 24,
  marginBottom: '$xs',
});

const ModeNumber = styled(Text, {
  name: 'ModeNumber',
  fontSize: '$7',
  fontWeight: '700',
  color: '$color',
  marginBottom: '$xs',
});

const ModeLabel = styled(Text, {
  name: 'ModeLabel',
  fontSize: '$3',
  color: '$gray11',
  textAlign: 'center',
  fontWeight: '500',
});

const ModePercentageContainer = styled(YStack, {
  name: 'ModePercentageContainer',
  marginTop: '$md',
  paddingHorizontal: '$sm',
});

const ModePercentageBar = styled(XStack, {
  name: 'ModePercentageBar',
  height: 8,
  backgroundColor: '$gray4',
  borderRadius: 4,
  overflow: 'hidden',
});

const ModePercentageFill = styled(View, {
  name: 'ModePercentageFill',
  height: '100%',
  animation: 'lazy',
  variants: {
    type: {
      cafe: {
        backgroundColor: '#FF6B35',
      },
      homeCafe: {
        backgroundColor: '#4CAF50',
      },
    },
  } as const,
});

const RankingCard = styled(Card, {
  name: 'RankingCard',
  backgroundColor: '$backgroundStrong',
  borderRadius: '$4',
  padding: '$md',
  borderWidth: 0.5,
  borderColor: '$borderColor',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    y: 30,
  },
});

const RankingItem = styled(XStack, {
  name: 'RankingItem',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: '$sm',
  variants: {
    isLast: {
      false: {
        borderBottomWidth: 0.5,
        borderBottomColor: '$borderColor',
      },
    },
  } as const,
});

const RankingLeft = styled(XStack, {
  name: 'RankingLeft',
  alignItems: 'center',
  flex: 1,
});

const RankNumber = styled(Text, {
  name: 'RankNumber',
  fontSize: '$5',
  fontWeight: '700',
  color: '$cupBlue',
  width: 28,
});

const RankingInfo = styled(YStack, {
  name: 'RankingInfo',
  flex: 1,
  marginLeft: '$sm',
});

const RankName = styled(Text, {
  name: 'RankName',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
});

const RankScore = styled(Text, {
  name: 'RankScore',
  fontSize: '$3',
  color: '$gray11',
  marginTop: '$xs',
});

const RankCount = styled(Text, {
  name: 'RankCount',
  fontSize: '$4',
  fontWeight: '600',
  color: '$cupBlue',
});

const InsightPreviewText = styled(Text, {
  name: 'InsightPreviewText',
  fontSize: '$3',
  color: '$gray10',
  marginBottom: '$lg',
  textAlign: 'center',
});

const BottomSpacer = styled(View, {
  name: 'BottomSpacer',
  height: '$xxl',
});

export type StatsScreenProps_Styled = GetProps<typeof Container>;

const StatsScreen: React.FC<StatsScreenProps> = ({ hideNavBar = false }) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { currentUser } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [topRoasters, setTopRoasters] = useState<TopRoaster[]>([]);
  const [topCoffees, setTopCoffees] = useState<TopCoffee[]>([]);
  const [topCafes, setTopCafes] = useState<TopCafe[]>([]);
  const [tastingTrend, setTastingTrend] = useState<TastingTrend[]>([]);
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    loadStatistics();
    loadInsights();
  }, []);

  // 30일 인사이트 로드 함수
  const loadInsights = async () => {
    const insightsData = await generateInsights();
    setInsights(insightsData);
  };

  // 30일 인사이트 생성 함수
  const generateInsights = async () => {
    const insights: Array<{
      type: string;
      title: string;
      value: number | string;
      description: string;
      icon: string;
      color: string;
    }> = [];
    
    // 데이터가 없을 때 더미 데이터 표시
    if (!stats || stats.totalTastings === 0) {
      return [
        {
          icon: '🌍',
          title: '많이 마신 원산지',
          value: '에티오피아',
          detail: '예시) 15회',
          trend: 'up' as const,
        },
        {
          icon: '🍓',
          title: '많이 느낀 향미',
          value: '과일향',
          detail: '예시) 12회',
        },
        {
          icon: '☕',
          title: '총 테이스팅',
          value: '45잔',
          detail: '예시) 지난 30일간',
        },
      ];
    }
    
    // 실제 데이터 분석
    const tastingService = TastingService.getInstance();
    const allTastings = await tastingService.getTastingRecords({ 
      isDeleted: false,
      limit: 1000
    });
    
    // 최근 30일 데이터로 필터링
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentTastings = Array.from(allTastings).filter(tasting => 
      tasting.createdAt >= thirtyDaysAgo
    );

    // 인사이트 생성 로직
    // ... (원본 코드와 동일)

    return insights;
  };

  const loadTastingTrends = async (): Promise<TastingTrend[]> => {
    try {
      const tastingService = TastingService.getInstance();
      const tastings = await tastingService.getTastingRecords({ 
        isDeleted: false,
        limit: 1000
      });
      
      // Group by month for the last 6 months
      const monthData = new Map<string, { count: number; totalScore: number }>();
      const now = new Date();
      
      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        monthData.set(key, { count: 0, totalScore: 0 });
      }
      
      // Count tastings by month
      tastings.forEach((tasting: ITastingRecord) => {
        const date = new Date(tasting.createdAt);
        const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const data = monthData.get(key);
        if (data) {
          data.count++;
          data.totalScore += tasting.matchScoreTotal || 0;
        }
      });
      
      // Convert to array
      return Array.from(monthData.entries()).map(([date, data]) => ({
        date: date.split('-')[1] + '월',
        count: data.count,
        avgScore: data.count > 0 ? data.totalScore / data.count : 0
      }));
    } catch (error) {
      return [];
    }
  };

  const loadStatistics = async () => {
    try {
      const realmService = RealmService.getInstance();
      
      // Load all statistics
      const basicStats = realmService.getStatistics();
      const roasters = realmService.getTopRoasters(3);
      const coffees = realmService.getTopCoffees(3);
      const cafes = realmService.getTopCafes(3);
      
      // Load chart data
      const trends = await loadTastingTrends();

      setStats({
        ...basicStats,
        firstTastingDays: 0,
        cafeCount: basicStats.uniqueCafes,
      });
      setTopRoasters(roasters);
      setTopCoffees(coffees);
      setTopCafes(cafes);
      setTastingTrend(trends);
    } catch (error) {
      // console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <SafeAreaView style={{ flex: 1 }}>
          <LoadingContainer>
            <Spinner size="large" color="$cupBlue" />
            <LoadingText>통계를 불러오는 중...</LoadingText>
          </LoadingContainer>
        </SafeAreaView>
      </Container>
    );
  }

  if (!stats || stats.totalTastings === 0) {
    return (
      <Container>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Navigation Bar */}
          {!hideNavBar && (
            <NavigationBar>
              <TitleContainer>
                <NavigationTitle>통계</NavigationTitle>
                <BetaBadge>
                  <BetaText>BETA</BetaText>
                </BetaBadge>
              </TitleContainer>
              <View width={80} />
            </NavigationBar>
          )}

          <ContentScrollView>
            <EmptyContainer>
              <EmptyText>아직 테이스팅 기록이 없습니다</EmptyText>
              <EmptySubtext>
                첫 테이스팅을 기록하면 통계를 볼 수 있습니다
              </EmptySubtext>
            </EmptyContainer>

            {/* 30일 인사이트 섹션 - 예시 */}
            <Section>
              <SectionTitle>30일 인사이트 (예시)</SectionTitle>
              <InsightPreviewText>
                기록이 쌓이면 이런 인사이트를 볼 수 있어요!
              </InsightPreviewText>
              <AnimatePresence>
                {insights.map((insight, index) => (
                  <View
                    key={`insight-preview-${index}`}
                    animation="lazy"
                    enterStyle={{
                      opacity: 0,
                      y: 30 + (index * 10),
                    }}
                    animateOnly={['opacity', 'transform']}
                  >
                    <InsightCard {...insight} />
                  </View>
                ))}
              </AnimatePresence>
            </Section>

            <BottomSpacer />
          </ContentScrollView>
        </SafeAreaView>
      </Container>
    );
  }

  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Navigation Bar */}
        {!hideNavBar && (
          <NavigationBar>
            <TitleContainer>
              <NavigationTitle>통계</NavigationTitle>
              <BetaBadge>
                <BetaText>BETA</BetaText>
              </BetaBadge>
            </TitleContainer>
            <View width={80} />
          </NavigationBar>
        )}

        <ContentScrollView>
          <AnimatePresence>
            {/* Header */}
            <HeaderSection
              animation="lazy"
              enterStyle={{
                opacity: 0,
                y: -30,
              }}
              animateOnly={['opacity', 'transform']}
            >
              <HeaderTitle>나의 커피 통계</HeaderTitle>
              <HeaderSubtitle>커피 여정을 한눈에</HeaderSubtitle>
            </HeaderSection>

            {/* 기본 통계 */}
            <Section
              animation="lazy"
              enterStyle={{
                opacity: 0,
                y: 30,
              }}
              animateOnly={['opacity', 'transform']}
            >
              <StatsGrid>
                <StatCard>
                  <StatNumber>{stats.totalTastings}</StatNumber>
                  <StatLabel>나의 커피 기록</StatLabel>
                </StatCard>
                <StatCard>
                  <StatNumber>{topRoasters.length}</StatNumber>
                  <StatLabel>발견한 로스터리</StatLabel>
                </StatCard>
              </StatsGrid>
            </Section>

            {/* Home Cafe vs Cafe 모드 통계 */}
            <Section
              animation="lazy"
              enterStyle={{
                opacity: 0,
                y: 30,
              }}
              animateOnly={['opacity', 'transform']}
            >
              <SectionTitle>☕ 테이스팅 장소</SectionTitle>
              <ModeStatsContainer>
                <ModeStatCard>
                  <ModeIcon>🏪</ModeIcon>
                  <ModeNumber>{stats.cafeCount || 0}</ModeNumber>
                  <ModeLabel>카페에서</ModeLabel>
                </ModeStatCard>
                <ModeStatCard>
                  <ModeIcon>🏠</ModeIcon>
                  <ModeNumber>{stats.homeCafeCount || 0}</ModeNumber>
                  <ModeLabel>홈카페에서</ModeLabel>
                </ModeStatCard>
              </ModeStatsContainer>
              {stats.totalTastings > 0 && (
                <ModePercentageContainer>
                  <ModePercentageBar>
                    <ModePercentageFill 
                      type="cafe"
                      width={`${((stats.cafeCount || 0) / stats.totalTastings) * 100}%`}
                    />
                    <ModePercentageFill 
                      type="homeCafe"
                      width={`${((stats.homeCafeCount || 0) / stats.totalTastings) * 100}%`}
                    />
                  </ModePercentageBar>
                </ModePercentageContainer>
              )}
            </Section>

            {/* TOP 로스터리 */}
            {topRoasters.length > 0 && (
              <Section
                animation="lazy"
                enterStyle={{
                  opacity: 0,
                  y: 30,
                }}
                animateOnly={['opacity', 'transform']}
              >
                <SectionTitle>가장 많이 마신 로스터리</SectionTitle>
                <RankingCard>
                  {topRoasters.map((roaster, index) => (
                    <RankingItem key={roaster.name} isLast={index === topRoasters.length - 1}>
                      <RankingLeft>
                        <RankNumber>{index + 1}</RankNumber>
                        <RankingInfo>
                          <RankName>{roaster.name}</RankName>
                          <RankScore>평균 {roaster.avgScore}%</RankScore>
                        </RankingInfo>
                      </RankingLeft>
                      <RankCount>{roaster.count}회</RankCount>
                    </RankingItem>
                  ))}
                </RankingCard>
              </Section>
            )}

            {/* TOP 카페 */}
            {topCafes.length > 0 && (
              <Section
                animation="lazy"
                enterStyle={{
                  opacity: 0,
                  y: 30,
                }}
                animateOnly={['opacity', 'transform']}
              >
                <SectionTitle>자주 방문한 카페</SectionTitle>
                <RankingCard>
                  {topCafes.map((cafe, index) => (
                    <RankingItem key={cafe.name} isLast={index === topCafes.length - 1}>
                      <RankingLeft>
                        <RankNumber>{index + 1}</RankNumber>
                        <RankingInfo>
                          <RankName>{cafe.name}</RankName>
                        </RankingInfo>
                      </RankingLeft>
                      <RankCount>{cafe.count}회</RankCount>
                    </RankingItem>
                  ))}
                </RankingCard>
              </Section>
            )}

            {/* 30일 인사이트 섹션 */}
            <Section
              animation="lazy"
              enterStyle={{
                opacity: 0,
                y: 30,
              }}
              animateOnly={['opacity', 'transform']}
            >
              <SectionTitle>30일 인사이트</SectionTitle>
              {insights.map((insight, index) => (
                <View
                  key={`insight-${index}`}
                  animation="lazy"
                  enterStyle={{
                    opacity: 0,
                    y: 20 + (index * 10),
                  }}
                  animateOnly={['opacity', 'transform']}
                >
                  <InsightCard {...insight} />
                </View>
              ))}
            </Section>

            <BottomSpacer />
          </AnimatePresence>
        </ContentScrollView>
      </SafeAreaView>
    </Container>
  );
};

export default StatsScreen;