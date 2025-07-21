import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../stores/tastingStore';
import { NavigationButton } from '../components/common';
import { HIGConstants, hitSlop, HIGColors, commonButtonStyles, commonTextStyles } from '../styles/common';

const PersonalCommentScreen = () => {
  const navigation = useNavigation();
  const { currentTasting, updateField, saveTasting } = useTastingStore();
  
  const [personalComment, setPersonalComment] = useState(currentTasting.personalComment || '');
  const textInputRef = useRef<TextInput>(null);

  // 화면 포커스 시 입력 필드에 자동 포커스
  useEffect(() => {
    const timer = setTimeout(() => {
      textInputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = async () => {
    // 개인 감상평 저장
    updateField('personalComment', personalComment.trim());
    
    try {
      // 로스터 노트 화면으로 이동
      navigation.navigate('RoasterNotes' as never);
    } catch (error) {
      // console.error('Error saving tasting:', error);
      // 에러가 발생해도 다음 화면으로 이동
      navigation.navigate('RoasterNotes' as never);
    }
  };

  const handleSkip = () => {
    // 빈 감상평으로 저장하고 다음 단계로
    updateField('personalComment', '');
    navigation.navigate('RoasterNotes' as never);
  };

  // 추천 문구들
  const suggestionPhrases = [
    "향미가 인상적이었고",
    "균형 잡힌 맛이었다",
    "산미가 적당해서 좋았다",
    "달콤한 뒷맛이 기억에 남는다",
    "바디감이 풍부했다",
    "깔끔한 마무리였다",
    "복합적인 향미가 좋았다",
    "부드러운 질감이었다"
  ];

  const addSuggestion = (phrase: string) => {
    const currentText = personalComment.trim();
    if (currentText) {
      setPersonalComment(currentText + (currentText.endsWith('.') ? ' ' : ', ') + phrase);
    } else {
      setPersonalComment(phrase);
    }
  };

  return (
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
        <Text style={styles.navigationTitle}>개인 노트</Text>
        <Text style={styles.progressIndicator}>4/6</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>나만의 노트</Text>
              <Text style={styles.sectionDescription}>
                오늘의 커피는 어떠셨나요?
              </Text>
              <Text style={styles.guideMessage}>
                💭 맛, 향, 전반적인 느낌을 자유롭게 표현해보세요
              </Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  ref={textInputRef}
                  style={styles.textInput}
                  value={personalComment}
                  onChangeText={setPersonalComment}
                  placeholder="예: 풍부한 과일향과 초콜릿의 조화가 인상적이었고, 뒷맛까지 깔끔하게 이어지는 균형 잡힌 커피"
                  placeholderTextColor={HIGColors.placeholderText}
                  multiline={true}
                  maxLength={200}
                  textAlignVertical="top"
                  blurOnSubmit={false}
                />
                <Text style={styles.characterCount}>
                  {personalComment.length}/200
                </Text>
              </View>
            </View>

            {/* 추천 문구 */}
            <View style={styles.section}>
              <Text style={styles.suggestionsTitle}>💡 추천 표현</Text>
              <Text style={styles.suggestionsDescription}>
                탭하여 감상평에 추가할 수 있어요
              </Text>
              <View style={styles.suggestionTags}>
                {suggestionPhrases.map((phrase, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionTag}
                    onPress={() => addSuggestion(phrase)}
                    hitSlop={hitSlop.small}
                  >
                    <Text style={styles.suggestionText}>{phrase}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* 버튼 영역 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>건너뛰기</Text>
          </TouchableOpacity>
          
          <NavigationButton
            title="완료"
            onPress={handleNext}
            variant="primary"
            style={styles.nextButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  progressIndicator: {
    fontSize: 15,
    color: HIGColors.secondaryLabel,
    fontWeight: '500',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
  },
  section: {
    marginBottom: HIGConstants.SPACING_XL,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  sectionDescription: {
    fontSize: 15,
    color: HIGColors.secondaryLabel,
    lineHeight: 20,
    marginBottom: HIGConstants.SPACING_SM,
  },
  guideMessage: {
    fontSize: 14,
    color: HIGColors.blue,
    lineHeight: 20,
    marginBottom: HIGConstants.SPACING_MD,
  },
  inputContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: HIGConstants.SPACING_MD,
  },
  textInput: {
    fontSize: 16,
    color: HIGColors.label,
    lineHeight: 22,
    minHeight: 120,
    maxHeight: 160,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 13,
    color: HIGColors.tertiaryLabel,
    textAlign: 'right',
    marginTop: HIGConstants.SPACING_XS,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  suggestionsDescription: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_MD,
  },
  suggestionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HIGConstants.SPACING_SM,
  },
  suggestionTag: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  suggestionText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: HIGColors.gray4,
    gap: HIGConstants.SPACING_MD,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    fontWeight: '500',
  },
  nextButton: {
    flex: 2,
  },
});

export default PersonalCommentScreen;