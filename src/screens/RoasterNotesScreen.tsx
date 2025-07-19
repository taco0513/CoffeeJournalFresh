import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTastingStore } from '../stores/tastingStore';
import { NavigationButton } from '../components/common';
import { Colors } from '../constants/colors';
import { HIGConstants, HIGColors, commonButtonStyles, commonTextStyles } from '../styles/common';

const RoasterNotesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentTasting, updateField } = useTastingStore();
  const scannedRoasterNotes = route.params?.scannedRoasterNotes;
  
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
    navigation.navigate('FlavorLevel1' as never);
  };

  const handleSkip = () => {
    navigation.navigate('FlavorLevel1' as never);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        {/* HIG 준수 네비게이션 바 */}
        <View style={styles.navigationBar}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backButtonText}>‹ 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.navigationTitle}>로스터 노트</Text>
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkip}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.skipButtonText}>건너뛰기</Text>
          </TouchableOpacity>
        </View>
        
        {/* 진행 상태 바 */}
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>

        {/* 메인 콘텐츠 */}
        <View style={styles.content}>
          {/* 제목 및 설명 */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>로스터의 컵 노트</Text>
            <Text style={styles.subtitle}>로스터가 제공한 맛 설명을 입력하세요</Text>
          </View>

          {/* OCR 알림 */}
          {scannedRoasterNotes && (
            <View style={styles.ocrNotice}>
              <Text style={styles.ocrNoticeText}>
                📷 OCR로 인식된 노트가 자동 입력되었습니다
              </Text>
            </View>
          )}

          {/* 텍스트 입력 */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.notesInput}
              multiline
              numberOfLines={8}
              placeholder="예: 블루베리, 다크 초콜릿, 꿀과 같은 단맛\n\n로스터가 제공한 맛 설명을 자유롭게 입력하세요. 이 정보는 나중에 여러분의 테이스팅 결과와 비교됩니다."
              placeholderTextColor="#CCCCCC"
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>

          {/* 다음 버튼 */}
          <TouchableOpacity 
            style={[commonButtonStyles.buttonPrimary, commonButtonStyles.buttonLarge, styles.nextButton]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={[commonTextStyles.buttonTextLarge, styles.nextButtonText]}>
              다음
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navigationBar: {
    height: HIGConstants.MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  backButton: {
    minWidth: HIGConstants.MIN_TOUCH_TARGET,
    height: HIGConstants.MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: '400',
    color: HIGColors.blue,
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  skipButton: {
    minWidth: HIGConstants.MIN_TOUCH_TARGET,
    height: HIGConstants.MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '400',
    color: HIGColors.blue,
  },
  progressBar: {
    height: 4,
    backgroundColor: HIGColors.gray5,
  },
  progressFill: {
    height: 4,
    width: '50%', // 3/6 = 50%
    backgroundColor: HIGColors.blue,
  },
  content: {
    flex: 1,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  headerSection: {
    paddingTop: HIGConstants.SPACING_XL,
    paddingBottom: HIGConstants.SPACING_LG,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
  },
  ocrNotice: {
    backgroundColor: HIGColors.blue,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_LG,
    alignItems: 'center',
  },
  ocrNoticeText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  inputContainer: {
    flex: 1,
    marginBottom: HIGConstants.SPACING_LG,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: HIGColors.gray4,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_MD,
    fontSize: 17,
    color: '#000000',
    minHeight: 200,
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    width: '100%',
    marginBottom: HIGConstants.SPACING_LG,
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
});

export default RoasterNotesScreen;