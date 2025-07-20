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
import { ITastingRecord } from '../services/realm/schemas';
import RealmService from '../services/realm/RealmService';
import { useToastStore } from '../stores/toastStore';
import { useUserStore } from '../stores/useUserStore';
import {
  HIGColors,
  HIGConstants,
} from '../styles/common';
import { NavigationButton } from '../components/common';
import { Colors } from '../constants/colors';
import { generateGuestMockData } from '../utils/guestMockData';

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
  
  // Check if in guest mode
  const isGuestMode = !currentUser || currentUser.username === 'Guest';

  // Get tastingId from route params
  const tastingId = route.params?.tastingId;

  useEffect(() => {
    loadTastingData();
  }, [tastingId, isGuestMode]);

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

      // If in guest mode, load from mock data
      if (isGuestMode) {
        const mockData = generateGuestMockData();
        const mockRecord = mockData.find(record => record.id === tastingId);
        
        if (!mockRecord) {
          if (isMountedRef.current) {
            setError('테이스팅 기록을 찾을 수 없습니다.');
          }
          return;
        }

        if (isMountedRef.current) {
          // Convert mock data to display format
          const plainRecord = {
            id: mockRecord.id,
            createdAt: mockRecord.createdAt,
            updatedAt: mockRecord.updatedAt,
            cafeName: mockRecord.cafeName,
            roastery: mockRecord.roastery,
            coffeeName: mockRecord.coffeeName,
            origin: mockRecord.origin,
            variety: mockRecord.variety,
            altitude: mockRecord.altitude,
            process: mockRecord.process,
            temperature: mockRecord.temperature,
            roasterNotes: mockRecord.roasterNotes,
            matchScoreTotal: mockRecord.matchScoreTotal,
            matchScoreFlavor: mockRecord.matchScoreFlavorNotes,
            matchScoreSensory: mockRecord.matchScoreSensoryAttributes,
            flavorNotes: mockRecord.flavorNotes ? mockRecord.flavorNotes.map(note => ({
              level: note.level,
              value: note.value,
              koreanValue: note.koreanValue,
            })) : [],
            sensoryAttribute: mockRecord.sensoryAttributes ? {
              body: mockRecord.sensoryAttributes.body,
              acidity: mockRecord.sensoryAttributes.acidity,
              sweetness: mockRecord.sensoryAttributes.sweetness,
              finish: mockRecord.sensoryAttributes.finish,
              mouthfeel: mockRecord.sensoryAttributes.mouthfeel[0] || 'Clean',
            } : null,
          };
          setTastingRecord(plainRecord);
        }
        return;
      }

      const record = realmService.getTastingRecordById(tastingId);
      
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
              const success = await RealmService.deleteTasting(tastingId);
              
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
      const parsed = JSON.parse(notes);
      
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
        {!isGuestMode && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEdit}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="테이스팅 기록 수정"
              accessibilityHint="이 테이스팅 기록을 편집합니다"
            >
              <Text style={styles.actionButtonText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
              disabled={isDeleting}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="테이스팅 기록 삭제"
              accessibilityHint="이 테이스팅 기록을 영구적으로 삭제합니다"
            >
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
        {isGuestMode && (
          <View style={styles.placeholder} />
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Coffee Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>커피 정보</Text>
          <View style={styles.card}>
            {/* Primary Information */}
            <View 
              style={styles.primaryInfo}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={`커피 정보: ${tastingRecord.coffeeName}, ${tastingRecord.roastery}, ${tastingRecord.temperature === 'hot' ? '뜨거운 커피' : '아이스 커피'}`}
            >
              <View style={styles.primaryInfoHeader}>
                <View style={styles.coffeeNameContainer}>
                  <Text style={styles.coffeeName}>{tastingRecord.coffeeName}</Text>
                  <Text style={styles.roastery}>{tastingRecord.roastery}</Text>
                </View>
                <View 
                  style={[styles.temperatureBadge, 
                    tastingRecord.temperature === 'hot' ? styles.hotBadge : styles.iceBadge]}
                  accessible={true}
                  accessibilityLabel={tastingRecord.temperature === 'hot' ? '뜨거운 커피' : '아이스 커피'}
                >
                  <Text style={[styles.temperatureText, 
                    tastingRecord.temperature === 'hot' ? styles.hotText : styles.iceText]}>
                    {tastingRecord.temperature === 'hot' ? '☕ Hot' : '🧊 Iced'}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Secondary Information */}
            <View style={styles.secondaryInfo}>
            {tastingRecord.cafeName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>카페</Text>
                <Text style={styles.infoValue}>{tastingRecord.cafeName}</Text>
              </View>
            )}
            {tastingRecord.origin && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>원산지</Text>
                <Text style={styles.infoValue}>{tastingRecord.origin}</Text>
              </View>
            )}
            {tastingRecord.variety && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>품종</Text>
                <Text style={styles.infoValue}>{tastingRecord.variety}</Text>
              </View>
            )}
            {tastingRecord.altitude && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>고도</Text>
                <Text style={styles.infoValue}>{tastingRecord.altitude}</Text>
              </View>
            )}
            {tastingRecord.process && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>가공방식</Text>
                <Text style={styles.infoValue}>{tastingRecord.process}</Text>
              </View>
            )}
            </View>
          </View>
        </View>

        {/* Roaster Notes Section */}
        {tastingRecord.roasterNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>로스터 노트</Text>
            <View style={styles.card}>
              {renderRoasterNotes(tastingRecord.roasterNotes)}
            </View>
          </View>
        )}

        {/* Flavor Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>선택한 맛</Text>
          <View style={styles.card}>
            <View style={styles.allFlavorTags}>
              {tastingRecord.flavorNotes.map((note, index) => (
                <View key={index} style={[styles.flavorTag, 
                  note.level === 1 ? styles.level1Tag :
                  note.level === 2 ? styles.level2Tag :
                  note.level === 3 ? styles.level3Tag :
                  styles.level4Tag
                ]}>
                  <Text style={styles.flavorTagText}>{note.value}</Text>
                </View>
              ))}
            </View>
            {/* Personal Tasting Comment */}
            {(tastingRecord.personalComment || isGuestMode) && (
              <Text style={styles.personalComment}>
                {tastingRecord.personalComment || 
                 '"풍부한 과일향과 초콜릿의 조화가 인상적이었고, 뒷맛까지 깔끔하게 이어지는 균형 잡힌 커피"'}
              </Text>
            )}
          </View>
        </View>

        {/* Sensory Evaluation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>감각 평가</Text>
          <View style={styles.card}>
            <View 
              style={styles.sensoryRow}
              accessible={true}
              accessibilityLabel={`바디감 ${tastingRecord.sensoryAttribute.body}점, ${getSensoryDescription('body', tastingRecord.sensoryAttribute.body)}`}
              accessibilityRole="progressbar"
            >
              <View style={styles.sensoryTopRow}>
                <Text style={styles.sensoryLabel}>바디감</Text>
                <Text style={styles.sensoryDescription}>{getSensoryDescription('body', tastingRecord.sensoryAttribute.body)}</Text>
                <Text style={styles.sensoryValue}>{tastingRecord.sensoryAttribute.body}/5</Text>
              </View>
              <View style={styles.sensoryBar}>
                <View style={[styles.sensoryFill, { width: `${tastingRecord.sensoryAttribute.body * 20}%` }]} />
              </View>
            </View>
            <View 
              style={styles.sensoryRow}
              accessible={true}
              accessibilityLabel={`산미 ${tastingRecord.sensoryAttribute.acidity}점, ${getSensoryDescription('acidity', tastingRecord.sensoryAttribute.acidity)}`}
              accessibilityRole="progressbar"
            >
              <View style={styles.sensoryTopRow}>
                <Text style={styles.sensoryLabel}>산미</Text>
                <Text style={styles.sensoryDescription}>{getSensoryDescription('acidity', tastingRecord.sensoryAttribute.acidity)}</Text>
                <Text style={styles.sensoryValue}>{tastingRecord.sensoryAttribute.acidity}/5</Text>
              </View>
              <View style={styles.sensoryBar}>
                <View style={[styles.sensoryFill, { width: `${tastingRecord.sensoryAttribute.acidity * 20}%` }]} />
              </View>
            </View>
            <View 
              style={styles.sensoryRow}
              accessible={true}
              accessibilityLabel={`단맛 ${tastingRecord.sensoryAttribute.sweetness}점, ${getSensoryDescription('sweetness', tastingRecord.sensoryAttribute.sweetness)}`}
              accessibilityRole="progressbar"
            >
              <View style={styles.sensoryTopRow}>
                <Text style={styles.sensoryLabel}>단맛</Text>
                <Text style={styles.sensoryDescription}>{getSensoryDescription('sweetness', tastingRecord.sensoryAttribute.sweetness)}</Text>
                <Text style={styles.sensoryValue}>{tastingRecord.sensoryAttribute.sweetness}/5</Text>
              </View>
              <View style={styles.sensoryBar}>
                <View style={[styles.sensoryFill, { width: `${tastingRecord.sensoryAttribute.sweetness * 20}%` }]} />
              </View>
            </View>
            <View 
              style={styles.sensoryRow}
              accessible={true}
              accessibilityLabel={`여운 ${tastingRecord.sensoryAttribute.finish}점, ${getSensoryDescription('finish', tastingRecord.sensoryAttribute.finish)}`}
              accessibilityRole="progressbar"
            >
              <View style={styles.sensoryTopRow}>
                <Text style={styles.sensoryLabel}>여운</Text>
                <Text style={styles.sensoryDescription}>{getSensoryDescription('finish', tastingRecord.sensoryAttribute.finish)}</Text>
                <Text style={styles.sensoryValue}>{tastingRecord.sensoryAttribute.finish}/5</Text>
              </View>
              <View style={styles.sensoryBar}>
                <View style={[styles.sensoryFill, { width: `${tastingRecord.sensoryAttribute.finish * 20}%` }]} />
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>질감</Text>
              <Text style={styles.infoValue}>{getMouthfeelKorean(tastingRecord.sensoryAttribute.mouthfeel)}</Text>
            </View>
          </View>
        </View>

        {/* Matching Score Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>매칭 점수</Text>
          <View style={styles.card}>
            <View style={styles.scoreExplanation}>
              <Text style={styles.scoreExplanationText}>
                💡 개인 취향 프로필과의 일치도를 나타냅니다
              </Text>
            </View>
            <View 
              style={styles.scoreContainer}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={`전체 매칭 점수 ${tastingRecord.matchScoreTotal}퍼센트, 맛 매칭 ${tastingRecord.matchScoreFlavor}퍼센트, 감각 매칭 ${tastingRecord.matchScoreSensory}퍼센트`}
            >
              <View style={styles.mainScore}>
                <Text style={styles.scoreValue}>{tastingRecord.matchScoreTotal}%</Text>
                <Text style={styles.scoreLabel}>전체 매칭</Text>
                <View style={[styles.scoreIndicator, 
                  tastingRecord.matchScoreTotal >= 80 ? styles.excellentScore :
                  tastingRecord.matchScoreTotal >= 60 ? styles.goodScore :
                  styles.averageScore
                ]} />
              </View>
              <View style={styles.subScores}>
                <View style={styles.subScore}>
                  <Text style={styles.subScoreValue}>{tastingRecord.matchScoreFlavor}%</Text>
                  <Text style={styles.subScoreLabel}>맛 매칭</Text>
                </View>
                <View style={styles.subScore}>
                  <Text style={styles.subScoreValue}>{tastingRecord.matchScoreSensory}%</Text>
                  <Text style={styles.subScoreLabel}>감각 매칭</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기록 정보</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>기록일</Text>
              <Text style={styles.infoValue}>{formatDate(tastingRecord.createdAt)}</Text>
            </View>
            {tastingRecord.updatedAt.getTime() !== tastingRecord.createdAt.getTime() && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>수정일</Text>
                <Text style={styles.infoValue}>{formatDate(tastingRecord.updatedAt)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Guest Mode Notice */}
        {isGuestMode && (
          <View style={styles.guestNotice}>
            <Text style={styles.guestNoticeText}>🔍 게스트 모드로 보는 샘플 데이터입니다</Text>
            <TouchableOpacity
              style={styles.loginPromptButton}
              onPress={() => navigation.navigate('Auth' as never)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="로그인하고 나만의 기록 시작하기"
              accessibilityHint="로그인 화면으로 이동하여 계정을 만들거나 로그인합니다"
            >
              <Text style={styles.loginPromptText}>로그인하고 나만의 기록 시작하기 →</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    // 공통 스타일로 대체됨
  },
  retryButtonText: {
    // 공통 스타일로 대체됨
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
  backButton: {
    paddingVertical: HIGConstants.SPACING_SM,
  },
  backButtonText: {
    fontSize: 17,
    color: HIGColors.blue,
    fontWeight: '400',
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HIGConstants.SPACING_SM,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: HIGColors.blue,
    minHeight: 36,
    minWidth: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: HIGColors.red,
  },
  deleteButtonText: {
    color: '#FFFFFF',
  },
  placeholder: {
    width: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  // Enhanced Information Hierarchy Styles
  primaryInfo: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  primaryInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  coffeeNameContainer: {
    flex: 1,
    marginRight: 12,
  },
  coffeeName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
    lineHeight: 30,
  },
  roastery: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
  },
  temperatureBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  hotBadge: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF8A50',
  },
  iceBadge: {
    backgroundColor: '#E3F2FD',
    borderColor: '#42A5F5',
  },
  temperatureText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hotText: {
    color: '#FF8A50',
  },
  iceText: {
    color: '#42A5F5',
  },
  secondaryInfo: {
    // No additional styles needed, uses existing infoRow styles
  },
  // Enhanced Flavor Notes Styles
  allFlavorTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  level1Tag: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  level2Tag: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 1,
  },
  level3Tag: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
    borderWidth: 1,
  },
  level4Tag: {
    backgroundColor: '#F3E5F5',
    borderColor: '#9C27B0',
    borderWidth: 1,
  },
  personalComment: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  // Enhanced Sensory Evaluation Styles
  sensoryRow: {
    marginBottom: 12,
  },
  sensoryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sensoryLabel: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
    minWidth: 50,
  },
  sensoryDescription: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sensoryValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'right',
  },
  sensoryBar: {
    height: 6,
    backgroundColor: '#E8E8E8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  sensoryFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 3,
  },
  // Enhanced Matching Score Styles
  scoreExplanation: {
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: HIGColors.blue,
  },
  scoreExplanationText: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '500',
    lineHeight: 18,
  },
  scoreIndicator: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  excellentScore: {
    backgroundColor: '#4CAF50',
  },
  goodScore: {
    backgroundColor: '#FF9800',
  },
  averageScore: {
    backgroundColor: '#9E9E9E',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  notesText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  // Roaster Notes Styles
  roasterFlavorTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  roasterFlavorTag: {
    backgroundColor: '#FFF8DC',
    borderColor: '#DEB887',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roasterFlavorText: {
    fontSize: 13,
    color: '#8B4513',
    fontWeight: '500',
  },
  roasterDescription: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  roasterNoteRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  roasterNoteLabel: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
    minWidth: 80,
    textTransform: 'capitalize',
  },
  roasterNoteValue: {
    fontSize: 13,
    color: '#333333',
    flex: 1,
    lineHeight: 18,
  },
  flavorTag: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  flavorTagText: {
    fontSize: 12,
    color: '#000000',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  mainScore: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000000',
  },
  scoreLabel: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    marginTop: 4,
  },
  subScores: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  subScore: {
    alignItems: 'center',
  },
  subScoreValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  subScoreLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginTop: 4,
  },
  // Guest Mode Styles
  guestNotice: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  guestNoticeText: {
    fontSize: 15,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 12,
  },
  loginPromptButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPromptText: {
    fontSize: 15,
    fontWeight: '600',
    color: HIGColors.blue,
  },
});

export default TastingDetailScreen;