import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SafeAreaView, DeviceEventEmitter } from 'react-native';
import { DataLoadingService } from '../../services/DataLoadingService';

// 프로필 전용 절대 고유 키 생성 함수
let uniqueKeyCounter = 0;
const generateAbsoluteUniqueKey = () => {
  uniqueKeyCounter++;
  return `profile-unique-${uniqueKeyCounter}-${Date.now()}-${Math.random().toString(36).substr(2, 12)}`;
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
import RealmService from '../../services/realm/RealmService';
import { ITastingRecord } from '../../services/realm/schemas';
import { Logger } from '../../services/LoggingService';
import { useUserStore } from '../../stores/useUserStore';

interface GroupedTastings {
  title: string;
  data: ITastingRecord[];
}

// Styled Components (Profile용으로 복사)
const ProfileContainer = styled(View, {
  name: 'ProfileHistoryContainer',
  flex: 1,
  backgroundColor: '$background',
});

const ProfileNavigationBar = styled(XStack, {
  name: 'ProfileNavigation',
  height: 44,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  backgroundColor: '$background',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
});

const ProfileTitleContainer = styled(XStack, {
  name: 'ProfileTitleContainer',
  alignItems: 'center',
  gap: '$sm',
});

const ProfileNavigationTitle = styled(Text, {
  name: 'ProfileNavigationTitle',
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
});

const ProfileBetaBadge = styled(View, {
  name: 'ProfileBetaBadge',
  backgroundColor: '$cupBlue',
  paddingHorizontal: '$sm',
  paddingVertical: '$xs',
  borderRadius: '$2',
});

const ProfileBetaText = styled(Text, {
  name: 'ProfileBetaText',
  fontSize: '$2',
  fontWeight: '700',
  color: 'white',
  letterSpacing: 0.5,
});

const ProfileLoadingContainer = styled(YStack, {
  name: 'ProfileLoadingContainer',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  gap: '$md',
});

const ProfileLoadingText = styled(Text, {
  name: 'ProfileLoadingText',
  fontSize: '$4',
  color: '$gray11',
});

const ProfileHeaderSection = styled(YStack, {
  name: 'ProfileHeaderSection',
  padding: '$lg',
  paddingBottom: '$sm',
  backgroundColor: '$background',
});

const ProfileHeaderTitle = styled(Text, {
  name: 'ProfileHeaderTitle',
  fontSize: '$3',
  color: '$gray11',
});

const ProfileSearchContainer = styled(YStack, {
  name: 'ProfileSearchContainer',
  paddingHorizontal: '$lg',
  paddingBottom: '$sm',
});

const ProfileSearchBar = styled(XStack, {
  name: 'ProfileSearchBar',
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

const ProfileSearchIcon = styled(Text, {
  name: 'ProfileSearchIcon',
  fontSize: 18,
  marginRight: '$sm',
  color: '$gray10',
});

const ProfileSearchInput = styled(Input, {
  name: 'ProfileSearchInput',
  flex: 1,
  fontSize: '$4',
  color: '$color',
  backgroundColor: 'transparent',
  borderWidth: 0,
  paddingVertical: '$sm',
});

const ProfileClearButton = styled(Button, {
  name: 'ProfileClearButton',
  backgroundColor: 'transparent',
  borderWidth: 0,
  padding: '$xs',
  pressStyle: {
    opacity: 0.7,
    scale: 0.95,
},
});

const ProfileClearIcon = styled(Text, {
  name: 'ProfileClearIcon',
  fontSize: 16,
  color: '$gray10',
});

const ProfileSortContainer = styled(XStack, {
  name: 'ProfileSortContainer',
  paddingHorizontal: '$lg',
  paddingBottom: '$sm',
  gap: '$sm',
  alignItems: 'center',
});

const ProfileSortButton = styled(Button, {
  name: 'ProfileSortButton',
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

const ProfileSortButtonText = styled(Text, {
  name: 'ProfileSortButtonText',
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

const ProfileAdvancedSearchButton = styled(Button, {
  name: 'ProfileAdvancedSearchButton',
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

const ProfileAdvancedSearchText = styled(Text, {
  name: 'ProfileAdvancedSearchText',
  fontSize: '$3',
  color: '$cupBlue',
  fontWeight: '500',
});

const ProfileContentScrollView = styled(ScrollView, {
  name: 'ProfileContentScrollView',
  flex: 1,
  showsVerticalScrollIndicator: false,
});

const ProfileSectionHeader = styled(XStack, {
  name: 'ProfileSectionHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: '$lg',
  paddingVertical: '$sm',
  backgroundColor: '$background',
});

const ProfileSectionTitle = styled(Text, {
  name: 'ProfileSectionTitle',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
});

const ProfileSectionCount = styled(Text, {
  name: 'ProfileSectionCount',
  fontSize: '$3',
  color: '$gray11',
});

const ProfileTastingCard = styled(Card, {
  name: 'ProfileTastingCard',
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

const ProfileCardHeader = styled(XStack, {
  name: 'ProfileCardHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$xs',
});

const ProfileCoffeeName = styled(Text, {
  name: 'ProfileCoffeeName',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
  flex: 1,
});

const ProfileRoasterName = styled(Text, {
  name: 'ProfileRoasterName',
  fontSize: '$3',
  fontWeight: '400',
  color: '$gray11',
  marginBottom: '$xs',
});

const ProfileDateText = styled(Text, {
  name: 'ProfileDateText',
  fontSize: '$2',
  fontWeight: '400',
  color: '$gray10',
});

const ProfileMatchScoreContainer = styled(View, {
  name: 'ProfileMatchScoreContainer',
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

const ProfileMatchScore = styled(Text, {
  name: 'ProfileMatchScore',
  fontSize: '$2',
  fontWeight: '600',
  color: 'white',
});

const ProfileEmptyContainer = styled(YStack, {
  name: 'ProfileEmptyContainer',
  alignItems: 'center',
  paddingTop: '$xxl',
  gap: '$md',
});

const ProfileEmptyIcon = styled(Text, {
  name: 'ProfileEmptyIcon',
  fontSize: 64,
});

const ProfileEmptyText = styled(Text, {
  name: 'ProfileEmptyText',
  fontSize: '$5',
  color: '$gray11',
  textAlign: 'center',
});

const ProfileEmptySubtext = styled(Text, {
  name: 'ProfileEmptySubtext',
  fontSize: '$3',
  color: '$gray10',
  textAlign: 'center',
});

const ProfileHistoryScreen: React.FC = () => {
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
      
      Logger.debug('🔄 ProfileHistoryScreen: Loading data...', 'screen', { component: 'ProfileHistoryScreen' });
      await DataLoadingService.loadOnce(
        'profile-history-screen-data',
        () => loadData(),
        'ProfileHistoryScreen'
      );
  };

    managedLoadData();

    // Listen for mock data creation events
    const subscription = DeviceEventEmitter.addListener('mockDataCreated', () => {
      Logger.debug('🔄 ProfileHistoryScreen: Mock data created event received', 'screen', { component: 'ProfileHistoryScreen' });
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
        Logger.debug('🔄 ProfileHistoryScreen: Focus triggered refresh', 'screen', { component: 'ProfileHistoryScreen' });
        loadData();
    }
  }, [loading])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      const realmService = RealmService.getInstance();
      
      if (!realmService.isInitialized) {
        Logger.debug('⚠️ Realm not initialized in ProfileHistoryScreen, attempting to initialize...', 'screen', { component: 'ProfileHistoryScreen' });
        try {
          await realmService.initialize();
      } catch (initError) {
          Logger.error('Failed to initialize Realm:', 'screen', { component: 'ProfileHistoryScreen', error: initError });
      }
    }
      
      const tastings = await realmService.getTastingRecords({ isDeleted: false });
      const tastingsArray = Array.from(tastings);
      
      Logger.debug('📊 ProfileHistoryScreen data loaded:', {
        isInitialized: realmService.isInitialized,
        recordsCount: tastingsArray.length,
        firstRecord: tastingsArray[0]?.coffeeName,
        timestamp: new Date().toISOString(),
    });
      
      setAllTastings(tastingsArray);
  } catch (error) {
      Logger.error('Failed to load data:', 'screen', { component: 'ProfileHistoryScreen', error: error });
  } finally {
      setLoading(false);
  }
};

  // Filter and group tastings
  const groupedTastings = useMemo(() => {
    try {
      Logger.debug('🔄 Processing ProfileHistory groupedTastings - input count:', 'screen', { component: 'ProfileHistoryScreen', data: allTastings.length });
      
      let results = allTastings.filter(tasting => {
        try {
          const isValid = tasting && tasting.id && tasting.coffeeName;
          return isValid;
      } catch (error) {
          Logger.debug('❌ Error during validation:', 'screen', { component: 'ProfileHistoryScreen', error: error, tasting });
          return false;
      }
    });
      
      // Remove duplicates by ID with enhanced filtering
      const seenIds = new Set();
      const uniqueResults = [];
      
      for (let i = 0; i < results.length; i++) {
        const tasting = results[i];
        if (!tasting || !tasting.id) continue;
        
        if (seenIds.has(tasting.id)) {
          Logger.debug('🔄 Duplicate tasting found, removing:', 'screen', { component: 'ProfileHistoryScreen', data: tasting.id, coffeeName: tasting.coffeeName });
          continue;
      }
        
        seenIds.add(tasting.id);
        uniqueResults.push(tasting);
    }
      
      results = uniqueResults
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
            Logger.error('❌ Error converting tasting to plain object:', 'screen', { component: 'ProfileHistoryScreen', error: error, tasting });
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
      Logger.error('Error grouping tastings:', 'screen', { component: 'ProfileHistoryScreen', error: error });
      return [];
  }
}, [allTastings, searchQuery, sortBy]);

  const getScoreType = (score: number): 'high' | 'medium' | 'low' => {
    if (score >= 85) return 'high';
    if (score >= 70) return 'medium';
    return 'low';
};

  const renderTastingItem = useCallback((item: ITastingRecord) => {
    if (!item || !item.id || !item.coffeeName) {
      return null;
  }

    try {
      const formattedDate = item.createdAt ? item.createdAt.toLocaleDateString('ko-KR', { 
        month: 'long', 
        day: 'numeric' 
    }) : '날짜 없음';
      
      return (
        <ProfileTastingCard
          onPress={() => {
            navigation.navigate('TastingDetail', { 
              tastingId: item.id
          });
        }}
          pressStyle={{ scale: 0.98 }}
        >
          <ProfileCardHeader>
            <ProfileCoffeeName>{item.coffeeName}</ProfileCoffeeName>
            <ProfileMatchScoreContainer score={getScoreType(item.matchScoreTotal || 0)}>
              <ProfileMatchScore>{item.matchScoreTotal || 0}%</ProfileMatchScore>
            </ProfileMatchScoreContainer>
          </ProfileCardHeader>
          <ProfileRoasterName>{item.roastery || 'Unknown Roastery'}</ProfileRoasterName>
          <ProfileDateText>{formattedDate}</ProfileDateText>
        </ProfileTastingCard>
      );
  } catch (error) {
      Logger.error('Error rendering tasting item:', 'screen', { component: 'ProfileHistoryScreen', error: error, item });
      return (
        <ProfileTastingCard>
          <ProfileCoffeeName>Error loading item</ProfileCoffeeName>
          <ProfileRoasterName>ID: {item.id}</ProfileRoasterName>
        </ProfileTastingCard>
      );
  }
}, [navigation]);

  const renderSection = (section: GroupedTastings, index: number) => {
    return (
      <YStack>
        <ProfileSectionHeader>
          <ProfileSectionTitle>{section.title || 'Unknown Section'}</ProfileSectionTitle>
          <ProfileSectionCount>{section.data.length}개</ProfileSectionCount>
        </ProfileSectionHeader>
{section.data
          .filter(item => item && (item.id || item.coffeeName))
          .map((item, itemIndex) => (
            <View>
              {renderTastingItem(item)}
            </View>
          ))}
      </YStack>
    );
};

  if (loading) {
    return (
      <ProfileContainer>
        <SafeAreaView style={{ flex: 1 }}>
          <ProfileNavigationBar>
            <ProfileTitleContainer>
              <ProfileNavigationTitle>테이스팅 기록</ProfileNavigationTitle>
              <ProfileBetaBadge>
                <ProfileBetaText>BETA</ProfileBetaText>
              </ProfileBetaBadge>
            </ProfileTitleContainer>
            <View width={80} />
          </ProfileNavigationBar>
          
          <ProfileLoadingContainer>
            <Spinner size="large" color="$cupBlue" />
            <ProfileLoadingText>기록을 불러오는 중...</ProfileLoadingText>
          </ProfileLoadingContainer>
        </SafeAreaView>
      </ProfileContainer>
    );
}

  return (
    <ProfileContainer>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Navigation Bar - Always shown for Profile */}
        <ProfileNavigationBar>
          <ProfileTitleContainer>
            <ProfileNavigationTitle>테이스팅 기록</ProfileNavigationTitle>
            <ProfileBetaBadge>
              <ProfileBetaText>BETA</ProfileBetaText>
            </ProfileBetaBadge>
          </ProfileTitleContainer>
          <View width={80} />
        </ProfileNavigationBar>

        <AnimatePresence>
          {/* Header */}
          <ProfileHeaderSection
            animation="lazy"
            enterStyle={{
              opacity: 0,
              y: -20,
          }}
            animateOnly={['opacity', 'transform']}
          >
            <ProfileHeaderTitle>총 {allTastings.length}개의 기록</ProfileHeaderTitle>
          </ProfileHeaderSection>
          
          {/* Search Container */}
          <ProfileSearchContainer
            animation="lazy"
            enterStyle={{
              opacity: 0,
              y: -10,
          }}
            animateOnly={['opacity', 'transform']}
          >
            <ProfileSearchBar>
              <ProfileSearchIcon>🔍</ProfileSearchIcon>
              <ProfileSearchInput
                placeholder="커피명, 로스터리, 카페로 검색..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                unstyled
              />
              {searchQuery !== '' && (
                <ProfileClearButton unstyled onPress={() => setSearchQuery('')}>
                  <ProfileClearIcon>✕</ProfileClearIcon>
                </ProfileClearButton>
              )}
            </ProfileSearchBar>
          </ProfileSearchContainer>
          
          {/* Sort Container */}
          <ProfileSortContainer
            animation="lazy"
            enterStyle={{
              opacity: 0,
              y: -10,
          }}
            animateOnly={['opacity', 'transform']}
          >
            <ProfileSortButton
              active={sortBy === 'date'}
              onPress={() => setSortBy('date')}
              unstyled
            >
              <ProfileSortButtonText active={sortBy === 'date'}>
                날짜순
              </ProfileSortButtonText>
            </ProfileSortButton>
            <ProfileSortButton
              active={sortBy === 'score'}
              onPress={() => setSortBy('score')}
              unstyled
            >
              <ProfileSortButtonText active={sortBy === 'score'}>
                점수순
              </ProfileSortButtonText>
            </ProfileSortButton>
            <ProfileAdvancedSearchButton
              unstyled
              onPress={() => navigation.navigate('Search' as never)}
            >
              <ProfileAdvancedSearchText>고급 검색 →</ProfileAdvancedSearchText>
            </ProfileAdvancedSearchButton>
          </ProfileSortContainer>
        </AnimatePresence>
        
        {/* Content */}
        <ProfileContentScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {groupedTastings.length > 0 ? (
            <YStack>
              {groupedTastings.map((section, index) => (
                <View>
                  {renderSection(section, index)}
                </View>
              ))}
            </YStack>
          ) : (
            <ProfileEmptyContainer>
              <ProfileEmptyIcon>☕️</ProfileEmptyIcon>
              <ProfileEmptyText>
                {searchQuery ? '검색 결과가 없습니다' : '아직 기록이 없습니다'}
              </ProfileEmptyText>
              <ProfileEmptySubtext>
                {searchQuery ? '다른 검색어를 시도해보세요' : '첫 테이스팅을 기록해보세요'}
              </ProfileEmptySubtext>
            </ProfileEmptyContainer>
          )}
        </ProfileContentScrollView>
      </SafeAreaView>
    </ProfileContainer>
  );
};

ProfileHistoryScreen.displayName = 'ProfileHistoryScreen';

export default React.memo(ProfileHistoryScreen);