import {
  View,
  Text,
  Button,
  YStack,
  XStack,
  Card,
  H1,
  H2,
  Paragraph,
  styled,
} from 'tamagui';

// Styled Components for DeveloperScreen
export const Container = styled(View, {
  name: 'DeveloperContainer',
  flex: 1,
  backgroundColor: '$background',
});

export const NavigationBar = styled(XStack, {
  name: 'NavigationBar',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: '$lg',
  paddingTop: '$md',
  paddingBottom: '$sm',
  backgroundColor: '$background',
});

export const BackButton = styled(Button, {
  name: 'BackButton',
  variant: 'outlined',
  size: '$sm',
  borderRadius: '$sm',
  color: '$blue10',
  borderColor: '$blue10',
  backgroundColor: 'transparent',
});

export const NavigationTitle = styled(H1, {
  name: 'NavigationTitle',
  fontSize: '$6',
  fontWeight: '700',
  color: '$color',
});

export const WarningCard = styled(Card, {
  name: 'WarningCard',
  backgroundColor: '$orange2',
  borderColor: '$orange6',
  borderWidth: 1,
  borderRadius: '$md',
  padding: '$md',
  marginHorizontal: '$lg',
  marginBottom: '$lg',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
});

export const WarningIcon = styled(Text, {
  name: 'WarningIcon',
  fontSize: '$6',
  marginRight: '$sm',
});

export const WarningText = styled(Paragraph, {
  name: 'WarningText',
  fontSize: '$4',
  color: '$orange11',
  fontWeight: '600',
  flex: 1,
});

export const Section = styled(YStack, {
  name: 'Section',
  marginBottom: '$lg',
});

export const SectionHeader = styled(XStack, {
  name: 'SectionHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$md',
  paddingHorizontal: '$lg',
});

export const SectionIcon = styled(Text, {
  name: 'SectionIcon',
  fontSize: '$5',
  marginRight: '$sm',
});

export const SectionTitle = styled(H2, {
  name: 'SectionTitle',
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
  flex: 1,
});

export const Badge = styled(XStack, {
  name: 'Badge',
  backgroundColor: '$blue4',
  borderRadius: '$sm',
  paddingHorizontal: '$sm',
  paddingVertical: 2,
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 24,
  height: 20,
});

export const BadgeText = styled(Text, {
  name: 'BadgeText',
  fontSize: '$2',
  color: '$blue11',
  fontWeight: '600',
});

export const SettingCard = styled(Card, {
  name: 'SettingCard',
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderWidth: 1,
  borderRadius: '$md',
  marginHorizontal: '$lg',
  overflow: 'hidden',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
});

export const SettingRow = styled(XStack, {
  name: 'SettingRow',
  alignItems: 'center',
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  
  variants: {
    isLast: {
      true: {
        borderBottomWidth: 0,
      },
    },
  } as const,
});

export const SettingIcon = styled(Text, {
  name: 'SettingIcon',
  fontSize: '$4',
  marginRight: '$md',
});

export const SettingInfo = styled(YStack, {
  name: 'SettingInfo',
  flex: 1,
  marginRight: '$md',
});

export const SettingTitle = styled(Text, {
  name: 'SettingTitle',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
  marginBottom: 2,
});

export const SettingDescription = styled(Text, {
  name: 'SettingDescription',
  fontSize: '$3',
  color: '$color10',
  lineHeight: 16,
});

export const ActionButton = styled(Button, {
  name: 'ActionButton',
  marginHorizontal: '$lg',
  marginVertical: '$sm',
  borderRadius: '$md',
  height: 48,
  
  variants: {
    variant: {
      primary: {
        backgroundColor: '$blue9',
        color: '$white',
        borderColor: '$blue9',
      },
      secondary: {
        backgroundColor: '$gray4',
        color: '$color',
        borderColor: '$gray6',
      },
      success: {
        backgroundColor: '$green9',
        color: '$white',
        borderColor: '$green9',
      },
      warning: {
        backgroundColor: '$orange9',
        color: '$white',
        borderColor: '$orange9',
      },
      danger: {
        backgroundColor: '$red9',
        color: '$white',
        borderColor: '$red9',
      },
    },
  } as const,
  
  defaultVariants: {
    variant: 'primary',
  },
});

export const ActionButtonContent = styled(XStack, {
  name: 'ActionButtonContent',
  alignItems: 'center',
  justifyContent: 'center',
});

export const ActionButtonIcon = styled(Text, {
  name: 'ActionButtonIcon',
  fontSize: '$4',
  marginRight: '$sm',
});

export const ActionButtonText = styled(Text, {
  name: 'ActionButtonText',
  fontSize: '$4',
  fontWeight: '600',
  textAlign: 'center',
  
  variants: {
    variant: {
      primary: { color: '$white' },
      secondary: { color: '$color' },
      success: { color: '$white' },
      warning: { color: '$white' },
      danger: { color: '$white' },
    },
  } as const,
});

// User Info Components
export const UserInfoCard = styled(XStack, {
  name: 'UserInfoCard',
  alignItems: 'center',
  padding: '$lg',
  backgroundColor: '$background',
});

export const UserAvatar = styled(View, {
  name: 'UserAvatar',
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: '$blue9',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '$lg',
});

export const UserAvatarText = styled(Text, {
  name: 'UserAvatarText',
  fontSize: '$6',
  fontWeight: '700',
  color: '$white',
});

export const UserDetails = styled(YStack, {
  name: 'UserDetails',
  flex: 1,
  marginRight: '$md',
});

export const UserName = styled(Text, {
  name: 'UserName',
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
  marginBottom: 2,
});

export const UserEmail = styled(Text, {
  name: 'UserEmail',
  fontSize: '$3',
  color: '$color10',
  marginBottom: '$sm',
});

export const UserBadges = styled(XStack, {
  name: 'UserBadges',
  gap: '$sm',
});

export const UserBadge = styled(View, {
  name: 'UserBadge',
  paddingHorizontal: '$sm',
  paddingVertical: 2,
  borderRadius: '$sm',
  
  variants: {
    type: {
      developer: {
        backgroundColor: '$purple4',
      },
      beta: {
        backgroundColor: '$orange4',
      },
      admin: {
        backgroundColor: '$red4',
      },
    },
  } as const,
});

export const UserBadgeText = styled(Text, {
  name: 'UserBadgeText',
  fontSize: '$2',
  fontWeight: '600',
  
  variants: {
    type: {
      developer: { color: '$purple11' },
      beta: { color: '$orange11' },
      admin: { color: '$red11' },
    },
  } as const,
});

// Disabled State Components
export const DisabledContainer = styled(YStack, {
  name: 'DisabledContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: '$xl',
  backgroundColor: '$background',
});

export const DisabledIcon = styled(Text, {
  name: 'DisabledIcon',
  fontSize: 64,
  marginBottom: '$lg',
});

export const DisabledTitle = styled(H2, {
  name: 'DisabledTitle',
  fontSize: '$6',
  fontWeight: '700',
  color: '$color',
  textAlign: 'center',
  marginBottom: '$md',
});

export const DisabledDescription = styled(Paragraph, {
  name: 'DisabledDescription',
  fontSize: '$4',
  color: '$color10',
  textAlign: 'center',
  lineHeight: 22,
  marginBottom: '$xl',
});

export const EnableButton = styled(Button, {
  name: 'EnableButton',
  backgroundColor: '$blue9',
  color: '$white',
  borderColor: '$blue9',
  borderRadius: '$md',
  height: 48,
  paddingHorizontal: '$xl',
  fontSize: '$4',
  fontWeight: '600',
});

// Mock Data Config Components
export const MockDataConfig = styled(YStack, {
  name: 'MockDataConfig',
  backgroundColor: '$gray2',
  borderRadius: '$md',
  padding: '$md',
  marginHorizontal: '$lg',
  marginTop: '$sm',
  borderWidth: 1,
  borderColor: '$gray6',
});

export const ConfigTitle = styled(Text, {
  name: 'ConfigTitle',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
  marginBottom: '$sm',
});

export const ConfigRow = styled(YStack, {
  name: 'ConfigRow',
  marginBottom: '$sm',
});

export const ConfigLabel = styled(Text, {
  name: 'ConfigLabel',
  fontSize: '$3',
  color: '$color10',
  marginBottom: '$xs',
});

export const ScenarioButtons = styled(XStack, {
  name: 'ScenarioButtons',
  flexWrap: 'wrap',
  gap: '$xs',
});

export const ScenarioButton = styled(Button, {
  name: 'ScenarioButton',
  size: '$sm',
  borderRadius: '$sm',
  backgroundColor: '$blue4',
  borderColor: '$blue6',
  paddingHorizontal: '$sm',
  height: 32,
  
  variants: {
    selected: {
      true: {
        backgroundColor: '$blue9',
        borderColor: '$blue9',
      },
    },
  } as const,
});

export const ScenarioButtonText = styled(Text, {
  name: 'ScenarioButtonText',
  fontSize: '$2',
  fontWeight: '600',
  
  variants: {
    selected: {
      true: { color: '$white' },
      false: { color: '$blue11' },
    },
  } as const,
});