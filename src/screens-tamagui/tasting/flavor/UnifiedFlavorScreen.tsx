import React, { useLayoutEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IOSLayout, IOSSpacing } from '../../../styles/ios-hig-2024';
import {
  YStack,
  XStack,
  Text,
  ScrollView,
  Button,
  Progress,
  styled,
  useTheme,
  H3,
  Paragraph,
} from 'tamagui';
import { Platform, UIManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../../../stores/tastingStore';
import { useFlavorSelection } from '../../../hooks/useFlavorSelection';
import { CategoryAccordion } from '../../../components/flavor/CategoryAccordion';
import { SelectedFlavorsHeader } from '../../../components/flavor/SelectedFlavorsHeader';
import { FloatingButton } from '../../../components-tamagui/buttons/FloatingButton';
import { transformFlavorData } from '../../../components/flavor/utils/flavorDataTransform';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const flavorData = transformFlavorData();

// Styled components
const Container = styled(YStack, {
  name: 'Container',
  flex: 1,
  backgroundColor: '$background',
});



// NextButton removed - using FloatingButton component instead


export default function UnifiedFlavorScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { currentTasting, updateField } = useTastingStore();
  const selectedPaths = currentTasting.selectedFlavors || [];

  const {
    expandedCategories,
    expandedSubCategories,
    handleSelectSubcategory,
    handleSelectFlavor,
    handleRemoveFlavor,
    toggleCategory,
    toggleSubcategory,
    toggleAllCategories,
} = useFlavorSelection(selectedPaths, updateField as (field: string, value: unknown) => void);

  const handleNext = () => {
    // Navigate based on mode
    if (currentTasting.mode === 'lab') {
      navigation.navigate('ExperimentalData' as never);
  } else {
      // For both cafe and home_cafe modes, go to sensory evaluation
      navigation.navigate('Sensory' as never);
  }
};

  const handleSkip = () => {
    // Navigate based on mode
    if (currentTasting.mode === 'lab') {
      navigation.navigate('ExperimentalData' as never);
    } else {
      // For both cafe and home_cafe modes, go to sensory evaluation
      navigation.navigate('Sensory' as never);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '향미 선택',
      headerRight: () => (
        <Button
          unstyled
          onPress={handleSkip}
          pressStyle={{ opacity: 0.7 }}
        >
          <Text fontSize="$3" color="$cupBlue">건너뛰기</Text>
        </Button>
      ),
    });
  }, [navigation, handleSkip]);

  // Calculate progress based on mode
  const progressValue = currentTasting.mode === 'lab' ? 25 : 43;


  return (
    <Container>

      {/* Progress Bar */}
      <Progress 
        value={progressValue} 
        backgroundColor="$gray4"
        height={3}
      >
        <Progress.Indicator 
          backgroundColor="$cupBlue" 
          animation="lazy"
        />
      </Progress>

      {/* Guide Message */}
      <YStack 
        paddingVertical="$md" 
        paddingHorizontal="$lg"
        animation="lazy"
        enterStyle={{ opacity: 0, y: -10 }}
      >
        <H3 fontSize="$5" fontWeight="600" color="$color">
          향과 맛을 선택해보세요
        </H3>
        <Paragraph fontSize="$3" color="$gray11">
          커피에서 느껴지는 향미를 골라주세요 (최대 5개)
        </Paragraph>
      </YStack>


      {/* Sticky Header - Selected Flavors */}
      <SelectedFlavorsHeader
        selectedPaths={selectedPaths}
        onRemoveFlavor={handleRemoveFlavor}
        onToggleAllCategories={toggleAllCategories}
        expandedCategoriesCount={expandedCategories.length}
        totalCategoriesCount={flavorData.length}
      />

      {/* Content */}
      <ScrollView 
        flex={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <YStack>
          {flavorData.map((item, index) => (
            <YStack
              key={`category-${item.category}-${index}`}
            >
              <CategoryAccordion
                category={item.category}
                expanded={expandedCategories.includes(item.category)}
                onToggle={() => {
                  toggleCategory(item.category);
                }}
                onSelectFlavor={handleSelectFlavor}
                onSelectSubcategory={handleSelectSubcategory}
                selectedPaths={selectedPaths}
                expandedSubCategories={expandedSubCategories}
                onToggleSubcategory={toggleSubcategory}
              />
            </YStack>
          ))}
        </YStack>
      </ScrollView>

      {/* Bottom Button */}
      {/* Floating Bottom Button */}
      <FloatingButton
        title={selectedPaths.length > 0 ? `${selectedPaths.length}개 선택 완료` : '향미를 선택해주세요'}
        isValid={selectedPaths.length > 0}
        onPress={handleNext}
      />
    </Container>
  );
}