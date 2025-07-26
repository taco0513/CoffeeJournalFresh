import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getCurrentLanguage, 
  changeLanguage, 
  isKoreanMarket, 
  isKorean,
  getMarketConfig,
} from '../../services/i18n';
import { 
  getCurrentMarketConfig, 
  isBetaMarket,
  getMarketRoasters,
  getMarketOrigins,
  getMarketFlavorProfiles,
} from '../../config/marketConfig';
import { HIGColors, HIGConstants } from '../../styles/common';
import LanguageSwitch from '../LanguageSwitch';

import { Logger } from '../../services/LoggingService';
/**
 * Comprehensive I18n Validation Screen
 * Tests language detection, switching, market configuration, and dual-market functionality
 */

interface ValidationResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: Record<string, string | number | boolean>;
}

const I18nValidationScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [forceUSMarket, setForceUSMarket] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<unknown>({});
  const [marketData, setMarketData] = useState<unknown>({});

  useEffect(() => {
    loadDeviceInfo();
    loadMarketData();
}, [forceUSMarket]);

  /**
   * Load device and locale information
   */
  const loadDeviceInfo = async () => {
    try {
      const locales = RNLocalize.getLocales();
      const deviceInfo = {
        locales,
        currentLanguage: getCurrentLanguage(),
        isKoreanMarket: isKoreanMarket(),
        isBetaMarket: isBetaMarket(),
        isKorean: isKorean(),
        i18nLanguage: i18n.language,
        forceUSMarket,
    };
      setDeviceInfo(deviceInfo);
  } catch (error) {
      Logger.error('Failed to load device info:', 'component', { component: 'I18nValidationScreen', error: error });
  }
};

  /**
   * Load market-specific data
   */
  const loadMarketData = async () => {
    try {
      const marketConfig = getCurrentMarketConfig();
      const i18nMarketConfig = getMarketConfig();
      
      const marketData = {
        marketConfig,
        i18nMarketConfig,
        roasters: getMarketRoasters(),
        origins: getMarketOrigins(),
        flavorProfiles: getMarketFlavorProfiles(),
    };
      setMarketData(marketData);
  } catch (error) {
      Logger.error('Failed to load market data:', 'component', { component: 'I18nValidationScreen', error: error });
  }
};

  /**
   * Run comprehensive validation tests
   */
  const runValidationTests = async () => {
    setIsRunning(true);
    
    try {
      // Import validation suite dynamically to avoid circular dependencies
      const { i18nValidationSuite } = await import('../../utils/i18nValidationSuite');
      
      // Run comprehensive validation
      const suiteResults = await i18nValidationSuite.runFullValidation();
      
      // Convert suite results to our format
      const results: ValidationResult[] = suiteResults.results.map(result => ({
        test: result.testName,
        status: result.status,
        message: result.message,
        details: {
          category: result.category,
          executionTime: result.executionTime,
          errorMessage: result.errorMessage,
          ...result.details
      }
    }));
      
      setValidationResults(results);
      
      // Show comprehensive summary
      Alert.alert(
        'Validation Suite Complete',
        `${suiteResults.summary}\n\nRecommendations:\n${suiteResults.recommendations.slice(0, 3).join('\n')}`,
        [{ text: 'OK' }]
      );
  } catch (error) {
      Logger.error('Validation suite error:', 'component', { component: 'I18nValidationScreen', error: error });
      
      // Fallback to basic test if suite fails
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const results: ValidationResult[] = [{
        test: 'Validation Suite Error',
        status: 'fail',
        message: `Validation suite failed: ${errorMessage}`,
        details: { error: errorMessage }
    }];
      
      setValidationResults(results);
      
      Alert.alert(
        'Validation Error',
        `Validation suite encountered an error: ${errorMessage}`,
        [{ text: 'OK' }]
      );
  }
};

  /**
   * Test dual-market functionality
   */
  const testDualMarket = async () => {
    Alert.alert(
      'Dual-Market Test',
      'This will test both Korean and US market configurations. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Test',
          onPress: async () => {
            // Test Korean market
            setForceUSMarket(false);
            await new Promise(resolve => setTimeout(resolve, 500));
            await runValidationTests();
            
            // Test US market
            setForceUSMarket(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            await runValidationTests();
            
            Alert.alert('Dual-Market Test Complete', 'Check results for both markets');
        }
      }
      ]
    );
};

  /**
   * Reset all i18n settings
   */
  const resetI18nSettings = async () => {
    Alert.alert(
      'Reset I18n Settings',
      'This will clear all language preferences and reset to device defaults. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@app_language');
              await i18n.changeLanguage('ko'); // Reset to default
              setForceUSMarket(false);
              await loadDeviceInfo();
              await loadMarketData();
              Alert.alert('Settings Reset', 'I18n settings have been reset to defaults');
          } catch (error) {
              Alert.alert('Error', `Failed to reset settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
      ]
    );
};

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>I18n System Validation</Text>
        <Text style={styles.headerSubtitle}>
          {t('language')}: {getCurrentLanguage().toUpperCase()} | Market: {isKoreanMarket() ? ' Korean' : ' US Beta'}
        </Text>
      </View>

      {/* Language Switch */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language Controls</Text>
        <LanguageSwitch showLabels />
      </View>

      {/* Force US Market Toggle */}
      <View style={styles.section}>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Force US Market (Testing)</Text>
          <Switch
            value={forceUSMarket}
            onValueChange={setForceUSMarket}
            trackColor={{ false: HIGColors.systemGray4, true: HIGColors.systemBlue }}
            thumbColor={HIGColors.white}
          />
        </View>
      </View>

      {/* Device Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Information</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Current Language: {deviceInfo.currentLanguage}</Text>
          <Text style={styles.infoText}>i18n Language: {deviceInfo.i18nLanguage}</Text>
          <Text style={styles.infoText}>Korean Market: {deviceInfo.isKoreanMarket ? 'Yes' : 'No'}</Text>
          <Text style={styles.infoText}>Beta Market: {deviceInfo.isBetaMarket ? 'Yes' : 'No'}</Text>
          <Text style={styles.infoText}>Device Locales: {deviceInfo.locales?.map((l: unknown) => `${l.languageCode}-${l.countryCode}`).join(', ')}</Text>
        </View>
      </View>

      {/* Market Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Market Data</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Market: {marketData.marketConfig?.market}</Text>
          <Text style={styles.infoText}>Language: {marketData.marketConfig?.language}</Text>
          <Text style={styles.infoText}>Currency: {marketData.marketConfig?.currency}</Text>
          <Text style={styles.infoText}>Sample Roasters: {(marketData.roasters as RoasterData[])?.slice(0, 3).join(', ')}</Text>
          <Text style={styles.infoText}>Sample Origins: {marketData.origins?.slice(0, 3).join(', ')}</Text>
        </View>
      </View>

      {/* Test Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Validation Tests</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={runValidationTests}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>
              {isRunning ? 'Running Tests...' : 'Run Validation Tests'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={testDualMarket}
            disabled={isRunning}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Test Dual-Market
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={resetI18nSettings}
          >
            <Text style={styles.buttonText}>Reset Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Validation Results */}
      {validationResults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Test Results ({validationResults.filter(r => r.status === 'pass').length}/{validationResults.length} passed)
          </Text>
          {validationResults.map((result, index) => (
            <View key={index} style={[styles.resultCard, styles[result.status === 'pass' ? 'resultPass' : result.status === 'warning' ? 'resultWarning' : 'resultFail']]}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTest}>{result.test}</Text>
                <Text style={[styles.resultStatus, styles[result.status === 'pass' ? 'statusPass' : result.status === 'warning' ? 'statusWarning' : 'statusFail']]}>
                  {result.status === 'pass' ? '' : result.status === 'warning' ? '' : ''}
                </Text>
              </View>
              <Text style={styles.resultMessage}>{result.message}</Text>
              {result.details && (
                <Text style={styles.resultDetails}>
                  {JSON.stringify(result.details, null, 2)}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Translation Examples */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Translation Examples</Text>
        <View style={styles.translationContainer}>
          <Text style={styles.translationExample}>Home: {t('home')}</Text>
          <Text style={styles.translationExample}>Journal: {t('journal')}</Text>
          <Text style={styles.translationExample}>Profile: {t('profile')}</Text>
          <Text style={styles.translationExample}>CupNote: {t('coffeeJournal')}</Text>
          <Text style={styles.translationExample}>Start New Tasting: {t('startNewTasting')}</Text>
          <Text style={styles.translationExample}>Cafe Mode: {t('cafeMode')}</Text>
          <Text style={styles.translationExample}>Home Cafe Mode: {t('homeCafeMode')}</Text>
          <Text style={styles.translationExample}>Lab Mode: {t('labMode')}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
},
  header: {
    padding: HIGConstants.SPACING_LG,
    backgroundColor: HIGColors.systemBlue,
},
  headerTitle: {
    fontSize: HIGConstants.FONT_SIZE_H1,
    fontWeight: '700',
    color: HIGColors.white,
    marginBottom: 4,
},
  headerSubtitle: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.white,
    opacity: 0.9,
},
  section: {
    padding: HIGConstants.SPACING_LG,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray4,
},
  sectionTitle: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
},
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
},
  toggleLabel: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
},
  infoContainer: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
},
  infoText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    marginBottom: 4,
    fontFamily: 'Menlo',
},
  buttonContainer: {
    gap: HIGConstants.SPACING_MD,
},
  button: {
    paddingVertical: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_LG,
    borderRadius: HIGConstants.cornerRadiusMedium,
    alignItems: 'center',
},
  primaryButton: {
    backgroundColor: HIGColors.systemBlue,
},
  secondaryButton: {
    backgroundColor: HIGColors.systemGray5,
    borderWidth: 1,
    borderColor: HIGColors.systemGray4,
},
  dangerButton: {
    backgroundColor: HIGColors.systemRed,
},
  buttonText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    fontWeight: '600',
    color: HIGColors.white,
},
  secondaryButtonText: {
    color: HIGColors.label,
},
  resultCard: {
    backgroundColor: HIGColors.white,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
    borderLeftWidth: 4,
},
  resultPass: {
    borderLeftColor: HIGColors.systemGreen,
},
  resultWarning: {
    borderLeftColor: HIGColors.systemOrange,
},
  resultFail: {
    borderLeftColor: HIGColors.systemRed,
},
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
},
  resultTest: {
    fontSize: HIGConstants.FONT_SIZE_TITLE,
    fontWeight: '600',
    color: HIGColors.label,
},
  resultStatus: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
},
  statusPass: {
    color: HIGColors.systemGreen,
},
  statusWarning: {
    color: HIGColors.systemOrange,
},
  statusFail: {
    color: HIGColors.systemRed,
},
  resultMessage: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
},
  resultDetails: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.tertiaryLabel,
    fontFamily: 'Menlo',
    backgroundColor: HIGColors.systemGray6,
    padding: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.cornerRadiusSmall,
},
  translationContainer: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.cornerRadiusMedium,
    padding: HIGConstants.SPACING_MD,
},
  translationExample: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    marginBottom: 4,
},
});

export default I18nValidationScreen;