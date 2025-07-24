/**
 * CupNote - Market Intelligence Screen
 * 
 * Real-time coffee industry data powered by Firecrawl
 * Demonstrates Korean + US dual-market strategy implementation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  useFirecrawlCoffeeData,
  RoasterProfile,
  MarketTrends,
  CompetitorAnalysis 
} from '../services/FirecrawlCoffeeService';
import { HIGColors, HIGConstants } from '../styles/common';

interface MarketIntelligenceScreenProps {
  navigation: any;
}

const MarketIntelligenceScreen: React.FC<MarketIntelligenceScreenProps> = ({ navigation }) => {
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
    <View style={styles.header}>
      <Text style={styles.headerTitle}>☕ CupNote 시장 분석</Text>
      <Text style={styles.headerSubtitle}>실시간 커피 업계 동향</Text>
      
      {/* Market Toggle */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'korea' && styles.activeTab]}
          onPress={() => setActiveTab('korea')}
        >
          <Text style={[styles.tabText, activeTab === 'korea' && styles.activeTabText]}>
            🇰🇷 한국 시장
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'us' && styles.activeTab]}
          onPress={() => setActiveTab('us')}
        >
          <Text style={[styles.tabText, activeTab === 'us' && styles.activeTabText]}>
            🇺🇸 미국 시장
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMarketTrends = () => {
    if (!currentTrends) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 시장 트렌드</Text>
        
        <View style={styles.trendsContainer}>
          <View style={styles.trendCard}>
            <Text style={styles.trendLabel}>인기 맛</Text>
            <Text style={styles.trendValue}>
              {currentTrends.trendingFlavors.slice(0, 3).join(', ')}
            </Text>
          </View>
          
          <View style={styles.trendCard}>
            <Text style={styles.trendLabel}>인기 원산지</Text>
            <Text style={styles.trendValue}>
              {currentTrends.popularOrigins.slice(0, 2).join(', ')}
            </Text>
          </View>
          
          <View style={styles.trendCard}>
            <Text style={styles.trendLabel}>가격대</Text>
            <Text style={styles.trendValue}>
              {currentTrends.priceRange.min}-{currentTrends.priceRange.max} {currentTrends.priceRange.currency}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderRoasterProfiles = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏪 주요 로스터리</Text>
      
      {currentRoasters.map((roaster) => (
        <TouchableOpacity key={roaster.id} style={styles.roasterCard}>
          <View style={styles.roasterHeader}>
            <Text style={styles.roasterName}>
              {activeTab === 'korea' && roaster.nameKorean ? roaster.nameKorean : roaster.name}
            </Text>
            <Text style={styles.roasterLocation}>{roaster.location}</Text>
          </View>
          
          <Text style={styles.roasterDescription} numberOfLines={2}>
            {roaster.description}
          </Text>
          
          <View style={styles.specialtyContainer}>
            {roaster.specialty.slice(0, 3).map((spec, index) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>{spec}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCompetitorAnalysis = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🎯 경쟁사 분석</Text>
      
      {competitors.map((competitor, index) => (
        <View key={index} style={styles.competitorCard}>
          <View style={styles.competitorHeader}>
            <Text style={styles.competitorName}>{competitor.appName}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>⭐ {competitor.userRating}</Text>
              {competitor.downloadCount && (
                <Text style={styles.downloadText}>{competitor.downloadCount} 다운로드</Text>
              )}
            </View>
          </View>
          
          <View style={styles.featuresContainer}>
            {competitor.features.slice(0, 4).map((feature, idx) => (
              <View key={idx} style={styles.featureTag}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionSection}>
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => {
          Alert.alert(
            'Firecrawl 실시간 업데이트',
            '최신 데이터를 수집하고 있습니다...\n\n• 로스터리 신제품 정보\n• 가격 변동 추적\n• 트렌드 분석\n• 경쟁사 모니터링'
          );
        }}
      >
        <Text style={styles.buttonText}>🔄 실시간 업데이트</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={() => {
          navigation.navigate('DeveloperScreen');
        }}
      >
        <Text style={styles.secondaryButtonText}>⚙️ 개발자 도구</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={HIGColors.systemBlue} />
          <Text style={styles.loadingText}>Firecrawl로 데이터 수집 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderHeader()}
        {renderMarketTrends()}
        {renderRoasterProfiles()}
        {renderCompetitorAnalysis()}
        {renderActionButtons()}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔥 Powered by Firecrawl MCP | 실시간 웹 데이터 수집
          </Text>
          <Text style={styles.lastUpdated}>
            마지막 업데이트: {new Date().toLocaleString('ko-KR')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: HIGConstants.SPACING_MD,
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.secondaryLabel,
  },
  header: {
    backgroundColor: HIGColors.systemBlue,
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_XL,
  },
  headerTitle: {
    fontSize: HIGConstants.FONT_SIZE_H2,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: HIGConstants.SPACING_LG,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeTabText: {
    color: HIGColors.systemBlue,
  },
  section: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_LG,
  },
  sectionTitle: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  trendsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendCard: {
    flex: 1,
    backgroundColor: HIGColors.secondarySystemBackground,
    padding: HIGConstants.SPACING_MD,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  trendLabel: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    marginBottom: 4,
  },
  trendValue: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.label,
  },
  roasterCard: {
    backgroundColor: HIGColors.secondarySystemBackground,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
    borderRadius: 12,
  },
  roasterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roasterName: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '700',
    color: HIGColors.label,
  },
  roasterLocation: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
  },
  roasterDescription: {
    fontSize: HIGConstants.FONT_SIZE_FOOTNOTE,
    color: HIGColors.secondaryLabel,
    marginBottom: 8,
    lineHeight: 18,
  },
  specialtyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyTag: {
    backgroundColor: HIGColors.systemBlue + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: HIGConstants.FONT_SIZE_FOOTNOTE,
    color: HIGColors.systemBlue,
    fontWeight: '500',
  },
  competitorCard: {
    backgroundColor: HIGColors.secondarySystemBackground,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: HIGColors.systemOrange,
  },
  competitorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  competitorName: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '700',
    color: HIGColors.label,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: HIGConstants.FONT_SIZE_FOOTNOTE,
    color: HIGColors.systemOrange,
    fontWeight: '600',
  },
  downloadText: {
    fontSize: HIGConstants.FONT_SIZE_FOOTNOTE,
    color: HIGColors.secondaryLabel,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureTag: {
    backgroundColor: HIGColors.systemGray6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  featureText: {
    fontSize: HIGConstants.FONT_SIZE_FOOTNOTE,
    color: HIGColors.label,
  },
  actionSection: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_LG,
  },
  primaryButton: {
    backgroundColor: HIGColors.systemBlue,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  buttonText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: HIGColors.secondarySystemBackground,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
  },
  secondaryButtonText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.systemBlue,
  },
  footer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_XL,
    alignItems: 'center',
  },
  footerText: {
    fontSize: HIGConstants.FONT_SIZE_FOOTNOTE,
    color: HIGColors.systemBlue,
    fontWeight: '600',
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: HIGConstants.FONT_SIZE_FOOTNOTE,
    color: HIGColors.tertiaryLabel,
    marginTop: 4,
  },
};

export default MarketIntelligenceScreen;