import React from 'react';
import {
  XStack,
  Text,
  styled,
  useTheme,
} from 'tamagui';
import { TouchableOpacity } from 'react-native';
import { BetaTestingTab } from '../../types/BetaTestingTypes';

interface BetaTabNavigationProps {
  selectedTab: BetaTestingTab;
  onTabSelect: (tab: BetaTestingTab) => void;
}

// Styled components
const Container = styled(XStack, {
  name: 'BetaTabContainer',
  backgroundColor: '$background',
  borderRadius: '$3',
  padding: '$xs',
  marginBottom: '$lg',
});

const Tab = styled(TouchableOpacity, {
  name: 'BetaTab',
  flex: 1,
  alignItems: 'center',
  paddingVertical: '$sm',
  paddingHorizontal: '$sm',
  borderRadius: '$2',
});

export const BetaTabNavigation: React.FC<BetaTabNavigationProps> = ({
  selectedTab,
  onTabSelect,
}) => {
  const theme = useTheme();
  
  const tabs: Array<{ key: BetaTestingTab; label: string; icon: string }> = [
    { key: 'status', label: 'Status', icon: '' },
    { key: 'feedback', label: 'Feedback', icon: '' },
    { key: 'deployment', label: 'Deployment', icon: '' },
  ];

  const renderTab = (tab: { key: BetaTestingTab; label: string; icon: string }) => {
    const isActive = selectedTab === tab.key;
    
    return (
      <Tab
        key={tab.key}
        onPress={() => onTabSelect(tab.key)}
        style={{
          backgroundColor: isActive ? theme.blue10.val : 'transparent',
      }}
      >
        <Text
          fontSize="$5"
          marginBottom="$xs"
        >
          {tab.icon}
        </Text>
        <Text
          fontSize="$2"
          fontWeight={isActive ? '600' : '500'}
          color={isActive ? 'white' : '$color11'}
        >
          {tab.label}
        </Text>
      </Tab>
    );
};

  return (
    <Container>
      {tabs.map(renderTab)}
    </Container>
  );
};

// All styles are now handled by Tamagui styled components and design tokens

export default BetaTabNavigation;