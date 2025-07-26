/**
 * Market Configuration Testing Types
 * Shared types for market configuration testing functionality
 */

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  market: 'korean' | 'us_beta';
  language: 'ko' | 'en';
  testFunction: () => Promise<TestResult>;
}

export interface TestResult {
  scenario: string;
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

export interface MarketInfo {
  marketConfig: unknown;
  deploymentConfig: unknown;
  isBeta: boolean;
  features: {
    homeCafeMode: boolean;
    labMode: boolean;
    marketIntelligence: boolean;
    achievements: boolean;
};
  deploymentFeatures: {
    performanceDashboard: boolean;
    betaTestingDashboard: boolean;
    crashReporting: boolean;
};
  data: {
    roasters: unknown[];
    origins: unknown[];
    flavorProfiles: unknown[];
    brewMethods: unknown[];
};
  formatting: {
    currency: string;
    date: string;
    time: string;
};
}

export interface TestSuiteStats {
  total: number;
  passed: number;
  failed: number;
  successRate: number;
}