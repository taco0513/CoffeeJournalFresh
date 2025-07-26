/**
 * CupNote - Market Intelligence Screen (Tamagui)
 * 
 * Real-time coffee industry data powered by Firecrawl
 * Demonstrates Korean + US dual-market strategy implementation
 */

import React, { useState, useEffect } from 'react';
import { SafeAreaView, RefreshControl, Alert } from 'react-native';
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
import { StackNavigationProp } from '@react-navigation/stack';
import { 
  useFirecrawlCoffeeData,
  RoasterProfile,
  MarketTrends,
  CompetitorAnalysis 
} from '../../services/FirecrawlCoffeeService';

interface MarketIntelligenceScreenProps {
  navigation: any;
}

// Styled Components
const Container = styled(View, {
  name: 'MarketIntelligenceContainer',
  flex: 1,
  backgroundColor: '$background',
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

const HeaderSection = styled(YStack, {
  name: 'HeaderSection',
  backgroundColor: '$cupBlue',
  paddingHorizontal: '$lg',
  paddingVertical: '$xl',
});

const HeaderTitle = styled(Text, {
  name: 'HeaderTitle',
  fontSize: '$8',
  fontWeight: '700',
  color: 'white',
  marginBottom: '$xs',
});

const HeaderSubtitle = styled(Text, {
  name: 'HeaderSubtitle',
  fontSize: '$4',
  color: 'rgba(255, 255, 255, 0.8)',
  marginBottom: '$lg',
});

const TabContainer = styled(XStack, {
  name: 'TabContainer',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '$3',
  padding: '$xs',
});

const Tab = styled(Button, {
  name: 'Tab',
  flex: 1,
  backgroundColor: 'transparent',
  borderWidth: 0,
  borderRadius: '$2',
  paddingVertical: '$sm',
  animation: 'quick',
  variants: {
    active: {
      true: {
        backgroundColor: 'white',
      },
    },
  } as const,
  pressStyle: {
    scale: 0.98,
  },
});

const TabText = styled(Text, {
  name: 'TabText',
  fontSize: '$4',
  fontWeight: '600',
  variants: {
    active: {
      true: {
        color: '$cupBlue',
      },
      false: {
        color: 'rgba(255, 255, 255, 0.8)',
      },
    },
  } as const,
});

const ContentSection = styled(YStack, {
  name: 'ContentSection',
  paddingHorizontal: '$lg',
  paddingVertical: '$lg',
});

const SectionTitle = styled(Text, {
  name: 'SectionTitle',
  fontSize: '$6',
  fontWeight: '700',
  color: '$color',
  marginBottom: '$md',
});

const TrendsContainer = styled(XStack, {
  name: 'TrendsContainer',
  justifyContent: 'space-between',
  gap: '$xs',
});

const TrendCard = styled(Card, {
  name: 'TrendCard',
  flex: 1,
  backgroundColor: '$backgroundStrong',
  padding: '$md',
  borderRadius: '$3',
  borderWidth: 0.5,
  borderColor: '$borderColor',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
});

const TrendLabel = styled(Text, {
  name: 'TrendLabel',
  fontSize: '$2',
  color: '$gray11',
  marginBottom: '$xs',
});

const TrendValue = styled(Text, {
  name: 'TrendValue',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
});

const RoasterCard = styled(Card, {
  name: 'RoasterCard',
  backgroundColor: '$backgroundStrong',
  padding: '$md',
  marginBottom: '$sm',
  borderRadius: '$4',
  borderWidth: 0.5,
  borderColor: '$borderColor',
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

const RoasterHeader = styled(XStack, {
  name: 'RoasterHeader',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '$sm',
});

const RoasterName = styled(Text, {
  name: 'RoasterName',
  fontSize: '$4',
  fontWeight: '700',
  color: '$color',
});

const RoasterLocation = styled(Text, {
  name: 'RoasterLocation',
  fontSize: '$2',
  color: '$gray11',
});

const RoasterDescription = styled(Text, {
  name: 'RoasterDescription',
  fontSize: '$3',
  color: '$gray11',
  marginBottom: '$sm',
  lineHeight: '$5',
});

const SpecialtyContainer = styled(XStack, {
  name: 'SpecialtyContainer',
  flexWrap: 'wrap',
  gap: '$xs',
});

const SpecialtyTag = styled(View, {
  name: 'SpecialtyTag',
  backgroundColor: '$cupBlueLight',
  paddingHorizontal: '$sm',
  paddingVertical: '$xs',
  borderRadius: '$4',
});

const SpecialtyText = styled(Text, {
  name: 'SpecialtyText',
  fontSize: '$2',
  color: '$cupBlue',
  fontWeight: '500',
});

const CompetitorCard = styled(Card, {
  name: 'CompetitorCard',
  backgroundColor: '$backgroundStrong',
  padding: '$md',
  marginBottom: '$sm',
  borderRadius: '$4',
  borderLeftWidth: 4,
  borderLeftColor: '$orange9',
  borderWidth: 0.5,
  borderColor: '$borderColor',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
});

const CompetitorHeader = styled(XStack, {
  name: 'CompetitorHeader',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '$sm',
});

const CompetitorName = styled(Text, {
  name: 'CompetitorName',
  fontSize: '$4',
  fontWeight: '700',
  color: '$color',
});

const RatingContainer = styled(YStack, {
  name: 'RatingContainer',
  alignItems: 'flex-end',
});

const RatingText = styled(Text, {
  name: 'RatingText',
  fontSize: '$3',
  color: '$orange9',
  fontWeight: '600',
});

const DownloadText = styled(Text, {
  name: 'DownloadText',
  fontSize: '$2',
  color: '$gray11',
});

const FeaturesContainer = styled(XStack, {
  name: 'FeaturesContainer',
  flexWrap: 'wrap',
  gap: '$xs',
});

const FeatureTag = styled(View, {
  name: 'FeatureTag',
  backgroundColor: '$gray4',
  paddingHorizontal: '$sm',
  paddingVertical: '$xs',
  borderRadius: '$2',
});

const FeatureText = styled(Text, {
  name: 'FeatureText',
  fontSize: '$2',
  color: '$color',
});

const ActionSection = styled(YStack, {
  name: 'ActionSection',
  paddingHorizontal: '$lg',
  paddingVertical: '$lg',
  gap: '$sm',
});

const PrimaryButton = styled(Button, {
  name: 'PrimaryButton',
  backgroundColor: '$cupBlue',
  borderRadius: '$4',
  paddingVertical: '$md',
  animation: 'quick',
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$cupBlueDark',
  },
});

const PrimaryButtonText = styled(Text, {
  name: 'PrimaryButtonText',
  fontSize: '$4',
  fontWeight: '600',
  color: 'white',
});

const SecondaryButton = styled(Button, {
  name: 'SecondaryButton',
  backgroundColor: '$backgroundStrong',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$4',
  paddingVertical: '$md',
  animation: 'quick',
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$backgroundPress',
  },
});

const SecondaryButtonText = styled(Text, {
  name: 'SecondaryButtonText',
  fontSize: '$4',
  fontWeight: '600',
  color: '$cupBlue',
});

const FooterSection = styled(YStack, {
  name: 'FooterSection',
  paddingHorizontal: '$lg',
  paddingVertical: '$xl',
  alignItems: 'center',
  gap: '$xs',
});

const FooterText = styled(Text, {
  name: 'FooterText',
  fontSize: '$3',
  color: '$cupBlue',
  fontWeight: '600',
  textAlign: 'center',
});

const LastUpdatedText = styled(Text, {
  name: 'LastUpdatedText',
  fontSize: '$2',
  color: '$gray10',
});

export type MarketIntelligenceScreenProps_Styled = GetProps<typeof Container>;

const MarketIntelligenceScreen: React.FC<MarketIntelligenceScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  
  // State management
  const [activeTab, setActiveTab] = useState<'korea' | 'us'>('korea');
  const [koreanRoasters, setKoreanRoasters] = useState<RoasterProfile[]>([]);
  const [usRoasters, setUSRoasters] = useState<RoasterProfile[]>([]);
  const [koreanTrends, setKoreanTrends] = useState<MarketTrends | null>(null);
  const [usTrends, setUSTrends] = useState<MarketTrends | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Firecrawl service hook
  const { 
    getKoreanRoasters, 
    getUSRoasters, 
    getMarketTrends, 
    getCompetitors,
    getEducationalContent 
  } = useFirecrawlCoffeeData();

  // Load initial data
  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      
      // Load data in parallel for better performance
      const [
        koreanRoastersData,
        usRoastersData,
        koreanTrendsData,
        usTrendsData,
        competitorsData
      ] = await Promise.all([
        getKoreanRoasters(),
        getUSRoasters(),
        getMarketTrends('korea'),
        getMarketTrends('us'),
        getCompetitors()
      ]);

      setKoreanRoasters(koreanRoastersData);
      setUSRoasters(usRoastersData);
      setKoreanTrends(koreanTrendsData);
      setUSTrends(usTrendsData);
      setCompetitors(competitorsData);

    } catch (error) {
      console.error('Error loading market data:', error);
      Alert.alert(
        'Data Load Error',
        'Failed to load market intelligence data. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMarketData();
    setRefreshing(false);
  };

  const currentTrends = activeTab === 'korea' ? koreanTrends : usTrends;
  const currentRoasters = activeTab === 'korea' ? koreanRoasters : usRoasters;

  const renderHeader = () => (
    <HeaderSection
      animation="lazy"
      enterStyle={{
        opacity: 0,
        y: -30,
      }}
      animateOnly={['opacity', 'transform']}
    >
      <HeaderTitle>☕ CupNote 시장 분석</HeaderTitle>
      <HeaderSubtitle>실시간 커피 업계 동향</HeaderSubtitle>
      
      {/* Market Toggle */}
      <TabContainer>
        <Tab
          active={activeTab === 'korea'}
          unstyled
          onPress={() => setActiveTab('korea')}
        >
          <TabText active={activeTab === 'korea'}>
            🇰🇷 한국 시장
          </TabText>
        </Tab>
        <Tab
          active={activeTab === 'us'}
          unstyled
          onPress={() => setActiveTab('us')}
        >
          <TabText active={activeTab === 'us'}>
            🇺🇸 미국 시장
          </TabText>
        </Tab>
      </TabContainer>
    </HeaderSection>
  );

  const renderMarketTrends = () => {
    if (!currentTrends) return null;

    return (
      <ContentSection
        animation="lazy"
        enterStyle={{
          opacity: 0,
          y: 20,
        }}
        animateOnly={['opacity', 'transform']}
      >
        <SectionTitle>📊 시장 트렌드</SectionTitle>
        
        <TrendsContainer>
          <TrendCard>
            <TrendLabel>인기 맛</TrendLabel>
            <TrendValue numberOfLines={2}>
              {currentTrends.trendingFlavors.slice(0, 3).join(', ')}
            </TrendValue>
          </TrendCard>
          
          <TrendCard>
            <TrendLabel>인기 원산지</TrendLabel>
            <TrendValue numberOfLines={2}>
              {currentTrends.popularOrigins.slice(0, 2).join(', ')}
            </TrendValue>
          </TrendCard>
          
          <TrendCard>
            <TrendLabel>가격대</TrendLabel>
            <TrendValue numberOfLines={2}>
              {currentTrends.priceRange.min}-{currentTrends.priceRange.max} {currentTrends.priceRange.currency}
            </TrendValue>
          </TrendCard>
        </TrendsContainer>
      </ContentSection>
    );
  };

  const renderRoasterProfiles = () => (
    <ContentSection
      animation="lazy"
      enterStyle={{
        opacity: 0,
        y: 20,
      }}
      animateOnly={['opacity', 'transform']}
    >
      <SectionTitle>🏪 주요 로스터리</SectionTitle>
      
      <AnimatePresence>
        {currentRoasters.map((roaster, index) => (
          <RoasterCard
            key={roaster.id}
            animation="lazy"
            enterStyle={{
              opacity: 0,
              scale: 0.95,
              y: 20 + (index * 5),
            }}
            animateOnly={['opacity', 'transform']}
            pressStyle={{ scale: 0.98 }}
            onPress={() => {
              // Handle roaster selection if needed
            }}
          >
            <RoasterHeader>
              <RoasterName numberOfLines={1}>
                {activeTab === 'korea' && roaster.nameKorean ? roaster.nameKorean : roaster.name}
              </RoasterName>
              <RoasterLocation>{roaster.location}</RoasterLocation>
            </RoasterHeader>
            
            <RoasterDescription numberOfLines={2}>
              {roaster.description}
            </RoasterDescription>
            
            <SpecialtyContainer>
              {roaster.specialty.slice(0, 3).map((spec, idx) => (
                <SpecialtyTag key={idx}>
                  <SpecialtyText>{spec}</SpecialtyText>
                </SpecialtyTag>
              ))}
            </SpecialtyContainer>
          </RoasterCard>
        ))}
      </AnimatePresence>
    </ContentSection>
  );

  const renderCompetitorAnalysis = () => (
    <ContentSection
      animation="lazy"
      enterStyle={{
        opacity: 0,
        y: 20,
      }}
      animateOnly={['opacity', 'transform']}
    >
      <SectionTitle>🎯 경쟁사 분석</SectionTitle>
      
      <AnimatePresence>
        {competitors.map((competitor, index) => (
          <CompetitorCard
            key={index}
            animation="lazy"
            enterStyle={{
              opacity: 0,
              scale: 0.95,
              y: 20 + (index * 5),
            }}
            animateOnly={['opacity', 'transform']}
          >
            <CompetitorHeader>
              <CompetitorName>{competitor.appName}</CompetitorName>
              <RatingContainer>
                <RatingText>⭐ {competitor.userRating}</RatingText>
                {competitor.downloadCount && (
                  <DownloadText>{competitor.downloadCount} 다운로드</DownloadText>
                )}
              </RatingContainer>
            </CompetitorHeader>
            
            <FeaturesContainer>
              {competitor.features.slice(0, 4).map((feature, idx) => (
                <FeatureTag key={idx}>
                  <FeatureText>{feature}</FeatureText>
                </FeatureTag>
              ))}
            </FeaturesContainer>
          </CompetitorCard>
        ))}
      </AnimatePresence>
    </ContentSection>
  );

  const renderActionButtons = () => (
    <ActionSection
      animation="lazy"
      enterStyle={{
        opacity: 0,
        y: 20,
      }}
      animateOnly={['opacity', 'transform']}
    >
      <PrimaryButton
        unstyled
        onPress={() => {
          Alert.alert(
            'Firecrawl 실시간 업데이트',
            '최신 데이터를 수집하고 있습니다...\n\n• 로스터리 신제품 정보\n• 가격 변동 추적\n• 트렌드 분석\n• 경쟁사 모니터링'
          );
        }}
      >
        <PrimaryButtonText>🔄 실시간 업데이트</PrimaryButtonText>
      </PrimaryButton>
      
      <SecondaryButton
        unstyled
        onPress={() => {
          navigation.navigate('DeveloperScreen');
        }}
      >
        <SecondaryButtonText>⚙️ 개발자 도구</SecondaryButtonText>
      </SecondaryButton>
    </ActionSection>
  );

  if (loading) {
    return (
      <Container>
        <SafeAreaView style={{ flex: 1 }}>
          <LoadingContainer>
            <Spinner size="large" color="$cupBlue" />
            <LoadingText>Firecrawl로 데이터 수집 중...</LoadingText>
          </LoadingContainer>
        </SafeAreaView>
      </Container>
    );
  }

  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <AnimatePresence>
            {renderHeader()}
            {renderMarketTrends()}
            {renderRoasterProfiles()}
            {renderCompetitorAnalysis()}
            {renderActionButtons()}
            
            <FooterSection
              animation="lazy"
              enterStyle={{
                opacity: 0,
                y: 20,
              }}
              animateOnly={['opacity', 'transform']}
            >
              <FooterText>
                🔥 Powered by Firecrawl MCP | 실시간 웹 데이터 수집
              </FooterText>
              <LastUpdatedText>
                마지막 업데이트: {new Date().toLocaleString('ko-KR')}
              </LastUpdatedText>
            </FooterSection>
          </AnimatePresence>
        </ScrollView>
      </SafeAreaView>
    </Container>
  );
};

export default MarketIntelligenceScreen;