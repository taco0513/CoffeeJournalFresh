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
  SizableText,
  styled,
  useTheme,
  AnimatePresence,
} from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types/navigation';
import { ITastingRecord, IFlavorNote } from '../../services/realm/schemas';
import RealmService from '../../services/realm/RealmService';
import { useToastStore } from '../../stores/toastStore';
import { useUserStore } from '../../stores/useUserStore';
import { flavorWheelKorean } from '../../data/flavorWheelKorean';
import { NavigationButton } from '../../components-tamagui';

// Navigation types
type TastingDetailScreenRouteProp = RouteProp<RootStackParamList, 'TastingDetail'>;
type TastingDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TastingDetail'>;

// Styled Components
const Container = styled(View, {
  name: 'TastingDetailContainer',
  flex: 1,
  backgroundColor: '$backgroundHover',
});

const NavigationBar = styled(XStack, {
  name: 'TastingDetailNavigation',
  height: 44,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  backgroundColor: '$background',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
});

const LoadingContainer = styled(YStack, {
  name: 'LoadingContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$lg',
});

const ErrorContainer = styled(YStack, {
  name: 'ErrorContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$xl',
  gap: '$lg',
});

const InfoCard = styled(Card, {
  name: 'InfoCard',
  margin: '$4',
  padding: '$4',
  borderRadius: '$4',
  backgroundColor: '$background',
  borderWidth: 0.5,
  borderColor: '$borderColor',
  elevate: true,
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  hoverStyle: {
    scale: 1.02,
  },
  pressStyle: {
    scale: 0.98,
  },
});

const SectionTitle = styled(H2, {
  name: 'SectionTitle',
  color: '$color',
  marginBottom: '$4',
  fontSize: '$6',
  fontWeight: '600',
});

const InfoRow = styled(XStack, {
  name: 'InfoRow',
  justifyContent: 'space-between',
  alignItems: 'center',
  minHeight: 40,
});

const InfoLabel = styled(SizableText, {
  name: 'InfoLabel',
  size: '$4',
  color: '$gray11',
  fontWeight: '500',
  flex: 1,
});

const InfoValue = styled(SizableText, {
  name: 'InfoValue',
  size: '$4',
  color: '$color',
  flex: 2,
  textAlign: 'right',
  fontWeight: '400',
});

const ScoreCard = styled(Card, {
  name: 'ScoreCard',
  margin: '$4',
  padding: '$4',
  borderRadius: '$4',
  backgroundColor: '$cupBlueLight',
  borderWidth: 1,
  borderColor: '$cupBlue',
  elevate: true,
  animation: 'bouncy',
  enterStyle: {
    opacity: 0,
    scale: 0.9,
    y: 30,
  },
});

const ScoreValue = styled(SizableText, {
  name: 'ScoreValue',
  size: '$7',
  color: '$cupBlue',
  fontWeight: '700',
});

const FlavorChip = styled(XStack, {
  name: 'FlavorChip',
  backgroundColor: '$backgroundHover',
  paddingHorizontal: '$md',
  paddingVertical: '$sm',
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '$borderColor',
  alignItems: 'center',
  marginBottom: '$sm',
  animation: 'quick',
  pressStyle: {
    scale: 0.95,
    backgroundColor: '$cupBlueLight',
  },
});

const ChipText = styled(Text, {
  name: 'ChipText',
  fontSize: '$3',
  color: '$color',
  fontWeight: '500',
});

const DeleteButton = styled(Button, {
  name: 'DeleteButton',
  backgroundColor: '$red9',
  color: 'white',
  borderRadius: '$3',
  fontWeight: '600',
  pressStyle: {
    backgroundColor: '$red10',
    scale: 0.95,
  },
});

const TastingDetailScreen = () => {
  const theme = useTheme();
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
          roasterNotes: record.roasterNotes,
          temperature: record.temperature,
          personalComment: record.personalComment,
          mode: record.mode,
          homeCafeData: record.homeCafeData ? 
            (typeof record.homeCafeData === 'string' ? JSON.parse(record.homeCafeData) : record.homeCafeData) : null,
          selectedFlavorPaths: record.flavorNotes || [],
          sensoryAttribute: record.sensoryAttribute ? {
            body: record.sensoryAttribute.body,
            acidity: record.sensoryAttribute.acidity,
            sweetness: record.sensoryAttribute.sweetness,
            finish: record.sensoryAttribute.finish,
            mouthfeel: record.sensoryAttribute.mouthfeel,
          } : null,
          matchScoreTotal: record.matchScoreTotal || 0,
          matchScoreFlavor: record.matchScoreFlavor || 0,
          matchScoreSensory: record.matchScoreSensory || 0,
        };
        setTastingRecord(plainRecord);
      }
    } catch (error: any) {
      console.error('Error loading tasting data:', error);
      if (isMountedRef.current) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '테이스팅 기록 삭제',
      '이 테이스팅 기록을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await realmService.deleteTastingRecord(tastingId);
              showSuccessToast('성공', '테이스팅 기록이 삭제되었습니다.');
              navigation.goBack();
            } catch (error: any) {
              console.error('Error deleting tasting record:', error);
              showErrorToast('오류', '삭제 중 오류가 발생했습니다.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  };

  const getKoreanName = (englishName: string): string => {
    return (flavorWheelKorean.translations as any)[englishName] || englishName;
  };

  const renderFlavorPath = (path: any, index: number) => {
    const parts = [];
    if (path.level1) parts.push(getKoreanName(path.level1));
    if (path.level2) parts.push(getKoreanName(path.level2));
    if (path.level3) parts.push(path.level3);
    if (path.level4) parts.push(path.level4);
    const displayText = parts.join(' > ');

    return (
      <FlavorChip key={index}>
        <ChipText>{displayText}</ChipText>
      </FlavorChip>
    );
  };

  const renderRoasterNotes = (notes: string) => {
    return (
      <Paragraph size="$4" color="$color" lineHeight="$6">
        {notes}
      </Paragraph>
    );
  };

  const getSensoryDescription = (type: string, value: number): string => {
    const descriptions = {
      body: ['Very Light', 'Light', 'Medium-Light', 'Medium', 'Medium-Full', 'Full', 'Very Full'],
      acidity: ['Very Low', 'Low', 'Medium-Low', 'Medium', 'Medium-High', 'High', 'Very High'],
      sweetness: ['None', 'Subtle', 'Mild', 'Moderate', 'High', 'Very High', 'Intense'],
      finish: ['Very Short', 'Short', 'Medium-Short', 'Medium', 'Medium-Long', 'Long', 'Very Long'],
    };
    
    const desc = (descriptions as any)[type];
    if (!desc) return value.toString();
    
    const index = Math.max(0, Math.min(desc.length - 1, Math.round(value) - 1));
    return desc[index];
  };

  const getMouthfeelKorean = (mouthfeel: string): string => {
    const translations: { [key: string]: string } = {
      'Smooth': '부드러운',
      'Creamy': '크리미한',
      'Silky': '실크 같은',
      'Round': '둥근',
      'Full': '풍부한',
      'Clean': '깔끔한',
      'Crisp': '상쾌한',
      'Bright': '밝은',
      'Juicy': '과즙 같은',
      'Tea-like': '차 같은',
      'Thin': '얇은',
      'Watery': '물 같은',
    };
    return translations[mouthfeel] || mouthfeel;
  };

  if (loading) {
    return (
      <Container>
        <NavigationBar>
          <Button unstyled onPress={() => navigation.goBack()} pressStyle={{ opacity: 0.7 }}>
            <Text fontSize="$6" color="$cupBlue">←</Text>
          </Button>
          <Text fontSize="$4" fontWeight="600" color="$color">테이스팅 상세</Text>
          <YStack width={24} />
        </NavigationBar>
        
        <LoadingContainer>
          <Spinner size="large" color="$cupBlue" />
          <Text fontSize="$4" color="$gray11">로딩 중...</Text>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <NavigationBar>
          <Button unstyled onPress={() => navigation.goBack()} pressStyle={{ opacity: 0.7 }}>
            <Text fontSize="$6" color="$cupBlue">←</Text>
          </Button>
          <Text fontSize="$4" fontWeight="600" color="$color">테이스팅 상세</Text>
          <YStack width={24} />
        </NavigationBar>
        
        <ErrorContainer>
          <Text fontSize="$6" color="$red9">⚠️</Text>
          <Text fontSize="$5" fontWeight="600" color="$color" textAlign="center">
            오류가 발생했습니다
          </Text>
          <Text fontSize="$4" color="$gray11" textAlign="center">
            {error}
          </Text>
          <Button 
            backgroundColor="$cupBlue" 
            color="white" 
            onPress={loadTastingData}
            pressStyle={{ scale: 0.95 }}
          >
            다시 시도
          </Button>
        </ErrorContainer>
      </Container>
    );
  }

  if (!tastingRecord) {
    return (
      <Container>
        <NavigationBar>
          <Button unstyled onPress={() => navigation.goBack()} pressStyle={{ opacity: 0.7 }}>
            <Text fontSize="$6" color="$cupBlue">←</Text>
          </Button>
          <Text fontSize="$4" fontWeight="600" color="$color">테이스팅 상세</Text>
          <YStack width={24} />
        </NavigationBar>
        
        <ErrorContainer>
          <Text fontSize="$4" color="$gray11">테이스팅 기록을 찾을 수 없습니다.</Text>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      {/* Navigation Bar */}
      <NavigationBar>
        <Button unstyled onPress={() => navigation.goBack()} pressStyle={{ opacity: 0.7 }}>
          <Text fontSize="$6" color="$cupBlue">←</Text>
        </Button>
        <Text fontSize="$4" fontWeight="600" color="$color">테이스팅 상세</Text>
        <Button unstyled onPress={handleDelete} disabled={isDeleting} pressStyle={{ opacity: 0.7 }}>
          {isDeleting ? (
            <Spinner size="small" color="$red9" />
          ) : (
            <Text fontSize="$4" color="$red9" fontWeight="500">삭제</Text>
          )}
        </Button>
      </NavigationBar>

      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <AnimatePresence>
          {/* Coffee Information */}
          <InfoCard>
            <SectionTitle>커피 정보</SectionTitle>
            <YStack space="$3">
              <InfoRow>
                <InfoLabel>로스터리</InfoLabel>
                <InfoValue>{tastingRecord.roastery}</InfoValue>
              </InfoRow>
              <Separator />
              
              <InfoRow>
                <InfoLabel>커피명</InfoLabel>
                <InfoValue>{tastingRecord.coffeeName}</InfoValue>
              </InfoRow>
              <Separator />
              
              {tastingRecord.mode === 'cafe' ? (
                <>
                  <InfoRow>
                    <InfoLabel>카페</InfoLabel>
                    <InfoValue>{tastingRecord.cafeName}</InfoValue>
                  </InfoRow>
                  <Separator />
                </>
              ) : tastingRecord.mode === 'home_cafe' ? (
                <>
                  <InfoRow>
                    <InfoLabel>추출 방식</InfoLabel>
                    <InfoValue>🏠 홈카페</InfoValue>
                  </InfoRow>
                  <Separator />
                </>
              ) : null}
              
              {tastingRecord.origin && (
                <>
                  <InfoRow>
                    <InfoLabel>원산지</InfoLabel>
                    <InfoValue>{tastingRecord.origin}</InfoValue>
                  </InfoRow>
                  <Separator />
                </>
              )}
              
              {tastingRecord.variety && (
                <>
                  <InfoRow>
                    <InfoLabel>품종</InfoLabel>
                    <InfoValue>{tastingRecord.variety}</InfoValue>
                  </InfoRow>
                  <Separator />
                </>
              )}
              
              {tastingRecord.altitude && (
                <>
                  <InfoRow>
                    <InfoLabel>고도</InfoLabel>
                    <InfoValue>{tastingRecord.altitude}</InfoValue>
                  </InfoRow>
                  <Separator />
                </>
              )}
              
              {tastingRecord.process && (
                <InfoRow>
                  <InfoLabel>가공법</InfoLabel>
                  <InfoValue>{tastingRecord.process}</InfoValue>
                </InfoRow>
              )}
            </YStack>
          </InfoCard>

          {/* Match Score */}
          <ScoreCard>
            <SectionTitle>매칭 스코어</SectionTitle>
            <XStack justifyContent="space-around" alignItems="center">
              <YStack alignItems="center" flex={1}>
                <SizableText size="$3" color="$gray11" fontWeight="500" marginBottom="$2">전체</SizableText>
                <ScoreValue>{tastingRecord.matchScoreTotal}점</ScoreValue>
              </YStack>
              <YStack alignItems="center" flex={1}>
                <SizableText size="$3" color="$gray11" fontWeight="500" marginBottom="$2">향미</SizableText>
                <ScoreValue>{tastingRecord.matchScoreFlavor}점</ScoreValue>
              </YStack>
              <YStack alignItems="center" flex={1}>
                <SizableText size="$3" color="$gray11" fontWeight="500" marginBottom="$2">감각</SizableText>
                <ScoreValue>{tastingRecord.matchScoreSensory}점</ScoreValue>
              </YStack>
            </XStack>
          </ScoreCard>

          {/* My Selected Flavors */}
          {tastingRecord.selectedFlavorPaths && tastingRecord.selectedFlavorPaths.length > 0 && (
            <InfoCard>
              <SectionTitle>내가 느낀 향미</SectionTitle>
              <XStack flexWrap="wrap" gap="$2">
                {tastingRecord.selectedFlavorPaths.map((path: any, index: number) => renderFlavorPath(path, index))}
              </XStack>
            </InfoCard>
          )}

          {/* Personal Comment */}
          {tastingRecord.personalComment && (
            <InfoCard>
              <SectionTitle>개인 코멘트</SectionTitle>
              <Paragraph size="$4" color="$color" lineHeight="$6">
                {tastingRecord.personalComment}
              </Paragraph>
            </InfoCard>
          )}

          {/* Sensory Attributes */}
          {tastingRecord.sensoryAttribute && (
            <InfoCard>
              <SectionTitle>감각 평가</SectionTitle>
              <YStack space="$3">
                <InfoRow>
                  <InfoLabel>바디</InfoLabel>
                  <InfoValue>{getSensoryDescription('body', tastingRecord.sensoryAttribute.body)}</InfoValue>
                </InfoRow>
                <Separator />
                
                <InfoRow>
                  <InfoLabel>산미</InfoLabel>
                  <InfoValue>{getSensoryDescription('acidity', tastingRecord.sensoryAttribute.acidity)}</InfoValue>
                </InfoRow>
                <Separator />
                
                <InfoRow>
                  <InfoLabel>단맛</InfoLabel>
                  <InfoValue>{getSensoryDescription('sweetness', tastingRecord.sensoryAttribute.sweetness)}</InfoValue>
                </InfoRow>
                <Separator />
                
                <InfoRow>
                  <InfoLabel>여운</InfoLabel>
                  <InfoValue>{getSensoryDescription('finish', tastingRecord.sensoryAttribute.finish)}</InfoValue>
                </InfoRow>
                <Separator />
                
                <InfoRow>
                  <InfoLabel>마우스필</InfoLabel>
                  <InfoValue>{getMouthfeelKorean(tastingRecord.sensoryAttribute.mouthfeel)}</InfoValue>
                </InfoRow>
              </YStack>
            </InfoCard>
          )}

          {/* Roaster Notes */}
          {tastingRecord.roasterNotes && (
            <InfoCard>
              <SectionTitle>로스터 노트</SectionTitle>
              {renderRoasterNotes(tastingRecord.roasterNotes)}
            </InfoCard>
          )}

          {/* Home Cafe Information */}
          {tastingRecord.mode === 'home_cafe' && tastingRecord.homeCafeData && (
            <InfoCard>
              <SectionTitle>🏠 홈카페 정보</SectionTitle>
              <YStack space="$3">
                {tastingRecord.homeCafeData.equipment?.dripper && (
                  <>
                    <InfoRow>
                      <InfoLabel>드리퍼</InfoLabel>
                      <InfoValue>{tastingRecord.homeCafeData.equipment.dripper}</InfoValue>
                    </InfoRow>
                    <Separator />
                  </>
                )}

                {tastingRecord.homeCafeData.equipment?.grinder?.brand && (
                  <>
                    <InfoRow>
                      <InfoLabel>그라인더</InfoLabel>
                      <InfoValue>
                        {tastingRecord.homeCafeData.equipment.grinder.brand}
                        {tastingRecord.homeCafeData.equipment.grinder.setting && 
                          ` (${tastingRecord.homeCafeData.equipment.grinder.setting})`}
                      </InfoValue>
                    </InfoRow>
                    <Separator />
                  </>
                )}

                <InfoRow>
                  <InfoLabel>레시피</InfoLabel>
                  <InfoValue>
                    {tastingRecord.homeCafeData.recipe.doseIn}g : {tastingRecord.homeCafeData.recipe.waterAmount}g 
                    ({tastingRecord.homeCafeData.recipe.ratio || '1:16'})
                  </InfoValue>
                </InfoRow>
                <Separator />

                {tastingRecord.homeCafeData.recipe.waterTemp > 0 && (
                  <>
                    <InfoRow>
                      <InfoLabel>물온도</InfoLabel>
                      <InfoValue>{tastingRecord.homeCafeData.recipe.waterTemp}°C</InfoValue>
                    </InfoRow>
                    <Separator />
                  </>
                )}

                {tastingRecord.homeCafeData.recipe.bloomTime && tastingRecord.homeCafeData.recipe.bloomTime > 0 && (
                  <>
                    <InfoRow>
                      <InfoLabel>블룸시간</InfoLabel>
                      <InfoValue>{tastingRecord.homeCafeData.recipe.bloomTime}초</InfoValue>
                    </InfoRow>
                    <Separator />
                  </>
                )}

                {tastingRecord.homeCafeData.recipe.totalBrewTime > 0 && (
                  <>
                    <InfoRow>
                      <InfoLabel>추출시간</InfoLabel>
                      <InfoValue>
                        {Math.floor(tastingRecord.homeCafeData.recipe.totalBrewTime / 60)}분 {tastingRecord.homeCafeData.recipe.totalBrewTime % 60}초
                      </InfoValue>
                    </InfoRow>
                    <Separator />
                  </>
                )}

                {tastingRecord.homeCafeData.notes?.previousChange && (
                  <>
                    <InfoRow>
                      <InfoLabel>이전 변경</InfoLabel>
                      <InfoValue>{tastingRecord.homeCafeData.notes.previousChange}</InfoValue>
                    </InfoRow>
                    <Separator />
                  </>
                )}

                {tastingRecord.homeCafeData.notes?.result && (
                  <>
                    <InfoRow>
                      <InfoLabel>실험 결과</InfoLabel>
                      <InfoValue>{tastingRecord.homeCafeData.notes.result}</InfoValue>
                    </InfoRow>
                    <Separator />
                  </>
                )}

                {tastingRecord.homeCafeData.notes?.nextExperiment && (
                  <InfoRow>
                    <InfoLabel>다음 실험</InfoLabel>
                    <InfoValue>{tastingRecord.homeCafeData.notes.nextExperiment}</InfoValue>
                  </InfoRow>
                )}
              </YStack>
            </InfoCard>
          )}

          {/* Date Information */}
          <InfoCard>
            <SectionTitle>기록 정보</SectionTitle>
            <YStack space="$3">
              <InfoRow>
                <InfoLabel>기록일시</InfoLabel>
                <InfoValue>{formatDate(tastingRecord.createdAt)}</InfoValue>
              </InfoRow>
              {tastingRecord.updatedAt && tastingRecord.updatedAt !== tastingRecord.createdAt && (
                <>
                  <Separator />
                  <InfoRow>
                    <InfoLabel>수정일시</InfoLabel>
                    <InfoValue>{formatDate(tastingRecord.updatedAt)}</InfoValue>
                  </InfoRow>
                </>
              )}
            </YStack>
          </InfoCard>
        </AnimatePresence>
      </ScrollView>
    </Container>
  );
};

export default TastingDetailScreen;
