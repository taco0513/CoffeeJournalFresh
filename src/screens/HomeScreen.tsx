import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '../components/LanguageSwitch';
import { HIGConstants, HIGColors, commonButtonStyles, commonTextStyles } from '../styles/common';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({navigation}: HomeScreenProps) {
  const { t } = useTranslation();

  // 최근 테이스팅 기록 (더미 데이터 - 나중에 Realm에서 가져올 예정)
  const recentTastings = [
    {
      id: '1',
      coffeeName: '에티오피아 예가체프',
      roasterName: '블루보틀',
      matchScore: 85,
      date: '2025-01-17',
    },
    {
      id: '2',
      coffeeName: '콜롬비아 수프리모',
      roasterName: '스터디카페',
      matchScore: 92,
      date: '2025-01-16',
    },
    {
      id: '3',
      coffeeName: '케냐 AA',
      roasterName: '프릳츠',
      matchScore: 78,
      date: '2025-01-15',
    },
  ];

  const handleNewTasting = () => {
    navigation.navigate('CoffeeInfo');
  };

  const handleViewHistory = () => {
    navigation.navigate('History');
  };

  const handleStats = () => {
    navigation.navigate('Stats');
  };

  const handleTastingDetail = (tastingId: string) => {
    navigation.navigate('TastingDetail', { tastingId });
  };

  const renderRecentTasting = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.tastingCard} 
      onPress={() => handleTastingDetail(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.coffeeName}>{item.coffeeName}</Text>
        <View style={styles.matchScoreContainer}>
          <Text style={styles.matchScore}>{item.matchScore}%</Text>
        </View>
      </View>
      <Text style={styles.roasterName}>{item.roasterName}</Text>
      <Text style={styles.date}>{item.date}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 네비게이션 바 영역 */}
      <View style={styles.navigationBar}>
        <Text style={styles.navigationTitle}>Coffee Journal</Text>
        <LanguageSwitch style={styles.languageSwitch} />
      </View>

      {/* 메인 컨텐츠 */}
      <View style={styles.content}>
        {/* 환영 메시지 */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>오늘의 커피는?</Text>
          <Text style={styles.welcomeSubtitle}>새로운 맛을 발견해보세요</Text>
        </View>

        {/* 새 테이스팅 시작 버튼 */}
        <TouchableOpacity 
          style={[commonButtonStyles.buttonPrimary, commonButtonStyles.buttonLarge, styles.newTastingButton]}
          onPress={handleNewTasting}
          activeOpacity={0.8}
        >
          <Text style={[commonTextStyles.buttonTextLarge, styles.newTastingButtonText]}>
            새 테이스팅 시작
          </Text>
        </TouchableOpacity>

        {/* 최근 기록 섹션 */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 기록</Text>
            <TouchableOpacity onPress={handleViewHistory}>
              <Text style={styles.seeAllText}>전체 보기</Text>
            </TouchableOpacity>
          </View>

          {recentTastings.length > 0 ? (
            <FlatList
              data={recentTastings}
              renderItem={renderRecentTasting}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>첫 테이스팅을 시작해보세요!</Text>
              <Text style={styles.emptyStateSubtext}>위의 버튼을 눌러 새로운 커피를 평가해보세요</Text>
            </View>
          )}
        </View>

        {/* 하단 액션 버튼들 */}
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={[commonButtonStyles.buttonOutline, styles.actionButton]}
            onPress={handleStats}
            activeOpacity={0.7}
          >
            <Text style={[commonTextStyles.buttonTextOutline, styles.actionButtonText]}>통계</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
  },
  navigationBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: HIGColors.systemBackground,
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  languageSwitch: {
    // 언어 스위치 스타일은 컴포넌트 내부에서 관리
  },
  content: {
    flex: 1,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  welcomeSection: {
    paddingTop: HIGConstants.SPACING_XL,
    paddingBottom: HIGConstants.SPACING_XL,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  welcomeSubtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
  },
  newTastingButton: {
    width: '100%',
    marginBottom: HIGConstants.SPACING_XL,
  },
  newTastingButtonText: {
    color: '#FFFFFF',
  },
  recentSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_MD,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: HIGColors.label,
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '400',
    color: HIGColors.blue,
  },
  tastingCard: {
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
    minHeight: 60, // HIG 최소 터치 영역 보장
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
  matchScoreContainer: {
    backgroundColor: HIGColors.green,
    borderRadius: 12,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
  },
  matchScore: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_XL * 2,
  },
  emptyStateText: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  emptyStateSubtext: {
    fontSize: 15,
    fontWeight: '400',
    color: HIGColors.tertiaryLabel,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomActions: {
    paddingTop: HIGConstants.SPACING_MD,
    paddingBottom: HIGConstants.SPACING_XL,
  },
  actionButton: {
    width: '100%',
  },
  actionButtonText: {
    color: HIGColors.blue,
  },
});