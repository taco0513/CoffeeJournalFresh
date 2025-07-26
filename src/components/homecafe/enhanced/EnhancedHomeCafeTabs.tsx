// EnhancedHomeCafeTabs.tsx
// Section tabs component for EnhancedHomeCafeScreen

import React from 'react';
import { Text, XStack } from 'tamagui';
import {
  TabContainer,
  Tab,
  TabText,
} from './EnhancedHomeCafeStyledComponents';

interface TabSection {
  key: string;
  label: string;
  icon: string;
}

interface EnhancedHomeCafeTabsProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const SECTIONS: TabSection[] = [
  { key: 'dripper', label: '드리퍼', icon: '' },
  { key: 'recipe', label: '레시피', icon: '' },
  { key: 'guides', label: '가이드', icon: '' },
  { key: 'timer', label: '타이머', icon: '' },
];

export const EnhancedHomeCafeTabs: React.FC<EnhancedHomeCafeTabsProps> = ({
  activeSection,
  onSectionChange,
}) => {
  return (
    <TabContainer>
      {SECTIONS.map((section) => (
        <Tab
          key={section.key}
          active={activeSection === section.key}
          onPress={() => onSectionChange(section.key)}
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