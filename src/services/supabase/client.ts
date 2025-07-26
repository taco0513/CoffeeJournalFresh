import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Config from 'react-native-config';

// Get Supabase configuration from environment variables
const supabaseUrl = Config.SUPABASE_URL || '';
const supabaseAnonKey = Config.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: undefined, // React Native 기본 AsyncStorage 사용
},
});