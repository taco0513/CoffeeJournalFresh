import React from 'react';
import {
  MockDataConfig,
  ConfigTitle,
  ConfigRow,
  ConfigLabel,
  ScenarioButtons,
  ScenarioButton,
  ScenarioButtonText,
} from './DeveloperScreenStyles';
import { MockDataScenario } from '../../services/MockDataService';

interface MockDataConfigSectionProps {
  selectedScenario: MockDataScenario;
  onScenarioChange: (scenario: MockDataScenario) => void;
  mockDataEnabled: boolean;
}

const MOCK_SCENARIOS: { value: MockDataScenario; label: string }[] = [
  { value: MockDataScenario.BEGINNER, label: '초보자' },
  { value: MockDataScenario.INTERMEDIATE, label: '중급자' },
  { value: MockDataScenario.EXPERT, label: '전문가' },
  { value: MockDataScenario.HOME_CAFE_FOCUSED, label: '홈카페' },
  { value: MockDataScenario.STATISTICS_TEST, label: '통계' },
];

export const MockDataConfigSection: React.FC<MockDataConfigSectionProps> = ({
  selectedScenario,
  onScenarioChange,
  mockDataEnabled,
}) => {
  if (!mockDataEnabled) {
    return null;
}

  return (
    <MockDataConfig>
      <ConfigTitle>목 데이터 설정</ConfigTitle>
      
      <ConfigRow>
        <ConfigLabel>테스트 시나리오</ConfigLabel>
        <ScenarioButtons>
          {MOCK_SCENARIOS.map((scenario) => {
            const isSelected = selectedScenario === scenario.value;
            return (
              <ScenarioButton
                key={scenario.value}
                selected={isSelected}
                onPress={() => onScenarioChange(scenario.value)}
              >
                <ScenarioButtonText selected={isSelected}>
                  {scenario.label}
                </ScenarioButtonText>
              </ScenarioButton>
            );
        })}
        </ScenarioButtons>
      </ConfigRow>
    </MockDataConfig>
  );
};