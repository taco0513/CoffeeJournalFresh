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
      <SafeAreaView style={styles.container}>
        {/* HIG 준수 네비게이션 바 */}
        <View style={styles.navigationBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.navigationTitle}>로스터 노트</Text>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipButton}>건너뛰기</Text>
          </TouchableOpacity>
        </View>
        
        {/* Progress Bar - Full width below header */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '83%' }]} />
        </View>

        {/* 메인 콘텐츠 */}
        <View style={styles.content}>
          {/* 제목 및 설명 */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>로스터의 컵 노트</Text>
            <Text style={styles.subtitle}>로스터의 설명을 적어두면 나중에 비교해볼 수 있어요</Text>
            <Text style={styles.guideMessage}>💡 커피 봉투나 카페 메뉴판의 설명을 참고하세요</Text>
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
        </View>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
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
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.systemGray4,
  },
  backButton: {
    fontSize: HIGConstants.FONT_SIZE_H2,
    color: HIGColors.systemBlue,
  },
  navigationTitle: {
    fontSize: HIGConstants.FONT_SIZE_TITLE,
    fontWeight: '600',
    color: HIGColors.label,
  },
  skipButton: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.systemBlue,
  },
  progressBar: {
    height: 3,
    backgroundColor: HIGColors.systemGray5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: HIGColors.systemBlue,
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
    fontSize: HIGConstants.FONT_SIZE_H1,
    fontWeight: '700',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  subtitle: {
    fontSize: HIGConstants.FONT_SIZE_TITLE,
    fontWeight: '400',
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_SM,
  },
  guideMessage: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '400',
    color: HIGColors.blue,
    textAlign: 'center',
    marginTop: HIGConstants.SPACING_XS,
  },
  ocrNotice: {
    backgroundColor: HIGColors.blue,
    borderRadius: HIGConstants.BORDER_RADIUS,
    padding: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_LG,
    alignItems: 'center',
  },
  ocrNoticeText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
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
    fontSize: HIGConstants.FONT_SIZE_TITLE,
    color: '#000000',
    minHeight: 200,
    backgroundColor: '#FFFFFF',
  },
  bottomContainer: {
    padding: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: HIGColors.systemGray4,
  },
  nextButton: {
    height: 48,
    backgroundColor: HIGColors.systemBlue,
    borderRadius: HIGConstants.cornerRadiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default RoasterNotesScreen;