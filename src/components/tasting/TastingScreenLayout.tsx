import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HIGConstants, HIGColors } from '@/styles/common';

interface TastingScreenLayoutProps {
  title: string;
  step: number;
  totalSteps?: number;
  children: React.ReactNode;
  scrollEnabled?: boolean;
  keyboardAvoidingEnabled?: boolean;
  bottomContent?: React.ReactNode;
  onBack?: () => void;
}

export const TastingScreenLayout: React.FC<TastingScreenLayoutProps> = ({
  title,
  step,
  totalSteps = 7,
  children,
  scrollEnabled = true,
  keyboardAvoidingEnabled = false,
  bottomContent,
  onBack,
}) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const progressPercentage = (step / totalSteps) * 100;

  const Container = keyboardAvoidingEnabled ? KeyboardAvoidingView : View;
  const containerProps = keyboardAvoidingEnabled
    ? { behavior: (Platform.OS === 'ios' ? 'padding' : 'height') as 'padding' | 'height', style: styles.container }
    : { style: styles.container };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Container {...containerProps}>
        {/* Unified Navigation Bar */}
        <View style={styles.navigationBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backButtonText}>‹ 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.navigationTitle}>{title}</Text>
          <Text style={styles.progressIndicator}>{step}/{totalSteps}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>

        {/* Main Content */}
        {scrollEnabled ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={styles.content}>
            {children}
          </View>
        )}

        {/* Bottom Content (for buttons, etc.) */}
        {bottomContent && (
          <View style={styles.bottomContainer}>
            {bottomContent}
          </View>
        )}
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  navigationBar: {
    height: HIGConstants.MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: HIGColors.gray4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 17,
    color: HIGColors.blue,
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: HIGConstants.SPACING_MD,
  },
  progressIndicator: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
  },
  progressBar: {
    height: 3,
    backgroundColor: HIGColors.gray5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: HIGColors.accent,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_LG,
    paddingBottom: HIGConstants.SPACING_XL,
  },
  content: {
    flex: 1,
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_LG,
  },
  bottomContainer: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingTop: HIGConstants.SPACING_MD,
    paddingBottom: HIGConstants.SPACING_LG,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: HIGColors.gray4,
  },
});

export default TastingScreenLayout;