import React, { useState, useEffect, useMemo} from 'react';
import { FlatList, SafeAreaView } from 'react-native';
import { XStack, Spinner, GetProps } from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RealmService } from '../../services/realm/RealmService';
import { ITastingRecord} from '../../services/realm/schemas';

// Components
import {
  Container,
  HeaderSection,
  HeaderTitle,
  SearchContainer,
  SearchBar,
  SearchIcon,
  SearchInput,
  ClearButton,
  ClearIcon,
  FilterButton,
  FilterIcon,
  FilterBadge,
  FilterBadgeText,
  ClearFiltersContainer,
  ClearFiltersButton,
  ClearFiltersText,
  LoadingContainer,
  LoadingText,
  EmptyContainer,
  EmptyIcon,
  EmptyText,
  EmptySubtext,
} from '../../components-tamagui/search/SearchScreenStyles';
import { TastingSearchCard } from '../../components-tamagui/search/TastingSearchCard';
import { Logger } from '../../services/LoggingService';
import { SearchFilters} from '../../components-tamagui/search/SearchFilters';

interface FilterOptions {
  roastery?: string;
  cafeName?: string;
  minScore?: number;
  maxScore?: number;
  startDate?: Date;
  endDate?: Date;
  flavorNotes?: string[];
}

export type SearchScreenProps = GetProps<typeof Container>;

const SearchScreen: React.FC<SearchScreenProps> = () => {
  const navigation = useNavigation<StackNavigationProp<unknown>>();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [allTastings, setAllTastings] = useState<ITastingRecord[]>([]);
  const [availableRoasteries, setAvailableRoasteries] = useState<string[]>([]);
  const [availableCafeNames, setAvailableCafeNames] = useState<string[]>([]);
  const [availableFlavorNotes, setAvailableFlavorNotes] = useState<string[]>([]);

  // Load data
  useEffect(() => {
    loadTastingData();
}, []);

  const loadTastingData = async () => {
    try {
      setIsLoading(true);
      const realmService = RealmService.getInstance();
      
      if (!realmService.isInitialized) {
        await realmService.initialize();
    }

      const tastings = await realmService.getTastingRecords({ isDeleted: false });
      const tastingArray = Array.from(tastings);
      
      setAllTastings(tastingArray);
      
      // Extract unique values for filters
      const roasteries = [...new Set(tastingArray
        .map(t => t.roastery)
        .filter(Boolean)
      )].sort();
      
      const cafeNames = [...new Set(tastingArray
        .map(t => t.cafeName)
        .filter(Boolean) as string[]
      )].sort();
      
      const flavorNotes = [...new Set(tastingArray
        .flatMap(t => {
          if (!t.flavorNotes || !Array.isArray(t.flavorNotes)) return [];
          return t.flavorNotes.map(note => 
            note.koreanValue || note.value || String(note)
          ).filter(Boolean);
      })
      )].sort();
      
      setAvailableRoasteries(roasteries);
      setAvailableCafeNames(cafeNames);
      setAvailableFlavorNotes(flavorNotes);
      
  } catch (error) {
      Logger.error('Error loading tasting data:', 'screen', { component: 'SearchScreen', error: error });
  } finally {
      setIsLoading(false);
  }
};

  // Filter and search logic
  const filteredTastings = useMemo(() => {
    let result = allTastings;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(tasting =>
        tasting.coffeeName?.toLowerCase().includes(query) ||
        tasting.roastery?.toLowerCase().includes(query) ||
        tasting.cafeName?.toLowerCase().includes(query) ||
        tasting.origin?.toLowerCase().includes(query) ||
        tasting.variety?.toLowerCase().includes(query) ||
        tasting.personalComment?.toLowerCase().includes(query) ||
        tasting.roasterNotes?.toLowerCase().includes(query)
      );
  }

    // Apply filters
    if (filters.roastery) {
      result = result.filter(t => t.roastery === filters.roastery);
  }

    if (filters.cafeName) {
      result = result.filter(t => t.cafeName === filters.cafeName);
  }

    if (filters.minScore !== undefined) {
      result = result.filter(t => 
        t.matchScoreTotal !== undefined && t.matchScoreTotal >= filters.minScore!
      );
  }

    if (filters.maxScore !== undefined) {
      result = result.filter(t => 
        t.matchScoreTotal !== undefined && t.matchScoreTotal <= filters.maxScore!
      );
  }

    if (filters.flavorNotes && filters.flavorNotes.length > 0) {
      result = result.filter(tasting => {
        if (!tasting.flavorNotes || !Array.isArray(tasting.flavorNotes)) return false;
        
        const tastingFlavors = tasting.flavorNotes.map(note => 
          note.koreanValue || note.value || String(note)
        ).filter(Boolean);
        
        return filters.flavorNotes!.some(flavor => 
          tastingFlavors.includes(flavor)
        );
    });
  }

    // Sort by creation date (newest first)
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}, [allTastings, searchQuery, filters]);

  // Filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.roastery) count++;
    if (filters.cafeName) count++;
    if (filters.minScore !== undefined || filters.maxScore !== undefined) count++;
    if (filters.flavorNotes && filters.flavorNotes.length > 0) count++;
    return count;
}, [filters]);

  // Handlers
  const clearSearch = () => {
    setSearchQuery('');
};

  const clearFilters = () => {
    setFilters({});
};

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
};

  const handleTastingPress = (tasting: ITastingRecord) => {
    navigation.navigate('TastingDetail', { 
      tastingId: tasting.id 
  });
};

  // Render methods
  const renderSearchBar = () => (
    <SearchContainer>
      <SearchBar focused={isSearchFocused}>
        <SearchIcon>검색</SearchIcon>
        <SearchInput
          placeholder="커피명, 로스터리, 향미노트 검색..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        {searchQuery.length > 0 && (
          <ClearButton onPress={clearSearch}>
            <ClearIcon>X</ClearIcon>
          </ClearButton>
        )}
      </SearchBar>

      <FilterButton 
        hasFilters={activeFilterCount > 0}
        onPress={() => setShowFilters(true)}
      >
        <FilterIcon>필터</FilterIcon>
        {activeFilterCount > 0 && (
          <FilterBadge>
            <FilterBadgeText>{activeFilterCount}</FilterBadgeText>
          </FilterBadge>
        )}
      </FilterButton>
    </SearchContainer>
  );

  const renderClearFilters = () => {
    if (activeFilterCount === 0) return null;
    
    return (
      <ClearFiltersContainer>
        <ClearFiltersButton onPress={clearFilters}>
          <ClearFiltersText>
            필터 {activeFilterCount}개 해제
          </ClearFiltersText>
        </ClearFiltersButton>
      </ClearFiltersContainer>
    );
};

  const renderEmptyState = () => (
    <EmptyContainer>
      <EmptyIcon>검색</EmptyIcon>
      <EmptyText>
        {searchQuery || activeFilterCount > 0 
          ? '검색 결과가 없습니다' 
          : '아직 기록된 커피가 없습니다'
      }
      </EmptyText>
      <EmptySubtext>
        {searchQuery || activeFilterCount > 0
          ? '다른 검색어나 필터를 시도해보세요'
          : '첫 번째 커피 테이스팅을 기록해보세요'
      }
      </EmptySubtext>
    </EmptyContainer>
  );

  const renderTastingItem = ({ item }: { item: ITastingRecord }) => (
    <TastingSearchCard
      tasting={item}
      onPress={handleTastingPress}
    />
  );

  if (isLoading) {
    return (
      <Container>
        <SafeAreaView style={{ flex: 1 }}>
          <LoadingContainer>
            <Spinner size="large" color="$blue9" />
            <LoadingText>커피 기록을 불러오는 중...</LoadingText>
          </LoadingContainer>
        </SafeAreaView>
      </Container>
    );
}

  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        <HeaderSection>
          <HeaderTitle>커피 검색</HeaderTitle>
          {renderSearchBar()}
          {renderClearFilters()}
        </HeaderSection>

        {filteredTastings.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredTastings}
            keyExtractor={(item) => item.id}
            renderItem={renderTastingItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        <SearchFilters
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onApplyFilters={handleApplyFilters}
          availableRoasteries={availableRoasteries}
          availableCafeNames={availableCafeNames}
          availableFlavorNotes={availableFlavorNotes}
        />
      </SafeAreaView>
    </Container>
  );
};

export default SearchScreen;