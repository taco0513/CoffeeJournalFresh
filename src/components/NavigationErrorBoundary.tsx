import React, { Component, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { HIGColors, HIGConstants } from '../styles/common';
import { Logger } from '../services/LoggingService';
import performanceMonitor from '../services/PerformanceMonitor';
import { useNavigation } from '@react-navigation/native';

interface Props {
  children: ReactNode;
  screenName: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// HOC to provide navigation to class component
function withNavigation(Component: React.ComponentType<any>) {
  return function NavigationComponent(props: any) {
    const navigation = useNavigation();
    return <Component {...props} navigation={navigation} />;
};
}

class NavigationErrorBoundaryBase extends Component<Props & { navigation: any }, State> {
  constructor(props: Props & { navigation: any }) {
    super(props);
    this.state = { hasError: false, error: null };
}

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
}

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Logger.error(`NavigationErrorBoundary caught error in ${this.props.screenName}:`, 'component', { 
      component: 'NavigationErrorBoundary', 
      screen: this.props.screenName,
      error: error, 
      errorInfo 
  });
    
    // Report to performance monitor with screen context
    performanceMonitor.reportCrash(error, {
      ...errorInfo,
      screen: this.props.screenName,
      navigationState: this.props.navigation?.getState?.(),
  });
}

  handleReset = () => {
    this.setState({ hasError: false, error: null });
};

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    // Navigate to home screen
    if (this.props.navigation) {
      this.props.navigation.navigate('MainTabs', { screen: 'Home' });
  }
};

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
    }

      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.emoji}>☕️</Text>
            <Text style={styles.title}>앗, 문제가 발생했습니다</Text>
            <Text style={styles.subtitle}>
              {this.props.screenName} 화면에서 오류가 발생했습니다
            </Text>
            
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                이 오류는 자동으로 기록되었습니다. 
                불편을 드려 죄송합니다.
              </Text>
            </View>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error (Dev):</Text>
                <Text style={styles.errorText} numberOfLines={3}>
                  {this.state.error.toString()}
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={this.handleReset}
              >
                <Text style={styles.retryButtonText}>다시 시도</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.homeButton}
                onPress={this.handleGoHome}
              >
                <Text style={styles.homeButtonText}>홈으로</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      );
  }

    return this.props.children;
}
}

// Export the wrapped component
export const NavigationErrorBoundary = withNavigation(NavigationErrorBoundaryBase);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
    justifyContent: 'center',
    paddingHorizontal: HIGConstants.SPACING_LG,
},
  errorContainer: {
    alignItems: 'center',
},
  emoji: {
    fontSize: 64,
    marginBottom: HIGConstants.SPACING_MD,
},
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
    textAlign: 'center',
},
  subtitle: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_LG,
},
  infoBox: {
    backgroundColor: HIGColors.systemGray6,
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.RADIUS_MD,
    marginBottom: HIGConstants.SPACING_LG,
    width: '100%',
},
  infoText: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 20,
},
  errorDetails: {
    backgroundColor: HIGColors.systemRed + '10',
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.RADIUS_SM,
    marginBottom: HIGConstants.SPACING_LG,
    width: '100%',
},
  errorTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: HIGColors.systemRed,
    marginBottom: HIGConstants.SPACING_XS,
},
  errorText: {
    fontSize: 12,
    color: HIGColors.systemRed,
    fontFamily: 'Menlo',
},
  buttonContainer: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_MD,
    width: '100%',
},
  retryButton: {
    backgroundColor: HIGColors.accent,
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.RADIUS_LG,
    flex: 1,
},
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.white,
    textAlign: 'center',
},
  homeButton: {
    backgroundColor: HIGColors.systemGray5,
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.RADIUS_LG,
    flex: 1,
},
  homeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: HIGColors.label,
    textAlign: 'center',
},
});