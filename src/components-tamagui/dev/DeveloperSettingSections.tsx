import React from 'react';
import { Switch, Alert } from 'react-native';
import {
  Section,
  SectionHeader,
  SectionIcon,
  SectionTitle,
  Badge,
  BadgeText,
  SettingCard,
  SettingRow,
  SettingIcon,
  SettingInfo,
  SettingTitle,
  SettingDescription,
  ActionButton,
  ActionButtonContent,
  ActionButtonIcon,
  ActionButtonText,
} from './DeveloperScreenStyles';
import { XStack } from 'tamagui';

// Category Icons
const CategoryIcons = {
  user: '',
  debug: '',
  test: '',
  feature: '',
  beta: 'β',
  login: '',
  data: '',
  firecrawl: '',
} as const;

// Types
interface SectionHeaderProps {
  title: string;
  icon: string;
  count?: number;
}

interface SettingRowProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isLast?: boolean;
  icon?: string;
}

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  icon?: string;
}

// Helper Components
const renderSectionHeader = ({ title, icon, count }: SectionHeaderProps) => (
  <SectionHeader>
    <XStack alignItems="center" flex={1}>
      <SectionIcon>{icon}</SectionIcon>
      <SectionTitle>{title}</SectionTitle>
    </XStack>
    {count !== undefined && count > 0 && (
      <Badge>
        <BadgeText>{count}</BadgeText>
      </Badge>
    )}
  </SectionHeader>
);

const renderSettingRow = ({ 
  title, 
  description, 
  value, 
  onValueChange, 
  isLast = false,
  icon 
}: SettingRowProps) => (
  <SettingRow isLast={isLast}>
    {icon && <SettingIcon>{icon}</SettingIcon>}
    <SettingInfo>
      <SettingTitle>{title}</SettingTitle>
      <SettingDescription>{description}</SettingDescription>
    </SettingInfo>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#E5E5EA', true: '#34C759' }}
      thumbColor="#FFFFFF"
      ios_backgroundColor="#E5E5EA"
    />
  </SettingRow>
);

const renderActionButton = ({ 
  title, 
  onPress, 
  variant = 'primary',
  icon 
}: ActionButtonProps) => (
  <ActionButton variant={variant} onPress={onPress}>
    <ActionButtonContent>
      {icon && <ActionButtonIcon>{icon}</ActionButtonIcon>}
      <ActionButtonText variant={variant}>{title}</ActionButtonText>
    </ActionButtonContent>
  </ActionButton>
);

// Main Component Props
interface DeveloperSettingSectionsProps {
  // Debug settings
  enableDebugMode: boolean;
  setDebugMode: (value: boolean) => void;
  showPerformanceInfo: boolean;
  setPerformanceInfo: (value: boolean) => void;
  enableVerboseLogging: boolean;
  setVerboseLogging: (value: boolean) => void;
  
  // Feature toggles
  mockDataEnabled: boolean;
  toggleMockData: (value: boolean) => void;
  showDeveloperToasts: boolean;
  setDeveloperToasts: (value: boolean) => void;
  
  // Authentication & User
  bypassLogin: boolean;
  setBypassLogin: (value: boolean) => void;
  enableShakeToFeedback: boolean;
  toggleShakeToFeedback: () => void;
  isBetaUser: boolean;
  setBetaStatus: (value: boolean) => void;
  setTestUser: () => Promise<void>;
  showFeedback: () => void;
  clearData: () => void;
  exportLogs: () => void;
  resetApp: () => void;
  
  // Navigation
  onNavigateToMarketTester: () => void;
  onNavigateToPerformanceDashboard: () => void;
  onNavigateToI18nValidation: () => void;
  onNavigateToTesting: () => void;
  onNavigateToFirecrawlDemo: () => void;
}

export const DeveloperSettingSections: React.FC<DeveloperSettingSectionsProps> = ({
  // Debug settings
  enableDebugMode,
  setDebugMode,
  showPerformanceInfo,
  setPerformanceInfo,
  enableVerboseLogging,
  setVerboseLogging,
  
  // Feature toggles
  mockDataEnabled,
  toggleMockData,
  showDeveloperToasts,
  setDeveloperToasts,
  
  // Authentication & User
  bypassLogin,
  setBypassLogin,
  enableShakeToFeedback,
  toggleShakeToFeedback,
  isBetaUser,
  setBetaStatus,
  
  // Actions
  setTestUser,
  showFeedback,
  clearData,
  exportLogs,
  resetApp,
  
  // Navigation
  onNavigateToMarketTester,
  onNavigateToPerformanceDashboard,
  onNavigateToI18nValidation,
  onNavigateToTesting,
  onNavigateToFirecrawlDemo,
}) => {
  return (
    <>
      {/* Debug Settings */}
      <Section>
        {renderSectionHeader({ 
          title: '디버그 설정', 
          icon: CategoryIcons.debug,
          count: [enableDebugMode, showPerformanceInfo, enableVerboseLogging].filter(Boolean).length
      })}
        <SettingCard>
          {renderSettingRow({
            title: '디버그 모드',
            description: '개발자 도구 및 추가 로깅 활성화',
            value: enableDebugMode,
            onValueChange: setDebugMode,
        })}
          
          {renderSettingRow({
            title: '성능 정보 표시',
            description: '화면별 렌더링 시간 및 메모리 사용량',
            value: showPerformanceInfo,
            onValueChange: setPerformanceInfo,
        })}
          
          {renderSettingRow({
            title: '상세 로깅',
            description: '모든 액션과 상태 변경 로그 출력',
            value: enableVerboseLogging,
            onValueChange: setVerboseLogging,
            isLast: true,
        })}
        </SettingCard>
      </Section>

      {/* Feature Toggles */}
      <Section>
        {renderSectionHeader({ 
          title: '기능 토글', 
          icon: CategoryIcons.feature,
          count: [mockDataEnabled, showDeveloperToasts].filter(Boolean).length
      })}
        <SettingCard>
          {renderSettingRow({
            title: '목 데이터 활성화',
            description: '테스트용 가짜 데이터 표시',
            value: mockDataEnabled,
            onValueChange: toggleMockData,
        })}
          
          {renderSettingRow({
            title: '개발자 토스트',
            description: '개발자용 알림 메시지 표시',
            value: showDeveloperToasts,
            onValueChange: setDeveloperToasts,
            isLast: true,
        })}
        </SettingCard>
      </Section>

      {/* Authentication */}
      <Section>
        {renderSectionHeader({ 
          title: '인증 설정', 
          icon: CategoryIcons.user,
          count: [bypassLogin].filter(Boolean).length
      })}
        <SettingCard>
          {renderSettingRow({
            title: '로그인 건너뛰기',
            description: '로그인 화면을 건너뛰고 바로 앱 진입',
            value: bypassLogin,
            onValueChange: setBypassLogin,
            isLast: true,
        })}
        </SettingCard>
      </Section>

      {/* Beta Feedback Settings */}
      <Section>
        {renderSectionHeader({ 
          title: '베타 피드백', 
          icon: CategoryIcons.beta,
          count: [enableShakeToFeedback, isBetaUser].filter(Boolean).length
      })}
        <SettingCard>
          {renderSettingRow({
            title: '흔들어서 피드백 보내기',
            description: '기기를 흔들어 피드백 모달 열기',
            value: enableShakeToFeedback,
            onValueChange: toggleShakeToFeedback,
        })}
          
          {renderSettingRow({
            title: '베타 테스터 모드',
            description: '베타 테스터 전용 기능 활성화',
            value: isBetaUser,
            onValueChange: setBetaStatus,
            isLast: true,
        })}
          
          {renderActionButton({
            title: '피드백 모달 열기',
            onPress: showFeedback,
        })}
        </SettingCard>
      </Section>

      {/* Quick Login */}
      <Section>
        {renderSectionHeader({ title: '빠른 로그인', icon: CategoryIcons.login })}
        <SettingCard>
          {renderActionButton({
            title: '테스트 사용자로 로그인',
            onPress: () => {
              setTestUser();
              Alert.alert('완료', '테스트 사용자로 로그인했습니다.');
          },
            variant: 'success',
        })}
        </SettingCard>
      </Section>

      {/* Testing & Validation */}
      <Section>
        {renderSectionHeader({ title: '테스팅 도구', icon: CategoryIcons.test })}
        <SettingCard>
          {renderActionButton({
            title: '시장 설정 테스터',
            onPress: onNavigateToMarketTester,
        })}
          
          {renderActionButton({
            title: '성능 대시보드',
            onPress: onNavigateToPerformanceDashboard,
        })}
          
          {renderActionButton({
            title: '국제화 검증',
            onPress: onNavigateToI18nValidation,
        })}
          
          {renderActionButton({
            title: '교차 시장 테스팅',
            onPress: onNavigateToTesting,
        })}
        </SettingCard>
      </Section>

      {/* Firecrawl Demo */}
      <Section>
        {renderSectionHeader({ title: 'Firecrawl 데모', icon: CategoryIcons.firecrawl })}
        <SettingCard>
          {renderActionButton({
            title: 'Firecrawl 마켓 인텔리전스',
            onPress: onNavigateToFirecrawlDemo,
            icon: '',
        })}
        </SettingCard>
      </Section>

      {/* Data Management */}
      <Section>
        {renderSectionHeader({ title: '데이터 관리', icon: CategoryIcons.data })}
        <SettingCard>
          {renderActionButton({
            title: '로그 내보내기',
            onPress: exportLogs,
            variant: 'secondary',
        })}
          
          {renderActionButton({
            title: '데이터 초기화',
            onPress: clearData,
            variant: 'warning',
        })}
          
          {renderActionButton({
            title: '앱 리셋',
            onPress: resetApp,
            variant: 'danger',
        })}
        </SettingCard>
      </Section>
    </>
  );
};