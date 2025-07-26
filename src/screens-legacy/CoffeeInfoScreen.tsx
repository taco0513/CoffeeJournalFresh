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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {useTastingStore} from '../stores/tastingStore';
import { useDevStore } from '../stores/useDevStore';
import { CurrentTasting } from '../types/tasting';
import { AutocompleteInput } from '../components/common';
import RealmService from '../services/realm/RealmService';
import { NavigationButton } from '../components/common';
import { HIGConstants, HIGColors } from '../styles/common';
import { searchRoasters, searchCoffees } from '../services/supabase/coffeeSearch';
import { AddCoffeeModal } from '../components/AddCoffeeModal';
import { BetaFeedbackPrompt } from '../components/beta/BetaFeedbackPrompt';
import { FloatingDummyDataButton } from '../components/dev/FloatingDummyDataButton';

const CoffeeInfoScreen = () => {
  const navigation = useNavigation();
  
  // Zustand store 사용
  const { currentTasting, updateField } = useTastingStore();
  const { isDeveloperMode } = useDevStore();
  
  // 자동완성 상태
  const [cafeSuggestions, setCafeSuggestions] = useState<string[]>([]);
  const [roasterSuggestions, setRoasterSuggestions] = useState<string[]>([]);
  const [coffeeNameSuggestions, setCoffeeNameSuggestions] = useState<string[]>([]);
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [varietySuggestions, setVarietySuggestions] = useState<string[]>([]);
  const [processSuggestions, setProcessSuggestions] = useState<string[]>([]);
  const [showAddCoffeeModal, setShowAddCoffeeModal] = useState(false);
  const [showCoffeeDetails, setShowCoffeeDetails] = useState(false);
  
  const realmService = RealmService.getInstance();
  
  // 기본 가공 방식과 로스팅 레벨 옵션
  const defaultProcessOptions = ['Washed', 'Natural', 'Honey', 'Anaerobic'];
  const roastLevelOptions = ['Light', 'Medium', 'Dark'];


  

  
  
  
  
  
  
  // 필수 필드가 채워졌는지 확인 (커피명, 로스터리, 온도)
  // Cafe 모드인 경우에만 카페이름도 필수
  const isValid = currentTasting.coffeeName && currentTasting.coffeeName.trim().length > 0 &&
                  currentTasting.roastery && currentTasting.roastery.trim().length > 0 &&
                  (currentTasting.mode !== 'cafe' || 
                   (currentTasting.cafeName && currentTasting.cafeName.trim().length > 0)) &&
                  currentTasting.temperature;

  // Parse coffee name and auto-fill fields
  const handleCoffeeNameParse = (coffeeName: string) => {
    const parsed = { origin: null, variety: null, process: null };
    
    const updates: Record<string, string> = { coffeeName };
    
    if (parsed.origin && !currentTasting.origin) {
      updates.origin = parsed.origin;
  }
    
    if (parsed.variety && !currentTasting.variety) {
      updates.variety = parsed.variety;
  }
    
    if (parsed.process && !currentTasting.process) {
      updates.process = parsed.process;
  }
    
    Object.keys(updates).forEach(key => {
      updateField(key as keyof CurrentTasting, updates[key as keyof typeof updates]);
  });
};

  const handleNext = () => {
    if (isValid) {
      // 방문 횟수 증가
      if (currentTasting.cafeName && currentTasting.cafeName.trim().length > 0) {
        realmService.incrementCafeVisit(currentTasting.cafeName);
    }
      if (currentTasting.roastery && currentTasting.roastery.trim().length > 0) {
        realmService.incrementRoasterVisit(currentTasting.roastery);
    }
      
      // Navigate based on mode
      if (currentTasting.mode === 'home_cafe') {
        navigation.navigate('HomeCafe' as never);
    } else if (currentTasting.mode === 'lab') {
        navigation.navigate('ExperimentalData' as never);
    } else {
        navigation.navigate('UnifiedFlavor' as never);
    }
  }
};


  return (
    <SafeAreaView style={styles.container}>
      <BetaFeedbackPrompt 
        screenName="Coffee Info Entry"
        context="User is entering coffee details"
        delayMs={10000} // 10 seconds after entering screen
      />
      
      <FloatingDummyDataButton />
      
      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity onPress={() => {
          // Just go back - navigation should handle it
          navigation.goBack();
      }}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navigationTitle}>커피 정보</Text>
        <TouchableOpacity onPress={() => {
          if (currentTasting.mode === 'home_cafe') {
            navigation.navigate('HomeCafe' as never);
        } else {
            navigation.navigate('UnifiedFlavor' as never);
        }
      }}>
          <Text style={styles.skipButton}>건너뛰기</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar - Full width below header */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '17%' }]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* 가이드 메시지 */}
          <View style={styles.guideSection}>
            <Text style={styles.guideText}>
              커피 봉투에 적힌 정보를 입력해주세요
            </Text>
          </View>

          {/* 입력 폼 */}
          <View style={styles.form}>
            {/* 카페 이름 - Cafe 모드일 때만 표시 */}
            {currentTasting.mode === 'cafe' && (
              <View style={[styles.inputGroup, { zIndex: cafeSuggestions.length > 0 && currentTasting.cafeName ? 10 : 1 }]}>
                <AutocompleteInput
                  value={currentTasting.cafeName || ''}
                  onChangeText={(text) => updateField('cafeName', text)}
                  onSelect={(item) => {
                    // Update cafe name
                    updateField('cafeName', item);
                    
                    // Check if there's a roastery with the same name
                    const roastersWithSameName = realmService.getRoasterSuggestions(item);
                    if (roastersWithSameName.length > 0 && 
                        roastersWithSameName.some(r => r.name === item) &&
                        !currentTasting.roastery) {
                      // Auto-fill roastery if cafe name matches a roastery name
                      updateField('roastery', item);
                  }
                }}
                  suggestions={['Home', ...cafeSuggestions]}
                  placeholder="예: 블루보틀 (집에서는 'Home' 선택)"
                  label="카페 이름 *"
                />
              </View>
            )}

              {/* 로스터리 (필수) */}
              <View style={[styles.inputGroup, { zIndex: roasterSuggestions.length > 0 && currentTasting.roastery ? 5 : 1 }]}>
                <AutocompleteInput
                  value={currentTasting.roastery || ''}
                  onChangeText={(text) => updateField('roastery', text)}
                  onSelect={(item) => updateField('roastery', item)}
                  suggestions={roasterSuggestions}
                  placeholder="예: 프릳츠"
                  label="로스터리 *"
                />
              </View>

              {/* 커피 이름 (필수) */}
              <View style={[styles.inputGroup, { zIndex: coffeeNameSuggestions.length > 0 && currentTasting.coffeeName ? 4 : 1 }]}>
                <AutocompleteInput
                  value={currentTasting.coffeeName || ''}
                  onChangeText={(text) => updateField('coffeeName', text)}
                  onSelect={async (item) => {
                    // Check if user wants to add a new coffee
                    if (item.startsWith('+ "') && item.includes('새 커피 등록')) {
                      setShowAddCoffeeModal(true);
                      return;
                  }
                    
                    // Update coffee name
                    updateField('coffeeName', item);
                    
                    // Auto-fill other fields if we have previous data
                    if (currentTasting.roastery) {
                      // First check local database
                      const details = realmService.getCoffeeDetails(currentTasting.roastery, item);
                      if (details) {
                        if (details.origin) updateField('origin', details.origin);
                        if (details.variety) updateField('variety', details.variety);
                        if (details.altitude) updateField('altitude', details.altitude);
                        if (details.process) updateField('process', details.process);
                        if (details.roasterNotes) updateField('roasterNotes', details.roasterNotes);
                    } else {
                        // Check Supabase for coffee details
                        const supabaseCoffees = await searchCoffees(currentTasting.roastery, item);
                        const matchedCoffee = supabaseCoffees.find(c => c.coffee_name === item);
                        
                        if (matchedCoffee) {
                          if (matchedCoffee.origin) updateField('origin', matchedCoffee.origin);
                          if (matchedCoffee.variety) updateField('variety', matchedCoffee.variety);
                          if (matchedCoffee.process) updateField('process', matchedCoffee.process);
                          if (matchedCoffee.altitude) updateField('altitude', matchedCoffee.altitude);
                          if (matchedCoffee.region) {
                            // If we have region info, append it to origin
                            const origin = matchedCoffee.origin 
                              ? `${matchedCoffee.origin} / ${matchedCoffee.region}`
                              : matchedCoffee.region;
                            updateField('origin', origin);
                        }
                      } else {
                          // If no data found, try parsing the coffee name
                          handleCoffeeNameParse(item);
                      }
                    }
                  } else {
                      // If no roastery selected, try parsing the coffee name
                      handleCoffeeNameParse(item);
                  }
                }}
                  onBlur={() => {
                    // Parse coffee name when user finishes typing
                    if (currentTasting.coffeeName) {
                      handleCoffeeNameParse(currentTasting.coffeeName);
                  }
                }}
                  suggestions={coffeeNameSuggestions}
                  placeholder="예: 에티오피아 예가체프 G1"
                  label="커피 이름 *"
                />
              </View>

              {/* Coffee Details Accordion */}
              <TouchableOpacity 
                style={styles.accordionHeader}
                onPress={() => setShowCoffeeDetails(!showCoffeeDetails)}
                activeOpacity={0.7}
              >
                <View style={styles.accordionHeaderContent}>
                  <Text style={styles.accordionTitle}>상세 정보</Text>
                </View>
                <Text style={[styles.accordionIcon, showCoffeeDetails && styles.accordionIconExpanded]}>
                  ›
                </Text>
              </TouchableOpacity>

              {showCoffeeDetails && (
                <View style={styles.accordionContent}>
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
                          onPress={() => updateField('roastLevel', currentTasting.roastLevel === level ? '' : level)}>
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
                </View>
              )}

              {/* 온도 선택 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>온도 *</Text>
                <View style={styles.temperatureButtons}>
                  <TouchableOpacity
                    style={[
                      styles.tempButton,
                      currentTasting.temperature === 'hot' && styles.tempButtonActive,
                    ]}
                    onPress={() => updateField('temperature', currentTasting.temperature === 'hot' ? 'cold' : 'hot')}>
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
                      currentTasting.temperature === 'cold' && styles.tempButtonActive,
                    ]}
                    onPress={() => updateField('temperature', currentTasting.temperature === 'cold' ? 'hot' : 'cold')}>
                    <Text style={[
                      styles.tempButtonText,
                      currentTasting.temperature === 'cold' && styles.tempButtonTextActive,
                    ]}>
                      🧊 Ice
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.nextButton, !isValid && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!isValid}
        >
          <Text style={styles.nextButtonText}>다음</Text>
        </TouchableOpacity>
      </View>
      
      {/* 커피 추가 모달 */}
      <AddCoffeeModal
        visible={showAddCoffeeModal}
        onClose={() => setShowAddCoffeeModal(false)}
        roastery={currentTasting.roastery || ''}
        onCoffeeAdded={(coffeeName) => {
          updateField('coffeeName', coffeeName);
          setShowAddCoffeeModal(false);
      }}
      />
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
  scrollView: {
    flex: 1,
},
  scrollContent: {
    flexGrow: 1,
},
  form: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_SM,
    paddingBottom: HIGConstants.SPACING_MD,
},
  inputGroup: {
    marginBottom: HIGConstants.SPACING_SM,
},
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
},
  input: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
    borderRadius: HIGConstants.BORDER_RADIUS,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
},
  temperatureButtons: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_SM,
    marginTop: HIGConstants.SPACING_XS,
},
  tempButton: {
    flex: 1,
    minHeight: 36,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
    borderRadius: HIGConstants.BORDER_RADIUS,
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
    alignItems: 'center',
    justifyContent: 'center',
},
  tempButtonActive: {
    backgroundColor: HIGColors.systemBlue,
    borderColor: HIGColors.systemBlue,
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: HIGColors.systemGray4,
},
  hintText: {
    fontSize: 12,
    color: HIGColors.secondaryLabel,
    marginTop: HIGConstants.SPACING_XS,
    marginBottom: HIGConstants.SPACING_SM,
    paddingHorizontal: HIGConstants.SPACING_SM,
    lineHeight: 16,
    backgroundColor: '#F8F9FA',
    padding: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.BORDER_RADIUS / 2,
    borderLeftWidth: 2,
    borderLeftColor: HIGColors.systemBlue,
},
  roastLevelButtons: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_SM,
    marginTop: HIGConstants.SPACING_XS,
},
  roastButton: {
    flex: 1,
    minHeight: 36,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
    borderRadius: HIGConstants.BORDER_RADIUS,
    paddingHorizontal: HIGConstants.SPACING_XS,
    paddingVertical: HIGConstants.SPACING_XS,
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
  guideSection: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    backgroundColor: '#E3F2FD',
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.systemGray5,
},
  guideText: {
    fontSize: 15,
    color: HIGColors.systemBlue,
    textAlign: 'center',
    fontWeight: '500',
},
  nextButton: {
    height: 48,
    backgroundColor: HIGColors.systemBlue,
    borderRadius: HIGConstants.cornerRadiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
},
  nextButtonDisabled: {
    backgroundColor: HIGColors.systemGray4,
},
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
},
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    marginVertical: HIGConstants.SPACING_SM,
    borderWidth: 1,
    borderColor: HIGColors.systemGray5,
},
  accordionHeaderContent: {
    flex: 1,
},
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 4,
},
  accordionSubtitle: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    lineHeight: 18,
},
  accordionIcon: {
    fontSize: 20,
    color: HIGColors.tertiaryLabel,
    marginLeft: HIGConstants.SPACING_SM,
},
  accordionIconExpanded: {
    transform: [{ rotate: '90deg' }],
},
  accordionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    marginTop: -HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_MD,
    borderWidth: 1,
    borderColor: HIGColors.systemGray5,
    borderTopWidth: 0,
},
});

export default CoffeeInfoScreen;