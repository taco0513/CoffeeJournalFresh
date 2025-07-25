import React, { useState, useEffect } from 'react';
import { SafeAreaView, Switch, Alert } from 'react-native';
import {
  View,
  Text,
  ScrollView,
  Button,
  YStack,
  XStack,
  Card,
  Separator,
  H1,
  H2,
  H3,
  Paragraph,
  SizableText,
  styled,
  useTheme,
  AnimatePresence,
  GetProps,
} from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTastingStore } from '../../stores/tastingStore';
import { HomeCafeData } from '../../types/tasting';

// Enhanced HomeCafe Components
import EnhancedDripperSelector from '../../components/homecafe/EnhancedDripperSelector';
import RecipeTemplateSelector from '../../components/homecafe/RecipeTemplateSelector';
import GrindSizeGuide from '../../components/homecafe/GrindSizeGuide';
import PourPatternGuide from '../../components/homecafe/PourPatternGuide';
import InteractiveBrewTimer from '../../components/homecafe/InteractiveBrewTimer';

// Services
import HomeCafeEnhancedService, { RecipeTemplate } from '../../services/HomeCafeEnhancedService';

interface EnhancedHomeCafeScreenProps {
  onNext?: () => void;
}

// Styled Components
const Container = styled(View, {
  name: 'EnhancedHomeCafeContainer',
  flex: 1,
  backgroundColor: '$background',
});

const NavigationBar = styled(XStack, {
  name: 'EnhancedHomeCafeNavigation',
  height: 44,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  backgroundColor: '$background',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
});

const BackButton = styled(Button, {
  name: 'BackButton',
  backgroundColor: 'transparent',
  borderWidth: 0,
  paddingHorizontal: '$sm',
  pressStyle: {
    opacity: 0.7,
    scale: 0.95,
  },
});

const NavigationTitle = styled(H1, {
  name: 'NavigationTitle',
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
});

const AdvancedModeToggle = styled(XStack, {
  name: 'AdvancedModeToggle',
  alignItems: 'center',
  gap: '$sm',
});

const AdvancedModeText = styled(Text, {
  name: 'AdvancedModeText',
  fontSize: '$3',
  color: '$gray11',
});

const SectionContainer = styled(YStack, {
  name: 'SectionContainer',
  gap: '$lg',
  paddingHorizontal: '$lg',
  paddingVertical: '$lg',
});

const SectionCard = styled(Card, {
  name: 'SectionCard',
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderWidth: 0.5,
  borderRadius: '$4',
  padding: '$lg',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  variants: {
    active: {
      true: {
        borderColor: '$cupBlue',
        backgroundColor: '$cupBlueLight',
      },
    },
  } as const,
});

const SectionHeader = styled(XStack, {
  name: 'SectionHeader',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '$md',
});

const SectionTitle = styled(H2, {
  name: 'SectionTitle',
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
});

const SectionIcon = styled(Text, {
  name: 'SectionIcon',
  fontSize: 24,
});

const TabContainer = styled(XStack, {
  name: 'TabContainer',
  backgroundColor: '$gray2',
  borderRadius: '$3',
  padding: '$xs',
  gap: '$xs',
});

const Tab = styled(Button, {
  name: 'Tab',
  flex: 1,
  backgroundColor: 'transparent',
  borderWidth: 0,
  paddingVertical: '$sm',
  borderRadius: '$2',
  variants: {
    active: {
      true: {
        backgroundColor: '$background',
        shadowColor: '$shadowColor',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    },
  } as const,
  pressStyle: {
    scale: 0.98,
  },
  animation: 'quick',
});

const TabText = styled(Text, {
  name: 'TabText',
  fontSize: '$3',
  fontWeight: '500',
  textAlign: 'center',
  variants: {
    active: {
      true: {
        color: '$cupBlue',
        fontWeight: '600',
      },
      false: {
        color: '$gray11',
      },
    },
  } as const,
});

const FormRow = styled(XStack, {
  name: 'FormRow',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: 44,
  paddingVertical: '$sm',
});

const FormLabel = styled(Text, {
  name: 'FormLabel',
  fontSize: '$4',
  fontWeight: '500',
  color: '$color',
  flex: 1,
});

const FormValue = styled(XStack, {
  name: 'FormValue',
  alignItems: 'center',
  gap: '$sm',
});

const ValueButton = styled(Button, {
  name: 'ValueButton',
  backgroundColor: '$gray4',
  borderColor: '$borderColor',
  borderWidth: 0.5,
  borderRadius: '$2',
  paddingHorizontal: '$md',
  paddingVertical: '$xs',
  minWidth: 60,
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$gray5',
  },
});

const ValueText = styled(Text, {
  name: 'ValueText',
  fontSize: '$3',
  color: '$color',
  textAlign: 'center',
});

const QuickActionsCard = styled(SectionCard, {
  name: 'QuickActionsCard',
});

const QuickActionsGrid = styled(XStack, {
  name: 'QuickActionsGrid',
  flexWrap: 'wrap',
  gap: '$sm',
});

const QuickActionButton = styled(Button, {
  name: 'QuickActionButton',
  flex: 1,
  minWidth: '45%',
  backgroundColor: '$cupBlue',
  borderWidth: 0,
  borderRadius: '$3',
  paddingVertical: '$md',
  animation: 'bouncy',
  pressStyle: {
    scale: 0.95,
    backgroundColor: '$cupBlueDark',
  },
});

const QuickActionContent = styled(YStack, {
  name: 'QuickActionContent',
  alignItems: 'center',
  gap: '$xs',
});

const QuickActionIcon = styled(Text, {
  name: 'QuickActionIcon',
  fontSize: 20,
});

const QuickActionText = styled(Text, {
  name: 'QuickActionText',
  fontSize: '$3',
  fontWeight: '500',
  color: 'white',
  textAlign: 'center',
});

const BottomActions = styled(XStack, {
  name: 'BottomActions',
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: '$background',
  borderTopWidth: 0.5,
  borderTopColor: '$borderColor',
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
  gap: '$md',
});

const PrimaryButton = styled(Button, {
  name: 'PrimaryButton',
  flex: 1,
  backgroundColor: '$cupBlue',
  color: 'white',
  borderRadius: '$3',
  paddingVertical: '$md',
  fontSize: '$4',
  fontWeight: '600',
  pressStyle: {
    backgroundColor: '$cupBlueDark',
    scale: 0.98,
  },
});

const SecondaryButton = styled(Button, {
  name: 'SecondaryButton',
  backgroundColor: '$gray4',
  borderColor: '$borderColor',
  borderWidth: 0.5,
  borderRadius: '$3',
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$gray5',
  },
});

const TimerModal = styled(Card, {
  name: 'TimerModal',
  position: 'absolute',
  top: '20%',
  left: '$lg',
  right: '$lg',
  backgroundColor: '$background',
  borderRadius: '$4',
  padding: '$xl',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  zIndex: 1000,
  animation: 'bouncy',
  enterStyle: {
    opacity: 0,
    scale: 0.8,
    y: -50,
  },
  exitStyle: {
    opacity: 0,
    scale: 0.8,
    y: -50,
  },
});

export type EnhancedHomeCafeScreenProps_Styled = GetProps<typeof Container>;

export const EnhancedHomeCafeScreen: React.FC<EnhancedHomeCafeScreenProps> = ({ onNext }) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { currentTasting, updateHomeCafeData } = useTastingStore();
  const enhancedService = HomeCafeEnhancedService.getInstance();

  // Form state
  const [formData, setFormData] = useState<HomeCafeData>(
    currentTasting.homeCafeData || {
      equipment: {
        dripper: 'V60',
        filter: 'bleached',
      },
      recipe: {
        doseIn: 20,
        waterAmount: 300,
        ratio: '1:15',
        waterTemp: 92,
        bloomWater: 40,
        bloomTime: 30,
        pourTechnique: 'pulse',
        numberOfPours: 3,
        totalBrewTime: 180,
      },
    }
  );

  // UI state
  const [activeSection, setActiveSection] = useState<string>('dripper');
  const [showTimer, setShowTimer] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeTemplate | null>(null);
  const [useAdvancedMode, setUseAdvancedMode] = useState(false);

  // Update parent store when form data changes
  useEffect(() => {
    updateHomeCafeData(formData);
  }, [formData, updateHomeCafeData]);

  const updateField = (category: keyof HomeCafeData, field: string, value: any) => {
    const updatedFormData = {
      ...formData,
      [category]: {
        ...formData[category],
        [field]: value,
      },
    } as HomeCafeData;
    
    setFormData(updatedFormData);
  };

  const handleDripperSelect = (dripper: string) => {
    updateField('equipment', 'dripper', dripper);
    
    // Auto-calculate recommended recipe
    const recommendedRecipe = enhancedService.calculateRecommendedRecipe(
      dripper,
      formData.recipe.doseIn
    );
    
    if (recommendedRecipe.waterAmount) {
      updateField('recipe', 'waterAmount', recommendedRecipe.waterAmount);
    }
    if (recommendedRecipe.ratio) {
      updateField('recipe', 'ratio', recommendedRecipe.ratio);
    }
    if (recommendedRecipe.waterTemp) {
      updateField('recipe', 'waterTemp', recommendedRecipe.waterTemp);
    }
  };

  const handleRecipeTemplateSelect = (template: RecipeTemplate) => {
    setSelectedRecipe(template);
    
    // Apply template to form data
    setFormData({
      ...formData,
      equipment: {
        ...formData.equipment,
        dripper: template.dripper,
        filter: template.filter || formData.equipment.filter,
      },
      recipe: {
        ...formData.recipe,
        ...template.recipe,
      },
    });
  };

  const handleStartTimer = () => {
    if (!formData.recipe.totalBrewTime) {
      Alert.alert('오류', '먼저 총 추출 시간을 설정해주세요.');
      return;
    }
    setShowTimer(true);
  };

  const handleTimerComplete = (actualBrewTime: number) => {
    updateField('recipe', 'totalBrewTime', actualBrewTime);
    setShowTimer(false);
    
    Alert.alert(
      '추출 완료!',
      `실제 추출 시간: ${Math.floor(actualBrewTime / 60)}분 ${actualBrewTime % 60}초`,
      [{ text: '확인' }]
    );
  };

  const renderSectionTabs = () => {
    const sections = [
      { key: 'dripper', label: '드리퍼', icon: '⏳' },
      { key: 'recipe', label: '레시피', icon: '📊' },
      { key: 'guides', label: '가이드', icon: '📖' },
      { key: 'timer', label: '타이머', icon: '⏰' },
    ];

    return (
      <TabContainer>
        {sections.map((section) => (
          <Tab
            key={section.key}
            active={activeSection === section.key}
            onPress={() => setActiveSection(section.key)}
            unstyled
          >
            <XStack alignItems="center" gap="$xs">
              <Text fontSize={16}>{section.icon}</Text>
              <TabText active={activeSection === section.key}>
                {section.label}
              </TabText>
            </XStack>
          </Tab>
        ))}
      </TabContainer>
    );
  };

  const renderFormRow = (label: string, value: string | number, onPress: () => void) => (
    <FormRow>
      <FormLabel>{label}</FormLabel>
      <FormValue>
        <ValueButton onPress={onPress} unstyled>
          <ValueText>{value}</ValueText>
        </ValueButton>
      </FormValue>
    </FormRow>
  );

  const renderQuickActions = () => (
    <QuickActionsCard>
      <SectionHeader>
        <SectionTitle>빠른 액션</SectionTitle>
        <SectionIcon>⚡</SectionIcon>
      </SectionHeader>
      
      <QuickActionsGrid>
        <QuickActionButton onPress={handleStartTimer} unstyled>
          <QuickActionContent>
            <QuickActionIcon>⏰</QuickActionIcon>
            <QuickActionText>타이머 시작</QuickActionText>
          </QuickActionContent>
        </QuickActionButton>
        
        <QuickActionButton 
          onPress={() => setActiveSection('guides')} 
          unstyled
        >
          <QuickActionContent>
            <QuickActionIcon>📖</QuickActionIcon>
            <QuickActionText>추출 가이드</QuickActionText>
          </QuickActionContent>
        </QuickActionButton>
        
        <QuickActionButton 
          onPress={() => {
            const template = enhancedService.getRecommendedRecipe(formData.equipment.dripper);
            if (template) handleRecipeTemplateSelect(template);
          }}
          unstyled
        >
          <QuickActionContent>
            <QuickActionIcon>🎯</QuickActionIcon>
            <QuickActionText>추천 레시피</QuickActionText>
          </QuickActionContent>
        </QuickActionButton>
        
        <QuickActionButton 
          onPress={() => setUseAdvancedMode(!useAdvancedMode)}
          unstyled
        >
          <QuickActionContent>
            <QuickActionIcon>{useAdvancedMode ? '🔧' : '⚙️'}</QuickActionIcon>
            <QuickActionText>
              {useAdvancedMode ? '고급 모드' : '간단 모드'}
            </QuickActionText>
          </QuickActionContent>
        </QuickActionButton>
      </QuickActionsGrid>
    </QuickActionsCard>
  );

  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Navigation Bar */}
        <NavigationBar>
          <BackButton unstyled onPress={() => navigation.goBack()}>
            <Text color="$cupBlue" fontSize="$6">←</Text>
          </BackButton>
          <NavigationTitle>향상된 홈카페</NavigationTitle>
          <AdvancedModeToggle>
            <AdvancedModeText>고급</AdvancedModeText>
            <Switch
              value={useAdvancedMode}
              onValueChange={setUseAdvancedMode}
              trackColor={{ false: '$gray6', true: '$cupBlue' }}
              thumbColor={useAdvancedMode ? '$background' : '$gray10'}
            />
          </AdvancedModeToggle>
        </NavigationBar>

        {/* Section Tabs */}
        <View paddingHorizontal="$lg" paddingVertical="$sm">
          {renderSectionTabs()}
        </View>

        <ScrollView 
          flex={1} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <SectionContainer>
            <AnimatePresence key={activeSection}>
              {activeSection === 'dripper' && (
                <SectionCard
                  active={activeSection === 'dripper'}
                  animation="lazy"
                  animateOnly={['opacity', 'transform']}
                >
                  <SectionHeader>
                    <SectionTitle>드리퍼 선택</SectionTitle>
                    <SectionIcon>⏳</SectionIcon>
                  </SectionHeader>
                  <EnhancedDripperSelector
                    selectedDripper={formData.equipment.dripper}
                    onDripperSelect={handleDripperSelect}
                    showRecommendations={useAdvancedMode}
                  />
                </SectionCard>
              )}

              {activeSection === 'recipe' && (
                <SectionCard
                  active={activeSection === 'recipe'}
                  animation="lazy"
                  animateOnly={['opacity', 'transform']}
                >
                  <SectionHeader>
                    <SectionTitle>레시피 설정</SectionTitle>
                    <SectionIcon>📊</SectionIcon>
                  </SectionHeader>
                  
                  {useAdvancedMode && (
                    <RecipeTemplateSelector
                      selectedTemplate={selectedRecipe}
                      onTemplateSelect={handleRecipeTemplateSelect}
                      dripper={formData.equipment.dripper}
                    />
                  )}
                  
                  <YStack gap="$sm" marginTop="$md">
                    {renderFormRow(
                      '원두량',
                      `${formData.recipe.doseIn}g`,
                      () => {
                        Alert.prompt(
                          '원두량 설정',
                          '원두량을 입력하세요 (g)',
                          (text) => {
                            const value = parseInt(text);
                            if (!isNaN(value) && value > 0) {
                              updateField('recipe', 'doseIn', value);
                            }
                          },
                          'plain-text',
                          formData.recipe.doseIn.toString()
                        );
                      }
                    )}
                    
                    {renderFormRow(
                      '물의 양',
                      `${formData.recipe.waterAmount}ml`,
                      () => {
                        Alert.prompt(
                          '물의 양 설정',
                          '물의 양을 입력하세요 (ml)',
                          (text) => {
                            const value = parseInt(text);
                            if (!isNaN(value) && value > 0) {
                              updateField('recipe', 'waterAmount', value);
                            }
                          },
                          'plain-text',
                          formData.recipe.waterAmount.toString()
                        );
                      }
                    )}
                    
                    {renderFormRow(
                      '물 온도',
                      `${formData.recipe.waterTemp}°C`,
                      () => {
                        Alert.prompt(
                          '물 온도 설정',
                          '물 온도를 입력하세요 (°C)',
                          (text) => {
                            const value = parseInt(text);
                            if (!isNaN(value) && value > 0) {
                              updateField('recipe', 'waterTemp', value);
                            }
                          },
                          'plain-text',
                          formData.recipe.waterTemp.toString()
                        );
                      }
                    )}
                    
                    <FormRow>
                      <FormLabel>비율</FormLabel>
                      <FormValue>
                        <ValueText>{formData.recipe.ratio}</ValueText>
                      </FormValue>
                    </FormRow>
                  </YStack>
                </SectionCard>
              )}

              {activeSection === 'guides' && (
                <YStack gap="$lg">
                  <SectionCard
                    animation="lazy"
                    animateOnly={['opacity', 'transform']}
                  >
                    <SectionHeader>
                      <SectionTitle>그라인드 가이드</SectionTitle>
                      <SectionIcon>⚙️</SectionIcon>
                    </SectionHeader>
                    <GrindSizeGuide 
                      dripper={formData.equipment.dripper}
                      brewMethod="pourover"
                    />
                  </SectionCard>
                  
                  <SectionCard
                    animation="lazy"
                    animateOnly={['opacity', 'transform']}
                  >
                    <SectionHeader>
                      <SectionTitle>푸어링 패턴</SectionTitle>
                      <SectionIcon>💧</SectionIcon>
                    </SectionHeader>
                    <PourPatternGuide 
                      technique={formData.recipe.pourTechnique}
                      dripper={formData.equipment.dripper}
                    />
                  </SectionCard>
                </YStack>
              )}

              {activeSection === 'timer' && (
                <SectionCard
                  animation="lazy"
                  animateOnly={['opacity', 'transform']}
                >
                  <SectionHeader>
                    <SectionTitle>추출 타이머</SectionTitle>
                    <SectionIcon>⏰</SectionIcon>
                  </SectionHeader>
                  <InteractiveBrewTimer
                    recipe={formData.recipe}
                    onComplete={handleTimerComplete}
                    showModal={showTimer}
                    onClose={() => setShowTimer(false)}
                  />
                </SectionCard>
              )}
            </AnimatePresence>

            {/* Quick Actions */}
            {renderQuickActions()}
          </SectionContainer>
        </ScrollView>

        {/* Bottom Actions */}
        <BottomActions>
          <SecondaryButton onPress={() => navigation.goBack()} unstyled>
            <Text fontSize="$4" color="$color">취소</Text>
          </SecondaryButton>
          <PrimaryButton onPress={onNext || (() => navigation.goBack())}>
            다음
          </PrimaryButton>
        </BottomActions>

        {/* Timer Modal */}
        {showTimer && (
          <AnimatePresence>
            <TimerModal>
              <InteractiveBrewTimer
                recipe={formData.recipe}
                onComplete={handleTimerComplete}
                showModal={true}
                onClose={() => setShowTimer(false)}
              />
            </TimerModal>
          </AnimatePresence>
        )}
      </SafeAreaView>
    </Container>
  );
};

export default EnhancedHomeCafeScreen;