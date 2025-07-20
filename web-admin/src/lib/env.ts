/**
 * Environment configuration for Coffee Journal Admin
 * Validates and provides type-safe environment variables
 */

import { z } from 'zod';

const envSchema = z.object({
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().min(1, 'Supabase URL is required'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required').optional(),
  
  // Application Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  
  // Security Configuration
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Analytics & Monitoring
  NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  
  // Admin Configuration
  ADMIN_EMAIL: z.string().email().default('hello@zimojin.com'),
  SUPER_ADMIN_EMAILS: z.string().default('hello@zimojin.com'),
});

type EnvConfig = z.infer<typeof envSchema>;

// Parse and validate environment variables
function parseEnv(): EnvConfig {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    SUPER_ADMIN_EMAILS: process.env.SUPER_ADMIN_EMAILS,
  };

  try {
    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');
      
      throw new Error(
        `❌ Environment configuration error:\n${missingVars}\n\n` +
        `Please check your .env file and ensure all required variables are set.\n` +
        `See .env.example for reference.`
      );
    }
    throw error;
  }
}

export const env = parseEnv();

// Helper functions
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

export const getSuperAdminEmails = (): string[] => {
  return env.SUPER_ADMIN_EMAILS.split(',').map(email => email.trim());
};

export const isSuperAdmin = (email: string): boolean => {
  return getSuperAdminEmails().includes(email);
};

// Configuration object for different environments
export const config = {
  app: {
    name: 'Coffee Journal Admin',
    version: '1.0.0',
    url: env.NEXT_PUBLIC_APP_URL,
    adminEmail: env.ADMIN_EMAIL,
  },
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },
  auth: {
    secret: env.NEXTAUTH_SECRET,
    url: env.NEXTAUTH_URL,
  },
  monitoring: {
    vercelAnalyticsId: env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
    sentry: {
      dsn: env.SENTRY_DSN,
      org: env.SENTRY_ORG,
      project: env.SENTRY_PROJECT,
    },
  },
} as const;