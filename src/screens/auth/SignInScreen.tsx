import React, { useState, useEffect } from 'react';
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
import appleAuth from '@invertase/react-native-apple-authentication';
import { useNavigation } from '@react-navigation/native';
import { HIGColors, HIGConstants, commonButtonStyles, commonTextStyles } from '../../styles/common';
import AuthService from '../../services/supabase/auth';
import { useUserStore } from '../../stores/useUserStore';
import { ErrorHandler } from '../../utils/errorHandler';

const SignInScreen = () => {
  const navigation = useNavigation();
  const { signIn, signInWithApple } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAppleSignInSupported, setIsAppleSignInSupported] = useState(false);

  useEffect(() => {
    // Check if Apple Sign-In is supported
    const checkAppleSignInSupport = async () => {
      try {
        const isSupported = await appleAuth.isSupported;
        setIsAppleSignInSupported(isSupported);
      } catch (error) {
        console.log('Apple Sign-In not supported:', error);
        setIsAppleSignInSupported(false);
      }
    };
    
    checkAppleSignInSupport();
  }, []);

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

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithApple();
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' as never }],
      });
    } catch (error: any) {
      ErrorHandler.handle(error, 'Apple 로그인');
    } finally {
      setLoading(false);
    }
  };

  // const handleGoogleSignIn = async () => {
  //   // Temporarily disabled
  // };

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
                placeholderTextColor="#CCCCCC"
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
                placeholderTextColor="#CCCCCC"
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

            {/* 소셜 로그인 구분선 */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Apple Sign-In */}
            {isAppleSignInSupported ? (
              <TouchableOpacity
                style={[styles.socialButton, styles.appleButton]}
                onPress={handleAppleSignIn}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.socialButtonText}>🍎 Apple로 계속하기</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.socialComingSoon}>
                <Text style={styles.comingSoonText}>Apple Sign-In은 실제 기기에서만 지원됩니다</Text>
              </View>
            )}

            {/* Google Sign-In 준비 중 */}
            <View style={styles.socialComingSoon}>
              <Text style={styles.comingSoonText}>Google 로그인 준비 중...</Text>
            </View>

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
    paddingTop: 40,
    paddingBottom: 30,
  },
  logo: {
    fontSize: 60,
    marginBottom: HIGConstants.SPACING_SM,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_XS,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 30,
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
    color: '#000000',
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
    paddingBottom: 30,
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
    marginBottom: HIGConstants.SPACING_MD,
  },
  signUpButtonText: {
    color: HIGColors.label,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: HIGConstants.SPACING_SM,
    marginTop: HIGConstants.SPACING_SM,
  },
  skipButtonText: {
    fontSize: 15,
    color: HIGColors.secondaryLabel,
  },
  // 소셜 로그인 스타일
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: HIGConstants.SPACING_MD,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: HIGColors.gray4,
  },
  dividerText: {
    fontSize: 13,
    color: HIGColors.tertiaryLabel,
    marginHorizontal: HIGConstants.SPACING_MD,
  },
  socialButton: {
    height: HIGConstants.MIN_TOUCH_TARGET,
    borderRadius: HIGConstants.BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: HIGConstants.SPACING_SM,
    borderWidth: 1,
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  socialButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  socialComingSoon: {
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_MD,
    marginBottom: HIGConstants.SPACING_SM,
  },
  comingSoonText: {
    fontSize: 15,
    color: HIGColors.tertiaryLabel,
    fontStyle: 'italic',
  },
});

export default SignInScreen;