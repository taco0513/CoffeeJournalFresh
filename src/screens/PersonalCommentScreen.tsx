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
import { flavorWheelKorean } from '../data/flavorWheelKorean';

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

  // 사용자가 선택한 내용 요약
  const getUserSelections = () => {
    const selections = {
      flavors: [] as string[],
      sensory: [] as string[],
      sensoryByCategory: {} as Record<string, string[]>,
      ratings: {} as Record<string, number>,
      mouthfeel: ''
    };
    
    // 향미 선택 (한글로 변환) - selectedFlavors 사용
    console.log('Current selectedFlavors:', currentTasting.selectedFlavors);
    if (currentTasting.selectedFlavors && currentTasting.selectedFlavors.length > 0) {
      const { translations } = flavorWheelKorean;
      
      // 각 선택된 향미에 대해 처리
      currentTasting.selectedFlavors.forEach((flavorPath: any) => {
        if (flavorPath.level3) {
          // Level 3는 이미 한글이므로 그대로 사용
          selections.flavors.push(flavorPath.level3);
        } else if (flavorPath.level2) {
          // Level 2는 translations에서 한글 가져오기
          const koreanName2 = translations[flavorPath.level2 as keyof typeof translations] || flavorPath.level2;
          selections.flavors.push(koreanName2);
        } else if (flavorPath.level1) {
          // Level 1은 flavorWheelKorean.level1에서 한글 가져오기
          const koreanName1 = flavorWheelKorean.level1[flavorPath.level1 as keyof typeof flavorWheelKorean.level1] || flavorPath.level1;
          selections.flavors.push(koreanName1);
        }
      });
    }
    
    // 감각 표현 (카테고리별로 그룹화)
    const { selectedSensoryExpressions } = useTastingStore.getState();
    if (selectedSensoryExpressions && selectedSensoryExpressions.length > 0) {
      const categoryNames: Record<string, string> = {
        acidity: '산미',
        sweetness: '단맛',
        bitterness: '쓴맛',
        body: '바디',
        aftertaste: '애프터',
        balance: '밸런스'
      };
      
      selectedSensoryExpressions.forEach(expr => {
        if (expr.selected) {
          selections.sensory.push(expr.korean);
          
          // 카테고리별로 그룹화
          const categoryKorean = categoryNames[expr.categoryId] || expr.categoryId;
          if (!selections.sensoryByCategory[categoryKorean]) {
            selections.sensoryByCategory[categoryKorean] = [];
          }
          selections.sensoryByCategory[categoryKorean].push(expr.korean);
        }
      });
    }
    
    // 기본 평가 점수
    selections.ratings = {
      '바디감': currentTasting.body,
      '산미': currentTasting.acidity,
      '단맛': currentTasting.sweetness,
      '쓴맛': currentTasting.bitterness,
      '여운': currentTasting.finish,
      '밸런스': currentTasting.balance
    };
    
    // 마우스필
    selections.mouthfeel = currentTasting.mouthfeel || '';
    
    return selections;
  };
  
  const userSelections = getUserSelections();

  // 텍스트 추가 함수
  const addTextToComment = (text: string) => {
    const currentText = personalComment.trim();
    if (currentText) {
      // 마지막 문자가 마침표인지 확인
      if (currentText.endsWith('.')) {
        setPersonalComment(currentText + ' ' + text);
      } else {
        setPersonalComment(currentText + ' ' + text);
      }
    } else {
      setPersonalComment(text);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navigationTitle}>개인 노트</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButton}>건너뛰기</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar - Full width below header */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '83%' }]} />
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
                맛, 향, 전반적인 느낌을 자유롭게 표현해보세요
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

            {/* 사용자 선택 요약 */}
            <View style={styles.section}>
              <Text style={styles.selectionsTitle}>오늘 선택한 표현들</Text>
              
              {/* 향미 */}
              {userSelections.flavors.length > 0 && (
                <View style={styles.selectionRow}>
                  <Text style={styles.selectionLabel}>향미</Text>
                  <View style={styles.selectionTags}>
                    {userSelections.flavors.map((flavor, index) => (
                      <TouchableOpacity 
                        key={index} 
                        style={styles.selectionTag}
                        onPress={() => addTextToComment(flavor)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.selectionText}>{flavor}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              
              {/* 감각 표현 (카테고리별로 표시) */}
              {Object.entries(userSelections.sensoryByCategory).map(([category, expressions]) => (
                <View key={category} style={styles.selectionRow}>
                  <Text style={styles.selectionLabel}>{category}</Text>
                  <View style={styles.selectionTags}>
                    {expressions.map((expr, index) => (
                      <TouchableOpacity 
                        key={index} 
                        style={styles.selectionTag}
                        onPress={() => addTextToComment(expr)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.selectionText}>{expr}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
              
              {/* 주요 평가 (4점 이상만 표시) */}
              <View style={styles.selectionRow}>
                <Text style={styles.selectionLabel}>평가</Text>
                <View style={styles.selectionTags}>
                  {Object.entries(userSelections.ratings)
                    .filter(([_, score]) => score >= 4)
                    .map(([name, score], index) => (
                      <TouchableOpacity 
                        key={index} 
                        style={styles.selectionTag}
                        onPress={() => addTextToComment(`${name} ${score}/5`)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.selectionText}>{name} {score}/5</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
              
              {/* 마우스필 */}
              {userSelections.mouthfeel && (
                <View style={styles.selectionRow}>
                  <Text style={styles.selectionLabel}>질감</Text>
                  <View style={styles.selectionTags}>
                    <TouchableOpacity 
                      style={styles.selectionTag}
                      onPress={() => addTextToComment(userSelections.mouthfeel)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.selectionText}>{userSelections.mouthfeel}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* 버튼 영역 */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>완료</Text>
          </TouchableOpacity>
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
    borderBottomColor: HIGColors.systemGray4,
  },
  backButton: {
    fontSize: 24,
    color: HIGColors.systemBlue,
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  skipButton: {
    fontSize: 15,
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
    minHeight: 88,  // 4줄 높이 (22 * 4)
    maxHeight: 88,  // 고정 높이
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 13,
    color: HIGColors.tertiaryLabel,
    textAlign: 'right',
    marginTop: HIGConstants.SPACING_XS,
  },
  selectionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: HIGConstants.SPACING_MD,
  },
  selectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    width: 50,
    marginTop: 4,
  },
  selectionTags: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HIGConstants.SPACING_XS,
  },
  selectionTag: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D2E3FC',
  },
  selectionText: {
    fontSize: 14,
    color: HIGColors.label,
    fontWeight: '500',
  },
  bottomContainer: {
    padding: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: HIGColors.systemGray4,
  },
  bottomSkipButton: {
    flex: 1,
    height: 48,
    borderRadius: HIGConstants.cornerRadiusMedium,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSkipButtonText: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    fontWeight: '500',
  },
  nextButton: {
    height: 48,
    backgroundColor: HIGColors.systemBlue,
    borderRadius: HIGConstants.cornerRadiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PersonalCommentScreen;