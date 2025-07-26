import {
  View,
  Text,
  Input,
  Button,
  YStack,
  XStack,
  Card,
  H2,
  H3,
  ScrollView,
  Sheet,
  styled,
} from 'tamagui';

// Main Container Styles
export const Container = styled(View, {
  name: 'SearchContainer',
  flex: 1,
  backgroundColor: '$background',
});

export const HeaderSection = styled(YStack, {
  name: 'HeaderSection',
  padding: '$lg',
  paddingTop: '$sm',
  backgroundColor: '$background',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
});

export const HeaderTitle = styled(H2, {
  name: 'HeaderTitle',
  fontSize: '$6',
  fontWeight: '700',
  color: '$color',
  marginBottom: '$md',
});

// Search Bar Styles
export const SearchContainer = styled(XStack, {
  name: 'SearchContainer',
  alignItems: 'center',
  gap: '$sm',
  marginBottom: '$md',
});

export const SearchBar = styled(XStack, {
  name: 'SearchBar',
  flex: 1,
  alignItems: 'center',
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$md',
  paddingHorizontal: '$md',
  paddingVertical: '$sm',
  minHeight: 44,
  
  variants: {
    focused: {
      true: {
        borderColor: '$blue9',
        shadowColor: '$blue9',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
  },
} as const,
});

export const SearchIcon = styled(Text, {
  name: 'SearchIcon',
  fontSize: '$4',
  color: '$color10',
  marginRight: '$sm',
});

export const SearchInput = styled(Input, {
  name: 'SearchInput',
  flex: 1,
  fontSize: '$4',
  color: '$color',
  backgroundColor: 'transparent',
  borderWidth: 0,
  padding: 0,
});

export const ClearButton = styled(Button, {
  name: 'ClearButton',
  size: '$sm',
  borderRadius: '$sm',
  backgroundColor: '$gray4',
  borderColor: '$gray6',
  paddingHorizontal: '$sm',
  paddingVertical: 4,
  minHeight: 24,
});

export const ClearIcon = styled(Text, {
  name: 'ClearIcon',
  fontSize: '$3',
  color: '$gray11',
});

// Filter Button Styles
export const FilterButton = styled(Button, {
  name: 'FilterButton',
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderWidth: 1,
  borderRadius: '$md',
  paddingHorizontal: '$md',
  paddingVertical: '$sm',
  minHeight: 44,
  
  variants: {
    hasFilters: {
      true: {
        backgroundColor: '$blue4',
        borderColor: '$blue9',
    },
  },
} as const,
});

export const FilterIcon = styled(Text, {
  name: 'FilterIcon',
  fontSize: '$4',
  marginRight: '$sm',
});

export const FilterBadge = styled(View, {
  name: 'FilterBadge',
  backgroundColor: '$blue9',
  borderRadius: '$sm',
  paddingHorizontal: '$sm',
  paddingVertical: 2,
  marginLeft: '$sm',
  minWidth: 20,
  alignItems: 'center',
  justifyContent: 'center',
});

export const FilterBadgeText = styled(Text, {
  name: 'FilterBadgeText',
  fontSize: '$2',
  color: '$white',
  fontWeight: '600',
});

// Clear Filters Styles
export const ClearFiltersContainer = styled(XStack, {
  name: 'ClearFiltersContainer',
  justifyContent: 'center',
  marginBottom: '$md',
});

export const ClearFiltersButton = styled(Button, {
  name: 'ClearFiltersButton',
  backgroundColor: '$gray4',
  borderColor: '$gray6',
  borderRadius: '$sm',
  size: '$sm',
});

export const ClearFiltersText = styled(Text, {
  name: 'ClearFiltersText',
  fontSize: '$3',
  color: '$gray11',
  fontWeight: '600',
});

// Loading Styles
export const LoadingContainer = styled(YStack, {
  name: 'LoadingContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$md',
});

export const LoadingText = styled(Text, {
  name: 'LoadingText',
  fontSize: '$4',
  color: '$color10',
});

// Tasting Card Styles
export const TastingCard = styled(Card, {
  name: 'TastingCard',
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderWidth: 1,
  borderRadius: '$md',
  padding: '$lg',
  marginHorizontal: '$lg',
  marginBottom: '$md',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
  
  pressStyle: {
    backgroundColor: '$backgroundHover',
    scale: 0.98,
},
  
  hoverStyle: {
    backgroundColor: '$backgroundHover',
},
});

export const CardHeader = styled(XStack, {
  name: 'CardHeader',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '$sm',
});

export const CardInfo = styled(YStack, {
  name: 'CardInfo',
  flex: 1,
  marginRight: '$md',
});

export const CoffeeName = styled(Text, {
  name: 'CoffeeName',
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
  marginBottom: 2,
});

export const RoasteryName = styled(Text, {
  name: 'RoasteryName',
  fontSize: '$3',
  color: '$color10',
});

export const ScoreText = styled(Text, {
  name: 'ScoreText',
  fontSize: '$4',
  fontWeight: '700',
  color: '$blue11',
});

export const CardDetails = styled(XStack, {
  name: 'CardDetails',
  flexWrap: 'wrap',
  gap: '$md',
  marginBottom: '$sm',
});

export const DetailItem = styled(Text, {
  name: 'DetailItem',
  fontSize: '$3',
  color: '$color10',
});

// Flavor Chip Styles
export const FlavorContainer = styled(XStack, {
  name: 'FlavorContainer',
  flexWrap: 'wrap',
  gap: '$sm',
  alignItems: 'center',
});

export const FlavorChip = styled(View, {
  name: 'FlavorChip',
  backgroundColor: '$blue4',
  borderRadius: '$sm',
  paddingHorizontal: '$sm',
  paddingVertical: 2,
});

export const FlavorText = styled(Text, {
  name: 'FlavorText',
  fontSize: '$2',
  color: '$blue11',
  fontWeight: '600',
});

export const FlavorCount = styled(Text, {
  name: 'FlavorCount',
  fontSize: '$3',
  color: '$color10',
  fontStyle: 'italic',
});

// Empty State Styles
export const EmptyContainer = styled(YStack, {
  name: 'EmptyContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$xl',
});

export const EmptyIcon = styled(Text, {
  name: 'EmptyIcon',
  fontSize: 64,
  marginBottom: '$lg',
});

export const EmptyText = styled(Text, {
  name: 'EmptyText',
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
  textAlign: 'center',
  marginBottom: '$md',
});

export const EmptySubtext = styled(Text, {
  name: 'EmptySubtext',
  fontSize: '$4',
  color: '$color10',
  textAlign: 'center',
  lineHeight: 22,
});

// Filter Sheet Styles
export const FilterSheetOverlay = styled(Sheet.Overlay, {
  name: 'FilterSheetOverlay',
  animation: 'lazy',
  enterStyle: { opacity: 0 },
  exitStyle: { opacity: 0 },
});

export const FilterSheetFrame = styled(Sheet.Frame, {
  name: 'FilterSheetFrame',
  backgroundColor: '$background',
  borderTopLeftRadius: '$lg',
  borderTopRightRadius: '$lg',
});

export const FilterHeader = styled(XStack, {
  name: 'FilterHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '$lg',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
});

export const FilterTitle = styled(H3, {
  name: 'FilterTitle',
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
});

export const FilterCloseButton = styled(Button, {
  name: 'FilterCloseButton',
  backgroundColor: '$gray4',
  borderColor: '$gray6',
  borderRadius: '$sm',
  size: '$sm',
  padding: '$sm',
});

export const FilterCloseIcon = styled(Text, {
  name: 'FilterCloseIcon',
  fontSize: '$4',
  color: '$gray11',
});

export const FilterContent = styled(ScrollView, {
  name: 'FilterContent',
  maxHeight: '70%',
});

export const FilterSection = styled(YStack, {
  name: 'FilterSection',
  padding: '$lg',
});

export const FilterSectionTitle = styled(Text, {
  name: 'FilterSectionTitle',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
  marginBottom: '$md',
});

export const FilterChipContainer = styled(XStack, {
  name: 'FilterChipContainer',
  flexWrap: 'wrap',
  gap: '$sm',
});

export const FilterChip = styled(Button, {
  name: 'FilterChip',
  size: '$sm',
  borderRadius: '$sm',
  backgroundColor: '$gray4',
  borderColor: '$gray6',
  paddingHorizontal: '$md',
  paddingVertical: '$sm',
  
  variants: {
    selected: {
      true: {
        backgroundColor: '$blue9',
        borderColor: '$blue9',
    },
  },
} as const,
});

export const FilterChipText = styled(Text, {
  name: 'FilterChipText',
  fontSize: '$3',
  fontWeight: '600',
  
  variants: {
    selected: {
      true: { color: '$white' },
      false: { color: '$gray11' },
  },
} as const,
});

// Score Range Styles
export const ScoreRangeContainer = styled(XStack, {
  name: 'ScoreRangeContainer',
  alignItems: 'center',
  gap: '$md',
});

export const ScoreInput = styled(Input, {
  name: 'ScoreInput',
  flex: 1,
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderRadius: '$sm',
  textAlign: 'center',
  fontSize: '$4',
});

export const ScoreSeparator = styled(Text, {
  name: 'ScoreSeparator',
  fontSize: '$4',
  color: '$color10',
});

// Filter Actions Styles
export const FilterActions = styled(XStack, {
  name: 'FilterActions',
  gap: '$md',
  padding: '$lg',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
});

export const FilterResetButton = styled(Button, {
  name: 'FilterResetButton',
  flex: 1,
  backgroundColor: '$gray4',
  borderColor: '$gray6',
  borderRadius: '$md',
  paddingVertical: '$md',
});

export const FilterResetText = styled(Text, {
  name: 'FilterResetText',
  fontSize: '$4',
  fontWeight: '600',
  color: '$gray11',
});

export const FilterApplyButton = styled(Button, {
  name: 'FilterApplyButton',
  flex: 1,
  backgroundColor: '$blue9',
  borderColor: '$blue9',
  borderRadius: '$md',
  paddingVertical: '$md',
});

export const FilterApplyText = styled(Text, {
  name: 'FilterApplyText',
  fontSize: '$4',
  fontWeight: '600',
  color: '$white',
});