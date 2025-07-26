// StatsScreenStyledComponents.tsx
// Styled components for StatsScreen - extracted for modularity

import { styled } from 'tamagui';
import {
  View,
  Text,
  ScrollView,
  YStack,
  XStack,
  Card,
  H1,
  H3,
} from 'tamagui';

// Container Components
export const Container = styled(View, {
  name: 'StatsContainer',
  flex: 1,
  backgroundColor: '$background',
});

export const NavigationBar = styled(XStack, {
  name: 'StatsNavigationBar',
  height: 44,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  backgroundColor: '$background',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
});

export const TitleContainer = styled(XStack, {
  name: 'StatsTitleContainer',
  alignItems: 'center',
  gap: '$sm',
});

export const NavigationTitle = styled(Text, {
  name: 'StatsNavigationTitle',
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
});

export const BetaBadge = styled(View, {
  name: 'StatsBetaBadge',
  backgroundColor: '$cupBlue',
  borderRadius: '$2',
  paddingHorizontal: '$xs',
  paddingVertical: '$xxs',
});

export const BetaText = styled(Text, {
  name: 'StatsBetaText',
  fontSize: '$1',
  fontWeight: '600',
  color: 'white',
});

// Content Components
export const ContentScrollView = styled(ScrollView, {
  name: 'StatsContentScrollView',
  flex: 1,
  showsVerticalScrollIndicator: false,
});

export const LoadingContainer = styled(YStack, {
  name: 'StatsLoadingContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$md',
});

export const LoadingText = styled(Text, {
  name: 'StatsLoadingText',
  fontSize: '$4',
  color: '$gray10',
});

export const EmptyContainer = styled(YStack, {
  name: 'StatsEmptyContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: '$xl',
  paddingVertical: '$xxl',
  gap: '$md',
});

export const EmptyText = styled(Text, {
  name: 'StatsEmptyText',
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
  textAlign: 'center',
});

export const EmptySubtext = styled(Text, {
  name: 'StatsEmptySubtext',
  fontSize: '$4',
  color: '$gray10',
  textAlign: 'center',
});

// Header Components
export const HeaderSection = styled(YStack, {
  name: 'StatsHeaderSection',
  paddingHorizontal: '$lg',
  paddingVertical: '$lg',
  alignItems: 'center',
});

export const HeaderTitle = styled(H1, {
  name: 'StatsHeaderTitle',
  fontSize: '$8',
  fontWeight: '700',
  color: '$color',
  textAlign: 'center',
});

export const HeaderSubtitle = styled(Text, {
  name: 'StatsHeaderSubtitle',
  fontSize: '$4',
  color: '$gray10',
  textAlign: 'center',
});

// Section Components
export const Section = styled(YStack, {
  name: 'StatsSection',
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
});

export const SectionTitle = styled(H3, {
  name: 'StatsSectionTitle',
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
  marginBottom: '$md',
});

// Stats Grid Components
export const StatsGrid = styled(XStack, {
  name: 'StatsStatsGrid',
  gap: '$sm',
  flexWrap: 'wrap',
});

export const StatCard = styled(Card, {
  name: 'StatsStatCard',
  flex: 1,
  minWidth: '45%',
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderWidth: 0.5,
  borderRadius: '$4',
  padding: '$lg',
  alignItems: 'center',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
});

export const StatNumber = styled(Text, {
  name: 'StatsStatNumber',
  fontSize: '$7',
  fontWeight: '700',
  color: '$cupBlue',
  marginBottom: '$xs',
});

export const StatLabel = styled(Text, {
  name: 'StatsStatLabel',
  fontSize: '$3',
  color: '$gray10',
  textAlign: 'center',
});

// Mode Statistics Components
export const ModeStatsContainer = styled(XStack, {
  name: 'StatsModeStatsContainer',
  gap: '$sm',
});

export const ModeStatCard = styled(Card, {
  name: 'StatsModeStatCard',
  flex: 1,
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderWidth: 0.5,
  borderRadius: '$4',
  padding: '$md',
  alignItems: 'center',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
});

export const ModeIcon = styled(Text, {
  name: 'StatsModeIcon',
  fontSize: 24,
  marginBottom: '$xs',
});

export const ModeNumber = styled(Text, {
  name: 'StatsModeNumber',
  fontSize: '$6',
  fontWeight: '700',
  color: '$cupBlue',
  marginBottom: '$xs',
});

export const ModeLabel = styled(Text, {
  name: 'StatsModeLabel',
  fontSize: '$3',
  color: '$gray10',
  textAlign: 'center',
});

export const ModePercentageContainer = styled(YStack, {
  name: 'StatsModePercentageContainer',
  marginTop: '$md',
  gap: '$sm',
});

export const ModePercentageBar = styled(XStack, {
  name: 'StatsModePercentageBar',
  height: 6,
  backgroundColor: '$gray4',
  borderRadius: '$1',
  overflow: 'hidden',
});

export const ModePercentageFill = styled(View, {
  name: 'StatsModePercentageFill',
  height: '100%',
  variants: {
    type: {
      cafe: {
        backgroundColor: '$cupBlue',
    },
      homecafe: {
        backgroundColor: '$orange10',
    },
  },
} as const,
});

export const ModePercentageText = styled(Text, {
  name: 'StatsModePercentageText',
  fontSize: '$2',
  color: '$gray9',
  textAlign: 'center',
});

// Top Items Components
export const TopItemsContainer = styled(YStack, {
  name: 'StatsTopItemsContainer',
  gap: '$sm',
});

export const TopItemCard = styled(Card, {
  name: 'StatsTopItemCard',
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderWidth: 0.5,
  borderRadius: '$3',
  padding: '$md',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
});

export const TopItemHeader = styled(XStack, {
  name: 'StatsTopItemHeader',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '$xs',
});

export const TopItemName = styled(Text, {
  name: 'StatsTopItemName',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
  flex: 1,
});

export const TopItemCount = styled(Text, {
  name: 'StatsTopItemCount',
  fontSize: '$3',
  fontWeight: '500',
  color: '$cupBlue',
});

export const TopItemSubtext = styled(Text, {
  name: 'StatsTopItemSubtext',
  fontSize: '$3',
  color: '$gray10',
});

// Insight Components
export const InsightPreviewText = styled(Text, {
  name: 'StatsInsightPreviewText',
  fontSize: '$3',
  color: '$gray9',
  fontStyle: 'italic',
  marginBottom: '$md',
  textAlign: 'center',
});