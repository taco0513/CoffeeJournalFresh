import React, { useState, useRef } from 'react';
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
  ScrollView,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HIGColors, HIGConstants, commonButtonStyles, commonTextStyles } from '../../styles/common';
import AuthService from '../../services/supabase/auth';
import { useUserStore } from '../../stores/useUserStore';
import { ErrorHandler } from '../../utils/errorHandler';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const { signUp } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Refs for input fields
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const validateForm = () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim() || !username.trim()) {
      Alert.alert('입력 오류', '모든 필드를 입력해주세요.');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('입력 오류', '올바른 이메일 주소를 입력해주세요.');
      return false;
    }

    // Password validation
    if (password.length < 6) {
      Alert.alert('입력 오류', '비밀번호는 최소 6자 이상이어야 합니다.');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('입력 오류', '비밀번호가 일치하지 않습니다.');
      return false;
    }

    // Username validation
    if (username.length < 3) {
      Alert.alert('입력 오류', '사용자 이름은 최소 3자 이상이어야 합니다.');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    // Dismiss keyboard before validation
    Keyboard.dismiss();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Use the store's signUp method which handles everything
      await signUp(email, username, password);

      Alert.alert(
        '가입 완료',
        '회원가입이 완료되었습니다!',
        [{
          text: '확인',
          onPress: () => {
            // Navigate to main app
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' as never }],
            });
          }
        }]
      );
    } catch (error: any) {
      // console.error('Sign up error:', error);
      ErrorHandler.handle(error, '회원가입');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
          {/* Navigation Bar */}
          <View style={styles.navigationBar}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackToSignIn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.backButtonText}>‹ 뒤로</Text>
            </TouchableOpacity>
            <Text style={styles.navigationTitle}>회원가입</Text>
            <View style={styles.backButton} />
          </View>

          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>새 계정 만들기</Text>
            <Text style={styles.subtitle}>커피 여정을 시작해보세요</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>사용자 이름</Text>
              <TextInput
                style={styles.input}
                placeholder="coffee_lover"
                placeholderTextColor="#CCCCCC"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardAppearance="dark"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => emailInputRef.current?.focus()}
                editable={true}
                selectTextOnFocus={true}
              />
              <Text style={styles.hint}>다른 사용자에게 표시되는 이름입니다</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                ref={emailInputRef}
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor="#CCCCCC"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardAppearance="dark"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                ref={passwordInputRef}
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#CCCCCC"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                keyboardAppearance="dark"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              />
              <Text style={styles.hint}>최소 6자 이상</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <TextInput
                ref={confirmPasswordInputRef}
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#CCCCCC"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                keyboardAppearance="dark"
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />
            </View>
          </View>

          {/* Terms Section */}
          <View style={styles.termsSection}>
            <Text style={styles.termsText}>
              회원가입을 진행하면{' '}
              <Text style={styles.termsLink}>이용약관</Text> 및{' '}
              <Text style={styles.termsLink}>개인정보처리방침</Text>에 동의하는 것으로 간주됩니다.
            </Text>
          </View>

          {/* Sign Up Button */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[commonButtonStyles.buttonPrimary, styles.signUpButton]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[commonTextStyles.buttonTextLarge, styles.buttonText]}>
                  가입하기
                </Text>
              )}
            </TouchableOpacity>
          </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
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
    minWidth: HIGConstants.MIN_TOUCH_TARGET,
    height: HIGConstants.MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: '400',
    color: HIGColors.blue,
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HIGColors.label,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: HIGConstants.SPACING_XL,
    paddingBottom: HIGConstants.SPACING_XL,
    paddingHorizontal: HIGConstants.SPACING_LG,
  },
  title: {
    fontSize: 28,
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
    paddingHorizontal: HIGConstants.SPACING_LG,
    marginBottom: HIGConstants.SPACING_LG,
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
  hint: {
    fontSize: 13,
    color: HIGColors.tertiaryLabel,
    marginTop: HIGConstants.SPACING_XS,
    paddingHorizontal: HIGConstants.SPACING_XS,
  },
  termsSection: {
    paddingHorizontal: HIGConstants.SPACING_LG + HIGConstants.SPACING_XS,
    marginBottom: HIGConstants.SPACING_XL,
  },
  termsText: {
    fontSize: 13,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: HIGColors.blue,
    textDecorationLine: 'underline',
  },
  buttonSection: {
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingBottom: HIGConstants.SPACING_XL,
  },
  signUpButton: {
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
  },
});

export default SignUpScreen;