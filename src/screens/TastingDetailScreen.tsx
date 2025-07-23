import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { ITastingRecord, IFlavorNote } from '../services/realm/schemas';
import RealmService from '../services/realm/RealmService';
import { useToastStore } from '../stores/toastStore';
import { useUserStore } from '../stores/useUserStore';
import { flavorWheelKorean } from '../data/flavorWheelKorean';
import {
  HIGColors,
  HIGConstants,
} from '../styles/common';
import { NavigationButton } from '../components/common';
import { Colors } from '../constants/colors';

// Navigation types
type TastingDetailScreenRouteProp = RouteProp<RootStackParamList, 'TastingDetail'>;
type TastingDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TastingDetail'>;

const TastingDetailScreen = () => {
  const navigation = useNavigation<TastingDetailScreenNavigationProp>();
  const route = useRoute<TastingDetailScreenRouteProp>();
  const { showSuccessToast, showErrorToast } = useToastStore();
  const { currentUser } = useUserStore();
  
  const [tastingRecord, setTastingRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedFlavorLevels, setExpandedFlavorLevels] = useState<number[]>([1, 2]);
  
  const realmService = RealmService.getInstance();
  const isMountedRef = useRef(true);
  

  // Get tastingId from route params
  const tastingId = route.params?.tastingId;

  useEffect(() => {
    loadTastingData();
  }, [tastingId]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadTastingData = async () => {
    try {
      if (!isMountedRef.current) return;
      
      setLoading(true);
      setError(null);
      
      if (!tastingId) {
        if (isMountedRef.current) {
          setError('테이스팅 ID가 없습니다.');
        }
        return;
      }


      const record = await realmService.getTastingRecordById(tastingId);
      
      if (!record) {
        if (isMountedRef.current) {
          setError('테이스팅 기록을 찾을 수 없습니다.');
        }
        return;
      }

      if (isMountedRef.current) {
        // Realm 객체를 plain object로 복사하여 저장
        const plainRecord = {
          id: record.id,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          cafeName: record.cafeName,
          roastery: record.roastery,
          coffeeName: record.coffeeName,
          origin: record.origin,
          variety: record.variety,
          altitude: record.altitude,
          process: record.process,
          temperature: record.temperature,
          roasterNotes: record.roasterNotes,
          matchScoreTotal: record.matchScoreTotal,
          matchScoreFlavor: record.matchScoreFlavor,
          matchScoreSensory: record.matchScoreSensory,
          flavorNotes: record.flavorNotes ? Array.from(record.flavorNotes).map(note => ({
            level: note.level,
            value: note.value,
            koreanValue: note.koreanValue,
          })) : [],
          sensoryAttribute: record.sensoryAttribute ? {
            body: record.sensoryAttribute.body,
            acidity: record.sensoryAttribute.acidity,
            sweetness: record.sensoryAttribute.sweetness,
            finish: record.sensoryAttribute.finish,
            mouthfeel: record.sensoryAttribute.mouthfeel,
          } : null,
          selectedFlavorPaths: (record as any).selectedFlavorPaths ? Array.from((record as any).selectedFlavorPaths).map((path: any) => ({
            level1: path.level1,
            level2: path.level2,
            level3: path.level3,
          })) : [],
        };
        setTastingRecord(plainRecord);
      }
    } catch (err) {
      // console.error('Failed to load tasting data:', err);
      if (isMountedRef.current) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleEdit = () => {
    // TODO: Navigate to edit screen
    Alert.alert('수정', '수정 기능은 아직 구현되지 않았습니다.');
  };

  const handleDelete = () => {
    if (!tastingId) {
      showErrorToast('삭제 실패', '테이스팅 ID가 없습니다');
      return;
    }

    if (isDeleting) {
      return; // 이미 삭제 중이면 중복 실행 방지
    }

    Alert.alert(
      '삭제 확인',
      '정말 이 테이스팅 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              
              // 삭제 실행
              const success = await RealmService.getInstance().deleteTasting(tastingId);
              
              if (success) {
                showSuccessToast('삭제 완료', '테이스팅 기록이 삭제되었습니다');
                // 삭제 성공 후 즉시 화면 이동
                navigation.goBack();
              } else {
                showErrorToast('삭제 실패', '다시 시도해주세요');
                setIsDeleting(false);
              }
              
            } catch (error) {
              showErrorToast('삭제 실패', '다시 시도해주세요');
              // console.error('Delete error:', error);
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMouthfeelKorean = (mouthfeel: string) => {
    const mapping: { [key: string]: string } = {
      'Clean': '깔끔한',
      'Creamy': '크리미한',
      'Juicy': '쥬시한',
      'Silky': '실키한'
    };
    return mapping[mouthfeel] || mouthfeel;
  };

  // 한글 번역 함수
  const getKoreanName = (englishName: string): string => {
    return (flavorWheelKorean.translations as any)[englishName] || englishName;
  };

  const getSensoryDescription = (attribute: string, value: number) => {
    const descriptions: { [key: string]: string[] } = {
      body: ['Very Light', 'Light', 'Medium', 'Medium-Full', 'Full'],
      acidity: ['Low', 'Mild', 'Moderate', 'Bright', 'Very Bright'],
      sweetness: ['None', 'Subtle', 'Moderate', 'High', 'Very High'],
      finish: ['Short', 'Medium-Short', 'Medium', 'Medium-Long', 'Long']
    };
    return descriptions[attribute]?.[value - 1] || `${value}/5`;
  };

  const renderRoasterNotes = (notes: string) => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(notes) as Record<string, any>;
      
      if (parsed.notes && Array.isArray(parsed.notes)) {
        // Handle structured roaster notes with flavor array
        return (
          <View>
            <View style={styles.roasterFlavorTags}>
              {parsed.notes.map((note: string, index: number) => (
                <View key={index} style={styles.roasterFlavorTag}>
                  <Text style={styles.roasterFlavorText}>{note}</Text>
                </View>
              ))}
            </View>
            {parsed.description && (
              <Text style={styles.roasterDescription}>{parsed.description}</Text>
            )}
          </View>
        );
      } else if (typeof parsed === 'object') {
        // Handle other JSON structures
        return (
          <View>
            {Object.entries(parsed).map(([key, value], index) => (
              <View key={index} style={styles.roasterNoteRow}>
                <Text style={styles.roasterNoteLabel}>{key}:</Text>
                <Text style={styles.roasterNoteValue}>
                  {Array.isArray(value) ? value.join(', ') : String(value)}
                </Text>
              </View>
            ))}
          </View>
        );
      }
    } catch (error) {
      // If not JSON, treat as plain text
    }
    
    // Fallback to plain text display
    return <Text style={styles.notesText}>{notes}</Text>;
  };

  // Loading state
  if (loading || isDeleting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>
            {isDeleting ? '삭제 중...' : '로딩 중...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !tastingRecord) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || '데이터를 불러올 수 없습니다.'}</Text>
          <NavigationButton
            title="다시 시도"
            onPress={loadTastingData}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          accessibilityHint="이전 화면으로 돌아갑니다"
        >
          <Text style={styles.backButtonText}>‹ 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.navigationTitle}>테이스팅 상세</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="삭제"
            accessibilityHint="이 테이스팅 기록을 삭제합니다"
          >
            <Text style={styles.deleteButtonText}>삭제</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Coffee Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>커피 정보</Text>
            {/* Temperature Badge */}
            <View style={[
              styles.temperatureIcon, 
              tastingRecord.temperature === 'hot' ? styles.temperatureHot : styles.temperatureIce
            ]}>
              <Text style={[
                styles.temperatureText,
                tastingRecord.temperature === 'hot' ? styles.temperatureTextHot : styles.temperatureTextIce
              ]}>
                {tastingRecord.temperature === 'hot' ? 'Hot' : 'Ice'}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>커피명</Text>
            <Text style={styles.infoValue}>{tastingRecord.coffeeName}</Text>
          </View>
          
          <View style={[styles.infoRow, !tastingRecord.cafeName && !tastingRecord.origin && !tastingRecord.variety && !tastingRecord.altitude && !tastingRecord.process && styles.infoRowLast]}>
            <Text style={styles.infoLabel}>로스터리</Text>
            <Text style={styles.infoValue}>{tastingRecord.roastery}</Text>
          </View>
          
          {/* Mode-based display: Cafe name for cafe mode, brewing method for home cafe mode */}
          {tastingRecord.mode === 'cafe' && tastingRecord.cafeName ? (
            <View style={[styles.infoRow, !tastingRecord.origin && !tastingRecord.variety && !tastingRecord.altitude && !tastingRecord.process && styles.infoRowLast]}>
              <Text style={styles.infoLabel}>카페명</Text>
              <Text style={styles.infoValue}>{tastingRecord.cafeName}</Text>
            </View>
          ) : tastingRecord.mode === 'home_cafe' ? (
            <View style={[styles.infoRow, !tastingRecord.origin && !tastingRecord.variety && !tastingRecord.altitude && !tastingRecord.process && styles.infoRowLast]}>
              <Text style={styles.infoLabel}>추출 방식</Text>
              <Text style={styles.infoValue}>🏠 홈카페</Text>
            </View>
          ) : null}
          
          {tastingRecord.origin && (
            <View style={[styles.infoRow, !tastingRecord.variety && !tastingRecord.altitude && !tastingRecord.process && styles.infoRowLast]}>
              <Text style={styles.infoLabel}>원산지</Text>
              <Text style={styles.infoValue}>{tastingRecord.origin}</Text>
            </View>
          )}
          
          {tastingRecord.variety && (
            <View style={[styles.infoRow, !tastingRecord.altitude && !tastingRecord.process && styles.infoRowLast]}>
              <Text style={styles.infoLabel}>품종</Text>
              <Text style={styles.infoValue}>{tastingRecord.variety}</Text>
            </View>
          )}
          
          {tastingRecord.altitude && (
            <View style={[styles.infoRow, !tastingRecord.process && styles.infoRowLast]}>
              <Text style={styles.infoLabel}>고도</Text>
              <Text style={styles.infoValue}>{tastingRecord.altitude}</Text>
            </View>
          )}
          
          {tastingRecord.process && (
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>가공법</Text>
              <Text style={styles.infoValue}>{tastingRecord.process}</Text>
            </View>
          )}
          
        </View>

        {/* Match Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>매칭 스코어</Text>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>전체</Text>
              <Text style={styles.scoreValue}>{tastingRecord.matchScoreTotal}점</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>향미</Text>
              <Text style={styles.scoreValue}>{tastingRecord.matchScoreFlavor}점</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>감각</Text>
              <Text style={styles.scoreValue}>{tastingRecord.matchScoreSensory}점</Text>
            </View>
          </View>
        </View>

        {/* My Selected Flavors */}
        {tastingRecord.selectedFlavorPaths && tastingRecord.selectedFlavorPaths.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>내가 느낀 향미</Text>
            <View style={styles.flavorContainer}>
              {tastingRecord.selectedFlavorPaths.map((path: any, index: number) => {
                const parts = [];
                if (path.level1) parts.push(getKoreanName(path.level1));
                if (path.level2) parts.push(getKoreanName(path.level2));
                if (path.level3) parts.push(path.level3); // level3는 이미 한글
                const flavorPath = parts.join(' > ');
                
                return (
                  <View key={index} style={styles.myFlavorNote}>
                    <Text style={styles.myFlavorText}>{flavorPath}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Flavor Notes */}
        {tastingRecord.flavorNotes && tastingRecord.flavorNotes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>로스터 향미 노트</Text>
            <View style={styles.flavorContainer}>
              {tastingRecord.flavorNotes.map((note: IFlavorNote, index: number) => (
                <View key={index} style={styles.flavorNote}>
                  <Text style={styles.flavorText}>
                    {note.koreanValue || note.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Sensory Attributes */}
        {tastingRecord.sensoryAttribute && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>감각 평가</Text>
            
            <View style={styles.sensoryRow}>
              <Text style={styles.sensoryLabel}>바디</Text>
              <Text style={styles.sensoryValue}>
                {getSensoryDescription('body', tastingRecord.sensoryAttribute.body)}
              </Text>
            </View>
            
            <View style={styles.sensoryRow}>
              <Text style={styles.sensoryLabel}>산미</Text>
              <Text style={styles.sensoryValue}>
                {getSensoryDescription('acidity', tastingRecord.sensoryAttribute.acidity)}
              </Text>
            </View>
            
            <View style={styles.sensoryRow}>
              <Text style={styles.sensoryLabel}>단맛</Text>
              <Text style={styles.sensoryValue}>
                {getSensoryDescription('sweetness', tastingRecord.sensoryAttribute.sweetness)}
              </Text>
            </View>
            
            <View style={styles.sensoryRow}>
              <Text style={styles.sensoryLabel}>여운</Text>
              <Text style={styles.sensoryValue}>
                {getSensoryDescription('finish', tastingRecord.sensoryAttribute.finish)}
              </Text>
            </View>
            
            <View style={[styles.sensoryRow, styles.sensoryRowLast]}>
              <Text style={styles.sensoryLabel}>마우스필</Text>
              <Text style={styles.sensoryValue}>
                {getMouthfeelKorean(tastingRecord.sensoryAttribute.mouthfeel)}
              </Text>
            </View>
          </View>
        )}

        {/* Roaster Notes */}
        {tastingRecord.roasterNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>로스터 노트</Text>
            {renderRoasterNotes(tastingRecord.roasterNotes)}
          </View>
        )}

        {/* Home Cafe Information - only show for home_cafe mode */}
        {tastingRecord.mode === 'home_cafe' && tastingRecord.homeCafeData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏠 홈카페 정보</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>추출 도구</Text>
              <Text style={styles.infoValue}>
                {tastingRecord.homeCafeData.equipment.brewingMethod === 'V60' ? 'V60' :
                 tastingRecord.homeCafeData.equipment.brewingMethod === 'Chemex' ? '케멕스' :
                 tastingRecord.homeCafeData.equipment.brewingMethod === 'AeroPress' ? '에어로프레스' :
                 tastingRecord.homeCafeData.equipment.brewingMethod === 'FrenchPress' ? '프렌치프레스' :
                 tastingRecord.homeCafeData.equipment.brewingMethod === 'Espresso' ? '에스프레소' :
                 tastingRecord.homeCafeData.equipment.brewingMethod}
              </Text>
            </View>

            {tastingRecord.homeCafeData.equipment.grinder?.brand && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>그라인더</Text>
                <Text style={styles.infoValue}>
                  {tastingRecord.homeCafeData.equipment.grinder.brand}
                  {tastingRecord.homeCafeData.equipment.grinder.setting && 
                    ` (${tastingRecord.homeCafeData.equipment.grinder.setting})`}
                </Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>레시피</Text>
              <Text style={styles.infoValue}>
                {tastingRecord.homeCafeData.recipe.doseIn}g : {tastingRecord.homeCafeData.recipe.waterAmount}g 
                ({tastingRecord.homeCafeData.recipe.ratio || '1:16'})
              </Text>
            </View>

            {tastingRecord.homeCafeData.recipe.waterTemp > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>물온도</Text>
                <Text style={styles.infoValue}>{tastingRecord.homeCafeData.recipe.waterTemp}°C</Text>
              </View>
            )}

            {tastingRecord.homeCafeData.recipe.bloomTime && tastingRecord.homeCafeData.recipe.bloomTime > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>블룸시간</Text>
                <Text style={styles.infoValue}>{tastingRecord.homeCafeData.recipe.bloomTime}초</Text>
              </View>
            )}

            {tastingRecord.homeCafeData.recipe.totalBrewTime > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>추출시간</Text>
                <Text style={styles.infoValue}>
                  {Math.floor(tastingRecord.homeCafeData.recipe.totalBrewTime / 60)}분 {tastingRecord.homeCafeData.recipe.totalBrewTime % 60}초
                </Text>
              </View>
            )}

            {tastingRecord.homeCafeData.notes?.previousChange && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>이전 변경</Text>
                <Text style={styles.infoValue}>{tastingRecord.homeCafeData.notes.previousChange}</Text>
              </View>
            )}

            {tastingRecord.homeCafeData.notes?.result && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>실험 결과</Text>
                <Text style={styles.infoValue}>{tastingRecord.homeCafeData.notes.result}</Text>
              </View>
            )}

            {tastingRecord.homeCafeData.notes?.nextExperiment && (
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <Text style={styles.infoLabel}>다음 실험</Text>
                <Text style={styles.infoValue}>{tastingRecord.homeCafeData.notes.nextExperiment}</Text>
              </View>
            )}
          </View>
        )}

        {/* Date Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기록 정보</Text>
          <View style={[styles.infoRow, !(tastingRecord.updatedAt && tastingRecord.updatedAt !== tastingRecord.createdAt) && styles.infoRowLast]}>
            <Text style={styles.infoLabel}>기록일시</Text>
            <Text style={styles.infoValue}>{formatDate(tastingRecord.createdAt)}</Text>
          </View>
          {tastingRecord.updatedAt && tastingRecord.updatedAt !== tastingRecord.createdAt && (
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>수정일시</Text>
              <Text style={styles.infoValue}>{formatDate(tastingRecord.updatedAt)}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  backButton: {
    padding: HIGConstants.SPACING_XS,
    flex: 0,
  },
  backButtonText: {
    fontSize: 18,
    color: HIGColors.blue,
    fontWeight: '600',
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flex: 0,
    minWidth: 50,
    alignItems: 'flex-end',
  },
  deleteButton: {
    padding: HIGConstants.SPACING_XS,
  },
  deleteButtonText: {
    fontSize: 17,
    color: HIGColors.red,
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    padding: HIGConstants.SPACING_MD,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  placeholderText: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: HIGConstants.SPACING_MD,
    marginVertical: HIGConstants.SPACING_SM,
    padding: HIGConstants.SPACING_MD,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: HIGColors.gray4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_MD,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
  },
  temperatureIcon: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  temperatureHot: {
    backgroundColor: '#FFE5E5', // 따뜻한 연분홍
    borderColor: '#FF6B6B', // 따뜻한 빨강
  },
  temperatureIce: {
    backgroundColor: '#E5F3FF', // 차가운 연파랑
    borderColor: '#4A90E2', // 차가운 파랑
  },
  temperatureText: {
    fontSize: 12,
    fontWeight: '600',
  },
  temperatureTextHot: {
    color: '#D63031', // 따뜻한 빨강 텍스트
  },
  temperatureTextIce: {
    color: '#0984e3', // 차가운 파랑 텍스트
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_XS,
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray5,
    marginBottom: HIGConstants.SPACING_XS,
  },
  infoRowLast: {
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  infoLabel: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: HIGColors.label,
    fontWeight: '400',
    flex: 2,
    textAlign: 'right',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreLabel: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    fontWeight: '500',
    marginBottom: HIGConstants.SPACING_XS,
  },
  scoreValue: {
    fontSize: 20,
    color: HIGColors.blue,
    fontWeight: '600',
  },
  flavorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HIGConstants.SPACING_SM,
  },
  flavorNote: {
    backgroundColor: HIGColors.blue,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
    borderRadius: 16,
    marginBottom: HIGConstants.SPACING_XS,
  },
  flavorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  myFlavorNote: {
    backgroundColor: HIGColors.systemGreen,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
    borderRadius: 16,
    marginBottom: HIGConstants.SPACING_XS,
  },
  myFlavorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  sensoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_SM,
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray5,
  },
  sensoryRowLast: {
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  sensoryLabel: {
    fontSize: 16,
    color: HIGColors.label,
    fontWeight: '500',
  },
  sensoryValue: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    fontWeight: '400',
  },
  notesText: {
    fontSize: 16,
    color: HIGColors.label,
    lineHeight: 24,
  },
  roasterDescription: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    fontStyle: 'italic',
    marginTop: HIGConstants.SPACING_SM,
  },
  bottomSpacer: {
    height: HIGConstants.SPACING_XL,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: HIGConstants.SPACING_LG,
  },
  errorText: {
    fontSize: 16,
    color: HIGColors.red,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_MD,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: HIGConstants.SPACING_MD,
    fontSize: 16,
    color: HIGColors.label,
  },
  roasterFlavorTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: HIGConstants.SPACING_SM,
  },
  roasterFlavorTag: {
    backgroundColor: HIGColors.systemGray5,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
    borderRadius: HIGConstants.RADIUS_MD,
    marginRight: HIGConstants.SPACING_XS,
    marginBottom: HIGConstants.SPACING_XS,
  },
  roasterFlavorText: {
    fontSize: 14,
    color: HIGColors.label,
  },
  roasterNoteRow: {
    flexDirection: 'row',
    marginBottom: HIGConstants.SPACING_XS,
  },
  roasterNoteLabel: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    flex: 0.3,
  },
  roasterNoteValue: {
    fontSize: 14,
    color: HIGColors.label,
    flex: 0.7,
  },
});

export default TastingDetailScreen;