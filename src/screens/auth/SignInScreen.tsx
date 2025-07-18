import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HIGColors, HIGConstants, commonButtonStyles, commonTextStyles } from '../../styles/common';
import AuthService from '../../services/supabase/auth';
import { useUserStore } from '../../stores/useUserStore';
import { ErrorHandler } from '../../utils/errorHandler';

const SignInScreen = () => {
  const navigation = useNavigation();
  const { signIn } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // Use the store's signIn method which handles everything
      await signIn(email, password);

      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' as never }],
      });
    } catch (error: any) {
      // console.error('Sign in error:', error);
      ErrorHandler.handle(error, '로그인');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp' as never);
  };

  const handleForgotPassword = () => {
    Alert.alert('비밀번호 찾기', '이 기능은 준비 중입니다.');
  };

  const handleSkip = () => {
    // Use app as guest - just navigate without auth
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' as never }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Logo/Title Section */}
          <View style={styles.headerSection}>
            <Text style={styles.logo}>☕</Text>
            <Text style={styles.title}>Coffee Journal</Text>
            <Text style={styles.subtitle}>당신의 커피 여정을 기록하세요</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor={HIGColors.tertiaryLabel}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardAppearance="dark"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={HIGColors.tertiaryLabel}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                keyboardAppearance="dark"
              />
            </View>

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>비밀번호를 잊으셨나요?</Text>
            </TouchableOpacity>
          </View>

          {/* Buttons Section */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[commonButtonStyles.buttonPrimary, styles.signInButton]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[commonTextStyles.buttonTextLarge, styles.buttonText]}>
                  로그인
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[commonButtonStyles.buttonSecondary, styles.signUpButton]}
              onPress={handleSignUp}
              activeOpacity={0.8}
            >
              <Text style={[commonTextStyles.buttonText, styles.signUpButtonText]}>
                새 계정 만들기
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>둘러보기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    fontSize: 72,
    marginBottom: HIGConstants.SPACING_MD,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    marginBottom: HIGConstants.SPACING_SM,
    paddingHorizontal: HIGConstants.SPACING_XS,
  },
  input: {
    height: HIGConstants.MIN_TOUCH_TARGET,
    backgroundColor: HIGColors.secondarySystemBackground,
    borderRadius: HIGConstants.BORDER_RADIUS,
    paddingHorizontal: HIGConstants.SPACING_MD,
    fontSize: 17,
    color: HIGColors.label,
    borderWidth: 1,
    borderColor: HIGColors.gray4,
  },
  forgotPassword: {
    fontSize: 15,
    color: HIGColors.blue,
    textAlign: 'right',
    paddingTop: HIGConstants.SPACING_SM,
  },
  buttonSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  signInButton: {
    width: '100%',
    marginBottom: HIGConstants.SPACING_MD,
  },
  buttonText: {
    color: '#FFFFFF',
  },
  signUpButton: {
    width: '100%',
    marginBottom: HIGConstants.SPACING_LG,
  },
  signUpButtonText: {
    color: HIGColors.label,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: HIGConstants.SPACING_MD,
  },
  skipButtonText: {
    fontSize: 15,
    color: HIGColors.secondaryLabel,
  },
});

export default SignInScreen;