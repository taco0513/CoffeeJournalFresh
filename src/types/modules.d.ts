// Type declarations for missing modules

declare module 'react-native-touch-id' {
  export interface TouchIDConfig {
    title?: string;
    color?: string;
    fallbackTitle?: string;
  }

  export function isSupported(): Promise<boolean>;
  export function authenticate(reason: string, config?: TouchIDConfig): Promise<boolean>;
  export function getSupportedBiometryType(): Promise<string | null>;
}

declare module 'react-native-keychain' {
  export interface Options {
    service?: string;
    accessControl?: string;
    accessible?: string;
    authenticationPrompt?: string;
  }

  export function setInternetCredentials(
    server: string,
    username: string,
    password: string,
    options?: Options
  ): Promise<boolean>;

  export function getInternetCredentials(
    server: string,
    options?: Options
  ): Promise<{ username: string; password: string } | false>;

  export function resetInternetCredentials(
    server: string,
    options?: Options
  ): Promise<boolean>;

  export function resetGenericPassword(options?: Options): Promise<boolean>;
  export function getSupportedBiometryType(): Promise<string | null>;
  
  export const ACCESSIBLE: {
    WHEN_UNLOCKED: string;
    AFTER_FIRST_UNLOCK: string;
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: string;
    WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: string;
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: string;
  };
}

declare module '@react-native-firebase/auth' {
  export interface Auth {
    currentUser: any;
    signInWithCredential(credential: any): Promise<any>;
    signOut(): Promise<void>;
    onAuthStateChanged(callback: (user: any) => void): () => void;
  }

  export function auth(): Auth;
  
  export class GoogleAuthProvider {
    static credential(idToken: string | null, accessToken: string | null): any;
  }
}

declare module '@react-native-google-signin/google-signin' {
  export interface GoogleSigninConfig {
    webClientId?: string;
    offlineAccess?: boolean;
    hostedDomain?: string;
    forceCodeForRefreshToken?: boolean;
    accountName?: string;
    iosClientId?: string;
  }

  export interface User {
    user: {
      id: string;
      name: string | null;
      email: string;
      photo: string | null;
      familyName: string | null;
      givenName: string | null;
    };
    idToken: string | null;
    serverAuthCode: string | null;
  }

  export class GoogleSignin {
    static configure(config: GoogleSigninConfig): void;
    static hasPlayServices(options?: { showPlayServicesUpdateDialog?: boolean }): Promise<boolean>;
    static signIn(): Promise<User>;
    static signInSilently(): Promise<User>;
    static isSignedIn(): Promise<boolean>;
    static signOut(): Promise<void>;
    static revokeAccess(): Promise<void>;
    static getCurrentUser(): Promise<User | null>;
  }
}

declare module 'crypto-js' {
  export interface CipherHelper {
    encrypt(message: string, key: string): any;
    decrypt(ciphertext: any, key: string): any;
  }

  export const AES: CipherHelper;
  export const enc: {
    Utf8: any;
  };
  
  export function SHA256(message: string): any;
}

declare module 'react-native-vector-icons/Ionicons' {
  import { Component } from 'react';
  
  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  
  export default class Icon extends Component<IconProps> {}
}