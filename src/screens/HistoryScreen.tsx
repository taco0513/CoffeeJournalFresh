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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RealmService from '../services/realm/RealmService';
import { ITastingRecord } from '../services/realm/schemas';
import { Colors } from '../constants/colors';
import { Heading2, BodyText, Caption } from '../components/common';
import { HIGConstants, HIGColors } from '../styles/common';

interface GroupedTastings {
  title: string;
  data: ITastingRecord[];
}

export default function HistoryScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [allTastings, setAllTastings] = useState<ITastingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const realmService = RealmService.getInstance();
      const tastings = realmService.getTastingRecords({ isDeleted: false });
      setAllTastings(Array.from(tastings));
    } catch (error) {
      // console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and group tastings
  const groupedTastings = useMemo(() => {
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
  }, [allTastings, searchQuery, sortBy]);

  const renderTastingItem = ({ item }: { item: ITastingRecord }) => (
    <TouchableOpacity
      style={styles.tastingCard}
      onPress={() => navigation.navigate('TastingDetail' as never, { tastingId: item.id } as never)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.coffeeName}>{item.coffeeName}</Text>
          <Text style={styles.roastery}>{item.roastery}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.matchScore}>{item.matchScoreTotal}%</Text>
          <Text style={styles.scoreLabel}>매칭률</Text>
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        {item.cafeName && (
          <Text style={styles.detailText}>📍 {item.cafeName}</Text>
        )}
        <Text style={styles.detailText}>
          ⏰ {item.createdAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
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

  const renderSectionHeader = ({ section }: { section: GroupedTastings }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>{section.data.length}개</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.GRADIENT_BROWN} />
          <BodyText style={styles.loadingText}>기록 불러오는 중...</BodyText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Heading2>테이스팅 기록</Heading2>
        <Text style={styles.totalCount}>총 {allTastings.length}개의 기록</Text>
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>☕️</Text>
            <BodyText style={styles.emptyText}>
              {searchQuery ? '검색 결과가 없습니다' : '아직 기록이 없습니다'}
            </BodyText>
            <Caption style={styles.emptySubtext}>
              {searchQuery ? '다른 검색어를 시도해보세요' : '첫 테이스팅을 기록해보세요'}
            </Caption>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: HIGConstants.SPACING_LG,
    paddingBottom: HIGConstants.SPACING_SM,
    backgroundColor: HIGColors.systemBackground,
  },
  totalCount: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    marginTop: HIGConstants.SPACING_XS,
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
    marginTop: HIGConstants.SPACING_SM,
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
    backgroundColor: HIGColors.systemBackground,
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
    backgroundColor: HIGColors.secondarySystemBackground,
    marginHorizontal: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: HIGConstants.SPACING_SM,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: HIGConstants.SPACING_SM,
  },
  coffeeName: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  roastery: {
    fontSize: 15,
    color: HIGColors.secondaryLabel,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: HIGColors.systemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
    minWidth: 56,
  },
  matchScore: {
    fontSize: 20,
    fontWeight: '700',
    color: HIGColors.blue,
  },
  scoreLabel: {
    fontSize: 11,
    color: HIGColors.secondaryLabel,
    marginTop: 1,
  },
  cardDetails: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_SM,
  },
  detailText: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
  },
  flavorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HIGConstants.SPACING_XS,
    alignItems: 'center',
  },
  flavorTag: {
    backgroundColor: HIGColors.gray5,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
    borderRadius: 12,
  },
  flavorText: {
    fontSize: 12,
    color: HIGColors.label,
    fontWeight: '500',
  },
  moreText: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
    marginLeft: HIGConstants.SPACING_XS,
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