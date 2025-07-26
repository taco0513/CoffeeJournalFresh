import React, { useState, useEffect, useMemo} from 'react';
import { SafeAreaView, DeviceEventEmitter } from 'react-native';
import { KeyGenerator } from '../../utils/KeyGenerator';
import { DataLoadingService } from '../../services/DataLoadingService';

// 안전한 고유 키 생성 함수 - 더 강력한 중복 방지
const generateSafeKey = (prefix: string, index: number, additionalId?: string, extraContext?: string) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 12); // 더 긴 랜덤 문자열
  const processId = Math.floor(Math.random() * 10000); // 추가 프로세스 ID
  const context = extraContext ? `-${extraContext}` : '';
  const cleanAdditionalId = additionalId ? additionalId.replace(/[^a-zA-Z0-9-_]/g, '-') : 'noId';
  return `${prefix}-idx${index}-${cleanAdditionalId}-t${timestamp}-r${random}-p${processId}${context}`;
};
import {
  View,
  Text,
  ScrollView,
  Input,
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RealmService } from '../../services/realm/RealmService';
import { ITastingRecord} from '../../services/realm/schemas';
import { useUserStore } from '../../stores/useUserStore';
import { Logger } from '../../services/LoggingService';
import { SkeletonList} from '../../components/common/SkeletonLoader';

interface GroupedTastings {
  title: string;
  data: ITastingRecord[];
}

interface HistoryScreenProps {
  hideNavBar?: boolean;
  screenId?: string; // 각 인스턴스별 고유 ID
}

// Styled Components
const Container = styled(View, {
  name: 'HistoryContainer',
  flex: 1,
  backgroundColor: '$background',
});

const NavigationBar = styled(XStack, {
  name: 'HistoryNavigation',
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
  fontSize: '$5',
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
  padding: '$lg',
  paddingBottom: '$sm',
  backgroundColor: '$background',
});

const HeaderTitle = styled(Text, {
  name: 'HeaderTitle',
  fontSize: '$3',
  color: '$gray11',
});

const SearchContainer = styled(YStack, {
  name: 'SearchContainer',
  paddingHorizontal: '$lg',
  paddingBottom: '$sm',
});

const SearchBar = styled(XStack, {
  name: 'SearchBar',
  alignItems: 'center',
  backgroundColor: '$backgroundStrong',
  borderRadius: '$3',
  paddingHorizontal: '$md',
  minHeight: 44,
  borderWidth: 0.5,
  borderColor: '$borderColor',
  animation: 'quick',
  focusStyle: {
    borderColor: '$cupBlue',
    backgroundColor: '$backgroundFocus',
},
});

const SearchIcon = styled(Text, {
  name: 'SearchIcon',
  fontSize: 18,
  marginRight: '$sm',
  color: '$gray10',
});

const SearchInput = styled(Input, {
  name: 'SearchInput',
  flex: 1,
  fontSize: '$4',
  color: '$color',
  backgroundColor: 'transparent',
  borderWidth: 0,
  paddingVertical: '$sm',
});

const ClearButton = styled(Button, {
  name: 'ClearButton',
  backgroundColor: 'transparent',
  borderWidth: 0,
  padding: '$xs',
  pressStyle: {
    opacity: 0.7,
    scale: 0.95,
},
});

const ClearIcon = styled(Text, {
  name: 'ClearIcon',
  fontSize: 16,
  color: '$gray10',
});

const SortContainer = styled(XStack, {
  name: 'SortContainer',
  paddingHorizontal: '$lg',
  paddingBottom: '$sm',
  gap: '$sm',
  alignItems: 'center',
});

const SortButton = styled(Button, {
  name: 'SortButton',
  backgroundColor: '$backgroundStrong',
  borderRadius: '$6',
  paddingHorizontal: '$md',
  paddingVertical: '$sm',
  borderWidth: 1,
  borderColor: '$borderColor',
  animation: 'quick',
  variants: {
    active: {
      true: {
        backgroundColor: '$cupBlue',
        borderColor: '$cupBlue',
    },
  },
} as const,
  pressStyle: {
    scale: 0.98,
},
});

const SortButtonText = styled(Text, {
  name: 'SortButtonText',
  fontSize: '$3',
  fontWeight: '500',
  variants: {
    active: {
      true: {
        color: 'white',
    },
      false: {
        color: '$gray11',
    },
  },
} as const,
});

const AdvancedSearchButton = styled(Button, {
  name: 'AdvancedSearchButton',
  backgroundColor: 'transparent',
  borderWidth: 0,
  marginLeft: 'auto',
  paddingHorizontal: '$md',
  paddingVertical: '$sm',
  pressStyle: {
    opacity: 0.7,
    scale: 0.98,
},
});

const AdvancedSearchText = styled(Text, {
  name: 'AdvancedSearchText',
  fontSize: '$3',
  color: '$cupBlue',
  fontWeight: '500',
});

const ContentScrollView = styled(ScrollView, {
  name: 'ContentScrollView',
  flex: 1,
  showsVerticalScrollIndicator: false,
});

const SectionHeader = styled(XStack, {
  name: 'SectionHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: '$lg',
  paddingVertical: '$sm',
  backgroundColor: '$background',
});

const SectionTitle = styled(Text, {
  name: 'SectionTitle',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
});

const SectionCount = styled(Text, {
  name: 'SectionCount',
  fontSize: '$3',
  color: '$gray11',
});

const TastingCard = styled(Card, {
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

const CardHeader = styled(XStack, {
  name: 'CardHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$xs',
});

const CoffeeName = styled(Text, {
  name: 'CoffeeName',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
  flex: 1,
});

const RoasterName = styled(Text, {
  name: 'RoasterName',
  fontSize: '$3',
  fontWeight: '400',
  color: '$gray11',
  marginBottom: '$xs',
});

const DateText = styled(Text, {
  name: 'DateText',
  fontSize: '$2',
  fontWeight: '400',
  color: '$gray10',
});

const MatchScoreContainer = styled(View, {
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

const MatchScore = styled(Text, {
  name: 'MatchScore',
  fontSize: '$2',
  fontWeight: '600',
  color: 'white',
});

const EmptyContainer = styled(YStack, {
  name: 'EmptyContainer',
  alignItems: 'center',
  paddingTop: '$xxl',
  gap: '$md',
});

const EmptyIcon = styled(Text, {
  name: 'EmptyIcon',
  fontSize: 64,
});

const EmptyText = styled(Text, {
  name: 'EmptyText',
  fontSize: '$5',
  color: '$gray11',
  textAlign: 'center',
});

const EmptySubtext = styled(Text, {
  name: 'EmptySubtext',
  fontSize: '$3',
  color: '$gray10',
  textAlign: 'center',
});

export type HistoryScreenProps_Styled = GetProps<typeof Container>;

const HistoryScreen: React.FC<HistoryScreenProps> = ({ hideNavBar = true, screenId = 'default' }) => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<unknown>>();
  const { currentUser } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [allTastings, setAllTastings] = useState<ITastingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  // Consolidated data loading effect
  useEffect(() => {
    let isActive = true;
    
    const managedLoadData = async () => {
      if (!isActive) return;
      
      Logger.debug(' HistoryScreen: Loading data...', 'screen', { component: 'HistoryScreen' });
      await DataLoadingService.loadOnce(
        'history-screen-data',
        () => loadData(),
        'HistoryScreen'
      );
  };

    managedLoadData();

    // Listen for mock data creation events
    const subscription = DeviceEventEmitter.addListener('mockDataCreated', () => {
      Logger.debug(' HistoryScreen: Mock data created event received', 'screen', { component: 'HistoryScreen' });
      if (isActive) managedLoadData();
  });

    return () => {
      isActive = false;
      subscription.remove();
  };
}, []);

  // Refresh data when screen comes into focus (but only if not currently loading)
  useFocusEffect(
    React.useCallback(() => {
      if (!loading) {
        Logger.debug(' HistoryScreen: Focus triggered refresh', 'screen', { component: 'HistoryScreen' });
        loadData();
    }
  }, [loading])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      const realmService = RealmService.getInstance();
      
      if (!realmService.isInitialized) {
        Logger.debug('Realm not initialized in HistoryScreen, attempting to initialize...', 'screen', { component: 'HistoryScreen' });
        try {
          await realmService.initialize();
      } catch (initError) {
          Logger.error('Failed to initialize Realm:', 'screen', { component: 'HistoryScreen', error: initError });
      }
    }
      
      const tastings = await realmService.getTastingRecords({ isDeleted: false });
      const tastingsArray = Array.from(tastings);
      
      Logger.debug('HistoryScreen data loaded:', {
        isInitialized: realmService.isInitialized,
        recordsCount: tastingsArray.length,
        firstRecord: tastingsArray[0]?.coffeeName,
        timestamp: new Date().toISOString(),
    });
      
      setAllTastings(tastingsArray);
  } catch (error) {
      Logger.error('Failed to load data:', 'screen', { component: 'HistoryScreen', error: error });
  } finally {
      setLoading(false);
  }
};

  // Filter and group tastings
  const groupedTastings = useMemo(() => {
    try {
      Logger.debug(' Processing groupedTastings - input count:', 'screen', { component: 'HistoryScreen', data: allTastings.length });
      
      let results = allTastings.filter(tasting => {
        try {
          const isValid = tasting && tasting.id && tasting.coffeeName;
          return isValid;
      } catch (error) {
          Logger.debug(' Error during validation:', 'screen', { component: 'HistoryScreen', error: error, tasting });
          return false;
      }
    });
      
      // Remove duplicates by ID and convert to plain objects
      const seenIds = new Set();
      results = results
        .filter(tasting => {
          if (seenIds.has(tasting.id)) {
            Logger.debug(' Duplicate tasting found, removing:', 'screen', { component: 'HistoryScreen', data: tasting.id, coffeeName: tasting.coffeeName });
            return false;
        }
          seenIds.add(tasting.id);
          return true;
      })
        .map((tasting, index) => {
          try {
            return {
              ...tasting,
              id: tasting.id,
              coffeeName: tasting.coffeeName,
              roastery: tasting.roastery,
              cafeName: tasting.cafeName,
              origin: tasting.origin,
              createdAt: new Date(tasting.createdAt),
              matchScoreTotal: tasting.matchScoreTotal,
              // 추가 안정성을 위한 인덱스
              _uniqueIndex: index
          };
        } catch (error) {
            Logger.error('Error converting tasting to plain object:', 'screen', { component: 'HistoryScreen', error: error, tasting });
            return {
              ...tasting,
              _uniqueIndex: index
          };
        }
      });
      
      // Apply search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        results = results.filter(tasting => 
          tasting.coffeeName.toLowerCase().includes(query) ||
          tasting.roastery.toLowerCase().includes(query) ||
          (tasting.cafeName && tasting.cafeName.toLowerCase().includes(query)) ||
          (tasting.origin && tasting.origin.toLowerCase().includes(query))
        );
    }
      
      // Sort results
      if (sortBy === 'date') {
        results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else {
        results.sort((a, b) => b.matchScoreTotal - a.matchScoreTotal);
    }
      
      // Group by date
      const grouped: GroupedTastings[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      const todayRecords = results.filter(t => t.createdAt >= today);
      const yesterdayRecords = results.filter(t => t.createdAt >= yesterday && t.createdAt < today);
      const weekRecords = results.filter(t => t.createdAt >= weekAgo && t.createdAt < yesterday);
      const monthRecords = results.filter(t => t.createdAt >= monthAgo && t.createdAt < weekAgo);
      const olderRecords = results.filter(t => t.createdAt < monthAgo);
      
      if (todayRecords.length > 0) {
        grouped.push({ title: '오늘', data: todayRecords });
    }
      if (yesterdayRecords.length > 0) {
        grouped.push({ title: '어제', data: yesterdayRecords });
    }
      if (weekRecords.length > 0) {
        grouped.push({ title: '이번 주', data: weekRecords });
    }
      if (monthRecords.length > 0) {
        grouped.push({ title: '이번 달', data: monthRecords });
    }
      if (olderRecords.length > 0) {
        grouped.push({ title: '이전', data: olderRecords });
    }
      
      return grouped;
  } catch (error) {
      Logger.error('Error grouping tastings:', 'screen', { component: 'HistoryScreen', error: error });
      return [];
  }
}, [allTastings, searchQuery, sortBy]);

  const getScoreType = (score: number): 'high' | 'medium' | 'low' => {
    if (score >= 85) return 'high';
    if (score >= 70) return 'medium';
    return 'low';
};

  const renderTastingItem = (item: ITastingRecord) => {
    if (!item || !item.id || !item.coffeeName) {
      return null;
  }

    try {
      const formattedDate = item.createdAt ? item.createdAt.toLocaleDateString('ko-KR', { 
        month: 'long', 
        day: 'numeric' 
    }) : '날짜 없음';
      
      return (
        <TastingCard
          onPress={() => {
            navigation.navigate('TastingDetail', { 
              tastingId: item.id
          });
        }}
          pressStyle={{ scale: 0.98 }}
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
      Logger.error('Error rendering tasting item:', 'screen', { component: 'HistoryScreen', error: error, item });
      return (
        <TastingCard>
          <CoffeeName>Error loading item</CoffeeName>
          <RoasterName>ID: {item.id}</RoasterName>
        </TastingCard>
      );
  }
};

  const renderSection = (section: GroupedTastings, index: number) => {
    const sectionKey = generateSafeKey(`${screenId}-section`, index, section.title, `section-${section.data.length}`);
    
    return (
      <YStack key={sectionKey}>
        <SectionHeader>
          <SectionTitle>{section.title || 'Unknown Section'}</SectionTitle>
          <SectionCount>{section.data.length}개</SectionCount>
        </SectionHeader>
        {section.data
          .filter(item => item && (item.id || item.coffeeName))
          .map((item, itemIndex) => {
            const itemKey = generateSafeKey(`${screenId}-item`, itemIndex, item.id, `item-${item.coffeeName || 'unknown'}`);
            return (
              <React.Fragment key={itemKey}>
                <View>
                  {renderTastingItem(item)}
                </View>
              </React.Fragment>
            );
        })}
      </YStack>
    );
};

  if (loading) {
    return (
      <Container>
        <SafeAreaView style={{ flex: 1 }}>
          <NavigationBar>
            <TitleContainer>
              <NavigationTitle>테이스팅 기록</NavigationTitle>
              <BetaBadge>
                <BetaText>BETA</BetaText>
              </BetaBadge>
            </TitleContainer>
            <View width={80} />
          </NavigationBar>
          
          <LoadingContainer>
            <Spinner size="large" color="$cupBlue" />
            <LoadingText>기록을 불러오는 중...</LoadingText>
          </LoadingContainer>
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
              <NavigationTitle>테이스팅 기록</NavigationTitle>
              <BetaBadge>
                <BetaText>BETA</BetaText>
              </BetaBadge>
            </TitleContainer>
            <View width={80} />
          </NavigationBar>
        )}

        <AnimatePresence>
          {/* Header */}
          <HeaderSection
            animation="lazy"
            enterStyle={{
              opacity: 0,
              y: -20,
          }}
            animateOnly={['opacity', 'transform']}
          >
            <HeaderTitle>총 {allTastings.length}개의 기록</HeaderTitle>
          </HeaderSection>
          
          {/* Search Container */}
          <SearchContainer
            animation="lazy"
            enterStyle={{
              opacity: 0,
              y: -10,
          }}
            animateOnly={['opacity', 'transform']}
          >
            <SearchBar>
              <SearchIcon>검색</SearchIcon>
              <SearchInput
                placeholder="커피명, 로스터리, 카페로 검색..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                unstyled
              />
              {searchQuery !== '' && (
                <ClearButton unstyled onPress={() => setSearchQuery('')}>
                  <ClearIcon>X</ClearIcon>
                </ClearButton>
              )}
            </SearchBar>
          </SearchContainer>
          
          {/* Sort Container */}
          <SortContainer
            animation="lazy"
            enterStyle={{
              opacity: 0,
              y: -10,
          }}
            animateOnly={['opacity', 'transform']}
          >
            <SortButton
              active={sortBy === 'date'}
              onPress={() => setSortBy('date')}
              unstyled
            >
              <SortButtonText active={sortBy === 'date'}>
                날짜순
              </SortButtonText>
            </SortButton>
            <SortButton
              active={sortBy === 'score'}
              onPress={() => setSortBy('score')}
              unstyled
            >
              <SortButtonText active={sortBy === 'score'}>
                점수순
              </SortButtonText>
            </SortButton>
            <AdvancedSearchButton
              unstyled
              onPress={() => navigation.navigate('Search' as never)}
            >
              <AdvancedSearchText>고급 검색 →</AdvancedSearchText>
            </AdvancedSearchButton>
          </SortContainer>
        </AnimatePresence>
        
        {/* Content */}
        <ContentScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {groupedTastings.length > 0 ? (
            <YStack>
              {groupedTastings.map((section, index) => {
                const sectionKey = generateSafeKey(`${screenId}-main-section`, index, section.title, `main-${section.data.length}-items`);
                return (
                  <React.Fragment key={sectionKey}>
                    {renderSection(section, index)}
                  </React.Fragment>
                );
            })}
            </YStack>
          ) : (
            <EmptyContainer>
              <EmptyIcon>비어있음</EmptyIcon>
              <EmptyText>
                {searchQuery ? '검색 결과가 없습니다' : '아직 기록이 없습니다'}
              </EmptyText>
              <EmptySubtext>
                {searchQuery ? '다른 검색어를 시도해보세요' : '첫 테이스팅을 기록해보세요'}
              </EmptySubtext>
            </EmptyContainer>
          )}
        </ContentScrollView>
      </SafeAreaView>
    </Container>
  );
};

export default HistoryScreen;