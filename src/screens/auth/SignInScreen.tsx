import React, { useState, useEffect } from 'react';
import {
  YStack,
  XStack,
  Text,
  Button,
  Input,
  H1,
  H2,
  Paragraph,
  Spinner,
  styled,
  useTheme,
  Card,
} from 'tamagui';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { useNavigation } from '@react-navigation/native';
import { Button as DesignButton } from '../../design-system/components/Button';
import { AuthService } from '../../services/supabase/auth';
import { useUserStore } from '../../stores/useUserStore';
import { useDevStore } from '../../stores/useDevStore';
import { ErrorHandler } from '../../utils/errorHandler';
import { Logger } from '../../services/LoggingService';
import { validateGoogleConfig, isGoogleSignInConfigured } from '../../config/googleAuth';

// Styled components with design tokens
const Container = styled(YStack, {
  name: 'SignInContainer',
  flex: 1,
  backgroundColor: '$background',
  padding: '$lg',
});

const HeaderSection = styled(YStack, {
  name: 'HeaderSection',
  alignItems: 'center',
  paddingTop: '$6xl',
  paddingBottom: '$4xl',
});

const FormSection = styled(YStack, {
  name: 'FormSection',
  gap: '$lg',
  marginBottom: '$4xl',
});

const ButtonSection = styled(YStack, {
  name: 'ButtonSection',
  gap: '$md',
  paddingBottom: '$4xl',
});

const SocialButton = styled(TouchableOpacity, {
  name: 'SocialButton',
  height: 44,
  borderRadius: '$md',
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
});

const SignInScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { signIn, signInWithApple, signInWithGoogle, setTestUser } = useUserStore();
  const { bypassLogin, isDeveloperMode } = useDevStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAppleSignInSupported, setIsAppleSignInSupported] = useState(false);
  const [googleSignInEnabled, setGoogleSignInEnabled] = useState(false);

  useEffect(() => {
    // Check if bypass login is enabled in developer mode
    if (isDeveloperMode && bypassLogin) {
      // Set test user and automatically navigate to main app
      setTestUser();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
    });
      return;
  }

    // Check if Apple Sign-In is supported
    const checkAppleSignInSupport = async () => {
      try {
        const isSupported = await appleAuth.isSupported;
        setIsAppleSignInSupported(isSupported);
    } catch (error) {
        Logger.debug('Apple Sign-In not supported:', 'screen', { component: 'SignInScreen', error: error });
        setIsAppleSignInSupported(false);
    }
  };
    
    checkAppleSignInSupport();
    
    // Check if Google Sign-In is configured
    setGoogleSignInEnabled(isGoogleSignInConfigured());
}, [bypassLogin, isDeveloperMode, navigation]);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.');
      return;
  }

    setLoading(true);
    try {
      Logger.debug('Attempting sign in with:', 'screen', { component: 'SignInScreen', data: email });
      // Use the store's signIn method which handles everything
      await signIn(email, password);

      Logger.debug('Sign in successful, navigating to Main', 'screen', { component: 'SignInScreen' });
      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
    });
  } catch (error) {
      Logger.error('Sign in error:', 'screen', { component: 'SignInScreen', error: error });
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
        routes: [{ name: 'Main' as never }],
    });
  } catch (error) {
      ErrorHandler.handle(error, 'Apple 로그인');
  } finally {
      setLoading(false);
  }
};

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
    });
  } catch (error) {
      // Handle specific Google Sign-In errors
      if (error.message?.includes('configuration is invalid')) {
        Alert.alert(
          'Google 로그인 설정 필요',
          'Google 로그인을 사용하려면 먼저 개발자가 Google OAuth를 설정해야 합니다.\n\nsrc/config/googleAuth.ts 파일을 확인해주세요.',
          [{ text: '확인' }]
        );
    } else if (error.message?.includes('cancelled')) {
        // User cancelled - no need to show error
    } else {
        ErrorHandler.handle(error, 'Google 로그인');
    }
  } finally {
      setLoading(false);
  }
};


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background?.val || '#FFFFFF' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Container>
          {/* Logo/Title Section */}
          <HeaderSection>
            <Text fontSize="$10" marginBottom="$sm"></Text>
            <H1 color="$color" marginBottom="$xs" fontWeight="700">
              CupNote
            </H1>
            <Paragraph color="$color11" textAlign="center">
              당신의 커피 여정을 기록하세요
            </Paragraph>
          </HeaderSection>

          {/* Form Section */}
          <FormSection>
            <YStack gap="$sm">
              <Text fontSize="$2" fontWeight="600" color="$color11" paddingHorizontal="$xs">
                이메일
              </Text>
              <Input
                placeholder="email@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                backgroundColor="$backgroundHover"
                borderColor="$borderColor"
                height={44}
                fontSize="$4"
              />
            </YStack>

            <YStack gap="$sm">
              <Text fontSize="$2" fontWeight="600" color="$color11" paddingHorizontal="$xs">
                비밀번호
              </Text>
              <Input
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                backgroundColor="$backgroundHover"
                borderColor="$borderColor"
                height={44}
                fontSize="$4"
              />
            </YStack>

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text fontSize="$3" color="$blue10" textAlign="right" paddingTop="$sm">
                비밀번호를 잊으셨나요?
              </Text>
            </TouchableOpacity>
          </FormSection>

          {/* Buttons Section */}
          <ButtonSection>
            <DesignButton
              variant="primary"
              size="lg"
              disabled={loading}
              fullWidth
              onPress={handleSignIn}
            >
              {loading ? '로그인 중...' : '로그인'}
            </DesignButton>

            <DesignButton
              variant="secondary"
              size="lg"
              fullWidth
              onPress={handleSignUp}
            >
              새 계정 만들기
            </DesignButton>

            {/* 소셜 로그인 구분선 */}
            <XStack alignItems="center" gap="$md" marginVertical="$md">
              <YStack flex={1} height={1} backgroundColor="$borderColor" />
              <Text fontSize="$2" color="$color10">또는</Text>
              <YStack flex={1} height={1} backgroundColor="$borderColor" />
            </XStack>

            {/* Apple Sign-In */}
            {isAppleSignInSupported ? (
              <SocialButton
                onPress={handleAppleSignIn}
                disabled={loading}
                style={{
                  backgroundColor: '#000000',
                  borderColor: '#000000',
              }}
              >
                <Text color="white" fontSize="$4" fontWeight="600">
                  🍎 Apple로 계속하기
                </Text>
              </SocialButton>
            ) : (
              <Card padding="$md" alignItems="center">
                <Text color="$color10" fontSize="$3" fontStyle="italic">
                  Apple Sign-In은 실제 기기에서만 지원됩니다
                </Text>
              </Card>
            )}

            {/* Google Sign-In */}
            {googleSignInEnabled ? (
              <SocialButton
                onPress={handleGoogleSignIn}
                disabled={loading}
                style={{
                  backgroundColor: '#4285F4',
                  borderColor: '#4285F4',
              }}
              >
                <Text color="white" fontSize="$4" fontWeight="600">
                  🔵 Google로 계속하기
                </Text>
              </SocialButton>
            ) : (
              <Card padding="$md" alignItems="center">
                <Text color="$color10" fontSize="$3" fontStyle="italic">
                  Google 로그인 설정 필요
                </Text>
              </Card>
            )}

            {/* Developer Mode Login */}
            <YStack marginTop="$md" paddingTop="$md" borderTopWidth={1} borderTopColor="$borderColor">
              <SocialButton
                onPress={async () => {
                  Logger.debug('Developer login button pressed', 'screen', { component: 'SignInScreen' });
                  setLoading(true);
                  try {
                    Logger.debug('Calling setTestUser...', 'screen', { component: 'SignInScreen' });
                    await setTestUser();
                    Logger.debug('setTestUser completed successfully', 'screen', { component: 'SignInScreen' });
                    
                    // 상태 업데이트 후 즉시 네비게이션
                    Logger.debug('Navigating to Main...', 'screen', { component: 'SignInScreen' });
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Main' as never }],
                  });
                    
                    Logger.debug('Navigation completed', 'screen', { component: 'SignInScreen' });
                } catch (error) {
                    Logger.error('🔧 Developer login error:', 'screen', { component: 'SignInScreen', error: error });
                    Alert.alert('오류', `개발자 로그인에 실패했습니다.\n\n${error}`);
                } finally {
                    setLoading(false);
                }
              }}
                style={{
                  backgroundColor: '#FF9500',
                  borderColor: '#FF9500',
              }}
              >
                <Text color="white" fontSize="$4" fontWeight="600">
                  🔧 개발자 로그인 패스
                </Text>
              </SocialButton>
            </YStack>
          </ButtonSection>
        </Container>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// All styles are now handled by Tamagui styled components and design tokens

export default SignInScreen;