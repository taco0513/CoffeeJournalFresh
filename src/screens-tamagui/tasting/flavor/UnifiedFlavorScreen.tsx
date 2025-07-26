import React, { useLayoutEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IOSLayout, IOSSpacing } from '../../../styles/ios-hig-2024';
import {
  YStack,
  XStack,
  Text,
  ScrollView,
  Button,
  Input,
  Card,
  Progress,
  AnimatePresence,
  styled,
  useTheme,
  H2,
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


const SearchContainer = styled(YStack, {
  name: 'SearchContainer',
  paddingHorizontal: '$lg',
  paddingVertical: '$sm',
  backgroundColor: '$backgroundHover',
});

const SearchBar = styled(XStack, {
  name: 'SearchBar',
  backgroundColor: '$background',
  borderRadius: '$4',
  paddingHorizontal: '$md',
  paddingVertical: '$sm',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '$borderColor',
});

const NextButton = styled(Button, {
  name: 'NextButton',
  backgroundColor: '$cupBlue',
  borderRadius: '$3',
  paddingVertical: '$md',
  animation: 'quick',
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$cupBlueDark',
},
  disabledStyle: {
    backgroundColor: '$gray5',
    opacity: 0.6,
},
});

const NoResultsContainer = styled(YStack, {
  name: 'NoResultsContainer',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: '$xxl',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    y: 20,
},
});

export default function UnifiedFlavorScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { currentTasting, updateField } = useTastingStore();
  const selectedPaths = currentTasting.selectedFlavors || [];

  const {
    searchQuery,
    setSearchQuery,
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
      navigation.navigate('SensoryEvaluation' as never);
  }
};

  const handleSkip = () => {
    // Navigate based on mode
    if (currentTasting.mode === 'lab') {
      navigation.navigate('ExperimentalData' as never);
    } else {
      // For both cafe and home_cafe modes, go to sensory evaluation
      navigation.navigate('SensoryEvaluation' as never);
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

  // Check if any categories have matching items when searching
  const hasResults = !searchQuery || flavorData.some(item => {
    const categoryData = flavorData.find(d => d.category === item.category);
    if (!categoryData) return false;
    
    return categoryData.subcategories.some(sub =>
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.koreanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.flavors.some(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.koreanName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
});

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

      {/* Search Bar */}
      <SearchContainer>
        <SearchBar>
          <Text fontSize="$4" marginRight="$sm">검색</Text>
          <Input
            flex={1}
            unstyled
            placeholder="향미 검색..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="$gray10"
            fontSize="$3"
            color="$color"
          />
          <AnimatePresence>
            {searchQuery !== '' && (
              <Button
                unstyled
                onPress={() => setSearchQuery('')}
                animation="quick"
                enterStyle={{ opacity: 0, scale: 0.8 }}
                exitStyle={{ opacity: 0, scale: 0.8 }}
                pressStyle={{ scale: 0.9 }}
              >
                <Text fontSize="$4" color="$gray11">X</Text>
              </Button>
            )}
          </AnimatePresence>
        </SearchBar>
      </SearchContainer>

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
        contentContainerStyle={{ paddingBottom: 120 }} // Extra padding to clear floating button
      >
        <AnimatePresence>
          {!hasResults ? (
            <NoResultsContainer key="no-results">
              <Text fontSize={48} marginBottom="$md"></Text>
              <H3 fontSize="$5" fontWeight="600" color="$color" marginBottom="$sm">
                "{searchQuery}" 검색 결과가 없습니다
              </H3>
              <Paragraph fontSize="$3" color="$gray11">
                다른 키워드로 검색해보세요
              </Paragraph>
            </NoResultsContainer>
          ) : (
            <YStack>
              {flavorData.map((item, index) => {
                // Check if category has search results
                const hasSearchResults = !searchQuery || item.subcategories.some(sub =>
                  sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  sub.koreanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  sub.flavors.some(f =>
                    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    f.koreanName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                );

                if (!hasSearchResults) return null;

                return (
                  <YStack
                    key={`category-${item.category}-${index}`}
                    animation="lazy"
                    enterStyle={{
                      opacity: 0,
                      y: 20,
                  }}
                    style={{
                      animationDelay: `${index * 50}ms`,
                  }}
                  >
                    <CategoryAccordion
                      category={item.category}
                      expanded={searchQuery ? true : expandedCategories.includes(item.category)}
                      onToggle={() => {
                        if (!searchQuery) {
                          toggleCategory(item.category);
                      }
                    }}
                      onSelectFlavor={handleSelectFlavor}
                      onSelectSubcategory={handleSelectSubcategory}
                      selectedPaths={selectedPaths}
                      searchQuery={searchQuery}
                      expandedSubCategories={expandedSubCategories}
                      onToggleSubcategory={toggleSubcategory}
                    />
                  </YStack>
                );
            }).filter(Boolean)}
            </YStack>
          )}
        </AnimatePresence>
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