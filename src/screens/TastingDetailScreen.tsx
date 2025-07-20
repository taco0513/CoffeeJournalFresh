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
        <View style={styles.headerActions}>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Content will be added here */}
        <View style={styles.contentContainer}>
          <Text style={styles.placeholderText}>테이스팅 상세 내용이 여기에 표시됩니다.</Text>
        </View>
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
    width: 50,
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
});

export default TastingDetailScreen;