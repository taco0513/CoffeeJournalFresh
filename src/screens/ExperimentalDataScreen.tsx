import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { 
  View, 
  Text, 
  ScrollView, 
  Button, 
  YStack, 
  XStack, 
  Card,
  H1,
  H2,
  H3,
  Paragraph,
  SizableText
} from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTastingStore } from '../stores/tastingStore';
import { CurrentTasting, LabModeData } from '../types/tasting';
import { 
  MouthfeelButton,
  SliderSection
} from '../components/sensory';
import { CompactSensoryGrid } from '../components/sensory/CompactSensoryGrid';
import { useSensoryState } from '../hooks/useSensoryState';
import { MouthfeelType } from '../types/sensory';
import { LabModeDataEntry } from '../components/lab/LabModeDataEntry';

const ExperimentalDataScreen = () => {
  const navigation = useNavigation();
  const { currentTasting, updateField } = useTastingStore();
  const [activeTab, setActiveTab] = useState<'basic' | 'lab'>('basic');
  
  // Use custom hook for sensory state management
  const {
    sensoryData,
    updateNumericValue,
    setMouthfeel,
  } = useSensoryState({
    body: currentTasting.body,
    acidity: currentTasting.acidity,
    sweetness: currentTasting.sweetness,
    finish: currentTasting.finish,
    bitterness: currentTasting.bitterness,
    balance: currentTasting.balance,
    mouthfeel: (currentTasting.mouthfeel as MouthfeelType) || 'Clean',
  });

  const mouthfeelOptions: MouthfeelType[] = useMemo(() => ['Clean', 'Creamy', 'Juicy', 'Silky'], []);

  const handleLabDataChange = useCallback((labData: LabModeData) => {
    updateField('labModeData', labData);
  }, [updateField]);

  // Calculate completion progress for gamification
  const getCompletionProgress = useCallback(() => {
    const requiredFields = ['body', 'acidity', 'sweetness', 'bitterness', 'finish', 'balance'];
    const completedFields = requiredFields.filter(field => {
      const value = sensoryData[field as keyof typeof sensoryData];
      return value && value !== 3; // 3 is default/neutral value
    });
    return {
      completed: completedFields.length,
      total: requiredFields.length,
      percentage: Math.round((completedFields.length / requiredFields.length) * 100)
    };
  }, [sensoryData]);

  const progress = getCompletionProgress();

  const handleComplete = useCallback(async () => {
    // Update all sensory fields in the store
    Object.entries(sensoryData).forEach(([key, value]) => {
      updateField(key as keyof CurrentTasting, value);
    });
    
    // Navigate to Korean sensory evaluation screen
    navigation.navigate('SensoryEvaluation' as never);
  }, [sensoryData, updateField, navigation]);

  return (
    <View flex={1} backgroundColor="$backgroundSoft">
      {/* Navigation Bar */}
      <XStack 
        height={44}
        paddingHorizontal="$6" 
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
        >
          <Text color="$blue10" fontSize="$6">←</Text>
        </Button>
        <H3 color="$color">실험 데이터</H3>
        <Button 
          size="$3" 
          variant="outlined" 
          backgroundColor="transparent" 
          borderWidth={0}
          onPress={() => navigation.navigate('SensoryEvaluation' as never)}
        >
          <Text color="$blue10" fontSize="$4">건너뛰기</Text>
        </Button>
      </XStack>
      
      {/* Progress Bar */}
      <View height={3} backgroundColor="$gray5" overflow="hidden">
        <View height="100%" width="57%" backgroundColor="$blue10" />
      </View>

      {/* Tab Navigation */}
      <XStack 
        marginHorizontal="$6" 
        marginTop="$4" 
        backgroundColor="$gray6" 
        borderRadius="$3" 
        padding="$1"
      >
        <Button
          flex={1}
          size="$3"
          variant={activeTab === 'basic' ? undefined : "outlined"}
          backgroundColor={activeTab === 'basic' ? "$background" : "transparent"}
          borderWidth={0}
          borderRadius="$2"
          marginHorizontal="$0.5"
          onPress={() => setActiveTab('basic')}
          animation="bouncy"
          shadowColor={activeTab === 'basic' ? "$shadowColor" : "transparent"}
          shadowOffset={activeTab === 'basic' ? { width: 0, height: 1 } : { width: 0, height: 0 }}
          shadowOpacity={activeTab === 'basic' ? 0.1 : 0}
          shadowRadius={activeTab === 'basic' ? 3 : 0}
        >
          <SizableText 
            size="$3" 
            fontWeight={activeTab === 'basic' ? "600" : "500"}
            color={activeTab === 'basic' ? "$color" : "$colorPress"}
          >
            기본 평가
          </SizableText>
        </Button>
        <Button
          flex={1}
          size="$3"
          variant={activeTab === 'lab' ? undefined : "outlined"}
          backgroundColor={activeTab === 'lab' ? "$background" : "transparent"}
          borderWidth={0}
          borderRadius="$2"
          marginHorizontal="$0.5"
          onPress={() => setActiveTab('lab')}
          animation="bouncy"
          shadowColor={activeTab === 'lab' ? "$shadowColor" : "transparent"}
          shadowOffset={activeTab === 'lab' ? { width: 0, height: 1 } : { width: 0, height: 0 }}
          shadowOpacity={activeTab === 'lab' ? 0.1 : 0}
          shadowRadius={activeTab === 'lab' ? 3 : 0}
        >
          <SizableText 
            size="$3" 
            fontWeight={activeTab === 'lab' ? "600" : "500"}
            color={activeTab === 'lab' ? "$color" : "$colorPress"}
          >
            전문 분석
          </SizableText>
        </Button>
      </XStack>

      {/* Guide Message with Progress */}
      <YStack 
        paddingHorizontal="$6" 
        paddingVertical="$4" 
        backgroundColor="$background"
      >
        <XStack alignItems="center" justifyContent="space-between">
          <YStack flex={1}>
            <SizableText size="$4" fontWeight="600" color="$color" marginBottom="$2">
              {activeTab === 'basic' 
                ? '커피의 강도를 측정해보세요' 
                : '전문적인 분석 데이터를 기록하세요'
              }
            </SizableText>
            <SizableText size="$3" color="$colorPress">
              {activeTab === 'basic'
                ? `${progress.completed}/${progress.total} 항목 완료`
                : 'TDS, 추출수율, 실험 변수를 정밀하게 기록할 수 있습니다'
              }
            </SizableText>
          </YStack>
        </XStack>
      </YStack>

      {activeTab === 'basic' ? (
        <ScrollView 
          flex={1}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
        
        <CompactSensoryGrid
          attributes={[
            {
              title: "바디감",
              value: sensoryData.body,
              onValueChange: updateNumericValue('body'),
              leftLabel: "가벼움",
              rightLabel: "무거움",
              description: "입안에서 느껴지는 질감과 무게감"
            },
            {
              title: "산미",
              value: sensoryData.acidity,
              onValueChange: updateNumericValue('acidity'),
              leftLabel: "약함",
              rightLabel: "강함",
              description: "밝고 상큼한 신맛의 강도"
            },
            {
              title: "단맛",
              value: sensoryData.sweetness,
              onValueChange: updateNumericValue('sweetness'),
              leftLabel: "없음",
              rightLabel: "강함",
              description: "자연스러운 당도와 단맛"
            },
            {
              title: "쓴맛",
              value: sensoryData.bitterness,
              onValueChange: updateNumericValue('bitterness'),
              leftLabel: "약함",
              rightLabel: "강함",
              description: "다크 초콜릿같은 쓴맛"
            },
            {
              title: "여운",
              value: sensoryData.finish,
              onValueChange: updateNumericValue('finish'),
              leftLabel: "짧음",
              rightLabel: "길음",
              description: "입안에 남는 맛의 지속시간"
            },
            {
              title: "밸런스",
              value: sensoryData.balance,
              onValueChange: updateNumericValue('balance'),
              leftLabel: "불균형",
              rightLabel: "조화로운",
              description: "맛과 향의 전체적 균형"
            }
          ]}
        />

        {/* Mouthfeel Section - Card Style */}
        <Card 
          backgroundColor="$background" 
          borderRadius="$4" 
          marginHorizontal="$6" 
          marginBottom="$4" 
          padding="$4" 
          borderWidth={1} 
          borderColor="$borderColor" 
          elevate 
          animation="bouncy"
        >
          <YStack marginBottom="$3">
            <XStack alignItems="center" marginBottom="$1">
              <SizableText size="$5" marginRight="$2">👄</SizableText>
              <SizableText size="$4" fontWeight="700" color="$color">입안 느낌</SizableText>
            </XStack>
            <SizableText size="$2" lineHeight="$4" color="$colorPress" marginTop="$1">
              가장 가까운 느낌을 선택해주세요
            </SizableText>
          </YStack>
          <XStack flexWrap="wrap" marginTop="$2">
            {mouthfeelOptions.map((option) => (
              <MouthfeelButton 
                key={option} 
                mouthfeel={option}
                isSelected={sensoryData.mouthfeel === option}
                onPress={() => setMouthfeel(option)}
              />
            ))}
          </XStack>
        </Card>
        </ScrollView>
      ) : (
        <LabModeDataEntry
          data={currentTasting.labModeData}
          onChange={handleLabDataChange}
        />
      )}

      {/* Bottom Button */}
      <YStack 
        padding="$6" 
        backgroundColor="$background" 
        borderTopWidth={0.5} 
        borderTopColor="$borderColor"
      >
        <Button 
          size="$5" 
          theme="blue" 
          onPress={handleComplete}
          animation="bouncy"
        >
          다음 단계
        </Button>
      </YStack>
    </View>
  );
};

// Styles migrated to Tamagui - no StyleSheet needed

export default ExperimentalDataScreen;