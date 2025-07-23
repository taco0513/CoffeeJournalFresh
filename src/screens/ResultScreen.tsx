import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView} from 'react-native';
// SF Symbols 제거됨
import {useTastingStore} from '../stores/tastingStore';
import {useToastStore} from '../stores/toastStore';
import { flavorWheelKorean } from '../data/flavorWheelKorean';
import {
  commonLayoutStyles,
  hitSlop,
  HIGColors,
  HIGConstants,
  commonButtonStyles,
  commonTextStyles,
} from '../styles/common';
import { NavigationButton } from '../components/common';
import { Colors } from '../constants/colors';
import { FONT_SIZE, TEXT_STYLES } from '../constants/typography';
import RealmService from '../services/realm/RealmService';
import tastingService from '../services/supabase/tastingService';
import { ErrorHandler, NetworkUtils } from '../utils/errorHandler';
import { useAchievementNotification } from '../contexts/AchievementContext';
import { useUserStore } from '../stores/useUserStore';
// import { ENABLE_SYNC } from '../../App';
const ENABLE_SYNC = true; // Enable sync for now

// 격려 메시지 함수
const getEncouragementMessage = (score: number): string => {
  if (score < 50) {
    return "사람마다 느끼는 맛이 달라요. 당신의 표현도 정답이에요!";
  } else if (score < 75) {
    return "좋은 시도예요! 점점 더 섬세하게 느끼고 계시네요!";
  } else if (score < 90) {
    return "훌륭해요! 🎉 감각이 정말 좋으세요!";
  } else {
    return "로스터와 비슷하게 느끼셨네요! 감각이 정말 좋으세요!";
  }
};

export default function ResultScreen({navigation}: any) {
  const {currentTasting, matchScoreTotal, reset, saveTasting, checkAchievements} = useTastingStore();
  const {showSuccessToast, showErrorToast} = useToastStore();
  const { showMultipleAchievements } = useAchievementNotification();
  const { currentUser } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);
  const [comparison, setComparison] = useState<any>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const [isSaved, setIsSaved] = useState(false); // 저장 완료 상태 추가

  // 자동 저장 실행
  useEffect(() => {
    const autoSave = async () => {
      if (!isSaved && currentTasting) {
        try {
          // Realm에 저장
          await saveTasting();
          
          // Supabase에도 저장 시도
          try {
            const tastingData = {
              ...currentTasting,
              id: `tasting_${Date.now()}`,
              matchScore: matchScoreTotal || 0,
            };
            
            if (ENABLE_SYNC) {
              await tastingService.saveTasting(tastingData);
            }
          } catch (supabaseError: any) {
            // Only show network error to user if it's a network issue
            if (NetworkUtils.isNetworkError(supabaseError)) {
              showErrorToast('오프라인 모드', '네트워크 연결이 없어 로컬에만 저장되었습니다.');
            }
          }
          
          // Check achievements after successful save
          if (currentUser?.id) {
            try {
              const newAchievements = await checkAchievements(currentUser.id);
              if (newAchievements.length > 0) {
                showMultipleAchievements(newAchievements);
              }
            } catch (error) {
              console.warn('Failed to check achievements:', error);
            }
          }
          
          showSuccessToast('저장 완료', '테이스팅이 자동으로 저장되었습니다');
          setIsSaved(true);
        } catch (error: any) {
          ErrorHandler.handle(error, '테이스팅 자동 저장');
        }
      }
    };
    
    autoSave();
  }, [isSaved, currentTasting, saveTasting, matchScoreTotal, checkAchievements, currentUser, showSuccessToast, showErrorToast, showMultipleAchievements]);

  // 비교 데이터 로드
  useEffect(() => {
    const loadComparisonData = async () => {
      if (!currentTasting?.coffeeName || !currentTasting?.roastery) {
        return;
      }

      setIsLoadingComparison(true);
      // console.log('🔍 [ResultScreen] 비교 데이터 로드 시작:', {
      //   coffeeName: currentTasting.coffeeName,
      //   roastery: currentTasting.roastery,
      //   origin: currentTasting.origin
      // });
      try {
        // Supabase 쿼리는 ENABLE_SYNC가 true일 때만 실행
        if (ENABLE_SYNC) {
          try {
            // Supabase에서 데이터 로드 시도
            // console.log('📊 [ResultScreen] Supabase에서 같은 커피 데이터 조회 중...');
            const supabaseComparison = await tastingService.getCoffeeComparison(
              currentTasting.coffeeName,
              currentTasting.roastery
            );
            

            if (supabaseComparison) {
              // console.log('✅ [ResultScreen] Supabase 비교 데이터 조회 성공:', {
              //   averageScore: supabaseComparison.averageScore,
              //   totalTastings: supabaseComparison.totalTastings,
              //   popularFlavorsCount: supabaseComparison.popularFlavors?.length || 0
              // });
              setComparison(supabaseComparison);
            } else {
              // console.log('⚠️ [ResultScreen] Supabase에 데이터 없음, Realm 데이터 사용');
              // Supabase에 데이터가 없으면 Realm 데이터 사용
              const realmService = RealmService.getInstance();
              
              const comparisonData = realmService.getSameCoffeeComparison(
                currentTasting.coffeeName,
                currentTasting.roastery
              );
              
              setComparison(comparisonData);
              // console.log('✅ [ResultScreen] Realm 데이터 로드 완료:', {
              //   comparison: comparisonData,
              // });
            }
          } catch (error) {
            // console.error('⚠️ [ResultScreen] Supabase 쿼리 실패 (무시됨):', error);
            // Supabase 실패 시 Realm 데이터로 폴백
            try {
              // console.log('🔄 [ResultScreen] Realm 백업 데이터 로드 시도...');
              const realmService = RealmService.getInstance();
              const comparisonData = realmService.getSameCoffeeComparison(
                currentTasting.coffeeName,
                currentTasting.roastery
              );
              setComparison(comparisonData);
              // console.log('✅ [ResultScreen] Realm 백업 데이터 로드 성공');
            } catch (realmError) {
              // console.error('❌ [ResultScreen] Realm 데이터 로드도 실패:', realmError);
            }
          }
        } else {
          // ENABLE_SYNC가 false일 때는 Realm 데이터만 사용
          // console.log('⏸️ [ResultScreen] Supabase 동기화 비활성화됨, Realm 데이터만 사용');
          const realmService = RealmService.getInstance();
          const comparisonData = realmService.getSameCoffeeComparison(
            currentTasting.coffeeName,
            currentTasting.roastery
          );
          setComparison(comparisonData);
          // console.log('✅ [ResultScreen] Realm 데이터 로드 완료');
        }
      } catch (error) {
        // console.error('❌ [ResultScreen] 비교 데이터 로드 실패:', error);
        setComparison(null);
      } finally {
        setIsLoadingComparison(false);
        // console.log('🏁 [ResultScreen] 비교 데이터 로드 완료');
      }
    };

    loadComparisonData();
  }, [currentTasting?.coffeeName, currentTasting?.roastery, currentTasting?.origin]);

  const handleNewTasting = () => {
    reset();
    // TastingFlow로 이동
    navigation.reset({
      index: 0,
      routes: [{
        name: 'TastingFlow',
        state: {
          routes: [{name: 'CoffeeInfo'}],
          index: 0,
        },
      }],
    });
  };

  const handleGoHome = () => {
    reset();
    // MainTabs로 이동
    navigation.reset({
      index: 0,
      routes: [{name: 'MainTabs'}],
    });
  };

  // currentTasting이 없으면 에러 방지
  if (!currentTasting) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>데이터 로드 중...</Text>
      </SafeAreaView>
    );
  }

  // 한글 번역 함수
  const getKoreanName = (englishName: string): string => {
    return (flavorWheelKorean.translations as any)[englishName] || englishName;
  };

  // 맛 노트 정리 - null 체크 추가
  const selectedFlavorNotes = currentTasting.selectedFlavors || [];
  const flavorList = selectedFlavorNotes.map((path: any) => {
    const parts = [];
    if (path.level1) parts.push(getKoreanName(path.level1));
    if (path.level2) parts.push(getKoreanName(path.level2));
    if (path.level3) parts.push(path.level3); // level3는 이미 한글
    if (path.level4) parts.push(path.level4);
    return parts.join(' > ');
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* HIG 준수 네비게이션 바 */}
      <View style={styles.navigationBar}>
        <TouchableOpacity onPress={handleGoHome}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navigationTitle}>결과</Text>
        <View style={styles.rightSection} />
      </View>
      
      {/* Progress Bar - Full width below header */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '100%' }]} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerIcon, {fontSize: 48, color: Colors.SUCCESS_GREEN}]}>✅</Text>
          <Text style={styles.title}>테이스팅 완료!</Text>
          <Text style={styles.score}>{matchScoreTotal || 0}% 일치</Text>
          <Text style={styles.encouragement}>
            {getEncouragementMessage(matchScoreTotal || 0)}
          </Text>
        </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>커피 정보</Text>
        </View>
        <Text style={styles.info}>카페: {currentTasting.cafeName || '-'}</Text>
        <Text style={styles.info}>로스터리: {currentTasting.roastery || '-'}</Text>
        <Text style={styles.info}>커피: {currentTasting.coffeeName || '-'}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>로스터 노트</Text>
        </View>
        <Text style={styles.info}>{currentTasting.roasterNotes || '로스터 노트가 없습니다'}</Text>
      </View>

      {currentTasting.personalComment && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>내 노트</Text>
          </View>
          <Text style={styles.info}>{currentTasting.personalComment}</Text>
        </View>
      )}

      {flavorList.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>내가 선택한 맛</Text>
          </View>
          {flavorList.map((flavor: string, index: number) => (
            <Text key={index} style={styles.flavorItem}>
              • {flavor}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>감각 평가</Text>
        </View>
        <Text style={styles.info}>바디감: {currentTasting.body || 3}/5</Text>
        <Text style={styles.info}>산미: {currentTasting.acidity || 3}/5</Text>
        <Text style={styles.info}>단맛: {currentTasting.sweetness || 3}/5</Text>
        <Text style={styles.info}>여운: {currentTasting.finish || 3}/5</Text>
        <Text style={[styles.info, styles.infoLast]}>입안 느낌: {currentTasting.mouthfeel || 'Clean'}</Text>
      </View>

      {/* 다른 사람들은? 섹션 - 항상 표시 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>다른 사람들은?</Text>
        </View>
        {isLoadingComparison ? (
          <Text style={styles.comparisonSubtitle}>데이터 로딩 중...</Text>
        ) : comparison && comparison.totalTastings > 1 ? (
          <>
            <Text style={styles.comparisonSubtitle}>
              같은 커피를 마신 {comparison.totalTastings}명의 평균
            </Text>
          
          <View style={styles.comparisonRow}>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>평균 점수</Text>
              <Text style={styles.comparisonValue}>{comparison.averageScore}%</Text>
            </View>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>내 점수</Text>
              <Text style={[
                styles.comparisonValue,
                {color: (matchScoreTotal || 0) > comparison.averageScore ? Colors.SUCCESS_GREEN : Colors.WARNING_ORANGE}
              ]}>
                {matchScoreTotal || 0}%
              </Text>
            </View>
          </View>

          {comparison.popularFlavors && comparison.popularFlavors.length > 0 && (
            <View style={styles.popularFlavorsContainer}>
              <Text style={styles.popularFlavorsTitle}>인기 맛 노트</Text>
              <View style={styles.flavorTagsContainer}>
                {comparison.popularFlavors.map((flavor: any, index: number) => (
                  <View key={index} style={styles.flavorTag}>
                    <Text style={styles.flavorTagText}>{flavor.value}</Text>
                    <Text style={styles.flavorTagPercent}>{flavor.percentage}%</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.sensoryComparisonContainer}>
            <Text style={styles.sensoryComparisonTitle}>감각 평가 비교</Text>
            <View style={styles.sensoryComparisonGrid}>
              <View style={styles.sensoryComparisonItem}>
                <Text style={styles.sensoryLabel}>바디감</Text>
                <Text style={styles.sensoryValue}>
                  {comparison.sensoryAverages.body}/5 <Text style={styles.sensoryMyValue}>(내: {currentTasting.body || 3}/5)</Text>
                </Text>
              </View>
              <View style={styles.sensoryComparisonItem}>
                <Text style={styles.sensoryLabel}>산미</Text>
                <Text style={styles.sensoryValue}>
                  {comparison.sensoryAverages.acidity}/5 <Text style={styles.sensoryMyValue}>(내: {currentTasting.acidity || 3}/5)</Text>
                </Text>
              </View>
              <View style={styles.sensoryComparisonItem}>
                <Text style={styles.sensoryLabel}>단맛</Text>
                <Text style={styles.sensoryValue}>
                  {comparison.sensoryAverages.sweetness}/5 <Text style={styles.sensoryMyValue}>(내: {currentTasting.sweetness || 3}/5)</Text>
                </Text>
              </View>
              <View style={styles.sensoryComparisonItem}>
                <Text style={styles.sensoryLabel}>여운</Text>
                <Text style={styles.sensoryValue}>
                  {comparison.sensoryAverages.finish}/5 <Text style={styles.sensoryMyValue}>(내: {currentTasting.finish || 3}/5)</Text>
                </Text>
              </View>
            </View>
          </View>
          </>
        ) : (
          <View style={styles.emptyComparisonContainer}>
            <Text style={styles.emptyComparisonText}>
              {comparison && comparison.totalTastings === 1 
                ? '🎉 이 커피의 첫 번째 테이스터입니다!'
                : comparison === null
                ? '🔍 아직 다른 사람의 기록이 없습니다'
                : '📊 비교 데이터를 불러올 수 없습니다'}
            </Text>
            {(comparison === null || (comparison && comparison.totalTastings === 0)) && (
              <Text style={styles.emptyComparisonSubtext}>
                다른 사람들이 이 커피를 테이스팅하면\n비교 데이터가 표시됩니다
              </Text>
            )}
          </View>
        )}
      </View>
      </ScrollView>

      {/* Bottom Button - Sticky */}
      <View style={styles.bottomContainer}>
        <View style={styles.actionButtonGroup}>
          <TouchableOpacity 
            style={[commonButtonStyles.buttonPrimary, styles.actionButton]}
            onPress={handleNewTasting}
            activeOpacity={0.8}
          >
            <Text style={[commonTextStyles.buttonText, styles.actionButtonText]}>New Tasting</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[commonButtonStyles.buttonOutline, styles.actionButton]}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <Text style={[commonTextStyles.buttonTextOutline, styles.actionButtonText]}>Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.secondarySystemBackground,
  },
  navigationBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.systemGray4,
  },
  backButton: {
    fontSize: 24,
    color: HIGColors.systemBlue,
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  rightSection: {
    width: 24,
  },
  progressBar: {
    height: 3,
    backgroundColor: HIGColors.systemGray5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: HIGColors.systemBlue,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for sticky bottom button
  },
  header: {
    alignItems: 'center',
    padding: HIGConstants.SPACING_XL,
    backgroundColor: '#FFFFFF',
    marginBottom: HIGConstants.SPACING_SM,
  },
  headerIcon: {
    marginBottom: HIGConstants.SPACING_MD,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  score: {
    fontSize: 32,
    fontWeight: '700',
    color: HIGColors.green,
    marginBottom: HIGConstants.SPACING_SM,
  },
  encouragement: {
    fontSize: 17,
    fontWeight: '400',
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    paddingHorizontal: HIGConstants.SPACING_LG,
    lineHeight: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: HIGConstants.SPACING_LG,
    marginVertical: HIGConstants.SPACING_XS,
    marginHorizontal: HIGConstants.SPACING_LG,
    borderRadius: HIGConstants.BORDER_RADIUS_LARGE,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  info: {
    fontSize: 15,
    fontWeight: '400',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  infoLast: {
    marginBottom: 0,
  },
  flavorItem: {
    fontSize: 15,
    fontWeight: '400',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  bottomContainer: {
    padding: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: HIGColors.systemGray4,
  },
  actionButtonGroup: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_SM,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  // 비교 섹션 스타일
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    marginRight: 8,
  },
  comparisonSubtitle: {
    ...TEXT_STYLES.BODY_SMALL,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  comparisonLabel: {
    ...TEXT_STYLES.CAPTION,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 8,
  },
  comparisonValue: {
    ...TEXT_STYLES.BODY_LARGE,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
  },
  // 인기 맛 노트 스타일
  popularFlavorsContainer: {
    marginBottom: 20,
  },
  popularFlavorsTitle: {
    ...TEXT_STYLES.BODY,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.TEXT_PRIMARY,
  },
  flavorTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flavorTag: {
    backgroundColor: Colors.FLAVOR_TAG_BG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  flavorTagText: {
    ...TEXT_STYLES.CAPTION,
    color: Colors.TEXT_PRIMARY,
    marginRight: 6,
  },
  flavorTagPercent: {
    fontSize: FONT_SIZE.TINY,
    color: Colors.TEXT_SECONDARY,
    fontWeight: '500',
  },
  // 감각 평가 비교 스타일
  sensoryComparisonContainer: {
    marginTop: 10,
  },
  sensoryComparisonTitle: {
    ...TEXT_STYLES.BODY,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.TEXT_PRIMARY,
  },
  sensoryComparisonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sensoryComparisonItem: {
    width: '48%',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  sensoryLabel: {
    ...TEXT_STYLES.CAPTION,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 4,
  },
  sensoryValue: {
    ...TEXT_STYLES.BODY_SMALL,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  sensoryMyValue: {
    ...TEXT_STYLES.CAPTION,
    color: Colors.PRIMARY,
    fontWeight: 'normal',
  },
  emptyComparisonContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: 8,
    marginTop: 10,
  },
  emptyComparisonText: {
    ...TEXT_STYLES.BODY_SMALL,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
  },
  emptyComparisonSubtext: {
    ...TEXT_STYLES.CAPTION,
    color: Colors.TEXT_TERTIARY,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});