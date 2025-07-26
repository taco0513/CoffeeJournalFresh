// TastingDetailStyledComponents.tsx
// Styled components for TastingDetailScreen - extracted for modularity

import { styled } from 'tamagui';
import {
  View,
  Text,
  YStack,
  XStack,
  Card,
  Button,
  H2,
  SizableText,
} from 'tamagui';

// Container Components
export const Container = styled(View, {
  name: 'TastingDetailContainer',
  flex: 1,
  backgroundColor: '$backgroundHover',
});

export const NavigationBar = styled(XStack, {
  name: 'TastingDetailNavigation',
  height: 44,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  backgroundColor: '$background',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
});

// Loading and Error States
export const LoadingContainer = styled(YStack, {
  name: 'TastingDetailLoading',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$md',
});

export const ErrorContainer = styled(YStack, {
  name: 'TastingDetailError',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: '$xl',
  gap: '$md',
});

// Content Components
export const InfoCard = styled(Card, {
  name: 'TastingDetailInfoCard',
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderWidth: 0.5,
  borderRadius: '$4',
  padding: '$lg',
  marginHorizontal: '$lg',
  marginVertical: '$md',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  variants: {
    highlighted: {
      true: {
        borderColor: '$cupBlue',
        shadowOpacity: 0.2,
    },
  },
} as const,
});

export const SectionTitle = styled(H2, {
  name: 'TastingDetailSectionTitle',
  fontSize: '$6',
  fontWeight: '700',
  color: '$color',
  marginBottom: '$md',
});

export const InfoRow = styled(XStack, {
  name: 'TastingDetailInfoRow',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: '$xs',
});

export const InfoLabel = styled(SizableText, {
  name: 'TastingDetailInfoLabel',
  fontSize: '$4',
  fontWeight: '500',
  color: '$gray11',
  flex: 1,
});

export const InfoValue = styled(SizableText, {
  name: 'TastingDetailInfoValue',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
  textAlign: 'right',
  flex: 2,
});

// Score Components
export const ScoreCard = styled(Card, {
  name: 'TastingDetailScoreCard',
  backgroundColor: '$cupBlue',
  borderRadius: '$4',
  padding: '$lg',
  marginHorizontal: '$lg',
  marginVertical: '$md',
  alignItems: 'center',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
});

export const ScoreValue = styled(SizableText, {
  name: 'TastingDetailScoreValue',
  fontSize: '$8',
  fontWeight: '800',
  color: 'white',
  textAlign: 'center',
});

// Flavor Components
export const FlavorChip = styled(XStack, {
  name: 'TastingDetailFlavorChip',
  backgroundColor: '$background',
  borderColor: '$cupBlue',
  borderWidth: 1,
  borderRadius: '$3',
  paddingHorizontal: '$sm',
  paddingVertical: '$xs',
  alignItems: 'center',
  margin: '$xs',
  variants: {
    level: {
      1: {
        backgroundColor: '$cupBlue',
    },
      2: {
        backgroundColor: '$cupBlueLight',
    },
      3: {
        backgroundColor: '$gray3',
    },
  },
} as const,
});

export const ChipText = styled(Text, {
  name: 'TastingDetailChipText',
  fontSize: '$3',
  fontWeight: '500',
  variants: {
    level: {
      1: {
        color: 'white',
    },
      2: {
        color: '$cupBlueDark',
    },
      3: {
        color: '$gray11',
    },
  },
} as const,
});

// Action Components
export const DeleteButton = styled(Button, {
  name: 'TastingDetailDeleteButton',
  backgroundColor: '$red9',
  color: 'white',
  borderRadius: '$3',
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
  pressStyle: {
    backgroundColor: '$red10',
    scale: 0.95,
},
});

export const ActionButton = styled(Button, {
  name: 'TastingDetailActionButton',
  backgroundColor: '$cupBlue',
  color: 'white',
  borderRadius: '$3',
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
  pressStyle: {
    backgroundColor: '$cupBlueDark',
    scale: 0.95,
},
});

// Section Components
export const SectionContainer = styled(YStack, {
  name: 'TastingDetailSectionContainer',
  gap: '$sm',
});

export const FlavorContainer = styled(XStack, {
  name: 'TastingDetailFlavorContainer',
  flexWrap: 'wrap',
  gap: '$xs',
  padding: '$sm',
});

export const CommentContainer = styled(YStack, {
  name: 'TastingDetailCommentContainer',
  gap: '$md',
});

export const CommentText = styled(Text, {
  name: 'TastingDetailCommentText',
  fontSize: '$4',
  lineHeight: '$4',
  color: '$color',
  textAlign: 'left',
});

export const TimestampText = styled(Text, {
  name: 'TastingDetailTimestampText',
  fontSize: '$3',
  color: '$gray10',
  textAlign: 'right',
  marginTop: '$sm',
});

// Expansion Components
export const ExpandButton = styled(Button, {
  name: 'TastingDetailExpandButton',
  backgroundColor: 'transparent',
  borderWidth: 0,
  paddingHorizontal: '$sm',
  paddingVertical: '$xs',
  alignSelf: 'flex-start',
  pressStyle: {
    opacity: 0.7,
    scale: 0.95,
},
});

export const ExpandButtonText = styled(Text, {
  name: 'TastingDetailExpandButtonText',
  fontSize: '$3',
  color: '$cupBlue',
  fontWeight: '500',
});