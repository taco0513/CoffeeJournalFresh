import React, { useState, useEffect, useMemo } from 'react';
import { FlatList, SafeAreaView } from 'react-native';
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
  Sheet,
  styled,
  useTheme,
  AnimatePresence,
  GetProps,
} from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import RealmService from '../../services/realm/RealmService';
import { ITastingRecord } from '../../services/realm/schemas';

interface FilterOptions {
  roastery?: string;
  cafeName?: string;
  minScore?: number;
  maxScore?: number;
  startDate?: Date;
  endDate?: Date;
  flavorNotes?: string[];
}

// Styled Components
const Container = styled(View, {
  name: 'SearchContainer',
  flex: 1,
  backgroundColor: '$background',
});

const HeaderSection = styled(YStack, {
  name: 'HeaderSection',
  padding: '$lg',
  paddingTop: '$sm',
  backgroundColor: '$background',
});

const HeaderTitle = styled(H2, {
  name: 'HeaderTitle',
  fontSize: '$8',
  fontWeight: '700',
  color: '$color',
});

const SearchContainer = styled(XStack, {
  name: 'SearchContainer',
  paddingHorizontal: '$lg',
  paddingBottom: '$sm',
  gap: '$sm',
  alignItems: 'center',
});

const SearchBar = styled(XStack, {
  name: 'SearchBar',
  flex: 1,
  alignItems: 'center',
  backgroundColor: '$background',
  borderRadius: '$3',
  paddingHorizontal: '$md',
  borderWidth: 1,
  borderColor: '$borderColor',
  minHeight: 44,
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  animation: 'quick',
  focusStyle: {
    borderColor: '$cupBlue',
    backgroundColor: '$backgroundFocus',
    shadowOpacity: 0.2,
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

const FilterButton = styled(Button, {
  name: 'FilterButton',
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderWidth: 1,
  borderRadius: '$3',
  padding: '$md',
  position: 'relative',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  animation: 'quick',
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$backgroundPress',
  },
});

const FilterIcon = styled(Text, {
  name: 'FilterIcon',
  fontSize: 20,
});

const FilterBadge = styled(View, {
  name: 'FilterBadge',
  position: 'absolute',
  top: 4,
  right: 4,
  backgroundColor: '$cupBlue',
  borderRadius: '$2',
  width: 20,
  height: 20,
  alignItems: 'center',
  justifyContent: 'center',
});

const FilterBadgeText = styled(Text, {
  name: 'FilterBadgeText',
  color: 'white',
  fontSize: '$2',
  fontWeight: '600',
});

const ClearFiltersContainer = styled(XStack, {
  name: 'ClearFiltersContainer',
  paddingHorizontal: '$lg',
  paddingBottom: '$sm',
});

const ClearFiltersButton = styled(Button, {
  name: 'ClearFiltersButton',
  backgroundColor: 'transparent',
  borderWidth: 0,
  pressStyle: {
    opacity: 0.7,
    scale: 0.98,
  },
});

const ClearFiltersText = styled(Text, {
  name: 'ClearFiltersText',
  color: '$cupBlue',
  fontSize: '$3',
  fontWeight: '500',
});

const LoadingContainer = styled(YStack, {
  name: 'LoadingContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$md',
});

const LoadingText = styled(Text, {
  name: 'LoadingText',
  fontSize: '$4',
  color: '$color',
});

const TastingCard = styled(Card, {
  name: 'TastingCard',
  backgroundColor: '$background',
  borderRadius: '$3',
  padding: '$md',
  marginHorizontal: '$lg',
  marginBottom: '$sm',
  borderWidth: 1,
  borderColor: '$borderColor',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
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
  alignItems: 'flex-start',
  marginBottom: '$xs',
});

const CardInfo = styled(YStack, {
  name: 'CardInfo',
  flex: 1,
  marginRight: '$sm',
});

const CoffeeName = styled(Text, {
  name: 'CoffeeName',
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
  marginBottom: '$xs',
});

const RoasteryName = styled(Text, {
  name: 'RoasteryName',
  fontSize: '$3',
  color: '$gray11',
});

const ScoreText = styled(Text, {
  name: 'ScoreText',
  fontSize: '$7',
  fontWeight: '700',
  color: '$cupBlue',
});

const CardDetails = styled(XStack, {
  name: 'CardDetails',
  gap: '$md',
  marginBottom: '$sm',
});

const DetailItem = styled(Text, {
  name: 'DetailItem',
  fontSize: '$3',
  color: '$gray11',
});

const FlavorContainer = styled(XStack, {
  name: 'FlavorContainer',
  flexWrap: 'wrap',
  gap: '$xs',
  alignItems: 'center',
});

const FlavorChip = styled(View, {
  name: 'FlavorChip',
  backgroundColor: '$backgroundStrong',
  paddingHorizontal: '$sm',
  paddingVertical: '$xs',
  borderRadius: '$2',
});

const FlavorText = styled(Text, {
  name: 'FlavorText',
  fontSize: '$2',
  color: '$gray11',
});

const FlavorCount = styled(Text, {
  name: 'FlavorCount',
  fontSize: '$2',
  color: '$gray11',
  marginLeft: '$xs',
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

// Filter Modal Components
const FilterSheetOverlay = styled(Sheet.Overlay, {
  name: 'FilterSheetOverlay',
  animation: 'lazy',
  enterStyle: { opacity: 0 },
  exitStyle: { opacity: 0 },
});

const FilterSheetFrame = styled(Sheet.Frame, {
  name: 'FilterSheetFrame',
  backgroundColor: '$background',
  borderTopLeftRadius: '$4',
  borderTopRightRadius: '$4',
});

const FilterHeader = styled(XStack, {
  name: 'FilterHeader',
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
});

const FilterTitle = styled(H3, {
  name: 'FilterTitle',
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
});

const FilterCloseButton = styled(Button, {
  name: 'FilterCloseButton',
  backgroundColor: 'transparent',
  borderWidth: 0,
  padding: '$sm',
  pressStyle: {
    opacity: 0.7,
    scale: 0.95,
  },
});

const FilterCloseIcon = styled(Text, {
  name: 'FilterCloseIcon',
  fontSize: 20,
  color: '$gray11',
});

const FilterContent = styled(ScrollView, {
  name: 'FilterContent',
  padding: '$lg',
  showsVerticalScrollIndicator: false,
});

const FilterSection = styled(YStack, {
  name: 'FilterSection',
  marginBottom: '$xl',
});

const FilterSectionTitle = styled(Text, {
  name: 'FilterSectionTitle',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
  marginBottom: '$sm',
});

const FilterChipContainer = styled(XStack, {
  name: 'FilterChipContainer',
  flexWrap: 'wrap',
  gap: '$xs',
});

const FilterChip = styled(Button, {
  name: 'FilterChip',
  borderRadius: '$6',
  paddingHorizontal: '$sm',
  paddingVertical: '$xs',
  borderWidth: 1,
  animation: 'quick',
  variants: {
    active: {
      true: {
        backgroundColor: '$cupBlue',
        borderColor: '$cupBlue',
      },
      false: {
        backgroundColor: '$backgroundStrong',
        borderColor: '$borderColor',
      },
    },
  } as const,
  pressStyle: {
    scale: 0.98,
  },
});

const FilterChipText = styled(Text, {
  name: 'FilterChipText',
  fontSize: '$3',
  variants: {
    active: {
      true: {
        color: 'white',
        fontWeight: '500',
      },
      false: {
        color: '$gray11',
        fontWeight: '400',
      },
    },
  } as const,
});

const ScoreRangeContainer = styled(XStack, {
  name: 'ScoreRangeContainer',
  alignItems: 'center',
  gap: '$sm',
});

const ScoreInput = styled(Input, {
  name: 'ScoreInput',
  flex: 1,
  backgroundColor: '$backgroundStrong',
  borderColor: '$borderColor',
  borderRadius: '$2',
  fontSize: '$4',
  textAlign: 'center',
  paddingVertical: '$sm',
});

const ScoreSeparator = styled(Text, {
  name: 'ScoreSeparator',
  fontSize: '$4',
  color: '$gray11',
});

const FilterActions = styled(XStack, {
  name: 'FilterActions',
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
  gap: '$sm',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
});

const FilterResetButton = styled(Button, {
  name: 'FilterResetButton',
  flex: 1,
  backgroundColor: '$backgroundStrong',
  borderColor: '$borderColor',
  borderWidth: 1,
  borderRadius: '$3',
  animation: 'quick',
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$backgroundPress',
  },
});

const FilterResetText = styled(Text, {
  name: 'FilterResetText',
  fontSize: '$4',
  fontWeight: '500',
  color: '$gray11',
});

const FilterApplyButton = styled(Button, {
  name: 'FilterApplyButton',
  flex: 1,
  backgroundColor: '$cupBlue',
  borderRadius: '$3',
  animation: 'quick',
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$cupBlueDark',
  },
});

const FilterApplyText = styled(Text, {
  name: 'FilterApplyText',
  fontSize: '$4',
  fontWeight: '600',
  color: 'white',
});

export type SearchScreenProps = GetProps<typeof Container>;

const SearchScreen: React.FC<SearchScreenProps> = () => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [allTastings, setAllTastings] = useState<ITastingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Available filter options
  const [availableRoasteries, setAvailableRoasteries] = useState<string[]>([]);
  const [availableCafes, setAvailableCafes] = useState<string[]>([]);
  const [availableFlavors, setAvailableFlavors] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const realmService = RealmService.getInstance();

      // Get all tastings
      const tastings = await realmService.getTastingRecords({ isDeleted: false });
      const tastingsArray = Array.from(tastings);
      setAllTastings(tastingsArray);

      // Extract unique values for filters
      const roasteries = new Set<string>();
      const cafes = new Set<string>();
      const flavors = new Set<string>();

      tastingsArray.forEach(tasting => {
        if (tasting.roastery) roasteries.add(tasting.roastery);
        if (tasting.cafeName) cafes.add(tasting.cafeName);
        tasting.flavorNotes.forEach(note => {
          if (note.level === 1) flavors.add(note.value);
        });
      });

      setAvailableRoasteries(Array.from(roasteries).sort());
      setAvailableCafes(Array.from(cafes).sort());
      setAvailableFlavors(Array.from(flavors).sort());
    } catch (error) {
      // console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search tastings
  const filteredTastings = useMemo(() => {
    let results = [...allTastings];

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

    // Apply filters
    if (filters.roastery) {
      results = results.filter(t => t.roastery === filters.roastery);
    }

    if (filters.cafeName) {
      results = results.filter(t => t.cafeName === filters.cafeName);
    }

    if (filters.minScore !== undefined) {
      results = results.filter(t => t.matchScoreTotal >= filters.minScore!);
    }

    if (filters.maxScore !== undefined) {
      results = results.filter(t => t.matchScoreTotal <= filters.maxScore!);
    }

    if (filters.startDate) {
      results = results.filter(t => t.createdAt >= filters.startDate!);
    }

    if (filters.endDate) {
      results = results.filter(t => t.createdAt <= filters.endDate!);
    }

    if (filters.flavorNotes && filters.flavorNotes.length > 0) {
      results = results.filter(tasting => {
        const tastingFlavors = tasting.flavorNotes
          .filter(n => n.level === 1)
          .map(n => n.value);
        return filters.flavorNotes!.some(f => tastingFlavors.includes(f));
      });
    }

    // Sort by date (newest first)
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return results;
  }, [allTastings, searchQuery, filters]);

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.roastery) count++;
    if (filters.cafeName) count++;
    if (filters.minScore !== undefined) count++;
    if (filters.maxScore !== undefined) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.flavorNotes && filters.flavorNotes.length > 0) count++;
    return count;
  }, [filters]);

  const renderTastingItem = ({ item }: { item: ITastingRecord }) => (
    <TastingCard
      animation="lazy"
      enterStyle={{
        opacity: 0,
        scale: 0.95,
        y: 20,
      }}
      animateOnly={['opacity', 'transform']}
      onPress={() => navigation.navigate('TastingDetail', { tastingId: item.id })}
    >
      <CardHeader>
        <CardInfo>
          <CoffeeName numberOfLines={1}>
            {item.coffeeName}
          </CoffeeName>
          <RoasteryName numberOfLines={1}>
            {item.roastery}
          </RoasteryName>
        </CardInfo>
        <ScoreText>
          {item.matchScoreTotal}%
        </ScoreText>
      </CardHeader>

      <CardDetails>
        {item.cafeName && (
          <DetailItem>📍 {item.cafeName}</DetailItem>
        )}
        <DetailItem>
          📅 {item.createdAt.toLocaleDateString('ko-KR')}
        </DetailItem>
      </CardDetails>

      {item.flavorNotes.length > 0 && (
        <FlavorContainer>
          {item.flavorNotes
            .filter(note => note.level === 1)
            .slice(0, 3)
            .map((note, index) => (
              <FlavorChip key={index}>
                <FlavorText>{note.value}</FlavorText>
              </FlavorChip>
            ))}
          {item.flavorNotes.filter(n => n.level === 1).length > 3 && (
            <FlavorCount>
              +{item.flavorNotes.filter(n => n.level === 1).length - 3}
            </FlavorCount>
          )}
        </FlavorContainer>
      )}
    </TastingCard>
  );

  const FilterModal = () => (
    <Sheet
      modal
      open={filterModalVisible}
      onOpenChange={setFilterModalVisible}
      snapPoints={[80]}
      dismissOnSnapToBottom
    >
      <FilterSheetOverlay />
      <Sheet.Handle />
      <FilterSheetFrame>
        <FilterHeader>
          <FilterTitle>필터</FilterTitle>
          <FilterCloseButton unstyled onPress={() => setFilterModalVisible(false)}>
            <FilterCloseIcon>✕</FilterCloseIcon>
          </FilterCloseButton>
        </FilterHeader>

        <FilterContent>
          {/* Roastery Filter */}
          <FilterSection>
            <FilterSectionTitle>로스터리</FilterSectionTitle>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <FilterChipContainer>
                {availableRoasteries.map(roastery => (
                  <FilterChip
                    key={roastery}
                    active={filters.roastery === roastery}
                    unstyled
                    onPress={() => {
                      setFilters(prev => ({
                        ...prev,
                        roastery: prev.roastery === roastery ? undefined : roastery
                      }));
                    }}
                  >
                    <FilterChipText active={filters.roastery === roastery}>
                      {roastery}
                    </FilterChipText>
                  </FilterChip>
                ))}
              </FilterChipContainer>
            </ScrollView>
          </FilterSection>

          {/* Cafe Filter */}
          <FilterSection>
            <FilterSectionTitle>카페</FilterSectionTitle>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <FilterChipContainer>
                {availableCafes.map(cafe => (
                  <FilterChip
                    key={cafe}
                    active={filters.cafeName === cafe}
                    unstyled
                    onPress={() => {
                      setFilters(prev => ({
                        ...prev,
                        cafeName: prev.cafeName === cafe ? undefined : cafe
                      }));
                    }}
                  >
                    <FilterChipText active={filters.cafeName === cafe}>
                      {cafe}
                    </FilterChipText>
                  </FilterChip>
                ))}
              </FilterChipContainer>
            </ScrollView>
          </FilterSection>

          {/* Score Range Filter */}
          <FilterSection>
            <FilterSectionTitle>매칭 점수</FilterSectionTitle>
            <ScoreRangeContainer>
              <ScoreInput
                placeholder="최소"
                value={filters.minScore?.toString() || ''}
                onChangeText={(text) => {
                  const value = text ? parseInt(text) : undefined;
                  setFilters(prev => ({ ...prev, minScore: value }));
                }}
                keyboardType="numeric"
                maxLength={3}
                unstyled
              />
              <ScoreSeparator>-</ScoreSeparator>
              <ScoreInput
                placeholder="최대"
                value={filters.maxScore?.toString() || ''}
                onChangeText={(text) => {
                  const value = text ? parseInt(text) : undefined;
                  setFilters(prev => ({ ...prev, maxScore: value }));
                }}
                keyboardType="numeric"
                maxLength={3}
                unstyled
              />
            </ScoreRangeContainer>
          </FilterSection>

          {/* Flavor Notes Filter */}
          <FilterSection>
            <FilterSectionTitle>맛 노트</FilterSectionTitle>
            <FilterChipContainer>
              {availableFlavors.map(flavor => (
                <FilterChip
                  key={flavor}
                  active={filters.flavorNotes?.includes(flavor) || false}
                  unstyled
                  onPress={() => {
                    setFilters(prev => {
                      const currentFlavors = prev.flavorNotes || [];
                      const newFlavors = currentFlavors.includes(flavor)
                        ? currentFlavors.filter(f => f !== flavor)
                        : [...currentFlavors, flavor];
                      return { ...prev, flavorNotes: newFlavors.length > 0 ? newFlavors : undefined };
                    });
                  }}
                >
                  <FilterChipText active={filters.flavorNotes?.includes(flavor) || false}>
                    {flavor}
                  </FilterChipText>
                </FilterChip>
              ))}
            </FilterChipContainer>
          </FilterSection>
        </FilterContent>

        <FilterActions>
          <FilterResetButton unstyled onPress={() => setFilters({})}>
            <FilterResetText>초기화</FilterResetText>
          </FilterResetButton>
          <FilterApplyButton unstyled onPress={() => setFilterModalVisible(false)}>
            <FilterApplyText>적용</FilterApplyText>
          </FilterApplyButton>
        </FilterActions>
      </FilterSheetFrame>
    </Sheet>
  );

  if (loading) {
    return (
      <Container>
        <SafeAreaView style={{ flex: 1 }}>
          <LoadingContainer>
            <Spinner size="large" color="$cupBlue" />
            <LoadingText>데이터 로딩 중...</LoadingText>
          </LoadingContainer>
        </SafeAreaView>
      </Container>
    );
  }

  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
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
            <HeaderTitle>테이스팅 검색</HeaderTitle>
          </HeaderSection>

          {/* Search Bar */}
          <SearchContainer
            animation="lazy"
            enterStyle={{
              opacity: 0,
              y: -10,
            }}
            animateOnly={['opacity', 'transform']}
          >
            <SearchBar>
              <SearchIcon>🔍</SearchIcon>
              <SearchInput
                placeholder="커피명, 로스터리, 카페로 검색..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                unstyled
              />
              {searchQuery !== '' && (
                <ClearButton unstyled onPress={() => setSearchQuery('')}>
                  <ClearIcon>✕</ClearIcon>
                </ClearButton>
              )}
            </SearchBar>

            <FilterButton
              unstyled
              onPress={() => setFilterModalVisible(true)}
            >
              <FilterIcon>⚙️</FilterIcon>
              {activeFilterCount > 0 && (
                <FilterBadge>
                  <FilterBadgeText>{activeFilterCount}</FilterBadgeText>
                </FilterBadge>
              )}
            </FilterButton>
          </SearchContainer>

          {/* Clear Filters */}
          {(searchQuery !== '' || activeFilterCount > 0) && (
            <ClearFiltersContainer
              animation="lazy"
              enterStyle={{
                opacity: 0,
                y: -10,
              }}
              animateOnly={['opacity', 'transform']}
            >
              <ClearFiltersButton unstyled onPress={clearFilters}>
                <ClearFiltersText>모든 필터 초기화</ClearFiltersText>
              </ClearFiltersButton>
            </ClearFiltersContainer>
          )}
        </AnimatePresence>

        {/* Results */}
        <FlatList
          data={filteredTastings}
          renderItem={renderTastingItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={15}
          updateCellsBatchingPeriod={50}
          ListEmptyComponent={
            <EmptyContainer>
              <EmptyIcon>☕️</EmptyIcon>
              <EmptyText>검색 결과가 없습니다</EmptyText>
              <EmptySubtext>다른 검색어나 필터를 시도해보세요</EmptySubtext>
            </EmptyContainer>
          }
        />

        <FilterModal />
      </SafeAreaView>
    </Container>
  );
};

export default SearchScreen;