import React, { Component, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { HIGColors, HIGConstants } from '@/constants/HIG';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <SafeAreaView style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.errorContainer}>
              <Text style={styles.title}>앗, 문제가 발생했습니다</Text>
              <Text style={styles.subtitle}>
                예기치 않은 오류가 발생했습니다. 불편을 드려 죄송합니다.
              </Text>
              
              <View style={styles.betaNotice}>
                <Text style={styles.betaTitle}>베타 버전 안내</Text>
                <Text style={styles.betaText}>
                  현재 Coffee Journal은 베타 테스트 중입니다. 오류가 발생할 수 있으며, 
                  피드백은 앱 개선에 큰 도움이 됩니다.
                </Text>
              </View>

              {__DEV__ && this.state.error && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorTitle}>Error Details (Dev Only):</Text>
                  <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                </View>
              )}

              <TouchableOpacity 
                style={styles.resetButton}
                onPress={this.handleReset}
              >
                <Text style={styles.resetButtonText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_XL,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginBottom: HIGConstants.SPACING_XL,
    lineHeight: 24,
  },
  betaNotice: {
    backgroundColor: HIGColors.systemGray6,
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.RADIUS_MD,
    marginBottom: HIGConstants.SPACING_XL,
    width: '100%',
  },
  betaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  betaText: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    lineHeight: 20,
  },
  errorDetails: {
    backgroundColor: HIGColors.systemGray6,
    padding: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.RADIUS_MD,
    marginBottom: HIGConstants.SPACING_XL,
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
    fontFamily: 'Courier',
  },
  resetButton: {
    backgroundColor: HIGColors.accent,
    paddingHorizontal: HIGConstants.SPACING_XL,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.RADIUS_LG,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.white,
  },
});