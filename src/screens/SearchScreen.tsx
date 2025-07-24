import React, { useState, useEffect, useMemo } from 'react';
import { FlatList, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { 
  View, 
  Text, 
  ScrollView, 
  Button, 
  YStack, 
  XStack, 
  Card,
  Input,
  Separator,
  Spinner,
  H1,
  H2,
  H3,
  Paragraph,
  SizableText,
  Sheet
} from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import RealmService from '../services/realm/RealmService';
import { ITastingRecord } from '../services/realm/schemas';

interface FilterOptions {
  roastery?: string;
  cafeName?: string;
  minScore?: number;
  maxScore?: number;
  startDate?: Date;
  endDate?: Date;
  flavorNotes?: string[];
}

export default function SearchScreen() {
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
      
      // Load data normally
      
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
    <Card
      backgroundColor="$background"
      borderRadius="$4"
      padding="$4"
      marginBottom="$3"
      borderWidth={1}
      borderColor="$borderColor"
      elevate
      animation="bouncy"
      scale={0.9}
      hoverStyle={{ scale: 0.925 }}
      pressStyle={{ scale: 0.875 }}
      onPress={() => navigation.navigate('TastingDetail', { tastingId: item.id })}
    >
      <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$2">
        <YStack flex={1} marginRight="$3">
          <SizableText size="$5" fontWeight="600" color="$color" marginBottom="$1">
            {item.coffeeName}
          </SizableText>
          <SizableText size="$3" color="$colorPress">
            {item.roastery}
          </SizableText>
        </YStack>
        <SizableText size="$7" fontWeight="700" color="$acidity">
          {item.matchScoreTotal}%
        </SizableText>
      </XStack>
      
      <XStack gap="$3" marginBottom="$2">
        {item.cafeName && (
          <SizableText size="$3" color="$colorPress">📍 {item.cafeName}</SizableText>
        )}
        <SizableText size="$3" color="$colorPress">
          📅 {item.createdAt.toLocaleDateString('ko-KR')}
        </SizableText>
      </XStack>
      
      {item.flavorNotes.length > 0 && (
        <XStack flexWrap="wrap" gap="$2" alignItems="center">
          {item.flavorNotes
            .filter(note => note.level === 1)
            .slice(0, 3)
            .map((note, index) => (
              <View 
                key={index} 
                backgroundColor="$backgroundHover" 
                paddingHorizontal="$3" 
                paddingVertical="$1" 
                borderRadius="$3"
              >
                <SizableText size="$2" color="$colorPress">{note.value}</SizableText>
              </View>
            ))}
          {item.flavorNotes.filter(n => n.level === 1).length > 3 && (
            <SizableText size="$2" color="$colorPress" marginLeft="$1">
              +{item.flavorNotes.filter(n => n.level === 1).length - 3}
            </SizableText>
          )}
        </XStack>
      )}
    </Card>
  );

  const FilterModal = () => (
    <Sheet
      modal
      open={filterModalVisible}
      onOpenChange={setFilterModalVisible}
      snapPoints={[80]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay
        animation="lazy"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle />
      <Sheet.Frame backgroundColor="$background" borderTopLeftRadius="$6" borderTopRightRadius="$6">
        <XStack 
          paddingHorizontal="$4" 
          paddingVertical="$4" 
          alignItems="center" 
          justifyContent="space-between"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <H3 color="$color">필터</H3>
          <Button 
            size="$3" 
            variant="outlined" 
            backgroundColor="transparent" 
            borderWidth={0}
            onPress={() => setFilterModalVisible(false)}
          >
            <SizableText size="$6" color="$colorPress">✕</SizableText>
          </Button>
        </XStack>
        
        <ScrollView padding="$4">
            {/* Roastery Filter */}
            <YStack marginBottom="$6">
              <SizableText size="$4" fontWeight="600" color="$color" marginBottom="$3">
                로스터리
              </SizableText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack gap="$2">
                  {availableRoasteries.map(roastery => (
                    <Button
                      key={roastery}
                      size="$3"
                      variant={filters.roastery === roastery ? undefined : "outlined"}
                      backgroundColor={filters.roastery === roastery ? "$acidity" : "$backgroundHover"}
                      borderColor={filters.roastery === roastery ? "$acidity" : "$borderColor"}
                      onPress={() => {
                        setFilters(prev => ({
                          ...prev,
                          roastery: prev.roastery === roastery ? undefined : roastery
                        }));
                      }}
                    >
                      <SizableText 
                        size="$3" 
                        color={filters.roastery === roastery ? "white" : "$colorPress"}
                        fontWeight={filters.roastery === roastery ? "500" : "400"}
                      >
                        {roastery}
                      </SizableText>
                    </Button>
                  ))}
                </XStack>
              </ScrollView>
            </YStack>
            
            {/* Cafe Filter */}
            <YStack marginBottom="$6">
              <SizableText size="$4" fontWeight="600" color="$color" marginBottom="$3">
                카페
              </SizableText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack gap="$2">
                  {availableCafes.map(cafe => (
                    <Button
                      key={cafe}
                      size="$3"
                      variant={filters.cafeName === cafe ? undefined : "outlined"}
                      backgroundColor={filters.cafeName === cafe ? "$acidity" : "$backgroundHover"}
                      borderColor={filters.cafeName === cafe ? "$acidity" : "$borderColor"}
                      onPress={() => {
                        setFilters(prev => ({
                          ...prev,
                          cafeName: prev.cafeName === cafe ? undefined : cafe
                        }));
                      }}
                    >
                      <SizableText 
                        size="$3" 
                        color={filters.cafeName === cafe ? "white" : "$colorPress"}
                        fontWeight={filters.cafeName === cafe ? "500" : "400"}
                      >
                        {cafe}
                      </SizableText>
                    </Button>
                  ))}
                </XStack>
              </ScrollView>
            </YStack>
            
            {/* Score Range Filter */}
            <YStack marginBottom="$6">
              <SizableText size="$4" fontWeight="600" color="$color" marginBottom="$3">
                매칭 점수
              </SizableText>
              <XStack alignItems="center" gap="$3">
                <Input
                  flex={1}
                  placeholder="최소"
                  value={filters.minScore?.toString() || ''}
                  onChangeText={(text) => {
                    const value = text ? parseInt(text) : undefined;
                    setFilters(prev => ({ ...prev, minScore: value }));
                  }}
                  keyboardType="numeric"
                  maxLength={3}
                  backgroundColor="$backgroundHover"
                  borderColor="$borderColor"
                  fontSize="$4"
                  textAlign="center"
                />
                <SizableText size="$4" color="$colorPress">-</SizableText>
                <Input
                  flex={1}
                  placeholder="최대"
                  value={filters.maxScore?.toString() || ''}
                  onChangeText={(text) => {
                    const value = text ? parseInt(text) : undefined;
                    setFilters(prev => ({ ...prev, maxScore: value }));
                  }}
                  keyboardType="numeric"
                  maxLength={3}
                  backgroundColor="$backgroundHover"
                  borderColor="$borderColor"
                  fontSize="$4"
                  textAlign="center"
                />
              </XStack>
            </YStack>
            
            {/* Flavor Notes Filter */}
            <YStack marginBottom="$6">
              <SizableText size="$4" fontWeight="600" color="$color" marginBottom="$3">
                맛 노트
              </SizableText>
              <XStack flexWrap="wrap" gap="$2">
                {availableFlavors.map(flavor => (
                  <Button
                    key={flavor}
                    size="$3"
                    variant={filters.flavorNotes?.includes(flavor) ? undefined : "outlined"}
                    backgroundColor={filters.flavorNotes?.includes(flavor) ? "$acidity" : "$backgroundHover"}
                    borderColor={filters.flavorNotes?.includes(flavor) ? "$acidity" : "$borderColor"}
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
                    <SizableText 
                      size="$3" 
                      color={filters.flavorNotes?.includes(flavor) ? "white" : "$colorPress"}
                      fontWeight={filters.flavorNotes?.includes(flavor) ? "500" : "400"}
                    >
                      {flavor}
                    </SizableText>
                  </Button>
                ))}
              </XStack>
            </YStack>
          </ScrollView>
          
          <XStack 
            paddingHorizontal="$4" 
            paddingVertical="$4" 
            gap="$3" 
            borderTopWidth={1} 
            borderTopColor="$borderColor"
          >
            <Button
              flex={1}
              size="$4"
              variant="outlined"
              backgroundColor="$backgroundHover"
              borderColor="$borderColor"
              onPress={() => setFilters({})}
            >
              <SizableText size="$4" fontWeight="500" color="$colorPress">초기화</SizableText>
            </Button>
            <Button
              flex={1}
              size="$4"
              theme="blue"
              backgroundColor="$acidity"
              onPress={() => setFilterModalVisible(false)}
            >
              <SizableText size="$4" fontWeight="600" color="white">적용</SizableText>
            </Button>
          </XStack>
        </Sheet.Frame>
      </Sheet>
    );

  if (loading) {
    return (
      <View flex={1} backgroundColor="$backgroundSoft" alignItems="center" justifyContent="center">
        <Spinner size="large" color="$acidity" />
        <SizableText marginTop="$4" size="$4" color="$color">데이터 로딩 중...</SizableText>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor="$backgroundSoft">
      <XStack padding="$4" paddingBottom="$3">
        <H2 color="$color">테이스팅 검색</H2>
      </XStack>
      
      <XStack paddingHorizontal="$4" paddingBottom="$3" gap="$3">
        <XStack 
          flex={1} 
          alignItems="center" 
          backgroundColor="$background" 
          borderRadius="$4" 
          paddingHorizontal="$4"
          borderWidth={1}
          borderColor="$borderColor"
          elevation={2}
        >
          <SizableText size="$5" marginRight="$3">🔍</SizableText>
          <Input
            flex={1}
            placeholder="커피명, 로스터리, 카페로 검색..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            borderWidth={0}
            backgroundColor="transparent"
            fontSize="$4"
          />
          {searchQuery !== '' && (
            <Button 
              size="$2" 
              variant="outlined" 
              backgroundColor="transparent" 
              borderWidth={0}
              onPress={() => setSearchQuery('')}
            >
              <SizableText size="$4" color="$colorPress">✕</SizableText>
            </Button>
          )}
        </XStack>
        
        <Button
          size="$4"
          variant="outlined"
          backgroundColor="$background"
          borderColor="$borderColor"
          onPress={() => setFilterModalVisible(true)}
          position="relative"
        >
          <SizableText size="$6">⚙️</SizableText>
          {activeFilterCount > 0 && (
            <View 
              position="absolute" 
              top={4} 
              right={4} 
              backgroundColor="$acidity" 
              borderRadius="$2" 
              width={20} 
              height={20} 
              alignItems="center" 
              justifyContent="center"
            >
              <SizableText color="white" size="$2" fontWeight="600">{activeFilterCount}</SizableText>
            </View>
          )}
        </Button>
      </XStack>
      
      {(searchQuery !== '' || activeFilterCount > 0) && (
        <XStack paddingHorizontal="$4" paddingBottom="$3">
          <Button 
            size="$3" 
            variant="outlined" 
            backgroundColor="transparent" 
            borderWidth={0}
            onPress={clearFilters}
          >
            <SizableText color="$acidity" size="$3" fontWeight="500">모든 필터 초기화</SizableText>
          </Button>
        </XStack>
      )}
      
      <FlatList
        data={filteredTastings}
        renderItem={renderTastingItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        // 메모리 최적화 설정
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={15}
        updateCellsBatchingPeriod={50}
        getItemLayout={(data, index) => ({
          length: 120, // 아이템 높이
          offset: 120 * index,
          index,
        })}
        ListEmptyComponent={
          <YStack alignItems="center" paddingTop="$15">
            <SizableText size="8" marginBottom="$4">☕️</SizableText>
            <SizableText size="$5" color="$colorPress" marginBottom="$2">
              검색 결과가 없습니다
            </SizableText>
            <SizableText size="$3" color="$colorPress">
              다른 검색어나 필터를 시도해보세요
            </SizableText>
          </YStack>
        }
      />
      
      <FilterModal />
    </View>
  );
}

// Styles migrated to Tamagui - no StyleSheet needed