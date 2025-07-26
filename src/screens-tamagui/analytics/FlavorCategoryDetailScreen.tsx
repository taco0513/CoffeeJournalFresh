import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { YStack, XStack, Text, Card, Spinner, SizableText } from 'tamagui';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Logger } from '../../services/LoggingService';
// PersonalTasteDataService moved to feature backlog - commenting out for MVP
// import PersonalTasteDataService from '../../../services/PersonalTasteDataService';
import { commonStyles } from '../../styles/common';
import { HIGColors } from '../../constants/HIG';

type RouteParams = {
  FlavorCategoryDetail: {
    category: string;
};
};

type NavigationProps = StackNavigationProp<RouteParams, 'FlavorCategoryDetail'>;

const FlavorCategoryDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProp<RouteParams, 'FlavorCategoryDetail'>>();
  const { category } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<any>(null);
  const [recentTastings, setRecentTastings] = useState<any[]>([]);

  useEffect(() => {
    loadCategoryData();
}, [category]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      
      // PersonalTasteDataService is in feature backlog - using placeholder data
      // TODO: Implement when PersonalTasteDataService is available
      
      // Placeholder data for now
      const placeholderCategoryInfo = {
        category: category,
        count: 0,
        percentage: 0
      };
      
      const placeholderTastings: any[] = [];
      
      setCategoryData(placeholderCategoryInfo);
      setRecentTastings(placeholderTastings);
      
      Logger.info('FlavorCategoryDetailScreen: Using placeholder data - PersonalTasteDataService not available in MVP', 'screen');
      
  } catch (error) {
      Logger.error('Failed to load category data', 'screen', { 
        component: 'FlavorCategoryDetailScreen', 
        error 
    });
  } finally {
      setLoading(false);
  }
};

  const handleGoBack = () => {
    navigation.goBack();
};

  const handleTastingPress = (tastingId: string) => {
    navigation.navigate('TastingDetail', { tastingId });
};

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color="$primary" />
        </YStack>
      </SafeAreaView>
    );
}

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.scrollView}>
        <YStack space="$4" padding="$4">
          {/* Header */}
          <XStack alignItems="center" space="$3">
            <TouchableOpacity onPress={handleGoBack}>
              <Text fontSize="$6" color="$primary">←</Text>
            </TouchableOpacity>
            <YStack flex={1}>
              <Text fontSize="$8" fontWeight="600" color="$textPrimary">
                {category} 상세 분석
              </Text>
              <Text fontSize="$4" color="$textSecondary">
                당신의 {category} 취향 패턴
              </Text>
            </YStack>
          </XStack>

          {/* Category Stats */}
          {categoryData && (
            <Card 
              elevate 
              bordered 
              padding="$4" 
              backgroundColor="$backgroundPrimary"
              animation="quick"
              hoverStyle={{ scale: 0.98 }}
              pressStyle={{ scale: 0.97 }}
            >
              <YStack space="$3">
                <Text fontSize="$6" fontWeight="600" color="$textPrimary">
                  통계
                </Text>
                
                <XStack justifyContent="space-between">
                  <Text fontSize="$4" color="$textSecondary">선택 횟수</Text>
                  <Text fontSize="$5" fontWeight="600" color="$primary">
                    {categoryData.count || 0}회
                  </Text>
                </XStack>
                
                <XStack justifyContent="space-between">
                  <Text fontSize="$4" color="$textSecondary">전체 대비 비율</Text>
                  <Text fontSize="$5" fontWeight="600" color="$primary">
                    {categoryData.percentage?.toFixed(1) || 0}%
                  </Text>
                </XStack>
              </YStack>
            </Card>
          )}

          {/* Recent Tastings */}
          <YStack space="$3">
            <Text fontSize="$6" fontWeight="600" color="$textPrimary">
              최근 {category} 기록
            </Text>
            
            {recentTastings.length > 0 ? (
              recentTastings.map((tasting, index) => (
                <TouchableOpacity 
                  key={tasting.id || index}
                  onPress={() => handleTastingPress(tasting.id)}
                >
                  <Card 
                    elevate 
                    bordered 
                    padding="$3" 
                    backgroundColor="$backgroundPrimary"
                    animation="quick"
                    hoverStyle={{ scale: 0.98 }}
                    pressStyle={{ scale: 0.97 }}
                  >
                    <XStack alignItems="center" space="$3">
                      <Text fontSize="$5"></Text>
                      <YStack flex={1}>
                        <Text fontSize="$4" fontWeight="500" color="$textPrimary">
                          {tasting.coffeeName || '커피 이름 없음'}
                        </Text>
                        <Text fontSize="$3" color="$textSecondary">
                          {tasting.roastery || '로스터리 정보 없음'}
                        </Text>
                      </YStack>
                      <Text fontSize="$3" color="$textTertiary">
                        {new Date(tasting.createdAt).toLocaleDateString('ko-KR')}
                      </Text>
                    </XStack>
                  </Card>
                </TouchableOpacity>
              ))
            ) : (
              <Card 
                bordered 
                padding="$4" 
                backgroundColor="$backgroundSecondary"
              >
                <Text fontSize="$4" color="$textSecondary" textAlign="center">
                  {category} 향미를 선택한 기록이 없습니다
                </Text>
              </Card>
            )}
          </YStack>

          {/* Insights */}
          <Card 
            elevate 
            bordered 
            padding="$4" 
            backgroundColor="$accentLight"
          >
            <YStack space="$3">
              <Text fontSize="$5" fontWeight="600" color="$textPrimary">
                 인사이트
              </Text>
              <Text fontSize="$4" color="$textSecondary" lineHeight="$5">
                {category} 향미를 좋아하시는군요! 이런 향미는 주로 특정 원산지나 
                가공 방법의 커피에서 많이 발견됩니다. 다양한 로스터리의 커피를 
                시도해보며 당신만의 {category} 취향을 더 깊이 탐구해보세요.
              </Text>
            </YStack>
          </Card>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FlavorCategoryDetailScreen;