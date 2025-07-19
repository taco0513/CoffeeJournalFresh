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
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTastingStore} from '../stores/tastingStore';
import { AutocompleteInput } from '../components/common';
// Feature Backlog - Photo feature
// import PhotoPicker from '../components/PhotoPicker';
import RealmService from '../services/realm/RealmService';
import { parseCoffeeName } from '../utils/coffeeParser';
import { NavigationButton } from '../components/common';
// import CameraModal from '../components/CameraModal';
// Feature Backlog - OCR imports
// import { ParsedCoffeeInfo } from '../services/OCRService';
// import { parseOCRResult } from '../utils/ocrParser';
import { HIGConstants, HIGColors, commonButtonStyles, commonTextStyles } from '../styles/common';
import { searchRoasters, searchCoffees, CoffeeSearchResult } from '../services/supabase/coffeeSearch';
import { AddCoffeeModal } from '../components/AddCoffeeModal';

const CoffeeInfoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Zustand store 사용
  const { currentTasting, updateField } = useTastingStore();
  
  // 사진 상태 (Feature Backlog)
  // const [photoUri, setPhotoUri] = useState<string>(currentTasting.photoUri || '');
  
  // 자동완성 상태
  const [cafeSuggestions, setCafeSuggestions] = useState<string[]>([]);
  const [roasterSuggestions, setRoasterSuggestions] = useState<string[]>([]);
  const [coffeeNameSuggestions, setCoffeeNameSuggestions] = useState<string[]>([]);
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [varietySuggestions, setVarietySuggestions] = useState<string[]>([]);
  const [processSuggestions, setProcessSuggestions] = useState<string[]>([]);
  const [selectedCoffeeData, setSelectedCoffeeData] = useState<CoffeeSearchResult | null>(null);
  const [showAddCoffeeModal, setShowAddCoffeeModal] = useState(false);
  // const [showCafeSuggestions, setShowCafeSuggestions] = useState(false);
  // const [showRoasterSuggestions, setShowRoasterSuggestions] = useState(false);
  // const [showCameraModal, setShowCameraModal] = useState(false);
  
  // Feature Backlog - 스캔된 로스터 노트 저장
  // const [scannedRoasterNotes, setScannedRoasterNotes] = useState('');
  
  const realmService = RealmService.getInstance();
  
  // 기본 가공 방식 옵션
  const defaultProcessOptions = ['Washed', 'Natural', 'Honey', 'Anaerobic'];

  // Feature Backlog - OCR 결과 처리
  // useEffect(() => {
  //   const params = route.params as any;
  //   const ocrText = params?.ocrText;
  //   const scannedText = params?.scannedText;
  //   const scannedData = params?.scannedData;
  //   
  //   if (scannedData) {
  //     console.log('스캔 데이터 적용:', scannedData);
  //     
  //     // 각 필드에 맞게 데이터 설정
  //     if (scannedData.roastery) updateField('roastery', scannedData.roastery);
  //     if (scannedData.coffeeName) updateField('coffeeName', scannedData.coffeeName);
  //     if (scannedData.origin) updateField('origin', scannedData.origin);
  //     if (scannedData.variety) updateField('variety', scannedData.variety);
  //     if (scannedData.process) updateField('process', scannedData.process);
  //     if (scannedData.altitude) updateField('altitude', scannedData.altitude);
  //     
  //     // 로스터 노트 저장
  //     if (scannedData.roasterNotes) {
  //       setScannedRoasterNotes(scannedData.roasterNotes);
  //       console.log('스캔된 로스터 노트:', scannedData.roasterNotes);
  //     }
  //   } else if (scannedText) {
  //     // 스캔된 텍스트를 커피 이름에 설정
  //     updateField('coffeeName', scannedText);
  //     console.log('스캔된 텍스트 적용:', scannedText);
  //   } else if (ocrText) {
  //     handleOCRResult(ocrText);
  //   }
  // }, [route.params]);  // eslint-disable-line react-hooks/exhaustive-deps

  // 카페 입력 변경 시 제안 목록 업데이트
  useEffect(() => {
    if (currentTasting.cafeName && currentTasting.cafeName.trim().length > 0) {
      const suggestions = realmService.getCafeSuggestions(currentTasting.cafeName);
      setCafeSuggestions(suggestions.map(cafe => cafe.name));
    } else {
      setCafeSuggestions([]);
    }
  }, [currentTasting.cafeName]);
  
  // 로스터 입력 변경 시 제안 목록 업데이트 (카페 기반 + Supabase)
  useEffect(() => {
    const fetchRoasterSuggestions = async () => {
      const localSuggestions = [];
      
      if (currentTasting.cafeName) {
        // If cafe is selected, show roasters from that cafe
        const suggestions = realmService.getCafeRoasters(
          currentTasting.cafeName,
          currentTasting.roastery
        );
        localSuggestions.push(...suggestions);
      } else if (currentTasting.roastery && currentTasting.roastery.trim().length > 0) {
        // If no cafe selected, show all roaster suggestions
        const suggestions = realmService.getRoasterSuggestions(currentTasting.roastery);
        localSuggestions.push(...suggestions.map(roaster => roaster.name));
      }
      
      // Fetch from Supabase if query is long enough
      if (currentTasting.roastery && currentTasting.roastery.trim().length >= 2) {
        const supabaseRoasters = await searchRoasters(currentTasting.roastery);
        const supabaseNames = supabaseRoasters.map(r => r.name);
        
        // Combine local and Supabase suggestions, removing duplicates
        const combined = [...new Set([...localSuggestions, ...supabaseNames])];
        setRoasterSuggestions(combined.slice(0, 10));
      } else {
        setRoasterSuggestions(localSuggestions);
      }
    };
    
    fetchRoasterSuggestions();
  }, [currentTasting.roastery, currentTasting.cafeName]);
  
  // Add sample data if database is empty (for testing purposes)
  useEffect(() => {
    if (realmService.isInitialized) {
      try {
        const realm = realmService.getRealm();
        const allRecords = realm.objects('TastingRecord').filtered('isDeleted = false');
        
        // If database is empty, add some test data
        if (allRecords.length === 0) {
          const addTestData = async () => {
            const testTastings = [
              {
                coffeeInfo: {
                  cafeName: 'Test Cafe',
                  roastery: 'Blue Bottle',
                  coffeeName: 'Blue Bottle Blend',
                  origin: 'Ethiopia',
                  variety: 'Heirloom',
                  process: 'Washed'
                },
                matchScore: { total: 85, flavorScore: 40, sensoryScore: 45 }
              },
              {
                coffeeInfo: {
                  cafeName: 'Test Cafe 2',
                  roastery: 'Blue Bottle',
                  coffeeName: 'Blue Berry Blend',
                  origin: 'Kenya',
                  variety: 'SL28',
                  process: 'Natural'
                },
                matchScore: { total: 90, flavorScore: 45, sensoryScore: 45 }
              },
              {
                coffeeInfo: {
                  cafeName: 'Test Cafe 3',
                  roastery: 'Stumptown',
                  coffeeName: 'Stumptown Special',
                  origin: 'Colombia',
                  variety: 'Caturra',
                  process: 'Honey'
                },
                matchScore: { total: 80, flavorScore: 38, sensoryScore: 42 }
              }
            ];
            
            // Save test data sequentially
            for (const testTasting of testTastings) {
              try {
                await realmService.saveTasting(testTasting);
              } catch (error) {
                // console.error('Error saving test tasting:', error);
              }
            }
          };
          
          // Add test data asynchronously
          addTestData();
        }
      } catch (error) {
        // console.error('Error checking database on mount:', error);
      }
    }
  }, []);

  
  // 커피 이름 입력 변경 시 제안 목록 업데이트 (로스터리 기반 + Supabase)
  useEffect(() => {
    const fetchCoffeeSuggestions = async () => {
      const localSuggestions = [];
      
      if (currentTasting.roastery) {
        // If roastery is selected, show only coffees from that roastery
        const suggestions = realmService.getRoasterCoffees(
          currentTasting.roastery, 
          currentTasting.coffeeName || ''
        );
        localSuggestions.push(...suggestions);
        
        // Fetch from Supabase
        if (currentTasting.coffeeName && currentTasting.coffeeName.trim().length >= 2) {
          const supabaseCoffees = await searchCoffees(currentTasting.roastery, currentTasting.coffeeName);
          const supabaseNames = supabaseCoffees.map(c => c.coffee_name);
          
          // Combine local and Supabase suggestions, removing duplicates
          const combined = [...new Set([...localSuggestions, ...supabaseNames])];
          
          // Add "Add new coffee" option at the end if roastery is selected
          if (combined.length === 0 || !combined.some(name => 
            name.toLowerCase() === currentTasting.coffeeName.toLowerCase()
          )) {
            combined.push(`+ "${currentTasting.coffeeName}" 새 커피 등록`);
          }
          
          setCoffeeNameSuggestions(combined.slice(0, 11));
        } else {
          setCoffeeNameSuggestions(localSuggestions);
        }
      } else if (currentTasting.coffeeName && currentTasting.coffeeName.trim().length > 0) {
        // If no roastery selected, show all coffee suggestions
        const suggestions = realmService.getCoffeeNameSuggestions(currentTasting.coffeeName);
        setCoffeeNameSuggestions(suggestions);
      } else {
        setCoffeeNameSuggestions([]);
      }
    };
    
    fetchCoffeeSuggestions();
  }, [currentTasting.coffeeName, currentTasting.roastery]);
  
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
      // Filter default options based on input
      const filtered = defaultProcessOptions.filter(option => 
        option.toLowerCase().startsWith(currentTasting.process.toLowerCase())
      );
      // Also add previously used process methods from RealmService
      const previousProcesses = realmService.getProcessSuggestions(currentTasting.process);
      
      // Combine and remove duplicates
      const combined = [...new Set([...filtered, ...previousProcesses])];
      setProcessSuggestions(combined.slice(0, 10));
    } else {
      setProcessSuggestions(defaultProcessOptions);
    }
  }, [currentTasting.process]);
  
  // 필수 필드가 채워졌는지 확인
  const isValid = currentTasting.roastery && currentTasting.coffeeName;

  // Parse coffee name and auto-fill fields
  const handleCoffeeNameParse = (coffeeName: string) => {
    const parsed = parseCoffeeName(coffeeName);
    
    // Only update fields that are currently empty
    const updates: any = { coffeeName };
    
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
      updateField(key, updates[key as keyof typeof updates]);
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
      
      // Feature Backlog - 로스터 노트 전달
      // if (scannedRoasterNotes) {
      //   navigation.navigate('RoasterNotes' as never, {
      //     scannedRoasterNotes: scannedRoasterNotes
      //   } as never);
      // } else {
      navigation.navigate('RoasterNotes' as never);
      // }
    }
  };

  // Feature Backlog - OCR scan handler
  // const handleScanPress = () => {
  //   Alert.alert('테스트', '버튼이 클릭되었습니다!');
  //   console.log('OCR Scan button pressed');
  //   navigation.navigate('OCRScan' as never);
  // };

  // Feature Backlog - OCR result handler
  // const handleOCRResult = (ocrText: string) => {
  //   try {
  //     const parsedInfo = parseOCRResult([ocrText]);
  //     
  //     // Auto-fill form fields with extracted OCR data
  //     if (parsedInfo.coffeeName) {
  //       updateField('coffeeName', parsedInfo.coffeeName);
  //     }
  //     if (parsedInfo.roastery) {
  //       updateField('roastery', parsedInfo.roastery);
  //     }
  //     if (parsedInfo.origin) {
  //       updateField('origin', parsedInfo.origin);
  //     }
  //     if (parsedInfo.variety) {
  //       updateField('variety', parsedInfo.variety);
  //     }
  //     if (parsedInfo.process) {
  //       updateField('process', parsedInfo.process);
  //     }
  //     if (parsedInfo.altitude) {
  //       updateField('altitude', parsedInfo.altitude);
  //     }
  //   } catch (error) {
  //     console.error('OCR parsing error:', error);
  //   }
  // };

  // const handleCameraPress = () => {
  //   setShowCameraModal(true);
  // };

  // Feature Backlog - Text recognition handler
  // const handleTextRecognized = (info: ParsedCoffeeInfo) => {
  //   // Auto-fill form fields with extracted OCR data
  //   if (info.coffeeName) {
  //     updateField('coffeeName', info.coffeeName);
  //   }
  //   if (info.roastery) {
  //     updateField('roastery', info.roastery);
  //   }
  //   if (info.origin) {
  //     updateField('origin', info.origin);
  //   }
  //   if (info.variety) {
  //     updateField('variety', info.variety);
  //   }
  //   if (info.process) {
  //     updateField('process', info.process);
  //   }
  //   if (info.altitude) {
  //     updateField('altitude', info.altitude);
  //   }
  // };

  // 사진 선택 처리 (Feature Backlog)
  // const handlePhotoSelected = (uri: string) => {
  //   setPhotoUri(uri);
  //   updateField('photoUri', uri);
  // };

  // 사진 삭제 처리 (Feature Backlog)
  // const handlePhotoRemoved = () => {
  //   setPhotoUri('');
  //   updateField('photoUri', '');
  // };

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
        <Text style={styles.navigationTitle}>커피 정보</Text>
        <Text style={styles.progressIndicator}>2/6</Text>
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
          contentContainerStyle={{flexGrow: 1}}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled">

          {/* Feature Backlog - OCR 스캔 버튼 */}
          {/* <View style={styles.scanSection}>
            <TouchableOpacity 
              style={[commonButtonStyles.buttonSecondary, styles.scanButton]} 
              onPress={handleScanPress}
              activeOpacity={0.7}
            >
              <Text style={[commonTextStyles.buttonText, styles.scanButtonText]}>📷 패키지 촬영하기</Text>
            </TouchableOpacity>
            <Text style={styles.scanHint}>
              커피 패키지 라벨을 스캔하여 정보를 자동으로 입력하세요
            </Text>
          </View> */}

          {/* Feature Backlog - 사진 선택 */}
          {/* <View style={styles.form}>
            <PhotoPicker
              photoUri={photoUri}
              onPhotoSelected={handlePhotoSelected}
              onPhotoRemoved={handlePhotoRemoved}
            />
          </View> */}

          {/* 입력 폼 */}
          <View style={styles.form}>
            {/* 카페 이름 */}
            <View style={{ zIndex: cafeSuggestions.length > 0 && currentTasting.cafeName ? 10 : 1 }}>
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
                suggestions={cafeSuggestions}
                placeholder="예: 블루보틀"
                label="카페 이름"
              />
            </View>

            {/* 로스터리 (필수) */}
            <View style={{ zIndex: roasterSuggestions.length > 0 && currentTasting.roastery ? 5 : 1 }}>
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
            <View style={{ zIndex: coffeeNameSuggestions.length > 0 && currentTasting.coffeeName ? 4 : 1 }}>
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
                        setSelectedCoffeeData(matchedCoffee);
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
              <Text style={styles.hintText}>
                💡 생산지, 품종, 가공방식이 자동으로 인식됩니다. 블렌드도 지원합니다.
              </Text>
            </View>

            {/* 생산지 */}
            <View style={{ zIndex: originSuggestions.length > 0 && currentTasting.origin ? 3 : 1 }}>
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
            <View style={{ zIndex: varietySuggestions.length > 0 && currentTasting.variety ? 2 : 1 }}>
              <AutocompleteInput
                value={currentTasting.variety || ''}
                onChangeText={(text) => updateField('variety', text)}
                onSelect={(item) => updateField('variety', item)}
                suggestions={varietySuggestions}
                placeholder="예: Heirloom"
                label="품종"
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
                onChangeText={(text) => 
                  updateField('altitude', text)
                }
              />
            </View>

            {/* 가공 방식 */}
            <View style={{ zIndex: processSuggestions.length > 0 && currentTasting.process ? 1 : 1 }}>
              <AutocompleteInput
                value={currentTasting.process || ''}
                onChangeText={(text) => updateField('process', text)}
                onSelect={(item) => updateField('process', item)}
                suggestions={processSuggestions}
                placeholder="예: Washed"
                label="가공 방식"
              />
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
                  onPress={() => 
                    updateField('temperature', 'hot')
                  }>
                  <Text
                    style={[
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
                  onPress={() => 
                    updateField('temperature', 'ice')
                  }>
                  <Text
                    style={[
                      styles.tempButtonText,
                      currentTasting.temperature === 'ice' && styles.tempButtonTextActive,
                    ]}>
                    🧊 Ice
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 다음 버튼 */}
          <View style={styles.bottomContainer}>
            <NavigationButton
              title="다음"
              onPress={handleNext}
              disabled={!isValid}
              variant="primary"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Feature Backlog - 카메라 모달 */}
      {/* <CameraModal
        visible={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onTextRecognized={handleTextRecognized}
      /> */}
      
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
    backgroundColor: HIGColors.systemBackground,
  },
  navigationBar: {
    height: HIGConstants.MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: HIGColors.systemBackground,
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
  progressIndicator: {
    fontSize: 15,
    fontWeight: '400',
    color: HIGColors.secondaryLabel,
    minWidth: HIGConstants.MIN_TOUCH_TARGET,
    textAlign: 'right',
  },
  progressBar: {
    height: 4,
    backgroundColor: HIGColors.gray5,
  },
  progressFill: {
    height: 4,
    width: '33%', // 2/6 = 33%
    backgroundColor: HIGColors.blue,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    paddingHorizontal: HIGConstants.SPACING_LG,
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
  required: {
    color: HIGColors.red,
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
    backgroundColor: HIGColors.systemBackground,
  },
  temperatureButtons: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_SM,
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
    borderTopWidth: 0.5,
    borderTopColor: HIGColors.gray4,
  },
  hintText: {
    fontSize: 12,
    color: HIGColors.tertiaryLabel,
    marginTop: HIGConstants.SPACING_XS,
    marginBottom: HIGConstants.SPACING_LG,
    paddingHorizontal: HIGConstants.SPACING_XS,
  },
  scanSection: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    alignItems: 'center',
  },
  scanButton: {
    width: '100%',
    marginBottom: HIGConstants.SPACING_SM,
  },
  scanButtonText: {
    color: HIGColors.label,
    fontSize: 17,
    fontWeight: '600',
  },
  scanHint: {
    fontSize: 13,
    color: HIGColors.tertiaryLabel,
    textAlign: 'center',
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
});

export default CoffeeInfoScreen;