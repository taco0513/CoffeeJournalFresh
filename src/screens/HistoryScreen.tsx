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
  SectionList,
  ScrollView,
  DeviceEventEmitter,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import RealmService from '../services/realm/RealmService';
import { ITastingRecord } from '../services/realm/schemas';
import { HIGConstants, HIGColors } from '../styles/common';

import { useUserStore } from '../stores/useUserStore';
import { SkeletonList } from '../components/common/SkeletonLoader';

interface GroupedTastings {
  title: string;
  data: ITastingRecord[];
}

interface HistoryScreenProps {
  hideNavBar?: boolean;
}

export default function HistoryScreen({ hideNavBar = false }: HistoryScreenProps) {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { currentUser } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [allTastings, setAllTastings] = useState<ITastingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  

  useEffect(() => {
    loadData();
  }, []);

  // Removed route params dependency - using DeviceEventEmitter instead

  // Listen for mock data creation events
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('mockDataCreated', () => {
      console.log('🔄 HistoryScreen: Mock data created event received');
      loadData();
    });

    return () => subscription.remove();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 HistoryScreen: Focus triggered refresh');
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      const realmService = RealmService.getInstance();
      
      // Realm 초기화 확인
      if (!realmService.isInitialized) {
        console.log('⚠️ Realm not initialized in HistoryScreen, attempting to initialize...');
        try {
          await realmService.initialize();
        } catch (initError) {
          console.error('Failed to initialize Realm:', initError);
        }
      }
      
      // Load data normally
      
      const tastings = await realmService.getTastingRecords({ isDeleted: false });
      const tastingsArray = Array.from(tastings);
      
      console.log('📊 HistoryScreen data loaded:', {
        isInitialized: realmService.isInitialized,
        recordsCount: tastingsArray.length,
        firstRecord: tastingsArray[0]?.coffeeName,
        timestamp: new Date().toISOString(),
        allRecords: tastingsArray.map(t => ({
          id: t.id,
          coffeeName: t.coffeeName,
          roastery: t.roastery,
          isDeleted: t.isDeleted,
          createdAt: t.createdAt?.toISOString()
        }))
      });
      
      setAllTastings(tastingsArray);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and group tastings
  const groupedTastings = useMemo(() => {
    try {
      console.log('🔄 Processing groupedTastings - input count:', allTastings.length);
      
      // Filter out invalid Realm objects with more flexible validation
      let results = allTastings.filter(tasting => {
        try {
          const isValid = tasting && tasting.id && tasting.coffeeName;
          if (!isValid) {
            console.log('❌ Filtering out invalid tasting:', {
              hasId: !!tasting?.id,
              hasCoffeeName: !!tasting?.coffeeName,
              tasting: tasting
            });
          }
          return isValid;
        } catch (error) {
          console.log('❌ Error during validation:', error, tasting);
          return false;
        }
      });
      
      console.log('✅ Valid tastings after filter:', results.length);
      
      // Convert to plain objects to avoid Realm invalidation issues
      results = results.map((tasting, index) => {
        try {
          const plainObject = {
            ...tasting,
            id: tasting.id,
            coffeeName: tasting.coffeeName,
            roastery: tasting.roastery,
            cafeName: tasting.cafeName,
            origin: tasting.origin,
            createdAt: new Date(tasting.createdAt),
            matchScoreTotal: tasting.matchScoreTotal
          };
          console.log(`📋 Converted tasting ${index + 1}:`, {
            id: plainObject.id,
            coffeeName: plainObject.coffeeName,
            roastery: plainObject.roastery
          });
          return plainObject;
        } catch (error) {
          console.error('❌ Error converting tasting to plain object:', error, tasting);
          return tasting; // Return original if conversion fails
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
    
    console.log('📊 Final grouped sections:', grouped.map(section => ({
      title: section.title,
      count: section.data.length,
      firstItem: section.data[0]?.coffeeName
    })));
    
      return grouped;
    } catch (error) {
      console.error('Error grouping tastings:', error);
      return [];
    }
  }, [allTastings, searchQuery, sortBy]);

  const renderTastingItem = ({ item }: { item: ITastingRecord }) => {
    // Debug: Log each item being rendered
    console.log('🎨 Rendering tasting item:', {
      id: item.id,
      coffeeName: item.coffeeName,
      roastery: item.roastery
    });
    
    // More flexible validity check - if it has the required properties, render it
    if (!item || !item.id || !item.coffeeName) {
      console.log('❌ Item invalid - missing basic properties:', item);
      return null;
    }

    try {
      const formattedDate = item.createdAt ? item.createdAt.toLocaleDateString('ko-KR', { 
        month: 'long', 
        day: 'numeric' 
      }) : '날짜 없음';
      
      return (
        <TouchableOpacity
          style={styles.tastingCard}
          onPress={() => {
            navigation.navigate('TastingDetail', { 
              tastingId: item.id
            });
          }}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.coffeeName}>{item.coffeeName}</Text>
            <View style={[styles.matchScoreContainer, {
              backgroundColor: (item.matchScoreTotal || 0) >= 85 ? HIGColors.green : 
                             (item.matchScoreTotal || 0) >= 70 ? HIGColors.orange : HIGColors.red
            }]}>
              <Text style={styles.matchScore}>{item.matchScoreTotal || 0}%</Text>
            </View>
          </View>
          <Text style={styles.roasterName}>{item.roastery || 'Unknown Roastery'}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </TouchableOpacity>
      );
    } catch (error) {
      console.error('Error rendering tasting item:', error, item);
      return (
        <View style={styles.tastingCard}>
          <Text style={styles.coffeeName}>Error loading item</Text>
          <Text style={styles.roasterName}>ID: {item.id}</Text>
        </View>
      );
    }
  };

  const renderSectionHeader = ({ section }: { section: GroupedTastings }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>{section.data.length}개</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.navigationBar}>
          <View style={styles.titleContainer}>
            <Text style={styles.navigationTitle}>테이스팅 기록</Text>
            <View style={styles.betaBadge}>
              <Text style={styles.betaText}>BETA</Text>
            </View>
          </View>
          <View style={{ width: 80 }} />
        </View>
        
        <ScrollView style={styles.container} contentContainerStyle={styles.listContent}>
          <SkeletonList count={5} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar */}
      {!hideNavBar && (
        <View style={styles.navigationBar}>
          <View style={styles.titleContainer}>
            <Text style={styles.navigationTitle}>테이스팅 기록</Text>
            <View style={styles.betaBadge}>
              <Text style={styles.betaText}>BETA</Text>
            </View>
          </View>
          <View style={{ width: 80 }} />
        </View>
      )}


      <View style={styles.header}>
        <Text style={styles.headerTitle}>총 {allTastings.length}개의 기록</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="커피명, 로스터리, 카페로 검색..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'date' && styles.sortButtonActive]}
          onPress={() => setSortBy('date')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'date' && styles.sortButtonTextActive]}>
            날짜순
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'score' && styles.sortButtonActive]}
          onPress={() => setSortBy('score')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'score' && styles.sortButtonTextActive]}>
            점수순
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.advancedSearchButton}
          onPress={() => navigation.navigate('Search' as never)}
        >
          <Text style={styles.advancedSearchText}>고급 검색 →</Text>
        </TouchableOpacity>
      </View>
      
      <SectionList
        sections={groupedTastings}
        renderItem={renderTastingItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>☕️</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? '검색 결과가 없습니다' : '아직 기록이 없습니다'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? '다른 검색어를 시도해보세요' : '첫 테이스팅을 기록해보세요'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navigationBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  betaBadge: {
    backgroundColor: HIGColors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  betaText: {
    fontSize: 11,
    fontWeight: '700',
    color: HIGColors.white,
    letterSpacing: 0.5,
  },
  languageSwitch: {},
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: HIGConstants.SPACING_LG,
    paddingBottom: HIGConstants.SPACING_SM,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
  },
  searchContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingBottom: HIGConstants.SPACING_SM,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    paddingHorizontal: HIGConstants.SPACING_MD,
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: HIGConstants.SPACING_SM,
    color: HIGColors.tertiaryLabel,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: HIGColors.label,
    paddingVertical: HIGConstants.SPACING_SM,
  },
  clearIcon: {
    fontSize: 16,
    color: HIGColors.tertiaryLabel,
    padding: HIGConstants.SPACING_XS,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingBottom: HIGConstants.SPACING_SM,
    gap: HIGConstants.SPACING_SM,
  },
  sortButton: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: 20,
    backgroundColor: HIGColors.secondarySystemBackground,
    borderWidth: 1,
    borderColor: HIGColors.gray4,
  },
  sortButtonActive: {
    backgroundColor: HIGColors.blue,
    borderColor: HIGColors.blue,
  },
  sortButtonText: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  advancedSearchButton: {
    marginLeft: 'auto',
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
  },
  advancedSearchText: {
    fontSize: 14,
    color: HIGColors.blue,
    fontWeight: '500',
  },
  loadingText: {
    marginTop: HIGConstants.SPACING_MD,
    fontSize: 16,
    color: HIGColors.secondaryLabel,
  },
  listContent: {
    paddingBottom: HIGConstants.SPACING_LG,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_SM,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
  },
  sectionCount: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
  },
  tastingCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    minHeight: 60,
    borderWidth: 1,
    borderColor: HIGColors.purple + '20',
    shadowColor: HIGColors.purple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_XS,
  },
  coffeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    flex: 1,
  },
  roasterName: {
    fontSize: 14,
    fontWeight: '400',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_XS,
  },
  date: {
    fontSize: 12,
    fontWeight: '400',
    color: HIGColors.tertiaryLabel,
  },
  matchScoreContainer: {
    borderRadius: 12,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
  },
  matchScore: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: HIGConstants.SPACING_XL * 3,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: HIGConstants.SPACING_MD,
  },
  emptyText: {
    fontSize: 17,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
  },
  emptySubtext: {
    color: HIGColors.tertiaryLabel,
  },
});