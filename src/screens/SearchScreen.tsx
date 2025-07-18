import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RealmService from '../services/realm/RealmService';
import { ITastingRecord } from '../services/realm/schemas';
import { Colors } from '../constants/colors';
import { Heading2, BodyText, Caption } from '../components/common';

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
  const navigation = useNavigation();
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
      const tastings = realmService.getTastingRecords({ isDeleted: false });
      setAllTastings(tastings);
      
      // Extract unique values for filters
      const roasteries = new Set<string>();
      const cafes = new Set<string>();
      const flavors = new Set<string>();
      
      tastings.forEach(tasting => {
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
    <TouchableOpacity
      style={styles.tastingCard}
      onPress={() => navigation.navigate('TastingDetail' as never, { id: item.id } as never)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.coffeeName}>{item.coffeeName}</Text>
          <Text style={styles.roastery}>{item.roastery}</Text>
        </View>
        <Text style={styles.matchScore}>{item.matchScoreTotal}%</Text>
      </View>
      
      <View style={styles.cardDetails}>
        {item.cafeName && (
          <Text style={styles.detailText}>📍 {item.cafeName}</Text>
        )}
        <Text style={styles.detailText}>
          📅 {item.createdAt.toLocaleDateString('ko-KR')}
        </Text>
      </View>
      
      {item.flavorNotes.length > 0 && (
        <View style={styles.flavorContainer}>
          {item.flavorNotes
            .filter(note => note.level === 1)
            .slice(0, 3)
            .map((note, index) => (
              <View key={index} style={styles.flavorTag}>
                <Text style={styles.flavorText}>{note.value}</Text>
              </View>
            ))}
          {item.flavorNotes.filter(n => n.level === 1).length > 3 && (
            <Text style={styles.moreText}>+{item.flavorNotes.filter(n => n.level === 1).length - 3}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const FilterModal = () => (
    <Modal
      visible={filterModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>필터</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {/* Roastery Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>로스터리</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {availableRoasteries.map(roastery => (
                  <TouchableOpacity
                    key={roastery}
                    style={[
                      styles.filterChip,
                      filters.roastery === roastery && styles.filterChipActive
                    ]}
                    onPress={() => {
                      setFilters(prev => ({
                        ...prev,
                        roastery: prev.roastery === roastery ? undefined : roastery
                      }));
                    }}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filters.roastery === roastery && styles.filterChipTextActive
                    ]}>
                      {roastery}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Cafe Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>카페</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {availableCafes.map(cafe => (
                  <TouchableOpacity
                    key={cafe}
                    style={[
                      styles.filterChip,
                      filters.cafeName === cafe && styles.filterChipActive
                    ]}
                    onPress={() => {
                      setFilters(prev => ({
                        ...prev,
                        cafeName: prev.cafeName === cafe ? undefined : cafe
                      }));
                    }}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filters.cafeName === cafe && styles.filterChipTextActive
                    ]}>
                      {cafe}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Score Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>매칭 점수</Text>
              <View style={styles.scoreRange}>
                <TextInput
                  style={styles.scoreInput}
                  placeholder="최소"
                  placeholderTextColor="#CCCCCC"
                  value={filters.minScore?.toString() || ''}
                  onChangeText={(text) => {
                    const value = text ? parseInt(text) : undefined;
                    setFilters(prev => ({ ...prev, minScore: value }));
                  }}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <Text style={styles.scoreDash}>-</Text>
                <TextInput
                  style={styles.scoreInput}
                  placeholder="최대"
                  placeholderTextColor="#CCCCCC"
                  value={filters.maxScore?.toString() || ''}
                  onChangeText={(text) => {
                    const value = text ? parseInt(text) : undefined;
                    setFilters(prev => ({ ...prev, maxScore: value }));
                  }}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
            </View>
            
            {/* Flavor Notes Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>맛 노트</Text>
              <View style={styles.flavorGrid}>
                {availableFlavors.map(flavor => (
                  <TouchableOpacity
                    key={flavor}
                    style={[
                      styles.filterChip,
                      filters.flavorNotes?.includes(flavor) && styles.filterChipActive
                    ]}
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
                    <Text style={[
                      styles.filterChipText,
                      filters.flavorNotes?.includes(flavor) && styles.filterChipTextActive
                    ]}>
                      {flavor}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setFilters({})}
            >
              <Text style={styles.clearButtonText}>초기화</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>적용</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.GRADIENT_BROWN} />
          <BodyText style={styles.loadingText}>데이터 로딩 중...</BodyText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Heading2>테이스팅 검색</Heading2>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="커피명, 로스터리, 카페로 검색..."
            placeholderTextColor="#CCCCCC"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      {(searchQuery !== '' || activeFilterCount > 0) && (
        <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
          <Text style={styles.clearFiltersText}>모든 필터 초기화</Text>
        </TouchableOpacity>
      )}
      
      <FlatList
        data={filteredTastings}
        renderItem={renderTastingItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>☕️</Text>
            <BodyText style={styles.emptyText}>
              검색 결과가 없습니다
            </BodyText>
            <Caption style={styles.emptySubtext}>
              다른 검색어나 필터를 시도해보세요
            </Caption>
          </View>
        }
      />
      
      <FilterModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GRAY,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: Colors.SHADOW_BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    paddingVertical: 14,
  },
  clearIcon: {
    fontSize: 18,
    color: Colors.TEXT_TERTIARY,
    padding: 4,
  },
  filterButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.SHADOW_BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterIcon: {
    fontSize: 24,
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.GRADIENT_BROWN,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  clearFiltersButton: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  clearFiltersText: {
    color: Colors.GRADIENT_BROWN,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 12,
    color: Colors.TEXT_SECONDARY,
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  tastingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.SHADOW_BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  coffeeName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 2,
  },
  roastery: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  matchScore: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.GRADIENT_BROWN,
  },
  cardDetails: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  flavorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  flavorTag: {
    backgroundColor: Colors.TAG_BACKGROUND,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  flavorText: {
    fontSize: 12,
    color: Colors.TEXT_TERTIARY,
  },
  moreText: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 8,
  },
  emptySubtext: {
    color: Colors.TEXT_TERTIARY,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BACKGROUND_GRAY,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.TEXT_TERTIARY,
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: Colors.BACKGROUND_GRAY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.GRADIENT_BROWN,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  flavorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scoreRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scoreInput: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GRAY,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  scoreDash: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.BACKGROUND_GRAY,
  },
  clearButton: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GRAY,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.TEXT_SECONDARY,
  },
  applyButton: {
    flex: 1,
    backgroundColor: Colors.GRADIENT_BROWN,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});