import React, { memo, useMemo, useCallback } from 'react';
import { SafeAreaView, Platform, UIManager } from 'react-native';
import {
  View,
  Text,
  ScrollView,
  Button,
  Input,
  YStack,
  XStack,
  Card,
  H1,
  H2,
  styled,
  useTheme,
  AnimatePresence,
  GetProps,
} from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import { useFlavorScreenData } from '../../stores/selectors';
import { usePerformanceOptimized } from '../../hooks/usePerformanceOptimized';
import { withPerformanceMonitoring } from '../../components/common/PerformanceOptimizedWrapper';
import { flavorDataOptimizer } from '../../services/FlavorDataOptimizer';
import { CategoryAccordion } from '../../components/flavor/CategoryAccordion';
import { SelectedFlavorsHeader } from '../../components/flavor/SelectedFlavorsHeader';
import { trackPerformance } from '../../utils/performanceAnalysis';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Styled Components
const Container = styled(View, {
  name: 'OptimizedFlavorContainer',
  flex: 1,
  backgroundColor: '$background',
});

const Header = styled(XStack, {
  name: 'OptimizedFlavorHeader',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
});

const HeaderTitle = styled(H1, {
  name: 'HeaderTitle',
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
});

const SearchContainer = styled(XStack, {
  name: 'SearchContainer',
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
  backgroundColor: '$background',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
});

const SearchInput = styled(Input, {
  name: 'SearchInput',
  flex: 1,
  backgroundColor: '$gray2',
  borderColor: '$borderColor',
  borderRadius: '$3',
  paddingHorizontal: '$md',
  fontSize: '$4',
  color: '$color',
  animation: 'quick',
  focusStyle: {
    borderColor: '$cupBlue',
    backgroundColor: '$background',
  },
});

const ContentContainer = styled(YStack, {
  name: 'ContentContainer',
  flex: 1,
});

const SelectedFlavorsContainer = styled(Card, {
  name: 'SelectedFlavorsContainer',
  margin: '$lg',
  padding: '$md',
  backgroundColor: '$cupBlueLight',
  borderColor: '$cupBlue',
  borderWidth: 1,
  borderRadius: '$4',
  animation: 'lazy',
  variants: {
    hasSelected: {
      true: {
        opacity: 1,
        scale: 1,
      },
      false: {
        opacity: 0.5,
        scale: 0.95,
      },
    },
  } as const,
});

const FlavorScrollView = styled(ScrollView, {
  name: 'FlavorScrollView',
  flex: 1,
  paddingHorizontal: '$lg',
});

const SearchResultsContainer = styled(YStack, {
  name: 'SearchResultsContainer',
  backgroundColor: '$background',
  borderRadius: '$3',
  marginVertical: '$sm',
  padding: '$md',
  gap: '$sm',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    y: -10,
  },
});

const SearchResultItem = styled(Button, {
  name: 'SearchResultItem',
  backgroundColor: '$gray2',
  borderColor: '$borderColor',
  borderWidth: 0.5,
  borderRadius: '$2',
  paddingHorizontal: '$md',
  paddingVertical: '$sm',
  justifyContent: 'flex-start',
  pressStyle: {
    backgroundColor: '$cupBlueLight',
    scale: 0.98,
  },
  animation: 'quick',
});

const SearchResultText = styled(Text, {
  name: 'SearchResultText',
  fontSize: '$3',
  color: '$color',
});

const NavigationContainer = styled(XStack, {
  name: 'NavigationContainer',
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
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
});

const BackButton = styled(Button, {
  name: 'BackButton',
  backgroundColor: '$gray4',
  borderColor: '$borderColor',
  borderWidth: 0.5,
  borderRadius: '$3',
  paddingHorizontal: '$lg',
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$gray5',
  },
});

const NextButton = styled(Button, {
  name: 'NextButton',
  flex: 1,
  backgroundColor: '$cupBlue',
  color: 'white',
  borderRadius: '$3',
  fontWeight: '600',
  variants: {
    disabled: {
      true: {
        backgroundColor: '$gray6',
        color: '$gray10',
      },
    },
  } as const,
  pressStyle: {
    backgroundColor: '$cupBlueDark',
    scale: 0.98,
  },
  animation: 'bouncy',
});

const ProgressIndicator = styled(XStack, {
  name: 'ProgressIndicator',
  alignItems: 'center',
  gap: '$sm',
  paddingHorizontal: '$lg',
  paddingVertical: '$sm',
});

const ProgressBar = styled(View, {
  name: 'ProgressBar',
  flex: 1,
  height: 4,
  backgroundColor: '$gray4',
  borderRadius: 2,
});

const ProgressFill = styled(View, {
  name: 'ProgressFill',
  height: '100%',
  backgroundColor: '$cupBlue',
  borderRadius: 2,
  animation: 'lazy',
});

const ProgressText = styled(Text, {
  name: 'ProgressText',
  fontSize: '$3',
  fontWeight: '600',
  color: '$cupBlue',
});

// Memoized search input component
const MemoizedSearchInput = memo<{
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}>(({ value, onChangeText, placeholder }) => (
  <SearchInput
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor="$gray10"
  />
));

MemoizedSearchInput.displayName = 'MemoizedSearchInput';

// Memoized navigation buttons
const NavigationButtons = memo<{
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  selectedCount: number;
}>(({ onBack, onNext, canGoBack, selectedCount }) => (
  <NavigationContainer>
    {canGoBack && (
      <BackButton onPress={onBack} unstyled>
        <Text fontSize="$4" color="$color">← 뒤로</Text>
      </BackButton>
    )}
    
    <NextButton 
      disabled={selectedCount === 0}
      onPress={onNext}
    >
      다음 →
    </NextButton>
  </NavigationContainer>
));

NavigationButtons.displayName = 'NavigationButtons';

export type OptimizedUnifiedFlavorScreenProps = GetProps<typeof Container>;

function OptimizedUnifiedFlavorScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { mode, selectedFlavors, setSelectedFlavors, updateField } = useFlavorScreenData();
  const { debouncedCallback, memoizedComputation } = usePerformanceOptimized();

  // Optimized search state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());
  const [expandedSubCategories, setExpandedSubCategories] = React.useState<Set<string>>(new Set());

  // Memoized flavor data with performance tracking
  const flavorData = memoizedComputation(
    () => flavorDataOptimizer.getTransformedFlavorData(),
    [],
    'flavor_data_load'
  );

  // Memoized search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return flavorDataOptimizer.searchFlavors(searchQuery, 20);
  }, [searchQuery]);

  // Optimized search handler with debouncing
  const handleSearchChange = debouncedCallback(
    (text: string) => {
      setSearchQuery(text);
      
      // Auto-expand categories for search results
      if (text.trim()) {
        const matchingCategories = new Set<string>();
        searchResults.forEach(result => {
          if (result.category) {
            matchingCategories.add(result.category);
          }
        });
        setExpandedCategories(matchingCategories);
      }
    },
    300,
    'search_debounce'
  );

  // Optimized flavor selection with performance tracking
  const handleFlavorSelect = useCallback((flavorPath: any) => {
    // Track performance start directly
    
    const newSelectedFlavors = [...selectedFlavors];
    const existingIndex = newSelectedFlavors.findIndex(
      f => f.level1 === flavorPath.level1 && 
           f.level2 === flavorPath.level2 && 
           f.level3 === flavorPath.level3
    );

    if (existingIndex >= 0) {
      newSelectedFlavors.splice(existingIndex, 1);
    } else {
      if (newSelectedFlavors.length < 5) {
        newSelectedFlavors.push(flavorPath);
      }
    }

    setSelectedFlavors(newSelectedFlavors);
    updateField('selectedFlavors', newSelectedFlavors);
    
    // Track performance end
  }, [selectedFlavors, setSelectedFlavors, updateField]);

  // Optimized category expansion
  const handleCategoryExpansion = useCallback((categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  }, []);

  const handleNext = useCallback(() => {
    // Track navigation performance
    navigation.navigate('Sensory' as never);
  }, [navigation]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const canGoBack = navigation.canGoBack();
  const selectedCount = selectedFlavors.length;
  const progressPercentage = (selectedCount / 5) * 100;

  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <Header>
          <HeaderTitle>향미 선택</HeaderTitle>
          <Text fontSize="$4" color="$gray11">
            {selectedCount}/5
          </Text>
        </Header>

        {/* Progress Indicator */}
        <ProgressIndicator>
          <ProgressBar>
            <ProgressFill 
              width={`${progressPercentage}%`}
              animation="lazy"
              animateOnly={['width']}
            />
          </ProgressBar>
          <ProgressText>{selectedCount}/5</ProgressText>
        </ProgressIndicator>

        {/* Search Container */}
        <SearchContainer>
          <MemoizedSearchInput
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder="향미를 검색하세요..."
          />
        </SearchContainer>

        {/* Content */}
        <ContentContainer>
          {/* Selected Flavors */}
          <SelectedFlavorsContainer hasSelected={selectedCount > 0}>
            <SelectedFlavorsHeader 
              selectedFlavors={selectedFlavors}
              onRemoveFlavor={handleFlavorSelect}
              maxSelections={5}
            />
          </SelectedFlavorsContainer>

          {/* Flavor Content */}
          <FlavorScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <AnimatePresence>
              {/* Search Results */}
              {searchQuery.trim() && searchResults.length > 0 && (
                <SearchResultsContainer
                  animation="lazy"
                  animateOnly={['opacity', 'transform']}
                >
                  <Text fontSize="$4" fontWeight="600" color="$color" marginBottom="$sm">
                    검색 결과 ({searchResults.length}개)
                  </Text>
                  {searchResults.slice(0, 10).map((result, index) => (
                    <SearchResultItem
                      key={`search-${index}`}
                      onPress={() => handleFlavorSelect(result)}
                      unstyled
                    >
                      <SearchResultText>
                        {result.level1} → {result.level2} → {result.level3}
                      </SearchResultText>
                    </SearchResultItem>
                  ))}
                </SearchResultsContainer>
              )}

              {/* Category Accordion */}
              {!searchQuery.trim() && flavorData.map((category, categoryIndex) => (
                <View
                  key={category.name}
                  animation="lazy"
                  enterStyle={{
                    opacity: 0,
                    y: 30 + (categoryIndex * 10),
                  }}
                  animateOnly={['opacity', 'transform']}
                >
                  <CategoryAccordion
                    category={category}
                    isExpanded={expandedCategories.has(category.name)}
                    onToggleExpansion={() => handleCategoryExpansion(category.name)}
                    selectedFlavors={selectedFlavors}
                    onFlavorSelect={handleFlavorSelect}
                    searchQuery=""
                    expandedSubCategories={expandedSubCategories}
                    onSubCategoryToggle={(subCategoryKey) => {
                      setExpandedSubCategories(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(subCategoryKey)) {
                          newSet.delete(subCategoryKey);
                        } else {
                          newSet.add(subCategoryKey);
                        }
                        return newSet;
                      });
                    }}
                  />
                </View>
              ))}
            </AnimatePresence>
          </FlavorScrollView>
        </ContentContainer>

        {/* Navigation Buttons */}
        <NavigationButtons
          onBack={handleBack}
          onNext={handleNext}
          canGoBack={canGoBack}
          selectedCount={selectedCount}
        />
      </SafeAreaView>
    </Container>
  );
}

// Export with performance monitoring HOC
export default withPerformanceMonitoring(
  memo(OptimizedUnifiedFlavorScreen),
  'OptimizedUnifiedFlavorScreen'
);