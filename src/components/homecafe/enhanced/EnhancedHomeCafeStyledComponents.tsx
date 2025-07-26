// EnhancedHomeCafeStyledComponents.tsx
// Styled components for EnhancedHomeCafeScreen - extracted for modularity

import { styled } from 'tamagui';
import {
  View,
  XStack,
  YStack,
  Button,
  Card,
  H1,
  H2,
  Text,
} from 'tamagui';

// Main Container Components
export const Container = styled(View, {
  name: 'EnhancedHomeCafeContainer',
  flex: 1,
  backgroundColor: '$background',
});

export const NavigationBar = styled(XStack, {
  name: 'EnhancedHomeCafeNavigation',
  height: 44,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$lg',
  backgroundColor: '$background',
  borderBottomWidth: 0.5,
  borderBottomColor: '$borderColor',
});

export const BackButton = styled(Button, {
  name: 'BackButton',
  backgroundColor: 'transparent',
  borderWidth: 0,
  paddingHorizontal: '$sm',
  pressStyle: {
    opacity: 0.7,
    scale: 0.95,
},
});

export const NavigationTitle = styled(H1, {
  name: 'NavigationTitle',
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
});

export const AdvancedModeToggle = styled(XStack, {
  name: 'AdvancedModeToggle',
  alignItems: 'center',
  gap: '$sm',
});

export const AdvancedModeText = styled(Text, {
  name: 'AdvancedModeText',
  fontSize: '$3',
  color: '$gray11',
});

// Section Components
export const SectionContainer = styled(YStack, {
  name: 'SectionContainer',
  gap: '$lg',
  paddingHorizontal: '$lg',
  paddingVertical: '$lg',
});

export const SectionCard = styled(Card, {
  name: 'SectionCard',
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderWidth: 0.5,
  borderRadius: '$4',
  padding: '$lg',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  variants: {
    active: {
      true: {
        borderColor: '$cupBlue',
        shadowOpacity: 0.2,
    },
  },
} as const,
});

export const SectionHeader = styled(XStack, {
  name: 'SectionHeader',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '$md',
});

export const SectionTitle = styled(H2, {
  name: 'SectionTitle',
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
  flex: 1,
});

export const SectionIcon = styled(Text, {
  name: 'SectionIcon',
  fontSize: 20,
});

// Tab Components
export const TabContainer = styled(XStack, {
  name: 'TabContainer',
  gap: '$xs',
  padding: '$xs',
  backgroundColor: '$gray2',
  borderRadius: '$3',
});

export const Tab = styled(Button, {
  name: 'Tab',
  flex: 1,
  backgroundColor: 'transparent',
  borderWidth: 0,
  borderRadius: '$2',
  paddingVertical: '$sm',
  pressStyle: {
    scale: 0.98,
},
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
});

export const TabText = styled(Text, {
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
        color: '$gray10',
    },
  },
} as const,
});

// Form Components
export const FormRow = styled(XStack, {
  name: 'FormRow',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: '$sm',
});

export const FormLabel = styled(Text, {
  name: 'FormLabel',
  fontSize: '$4',
  fontWeight: '500',
  color: '$color',
  flex: 1,
});

export const FormValue = styled(XStack, {
  name: 'FormValue',
  alignItems: 'center',
  gap: '$sm',
});

export const ValueButton = styled(Button, {
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

export const ValueText = styled(Text, {
  name: 'ValueText',
  fontSize: '$3',
  color: '$color',
  textAlign: 'center',
});

// Quick Actions Components
export const QuickActionsCard = styled(SectionCard, {
  name: 'QuickActionsCard',
});

export const QuickActionsGrid = styled(XStack, {
  name: 'QuickActionsGrid',
  flexWrap: 'wrap',
  gap: '$sm',
});

export const QuickActionButton = styled(Button, {
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

export const QuickActionContent = styled(YStack, {
  name: 'QuickActionContent',
  alignItems: 'center',
  gap: '$xs',
});

export const QuickActionIcon = styled(Text, {
  name: 'QuickActionIcon',
  fontSize: 20,
});

export const QuickActionText = styled(Text, {
  name: 'QuickActionText',
  fontSize: '$3',
  fontWeight: '500',
  color: 'white',
  textAlign: 'center',
});

// Bottom Action Components
export const BottomActions = styled(XStack, {
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

export const PrimaryButton = styled(Button, {
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

export const SecondaryButton = styled(Button, {
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

// Timer Modal Component
export const TimerModal = styled(Card, {
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