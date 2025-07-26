import React, { useState, useEffect } from 'react';
import { 
  YStack, 
  XStack, 
  ScrollView, 
  Text, 
  Button, 
  Card, 
  Spinner, 
  useTheme 
} from 'tamagui';
import { SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import RealmService from '../../services/realm/RealmService';
import { ITastingRecord } from '../../services/realm/schemas';

const SimpleProfileHistoryScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [allTastings, setAllTastings] = useState<ITastingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const realmService = RealmService.getInstance();
      
      if (!realmService.isInitialized) {
        await realmService.initialize();
      }
      
      const tastings = await realmService.getTastingRecords({ isDeleted: false });
      const tastingsArray = Array.from(tastings);
      
      // Remove duplicates
      const uniqueTastings = [];
      const seenIds = new Set();
      
      for (const tasting of tastingsArray) {
        if (tasting && tasting.id && !seenIds.has(tasting.id)) {
          seenIds.add(tasting.id);
          uniqueTastings.push(tasting);
        }
      }
      
      setAllTastings(uniqueTastings);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTastingItem = (item: ITastingRecord, index: number) => {
    if (!item || !item.id || !item.coffeeName) {
      return null;
    }

    const formattedDate = item.createdAt 
      ? new Date(item.createdAt).toLocaleDateString('ko-KR', { 
          month: 'long', 
          day: 'numeric' 
        })
      : '날짜 없음';

    return (
      <Card
        onPress={() => {
          navigation.navigate('TastingDetail', { 
            tastingId: item.id
          });
        }}
        backgroundColor="$background"
        marginHorizontal="$md"
        marginBottom="$xs"
        borderRadius="$3"
        padding="$md"
        minHeight={60}
        bordered
        borderColor="$borderColor"
        elevate
        pressStyle={{ scale: 0.98 }}
        hoverStyle={{ backgroundColor: '$backgroundHover' }}
      >
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$xxs">
          <Text fontSize="$4" fontWeight="600" color="$color" flex={1}>
            {item.coffeeName}
          </Text>
          <Card
            borderRadius="$2"
            paddingHorizontal="$xs"
            paddingVertical="$xxs"
            backgroundColor={item.matchScoreTotal >= 85 ? '$green9' : item.matchScoreTotal >= 70 ? '$orange9' : '$red9'}
          >
            <Text fontSize="$2" fontWeight="600" color="white">
              {item.matchScoreTotal || 0}%
            </Text>
          </Card>
        </XStack>
        <Text fontSize="$3" fontWeight="400" color="$gray10" marginBottom="$xxs">
          {item.roastery || 'Unknown Roastery'}
        </Text>
        <Text fontSize="$2" fontWeight="400" color="$gray8">
          {formattedDate}
        </Text>
      </Card>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.val }}>
        <XStack 
          height={44} 
          alignItems="center" 
          justifyContent="space-between" 
          paddingHorizontal="$md" 
          backgroundColor="$background" 
          borderBottomWidth={0.5} 
          borderBottomColor="$borderColor"
        >
          <XStack alignItems="center" gap="$xs">
            <Text fontSize="$5" fontWeight="600" color="$color">테이스팅 기록</Text>
            <Card backgroundColor="$blue10" paddingHorizontal="$xs" paddingVertical="$xxs" borderRadius="$1">
              <Text fontSize="$1" fontWeight="700" color="white" letterSpacing={0.5}>BETA</Text>
            </Card>
          </XStack>
        </XStack>
        
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$md">
          <Spinner size="large" color="$blue10" />
          <Text fontSize="$4" color="$gray10">기록을 불러오는 중...</Text>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.val }}>
      {/* Navigation Bar */}
      <XStack 
        height={44} 
        alignItems="center" 
        justifyContent="space-between" 
        paddingHorizontal="$md" 
        backgroundColor="$background" 
        borderBottomWidth={0.5} 
        borderBottomColor="$borderColor"
      >
        <XStack alignItems="center" gap="$xs">
          <Text fontSize="$5" fontWeight="600" color="$color">테이스팅 기록</Text>
          <Card backgroundColor="$blue10" paddingHorizontal="$xs" paddingVertical="$xxs" borderRadius="$1">
            <Text fontSize="$1" fontWeight="700" color="white" letterSpacing={0.5}>BETA</Text>
          </Card>
        </XStack>
      </XStack>

      {/* Header */}
      <YStack padding="$md" paddingBottom="$xs" backgroundColor="$background">
        <Text fontSize="$3" color="$gray10">총 {allTastings.length}개의 기록</Text>
      </YStack>
      
      {/* Content */}
      <ScrollView 
        flex={1} 
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {allTastings.length > 0 ? (
          <YStack>
            {allTastings.map((item, index) => (
              <YStack key={`simple-profile-history-${index}-${item.id || 'no-id'}-${item.coffeeName || 'no-name'}`}>
                {renderTastingItem(item, index)}
              </YStack>
            ))}
          </YStack>
        ) : (
          <YStack alignItems="center" paddingTop="$xxl" gap="$md">
            <Text fontSize={48}>☕️</Text>
            <Text fontSize="$5" color="$gray10" textAlign="center">
              아직 기록이 없습니다
            </Text>
            <Text fontSize="$3" color="$gray8" textAlign="center">
              첫 테이스팅을 기록해보세요
            </Text>
          </YStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

SimpleProfileHistoryScreen.displayName = 'SimpleProfileHistoryScreen';

export default React.memo(SimpleProfileHistoryScreen);