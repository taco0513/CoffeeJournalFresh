import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../stores/tastingStore';
import { AutocompleteInput } from '../components/common';
import { NavigationButton } from '../components/common';
import { HIGConstants, HIGColors } from '../styles/common';
import RealmService from '../services/realm/RealmService';
import { parseCoffeeName } from '../utils/coffeeParser';

const CoffeeDetailsScreen = () => {
  const navigation = useNavigation();
  const { currentTasting, updateField } = useTastingStore();
  
  // 자동완성 상태
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [varietySuggestions, setVarietySuggestions] = useState<string[]>([]);
  const [processSuggestions, setProcessSuggestions] = useState<string[]>([]);
  
  const realmService = RealmService.getInstance();
  
  // 기본 가공 방식과 로스팅 레벨 옵션
  const defaultProcessOptions = ['Washed', 'Natural', 'Honey', 'Anaerobic'];
  const roastLevelOptions = ['Light', 'Medium', 'Dark'];

  // 생산지 입력 변경 시 제안 목록 업데이트
  useEffect(() => {
    if (currentTasting.origin && currentTasting.origin.trim().length > 0) {
      const suggestions = realmService.getOriginSuggestions(currentTasting.origin);
      setOriginSuggestions(suggestions);
    } else {
      setOriginSuggestions([]);
    }
  }, [currentTasting.origin]);

  // 품종 입력 변경 시 제안 목록 업데이트
  useEffect(() => {
    if (currentTasting.variety && currentTasting.variety.trim().length > 0) {
      const suggestions = realmService.getVarietySuggestions(currentTasting.variety);
      setVarietySuggestions(suggestions);
    } else {
      setVarietySuggestions([]);
    }
  }, [currentTasting.variety]);

  // 가공 방식 입력 변경 시 제안 목록 업데이트
  useEffect(() => {
    if (currentTasting.process && currentTasting.process.trim().length > 0) {
      const localSuggestions = realmService.getProcessSuggestions(currentTasting.process);
      const combinedSuggestions = [
        ...new Set([...localSuggestions, ...defaultProcessOptions.filter(option => 
          option.toLowerCase().includes(currentTasting.process.toLowerCase())
        )])
      ];
      setProcessSuggestions(combinedSuggestions);
    } else {
      setProcessSuggestions(defaultProcessOptions);
    }
  }, [currentTasting.process]);

  // 컴포넌트 마운트 시 스마트 기본값 제공
  useEffect(() => {
    if (currentTasting.coffeeName && !currentTasting.origin && !currentTasting.variety) {
      const parsed = parseCoffeeName(currentTasting.coffeeName);
      if (parsed.origin) updateField('origin', parsed.origin);
      if (parsed.variety) updateField('variety', parsed.variety);
      if (parsed.process) updateField('process', parsed.process);
    }
  }, []);

  const handleNext = () => {
    // 로스터 노트 화면으로 이동
    navigation.navigate('RoasterNotes' as never);
  };

  const handleSkip = () => {
    // 상세 정보 없이 바로 로스터 노트로 이동
    navigation.navigate('RoasterNotes' as never);
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
        <Text style={styles.navigationTitle}>상세 정보</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButtonText}>건너뛰기</Text>
        </TouchableOpacity>
      </View>
      
      {/* 진행 상태 바 */}
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* 입력 폼 */}
          <View style={styles.form}>
            {/* 설명 텍스트 */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>커피 상세 정보</Text>
              <Text style={styles.sectionSubtitle}>
                입력한 커피 이름을 기반으로 자동으로 추천해드려요. 선택사항이므로 건너뛸 수 있습니다.
              </Text>
            </View>

            {/* 생산지 */}
            <View style={[styles.inputGroup, { zIndex: originSuggestions.length > 0 && currentTasting.origin ? 5 : 1 }]}>
              <AutocompleteInput
                value={currentTasting.origin || ''}
                onChangeText={(text) => updateField('origin', text)}
                onSelect={(item) => updateField('origin', item)}
                suggestions={originSuggestions}
                placeholder="예: Ethiopia / Yirgacheffe"
                label="생산지"
              />
            </View>

            {/* 품종 */}
            <View style={[styles.inputGroup, { zIndex: varietySuggestions.length > 0 && currentTasting.variety ? 4 : 1 }]}>
              <AutocompleteInput
                value={currentTasting.variety || ''}
                onChangeText={(text) => updateField('variety', text)}
                onSelect={(item) => updateField('variety', item)}
                suggestions={varietySuggestions}
                placeholder="예: Heirloom, Geisha"
                label="품종"
              />
            </View>

            {/* 가공 방식 */}
            <View style={[styles.inputGroup, { zIndex: processSuggestions.length > 0 && currentTasting.process ? 3 : 1 }]}>
              <AutocompleteInput
                value={currentTasting.process || ''}
                onChangeText={(text) => updateField('process', text)}
                onSelect={(item) => updateField('process', item)}
                suggestions={processSuggestions}
                placeholder="예: Washed, Natural"
                label="가공 방식"
              />
            </View>

            {/* 고도 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>고도</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 1,800-2,000m"
                placeholderTextColor="#CCCCCC"
                value={currentTasting.altitude}
                onChangeText={(text) => updateField('altitude', text)}
              />
            </View>

            {/* 로스팅 레벨 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>로스팅 레벨</Text>
              <View style={styles.roastLevelButtons}>
                {roastLevelOptions.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.roastButton,
                      currentTasting.roastLevel === level && styles.roastButtonActive,
                    ]}
                    onPress={() => updateField('roastLevel', level)}>
                    <Text style={[
                      styles.roastButtonText,
                      currentTasting.roastLevel === level && styles.roastButtonTextActive,
                    ]}>
                      {level === 'Light' ? '☕ Light' : 
                       level === 'Medium' ? '🟤 Medium' : 
                       '⚫ Dark'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 온도 선택 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>온도</Text>
              <View style={styles.temperatureButtons}>
                <TouchableOpacity
                  style={[
                    styles.tempButton,
                    currentTasting.temperature === 'hot' && styles.tempButtonActive,
                  ]}
                  onPress={() => updateField('temperature', 'hot')}>
                  <Text style={[
                    styles.tempButtonText,
                    currentTasting.temperature === 'hot' && styles.tempButtonTextActive,
                  ]}>
                    ☕ Hot
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tempButton,
                    currentTasting.temperature === 'ice' && styles.tempButtonActive,
                  ]}
                  onPress={() => updateField('temperature', 'ice')}>
                  <Text style={[
                    styles.tempButtonText,
                    currentTasting.temperature === 'ice' && styles.tempButtonTextActive,
                  ]}>
                    🧊 Ice
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* 다음 버튼 */}
        <View style={styles.bottomContainer}>
          <NavigationButton
            title="다음"
            onPress={handleNext}
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
  skipButtonText: {
    fontSize: 17,
    fontWeight: '400',
    color: HIGColors.blue,
    minWidth: HIGConstants.MIN_TOUCH_TARGET,
    textAlign: 'right',
  },
  progressBar: {
    height: 4,
    backgroundColor: HIGColors.gray5,
  },
  progressFill: {
    height: 4,
    width: '43%', // 3/7 = 43%
    backgroundColor: HIGColors.blue,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: HIGConstants.SPACING_LG,
  },
  form: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_LG,
    paddingBottom: HIGConstants.SPACING_XL,
  },
  sectionHeader: {
    marginBottom: HIGConstants.SPACING_XL,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  input: {
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
    borderWidth: 1,
    borderColor: HIGColors.gray4,
    borderRadius: HIGConstants.BORDER_RADIUS,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    fontSize: 17,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  roastLevelButtons: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_SM,
    marginTop: HIGConstants.SPACING_XS,
  },
  roastButton: {
    flex: 1,
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
    borderWidth: 1,
    borderColor: HIGColors.gray4,
    borderRadius: HIGConstants.BORDER_RADIUS,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_SM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roastButtonActive: {
    backgroundColor: HIGColors.systemBrown,
    borderColor: HIGColors.systemBrown,
  },
  roastButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: HIGColors.label,
    textAlign: 'center',
  },
  roastButtonTextActive: {
    color: '#FFFFFF',
  },
  temperatureButtons: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_MD,
    marginTop: HIGConstants.SPACING_XS,
  },
  tempButton: {
    flex: 1,
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
    borderWidth: 1,
    borderColor: HIGColors.gray4,
    borderRadius: HIGConstants.BORDER_RADIUS,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempButtonActive: {
    backgroundColor: HIGColors.blue,
    borderColor: HIGColors.blue,
  },
  tempButtonText: {
    fontSize: 17,
    fontWeight: '400',
    color: HIGColors.label,
  },
  tempButtonTextActive: {
    color: '#FFFFFF',
  },
  bottomContainer: {
    padding: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_MD,
    borderTopWidth: 0.5,
    borderTopColor: HIGColors.gray4,
    backgroundColor: '#FFFFFF',
  },
});

export default CoffeeDetailsScreen;