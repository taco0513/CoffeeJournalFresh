import React, { useState, useEffect } from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  View, 
  Text, 
  ScrollView, 
  Button, 
  YStack, 
  XStack, 
  Card,
  TextArea,
  H1,
  H2,
  H3,
  Paragraph,
  SizableText
} from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTastingStore } from '../stores/tastingStore';
import { NavigationButton } from '../components/common';

const RoasterNotesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentTasting, updateField } = useTastingStore();
  const scannedRoasterNotes = (route.params as any)?.scannedRoasterNotes;
  
  // 초기값으로 스캔된 노트 사용
  const [notes, setNotes] = useState(scannedRoasterNotes || currentTasting.roasterNotes || '');
  
  useEffect(() => {
    if (scannedRoasterNotes) {
      // console.log('스캔된 로스터 노트 적용:', scannedRoasterNotes);
      setNotes(scannedRoasterNotes);
    }
  }, [scannedRoasterNotes]);

  const handleNext = () => {
    updateField('roasterNotes', notes);
    // 결과 화면으로 이동
    navigation.navigate('Result' as never);
  };

  const handleSkip = () => {
    navigation.navigate('Result' as never);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View flex={1} backgroundColor="$background">
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
          <H3 color="$color">로스터 노트</H3>
          <Button 
            size="$3" 
            variant="outlined" 
            backgroundColor="transparent" 
            borderWidth={0}
            onPress={handleSkip}
          >
            <Text color="$blue10" fontSize="$4">건너뛰기</Text>
          </Button>
        </XStack>
        
        {/* Progress Bar */}
        <View height={3} backgroundColor="$gray5" overflow="hidden">
          <View height="100%" width="83%" backgroundColor="$blue10" />
        </View>

        {/* Main Content */}
        <ScrollView flex={1} paddingHorizontal="$6">
          {/* Header Section */}
          <YStack paddingTop="$8" paddingBottom="$6" alignItems="center">
            <H1 fontWeight="700" color="$color" textAlign="center" marginBottom="$3">
              로스터의 컵 노트
            </H1>
            <Paragraph size="$5" color="$colorPress" textAlign="center" marginBottom="$3">
              로스터의 설명을 적어두면 나중에 비교해볼 수 있어요
            </Paragraph>
            <SizableText size="$4" color="$blue10" textAlign="center" marginTop="$2">
              💡 커피 봉투나 카페 메뉴판의 설명을 참고하세요
            </SizableText>
          </YStack>

          {/* OCR Notice */}
          {scannedRoasterNotes && (
            <Card 
              backgroundColor="$blue9" 
              borderRadius="$4" 
              padding="$3" 
              marginBottom="$6" 
              alignItems="center"
            >
              <SizableText size="$3" color="white" textAlign="center">
                📷 OCR로 인식된 노트가 자동 입력되었습니다
              </SizableText>
            </Card>
          )}

          {/* Text Input */}
          <YStack flex={1} marginBottom="$6">
            <TextArea
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$4"
              padding="$4"
              fontSize="$5"
              color="$color"
              minHeight={200}
              backgroundColor="$background"
              placeholder="예: 블루베리, 다크 초콜릿, 꿀과 같은 단맛\n\n로스터가 제공한 맛 설명을 자유롭게 입력하세요.이 정보는 나중에 여러분의 테이스팅 결과와 비교됩니다."
              value={notes}
              onChangeText={setNotes}
            />
          </YStack>
        </ScrollView>

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
            onPress={handleNext}
            animation="bouncy"
          >
            다음
          </Button>
        </YStack>
      </View>
    </TouchableWithoutFeedback>
  );
};

// Styles migrated to Tamagui - no StyleSheet needed

export default RoasterNotesScreen;