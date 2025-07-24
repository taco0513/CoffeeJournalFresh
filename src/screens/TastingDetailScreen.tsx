import React, { useEffect, useState, useRef } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { 
  View, 
  Text, 
  ScrollView, 
  Button, 
  YStack, 
  XStack, 
  Card,
  Separator,
  Spinner,
  H1,
  H2,
  H3,
  Paragraph,
  SizableText
} from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types/navigation';
import { ITastingRecord, IFlavorNote } from '../services/realm/schemas';
import RealmService from '../services/realm/RealmService';
import { useToastStore } from '../stores/toastStore';
import { useUserStore } from '../stores/useUserStore';
import { flavorWheelKorean } from '../data/flavorWheelKorean';
import { NavigationButton } from '../components/common';

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
              await RealmService.getInstance().deleteTasting(tastingId);
              
              showSuccessToast('삭제 완료', '테이스팅 기록이 삭제되었습니다');
              // 삭제 성공 후 즉시 화면 이동
              navigation.goBack();
              
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
          <YStack>
            <XStack flexWrap="wrap" gap="$2" marginBottom="$3">
              {parsed.notes.map((note: string, index: number) => (
                <View 
                  key={index} 
                  backgroundColor="$gray5" 
                  paddingHorizontal="$3" 
                  paddingVertical="$2" 
                  borderRadius="$3" 
                  marginRight="$2" 
                  marginBottom="$2"
                >
                  <SizableText size="$3" color="$color">{note}</SizableText>
                </View>
              ))}
            </XStack>
            {parsed.description && (
              <Paragraph size="$3" color="$colorPress" fontStyle="italic" marginTop="$3">
                {parsed.description}
              </Paragraph>
            )}
          </YStack>
        );
      } else if (typeof parsed === 'object') {
        // Handle other JSON structures
        return (
          <YStack>
            {Object.entries(parsed).map(([key, value], index) => (
              <XStack key={index} marginBottom="$2">
                <SizableText size="$3" color="$colorPress" flex={0.3}>{key}:</SizableText>
                <SizableText size="$3" color="$color" flex={0.7}>
                  {Array.isArray(value) ? value.join(', ') : String(value)}
                </SizableText>
              </XStack>
            ))}
          </YStack>
        );
      }
    } catch (error) {
      // If not JSON, treat as plain text
    }
    
    // Fallback to plain text display
    return <Paragraph size="$4" color="$color" lineHeight="$6">{notes}</Paragraph>;
  };

  // Loading state
  if (loading || isDeleting) {
    return (
      <View flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
        <Spinner size="large" color="$color" />
        <SizableText marginTop="$4" size="$4" color="$color">
          {isDeleting ? '삭제 중...' : '로딩 중...'}
        </SizableText>
      </View>
    );
  }

  // Error state
  if (error || !tastingRecord) {
    return (
      <View flex={1} backgroundColor="$background" alignItems="center" justifyContent="center" padding="$6">
        <SizableText size="$4" color="$red10" textAlign="center" marginBottom="$4">
          {error || '데이터를 불러올 수 없습니다.'}
        </SizableText>
        <Button 
          size="$4" 
          theme="blue" 
          onPress={loadTastingData}
        >
          다시 시도
        </Button>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor="$background">
      {/* Navigation Bar */}
      <XStack 
        paddingHorizontal="$4" 
        paddingVertical="$3" 
        alignItems="center" 
        justifyContent="space-between"
        backgroundColor="$background"
        borderBottomWidth={0.5}
        borderBottomColor="$borderColor"
      >
        <Button 
          size="$3" 
          variant="outlined" 
          backgroundColor="transparent" 
          borderWidth={0}
          onPress={() => navigation.goBack()}
          accessible={true}
          accessibilityLabel="뒤로 가기"
        >
          <Text color="$blue10" fontSize="$5" fontWeight="600">‹ 뒤로</Text>
        </Button>
        <H3 flex={1} textAlign="center" color="$color">테이스팅 상세</H3>
        <Button 
          size="$3" 
          variant="outlined" 
          backgroundColor="transparent" 
          borderWidth={0}
          onPress={handleDelete}
          accessible={true}
          accessibilityLabel="삭제"
        >
          <Text color="$red10" fontSize="$4">삭제</Text>
        </Button>
      </XStack>
      
      <ScrollView 
        flex={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: '$6' }}
      >
        {/* Coffee Information */}
        <Card 
          margin="$4" 
          padding="$4" 
          borderRadius="$4" 
          backgroundColor="$background"
          borderWidth={0.5}
          borderColor="$borderColor"
          elevate
          animation="bouncy"
          scale={0.9}
          hoverStyle={{ scale: 0.925 }}
          pressStyle={{ scale: 0.875 }}
        >
          <XStack alignItems="center" justifyContent="space-between" marginBottom="$4">
            <H2 color="$color">커피 정보</H2>
            {/* Temperature Badge */}
            <View 
              paddingHorizontal="$3" 
              paddingVertical="$2" 
              borderRadius="$4" 
              borderWidth={1}
              backgroundColor={tastingRecord.temperature === 'hot' ? '$red2' : '$blue2'}
              borderColor={tastingRecord.temperature === 'hot' ? '$red8' : '$blue8'}
            >
              <SizableText 
                size="$2" 
                fontWeight="600"
                color={tastingRecord.temperature === 'hot' ? '$red11' : '$blue11'}
              >
                {tastingRecord.temperature === 'hot' ? 'Hot' : 'Ice'}
              </SizableText>
            </View>
          </XStack>
          
          <YStack space="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <SizableText size="$4" color="$colorPress" fontWeight="500" flex={1}>커피명</SizableText>
              <SizableText size="$4" color="$color" flex={2} textAlign="right">{tastingRecord.coffeeName}</SizableText>
            </XStack>
            <Separator />
            
            <XStack justifyContent="space-between" alignItems="center">
              <SizableText size="$4" color="$colorPress" fontWeight="500" flex={1}>로스터리</SizableText>
              <SizableText size="$4" color="$color" flex={2} textAlign="right">{tastingRecord.roastery}</SizableText>
            </XStack>
            <Separator />
          
          {/* Mode-based display: Cafe name for cafe mode, brewing method for home cafe mode */}
          {tastingRecord.mode === 'cafe' && tastingRecord.cafeName ? (
            <>
              <XStack justifyContent="space-between" alignItems="center">
                <SizableText size="$4" color="$colorPress" fontWeight="500" flex={1}>카페명</SizableText>
                <SizableText size="$4" color="$color" flex={2} textAlign="right">{tastingRecord.cafeName}</SizableText>
              </XStack>
              <Separator />
            </>
          ) : tastingRecord.mode === 'home_cafe' ? (
            <>
              <XStack justifyContent="space-between" alignItems="center">
                <SizableText size="$4" color="$colorPress" fontWeight="500" flex={1}>추출 방식</SizableText>
                <SizableText size="$4" color="$color" flex={2} textAlign="right">🏠 홈카페</SizableText>
              </XStack>
              <Separator />
            </>
          ) : null}
          
          {tastingRecord.origin && (
            <>
              <XStack justifyContent="space-between" alignItems="center">
                <SizableText size="$4" color="$colorPress" fontWeight="500" flex={1}>원산지</SizableText>
                <SizableText size="$4" color="$color" flex={2} textAlign="right">{tastingRecord.origin}</SizableText>
              </XStack>
              <Separator />
            </>
          )}
          
          {tastingRecord.variety && (
            <>
              <XStack justifyContent="space-between" alignItems="center">
                <SizableText size="$4" color="$colorPress" fontWeight="500" flex={1}>품종</SizableText>
                <SizableText size="$4" color="$color" flex={2} textAlign="right">{tastingRecord.variety}</SizableText>
              </XStack>
              <Separator />
            </>
          )}
          
          {tastingRecord.altitude && (
            <>
              <XStack justifyContent="space-between" alignItems="center">
                <SizableText size="$4" color="$colorPress" fontWeight="500" flex={1}>고도</SizableText>
                <SizableText size="$4" color="$color" flex={2} textAlign="right">{tastingRecord.altitude}</SizableText>
              </XStack>
              <Separator />
            </>
          )}
          
          {tastingRecord.process && (
            <>
              <XStack justifyContent="space-between" alignItems="center">
                <SizableText size="$4" color="$colorPress" fontWeight="500" flex={1}>가공법</SizableText>
                <SizableText size="$4" color="$color" flex={2} textAlign="right">{tastingRecord.process}</SizableText>
              </XStack>
            </>
          )}
          </YStack>
        </Card>

        {/* Match Score */}
        <Card 
          margin="$4" 
          padding="$4" 
          borderRadius="$4" 
          backgroundColor="$background"
          borderWidth={0.5}
          borderColor="$borderColor"
          elevate
          animation="bouncy"
          scale={0.9}
          hoverStyle={{ scale: 0.925 }}
          pressStyle={{ scale: 0.875 }}
        >
          <H2 color="$color" marginBottom="$4">매칭 스코어</H2>
          <XStack justifyContent="space-around" alignItems="center">
            <YStack alignItems="center" flex={1}>
              <SizableText size="$3" color="$colorPress" fontWeight="500" marginBottom="$2">전체</SizableText>
              <SizableText size="$7" color="$blue10" fontWeight="600">{tastingRecord.matchScoreTotal}점</SizableText>
            </YStack>
            <YStack alignItems="center" flex={1}>
              <SizableText size="$3" color="$colorPress" fontWeight="500" marginBottom="$2">향미</SizableText>
              <SizableText size="$7" color="$blue10" fontWeight="600">{tastingRecord.matchScoreFlavor}점</SizableText>
            </YStack>
            <YStack alignItems="center" flex={1}>
              <SizableText size="$3" color="$colorPress" fontWeight="500" marginBottom="$2">감각</SizableText>
              <SizableText size="$7" color="$blue10" fontWeight="600">{tastingRecord.matchScoreSensory}점</SizableText>
            </YStack>
          </XStack>
        </Card>

        {/* My Selected Flavors */}
        {tastingRecord.selectedFlavorPaths && tastingRecord.selectedFlavorPaths.length > 0 && (
          <Card 
            margin="$4" 
            padding="$4" 
            borderRadius="$4" 
            backgroundColor="$background"
            borderWidth={0.5}
            borderColor="$borderColor"
            elevate
            animation="bouncy"
            scale={0.9}
            hoverStyle={{ scale: 0.925 }}
            pressStyle={{ scale: 0.875 }}
          >
            <H2 color="$color" marginBottom="$4">내가 느낀 향미</H2>
            <XStack flexWrap="wrap" gap="$2">
              {tastingRecord.selectedFlavorPaths.map((path: any, index: number) => {
                const parts = [];
                if (path.level1) parts.push(getKoreanName(path.level1));
                if (path.level2) parts.push(getKoreanName(path.level2));
                if (path.level3) parts.push(path.level3); // level3는 이미 한글
                const flavorPath = parts.join(' > ');
                
                return (
                  <View 
                    key={index} 
                    backgroundColor="$green9" 
                    paddingHorizontal="$3" 
                    paddingVertical="$2" 
                    borderRadius="$4" 
                    marginBottom="$2"
                  >
                    <SizableText color="white" size="$3" fontWeight="500">{flavorPath}</SizableText>
                  </View>
                );
              })}
            </XStack>
          </Card>
        )}

        {/* Flavor Notes */}
        {tastingRecord.flavorNotes && tastingRecord.flavorNotes.length > 0 && (
          <Card 
            margin="$4" 
            padding="$4" 
            borderRadius="$4" 
            backgroundColor="$background"
            borderWidth={0.5}
            borderColor="$borderColor"
            elevate
            animation="bouncy"
            scale={0.9}
            hoverStyle={{ scale: 0.925 }}
            pressStyle={{ scale: 0.875 }}
          >
            <H2 color="$color" marginBottom="$4">로스터 향미 노트</H2>
            <XStack flexWrap="wrap" gap="$2">
              {tastingRecord.flavorNotes.map((note: IFlavorNote, index: number) => (
                <View 
                  key={index} 
                  backgroundColor="$blue9" 
                  paddingHorizontal="$3" 
                  paddingVertical="$2" 
                  borderRadius="$4" 
                  marginBottom="$2"
                >
                  <SizableText color="white" size="$3" fontWeight="500">
                    {note.koreanValue || note.value}
                  </SizableText>
                </View>
              ))}
            </XStack>
          </Card>
        )}

        {/* Sensory Attributes */}
        {tastingRecord.sensoryAttribute && (
          <Card 
            margin="$4" 
            padding="$4" 
            borderRadius="$4" 
            backgroundColor="$background"
            borderWidth={0.5}
            borderColor="$borderColor"
            elevate
            animation="bouncy"
            scale={0.9}
            hoverStyle={{ scale: 0.925 }}
            pressStyle={{ scale: 0.875 }}
          >
            <H2 color="$color" marginBottom="$4">사간 평가</H2>
            
            <YStack space="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <SizableText size="$4" color="$color" fontWeight="500">바디</SizableText>
                <SizableText size="$4" color="$colorPress">
                  {getSensoryDescription('body', tastingRecord.sensoryAttribute.body)}
                </SizableText>
              </XStack>
              <Separator />
              
              <XStack justifyContent="space-between" alignItems="center">
                <SizableText size="$4" color="$color" fontWeight="500">산미</SizableText>
                <SizableText size="$4" color="$colorPress">
                  {getSensoryDescription('acidity', tastingRecord.sensoryAttribute.acidity)}
                </SizableText>
              </XStack>
              <Separator />
              
              <XStack justifyContent="space-between" alignItems="center">
                <SizableText size="$4" color="$color" fontWeight="500">단맛</SizableText>
                <SizableText size="$4" color="$colorPress">
                  {getSensoryDescription('sweetness', tastingRecord.sensoryAttribute.sweetness)}
                </SizableText>
              </XStack>
              <Separator />
              
              <XStack justifyContent="space-between" alignItems="center">
                <SizableText size="$4" color="$color" fontWeight="500">여운</SizableText>
                <SizableText size="$4" color="$colorPress">
                  {getSensoryDescription('finish', tastingRecord.sensoryAttribute.finish)}
                </SizableText>
              </XStack>
              <Separator />
              
              <XStack justifyContent="space-between" alignItems="center">
                <SizableText size="$4" color="$color" fontWeight="500">마우스필</SizableText>
                <SizableText size="$4" color="$colorPress">
                  {getMouthfeelKorean(tastingRecord.sensoryAttribute.mouthfeel)}
                </SizableText>
              </XStack>
            </YStack>
          </Card>
        )}

        {/* Roaster Notes */}
        {tastingRecord.roasterNotes && (
          <Card 
            margin="$4" 
            padding="$4" 
            borderRadius="$4" 
            backgroundColor="$background"
            borderWidth={0.5}
            borderColor="$borderColor"
            elevate
            animation="bouncy"
            scale={0.9}
            hoverStyle={{ scale: 0.925 }}
            pressStyle={{ scale: 0.875 }}
          >
            <H2 color="$color" marginBottom="$4">로스터 노트</H2>
            {renderRoasterNotes(tastingRecord.roasterNotes)}
          </Card>
        )}

        {/* Home Cafe Information - only show for home_cafe mode */}
        {tastingRecord.mode === 'home_cafe' && tastingRecord.homeCafeData && (
          <Card 
            margin="$4" 
            padding="$4" 
            borderRadius="$4" 
            backgroundColor="$background"
            borderWidth={0.5}
            borderColor="$borderColor"
            elevate
            animation="bouncy"
            scale={0.9}
            hoverStyle={{ scale: 0.925 }}
            pressStyle={{ scale: 0.875 }}
          >
            <H2 color="$color" marginBottom="$4">🏠 홈카페 정보</H2>
            
            <YStack space="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <SizableText size="$4" color="$colorPress" fontWeight="500" flex={1}>추출 도구</SizableText>
                <SizableText size="$4" color="$color" flex={2} textAlign="right">
                  {tastingRecord.homeCafeData.equipment.brewingMethod === 'V60' ? 'V60' :
                   tastingRecord.homeCafeData.equipment.brewingMethod === 'Chemex' ? '케멕스' :
                   tastingRecord.homeCafeData.equipment.brewingMethod === 'AeroPress' ? '에어로프레스' :
                   tastingRecord.homeCafeData.equipment.brewingMethod === 'FrenchPress' ? '프렌치프레스' :
                   tastingRecord.homeCafeData.equipment.brewingMethod === 'Espresso' ? '에스프레소' :
                   tastingRecord.homeCafeData.equipment.brewingMethod}
                </SizableText>
              </XStack>
              <Separator />

              {tastingRecord.homeCafeData.equipment.grinder?.brand && (
                <>
                  <XStack justifyContent="space-between" alignItems="center">
                    <SizableText size="$4" color="$colorPress" fontWeight="500" flex={1}>그라인더</SizableText>
                    <SizableText size="$4" color="$color" flex={2} textAlign="right">
                      {tastingRecord.homeCafeData.equipment.grinder.brand}
                      {tastingRecord.homeCafeData.equipment.grinder.setting && 
                        ` (${tastingRecord.homeCafeData.equipment.grinder.setting})`}
                    </SizableText>
                  </XStack>
                  <Separator />
                </>
              )}

              <XStack justifyContent="space-between" alignItems="center">
                <SizableText size="$4" color="$colorPress" fontWeight="500" flex={1}>레시피</SizableText>
                <SizableText size="$4" color="$color" flex={2} textAlign="right">
                  {tastingRecord.homeCafeData.recipe.doseIn}g : {tastingRecord.homeCafeData.recipe.waterAmount}g 
                  ({tastingRecord.homeCafeData.recipe.ratio || '1:16'})
                </SizableText>
              </XStack>
              <Separator />

              {tastingRecord.homeCafeData.recipe.waterTemp > 0 && (
                <>
                  <XStack justifyContent="space-between" alignItems="center">
                    <SizableText size="$4" color="$colorPress" fontWeight="500" flex={1}>물온도</SizableText>
                    <SizableText size="$4" color="$color" flex={2} textAlign="right">{tastingRecord.homeCafeData.recipe.waterTemp}°C</SizableText>
                  </XStack>
                  <Separator />
                </>
              )}

              {tastingRecord.homeCafeData.recipe.bloomTime && tastingRecord.homeCafeData.recipe.bloomTime > 0 && (
                <>
                  <XStack justifyContent="space-between" alignItems="center">
                    <SizableText size="$4" color="$colorPress" fontWeight="500" flex={1}>블룸시간</SizableText>
                    <SizableText size="$4" color="$color" flex={2} textAlign="right">{tastingRecord.homeCafeData.recipe.bloomTime}초</SizableText>
                  </XStack>
                  <Separator />
                </>
              )}

              {tastingRecord.homeCafeData.recipe.totalBrewTime > 0 && (
                <>
                  <XStack justifyContent="space-between" alignItems="center">
                    <SizableText size="$4" color="$colorPress" fontWeight="500" flex={1}>추출시간</SizableText>
                    <SizableText size="$4" color="$color" flex={2} textAlign="right">
                      {Math.floor(tastingRecord.homeCafeData.recipe.totalBrewTime / 60)}분 {tastingRecord.homeCafeData.recipe.totalBrewTime % 60}초
                    </SizableText>
                  </XStack>
                  <Separator />
                </>
              )}

              {tastingRecord.homeCafeData.notes?.previousChange && (
                <>
                  <XStack justifyContent="space-between" alignItems="center">
                    <SizableText size="$4" color="$colorPress" fontWeight="500" flex={1}>이전 변경</SizableText>
                    <SizableText size="$4" color="$color" flex={2} textAlign="right">{tastingRecord.homeCafeData.notes.previousChange}</SizableText>
                  </XStack>
                  <Separator />
                </>
              )}

              {tastingRecord.homeCafeData.notes?.result && (
                <>
                  <XStack justifyContent="space-between" alignItems="center">
                    <SizableText size="$4" color="$colorPress" fontWeight="500" flex={1}>실험 결과</SizableText>
                    <SizableText size="$4" color="$color" flex={2} textAlign="right">{tastingRecord.homeCafeData.notes.result}</SizableText>
                  </XStack>
                  <Separator />
                </>
              )}

              {tastingRecord.homeCafeData.notes?.nextExperiment && (
                <XStack justifyContent="space-between" alignItems="center">
                  <SizableText size="$4" color="$colorPress" fontWeight="500" flex={1}>다음 실험</SizableText>
                  <SizableText size="$4" color="$color" flex={2} textAlign="right">{tastingRecord.homeCafeData.notes.nextExperiment}</SizableText>
                </XStack>
              )}
            </YStack>
          </Card>
        )}

        {/* Date Information */}
        <Card 
          margin="$4" 
          padding="$4" 
          borderRadius="$4" 
          backgroundColor="$background"
          borderWidth={0.5}
          borderColor="$borderColor"
          elevate
          animation="bouncy"
          scale={0.9}
          hoverStyle={{ scale: 0.925 }}
          pressStyle={{ scale: 0.875 }}
        >
          <H2 color="$color" marginBottom="$4">기록 정보</H2>
          <YStack space="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <SizableText size="$4" color="$colorPress" fontWeight="500" flex={1}>기록일시</SizableText>
              <SizableText size="$4" color="$color" flex={2} textAlign="right">{formatDate(tastingRecord.createdAt)}</SizableText>
            </XStack>
            {tastingRecord.updatedAt && tastingRecord.updatedAt !== tastingRecord.createdAt && (
              <>
                <Separator />
                <XStack justifyContent="space-between" alignItems="center">
                  <SizableText size="$4" color="$colorPress" fontWeight="500" flex={1}>수정일시</SizableText>
                  <SizableText size="$4" color="$color" flex={2} textAlign="right">{formatDate(tastingRecord.updatedAt)}</SizableText>
                </XStack>
              </>
            )}
          </YStack>
        </Card>
      </ScrollView>
    </View>
  );
};

// Styles migrated to Tamagui - no StyleSheet needed

export default TastingDetailScreen;